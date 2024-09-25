// Signup.js
import React, { ChangeEvent, useEffect, useState } from 'react';
import { useAuth } from '../providers/auth.provider';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
  const { signup, user } = useAuth();
  const [userData, setUserData] = useState({ email: '', password: '', name: '' });
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();
    await signup(userData);
    navigate('/');
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        name="email"
        placeholder="Email"
        value={userData.email}
        onChange={handleChange}
        required
      />
      <input
        type="password"
        name="password"
        placeholder="Password"
        value={userData.password}
        onChange={handleChange}
        required
      />
      <input
        type="name"
        name="name"
        placeholder="Name"
        value={userData.name}
        onChange={handleChange}
        required
      />
      <button type="submit">Sign Up</button>
    </form>
  );
};

export default Signup;
