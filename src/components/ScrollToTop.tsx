import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

/** Sempre inicia a tela no topo ao trocar de página/aba ou voltar. */
export default function ScrollToTop() {
  const { pathname, search } = useLocation();
  useLayoutEffect(() => { window.scrollTo(0, 0); }, [pathname, search]);
  return null;
}
