import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout/Layout";
import DashboardPage from "./pages/DashboardPage"; // העמוד שהתחלנו לבנות
import ScenariosPage from "./pages/ScenariosPage";
// RulesPage import removed because the file doesn't exist; provide a local placeholder
import ReportsPage from "./pages/ReportsPage";
import LoginPage from "./pages/LoginPage"; // נכין אותו ריק

const RulesPage: React.FC = () => {
  return <div>Rules Page (placeholder)</div>;
};

const App: React.FC = () => {
  // בגלל שאין לנו עדיין מנגנון Auth אמיתי, נניח שאנחנו תמיד מחוברים
  const isAuthenticated = true;

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <Router>
      <Layout>
        <Routes>
          {/* הראוט הראשי - הדשבורד */}
          <Route path="/" element={<DashboardPage />} />

          {/* ראוטים נוספים */}
          <Route path="/scenarios" element={<ScenariosPage />} />
          <Route path="/rules" element={<RulesPage />} />
          <Route path="/reports" element={<ReportsPage />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
