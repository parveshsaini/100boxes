// Login.js
import React, { useEffect, useState } from 'react';
import { useAuth } from '../providers/auth.provider';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const { login, user } = useAuth();
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await login(credentials);
    navigate('/');
  };

  return (
    <div className='h-[100vh] flex items-center justify-center'>
    <form 
  onSubmit={handleSubmit} 
  className="bg-gray-800 max-w-lg mx-auto p-8 rounded-lg shadow-lg space-y-6"
>
  <h1 className="text-2xl font-bold text-green-400 text-center">Login</h1>
  
  <div className="space-y-4">
    <input
      type="email"
      name="email"
      placeholder="Email"
      value={credentials.email}
      onChange={handleChange}
      required
      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-white"
    />
    <input
      type="password"
      name="password"
      placeholder="Password"
      value={credentials.password}
      onChange={handleChange}
      required
      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-white"
    />
  </div>

  <button 
    type="submit"
    className="w-full px-4 py-2 bg-green-500 rounded-md text-lg font-semibold hover:bg-green-400 transition duration-300"
  >
    Login
  </button>
</form>
</div>

  );
};

export default Login;
