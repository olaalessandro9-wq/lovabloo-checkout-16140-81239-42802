import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, UNSAFE_NavigationContext } from "react-router-dom";

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
};

const UnsavedChangesContext = createContext<UnsavedChangesContextType | null>(null);

export function useUnsavedChanges() {
  const ctx = useContext(UnsavedChangesContext);
  if (!ctx) throw new Error("useUnsavedChanges must be used within UnsavedChangesProvider");
  return ctx;
}

// Hook customizado para bloquear navegação (compatível com React Router v6)
function useBlocker(blocker: (args: { currentLocation: any; nextLocation: any }) => boolean, when = true) {
  const { navigator } = useContext(UNSAFE_NavigationContext);
  const location = useLocation();

  useEffect(() => {
    if (!when) return;

    const originalPush = navigator.push;
    const originalReplace = navigator.replace;

    navigator.push = (...args: any[]) => {
      const shouldBlock = blocker({
        currentLocation: location,
        nextLocation: { pathname: args[0]?.pathname || args[0], search: args[0]?.search || "" },
      });
      if (!shouldBlock) {
        originalPush.apply(navigator, args);
      }
    };

    navigator.replace = (...args: any[]) => {
      const shouldBlock = blocker({
        currentLocation: location,
        nextLocation: { pathname: args[0]?.pathname || args[0], search: args[0]?.search || "" },
      });
      if (!shouldBlock) {
        originalReplace.apply(navigator, args);
      }
    };

    return () => {
      navigator.push = originalPush;
      navigator.replace = originalReplace;
    };
  }, [navigator, blocker, when, location]);
}

export const UnsavedChangesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dirty, setDirty] = useState(false);
  const [blocking, setBlocking] = useState(false);
  const nextLocationRef = useRef<null | { pathname: string; search?: string }>(null);

  const location = useLocation();
  const navigate = useNavigate();

  const productEditPrefix = "/produtos/editar"; // ajuste se sua rota base for outra

  // Removido: alerta de beforeunload (F5/reload)
  // Comportamento padrão do navegador será mantido

  // Bloqueia navegação entre rotas (apenas se for SAIR de /produtos/editar)
  useBlocker(
    ({ currentLocation, nextLocation }) => {
      if (!dirty) return false;

      const isLeavingProductPage =
        currentLocation.pathname.startsWith(productEditPrefix) &&
        !nextLocation.pathname.startsWith(productEditPrefix);

      // troca de subtabs (mesma rota base) -> não bloqueia
      if (!isLeavingProductPage) return false;

      // bloqueia e mostra modal
      nextLocationRef.current = { pathname: nextLocation.pathname, search: nextLocation.search };
      setBlocking(true);
      return true;
    },
    dirty // reavalia quando mudar dirty
  );

  const forceNavigate = useCallback(() => {
    if (!nextLocationRef.current) {
      setBlocking(false);
      return;
    }
    const { pathname, search } = nextLocationRef.current;
    nextLocationRef.current = null;
    setBlocking(false);
    setDirty(false); // descartou alterações
    navigate(`${pathname}${search ?? ""}`, { replace: false });
  }, [navigate]);

  const cancelNavigate = useCallback(() => {
    nextLocationRef.current = null;
    setBlocking(false);
  }, []);

  const markSaved = useCallback(() => setDirty(false), []);

  const value = useMemo(
    () => ({ dirty, setDirty, markSaved, blocking, forceNavigate, cancelNavigate }),
    [dirty, blocking, forceNavigate, cancelNavigate, markSaved]
  );

  return (
    <UnsavedChangesContext.Provider value={value}>
      {children}
    </UnsavedChangesContext.Provider>
  );
};
