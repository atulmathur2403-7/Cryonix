import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { User } from '../types';
import { currentUser as defaultUser } from '../data/mockData';
import { authApi, userApi } from '../services/api';

interface UserContextType {
  user: User;
  isLoggedIn: boolean;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: { fullName: string; username: string; email: string; password: string }) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  fetchProfile: () => Promise<void>;
}

const UserContext = createContext<UserContextType>({
  user: defaultUser,
  isLoggedIn: false,
  loading: false,
  error: null,
  login: async () => {},
  signup: async () => {},
  logout: () => {},
  updateUser: () => {},
  fetchProfile: async () => {},
});

export const useUser = () => useContext(UserContext);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(() => {
    const saved = localStorage.getItem('mentr-user');
    return saved ? JSON.parse(saved) : defaultUser;
  });

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return !!localStorage.getItem('mentr-token');
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const persistUser = (u: User, loggedIn: boolean) => {
    localStorage.setItem('mentr-user', JSON.stringify(u));
  };

  const fetchProfile = useCallback(async () => {
    try {
      const res = await userApi.getProfile();
      const profile = res.data;
      const updatedUser: User = {
        ...user,
        fullName: profile.fullName || user.fullName,
        username: profile.username || user.username,
        email: profile.email || user.email,
        phone: profile.phoneNumber || user.phone,
        avatar: profile.profilePhotoUrl || user.avatar,
      };
      setUser(updatedUser);
      persistUser(updatedUser, true);
    } catch (err) {
      // Profile fetch failed - keep existing user data
    }
  }, [user]);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await authApi.login({ email, password });
      const { accessToken, refreshToken } = res.data;
      localStorage.setItem('mentr-token', accessToken);
      localStorage.setItem('mentr-refresh-token', refreshToken);
      setIsLoggedIn(true);
      // Fetch user profile after login
      try {
        const profileRes = await userApi.getProfile();
        const profile = profileRes.data;
        const loggedInUser: User = {
          ...defaultUser,
          fullName: profile.fullName || '',
          username: profile.username || '',
          email: profile.email || '',
          phone: profile.phoneNumber || '',
          avatar: profile.profilePhotoUrl || '',
        };
        setUser(loggedInUser);
        persistUser(loggedInUser, true);
      } catch {
        // Could not fetch profile, continue with default
      }
    } catch (err: any) {
      const message = err.response?.data?.message || err.response?.data || 'Login failed. Please check your credentials.';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const signup = async (data: { fullName: string; username: string; email: string; password: string }) => {
    setLoading(true);
    setError(null);
    try {
      const res = await authApi.signUp({
        name: data.fullName,
        email: data.email,
        username: data.username,
        password: data.password,
        role: 'LEARNER',
      });
      const { accessToken, refreshToken } = res.data;
      localStorage.setItem('mentr-token', accessToken);
      localStorage.setItem('mentr-refresh-token', refreshToken);
      const newUser: User = {
        ...defaultUser,
        id: 'user-' + Date.now(),
        fullName: data.fullName,
        username: data.username,
        email: data.email,
        phone: '',
        bio: '',
        interests: [],
        sessionsBooked: 0,
        sessionsCompleted: 0,
        avgRatingGiven: 0,
      };
      setUser(newUser);
      setIsLoggedIn(true);
      persistUser(newUser, true);
    } catch (err: any) {
      const message = err.response?.data?.message || err.response?.data || 'Signup failed. Please try again.';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUser(defaultUser);
    localStorage.removeItem('mentr-token');
    localStorage.removeItem('mentr-refresh-token');
    localStorage.removeItem('mentr-user');
  };

  const updateUser = (updates: Partial<User>) => {
    setUser((prev) => {
      const updated = { ...prev, ...updates };
      localStorage.setItem('mentr-user', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <UserContext.Provider value={{ user, isLoggedIn, loading, error, login, signup, logout, updateUser, fetchProfile }}>
      {children}
    </UserContext.Provider>
  );
};
