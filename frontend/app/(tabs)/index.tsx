import { useEffect, useState } from 'react';
import { useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
    View,
    Text,
    TouchableOpacity,
    Alert,
    FlatList,
    RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';

import { useTransactions } from '@/hooks/useTransactions';
import { useStreak } from '@/hooks/useStreak';
import { useAppTheme } from '@/components/ThemeProvider';

import { styles } from '@/assets/styles/home.styles';

import PageLoader from '@/components/PageLoader';
import { SignOutButton } from '@/components/SignOutButton';
import { BalanceCard } from '@/components/BalanceCard';
import { TransactionItem } from '@/components/TransactionItem';
import NoTransactionsFound from '@/components/NoTransactionsFound';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import Toast from 'react-native-toast-message';

export default function HomePage() {
    const router = useRouter();
    const { user } = useUser();
    const { theme } = useAppTheme();
    const { streak, getFlameColor } = useStreak();

    const {
        transactions,
        summary,
        isLoading,
        loadData,
        deleteTransaction,
    } = useTransactions(user?.id);

    const [refreshing, setRefreshing] = useState(false);

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [loadData])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    const handleDelete = (id: string) => {
        Alert.alert(
            'Delete Transaction',
            'Are you sure you want to delete this transaction?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => deleteTransaction(id),
                },
            ]
        );
    };

    if (isLoading && !refreshing) {
        return <PageLoader />;
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.content}>
                {/* Header */}
                <View style={styles.header}>
                    {/* Left Section */}
                    <View style={styles.headerLeft}>
                        <Ionicons
                            name="flame"
                            size={50}
                            color={getFlameColor()}
                            style={{ marginRight: 10 }}
                        />
                        <View style={styles.welcomeContainer}>
                            <Text style={[styles.welcomeText, { color: theme.text }]}>
                                Welcome,
                            </Text>
                            <Text style={[styles.usernameText, { color: theme.primary }]}>
                                {user?.emailAddresses[0]?.emailAddress.split('@')[0]}
                            </Text>
                        </View>
                    </View>

                    {/* Right Section */}
                    {/* <View style={styles.headerRight}>
                        <ThemeSwitcher />
                        <TouchableOpacity
                            style={[
                                styles.addButton,
                                { backgroundColor: theme.primary },
                            ]}
                            onPress={() => router.push('/create')}
                        >
                            <Ionicons name="add" size={20} color={theme.white} />
                            <Text style={[styles.addButtonText, { color: theme.white }]}>
                                Add
                            </Text>
                        </TouchableOpacity>
                        <SignOutButton />
                    </View> */}
                </View>

                {/* Balance Summary */}
                <BalanceCard summary={summary} />

                {/* Transactions Title */}
                <View style={styles.transactionsHeaderContainer}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>
                        Recent Transactions
                    </Text>
                </View>
            </View>

            {/* Transactions List */}
            <FlatList
                style={styles.transactionsList}
                contentContainerStyle={styles.transactionsListContent}
                data={transactions}
                renderItem={({ item }) => (
                    <TransactionItem item={item} onDelete={handleDelete} />
                )}
                ListEmptyComponent={<NoTransactionsFound />}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            />
        </View>
    );
}
