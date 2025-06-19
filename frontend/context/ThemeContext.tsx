import React, { createContext, useContext, useState } from 'react';
import { THEMES } from '@/constants/Colors';

const ThemeContext = createContext({
    theme: THEMES.ocean,
    setThemeName: (name: keyof typeof THEMES) => { },
});

export const ThemeProvider = ({ children }) => {
    const [themeName, setThemeName] = useState<keyof typeof THEMES>('ocean');
    const theme = THEMES[themeName];

    return (
        <ThemeContext.Provider value={{ theme, setThemeName }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
