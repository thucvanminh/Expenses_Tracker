import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useAppTheme } from './ThemeProvider';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/Colors';
import { styles } from '@/assets/styles/home.styles'
export const ThemeSwitcher = () => {
    const { toggleTheme, themeName, theme } = useAppTheme();

    return (
        <TouchableOpacity onPress={toggleTheme} style={[styles.themeButton, { borderColor: theme.border }]}>
            <Ionicons name="color-palette-outline" size={22} color={theme.text} />
        </TouchableOpacity>
    );
};