import { BrowserRouter as Router, Route, Routes } from "react-router-dom"; // Use Routes instead of Switch
import Header from "./components/Header";
import Main from "./components/Main";
import IznamljivanjePage from "./components/IznamljivanjePage";
import ProdajaPage from "./components/ProdajaPage";
import PomocPage from "./components/PomocPage";
import PrijavaPage from "./components/PrijavaPage";
import RealEstateList from "./components/RealEstateList";

function App() {
  return (
    <>
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Main />} /> {/* Default route */}
        <Route path="/real-estates" element={<RealEstateList />} />
        <Route path="/iznamljivanje" element={<IznamljivanjePage />} />
        <Route path="/prodaja" element={<ProdajaPage />} />
        <Route path="/pomoc" element={<PomocPage />} />
        <Route path="/prijava" element={<PrijavaPage />} />
      </Routes>
     </Router>
    </>
  );
}

export default App;
