import { BrowserRouter as Router, Route, Routes } from "react-router-dom"; // Use Routes instead of Switch
import Header from "./components/Header";
import Main from "./components/Main";
import RentingPage from "./components/RentingPage";
import SellingPage from "./components/SellingPage";
import HelpPage from "./components/HelpPage";
import LoginPage from "./components/LoginPage";
import RealEstateList from "./components/RealEstateList";
import BuyingPage from "./components/BuyingPage";
import CreateListingForm from "./components/CreateListingForm";

function App() {
  return (
    <>
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Main />} /> {/* Default route */}
        <Route path="/real-estates" element={<RealEstateList />} />
        <Route path="/rent" element={<RentingPage />} />
        <Route path="/sell" element={<SellingPage />} />
        <Route path="/help" element={<HelpPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/buy" element={<BuyingPage />} />
        <Route path="/createadd" element={<CreateListingForm />} />
      </Routes>
     </Router>
    </>
  );
}

export default App;
