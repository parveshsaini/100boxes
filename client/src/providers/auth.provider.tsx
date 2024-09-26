// AuthContext.js
import  { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import axios from 'axios';

interface AuthContextType {
    user: IUser | null;
    loading: boolean;
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

export interface IUser {
    id: number;
    email: string;
    name: string;
    imageUrl: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);


export const AuthProvider = ({ children }: {children: ReactNode}) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading]= useState<boolean>(false);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      getUser()
    }
  }, []);

  const getUser= async()=> {
    setLoading(true)
    const res= await axios.get(`${import.meta.env.VITE_API_URL}/api/v1/user/me`, {headers: {Authorization: token}});

    if(res.data){
        setUser(res.data.user)
    }

    setLoading(false)
  }

  const login = async (credentials: ILogin) => {
    setLoading(true)
    const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/v1/user/login`, credentials);
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
    setLoading(false)
  };


  const signup = async (creadentials: ISignup) => {
    setLoading(true)
    const res = await axios.post('http://localhost:3000/api/v1/user/signup', creadentials);
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
    setLoading(false)
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
      throw new Error('No Context');
    }
    return context;
  };
  
