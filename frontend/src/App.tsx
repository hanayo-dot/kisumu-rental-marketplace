import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import Register from './pages/Register';
import Login from './pages/Login';
import Search from './pages/Search';
import LandlordDashboard from './pages/LandlordDashboard';
import Landing from './pages/Landing';
import Profile from './pages/Profile';
import PropertyDetails from './pages/PropertyDetails';
import Favorites from './pages/Favorites';
import './index.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/search" element={<Search />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/property/:id" element={<PropertyDetails />} />
          <Route path="/landlord/dashboard" element={<LandlordDashboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
