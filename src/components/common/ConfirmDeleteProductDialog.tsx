import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onConfirm: () => Promise<void>;
  productName?: string;
};

export function ConfirmDeleteProductDialog({
  open,
  onOpenChange,
  onConfirm,
  productName,
}: Props) {
  const [busy, setBusy] = useState(false);
  const [value, setValue] = useState("");
  const ok = value.trim().toLowerCase() === "excluir";

  const handleConfirm = async () => {
    setBusy(true);
    try {
      await onConfirm();
    } finally {
      setBusy(false);
      setValue(""); // Limpa o campo após confirmação
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!busy) {
          onOpenChange(v);
          if (!v) setValue(""); // Limpa o campo ao fechar
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Excluir produto</DialogTitle>
          <DialogDescription>
            Esta ação não pode ser desfeita. Digite <b>excluir</b> para
            confirmar.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Produto: <b>{productName ?? "—"}</b>
          </p>
          <div className="flex items-center gap-2">
            <Input
              placeholder="Digite excluir"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              disabled={busy}
            />
            <Button
              variant="destructive"
              disabled={!ok || busy}
              onClick={handleConfirm}
            >
              {busy ? "Excluindo..." : "Excluir"}
            </Button>
          </div>
        </div>

        <DialogFooter className="flex justify-end gap-2">
          <Button
            variant="secondary"
            disabled={busy}
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
