import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useStreak = () => {
    const [streak, setStreak] = useState(0);

    useEffect(() => {
        const updateStreak = async () => {
            const today = new Date().toDateString();
            const lastActive = await AsyncStorage.getItem('lastActive');
            const storedStreak = await AsyncStorage.getItem('streak');

            if (lastActive !== today) {
                await AsyncStorage.setItem('lastActive', today);
                const nextStreak = (parseInt(storedStreak || '0') || 0) + 1;
                await AsyncStorage.setItem('streak', nextStreak.toString());
                setStreak(nextStreak);
            } else {
                setStreak(parseInt(storedStreak || '0') || 0);
            }
        };

        // updateStreak();
        setStreak(0)
    }, []);

    const getFlameColor = () => {
        if (streak >= 600) return '#003092'; // Xanh biển
        if (streak >= 500) return '#C5172E'; // Đỏ
        if (streak >= 400) return '#C562AF'; // Tím
        if (streak >= 300) return '#328E6E'; // Xanh lá
        if (streak >= 200) return '#FFD63A'; // Vàng
        if (streak >= 100) return '#EAEAEA'; // Bạc
        if (streak >= 50) return '#BF9264'; // Đồng
        return '#FFFFFF'; // Trắng
    };

    return { streak, getFlameColor };
};
