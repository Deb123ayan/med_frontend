import React, { createContext, useContext, useState, useEffect } from 'react';

interface Doctor {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  specialization: string;
  hospital_affiliation: string;
  is_verified: boolean;
  patient_count?: number;
}

interface AuthContextType {
  doctor: Doctor | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (registrationData: any) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored token on app load
    const storedToken = localStorage.getItem('auth_token');
    const storedDoctor = localStorage.getItem('doctor_data');
    
    if (storedToken && storedDoctor) {
      setToken(storedToken);
      setDoctor(JSON.parse(storedDoctor));
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Login failed');
      }

      const data = await response.json();
      
      setToken(data.token);
      setDoctor(data.doctor);
      
      // Store in localStorage
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('doctor_data', JSON.stringify(data.doctor));
      
    } catch (error) {
      throw error;
    }
  };

  const register = async (registrationData: any) => {
    try {
      const response = await fetch('/api/auth/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Registration failed');
      }

      const data = await response.json();
      return data;
      
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await fetch('/api/auth/logout/', {
          method: 'POST',
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setToken(null);
      setDoctor(null);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('doctor_data');
      
      // Redirect to login page
      window.location.href = '/login';
    }
  };

  return (
    <AuthContext.Provider value={{ doctor, token, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};