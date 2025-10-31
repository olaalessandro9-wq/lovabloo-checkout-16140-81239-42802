import { ChangeEvent, useCallback, useEffect } from "react";
import { useUnsavedChanges } from "@/providers/unsaved-changes";

/** Para inputs controlados (onChange) */
export function useDirtyOnChange() {
  const { setDirty } = useUnsavedChanges();
  return useCallback(
    (e?: ChangeEvent<any>) => {
      setDirty(true);
    },
    [setDirty]
  );
}

/** Para react-hook-form: sincroniza formState.isDirty com o provider */
export function useSyncFormDirty(isDirty: boolean) {
  const { setDirty } = useUnsavedChanges();
  useEffect(() => {
    if (isDirty) setDirty(true);
  }, [isDirty, setDirty]);
}
