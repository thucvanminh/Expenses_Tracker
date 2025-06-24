import { sql } from "../config/db.js";

// Hàm tạo schedule
export const createSchedule = async (req, res) => {
    const { user_id, goal, start_date, end_date, savedStates, name } = req.body;
    try {
        // 1. Tạo schedule
        const result = await sql`
      INSERT INTO schedules (user_id, goal, start_date, end_date, name)
      VALUES (${user_id}, ${goal}, ${start_date}, ${end_date}, ${name})
      RETURNING id
    `;
        const schedule_id = result[0].id;

        // 2. Tạo schedule_days
        const start = new Date(start_date);
        const end = new Date(end_date);
        const days = [];
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            days.push(new Date(d));
        }

        const insertQueries = days.map((d, idx) => {
            const dayStr = d.toISOString().slice(0, 10);
            const checked = savedStates?.[idx] || false;
            return sql`
        INSERT INTO schedule_days (schedule_id, day, is_checked)
        VALUES (${schedule_id}, ${dayStr}, ${checked})
      `;
        });

        await Promise.all(insertQueries);

        res.status(201).json({ message: "Schedule saved", schedule_id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Hàm lấy chi tiết schedule theo ID
export const getScheduleDetails = async (req, res) => {
    const { id } = req.params;
    try {
        const schedule = await sql`
      SELECT * FROM schedules WHERE id = ${id}
    `;
        const days = await sql`
      SELECT * FROM schedule_days WHERE schedule_id = ${id} ORDER BY day
    `;
        res.json({ schedule: schedule[0], days });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch schedule" });
    }
};
