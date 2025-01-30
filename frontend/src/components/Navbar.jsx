import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

const Navbar = ({ links }) => {
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("theme") === "dark");

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      document.documentElement.setAttribute("data-theme", "dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.removeAttribute("data-theme");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  return (
    <nav className="w-full bg-white dark:bg-gray-900 px-6 py-4">
      <div className="max-w-[90%] mx-auto flex items-center justify-between">
        
        <Link to="/" className="text-lg font-bold flex items-center dark:text-white">
          Checkout Project Ify Nweze
        </Link>

        <div className="flex items-center gap-6">
          
          {links.map((link) => (
            <Link key={link.path} to={link.path} className="bg-gray-200 dark:bg-gray-700 text-black dark:text-white px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600">
              {link.label}
            </Link>
          ))}

          <button className="bg-gray-200 dark:bg-gray-700 text-black dark:text-white px-4 py-2 rounded-lg flex items-center">
            🇬🇧 United Kingdom
          </button>

          <button 
            onClick={() => setDarkMode(!darkMode)}
            className="bg-gray-900 dark:bg-gray-200 text-white dark:text-black px-4 py-2 rounded-lg flex items-center"
          >
            {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
          </button>
        </div>

      </div>
    </nav>
  );
};

export default Navbar;
