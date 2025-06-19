import { createContext, useContext, useState, ReactNode } from 'react';
import { THEMES } from '@/constants/Colors';

type ThemeName = keyof typeof THEMES;
type Theme = typeof THEMES[ThemeName];

type ThemeContextType = {
    theme: Theme;
    themeName: ThemeName;
    toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType>({
    theme: THEMES.ocean,
    themeName: 'ocean',
    toggleTheme: () => { },
});

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    const themeNames = Object.keys(THEMES) as ThemeName[];
    const [themeIndex, setThemeIndex] = useState(0);

    const toggleTheme = () => {
        setThemeIndex((prev) => (prev + 1) % themeNames.length);
    };

    const themeName = themeNames[themeIndex];
    const theme = THEMES[themeName];

    return (
        <ThemeContext.Provider value={{ theme, themeName, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useAppTheme = () => useContext(ThemeContext);
