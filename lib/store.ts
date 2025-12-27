import { create } from 'zustand'

interface Store {
  bears: number
  increase: () => void
}

export const useStore = create<Store>((set) => ({
  bears: 0,
  increase: () => set((state) => ({ bears: state.bears + 1 })),
}))
