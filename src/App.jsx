import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import CreateListingForm from "./components/CreateListingForm";
import Header from "./components/Header";
import Main from "./components/Main";
import RealEstateList from "./components/RealEstateList";
import RentingPage from "./pages/RentingPage";
import SellingPage from "./pages/SellingPage";
import HelpPage from "./pages/HelpPage";
import LoginPage from "./pages/LoginPage";
import BuyingPage from "./pages/BuyingPage";
import SearchResultsPage from "./pages/SearchResultsPage";
import PropertyDetailsPage from "./pages/PropertyDetailsPage";
import SignUpPage from "./pages/SignUpPage";

function App() {
  return (
    <Router>
      <Header />
      <main className="min-h-screen">
        <Routes>
          <Route path="/" element={<Main />} />
          <Route path="/real-estates" element={<RealEstateList />} />
          <Route path="/rent" element={<RentingPage />} />
          <Route path="/sell" element={<SellingPage />} />
          <Route path="/help" element={<HelpPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/buy" element={<BuyingPage />} />
          <Route path="/create-listing" element={<CreateListingForm />} />
          <Route path="/search" element={<SearchResultsPage />} />
		  <Route path="/properties/:id" element={<PropertyDetailsPage />} />
		  <Route path="/signup" element={<SignUpPage />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;