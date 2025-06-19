import express from "express";
import {sql} from "../config/db.js";
const router = express.Router();

router.post("/", async (req, res) => {
    const { profile_id, username } = req.body;
    console.log("REQ BODY:", req.body); // 🧪 LOG 1

    if (!profile_id || !username) {
        console.log("MISSING DATA"); // 🧪 LOG 2
        return res.status(400).json({ error: "Missing profile_id or username" });
    }

    try {
        const result = await sql`
            INSERT INTO profiles (profile_id, custom_startmonth, username)
            VALUES (${profile_id}, 1, ${username})
                RETURNING *`;
        console.log("PROFILE CREATED:", result[0]); // 🧪 LOG 3
        res.status(201).json(result[0]);
    } catch (err) {
        console.error("Error creating profile:", err); // 🧪 LOG 4
        res.status(500).json({ error: "Failed to create profile" });
    }
});

router.get("/", (req, res) => {
    res.json({ message: "Profiles API is working" });
});

export default router;
