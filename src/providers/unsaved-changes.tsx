import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { useUnsavedChangesGuard } from "@/hooks/useUnsavedChangesGuard";
import UnsavedChangesDialog from "@/components/common/UnsavedChangesDialog";

type UnsavedChangesContextType = {
  dirty: boolean;
  setDirty: (v: boolean) => void;
  markSaved: () => void;
  /**
   * indica se há um bloqueio ativo (exibindo modal)
   */
  blocking: boolean;
  /**
   * força a tentativa de navegação descartando alterações
   */
  forceNavigate: () => void;
  /**
   * cancela a navegação pendente (continua editando)
   */
  cancelNavigate: () => void;
  /**
   * executa ação se não houver alterações, ou abre o modal se houver
   */
  confirmOrRun: (action: () => void) => void;
};

const UnsavedChangesContext = createContext<UnsavedChangesContextType | null>(null);

export function useUnsavedChanges() {
  const ctx = useContext(UnsavedChangesContext);
  if (!ctx) throw new Error("useUnsavedChanges must be used within UnsavedChangesProvider");
  return ctx;
}

export const UnsavedChangesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dirty, setDirty] = useState(false);
  const pendingActionRef = useRef<null | (() => void)>(null);

  // NUNCA bloquear nas abas de Checkout e Links
  const guard = useUnsavedChangesGuard({
    dirty,
    disableInPaths: [
      (path, search) => path.includes("/produtos/editar") && /tab=(checkout|links)/.test(search || ""),
    ],
  });

  const markSaved = useCallback(() => setDirty(false), []);

  const confirmOrRun = useCallback(
    (action: () => void) => {
      if (!dirty) {
        action();
      } else {
        pendingActionRef.current = action;
        // O guard vai abrir o modal automaticamente quando houver dirty=true
      }
    },
    [dirty]
  );

  // Força navegação descartando alterações
  const forceNavigate = useCallback(() => {
    setDirty(false);
    
    // Se há ação pendente (confirmOrRun), executa ela
    if (pendingActionRef.current) {
      const action = pendingActionRef.current;
      pendingActionRef.current = null;
      action();
    } else {
      // Senão, prossegue com a navegação bloqueada pelo guard
      guard.discardAndExit();
    }
  }, [guard]);

  // Cancela navegação e continua editando
  const cancelNavigate = useCallback(() => {
    pendingActionRef.current = null;
    guard.stay();
  }, [guard]);

  const value = useMemo(
    () => ({
      dirty,
      setDirty,
      markSaved,
      blocking: guard.isOpen,
      forceNavigate,
      cancelNavigate,
      confirmOrRun,
    }),
    [dirty, guard.isOpen, forceNavigate, cancelNavigate, markSaved, confirmOrRun]
  );

  return (
    <UnsavedChangesContext.Provider value={value}>
      {children}
      <UnsavedChangesDialog />
    </UnsavedChangesContext.Provider>
  );
};
