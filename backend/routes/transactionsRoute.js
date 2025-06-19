import express from "express";
import {sql} from "../config/db.js";
import {getTransactionByUserId, createTransaction, deleteTransaction,getSummaryByUserId} from "../controllers/transactionsController.js";

const router = express.Router();
router.get("/", async (req, res) => {
    try {
        const transactions = await sql`SELECT *
                                       FROM transactions`;
        res.status(200).json(transactions);
        console.log(transactions)
    } catch (error) {
        console.log("Error fetching transactions:", error);
        res.status(500).json({message: "Internal server error"});
    }
});

router.get("/:userId", getTransactionByUserId);

router.post("/", createTransaction);

router.delete("/:id", deleteTransaction);
router.get("/summary/:userId",getSummaryByUserId);
/////////////////////////

export default router;
