import React from 'react';
import { useNavigate } from 'react-router-dom'; 
import img2 from './img2.jpg';
export const HomePage: React.FC = () => {
  const navigate = useNavigate();


  const handleLearnMore = () => {
    navigate('/learn-more');
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* LEFT SIDEBAR */}
      <aside className="w-64 bg-[#0F172A] text-gray-200 flex flex-col justify-between py-8 px-6">
        <div>
          <h1 className="text-2xl font-bold mb-10 text-white text-center">
            Feedbackly
          </h1>

          <nav className="space-y-4 font-medium">
            <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-md bg-blue-600 text-white">
              Home
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-700">
              About
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-700">
              Tutorial
            </a>
            <a href="/contact-us" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-700">
              Contact Us
            </a>
            <a href="/login-options" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-700">
              Login
            </a>
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

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col items-center justify-center p-10 bg-white rounded-l-3xl shadow-inner">
        <div className="max-w-3xl text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Survey and Feedback
          </h2>
          <p className="text-gray-600 mb-8 leading-relaxed text-lg">
            Empower your organization with quick, insightful surveys. Collect
            feedback, measure satisfaction, and make data-driven improvements.
          </p>

          {/*<button
            onClick={handleLoginClick}
            className="px-8 py-3 bg-blue-600 text-white rounded-full shadow-md hover:bg-blue-700 transition-all duration-300 text-lg"
          >
            Login
          </button>*/}

          <div className="mt-10 flex justify-center">
            <img
              src={img2}
              alt="Feedback Illustration"
              className="h-[380px] w-[800px]"
            />
          </div>
        </div>
      </main>
    </div>
  );
};