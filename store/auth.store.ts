import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { AuthStore, User } from '@/types/auth'
import { authService } from '@/lib/services/auth.service'

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: true,
      
      login: async (credentials) => {
        try {
          console.log('Store: Attempting login', credentials.email)
          const user = await authService.login(credentials)
          console.log('Store: Login successful', user)
          set({ user, isLoading: false })
          return user
        } catch (error) {
          console.error('Store: Login failed', error)
          set({ user: null, isLoading: false })
          throw error
        }
      },
      
      register: async (credentials) => {
        try {
          console.log('Store: Attempting register', credentials.email)
          const user = await authService.register(credentials)
          console.log('Store: Register successful', user)
          set({ user, isLoading: false })
          return user
        } catch (error) {
          console.error('Store: Register failed', error)
          set({ user: null, isLoading: false })
          throw error
        }
      },
      
      logout: async () => {
        try {
          console.log('Store: Attempting logout')
          await authService.logout()
          console.log('Store: Logout successful')
          set({ user: null, isLoading: false })
        } catch (error) {
          console.error('Store: Logout failed', error)
          set({ user: null, isLoading: false })
          throw error
        }
      },
      
      getCurrentUser: async () => {
        try {
          console.log('Store: Getting current user')
          set({ isLoading: true })
          const user = await authService.getCurrentUser()
          console.log('Store: Current user result', user)
          set({ user, isLoading: false })
          return user
        } catch (error) {
          console.error('Store: Get current user failed', error)
          set({ user: null, isLoading: false })
          return null
        }
      },
    }),
    {
      name: 'auth-storage',
      // Ne stocker que l'utilisateur, pas les tokens
      partialize: (state) => ({ user: state.user }),
      // Vérifier l'utilisateur au chargement
      onRehydrateStorage: () => {
        return async (state) => {
          console.log('Store: Rehydrating storage')
          if (state?.user) {
            try {
              const currentUser = await authService.getCurrentUser()
              console.log('Store: Rehydration current user', currentUser)
              if (currentUser) {
                state.user = currentUser
              } else {
                state.user = null
              }
            } catch {
              state.user = null
            }
          }
        }
      }
    }
  )
)
