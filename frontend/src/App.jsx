import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';

const RootRedirect = () => {
  const searchParams = new URLSearchParams(window.location.search);
  const token = searchParams.get('token');
  const userId = searchParams.get('userId');
  const name = searchParams.get('name');

  if (token) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify({ name: name || 'Google User', _id: userId }));
  }

  return <Navigate to="/dashboard" replace />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
