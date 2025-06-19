import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '@/assets/styles/home.styles';
import { COLORS } from '@/constants/Colors';
import { formatDate } from '@/lib/utils';
import { useAppTheme } from './ThemeProvider';

const CATEGORY_ICONS = {
    'Food & Drinks': 'fast-food',
    Shopping: 'cart',
    Transportation: 'car',
    Entertainment: 'film',
    Bills: 'receipt',
    Income: 'cash',
    Other: 'ellipsis-horizontal',
};

const getFormattedAmount = (amount: any, isIncome: boolean) => {
    const num = Number(amount);
    if (isNaN(num)) return '0.00';
    return `${isIncome ? '+' : '-'}${Math.abs(num) + ' VND'}`;
};

export const TransactionItem = ({ item, onDelete }) => {
    const isIncome = Number(item.amount) > 0;
    const iconName = CATEGORY_ICONS[item.category] || 'pricetag-outline';
    const { theme } = useAppTheme();

    return (
        <View style={[styles.transactionCard, { backgroundColor: theme.card }]} key={item.id}>
            <TouchableOpacity style={styles.transactionContent}>
                <View style={[styles.categoryIconContainer, { backgroundColor: theme.background }]}>
                    <Ionicons name={iconName} size={22} color={isIncome ? theme.income : theme.expense} />
                </View>
                <View style={styles.transactionLeft}>
                    <Text style={[styles.transactionTitle, { color: theme.text }]}>{item.title}</Text>
                    <Text style={[styles.transactionCategory, { color: theme.textLight }]}>{item.category}</Text>
                </View>
                <View style={styles.transactionRight}>
                    <Text style={[styles.transactionAmount, { color: isIncome ? theme.income : theme.expense }]}>
                        {getFormattedAmount(item.amount, isIncome)}
                    </Text>
                    <Text style={[styles.transactionDate, { color: theme.textLight }]}>
                        {formatDate(item.created_at)}
                    </Text>
                </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteButton} onPress={() => onDelete(item.id)}>
                <Ionicons name="trash-outline" size={20} color={theme.expense} />
            </TouchableOpacity>
        </View>
    );
};
