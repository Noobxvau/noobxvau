import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { Home, User, LogOut } from 'lucide-react';

export default function Navbar() {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link
              to="/"
              className="flex items-center px-2 py-2 text-gray-700 hover:text-blue-600"
            >
              
              <Home className="h-6 w-6" />
              <h4>NOOBxVAU</h4>
            </Link>
          </div>
          <div className="flex items-center">
            <Link
              to={`/profile/${auth.currentUser?.uid}`}
              className="px-3 py-2 text-gray-700 hover:text-blue-600"
            >
              <User className="h-6 w-6" />
            </Link>
            <button
              onClick={handleSignOut}
              className="px-3 py-2 text-gray-700 hover:text-blue-600"
            >
              <LogOut className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}