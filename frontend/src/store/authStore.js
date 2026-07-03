import { create } from "zustand";

const useAuthStore = create((set, get) => ({
  user: null,
  isLoading: true,

  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
  login: (user) => {
    set({ user });
  },
  logout: () => {
    set({ user: null });
  },
  isAuthenticated: () => {
    return !!get().user;
  },
}));

export default useAuthStore;
