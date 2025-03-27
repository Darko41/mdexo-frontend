import { Link } from "react-router-dom";
import { FaHome, FaSearch, FaSignInAlt, FaQuestionCircle } from "react-icons/fa";

export default function Header() {
  return (
    <div className="bg-blue-600 shadow-lg">
      <div className="flex flex-wrap justify-between items-center p-4 max-w-screen-xl mx-auto">
        <div className="flex items-center space-x-6 w-full sm:w-auto justify-between sm:justify-start">
          <Link to="/" className="text-2xl font-bold text-white hover:text-yellow-400 transition duration-300 flex items-center space-x-2">
            <FaHome /> <span>Real Estate Company INC</span>
          </Link>
        </div>

        <div className="flex items-center justify-between w-full sm:w-auto mt-4 sm:mt-0">
          <Link to="/real-estates">
            <button className="bg-amber-300 hover:bg-blue-600 text-white py-2 px-4 rounded-md transition duration-300">
              КУПОВИНА
            </button>
          </Link>
          <Link to="/iznamljivanje">
            <button className="bg-amber-300 hover:bg-blue-600 text-white py-2 px-4 rounded-md transition duration-300">
              ИЗНАЈМЉИВАЊЕ
            </button>
          </Link>
          <Link to="/prodaja">
            <button className="bg-amber-300 hover:bg-blue-600 text-white py-2 px-4 rounded-md transition duration-300">
              ПРОДАЈА
            </button>
          </Link>
        </div>

        <div className="flex items-center space-x-6 w-full sm:w-auto mt-4 sm:mt-0">
          <Link to="/pomoc">
            <button className="bg-amber-300 hover:bg-blue-600 text-white py-2 px-4 rounded-md transition duration-300">
              <FaQuestionCircle />
            </button>
          </Link>
          <Link to="/prijava">
            <button className="bg-amber-300 hover:bg-blue-600 text-white py-2 px-4 rounded-md transition duration-300">
              <FaSignInAlt /> ПРИЈАВА
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
