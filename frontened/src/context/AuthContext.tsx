import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { auth } from '../config/firebase';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<string | null>;
  register: (username: string, email: string, password: string) => Promise<string | null>;
  logout: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    console.log('Setting up auth state listener');
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('Auth state changed:', user ? 'User logged in' : 'No user');
      if (user) {
        setUser(user);
        setIsAuthenticated(true);
        localStorage.setItem('isAuthenticated', 'true');
        console.log('User authenticated:', user.email);
        // ... existing code ...
        // window.location.href = '/dashboard'; // REMOVE or COMMENT OUT THIS LINE
      } else {
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('isAuthenticated');
        console.log('User logged out');
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log('Attempting login for:', email);
      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log('Login successful:', result.user.email);
      return null;
    } catch (error: any) {
      console.error('Login error:', error);
      // Provide more specific error messages
      switch (error.code) {
        case 'auth/invalid-credential':
          return 'Invalid email or password. Please check your credentials and try again.';
        case 'auth/user-not-found':
          return 'No account found with this email. Please register first.';
        case 'auth/wrong-password':
          return 'Incorrect password. Please try again.';
        case 'auth/too-many-requests':
          return 'Too many failed login attempts. Please try again later.';
        case 'auth/user-disabled':
          return 'This account has been disabled. Please contact support.';
        default:
          return error.message || 'An error occurred during login. Please try again.';
      }
    }
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      console.log('Attempting registration for:', email);
      const result = await createUserWithEmailAndPassword(auth, email, password);
      console.log('Registration successful:', result.user.email);
      return null;
    } catch (error: any) {
      console.error('Registration error:', error);
      return error.message || 'Registration failed';
    }
  };

  const logout = async () => {
    try {
      console.log('Attempting logout');
      await signOut(auth);
      console.log('Logout successful');
      return null;
    } catch (error: any) {
      console.error('Logout error:', error);
      return error.message || 'Logout failed';
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
