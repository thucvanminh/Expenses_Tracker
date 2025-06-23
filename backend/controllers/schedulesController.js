// backend/controllers/schedulesController.js
// const db = require('../config/db.js'); // Your database connection
import {sql} from '../config/db.js';
// Create a new schedule with days
export async function createSchedule  (req, res)  {
    try {
        const { user_id, goal, startDate, endDate, name, savedStates } = req.body;
        // Insert into schedules
        const scheduleResult = await sql.query(
            'INSERT INTO schedules (user_id, goal, start_date, end_date, name) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [user_id, goal, startDate, endDate, name]
        );
        const schedule = scheduleResult.rows[0];

        // Insert days
        // Insert days
        const days = [];
        let dt = new Date(startDate);
        const end = new Date(endDate);
        let idx = 0;
        while (dt <= end) {
            days.push({
                date: dt.toISOString().slice(0, 10),
                is_checked: savedStates ? !!savedStates[idx] : false,
            });
            dt = new Date(dt); // clone date before increment
            dt.setDate(dt.getDate() + 1);
            idx++;
        }
        for (const d of days) {
            await sql.query(
                'INSERT INTO schedule_days (schedule_id, date, is_checked) VALUES ($1, $2, $3)',
                [schedule.id, d.date, d.is_checked]
            );
        }
        res.status(201).json({ schedule, days });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get all schedules for a user
export async function getSchedules(req, res) {
    try {
        const { user_id } = req.params;
        // Get schedules
        const schedules = await sql.query(
            'SELECT * FROM schedules WHERE user_id = $1 ORDER BY created_at DESC',
            [user_id]
        );

        // Get days for each schedule
        const result = [];
        for (const schedule of schedules.rows) {
            const days = await sql.query(
                'SELECT * FROM schedule_days WHERE schedule_id = $1 ORDER BY date',
                [schedule.id]
            );
            result.push({
                ...schedule,
                days: days.rows
            });
        }

        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// Get a schedule with its days
export async  function  getScheduleById  (req, res)  {
    try {
        const { id } = req.params;
        const schedule = await sql.query('SELECT * FROM schedules WHERE id = $1', [id]);
        const days = await sql.query('SELECT * FROM schedule_days WHERE schedule_id = $1 ORDER BY date', [id]);
        res.json({ schedule: schedule.rows[0], days: days.rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update a day's checked state
export async function  updateDay  (req, res)  {
    try {
        const { day_id } = req.params;
        const { is_checked } = req.body;
        await sql.query(
            'UPDATE schedule_days SET is_checked = $1 WHERE id = $2',
            [is_checked, day_id]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Delete a schedule (and its days)
export async  function  deleteSchedule  (req, res) {
    try {
        const { id } = req.params;
        await sql.query('DELETE FROM schedules WHERE id = $1', [id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


