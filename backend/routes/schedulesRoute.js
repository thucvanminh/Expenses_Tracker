import express from 'express';
import { createSchedule, getScheduleDetails, getSchedulesByUser } from '../controllers/schedulesController.js';

const router = express.Router();

router.post('/', createSchedule); // Tạo schedule mới
router.get('/:id', getScheduleDetails); // Lấy chi tiết schedule theo ID
router.get('/', getSchedulesByUser);


export default router;
