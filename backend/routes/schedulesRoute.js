// backend/routes/schedulesRoute.js
import express from "express";
const router = express.Router();
import * as schedulesController from "../controllers/schedulesController.js";

// Create schedule
router.post('/', schedulesController.createSchedule);

// Get all schedules for a user
router.get('/', schedulesController.getSchedules);

// Get a schedule by id (with days)
router.get('/:id', schedulesController.getScheduleById);

// Update a day's checked state
router.put('/day/:day_id', schedulesController.updateDay);

// Delete a schedule
router.delete('/:id', schedulesController.deleteSchedule);

export default router;
