import React, { useState } from 'react';
import { Dialog } from './Dialog';
import { loginUser, AuthError } from '../lib/auth';

interface LoginDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToSignup: () => void;
}

export function LoginDialog({ isOpen, onClose, onSwitchToSignup }: LoginDialogProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await loginUser(email, password);
      onClose();
    } catch (err) {
      const authError = err as AuthError;
      setError(
        authError.code === 'auth/invalid-credential'
          ? 'Invalid email or password'
          : 'An error occurred. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Login">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <div className="bg-red-50 text-red-600 p-2 rounded-md text-xs">
            {error}
          </div>
        )}
        
        <div>
          <label htmlFor="email" className="block text-xs mb-1.5">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-[#64646533] rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs outline-none"
            placeholder="Enter your email"
            required
            disabled={loading}
          />
        </div>
        
        <div>
          <label htmlFor="password" className="block text-xs mb-1.5">
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-[#64646533] rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs outline-none"
            placeholder="Enter your password"
            required
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          className="w-full bg-[#155EEF] text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>

        <div className="text-center text-xs text-gray-600">
          Don't have an account?{' '}
          <button
            type="button"
            className="text-blue-600 hover:text-blue-700 font-medium"
            onClick={onSwitchToSignup}
            disabled={loading}
          >
            Sign up
          </button>
        </div>
      </form>
    </Dialog>
  );
}