// backend/controllers/schedulesController.js
// const db = require('../config/db.js'); // Your database connection
import {sql} from '../config/db.js';
// Create a new schedule with days
// export async function createSchedule(req, res) {
//     const client = await sql.connect();
//     try {
//         await client.query('BEGIN');
//
//         const { user_id, goal, startDate, endDate, name, savedStates } = req.body;
//         const scheduleResult = await client.query(
//             'INSERT INTO schedules (user_id, goal, start_date, end_date, name) VALUES ($1, $2, $3, $4, $5) RETURNING *',
//             [user_id, goal, startDate, endDate, name]
//         );
//         const schedule = scheduleResult.rows[0];
//
//         // Generate days
//         const days = [];
//         let dt = new Date(startDate);
//         const end = new Date(endDate);
//         let idx = 0;
//
//         while (dt <= end) {
//             const dayResult = await client.query(
//                 'INSERT INTO schedule_days (schedule_id, date, is_checked) VALUES ($1, $2, $3) RETURNING *',
//                 [schedule.id, dt.toISOString().slice(0, 10), savedStates ? !!savedStates[idx] : false]
//             );
//             days.push(dayResult.rows[0]);
//             dt.setDate(dt.getDate() + 1);
//             idx++;
//         }
//
//         await client.query('COMMIT');
//         res.status(201).json({ schedule, days });
//     } catch (err) {
//         await client.query('ROLLBACK');
//         console.error('Create schedule error:', err);
//         res.status(500).json({
//             error: 'Failed to create schedule',
//             details: err.message
//         });
//     } finally {
//         client.release();
//     }
// }
export async function createSchedule(req, res) {
    const client = await sql.connect();
    try {
        await client.query('BEGIN');

        const { user_id, goal, startDate, endDate, name, savedStates } = req.body;

        // Create schedule
        const scheduleResult = await client.query(
            'INSERT INTO schedules (user_id, goal, start_date, end_date, name) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [user_id, goal, startDate, endDate, name]
        );
        const schedule = scheduleResult.rows[0];

        // Create schedule_days
        const days = [];
        let currentDate = new Date(startDate);
        const end = new Date(endDate);
        let idx = 0;

        while (currentDate <= end) {
            const dayResult = await client.query(
                'INSERT INTO schedule_days (schedule_id, date, is_checked) VALUES ($1, $2, $3) RETURNING *',
                [schedule.id, currentDate.toISOString().split('T')[0], savedStates ? !!savedStates[idx] : false]
            );
            days.push(dayResult.rows[0]);
            currentDate.setDate(currentDate.getDate() + 1);
            idx++;
        }

        await client.query('COMMIT');
        res.status(201).json({
            ...schedule,
            days
        });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Create schedule error:', err);
        res.status(500).json({ error: 'Failed to create schedule' });
    } finally {
        client.release();
    }
}


// Get all schedules for a user
export async function getSchedules(req, res) {
    try {
        const { user_id } = req.params;
        const result = await sql.query(`
            SELECT s.*, 
                   json_agg(sd.* ORDER BY sd.date) as days
            FROM schedules s
            LEFT JOIN schedule_days sd ON s.id = sd.schedule_id
            WHERE s.user_id = $1
            GROUP BY s.id
            ORDER BY s.created_at DESC
        `, [user_id]);

        res.json(result.rows);
    } catch (err) {
        console.error('Get schedules error:', err);
        res.status(500).json({
            error: 'Failed to fetch schedules',
            details: err.message
        });
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


