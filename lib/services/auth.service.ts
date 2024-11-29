import axios from 'axios';
import { LoginCredentials, RegisterCredentials, AuthResponse, User } from '@/types/auth';
import Cookies from 'js-cookie';

export class AuthService {
  private readonly API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  private setTokens(tokens: { accessToken: string; refreshToken: string }) {
    if (typeof window !== 'undefined') {
      console.log('Setting tokens:', { hasAccessToken: !!tokens.accessToken, hasRefreshToken: !!tokens.refreshToken });
      
      // Set cookies with more secure options
      Cookies.set('accessToken', tokens.accessToken, {
        path: '/',
        sameSite: 'lax',  // Changed from 'strict' to 'lax' to allow cross-site navigation
        secure: process.env.NODE_ENV === 'production',
        expires: 1  // 1 day
      });
      
      Cookies.set('refreshToken', tokens.refreshToken, {
        path: '/',
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        expires: 7  // 7 days
      });

      // Backup in sessionStorage
      sessionStorage.setItem('accessToken', tokens.accessToken);
      sessionStorage.setItem('refreshToken', tokens.refreshToken);
    }
  }

  private clearTokens() {
    if (typeof window !== 'undefined') {
      console.log('Clearing tokens');
      
      // Suppression des cookies
      Cookies.remove('accessToken', { path: '/' });
      Cookies.remove('refreshToken', { path: '/' });

      // Suppression du sessionStorage
      sessionStorage.removeItem('accessToken');
      sessionStorage.removeItem('refreshToken');
    }
  }

  async login(credentials: LoginCredentials): Promise<User> {
    try {
      console.log('Login attempt:', credentials.email);
      const response = await axios.post<AuthResponse>(`${this.API_URL}/auth/login`, credentials);
      
      console.log('Login successful:', response.data);
      this.setTokens({
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token
      });

      return response.data.user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async register(credentials: RegisterCredentials): Promise<User> {
    try {
      console.log('Register attempt:', credentials.email);
      const response = await axios.post<AuthResponse>(`${this.API_URL}/auth/register`, credentials);
      
      console.log('Register successful:', response.data);
      this.setTokens({
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token
      });

      return response.data.user;
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  }

  async logout() {
    try {
      const token = this.getAccessToken();
      if (token) {
        await axios.post(`${this.API_URL}/auth/logout`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearTokens();
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const token = this.getAccessToken();
      console.log('Getting current user with token:', !!token);
      
      if (!token) return null;

      const response = await axios.get<User>(`${this.API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('Current user retrieved:', response.data);
      return response.data;
    } catch (error) {
      console.error('Get current user error:', error);
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        this.clearTokens();
      }
      return null;
    }
  }

  async refreshTokens(): Promise<void> {
    try {
      const refreshToken = this.getRefreshToken();
      console.log('Attempting token refresh, has refresh token:', !!refreshToken);
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await axios.get<AuthResponse>(`${this.API_URL}/auth/refresh`, {
        headers: {
          Authorization: `Bearer ${refreshToken}`,
        },
      });

      if (!response.data.access_token || !response.data.refresh_token) {
        throw new Error('Invalid token response');
      }

      console.log('Token refresh successful');
      this.setTokens({
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token
      });
    } catch (error) {
      console.error('Token refresh error:', error);
      this.clearTokens();
      throw error;
    }
  }

  async verifyToken(token: string): Promise<any> {
    try {
      const response = await axios.get(`${this.API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Token verification error:', error);
      throw error;
    }
  }

  getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    
    // Try to get from cookie first
    const cookieToken = Cookies.get('accessToken');
    if (cookieToken) return cookieToken;
    
    // Fallback to sessionStorage
    return sessionStorage.getItem('accessToken');
  }

  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    
    // Try to get from cookie first
    const cookieToken = Cookies.get('refreshToken');
    if (cookieToken) return cookieToken;
    
    // Fallback to sessionStorage
    return sessionStorage.getItem('refreshToken');
  }
}

export const authService = new AuthService();
