import { useUnsavedChanges } from "@/providers/unsaved-changes";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function UnsavedChangesDialog() {
  const { blocking, cancelNavigate, forceNavigate } = useUnsavedChanges();

  return (
    <Dialog open={blocking} onOpenChange={(open) => (!open ? cancelNavigate() : null)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Existem alterações pendentes
          </DialogTitle>
          <DialogDescription>
            Se você sair agora, <strong>perderá</strong> as alterações não salvas. O que deseja fazer?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="secondary" onClick={cancelNavigate}>
            Continuar edição
          </Button>
          <Button variant="destructive" onClick={forceNavigate}>
            Descartar e sair
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
