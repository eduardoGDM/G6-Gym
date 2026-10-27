import { create } from "zustand";

const STORAGE_KEY = "g6:theme-mode";
const MODES = ["dark", "light"];

/**
 * Modo escuro é o PADRÃO, por decisão de produto — deliberadamente sem olhar
 * `prefers-color-scheme`. Quem quiser claro escolhe, e a escolha persiste.
 */
export const DEFAULT_MODE = "dark";

const readStored = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return MODES.includes(stored) ? stored : DEFAULT_MODE;
  } catch {
    // localStorage indisponível (aba privada/bloqueada): fica no padrão.
    return DEFAULT_MODE;
  }
};

const persist = (mode) => {
  try {
    localStorage.setItem(STORAGE_KEY, mode);
  } catch {
    // Sem persistência a escolha vale só para esta sessão — nada quebra.
  }
};

/**
 * Modo claro/escuro do tema da interface.
 *
 * Lido de forma síncrona na criação do store, então o primeiro render já sai
 * no modo certo. O `RoleLayout` escreve o valor como `data-mode` na raiz e o
 * CSS resolve o resto — ausência do atributo já significa escuro, de modo que
 * o padrão vale até antes de o JS rodar.
 */
const useThemeStore = create((set, get) => ({
  mode: readStored(),

  setMode: (mode) => {
    if (!MODES.includes(mode)) return;
    persist(mode);
    set({ mode });
  },

  toggle: () => {
    const next = get().mode === "dark" ? "light" : "dark";
    persist(next);
    set({ mode: next });
  },
}));

export default useThemeStore;
