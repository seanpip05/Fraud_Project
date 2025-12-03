import React from "react";
import { Box, Typography } from "@mui/material";
import { useScenarioBuilder } from "../hooks/useScenarioBuilder";
import type { AttackTypeKey } from "../hooks/useScenarioBuilder";
import { ScenarioForm } from "../components/scenarios/ScenarioForm";
import { ScenariosList } from "../components/scenarios/ScenariosList";

// מבנה נתונים חדש להסברים מפורטים (לפי סוג התקיפה)
// מכיל הסבר כללי ופירוט לכל Input
const DETAILED_EXPLANATIONS: Record<
  AttackTypeKey,
  { general: string; inputs: { label: string; description: string }[] }
> = {
  "Brute Force": {
    general:
      "ניסיון ניחוש סיסמה של משתמש על ידי ניסוי וטעייה. הגנה נדרשת: Rate Limiting, Lockout Policy.",
    inputs: [
      {
        label: "Requests per Second (RPS)",
        description:
          "המהירות שבה התוקף מנסה סיסמאות. ככל שמהיר יותר, כך קל יותר לזהות הצפה.",
      },
      {
        label: "Total Attempts",
        description:
          "סך כל ניסיונות הכניסה שהסימולציה תבצע. בדיקה לאפקטיביות מדיניות נעילת משתמש.",
      },
    ],
  },
  "SQL Injection": {
    general:
      "הזרקת קוד SQL זדוני לתוך שדה קלט, שמטרתו לעקוף כניסה או לשלוף נתונים מה-DB.",
    inputs: [
      {
        label: "SQL Payload",
        description:
          "הקוד הזדוני המוזרק (כמו ' OR 1=1 --) שאמור לשנות את השאילתה המקורית של השרת.",
      },
      {
        label: "Target Field (Entry Point)",
        description:
          "שם שדה הקלט אליו מוזרק הקוד. זה מדמה איזה חלק ב-Form התוקף משנה.",
      },
    ],
  },
  Tampering: {
    general:
      "שינוי פרמטרים עסקיים בבקשה שנשלחת לשרת, לרוב עקב חוסר אימות בצד השרת (Server-Side Validation).",
    inputs: [
      {
        label: "Target API Endpoint",
        description:
          "נקודת הקצה שאליה נשלחת הבקשה המזוייפת (לדוגמה: /api/checkout).",
      },
      {
        label: "Parameter Key to Tamper",
        description: 'המפתח (Key) של הנתון אותו רוצים לשנות (לדוגמה: "price").',
      },
      {
        label: "New Value",
        description:
          'הערך הזדוני שאותו מנסים להכניס במקום הערך הלגיטימי (לדוגמה: "0.01").',
      },
    ],
  },
  XSS: {
    general:
      "הזרקת קוד JavaScript לדף אינטרנט כדי שירוץ בדפדפן של משתמש אחר ויגנוב מידע (למשל: קוקיז).",
    inputs: [
      {
        label: "XSS Payload (JS)",
        description:
          "קוד ה-JS שהתוקף רוצה להריץ בדפדפן הקורבן (לדוגמה: <script>document.location='...'</script>).",
      },
      {
        label: "Context Type",
        description:
          "איזה שדה קלט באתר הוא נקודת הפגיעות (שם משתמש, תגובה, תיאור מוצר וכו').",
      },
    ],
  },
  "Logic Flaw": {
    general:
      "ניצול כשל באופן שבו המערכת פועלת (התהליך העסקי), כגון שימוש חוזר בפונקציית קופון או צבירת נקודות אינסופית.",
    inputs: [
      {
        label: "Target Function Endpoint",
        description:
          "נקודת הקצה המבצעת את הפעולה העסקית הרגישה (לדוגמה: /api/redeem-coupon).",
      },
      {
        label: "Requests per Second (Rate)",
        description:
          "מהירות ביצוע הפעולה הרגישה. השרת צריך להגביל קצב זה (Transaction Rate Limiting).",
      },
    ],
  },
};

const ScenariosPage: React.FC = () => {
  const {
    scenarios,
    selectedAttackType,
    scenarioName,
    formParams,
    isSaving,
    setScenarioName,
    setFormParams,
    handleTabChange,
    handleSaveScenario,
  } = useScenarioBuilder();

  // נתונים להסבר דינמי (משמשים בתוך הטופס עצמו להציג ב-Tooltip ליד הכותרת)
  const currentExplanation = DETAILED_EXPLANATIONS[selectedAttackType];

  return (
    <Box sx={{ p: 4 }}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{ color: "text.primary", fontWeight: "bold" }}
      >
        ⚔️ Attack Scenarios Setup
      </Typography>
      <Typography
        variant="body1"
        gutterBottom
        color="text.secondary"
        sx={{ mb: 3 }}
      >
        Define the threat. Configure the parameters of your simulated attack.
      </Typography>

      {/* רכיב הטופס (מציג את הכותרת והאייקון בתוכו כדי למנוע כפילות) */}
      <ScenarioForm
        selectedAttackType={selectedAttackType}
        scenarioName={scenarioName}
        formParams={formParams}
        isSaving={isSaving}
        setScenarioName={setScenarioName}
        setFormParams={setFormParams}
        handleTabChange={handleTabChange}
        handleSave={handleSaveScenario}
      />

      {/* כותרת לרשימה */}
      <Typography
        variant="h5"
        gutterBottom
        sx={{ color: "text.primary", mt: 4, mb: 2, fontWeight: "bold" }}
      >
        Existing Scenarios
      </Typography>

      {/* רכיב הרשימה */}
      <ScenariosList scenarios={scenarios} />
    </Box>
  );
};

export default ScenariosPage;
