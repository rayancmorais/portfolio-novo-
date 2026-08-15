import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLenis } from './useLenis';

/** Altura da navbar fixa — o alvo do scroll precisa descontá-la. */
const NAV_OFFSET = 66;

/**
 * O Lenis roda um loop próprio de rAF e mantém um alvo interno de scroll.
 * `window.scrollTo({ behavior: 'smooth' })` disputa com esse loop e perde: o
 * Lenis reaplica o alvo dele no frame seguinte e a página para em outro lugar,
 * normalmente no topo. Quando ele está ativo, o scroll tem que passar por ele.
 */
export function scrollToElement(el: HTMLElement) {
  const lenis = getLenis();
  if (lenis) {
    lenis.scrollTo(el, { offset: -NAV_OFFSET });
    return;
  }
  window.scrollTo({ top: el.offsetTop - NAV_OFFSET, behavior: 'smooth' });
}

/** Topo da página, pelo mesmo motivo. */
export function scrollToTop() {
  const lenis = getLenis();
  if (lenis) {
    lenis.scrollTo(0);
    return;
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Salto seco para o topo, ao trocar de rota. Precisa passar pelo Lenis também:
 * um `window.scrollTo` direto move a página sem avisá-lo, e a posição interna
 * dele fica dessincronizada — o próximo scroll salta de volta.
 */
export function jumpToTop() {
  const lenis = getLenis();
  if (lenis) {
    lenis.scrollTo(0, { immediate: true });
    return;
  }
  window.scrollTo(0, 0);
}

/**
 * Leva até uma seção da home a partir de qualquer rota.
 *
 * As seções só existem na home, então âncoras `#id` puras não fazem nada quando
 * a pessoa está numa página de estudo de caso: o elemento não está no documento
 * e o clique morre em silêncio. Aqui, fora da home, navegamos primeiro e
 * rolamos no frame seguinte, quando a home já montou.
 */
export function useSectionNavigation() {
  const navigate = useNavigate();

  return useCallback(
    (sectionId: string) => {
      const scrollToSection = () => {
        const el = document.getElementById(sectionId);
        if (el) scrollToElement(el);
      };

      if (window.location.pathname === '/') {
        scrollToSection();
        return;
      }

      navigate('/');
      requestAnimationFrame(() => requestAnimationFrame(scrollToSection));
    },
    [navigate]
  );
}
