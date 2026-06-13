// client/src/App.jsx
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Dashboard from "./components/Dashboard.jsx";
import Pipeline from "./components/Pipeline.jsx";
import Contacts from "./components/Contacts.jsx";
import Campaigns from "./components/Campaigns.jsx";
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <aside className="sidebar">
          <div className="logo">SalesSphere AI</div>
          <nav className="nav-links">
            <Link to="/" className="nav-item">Dashboard</Link>
            <Link to="/pipeline" className="nav-item">Pipeline</Link>
            <Link to="/contacts" className="nav-item">Contacts</Link> 
            <Link to="/campaigns" className="nav-item">Campaigns</Link>
          </nav>
        </aside>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/pipeline" element={<Pipeline />} />
            <Route path="/contacts" element={<Contacts />} />
            <Route path="/campaigns" element={<Campaigns />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
export default App;