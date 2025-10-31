import { useEffect, useMemo, useState } from "react";
import { unstable_useBlocker, useLocation } from "react-router-dom";

type GuardOptions = {
  /** Quando true, o guard bloqueia a navegação */
  dirty: boolean;
  /** Desabilita o guard nestas abas/rotas (checkout/links) */
  disableInPaths?: Array<(path: string, search: string) => boolean>;
};

export function useUnsavedChangesGuard({ dirty, disableInPaths = [] }: GuardOptions) {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const disabled = useMemo(() => {
    if (!dirty) return true;
    return disableInPaths.some(fn => fn(location.pathname, location.search));
  }, [dirty, disableInPaths, location.pathname, location.search]);

  // Bloqueia tudo (programático + back/forward) quando NÃO estiver desabilitado
  const blocker = unstable_useBlocker(!disabled);

  useEffect(() => {
    if (blocker.state === "blocked") setIsOpen(true);
    else setIsOpen(false);
  }, [blocker.state]);

  return {
    /** Mostrar/ocultar modal */
    isOpen,
    /** Cancelar saída e ficar na página */
    stay: () => {
      setIsOpen(false);
      blocker.reset?.();        // desfaz a navegação que estava bloqueada
    },
    /** Prosseguir e sair (1 clique apenas) */
    discardAndExit: () => {
      setIsOpen(false);
      blocker.proceed?.();      // conclui a navegação pendente (inclui back do navegador)
    },
  };
}
