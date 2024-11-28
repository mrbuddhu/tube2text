'use client';

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email');
      return;
    }
    try {
      await login(email, ''); // Password not needed for now as we're using PayPal
      toast.success('Welcome! Please proceed to payment.');
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-sm">
      <h2 className="text-2xl font-bold mb-6 text-center">Join Tube2Text</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="you@example.com"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
        >
          Continue to Payment
        </button>
        <p className="text-sm text-gray-500 text-center mt-4">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </form>
    </div>
  );
}
