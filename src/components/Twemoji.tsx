import React from "react";
import { Twemoji as TwemojiSource } from "@teuteuf/react-emoji-render";

export default function Twemoji({
  text,
  className,
  options,
}: {
  text: string;
  className?: string;
  options?: Record<string, string>;
}) {
  return (
    <TwemojiSource
      text={text}
      className={className}
      options={{
        ...options,
        baseUrl: "//cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/",
      }}
    />
  );
}
