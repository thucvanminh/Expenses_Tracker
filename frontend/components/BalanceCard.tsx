import { View, Text } from 'react-native';
import { styles } from '@/assets/styles/home.styles';
import { COLORS } from '@/constants/Colors';
import { useAppTheme } from './ThemeProvider';

export const BalanceCard = ({ summary }) => {
    const { theme } = useAppTheme();
    return (
        <View style={[styles.balanceCard, { backgroundColor: theme.card }]}>
            <Text style={[styles.balanceTitle, { color: theme.text }]}>Total Balance</Text>
            <Text style={[styles.balanceAmount, { color: theme.primary }]}>
                {parseFloat(summary.balance) + " VND"}
            </Text>





            <View style={styles.balanceStats}>
                <View style={styles.balanceStatItem}>
                    <Text style={[styles.balanceStatLabel, { color: theme.textLight }]}>Income</Text>
                    <Text style={[styles.balanceStatAmount, { color: theme.income }]}>
                        +{parseFloat(summary.income) + " VND"}
                    </Text>
                </View>
                <View style={[styles.balanceStatItem, styles.statDivider, { borderColor: theme.border }]} />
                <View style={styles.balanceStatItem}>
                    <Text style={[styles.balanceStatLabel, { color: theme.textLight }]}>Expenses</Text>
                    <Text style={[styles.balanceStatAmount, { color: theme.expense }]}>
                        -{Math.abs(parseFloat(summary.expenses)) + " VND"}
                    </Text>
                </View>
            </View>
        </View>
    );
};
