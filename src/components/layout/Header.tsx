import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, User, LogOut, Settings } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../ui/Button';

export function Header() {
  const { user, profile, signOut, message } = useAuthStore();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      setSigningOut(true);
      await signOut();
      setShowProfileMenu(false);
      // Small delay to show success message before redirect
      setTimeout(() => {
        navigate('/signin');
      }, 1000);
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <>
      {message && (
        <div className="bg-green-50 border-b border-green-200 px-6 py-3">
          <div className="text-green-700 text-sm text-center">
            {message}
          </div>
        </div>
      )}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between lg:justify-end">
      <div className="flex items-center lg:hidden">
        <Button variant="ghost" size="sm">
          <Menu className="w-5 h-5" />
        </Button>
      </div>

      <div className="relative">
        <button
          onClick={() => setShowProfileMenu(!showProfileMenu)}
          className="flex items-center space-x-3 text-sm text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg px-3 py-2"
        >
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-left hidden sm:block">
            <div className="font-medium">{profile?.name}</div>
            <div className="text-xs text-gray-500">{profile?.department}</div>
          </div>
        </button>

        {showProfileMenu && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
            <Link
              to="/profile"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              onClick={() => setShowProfileMenu(false)}
            >
              <Settings className="w-4 h-4 mr-3" />
              Profile Settings
            </Link>
            <button
              onClick={handleSignOut}
              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
              disabled={signingOut}
            >
              <LogOut className="w-4 h-4 mr-3" />
              {signingOut ? 'Signing Out...' : 'Sign Out'}
            </button>
          </div>
        )}
      </div>
      </header>
    </>
  );
}