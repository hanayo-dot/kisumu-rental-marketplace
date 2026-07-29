import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import Register from './pages/Register';
import Login from './pages/Login';
import Search from './pages/Search';
import LandlordDashboard from './pages/LandlordDashboard';
import './index.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/search" element={<Search />} />
          <Route path="/landlord/dashboard" element={<LandlordDashboard />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
