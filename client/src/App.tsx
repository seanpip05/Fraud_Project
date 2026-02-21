import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
// import DashboardPage from "./pages/DashboardPage";
import ScenariosPage from "./pages/ScenariosPage";
import ReportsPage from "./pages/ReportsPage";
import RulesPage from "./pages/RulesPage";
import { LoginPage } from "./pages/LoginPage";
import { useAuth } from "./context/AuthContext";
import { VictimMonitorView as VictimDashboard } from './components/dashboard/VictimMonitorView';

const App: React.FC = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <Router>
      <Layout>
        <Routes>
          {/* הראוט הראשי - הדשבורד */}
          <Route path="/" element={<VictimDashboard />} />

          {/* ראוטים נוספים */}
          <Route path="/rules" element={<RulesPage />} />
          <Route path="/scenarios" element={<ScenariosPage />} />
          <Route path="/reports" element={<ReportsPage />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
