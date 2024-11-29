import { useAuthStore } from '@/store/auth.store'
import { LoginCredentials, RegisterCredentials, User } from '@/types/auth'

export function useAuth() {
  const store = useAuthStore()
  
  return {
    user: store.user,
    isLoading: store.isLoading,
    isAuthenticated: !!store.user,
    
    login: async (credentials: LoginCredentials) => {
      await store.login(credentials)
    },
    
    register: async (credentials: RegisterCredentials) => {
      await store.register(credentials)
    },
    
    logout: async () => {
      await store.logout()
    },
    
    getCurrentUser: async () => {
      await store.getCurrentUser()
    },
  }
}
