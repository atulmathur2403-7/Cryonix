import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User } from '../types';
import { currentUser as defaultUser } from '../data/mockData';

interface UserContextType {
  user: User;
  isLoggedIn: boolean;
  login: (username: string, password: string) => void;
  signup: (data: { fullName: string; username: string; email: string; phone: string; password: string }) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

const UserContext = createContext<UserContextType>({
  user: defaultUser,
  isLoggedIn: false,
  login: () => {},
  signup: () => {},
  logout: () => {},
  updateUser: () => {},
});

export const useUser = () => useContext(UserContext);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(() => {
    const saved = localStorage.getItem('mentr-user');
    return saved ? JSON.parse(saved) : defaultUser;
  });

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('mentr-logged-in') === 'true';
  });

  const persistUser = (u: User, loggedIn: boolean) => {
    localStorage.setItem('mentr-user', JSON.stringify(u));
    localStorage.setItem('mentr-logged-in', String(loggedIn));
  };

  const login = (_username: string, _password: string) => {
    setIsLoggedIn(true);
    localStorage.setItem('mentr-logged-in', 'true');
  };

  const signup = (data: { fullName: string; username: string; email: string; phone: string; password: string }) => {
    const newUser: User = {
      ...defaultUser,
      id: 'user-' + Date.now(),
      fullName: data.fullName,
      username: data.username,
      email: data.email,
      phone: data.phone,
      bio: '',
      interests: [],
      sessionsBooked: 0,
      sessionsCompleted: 0,
      avgRatingGiven: 0,
    };
    setUser(newUser);
    setIsLoggedIn(true);
    persistUser(newUser, true);
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUser(defaultUser);
    localStorage.removeItem('mentr-logged-in');
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
    <UserContext.Provider value={{ user, isLoggedIn, login, signup, logout, updateUser }}>
      {children}
    </UserContext.Provider>
  );
};
