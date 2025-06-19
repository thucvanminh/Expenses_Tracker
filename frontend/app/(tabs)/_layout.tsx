import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { useUser } from '@clerk/clerk-expo';
import { Redirect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/components/ThemeProvider';

export default function TabLayout() {
    const { isSignedIn, isLoaded } = useUser();
    const { theme } = useAppTheme();

    if (!isLoaded) return null;
    if (!isSignedIn) return <Redirect href="/(auth)/sign-in" />;

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: theme.primary,
                headerShown: false,
                tabBarStyle: Platform.select({
                    ios: {
                        position: 'absolute',
                        backgroundColor: theme.background,
                        borderTopColor: theme.border,
                    },
                    default: {
                        backgroundColor: theme.background,
                        borderTopColor: theme.border,
                    },
                }),
                tabBarInactiveTintColor: theme.textLight,
            }}>
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color }) => <Ionicons name="home" size={28} color={color} />,
                }}
            />
            <Tabs.Screen
                name="create"
                options={{
                    title: 'Transaction',
                    tabBarIcon: ({ color }) => <Ionicons name="add-circle-outline" size={28} color={color} />,
                }}
            />
            <Tabs.Screen
                name="schedule"
                options={{
                    title: 'Schedule',
                    tabBarIcon: ({ color }) => <Ionicons name="calendar-outline" size={28} color={color} />,
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color }) => <Ionicons name="person-outline" size={28} color={color} />,
                }}
            />
        </Tabs>
    );
}