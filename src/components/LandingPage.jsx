import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[#FFF1D5] flex flex-col">
      {/* Navbar */}
      <nav className="bg-[#BDDDE4] shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-[#9EC6F3]">ClubHub</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-[#9FB3DF] hover:bg-[#9EC6F3] hover:text-white px-4 py-2 rounded-lg transition duration-300 font-medium"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="bg-[#9EC6F3] text-white px-4 py-2 rounded-lg hover:bg-[#9FB3DF] transition duration-300 font-medium"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-grow flex items-center justify-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20">
          <h2 className="text-4xl md:text-5xl font-extrabold text-[#9FB3DF] mb-6">
            Welcome to ClubHub
          </h2>
          <p className="text-xl text-[#9EC6F3] mb-8 max-w-2xl mx-auto">
            Join, manage, and explore college clubs with ease. Connect with peers, organize events, and make your college experience unforgettable.
          </p>
          <Link
            to="/signup"
            className="inline-block bg-[#9EC6F3] text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-[#9FB3DF] transition duration-300 shadow-md"
          >
            Get Started
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#BDDDE4] py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[#9FB3DF] text-sm">
            &copy; 2025 ClubHub. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;