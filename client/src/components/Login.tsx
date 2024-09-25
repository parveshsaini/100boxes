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
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        name="email"
        placeholder="Email"
        value={credentials.email}
        onChange={handleChange}
        required
      />
      <input
        type="password"
        name="password"
        placeholder="Password"
        value={credentials.password}
        onChange={handleChange}
        required
      />
      <button type="submit">Login</button>
    </form>
  );
};

export default Login;
