// src/hooks/useConfirmDiscard.tsx
import { useRef, useState, useCallback } from "react";
import { ConfirmDiscardModal } from "@/components/modals/ConfirmDiscardModal";

export function useConfirmDiscard() {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const resolverRef = useRef<null | ((v: boolean) => void)>(null);

  const confirm = useCallback((message: string) => {
    setText(message);
    setOpen(true);
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  const handleConfirm = () => resolverRef.current?.(true);
  const handleCancel = () => resolverRef.current?.(false);

  const ConfirmRenderer = () => (
    <ConfirmDiscardModal
      text={text}
      isOpen={open}
      onClose={() => setOpen(false)}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  );

  return { confirm, ConfirmRenderer };
}
