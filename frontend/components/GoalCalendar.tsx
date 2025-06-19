import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { styles } from '../assets/styles/home.styles';
import { useAppTheme } from './ThemeProvider';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

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
    const matrix = [];
    let week = new Array(7).fill(null);
    let firstDay = days[0].getDay(); // 0: Sun, 1: Mon, ...
    let startIdx = (firstDay + 6) % 7; // 0: Mon, 6: Sun
    let dayIdx = 0;
    for (let i = 0; i < 7; i++) {
        if (i < startIdx) week[i] = null;
        else week[i] = days[dayIdx++];
    }
    matrix.push(week);
    while (dayIdx < days.length) {
        week = new Array(7).fill(null);
        for (let i = 0; i < 7 && dayIdx < days.length; i++) {
            week[i] = days[dayIdx++];
        }
        matrix.push(week);
    }
    return matrix;
}

interface GoalCalendarProps {
    goal: number;
    startDate: Date;
    endDate: Date;
    savedStates?: boolean[];
    onSaveStates?: (states: boolean[]) => void;
}

const GoalCalendar: React.FC<GoalCalendarProps> = ({ goal, startDate, endDate, savedStates, onSaveStates }) => {
    const days = getDaysArray(startDate, endDate);
    const calendar = getCalendarMatrix(days);
    const { theme } = useAppTheme();
    const cellHeight = 100;

    const N = days.length;
    const T = goal;
    let a = Math.ceil((T / N * 0.1) / 1000) * 1000;
    let d = Math.ceil((T - N * a) / ((N - 1) * N / 2) / 1000) * 1000;
    let idealAmounts: number[] = [];
    for (let n = 0; n < N; n++) {
        idealAmounts.push(a + n * d);
    }
    let roundedAmounts = idealAmounts.map(x => Math.ceil(x / 1000) * 1000);
    let sum = roundedAmounts.reduce((acc, cur) => acc + cur, 0);
    let diff = sum - T;
    if (diff > 0) {
        let maxLoop = N * 2;
        let loopCount = 0;
        while (diff > 0 && loopCount < maxLoop) {
            let changed = false;
            for (let j = N - 1; j >= 0 && diff > 0; j--) {
                if (roundedAmounts[j] - 1000 >= Math.ceil(idealAmounts[j] / 1000) * 1000) {
                    roundedAmounts[j] -= 1000;
                    diff -= 1000;
                    changed = true;
                }
            }
            if (!changed) break;
            loopCount++;
        }
    }
    let dailyAmounts = roundedAmounts;
    const [saved, setSaved] = useState<boolean[]>(savedStates && savedStates.length === N ? savedStates : Array(N).fill(false));

    React.useEffect(() => {
        if (savedStates && savedStates.length === N) {
            setSaved(savedStates);
        }
    }, [savedStates, N]);

    const toggleSaved = (idx: number) => {
        setSaved((prev) => {
            const copy = [...prev];
            copy[idx] = !copy[idx];
            if (onSaveStates) onSaveStates(copy);
            return copy;
        });
    };

    const minAmount = Math.ceil(T / N / 1000) * 1000;
    const threshold = 5000;
    let runningTotal = 0;
    let finalAmounts: (number | null)[] = [];
    if (minAmount < threshold) {
        // Cho phép để trống các ô cuối
        for (let i = 0; i < dailyAmounts.length; i++) {
            if (runningTotal >= T) {
                finalAmounts.push(null);
            } else {
                let amount = dailyAmounts[i];
                if (runningTotal + amount > T) {
                    amount = T - runningTotal;
                }
                runningTotal += amount;
                finalAmounts.push(amount > 0 ? amount : null);
            }
        }
    } else {
        // Luôn phân bổ đều, không để trống ô
        finalAmounts = dailyAmounts;
    }

    return (
        <KeyboardAwareScrollView
            style={[styles.calendarWrap, { backgroundColor: theme.background, flex: 1 }]}
            contentContainerStyle={{ minHeight: calendar.length * cellHeight + 10 }}
        >
            <ScrollView horizontal>
                <View>
                    {/* Header */}
                    <View style={[styles.row, { backgroundColor: theme.background }]}>
                        {WEEK_DAYS.map((d) => (
                            <View style={[styles.headerCell, { backgroundColor: theme.primary }, { borderColor: theme.text }]} key={d}>
                                <Text style={[styles.headerText, { color: theme.white }]}>{d}</Text>
                            </View>
                        ))}
                    </View>
                    {/* Calendar Rows */}
                    {calendar.map((week, i) => (
                        <View style={[styles.row, { backgroundColor: theme.primary }, { borderColor: theme.border }]} key={i}>
                            {week.map((date, j) => {
                                if (!date) return <View style={[styles.cell, { backgroundColor: theme.background }, { borderColor: theme.text }]} key={j} />;
                                const idx = days.findIndex(
                                    (d) => d.toDateString() === date.toDateString()
                                );
                                const isSaved = saved[idx];
                                return (
                                    <TouchableOpacity
                                        style={[styles.cell, isSaved && styles.savedCell, { backgroundColor: theme.border }, { borderColor: theme.text }]}
                                        key={j}
                                        onPress={() => toggleSaved(idx)}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={[styles.dateText, { color: theme.text }]}>{date.getDate()}</Text>
                                        <Text style={[styles.amountText, { color: theme.primary }]}>
                                            {finalAmounts[idx] !== undefined && finalAmounts[idx] !== null ? finalAmounts[idx].toLocaleString() : ''}
                                        </Text>
                                        {isSaved && <Text style={[styles.checkMark, { color: theme.text }]}>✓</Text>}
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    ))}
                </View>
            </ScrollView>
        </KeyboardAwareScrollView>
    );
};

export default GoalCalendar;
