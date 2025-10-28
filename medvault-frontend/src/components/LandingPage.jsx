// src/components/LandingPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarDaysIcon,
  DocumentTextIcon,
  ChartBarIcon,
  ArrowRightIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  ClockIcon,
  DevicePhoneMobileIcon,
} from "@heroicons/react/24/outline";
import Lottie from "lottie-react";
import healthcareAnimation from "../assets/healthcare-animation.json";
import RequestAccess from './RequestAccess';
import medvaultLogo from "../assets/medvault-logo.png";

const LandingPage = () => {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);
  const [showRequestAccess, setShowRequestAccess] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const features = [
    {
      icon: ShieldCheckIcon,
      title: "Secure Authentication",
      description: "Multi-level security with role-based access control and end-to-end encryption",
    },
    {
      icon: CalendarDaysIcon,
      title: "Smart Scheduling",
      description: "AI-powered appointment booking system with automated reminders",
    },
    {
      icon: DocumentTextIcon,
      title: "Digital Records",
      description: "Complete electronic health record management with cloud sync",
    },
    {
      icon: ChartBarIcon,
      title: "Analytics Dashboard",
      description: "Real-time insights & reports for better patient care outcomes",
    },
    {
      icon: UserGroupIcon,
      title: "Telemedicine",
      description: "Connect with specialists worldwide through secure video consultations",
    },
    {
      icon: DevicePhoneMobileIcon,
      title: "Mobile Access",
      description: "Access your health data anytime, anywhere with our mobile app",
    },
  ];

  const healthcareServices = [
    {
      title: "General Medicine",
      description: "Comprehensive primary care with experienced general practitioners",
    },
    {
      title: "Specialist Consultations",
      description: "Access to cardiology, neurology, orthopedics, and more",
    },
    {
      title: "Emergency Care",
      description: "24/7 emergency support with rapid response protocols",
    },
    {
      title: "Preventive Health",
      description: "Regular check-ups, vaccinations, and health screening programs",
    },
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img
              src={medvaultLogo}
              alt="MedVault Logo"
              className="w-10 h-10 rounded-xl shadow-sm"
            />
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              MedVault
            </span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Features</a>
            <a href="#about" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">About</a>
            <a href="#services" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Services</a>
            <a href="#contact" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Contact</a>
            <button
              onClick={() => navigate("/login")}
              className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
            >
              Login
            </button>
          </div>
        </div>
      </nav>

      {/* Enhanced Hero Section - Reduced top padding */}
      <section className="min-h-screen flex items-center pt-16 bg-gradient-to-br from-slate-50 via-white to-blue-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Column - Text Content */}
            <div className="space-y-6">
              <div className="space-y-4">
                <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                  Transforming
                  <br />
                  Healthcare,
                  <br />
                  <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                    Secured with MedVault
                  </span>
                </h1>
                
                <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
                  A next-gen healthcare management system with advanced security, real-time analytics, 
                  and seamless experience for patients, doctors, and administrators.
                </p>
              </div>

              {/* CTA Buttons - Moved higher */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  onClick={() => navigate("/login")}
                  className="group bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <span>Get Started</span>
                  <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => setShowRequestAccess(true)}
                  className="bg-white text-gray-700 px-8 py-4 rounded-2xl font-semibold text-lg border-2 border-gray-200 hover:border-blue-300 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                >
                  Request Access
                </button>
              </div>
            </div>

            {/* Right Column - Enhanced Animation */}
            <div className="relative">
              {/* Main Animation Container */}
              <div className="relative bg-white rounded-3xl p-6 shadow-2xl border border-gray-100">
                {/* Floating Badge */}
                <div className="absolute -top-4 left-6 bg-gradient-to-r from-emerald-500 to-green-500 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
                  Digital Healthcare
                </div>
                
                {/* Animation */}
                <div className="h-[350px] lg:h-[450px] flex items-center justify-center">
                  <Lottie 
                    animationData={healthcareAnimation} 
                    loop={true}
                    className="w-full h-full"
                  />
                </div>

                {/* Bottom Info */}
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img
                      src={medvaultLogo}
                      alt="MedVault"
                      className="w-10 h-10 rounded-full border-2 border-blue-100 bg-white"
                    />
                    <div>
                      <div className="font-semibold text-gray-900">MedVault System</div>
                      <div className="text-sm text-gray-500">Healthcare Platform</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-gray-600">Live System</span>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full opacity-20 animate-pulse"></div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
              <div className="absolute top-1/3 -right-4 w-16 h-16 bg-gradient-to-r from-emerald-400 to-green-400 rounded-full opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>
          </div>
        </div>
      </section>

      {/* About Healthcare Section */}
      <section id="about" className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Revolutionizing Healthcare Delivery
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              MedVault bridges the gap between traditional healthcare and modern technology, 
              ensuring every patient receives personalized, accessible, and secure medical care.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h3 className="text-3xl font-bold text-gray-900 mb-8">Why Choose Digital Healthcare?</h3>
              <div className="space-y-8">
                {[
                  {
                    title: "Accessibility",
                    description: "Healthcare services available anytime, breaking geographical barriers and reducing wait times."
                  },
                  {
                    title: "Continuity of Care", 
                    description: "Seamless medical record management ensures consistent treatment across all healthcare providers."
                  },
                  {
                    title: "Cost Effectiveness",
                    description: "Reduced overhead costs and efficient resource allocation make healthcare more affordable."
                  }
                ].map((item, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 mt-1">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2 text-lg">{item.title}</h4>
                      <p className="text-gray-600 leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-3xl p-8 shadow-lg">
              <div className="text-center">
                <img
                  src={medvaultLogo}
                  alt="MedVault"
                  className="w-16 h-16 mx-auto mb-6 rounded-full border-2 border-blue-200 bg-white shadow-md"
                />
                <h4 className="text-2xl font-bold text-gray-900 mb-4">Patient-Centered Care</h4>
                <p className="text-gray-600 leading-relaxed">
                  Our platform puts patients at the center of their healthcare journey, 
                  empowering them with tools and information to make informed decisions 
                  about their health and wellness.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Healthcare Services Section */}
      <section id="services" className="py-20 px-6 bg-gradient-to-br from-blue-50 to-cyan-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Comprehensive Healthcare Services
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From routine check-ups to specialized treatments, we offer a full spectrum of healthcare services
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {healthcareServices.map((service, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {service.title}
                </h3>
                <p className="text-gray-600">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need for smarter, faster & secure healthcare management
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <div
                key={i}
                className="group bg-white rounded-2xl p-8 border border-gray-100 text-center shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-6 bg-gradient-to-r from-blue-600 to-cyan-500 text-white">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Ready to Transform Your Healthcare Experience?
          </h2>
          <p className="max-w-3xl mx-auto text-lg mb-8 leading-relaxed opacity-90">
            Join healthcare providers who trust MedVault for secure,
            efficient, and accessible healthcare management.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="bg-white text-blue-600 px-10 py-4 rounded-2xl font-bold text-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
          >
            Get Started Today
          </button>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold mb-12 text-center">Get in Touch</h2>
          <form className="max-w-3xl mx-auto space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <input
                type="text"
                placeholder="Your Name"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              <input
                type="email"
                placeholder="Your Email"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            <input
              type="text"
              placeholder="Subject"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            <textarea
              placeholder="Your Message"
              rows="6"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            <button
              type="submit"
              className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-8 py-4 rounded-xl font-semibold w-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              Send Message
            </button>
          </form>
        </div>
      </section>

            {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <img
                  src={medvaultLogo}
                  alt="MedVault Logo"
                  className="w-10 h-10 rounded-xl"
                />
                <span className="text-2xl font-bold">MedVault</span>
              </div>
              <p className="text-gray-400 max-w-md leading-relaxed">
                Securing healthcare, one patient at a time. Built for the future
                of medical care with cutting-edge technology and compassionate service.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <div className="space-y-2 text-gray-400">
                <a href="#features" className="block hover:text-white transition-colors">
                  Features
                </a>
                <a href="#services" className="block hover:text-white transition-colors">
                  Services
                </a>
                <a href="#" className="block hover:text-white transition-colors">
                  Security
                </a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <div className="space-y-2 text-gray-400">
                <a href="#about" className="block hover:text-white transition-colors">
                  About
                </a>
                <a href="#contact" className="block hover:text-white transition-colors">
                  Contact
                </a>
                <a href="#" className="block hover:text-white transition-colors">
                  Support
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            &copy; 2025 MedVault. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Request Access Modal */}
      <RequestAccess 
        isOpen={showRequestAccess} 
        onClose={() => setShowRequestAccess(false)} 
      />
    </div>
  );
};

export default LandingPage;
