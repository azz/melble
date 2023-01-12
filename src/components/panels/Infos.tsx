import { Guesses } from "../Guesses";
import { Panel } from "./Panel";
import React from "react";
import { Melble } from "../Melble";
import { formatDistance } from "../../domain/geography";
import { SettingsData } from "../../hooks/useSettings";
import Twemoji from "./../Twemoji";

interface InfosProps {
  isOpen: boolean;
  close: () => void;
  settingsData: SettingsData;
}

export function Infos({ isOpen, close, settingsData }: InfosProps) {
  return (
    <Panel title="How to play" isOpen={isOpen} close={close}>
      <div className="space-y-3 text-justify border-b-2 border-gray-200 pb-3 mb-3">
        <div>
          Guess the <Melble /> in 6 guesses.
        </div>
        <div>
          Each guess must be a valid suburb of Melbourne (not including
          localities)
        </div>
        <div>
          After each guess, you will have the distance, the direction and the
          proximity from your guess to the target location.
        </div>
      </div>
      <div className="space-y-3 text-justify border-b-2 border-gray-200 pb-3 mb-3">
        <div className="font-bold">Examples</div>
        <div>
          <Guesses
            rowCount={1}
            guesses={[
              {
                name: "Melbourne",
                direction: "E",
                distance: 8_000,
              },
            ]}
            settingsData={settingsData}
          />
          <div className="my-2">
            Your guess <span className="uppercase font-bold">Melbourne</span> is{" "}
            {formatDistance(8_000)} away from the target location, the target
            location is in the Eastern direction and you have 88% of proximity
            because it&apos;s relatively close.
          </div>
        </div>
        <div>
          <Guesses
            rowCount={1}
            guesses={[
              {
                name: "Malvern",
                direction: "E",
                distance: 4_000,
              },
            ]}
            settingsData={settingsData}
          />
          <div className="my-2">
            Your second guess{" "}
            <span className="uppercase font-bold">Malvern</span> is getting
            closer! {formatDistance(4_000)} away, Easterly direction and 94%!
          </div>
        </div>
        <div>
          <Guesses
            rowCount={1}
            guesses={[
              {
                name: "Glen Iris",
                direction: "N",
                distance: 0,
              },
            ]}
            settingsData={settingsData}
          />
          <div className="my-2">
            Next guess, <span className="uppercase font-bold">Glen Iris</span>,
            it&apos;s the location to guess! Congrats!{" "}
            <Twemoji text="🎉" options={{ className: "inline-block" }} />
          </div>
        </div>
      </div>
      <div className="space-y-3 text-justify border-b-2 border-gray-200 pb-3 mb-3 font-bold">
        A new <Melble /> will be available every day!
      </div>
      <div className="space-y-3 text-justify border-b-2 border-gray-200 pb-3 mb-3">
        <Melble /> is a fork of{" "}
        <a
          className="underline"
          href="https://worldle.teuteuf.fr/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Worldle
        </a>
        , which was <span className="font-bold">heavily</span> inspired by{" "}
        <a
          className="underline"
          href="https://www.powerlanguage.co.uk/wordle/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Wordle
        </a>{" "}
        created by{" "}
        <a
          className="underline"
          href="https://twitter.com/powerlanguish"
          target="_blank"
          rel="noopener noreferrer"
        >
          Josh Wardle (@powerlanguish)
        </a>
        .
      </div>
      <div className="space-y-3 text-justify pb-3">
        <div>
          Melble variant made by{" "}
          <a
            className="underline"
            href="https://twitter.com/lucasazzola"
            target="_blank"
            rel="noopener noreferrer"
          >
            @lucasazzola
          </a>
          . Originally made by{" "}
          <a
            className="underline"
            href="https://twitter.com/teuteuf"
            target="_blank"
            rel="noopener noreferrer"
          >
            @teuteuf
          </a>{" "}
          - (
          <a
            className="underline"
            href="https://github.com/azz/melble/"
            target="_blank"
            rel="noopener noreferrer"
          >
            source code
          </a>
          )
        </div>
      </div>
    </Panel>
  );
}
