import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import medvaultLogo from "../assets/medvault-logo.png";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if we're on the landing page to show section links
  const isOnLandingPage = location.pathname === '/';

  const handleNavigation = (sectionId) => {
    if (isOnLandingPage) {
      // If on landing page, scroll to section
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // If on other pages, navigate to landing page with hash
      navigate(`/#${sectionId}`);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-3">
          <img
            src={medvaultLogo}
            alt="MedVault Logo"
            className="w-10 h-10 rounded-xl drop-shadow-md object-contain border border-blue-100"
            style={{ background: 'white', borderRadius: '12px' }}
          />
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
            MedVault
          </span>
        </Link>
        <div className="hidden md:flex items-center space-x-8">
          <button 
            onClick={() => handleNavigation('features')} 
            className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
          >
            Features
          </button>
          <button 
            onClick={() => handleNavigation('about')} 
            className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
          >
            About
          </button>
          <button 
            onClick={() => handleNavigation('services')} 
            className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
          >
            Services
          </button>
          <button 
            onClick={() => handleNavigation('contact')} 
            className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
          >
            Contact
          </button>
          <button
            onClick={() => navigate("/login")}
            className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-6 py-2.5 rounded-xl font-semibold shadow-md hover:shadow-xl transition"
          >
            Login
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
