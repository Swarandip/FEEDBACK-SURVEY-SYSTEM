import React from 'react';
import { Link } from 'react-router-dom';

export const LearnMorePage: React.FC = () => {
  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* LEFT SIDEBAR – same style as Home/About/Tutorial */}
      <aside className="w-64 bg-[#0F172A] text-gray-200 flex flex-col justify-between py-8 px-6">
        <div>
          <h1 className="text-2xl font-bold mb-10 text-white text-center">
            Feedbackly
          </h1>

          <nav className="space-y-4 font-medium">
            <Link
              to="/"
              className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-700"
            >
              Home
            </Link>
            <Link
              to="/about"
              className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-700"
            >
              About
            </Link>
            <Link
              to="/tutorial"
              className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-700"
            >
              Tutorial
            </Link>
            <Link
              to="/contact-us"
              className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-700"
            >
              Contact Us
            </Link>
            <Link
              to="/login-options"
              className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-700"
            >
              Login
            </Link>
          </nav>
        </div>

        <div className="text-center">
          <Link
            to="/learn-more"
            className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition inline-block"
          >
            Learn More
          </Link>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col items-center justify-center p-10 bg-white rounded-l-3xl shadow-inner">
        <div className="max-w-3xl w-full">
          <h2 className="text-4xl font-bold text-gray-900 mb-4 text-center">
            Learn More
          </h2>
          <p className="text-gray-600 mb-10 leading-relaxed text-lg text-center">
            Feedbackly helps colleges and universities collect structured feedback,
            track participation, and turn responses into actionable insights.
          </p>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="bg-blue-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">
                Fast feedback collection
              </h3>
              <p className="text-sm text-blue-900">
                Students can fill forms quickly with ratings, text answers, and multiple choices.
              </p>
            </div>

            <div className="bg-emerald-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-emerald-800 mb-2">
                Role-based workflow
              </h3>
              <p className="text-sm text-emerald-900">
                Admins create forms, faculty can review feedback, and students submit responses.
              </p>
            </div>

            <div className="bg-purple-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-purple-800 mb-2">
                Secure data storage
              </h3>
              <p className="text-sm text-purple-900">
                User accounts and submissions are stored in MongoDB (backend API).
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Start in minutes
              </h3>
              <p className="text-sm text-gray-700">
                Use the Register option to create an account, then log in and fill feedback forms.
              </p>
            </div>
          </div>

          <div className="mt-10 text-center">
            <Link
              to="/login-options"
              className="inline-block px-8 py-3 bg-blue-600 text-white rounded-full shadow-md hover:bg-blue-700 transition-all duration-300 text-lg"
            >
              Get Started
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};