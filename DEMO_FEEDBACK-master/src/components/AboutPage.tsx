import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export const AboutPage: React.FC = () => {
  const navigate = useNavigate();

  const handleLearnMore = () => {
    navigate('/learn-more');
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* LEFT SIDEBAR – same style as HomePage */}
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
              className="flex items-center gap-3 px-3 py-2 rounded-md bg-blue-600 text-white"
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
          <button
            onClick={handleLearnMore}
            className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            Learn More
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT – about details */}
      <main className="flex-1 flex flex-col items-center justify-center p-10 bg-white rounded-l-3xl shadow-inner">
        <div className="max-w-3xl w-full">
          <h2 className="text-4xl font-bold text-gray-900 mb-4 text-center">
            About Feedbackly
          </h2>
          <p className="text-gray-600 mb-8 leading-relaxed text-lg text-center">
            Feedbackly is a survey and feedback platform for colleges and universities.
            It connects students, faculty, and administrators so that feedback can be collected,
            analyzed, and used to improve teaching quality and campus experience.
          </p>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="bg-blue-50 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">For Students</h3>
              <p className="text-sm text-blue-900">
                Share honest course and faculty feedback in a secure, easy‑to‑use interface.
              </p>
            </div>

            <div className="bg-emerald-50 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-emerald-800 mb-2">For Faculty</h3>
              <p className="text-sm text-emerald-900">
                Understand student sentiment and use clear, visual feedback to refine teaching.
              </p>
            </div>

            <div className="bg-purple-50 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-purple-800 mb-2">For Admins</h3>
              <p className="text-sm text-purple-900">
                Create forms, monitor response rates, and make data‑driven academic decisions.
              </p>
            </div>
          </div>

          <div className="mt-8 text-center text-sm text-gray-500">
            Built with React, TypeScript, Node.js, and MongoDB to keep your feedback fast, modern, and secure.
          </div>
        </div>
      </main>
    </div>
  );
};