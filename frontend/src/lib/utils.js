import { clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      shadow: ["subtle", "card", "popover", "modal"],
    },
  },
});

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
