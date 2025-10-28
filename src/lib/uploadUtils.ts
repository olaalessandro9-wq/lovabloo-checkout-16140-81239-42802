// src/lib/uploadUtils.ts

// Esta é uma implementação mock/exemplo baseada no pseudo-código.
// O estado real de `_uploading` e `_uploadError` deve ser gerenciado no componente.

interface ComponentContent {
  imageUrl?: string;
  _uploading?: boolean;
  _uploadError?: boolean;
  [key: string]: any;
}

/**
 * Verifica se algum componente tem upload pendente.
 * Assumindo que 'components' é um array de objetos que contêm o campo 'content'.
 */
export function hasPendingUploads(components: { content: ComponentContent }[]): boolean {
  if (!components) return false;
  return components.some(comp => comp.content?._uploading === true);
}

/**
 * Espera que todos os uploads pendentes terminem (simulação).
 * Na implementação real, isso envolveria escutar eventos ou promessas de upload.
 * O plano de ação sugere bloquear o botão Salvar até que os uploads terminem.
 * Esta função é mais um placeholder para indicar o fluxo.
 *
 * @param components Lista de componentes (para verificar o estado)
 * @param timeout Tempo máximo de espera em ms
 * @returns Promise que resolve quando os uploads terminam ou rejeita no timeout
 */
export function waitForUploadsToFinish(components: { content: ComponentContent }[], timeout = 60000): Promise<void> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    const checkUploads = () => {
      if (!hasPendingUploads(components)) {
        resolve();
        return;
      }

      if (Date.now() - startTime > timeout) {
        reject(new Error("Timeout: Uploads não terminaram a tempo."));
        return;
      }
      
      // Simulação de polling. Na prática, use um mecanismo de estado reativo (ex: React hooks)
      // para re-renderizar o componente e reavaliar o estado de upload.
      setTimeout(checkUploads, 500); 
    };

    checkUploads();
  });
}

// O ponto C (Upload / salvar) sugere que o componente de upload deve:
// 1. Marcar _uploading = true ao iniciar.
// 2. Marcar _uploading = false e salvar publicUrl ao terminar.
// 3. O botão Salvar deve verificar hasPendingUploads() antes de permitir o save.
// 4. Se o save for permitido, ele pode chamar a API para deletar a imagem antiga (ponto D).
