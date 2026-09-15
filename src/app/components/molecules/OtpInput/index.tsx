import { useEffect, useRef } from "react";
import type { ClipboardEvent, KeyboardEvent } from "react";

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  disabled?: boolean;
  autoFocus?: boolean;
}

const sanitize = (value: string) => value.replace(/\s/g, "");

export function OtpInput({
  value,
  onChange,
  length = 6,
  disabled = false,
  autoFocus = false,
}: OtpInputProps) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const chars = Array.from({ length }, (_, index) => value[index] ?? "");

  useEffect(() => {
    if (autoFocus && !disabled) inputsRef.current[0]?.focus();
  }, [autoFocus, disabled]);

  const focusAt = (index: number) => {
    const target = inputsRef.current[Math.max(0, Math.min(index, length - 1))];
    target?.focus();
    target?.select();
  };

  const updateAt = (index: number, nextChars: string) => {
    const next = [...chars];
    let cursor = index;

    for (const char of nextChars) {
      if (cursor >= length) break;
      next[cursor] = char;
      cursor += 1;
    }

    onChange(next.join("").slice(0, length));
    focusAt(cursor);
  };

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace") {
      event.preventDefault();

      if (chars[index]) {
        const next = [...chars];
        next[index] = "";
        onChange(next.join(""));
      } else if (index > 0) {
        const next = [...chars];
        next[index - 1] = "";
        onChange(next.join(""));
        focusAt(index - 1);
      }
      return;
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      focusAt(index - 1);
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      focusAt(index + 1);
    }
  };

  const handlePaste = (index: number, event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pasted = sanitize(event.clipboardData.getData("text"));
    if (pasted) updateAt(index, pasted);
  };

  return (
    <div className="flex justify-center gap-2">
      {chars.map((char, index) => (
        <input
          key={index}
          ref={(element) => {
            inputsRef.current[index] = element;
          }}
          value={char}
          disabled={disabled}
          inputMode="text"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          aria-label={`Digit ${index + 1}`}
          onFocus={(event) => event.target.select()}
          onChange={(event) => {
            const typed = sanitize(event.target.value);
            if (!typed) return;

            const entered =
              char && typed.length > 1 && typed.startsWith(char)
                ? typed.slice(char.length)
                : typed;
            updateAt(index, entered);
          }}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onPaste={(event) => handlePaste(index, event)}
          className="size-11 rounded-lg border border-gray-300 text-center text-lg font-semibold text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none disabled:bg-gray-50"
        />
      ))}
    </div>
  );
}
