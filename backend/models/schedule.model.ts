// models/schedule.model.ts

export interface Schedule {
    id?: number;
    user_id: string;
    goal: number;
    start_date: string;
    end_date: string;
    saved_at?: string;
    name?: string;
}

export interface ScheduleDay {
    id?: number;
    schedule_id: number;
    day: string;
    is_checked: boolean;
}
