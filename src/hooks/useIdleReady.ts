import { useEffect, useState } from 'react';

/** `navigator.connection` ainda não é padrão em todos os navegadores. */
interface NetworkInformation {
  saveData?: boolean;
}

function prefersReducedData(): boolean {
  const connection = (navigator as Navigator & { connection?: NetworkInformation }).connection;
  return connection?.saveData === true;
}

/**
 * Vira `true` quando o navegador fica ocioso — ou ao fim de `timeoutMs`, se
 * ocioso ele nunca ficar.
 *
 * Serve para carregar o que é decoração sem disputar banda e CPU com o
 * conteúdo: o import só começa depois que o trabalho crítico terminou.
 *
 * Permanece `false` quando a pessoa ativou economia de dados — aí ela pediu
 * explicitamente para não baixar o que é supérfluo.
 */
export function useIdleReady(timeoutMs = 3000): boolean {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (prefersReducedData()) return;

    const markReady = () => setReady(true);

    if (typeof window.requestIdleCallback !== 'function') {
      const timer = setTimeout(markReady, 200);
      return () => clearTimeout(timer);
    }

    const handle = window.requestIdleCallback(markReady, { timeout: timeoutMs });
    return () => window.cancelIdleCallback?.(handle);
  }, [timeoutMs]);

  return ready;
}
