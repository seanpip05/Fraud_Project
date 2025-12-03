import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import DashboardPage from "./pages/DashboardPage"; // העמוד שהתחלנו לבנות
import ScenariosPage from "./pages/ScenariosPage";
import ReportsPage from "./pages/ReportsPage";
import RulesPage from "./pages/RulesPage";
import LoginPage from "./pages/LoginPage"; // נכין אותו ריק

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
          <Route path="/rules" element={<RulesPage />} />
          <Route path="/scenarios" element={<ScenariosPage />} />
          <Route path="/reports" element={<ReportsPage />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
