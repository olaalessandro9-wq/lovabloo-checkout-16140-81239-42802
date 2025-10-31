import * as React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

type BaseProps = {
  resourceType: string; // "Produto", "Checkout", etc.
  resourceName: string; // Nome visível pro usuário
  requireTypeToConfirm?: boolean; // se true, exige digitar EXCLUIR
  confirmLabel?: string; // default: "Excluir"
  description?: string; // texto opcional abaixo do título
  onConfirm: () => Promise<void> | void;
};

type DeclarativeProps = BaseProps & {
  children?: React.ReactNode; // Conteúdo que abre o modal (botão/ícone)
};

export function ConfirmDeleteDialog(props: DeclarativeProps) {
  const [open, setOpen] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [typeWord, setTypeWord] = React.useState("");

  const {
    resourceType,
    resourceName,
    requireTypeToConfirm = false,
    confirmLabel = "Excluir",
    description,
    onConfirm,
    children,
  } = props;

  const handleConfirm = async () => {
    try {
      setBusy(true);
      await onConfirm();
      setOpen(false);
      toast.success(`${resourceType} excluído com sucesso!`);
    } catch (err: any) {
      toast.error(`Falha ao excluir ${resourceType.toLowerCase()}`, {
        description: err?.message ?? "Tente novamente.",
      });
    } finally {
      setBusy(false);
      setTypeWord("");
    }
  };

  const confirmDisabled =
    busy || (requireTypeToConfirm && typeWord.trim().toUpperCase() !== "EXCLUIR");

  return (
    <AlertDialog open={open} onOpenChange={(v) => !busy && setOpen(v)}>
      <AlertDialogTrigger asChild>
        {children ?? (
          <Button variant="destructive" size="sm">
            <Trash2 className="h-4 w-4 mr-2" />
            Excluir
          </Button>
        )}
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Excluir {resourceType}?{" "}
            <span className="font-normal">({resourceName})</span>
          </AlertDialogTitle>
          <AlertDialogDescription>
            {description ?? (
              <>
                Essa ação é irreversível e removerá permanentemente o{" "}
                {resourceType.toLowerCase()} selecionado.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {requireTypeToConfirm && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Para confirmar, digite{" "}
              <span className="font-semibold">EXCLUIR</span>:
            </p>
            <Input
              autoFocus
              value={typeWord}
              onChange={(e) => setTypeWord(e.target.value)}
              placeholder="EXCLUIR"
            />
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={busy}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            disabled={confirmDisabled}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            onClick={(e) => {
              e.preventDefault();
              handleConfirm();
            }}
          >
            {busy ? "Excluindo..." : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/** Uso imperativo em menus/ações */
type ConfirmArgs = Omit<BaseProps, "resourceName" | "resourceType" | "onConfirm"> & {
  resourceType: string;
  resourceName: string;
  onConfirm: () => Promise<void> | void;
};

export function useConfirmDelete() {
  const [state, setState] = React.useState<null | ConfirmArgs>(null);

  const confirm = React.useCallback((args: ConfirmArgs) => {
    return new Promise<void>((resolve, reject) => {
      setState({
        ...args,
        onConfirm: async () => {
          try {
            await args.onConfirm();
            resolve();
          } catch (e) {
            reject(e);
          } finally {
            setState(null);
          }
        },
      });
    });
  }, []);

  const Bridge = () => {
    if (!state) return null;
    return (
      <ConfirmDeleteDialog
        resourceType={state.resourceType}
        resourceName={state.resourceName}
        onConfirm={state.onConfirm}
        requireTypeToConfirm={state.requireTypeToConfirm}
        confirmLabel={state.confirmLabel}
        description={state.description}
      />
    );
  };

  return { confirm, Bridge };
}
