import { useEffect, useRef, useState } from "react";

import { Button, IconSearch, Popover, TextInput } from "@/app/components/atoms";

interface ColumnSearchPopoverProps {
  label: string;
  value: string;
  onApply: (value: string) => void;
}

const ColumnSearchPopover = ({
  label,
  value,
  onApply,
}: ColumnSearchPopoverProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState(value);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) setDraft(value);
  }, [isOpen, value]);

  const apply = (nextValue: string) => {
    onApply(nextValue);
    setIsOpen(false);
  };

  return (
    <span className="inline-flex">
      <button
        ref={triggerRef}
        type="button"
        aria-label={`Cari ${label}`}
        onClick={() => setIsOpen((current) => !current)}
        className={value ? "text-brand-secondary" : "text-gray-400"}
      >
        <IconSearch size={14} />
      </button>

      <Popover
        open={isOpen}
        anchorRef={triggerRef}
        onClose={() => setIsOpen(false)}
        align="end"
        minWidth={224}
      >
        <div className="p-2 font-normal">
          <TextInput
            autoFocus
            value={draft}
            placeholder={`Search ${label}`}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") apply(draft.trim());
            }}
            className="!text-xs !font-normal"
          />
          <div className="mt-2 flex justify-between gap-2">
            <Button size="sm" variant="ghost" onClick={() => apply("")}>
              Reset
            </Button>
            <Button
              size="sm"
              variant="primary"
              onClick={() => apply(draft.trim())}
            >
              Cari
            </Button>
          </div>
        </div>
      </Popover>
    </span>
  );
};

export default ColumnSearchPopover;
