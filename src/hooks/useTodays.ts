import { DateTime } from "luxon";
import { useCallback, useEffect, useMemo, useState } from "react";
import seedrandom from "seedrandom";
import { suburbsWithImage, Suburb } from "../domain/suburbs";
import { SuburbCode } from "../domain/suburbs.position";
import { Guess, loadAllGuesses, saveGuesses } from "../domain/guess";

const forcedSuburbs: Record<string, SuburbCode> = {};

const noRepeatStartDate = DateTime.fromFormat("2022-05-01", "yyyy-MM-dd");

export function getDayString(shiftDayCount?: number) {
  return DateTime.now()
    .plus({ days: shiftDayCount ?? 0 })
    .toFormat("yyyy-MM-dd");
}

export function useTodays(dayString: string): [
  {
    suburb?: Suburb;
    guesses: Guess[];
  },
  (guess: Guess) => void,
  number,
  number
] {
  const [todays, setTodays] = useState<{
    suburb?: Suburb;
    guesses: Guess[];
  }>({ guesses: [] });

  const addGuess = useCallback(
    (newGuess: Guess) => {
      if (todays == null) {
        return;
      }

      const newGuesses = [...todays.guesses, newGuess];

      setTodays((prev) => ({ suburb: prev.suburb, guesses: newGuesses }));
      saveGuesses(dayString, newGuesses);
    },
    [dayString, todays]
  );

  useEffect(() => {
    const guesses = loadAllGuesses()[dayString] ?? [];
    const suburb = getSuburb(dayString);

    setTodays({ suburb, guesses });
  }, [dayString]);

  const randomAngle = useMemo(
    () => seedrandom.alea(dayString)() * 360,
    [dayString]
  );

  const imageScale = useMemo(() => {
    const normalizedAngle = 45 - (randomAngle % 90);
    const radianAngle = (normalizedAngle * Math.PI) / 180;
    return 1 / (Math.cos(radianAngle) * Math.sqrt(2));
  }, [randomAngle]);

  return [todays, addGuess, randomAngle, imageScale];
}

function getSuburb(dayString: string) {
  const currentDayDate = DateTime.fromFormat(dayString, "yyyy-MM-dd");
  let pickingDate = DateTime.fromFormat("2022-03-21", "yyyy-MM-dd");
  let pickedSuburb: Suburb | null = null;

  const lastPickDates: Record<string, DateTime> = {};

  do {
    const pickingDateString = pickingDate.toFormat("yyyy-MM-dd");

    const forcedSuburbCode = forcedSuburbs[dayString];
    const forcedSuburb =
      forcedSuburbCode != null
        ? suburbsWithImage.find((suburb) => suburb.code === forcedSuburbCode)
        : undefined;

    const suburbSelection = suburbsWithImage;

    if (forcedSuburb != null) {
      pickedSuburb = forcedSuburb;
    } else {
      let suburbIndex = Math.floor(
        seedrandom.alea(pickingDateString)() * suburbSelection.length
      );
      pickedSuburb = suburbSelection[suburbIndex];

      if (pickingDate >= noRepeatStartDate) {
        while (isARepeat(pickedSuburb, lastPickDates, pickingDate)) {
          suburbIndex = (suburbIndex + 1) % suburbSelection.length;
          pickedSuburb = suburbSelection[suburbIndex];
        }
      }
    }

    lastPickDates[pickedSuburb.code] = pickingDate;
    pickingDate = pickingDate.plus({ day: 1 });
  } while (pickingDate <= currentDayDate);

  return pickedSuburb;
}

function isARepeat(
  pickedSuburb: Suburb | null,
  lastPickDates: Record<string, DateTime>,
  pickingDate: DateTime
) {
  if (pickedSuburb == null || lastPickDates[pickedSuburb.code] == null) {
    return false;
  }
  const daysSinceLastPick = pickingDate.diff(
    lastPickDates[pickedSuburb.code],
    "day"
  ).days;

  return daysSinceLastPick < 100;
}
