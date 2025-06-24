import React, { useState } from 'react';
import {StyleSheet, Text, View, TextInput, Button, ScrollView, TouchableOpacity, Platform, Alert} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import GoalCalendar from '../../components/GoalCalendar';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { styles } from '../../assets/styles/create.styles';
import { useAppTheme } from '@/components/ThemeProvider';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUser } from '@clerk/clerk-expo';

import {API_URL} from "@/constants/api";

const WEEK_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function getDaysArray(start: Date, end: Date) {
    const arr = [];
    let dt = new Date(start);
    while (dt <= end) {
        arr.push(new Date(dt));
        dt.setDate(dt.getDate() + 1);
    }
    return arr;
}

function getCalendarMatrix(days: Date[]) {
    // Tạo ma trận tuần, mỗi tuần là 1 mảng 7 ngày
    const matrix = [];
    let week = new Array(7).fill(null);
    let firstDay = days[0].getDay(); // 0: Chủ nhật, 1: Thứ 2, ...
    let startIdx = (firstDay + 6) % 7; // Đưa về 0: Thứ 2, 6: Chủ nhật
    let dayIdx = 0;
    // Tuần đầu tiên
    for (let i = 0; i < 7; i++) {
        if (i < startIdx) week[i] = null;
        else {
            week[i] = days[dayIdx++];
        }
    }
    matrix.push(week);
    // Các tuần tiếp theo
    while (dayIdx < days.length) {
        week = new Array(7).fill(null);
        for (let i = 0; i < 7 && dayIdx < days.length; i++) {
            week[i] = days[dayIdx++];
        }
        matrix.push(week);
    }
    return matrix;
}

interface ScheduleHistory {
    goal: number;
    startDate: string;
    endDate: string;
    savedAt: string;
}

