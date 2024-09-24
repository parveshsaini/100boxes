// AuthContext.js
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import axios from 'axios';

interface AuthContextType {
    user: IUser | null;
    login: (credentials: ILogin) => Promise<void>;
    signup: (credentials: ISignup) => Promise<void>;
    logout: () => void;
  }
  

  interface ILogin {
    email: string;
    password: string;
  }

  interface ISignup {
    email: string;
    password: string;
    name: string;
  }

interface IUser {
    id: number;
    email: string;
    name: string;
    imageUrl: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);


export const AuthProvider = ({ children }: {children: ReactNode}) => {
  const [user, setUser] = useState<IUser | null>(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      getUser()
    }
  }, []);

  const getUser= async()=> {
    const res= await axios.get('http://localhost:3000/api/v1/user/me', {headers: {Authorization: token}});

    if(res.data){
        setUser(res.data.user)
    }
  }

  const login = async (credentials: ILogin) => {
    const res = await axios.post('http://localhost:3000/api/v1/user/login', credentials);
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
  };


  const signup = async (creadentials: ISignup) => {
    const res = await axios.post('http://localhost:3000/api/v1/user/signup', creadentials);
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
      throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
  };
  
