// backend/routes/threatRoutes.js
import express from "express";
const router = express.Router();

// Example mock data
const mockThreats = [
  { id: 1, title: "Phishing Attack", level: "High", detectedAt: "2025-10-31" },
  { id: 2, title: "Malware Injection", level: "Medium", detectedAt: "2025-10-30" },
];

router.get("/feed", (req, res) => {
  res.json({ success: true, threats: mockThreats });
});

export default router;
