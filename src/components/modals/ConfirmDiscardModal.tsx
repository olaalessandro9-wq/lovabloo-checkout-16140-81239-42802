// src/components/modals/ConfirmDiscardModal.tsx
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

type Props = {
  text: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void; // descartar e sair
  onCancel: () => void;  // continuar edição
};

export function ConfirmDiscardModal({ text, isOpen, onClose, onConfirm, onCancel }: Props) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <AlertDialogTitle className="text-xl">Alterações pendentes</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-base leading-relaxed">
            {text}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 sm:gap-2">
          <Button
            variant="destructive"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="sm:w-auto"
          >
            Descartar e sair
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              onCancel();
              onClose();
            }}
            className="sm:w-auto"
          >
            Continuar edição
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
