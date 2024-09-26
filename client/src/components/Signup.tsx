
import  { ChangeEvent, useEffect, useState } from 'react';
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
    <div className='h-[100vh] flex items-center justify-center'>
    <form 
  onSubmit={handleSubmit} 
  className="bg-gray-800 max-w-lg mx-auto p-8 rounded-lg shadow-lg space-y-6 "
>
  <h1 className="text-2xl font-bold text-green-400 text-center">Create Account</h1>
  
  <div className="space-y-4">
    <input
      type="text"
      name="name"
      placeholder="Name"
      value={userData.name}
      onChange={handleChange}
      required
      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-white"
    />
    <input
      type="email"
      name="email"
      placeholder="Email"
      value={userData.email}
      onChange={handleChange}
      required
      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-white"
    />
    <input
      type="password"
      name="password"
      placeholder="Password"
      value={userData.password}
      onChange={handleChange}
      required
      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-white"
    />
  </div>

  <button 
    type="submit"
    className="w-full px-4 py-2 bg-green-500 rounded-md text-lg font-semibold hover:bg-green-400 transition duration-300"
  >
    Sign Up
  </button>
</form>
</div>

  );
};

export default Signup;
