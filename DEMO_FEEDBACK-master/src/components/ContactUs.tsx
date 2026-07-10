import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Instagram, Twitter, Send } from 'lucide-react';

export const ContactUs: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('Thank you for contacting us! We will get back to you soon.');
    setFormData({ name: '', email: '', message: '' });
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
            <Link to="/contact-us" className="flex items-center gap-3 px-3 py-2 rounded-md bg-blue-600 text-white transition-all duration-500">
              Contact Us
            </Link>
            <Link to="/login-options" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-700 transition-all duration-500">
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
        <div className="max-w-4xl w-full bg-white shadow-md rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 text-center mb-6 animate-fade-in">
            Contact Us
          </h1>
          <p className="text-gray-600 text-center mb-8 animate-fade-in">
            Reach out to us through social media or send us a message directly.
          </p>

          {/* Social Media Links */}
          <div className="flex justify-center space-x-6 mb-8 animate-fade-in">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 text-pink-600 hover:text-pink-800 transition-all duration-500"
            >
              <Instagram className="h-6 w-6" />
              <span className="font-medium">Instagram</span>
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 text-blue-500 hover:text-blue-700 transition-all duration-500"
            >
              <Twitter className="h-6 w-6" />
              <span className="font-medium">Twitter</span>
            </a>
            <a
              href="https://telegram.org"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 text-blue-400 hover:text-blue-600 transition-all duration-500"
            >
              <Send className="h-6 w-6" />
              <span className="font-medium">Telegram</span>
            </a>
          </div>

          {/* Contact Form */}
          <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Your Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-500"
                placeholder="Enter your name"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Your Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-500"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                Your Message
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-500"
                placeholder="Write your message here"
                rows={5}
                required
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-md shadow-md hover:bg-blue-700 transition-all duration-500"
            >
              Send Message
            </button>
          </form>

          {/* Success Message */}
          {successMessage && (
            <div className="mt-6 text-center text-green-600 font-medium animate-fade-in">
              {successMessage}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};