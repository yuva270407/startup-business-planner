const { DatabaseSync } = require("node:sqlite");
const db = new DatabaseSync("startup_business_planner.db");
const path = require("path");
db.exec(`
    CREATE TABLE IF NOT EXISTS business_plans (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        startup_name TEXT NOT NULL,
        idea TEXT NOT NULL,
        category TEXT NOT NULL,
        budget REAL NOT NULL,
        customers TEXT NOT NULL,
        business_plan TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`);

console.log("SQLite Database Connected Successfully");
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { GoogleGenAI } = require("@google/genai");

const app = express();
app.use(express.static(path.join(__dirname, "frontend")));
app.use(cors());
app.use(express.json());
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "frontend", "index.html"));
});
const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

app.post("/api/business-plan", async (req, res) => {

    try {

        const {
            startupName,
            idea,
            category,
            budget,
            customers
        } = req.body;

        if (!startupName || !idea || !category || !budget || !customers) {
            return res.status(400).json({
                message: "Please fill all the fields."
            });
        }

        const prompt = `
You are an expert startup business consultant.

Create a simple and practical business plan for the following startup.

Startup Name: ${startupName}
Business Idea: ${idea}
Business Category: ${category}
Available Budget: ₹${budget}
Target Customers: ${customers}

Provide the following:

1. Business Summary
2. Target Market
3. Customer Needs
4. Marketing Strategy
5. Revenue Model
6. Required Resources
7. Estimated Expenses
8. SWOT Analysis
9. Growth Strategy
10. Final Suggestions

Use simple English and clear headings.
`;

        const response = await ai.models.generateContent({
            model: "gemini-3.6-flash",
            contents: prompt
        });

        const businessPlan = response.text;
const insert = db.prepare(`
    INSERT INTO business_plans
    (startup_name, idea, category, budget, customers, business_plan)
    VALUES (?, ?, ?, ?, ?, ?)
`);

insert.run(
    startupName,
    idea,
    category,
    Number(budget),
    customers,
    businessPlan
);

console.log("Business plan saved to SQLite database.");
        res.json({
            startupName,
            category,
            budget,
            customers,
            businessPlan
        });

    } catch (error) {

        console.error("AI Error:", error);

        res.status(500).json({
            message: "Failed to generate business plan.",
            error: error.message
        });
    }
});
app.get("/api/business-plans", (req, res) => {
    try {
        const plans = db.prepare(`
            SELECT
                id,
                startup_name,
                category,
                budget,
                customers,
                business_plan,
                created_at
            FROM business_plans
            ORDER BY id DESC
        `).all();

        res.json(plans);

    } catch (error) {
        console.error("Database Error:", error);

        res.status(500).json({
            message: "Failed to load business plans."
        });
    }
});
const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});