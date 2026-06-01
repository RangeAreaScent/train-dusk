import type { Choice, GameState, Lang } from "../engine/types";
import { isChoiceAvailable, isChoiceConsumed } from "../engine/scenes";
import config from "../data/config.json";

interface Props {
  choices: Choice[];
  lang: Lang;
  state: GameState;
  inputValue: string;
  onSelect: (choice: Choice) => void;
}

export function Choices({ choices, lang, state, inputValue, onSelect }: Props) {
  const marker = config.ui.choiceMarker;

  return (
    <div className="mt-6 space-y-2">
      {choices.map((choice, i) => {
        if (!isChoiceAvailable(choice, state)) return null;
        const consumed = isChoiceConsumed(choice, state);
        const needsInput =
          choice.requiresInput && inputValue.trim().length === 0;
        const disabled = consumed || needsInput;

        const baseStyle =
          choice.type === "whisper"
            ? "text-neutral-500"
            : choice.type === "hidden"
              ? "text-neutral-300 hover:text-black"
              : "text-black";
        const consumedStyle = consumed ? "opacity-40" : "";

        return (
          <button
            key={i}
            type="button"
            className={`block text-left font-serif text-2xl ${baseStyle} ${consumedStyle} ${
              disabled
                ? "cursor-not-allowed"
                : "cursor-pointer hover:opacity-70"
            }`}
            disabled={disabled}
            onClick={() => onSelect(choice)}
          >
            {marker} {choice.label[lang]}
          </button>
        );
      })}
    </div>
  );
}
