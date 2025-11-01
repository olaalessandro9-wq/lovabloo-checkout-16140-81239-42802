import { useState } from "react";

type GuardOptions = {
  /** Quando true, o guard bloqueia a navegação */
  dirty: boolean;
  /** Desabilita o guard nestas abas/rotas (checkout/links) */
  disableInPaths?: Array<(path: string, search: string) => boolean>;
};

export function useUnsavedChangesGuard({ dirty, disableInPaths = [] }: GuardOptions) {
  const [isOpen] = useState(false);

  // TEMPORARIAMENTE DESABILITADO: useBlocker requer data router
  // TODO: Migrar para createBrowserRouter no futuro
  
  return {
    /** Mostrar/ocultar modal */
    isOpen,
    /** Cancelar saída e ficar na página */
    stay: () => {
      // No-op
    },
    /** Prosseguir e sair (1 clique apenas) */
    discardAndExit: () => {
      // No-op
    },
  };
}
