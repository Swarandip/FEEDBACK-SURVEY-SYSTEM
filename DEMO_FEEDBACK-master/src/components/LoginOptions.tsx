import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, UserCheck, UserPlus } from 'lucide-react'; // Icons for roles

export const LoginOptions: React.FC = () => {
  const navigate = useNavigate();

  const handleOptionClick = (role: string) => {
    navigate(`/login/${role}`); // Navigate to the login form with the selected role
  };

  const handleLearnMore = () => {
    navigate('/learn-more');
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* LEFT SIDEBAR */}
      <aside className="w-64 bg-[#0F172A] text-gray-200 flex flex-col justify-between py-8 px-6 animate-slide-in">
        <div>
          <h1 className="text-2xl font-bold mb-10 text-white text-center">
            Feedbackly
          </h1>

          <nav className="space-y-4 font-medium">
            <Link to="/" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-700 transition-all duration-500">
              Home
            </Link>
            <Link to="/about" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-700 transition-all duration-500">
              About
            </Link>
            <Link to="/tutorial" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-700 transition-all duration-500">
              Tutorial
            </Link>
            <Link to="/contact-us" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-700 transition-all duration-500">
              Contact Us
            </Link>
            <Link to="/login-options" className="flex items-center gap-3 px-3 py-2 rounded-md bg-blue-600 text-white transition-all duration-500">
              Login
            </Link>
          </nav>
        </div>

        <div className="text-center">
          <button
            onClick={handleLearnMore}
            className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all duration-500"
          >
            Learn More
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col items-center justify-center p-10 bg-white rounded-l-3xl shadow-inner animate-fade-in">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 animate-fade-in">Choose Your Role</h1>
            <p className="text-gray-600 mt-2 animate-fade-in">Select your role to proceed with login</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 animate-fade-in">
            {/* Faculty Option */}
            <div
              onClick={() => handleOptionClick('faculty')}
              className="cursor-pointer bg-white shadow-md rounded-lg p-6 text-center hover:shadow-lg transition-shadow duration-500"
            >
              <div className="flex justify-center mb-4">
                <User className="h-12 w-12 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800">Faculty</h2>
              <p className="text-gray-500 mt-2">Login as a faculty member</p>
            </div>

            {/* Admin Option */}
            <div
              onClick={() => handleOptionClick('admin')}
              className="cursor-pointer bg-white shadow-md rounded-lg p-6 text-center hover:shadow-lg transition-shadow duration-500"
            >
              <div className="flex justify-center mb-4">
                <UserCheck className="h-12 w-12 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800">Admin</h2>
              <p className="text-gray-500 mt-2">Login as an administrator</p>
            </div>

            {/* Student Option */}
            <div
              onClick={() => handleOptionClick('student')}
              className="cursor-pointer bg-white shadow-md rounded-lg p-6 text-center hover:shadow-lg transition-shadow duration-500"
            >
              <div className="flex justify-center mb-4">
                <UserPlus className="h-12 w-12 text-purple-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800">Student</h2>
              <p className="text-gray-500 mt-2">Login as a student</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};