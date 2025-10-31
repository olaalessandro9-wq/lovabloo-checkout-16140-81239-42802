// src/components/modals/ConfirmDiscardModal.tsx
type Props = {
  text: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void; // descartar e sair
  onCancel: () => void;  // continuar edição
};

export function ConfirmDiscardModal({ text, isOpen, onClose, onConfirm, onCancel }: Props) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40">
      <div className="w-[520px] rounded-xl bg-white p-5 shadow-xl">
        <h3 className="mb-2 text-lg font-semibold">Existem alterações pendentes</h3>
        <p className="mb-5 text-sm text-gray-600">{text}</p>

        <div className="flex justify-end gap-3">
          {/* Ordem solicitada: Descartar (vermelho) à esquerda, Continuar (neutro) à direita */}
          <button
            className="rounded-md bg-red-600 px-3 py-2 text-white hover:bg-red-700"
            onClick={() => { onConfirm(); onClose(); }}
          >
            Descartar e sair
          </button>
          <button
            className="rounded-md bg-gray-200 px-3 py-2 hover:bg-gray-300"
            onClick={() => { onCancel(); onClose(); }}
          >
            Continuar edição
          </button>
        </div>
      </div>
    </div>
  );
}
