import { Link } from "react-router-dom"; // Import Link for routing

export default function Header() {
  return (
    <div>
      {/* Header Section */}
      <div className="flex h-25 w-screen flex-row justify-between bg-blue-600 px-4 sm:px-12">
        <div className="flex items-center space-x-4 sm:space-x-6"> {/* Reduced width classes and added space-x */}
          {/* Home Button */}
          <Link to="/" className="bg-amber-300 hover:bg-blue-600 p-2 rounded">
            Real Estate Company INC
          </Link>
        </div>

        {/* Logo Section */}
        <div className="logo flex justify-center items-center">
          {/* Logo - Use an image or text as logo */}
          <Link to="/" className="text-white text-2xl font-bold">
            {/* Here you can use an image tag, or leave it as text for simplicity */}
            <img src="/path/to/your/logo.png" alt="MDEXO" className="h-10 w-auto" />
            {/* OR */}
            {/* <p className="text-white text-2xl font-bold">Real Estate Co</p> */}
          </Link>
        </div>

        {/* Button Section */}
        <div className="flex items-center space-x-4 sm:space-x-6"> {/* Applied space-x here */}
          <Link to="/real-estates">
            <button className="bg-amber-300 hover:bg-blue-600 px-4 py-2 rounded">
              КУПОВИНА
            </button>
          </Link>
          <Link to="/iznamljivanje">
            <button className="bg-amber-300 hover:bg-blue-600 px-4 py-2 rounded">
              ИЗНАЈМЉИВАЊЕ
            </button>
          </Link>
          <Link to="/prodaja">
            <button className="bg-amber-300 hover:bg-blue-600 px-4 py-2 rounded">
              ПРОДАЈА
            </button>
          </Link>
          <Link to="/pomoc">
            <button className="bg-amber-300 hover:bg-blue-600 px-4 py-2 rounded">
              ПОМОЋ
            </button>
          </Link>
          <Link to="/prijava">
            <button className="bg-amber-300 hover:bg-blue-600 px-4 py-2 rounded">
              ПРИЈАВА
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
