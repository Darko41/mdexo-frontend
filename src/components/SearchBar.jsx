import { FaSearch } from "react-icons/fa";

export default function SearchBar() {
  return (
    <div className="flex items-center bg-white rounded-lg shadow-lg p-2 w-80 mx-auto mt-4 sm:w-full">
      <FaSearch className="text-gray-600 text-xl ml-2" />
      <input
        className="w-full px-4 py-2 text-gray-700 placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        type="text"
        placeholder="Куцајте за претрагу"
      />
    </div>
  );
}
