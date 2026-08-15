import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

/** Altura da navbar fixa — o alvo do scroll precisa descontá-la. */
const NAV_OFFSET = 66;

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
        if (el) window.scrollTo({ top: el.offsetTop - NAV_OFFSET, behavior: 'smooth' });
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
