import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import axios, { AxiosError } from 'axios'
import {apiUrl} from '../utils/APIUrl.ts'
import {} from '@/Store/UserStore.ts'


interface LoginResponse {
  data: {
    token: string
    user: User
  }
  message: string
}

interface User {
  id: string
  emailAddress: string
  userName: string
  role: string
  profile?: {
    patientId?: string
    dentistId?: string
    adminId?: string
  }
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  error: string | null
  setUser: (user: User) => void
  setToken: (token: string) => void
  login: (identifier: string, password: string) => Promise<void>
  logout: () => void
  clearError: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null,

      setUser: (user: User) =>
        set({ user, isAuthenticated: true, error: null }),

      setToken: (token: string) => {
        set({ token, error: null });
        if (token) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
      },

      login: async (identifier: string, password: string) => {
        try {
          const response = await axios.post<LoginResponse>(
            `${apiUrl}/auth/login`,
            { identifier, password }
          );

          console.log('Login response:', response.data);
          

          const { token, user } = response.data.data;
          if (!token || !user) throw new Error('Invalid response from server');

          set({ user, token, isAuthenticated: true, error: null });

          // apply token globally
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } catch (error) {
          if (axios.isAxiosError(error)) {
            set({
              error: error.response?.data?.message || 'Login failed',
              isAuthenticated: false,
            });
          } else {
            set({ error: 'An unexpected error occurred', isAuthenticated: false });
          }
          throw error;
        }
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false, error: null });
        delete axios.defaults.headers.common['Authorization'];
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      // ⬇️ This ensures axios header is restored when state rehydrates
      onRehydrateStorage: () => (state) => {
        if (state?.token) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
        }
      },
    }
  )
);


// Add axios interceptor to handle token expiration
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout()
    }
    return Promise.reject(error)
  }
)