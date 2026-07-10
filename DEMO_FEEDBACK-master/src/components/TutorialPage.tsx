import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export const TutorialPage: React.FC = () => {
  const navigate = useNavigate();

  const handleLearnMore = () => {
    navigate('/learn-more');
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* LEFT SIDEBAR – same style as HomePage & AboutPage */}
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
              className="flex items-center gap-3 px-3 py-2 rounded-md bg-blue-600 text-white"
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

      {/* MAIN CONTENT – tutorial steps */}
      <main className="flex-1 flex flex-col items-center justify-center p-10 bg-white rounded-l-3xl shadow-inner overflow-auto">
        <div className="max-w-3xl w-full">
          <h2 className="text-4xl font-bold text-gray-900 mb-4 text-center">
            How to Use Feedbackly
          </h2>
          <p className="text-gray-600 mb-8 leading-relaxed text-lg text-center">
            Follow these steps to get started with surveys and feedback on Feedbackly.
          </p>

          <div className="space-y-6">
            <div className="border border-gray-200 rounded-xl p-5 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-bold">1</span>
                Sign up or log in
              </h3>
              <p className="text-gray-600 text-sm pl-10">
                Choose your role (Student, Faculty, or Admin) on the login page. New users can register from the Sign up link. Use your email and password to access your dashboard.
              </p>
            </div>

            <div className="border border-gray-200 rounded-xl p-5 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-bold">2</span>
                Students: Submit feedback
              </h3>
              <p className="text-gray-600 text-sm pl-10">
                From your dashboard, open &quot;Available Feedback Forms&quot; and click &quot;Fill Form&quot; on any form. Answer the questions and submit. You can see which forms you have already completed.
              </p>
            </div>

            <div className="border border-gray-200 rounded-xl p-5 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-bold">3</span>
                Faculty: View feedback
              </h3>
              <p className="text-gray-600 text-sm pl-10">
                After logging in as faculty, go to &quot;Feedback Received&quot; to see student responses and ratings. Use this to improve your courses and teaching.
              </p>
            </div>

            <div className="border border-gray-200 rounded-xl p-5 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-bold">4</span>
                Admins: Create forms
              </h3>
              <p className="text-gray-600 text-sm pl-10">
                From the admin dashboard, click &quot;Create New Form&quot;. Add a title, description, and questions (text, rating, multiple choice, etc.). Set the target audience and save. Forms appear for students to fill.
              </p>
            </div>
          </div>

          <div className="mt-8 text-center text-sm text-gray-500">
            Need help? Use <Link to="/contact-us" className="text-blue-600 hover:underline">Contact Us</Link> to get in touch.
          </div>
        </div>
      </main>
    </div>
  );
};