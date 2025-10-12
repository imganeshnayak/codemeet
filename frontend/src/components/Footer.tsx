import React, { useEffect, useState, useRef } from "react";
import { Instagram, X } from "lucide-react";

// --- Utility: The main Footer component ---
const Footer = () => {
  // Hardcoding year and text based on the image reference (Fanvue)
  const currentYear = 2025;
  const [isVisible, setIsVisible] = useState(false);
  const footerRef = useRef(null);

  // Intersection Observer setup to trigger the animation on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // When the footer enters the viewport
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Stop observing once visible
          observer.unobserve(entry.target);
        }
      },
      {
        root: null, // Observe relative to the viewport
        rootMargin: '0px',
        threshold: 0.1, // Trigger when 10% of the element is visible
      }
    );

    if (footerRef.current) {
      observer.observe(footerRef.current);
    }

    // Cleanup observer on unmount
    return () => {
      if (footerRef.current) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        observer.unobserve(footerRef.current);
      }
    };
  }, []); // Empty dependency array means this runs once on mount

  return (
    // The scroll animation class is applied here
    <footer
      ref={footerRef} // Attach the ref
      className={`
        py-16 bg-gray-200 text-gray-800 
        transition-all duration-700 ease-out 
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}
      `}
    >
      <div className="container mx-auto max-w-6xl px-4">
        
        {/* TOP SECTION: Heading, Button, and Connect Links */}
        <div className="flex flex-col lg:flex-row justify-between lg:items-start mb-16 gap-12">
          
          {/* Main Heading and Marketing Text (Left Side) */}
          <div className="flex-1 max-w-xl">
            {/* Font styling to mimic the image's look (using font-serif/italic combination) */}
            <h2 className="text-4xl sm:text-5xl font-serif leading-tight">
              <span className="italic font-light">Join</span> <strong className="font-extrabold text-gray-900">THE FASTEST</strong> <span className="italic font-light">Growing</span> <strong className="font-extrabold text-gray-900">COMMUNITY OF CREATORS</strong>
            </h2>
          </div>

          {/* Button and Connect Links (Right Side) */}
          <div className="flex flex-col lg:items-end gap-12">
             {/* Button */}
            <a 
              href="#" 
              className="px-6 py-3 text-lg font-bold bg-green-500 text-white rounded-full shadow-lg hover:bg-green-600 transition-colors duration-300 ease-in flex items-center justify-center w-full lg:w-auto"
            >
              Become a member
            </a>
            
            {/* Connect Section */}
            <div>
              <h4 className="font-semibold mb-4 text-xs tracking-widest uppercase text-gray-500">
                Connect
              </h4>
              <ul className="space-y-4 text-base text-gray-800 font-semibold">
                <li className="flex items-center space-x-2 hover:text-green-600 transition-colors duration-200">
                  <Instagram className="h-5 w-5" />
                  <a href="#">Instagram</a>
                </li>
                <li className="flex items-center space-x-2 hover:text-green-600 transition-colors duration-200">
                  {/* Using X icon instead of plain span */}
                  <X className="h-5 w-5" />
                  <a href="#">X</a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION: Logo/Details and Address */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-gray-300">
            
            {/* Logo and Tagline (Left - takes 2 columns) */}
            <div className="md:col-span-2 flex flex-col sm:flex-row gap-6">
                {/* Green Logo Placeholder */}
                <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center text-white text-2xl font-bold shrink-0">
                    <svg className="h-7 w-7" fill="currentColor" viewBox="0 0 24 24">
                        {/* Simple 'F' like shape for placeholder (updated SVG path for a better fit) */}
                        <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm1 14h-2V7h2v9z" />
                    </svg>
                </div>
                <p className="text-base text-gray-600 max-w-lg">
                    The fastest growing platform in the creator economy. Sign up before the end of the month & take home 85%.
                </p>
            </div>
        </div>
        
        {/* Copyright and Address Line */}
        <div className="pt-8 text-xs text-gray-500 mt-8">
            <p>
                &copy; {currentYear} Fanvue, Shift Holdings LTD | 2nd Floor College House, 17 King Edwards Road, Ruislip, London, United Kingdom, HA4 7AE | 8 The Green STE R, Dover, 19901, Delaware, United States
            </p>
        </div>
      </div>
    </footer>
  );
};

// --- Main App Component to render the Footer ---
const App = () => {
  return (
    <div className="min-h-screen bg-white font-sans">
        {/* Filler content adjusted to ensure scrolling is required to see the footer */}
        <div className="h-[150vh] flex items-center justify-center">
            <h1 className="text-3xl font-light text-gray-400">Scroll Down to See Footer Pop Up</h1>
        </div>
        <Footer />
    </div>
  )
}

export default App;
