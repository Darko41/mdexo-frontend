import { FaSearch } from "react-icons/fa"; // Import the search icon

export default function SearchBar() {
  return (
    <div className="flex items-center justify-between bg-white rounded-lg px-4 py-2 max-w-xl w-full">
      <FaSearch id="pretraga-lokacija" className="ml-3 text-gray-600" />
      <input
        className="w-full text-left p-2"
        type="text"
        placeholder="Куцајте за претрагу"
      />
    </div>
  );
}
