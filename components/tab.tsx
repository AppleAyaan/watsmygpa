"use client";
import { useEffect } from "react";

export default function TabTitleChanger() {
  useEffect(() => {
    const emojis = ["🫣", "😖", "🫩", "😳", "🤬", "😨"];
    const baseText = "WATs my GPA? ";
    let emojiIndex = 0;
    let scrollArray = [...(baseText + emojis[emojiIndex] + " ")];
    let interval: NodeJS.Timeout;

    const startScrolling = () => {
      interval = setInterval(() => {
        const char = scrollArray.shift();
        if (char !== undefined) scrollArray.push(char);

        document.title = scrollArray.join("");

        if (scrollArray.join("").startsWith(baseText)) {
          emojiIndex = (emojiIndex + 1) % emojis.length;
          scrollArray = [...(baseText + emojis[emojiIndex] + " ")];
        }
      }, 250);
    };

    const stopScrolling = () => {
      clearInterval(interval);
      document.title = "Your GPA is waiting! 👋";
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopScrolling();
      } else {
        startScrolling();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    startScrolling();

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return null;
}
