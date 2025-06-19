import { Ionicons } from '@expo/vector-icons';
import { styles } from '@/assets/styles/home.styles';
import { COLORS } from '@/constants/Colors';
import { useRouter } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';
import { useAppTheme } from './ThemeProvider';

const NoTransactionsFound = () => {
    const router = useRouter();
    const { theme } = useAppTheme();

    return (
        <View style={[styles.emptyState, { backgroundColor: theme.primaryLight }]}>
            <Ionicons
                style={styles.emptyStateIcon}
                name="receipt-outline"
                size={60}
                color={theme.textLight}
            />
            <Text style={[styles.emptyStateTitle, { color: theme.text }]}>No transactions yet.</Text>
            <Text style={[styles.emptyStateText, { color: theme.textLight }]}>
                Start tracking your finances by adding your first transaction.
            </Text>
            {/* <TouchableOpacity style={[styles.emptyStateButton, { backgroundColor: theme.primary }]} onPress={() => router.push("/create")}>
                <Ionicons name="add-circle" size={18} color={theme.white} />
                <Text style={[styles.emptyStateButtonText, { color: theme.white }]}>Add Transaction</Text>
            </TouchableOpacity> */}
        </View>
    );
};

export default NoTransactionsFound;
