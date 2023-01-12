import React, { ReactText, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import { getSuburbName, sanitizeSuburbName } from "../domain/suburbs";
import { SuburbInput } from "./SuburbInput";
import * as geolib from "geolib";
import { Share } from "./Share";
import { Guesses } from "./Guesses";
import { useTranslation } from "react-i18next";
import { SettingsData } from "../hooks/useSettings";
import { useMode } from "../hooks/useMode";
import { getDayString, useTodays } from "../hooks/useTodays";
import Twemoji from "./Twemoji";
import { suburbs } from "../domain/suburbs.position";
import { event } from "../domain/analytics";
import { bestGuessPercent, dayCount } from "../domain/guessStats";

const ENABLE_TWITCH_LINK = false;
const MAX_TRY_COUNT = 6;

interface GameProps {
  settingsData: SettingsData;
  updateSettings: (newSettings: Partial<SettingsData>) => void;
}

export function Game({ settingsData, updateSettings }: GameProps) {
  const { t, i18n } = useTranslation();
  const dayString = useMemo(
    () => getDayString(settingsData.shiftDayCount),
    [settingsData.shiftDayCount]
  );

  const suburbInputRef = useRef<HTMLInputElement>(null);

  const [todays, addGuess, randomAngle, imageScale] = useTodays(dayString);
  const { suburb, guesses } = todays;
  const suburbName = useMemo(
    () => (suburb ? getSuburbName(i18n.resolvedLanguage, suburb) : ""),
    [suburb, i18n.resolvedLanguage]
  );

  const [currentGuess, setCurrentGuess] = useState("");
  const [hideImageMode, setHideImageMode] = useMode(
    "hideImageMode",
    dayString,
    settingsData.noImageMode
  );
  const [rotationMode, setRotationMode] = useMode(
    "rotationMode",
    dayString,
    settingsData.rotationMode
  );

  const gameEnded =
    guesses.length === MAX_TRY_COUNT ||
    guesses[guesses.length - 1]?.distance === 0;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (suburb == null) {
      return;
    }
    e.preventDefault();
    const guessedSuburb = suburbs.find(
      (suburb) =>
        sanitizeSuburbName(getSuburbName(i18n.resolvedLanguage, suburb)) ===
        sanitizeSuburbName(currentGuess)
    );

    if (guessedSuburb == null) {
      toast.error(t("unknownSuburb"));
      return;
    }

    const newGuess = {
      name: currentGuess,
      distance: geolib.getDistance(guessedSuburb, suburb),
      direction: geolib.getCompassDirection(
        guessedSuburb,
        suburb,
        (origin, dest) =>
          Math.round(geolib.getRhumbLineBearing(origin, dest) / 45) * 45
      ),
    };

    if (guesses.length === 0) {
      event("level_start", { level_name: `#${dayCount(dayString)}` });
    }

    addGuess(newGuess);
    setCurrentGuess("");

    if (newGuess.distance === 0) {
      toast.success(t("welldone"), { delay: 2000 });

      const level = dayCount(dayString);
      event("game_won", { level, event_label: "Success" });
      event("level_end", { level_name: `#${level}`, success: true });
      event("post_score", { level, score: 100 });
    }
  };

  useEffect(() => {
    let toastId: ReactText;
    const { suburb, guesses } = todays;
    if (
      suburb &&
      guesses.length === MAX_TRY_COUNT &&
      guesses[guesses.length - 1].distance > 0
    ) {
      const level = dayCount(dayString);
      event("game_lost", { level, event_label: "Fail" });
      event("level_end", { level_name: `#${level}`, success: false });
      event("post_score", { level, score: bestGuessPercent(guesses) });

      toastId = toast.info(
        getSuburbName(i18n.resolvedLanguage, suburb).toUpperCase(),
        {
          autoClose: false,
          delay: 2000,
        }
      );
    }

    return () => {
      if (toastId != null) {
        toast.dismiss(toastId);
      }
    };
  }, [todays, dayString, i18n.resolvedLanguage]);

  return (
    <div className="flex-grow flex flex-col mx-2">
      {hideImageMode && !gameEnded && (
        <button
          className="font-bold border-2 p-1 rounded uppercase my-2 hover:bg-gray-50 active:bg-gray-100 dark:hover:bg-slate-800 dark:active:bg-slate-700"
          type="button"
          onClick={() => setHideImageMode(false)}
        >
          <Twemoji
            text={t("showSuburb")}
            options={{ className: "inline-block" }}
          />
        </button>
      )}
      <div className="flex my-1">
        {settingsData.allowShiftingDay && settingsData.shiftDayCount > 0 && (
          <button
            type="button"
            onClick={() =>
              updateSettings({
                shiftDayCount: Math.max(0, settingsData.shiftDayCount - 1),
              })
            }
          >
            <Twemoji text="↪️" className="text-xl" />
          </button>
        )}
        <img
          className={`pointer-events-none max-h-52 m-auto transition-transform duration-700 ease-in dark:invert ${
            hideImageMode && !gameEnded ? "h-0" : "h-full"
          }`}
          alt="suburb to guess"
          src={`images/suburbs/${suburb?.code.toLowerCase()}/vector.svg`}
          style={
            rotationMode && !gameEnded
              ? {
                  transform: `rotate(${randomAngle}deg) scale(${imageScale})`,
                }
              : {}
          }
        />
        {settingsData.allowShiftingDay && settingsData.shiftDayCount < 7 && (
          <button
            type="button"
            onClick={() =>
              updateSettings({
                shiftDayCount: Math.min(7, settingsData.shiftDayCount + 1),
              })
            }
          >
            <Twemoji text="↩️" className="text-xl" />
          </button>
        )}
      </div>
      {rotationMode && !hideImageMode && !gameEnded && (
        <button
          className="font-bold rounded p-1 border-2 uppercase mb-2 hover:bg-gray-50 active:bg-gray-100 dark:hover:bg-slate-800 dark:active:bg-slate-700"
          type="button"
          onClick={() => setRotationMode(false)}
        >
          <Twemoji
            text={t("cancelRotation")}
            options={{ className: "inline-block" }}
          />
        </button>
      )}
      <Guesses
        targetSuburb={suburb}
        rowCount={MAX_TRY_COUNT}
        guesses={guesses}
        settingsData={settingsData}
        suburbInputRef={suburbInputRef}
      />
      <div className="my-2">
        {gameEnded && suburb ? (
          <>
            <Share
              guesses={guesses}
              dayString={dayString}
              settingsData={settingsData}
              hideImageMode={hideImageMode}
              rotationMode={rotationMode}
            />
            <div className="flex flex-wrap gap-4 justify-center">
              <a
                className="underline text-center block mt-4 whitespace-nowrap"
                href={`https://www.google.com/maps?q=${suburbName},+VIC&hl=${i18n.resolvedLanguage}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Twemoji
                  text={t("showOnGoogleMaps")}
                  options={{ className: "inline-block" }}
                />
              </a>
              <a
                className="underline text-center block mt-4 whitespace-nowrap"
                href={`https://${i18n.resolvedLanguage}.wikipedia.org/wiki/${suburbName},_Victoria`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Twemoji
                  text={t("showOnWikipedia")}
                  options={{ className: "inline-block" }}
                />
              </a>
            </div>
            {ENABLE_TWITCH_LINK && (
              <div className="flex flex-wrap gap-4 justify-center">
                <a
                  className="underline text-center block mt-4 whitespace-nowrap"
                  href="https://www.twitch.tv/t3uteuf"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Twemoji
                    text="More? Play on Twitch! 👾"
                    options={{ className: "inline-block" }}
                  />
                </a>
              </div>
            )}
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col">
              <SuburbInput
                inputRef={suburbInputRef}
                currentGuess={currentGuess}
                setCurrentGuess={setCurrentGuess}
              />
              <button
                className="rounded font-bold p-1 flex items-center justify-center border-2 uppercase my-0.5 hover:bg-gray-50 active:bg-gray-100 dark:hover:bg-slate-800 dark:active:bg-slate-700"
                type="submit"
              >
                <Twemoji
                  text="🇦🇺"
                  options={{ className: "inline-block" }}
                  className="flex items-center justify-center"
                />{" "}
                <span className="ml-1">{t("guess")}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
