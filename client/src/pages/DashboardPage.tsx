// src/pages/DashboardPage.tsx

import React from "react";
import { useDashboardSimulation } from "../hooks/useDashboardSimulation";
import { DashboardView } from "../components/dashboard/DashboardView";

const DashboardPage: React.FC = () => {
  // 1. קורא למוח ומקבל את הנתונים (הלוגיקה)
  const { data, isProtected, setIsProtected } = useDashboardSimulation();

  // 2. מעביר את הנתונים לפנים (ה-View)
  return (
    <DashboardView
      data={data}
      isProtected={isProtected}
      setIsProtected={setIsProtected}
    />
  );
};

export default DashboardPage;
