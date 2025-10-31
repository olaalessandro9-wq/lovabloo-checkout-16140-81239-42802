// src/providers/UnsavedChangesGuard.tsx
import { PropsWithChildren, useContext, useEffect, useRef } from "react";
import { NavigationType, UNSAFE_NavigationContext, useLocation } from "react-router-dom";

type ConfirmFn = (message: string) => Promise<boolean>;

type GuardProps = PropsWithChildren<{
  enabled: boolean;        // habilita/desabilita o guardião (ex.: desabilitar em /checkout e /links)
  dirty: boolean;          // há alterações pendentes?
  confirm: ConfirmFn;      // função que exibe o modal e resolve true (descartar) | false (continuar)
  message?: string;        // mensagem do modal
}>;

export function UnsavedChangesGuard({
  enabled,
  dirty,
  confirm,
  message = "Se você sair agora, perderá as alterações não salvas. O que deseja fazer?",
  children,
}: GuardProps) {
  const navigation = useContext(UNSAFE_NavigationContext).navigator as {
    block: (tx: (tx: { action: NavigationType; location: Location; retry(): void }) => void) => () => void;
  };

  const unblockRef = useRef<null | (() => void)>(null);
  const retryRef = useRef<null | (() => void)>(null);
  const showingRef = useRef(false); // evita modal duplo / "2 cliques"

  const location = useLocation();
  const shouldGuard = enabled && dirty;

  useEffect(() => {
    // sempre limpa um bloqueio anterior
    if (unblockRef.current) {
      unblockRef.current();
      unblockRef.current = null;
    }

    if (!shouldGuard) return;

    unblockRef.current = navigation.block(async (tx) => {
      if (showingRef.current) return;
      showingRef.current = true;

      retryRef.current = tx.retry;
      const ok = await confirm(message);

      showingRef.current = false;

      if (ok) {
        // libera bloqueio e navega 1x
        if (unblockRef.current) {
          unblockRef.current();
          unblockRef.current = null;
        }
        const retry = retryRef.current;
        retryRef.current = null;
        if (retry) retry();
      } else {
        // continua na página, sem navegar
        retryRef.current = null;
      }
    });

    return () => {
      if (unblockRef.current) {
        unblockRef.current();
        unblockRef.current = null;
      }
    };
  }, [shouldGuard, confirm, message, navigation]);

  // se houver replace programático/re-render, evita "resíduo" de retry
  useEffect(() => {
    retryRef.current = null;
  }, [location.key]);

  return <>{children}</>;
}
