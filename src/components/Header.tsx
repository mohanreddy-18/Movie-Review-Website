import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Film, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface HeaderProps {
  onSearch: (query: string) => void;
  user: any;
}

export default function Header({ onSearch, user }: HeaderProps) {
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get('search') as string;
    onSearch(query);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  // Extract the first part of the name from user_metadata, or fall back to email.
  const displayName = user?.user_metadata?.name
    ? user.user_metadata.name.split(' ')[0]
    : user?.email;

  return (
    <header className="bg-gradient-to-r from-blue-900 to-purple-900 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        {/* Logo */}
        <a href="/" className="flex items-center space-x-3">
          <Film className="h-8 w-8 text-white" />
          <span className="text-2xl font-bold text-white">MovieVerse</span>
        </a>
        {/* Search Form */}
        <form onSubmit={handleSubmit} className="relative">
          <input
            type="search"
            name="search"
            placeholder="Search movies..."
            className="w-64 pl-4 pr-10 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
          />
          <button type="submit" className="absolute right-3 top-2.5">
            <Search className="h-5 w-5 text-white/60" />
          </button>
        </form>
        {/* User Info / Auth Buttons */}
        {user ? (
          <div className="flex items-center space-x-4">
            <span className="text-white"> {displayName}</span>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 rounded-lg bg-white text-blue-900 hover:bg-blue-50 transition"
            >
              Login
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
            >
              Sign Up
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
