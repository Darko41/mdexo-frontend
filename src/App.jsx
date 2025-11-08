import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import CreateListingForm from "./components/CreateListingForm";
import Header from "./components/Header/Header";
import Main from "./components/Main";
import { RealEstateList } from "./components/real-estate";
import RentingPage from "./pages/RentingPage";
import SellingPage from "./pages/SellingPage";
import HelpPage from "./pages/HelpPage";
import LoginPage from "./pages/LoginPage";
import BuyingPage from "./pages/BuyingPage";
import SearchResultsPage from "./pages/SearchResultsPage";
import PropertyDetailsPage from "./pages/PropertyDetailsPage";
import SignUpPage from "./pages/SignUpPage/SignUpPage";
import ProtectedRoute from './components/ProtectedRoute';
import ProfilePage from "./pages/ProfilePage/ProfilePage";
import UserRoleManagement from "./components/Admin/UserRoleManagement";
import AgencyDirectoryPage from "./components/Agency/AgencyDirectoryPage";
import AgencyProfilePage from "./components/Agency/AgencyProfilePage";
import CreateAgencyPage from "./components/Agency/CreateAgencyPage";
import AgencyManagementDashboard from "./components/Agency/AgencyManagementDashboard";
import AdminDashboard from "./components/Admin/AdminDashboard";
import Footer from "./components/Footer/Footer";
import './styles/globals.css'; // Make sure this is imported

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container"> {/* Added wrapper div */}
          <Header />
          <main className="main-content"> {/* Changed from min-h-screen */}
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Main />} />
              <Route path="/real-estates" element={<RealEstateList />} />
              <Route path="/rent" element={<RentingPage />} />
              <Route path="/sell" element={<SellingPage />} />
              <Route path="/help" element={<HelpPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/buy" element={<BuyingPage />} />
              <Route path="/search" element={<SearchResultsPage />} />
              <Route path="/property/:id" element={<PropertyDetailsPage />} />
              <Route path="/signup" element={<SignUpPage />} />
              <Route path="/agencies" element={<AgencyDirectoryPage />} />
              <Route path="/agencies/:id" element={<AgencyProfilePage />} />

              {/* Protected Routes - Require Authentication */}
              <Route 
                path="/create-listing" 
                element={
                  <ProtectedRoute>
                    <CreateListingForm />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                } 
              />

              {/* Admin Protected Routes - Require ADMIN Role */}
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute requiredRole="ROLE_ADMIN">
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/admin/users" 
                element={
                  <ProtectedRoute requiredRole="ROLE_ADMIN">
                    <UserRoleManagement />
                  </ProtectedRoute>
                } 
              />

              {/* Agency Management Protected Routes */}
              <Route 
                path="/agencies/create" 
                element={
                  <ProtectedRoute requiredRole="ROLE_AGENCY_ADMIN">
                    <CreateAgencyPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/agencies/:id/manage" 
                element={
                  <ProtectedRoute requiredRole="ROLE_AGENCY_ADMIN">
                    <AgencyManagementDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/agencies/:id/manage/*" 
                element={
                  <ProtectedRoute requiredRole="ROLE_AGENCY_ADMIN">
                    <AgencyManagementDashboard />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;