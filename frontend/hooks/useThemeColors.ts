import { useColorScheme } from 'react-native'
import { COLORS } from '@/constants/Colors'

export default function useThemeColors() {
    const scheme = useColorScheme()
    const isDark = scheme === 'dark'

    return {
        isDark,
        background: isDark ? COLORS.dark.background : COLORS.light.background,
        text: isDark ? COLORS.dark.text : COLORS.light.text,
        input: isDark ? COLORS.dark.input : COLORS.light.input,
        placeholder: isDark ? COLORS.dark.placeholder : COLORS.light.placeholder,
        card: isDark ? COLORS.dark.card : COLORS.light.card,
    }
}
