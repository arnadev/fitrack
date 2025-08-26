'use client';
import Link from 'next/link';

import React from 'react';
import LogoutButton from './LogoutButton';
const NavBar= () => {
  return (
    <nav className="bg-white shadow-md border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900">FiTrack</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Link href='/home' className="text-gray-700 hover:text-gray-900">Home</Link>
            <Link href='/users' className="text-gray-700 hover:text-gray-900">Search</Link>
            <Link href='/updates' className="text-gray-700 hover:text-gray-900">Updates</Link>
            <LogoutButton />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;