const Schedule = () => {
    const [goal, setGoal] = useState('');
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
    const [dateType, setDateType] = useState<'start' | 'end' | null>(null);
    const { theme } = useAppTheme();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [history, setHistory] = useState<ScheduleHistory[]>([]);
    const params = useLocalSearchParams();
    const savedStatesRef = React.useRef<boolean[] | null>(null);
    const { user } = useUser();
    const userId = user?.id;

    React.useEffect(() => {
        if (params.goal && params.startDate && params.endDate) {
            setGoal(params.goal as string);
            setStartDate(new Date(params.startDate as string));
            setEndDate(new Date(params.endDate as string));
        }
    }, [params.goal, params.startDate, params.endDate]);

    // const handleSaveSchedule = async () => {
    //     if (!goal || !startDate || !endDate) return;
    //     setIsLoading(true);
    //     try {
    //         let savedStates = savedStatesRef.current;
    //         const newSchedule = {
    //             goal: parseInt(goal),
    //             startDate: startDate.toISOString(),
    //             endDate: endDate.toISOString(),
    //             savedAt: new Date().toISOString(),
    //             savedStates,
    //         };
    //         // Lấy lịch sử cũ
    //         const history = await AsyncStorage.getItem('schedule_history');
    //         let arr = [];
    //         if (history) arr = JSON.parse(history);
    //         // Không lưu trùng
    //         const isDuplicate = arr.some((item: any) => item.goal === newSchedule.goal && item.startDate === newSchedule.startDate && item.endDate === newSchedule.endDate);
    //         if (!isDuplicate) {
    //             arr.unshift(newSchedule); // Lưu mới nhất lên đầu
    //             await AsyncStorage.setItem('schedule_history', JSON.stringify(arr));
    //         }
    //     } catch (e) {
    //         // Có thể show toast hoặc alert
    //     }
    //     setIsLoading(false);
    // };
    // const handleSaveSchedule = async () => {
    //     if (!goal || !startDate || !endDate || !userId) return;
    //     setIsLoading(true);
    //     try {
    //         let savedStates = savedStatesRef.current;
    //         const newSchedule = {
    //             user_id: userId,
    //             goal: parseInt(goal),
    //             startDate: startDate.toISOString(),
    //             endDate: endDate.toISOString(),
    //             savedStates,
    //             name: '', // hoặc lấy từ input nếu có
    //         };
    //         // Gửi lên backend
    //         const res = await fetch(`${API_URL}/schedules`, {
    //             method: 'POST',
    //             headers: { 'Content-Type': 'application/json' },
    //             body: JSON.stringify(newSchedule),
    //         });
    //         if (!res.ok) throw new Error('Failed to save schedule');
    //         // Xử lý kết quả nếu cần
    //     } catch (e) {
    //         // Hiển thị thông báo lỗi nếu cần
    //     }
    //     setIsLoading(false);
    // };

    const handleSaveSchedule = async () => {
        if (!goal || !startDate || !endDate || !userId) return;
        setIsLoading(true);
        try {
            const newSchedule = {
                user_id: userId,
                goal: parseInt(goal),
                startDate: startDate.toISOString().split('T')[0], // Format date to YYYY-MM-DD
                endDate: endDate.toISOString().split('T')[0],
                name: '', // Add name field if needed
                savedStates: savedStatesRef.current || []
            };

            const res = await fetch(`${API_URL}/schedules`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newSchedule)
            });

            if (!res.ok) throw new Error('Failed to save schedule');

            // Navigate back to profile after successful save
            router.back();
        } catch (error) {
            console.error('Save schedule error:', error);
            Alert.alert('Error', 'Failed to save schedule');
        } finally {
            setIsLoading(false);
        }
    };


    // Tính toán
    let days: Date[] = [];
    let calendar: Date[][] = [];
    let dailyAmount = 0;
    let accumAmounts: number[] = [];

    if (goal && startDate && endDate && endDate >= startDate) {
        days = getDaysArray(startDate, endDate);
        const totalDays = days.length;
        dailyAmount = Math.ceil(parseInt(goal) / totalDays / 1000) * 1000; // Làm tròn lên 1000đ
        let accum = 0;
        accumAmounts = days.map(() => (accum += dailyAmount));
        calendar = getCalendarMatrix(days);
    }

    return (
        <KeyboardAwareScrollView style={[styles.container, { backgroundColor: theme.background }]}>
            {/* HEADER */}
            <View style={[styles.header, { borderColor: theme.border }]}>
                <TouchableOpacity style={[styles.backButton, { borderColor: theme.border }]} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Saving Schedule</Text>
                <TouchableOpacity
                    style={[styles.saveButtonContainer, { borderColor: theme.border }, isLoading && styles.saveButtonDisabled]}
                    onPress={handleSaveSchedule}
                    disabled={isLoading}
                >
                    <Text style={[styles.saveButton, { color: theme.text }]}>{isLoading ? "Saving..." : "Save"}</Text>
                    {!isLoading && <Ionicons name="checkmark" size={18} color={theme.primary} />}
                </TouchableOpacity>
            </View>

            {/* SET GOAL */}
            <View style={styles.card}>

                <View style={[styles.inputContainer, { borderColor: theme.border }]}>
                    <TextInput
                        style={[styles.input, { color: theme.text }]}
                        keyboardType="numeric"
                        value={goal}
                        onChangeText={setGoal}
                        placeholder="Enter your saving goal"
                        placeholderTextColor={theme.text}
                    />
                    <Text style={[styles.currencySymbol, { color: theme.text }]}>VND</Text>
                </View>
                <View style={styles.typeSelector}>
                    <TouchableOpacity
                        style={[styles.inputContainer, { flex: 1, marginRight: 8 }, { borderColor: theme.border }]}
                        onPress={() => { setDateType('start'); setDatePickerVisibility(true); }}
                    >
                        <Text style={[styles.input, { color: theme.text }]}>
                            {startDate ? startDate.toLocaleDateString() : 'Start Date'}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.inputContainer, { flex: 1, marginLeft: 8 }, { borderColor: theme.border }]}
                        onPress={() => { setDateType('end'); setDatePickerVisibility(true); }}
                    >
                        <Text style={[styles.input, { color: theme.text }]}>
                            {endDate ? endDate.toLocaleDateString() : 'End Date'}
                        </Text>
                    </TouchableOpacity>
                </View>

            </View>
            <DateTimePickerModal
                isVisible={isDatePickerVisible}
                mode="date"
                date={dateType === 'start' ? (startDate || new Date()) : (endDate || new Date())}
                onConfirm={(date) => {
                    if (dateType === 'start') setStartDate(date);
                    else setEndDate(date);
                    setDatePickerVisibility(false);
                }}
                onCancel={() => setDatePickerVisibility(false)}
            />
            {goal && startDate && endDate && endDate >= startDate && (
                <View style={{ marginTop: 20 }}>
                    <GoalCalendar
                        goal={parseInt(goal)}
                        startDate={startDate}
                        endDate={endDate}
                        savedStates={params.savedStates ? JSON.parse(params.savedStates as string) : undefined}
                        onSaveStates={(states: boolean[]) => {
                            savedStatesRef.current = states;
                        }}
                    />
                </View>
            )}
        </KeyboardAwareScrollView>
    );
};

export default Schedule;
