import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Creds } from './api'

export type Msg = { id: string; text: string; out: boolean; time: number }

type State = {
  creds: Creds | null
  chats: Record<string, Msg[]>
  titles: Record<string, string>
  active: string | null
  login: (c: Creds) => void
  logout: () => void
  open: (chatId: string, title?: string) => void
  add: (chatId: string, m: Msg, title?: string) => void
}

export const useStore = create<State>()(
  persist(
    (set) => ({
      creds: null,
      chats: {},
      titles: {},
      active: null,
      login: (creds) => set({ creds }),
      logout: () => set({ creds: null, chats: {}, titles: {}, active: null }),
      open: (chatId, title) =>
        set((s) => ({
          active: chatId,
          chats: { ...s.chats, [chatId]: s.chats[chatId] ?? [] },
          titles: title ? { ...s.titles, [chatId]: title } : s.titles,
        })),
      add: (chatId, m, title) =>
        set((s) => {
          const list = s.chats[chatId] ?? []
          if (list.some((x) => x.id === m.id)) return s
          return {
            chats: { ...s.chats, [chatId]: [...list, m] },
            titles: title && !s.titles[chatId] ? { ...s.titles, [chatId]: title } : s.titles,
          }
        }),
    }),
    { name: 'max-chat' },
  ),
)
