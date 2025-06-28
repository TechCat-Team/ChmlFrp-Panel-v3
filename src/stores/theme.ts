import { defineStore } from 'pinia';

interface ThemeState {
    theme: string;
    primaryColor: string;
    isAutoTheme: boolean;
    isRGBMode: boolean;
    isDialogBoxHairGlass: boolean;
}

const THEME_KEY = 'app-theme';
const PRIMARY_COLOR_KEY = 'app-primary-color';
const AUTO_THEME_KEY = 'app-auto-theme';
const RGB_MODE_KEY = 'app-rgb-mode';
const DBH_MODE_KEY = 'app-dialog-box-hair-glass';

export const useThemeStore = defineStore('theme', {
    state: (): ThemeState => ({
        theme: localStorage.getItem(THEME_KEY) || 'light',
        primaryColor: localStorage.getItem(PRIMARY_COLOR_KEY) || '#722ed1',
        isAutoTheme: localStorage.getItem(AUTO_THEME_KEY) === 'true' || localStorage.getItem(AUTO_THEME_KEY) === null,
        isRGBMode: localStorage.getItem(RGB_MODE_KEY) === 'true' || false,
        isDialogBoxHairGlass: localStorage.getItem(DBH_MODE_KEY) === 'true' || false,
    }),
    actions: {
        setTheme(theme: string) {
            this.theme = theme;
            localStorage.setItem(THEME_KEY, theme);
        },
        setPrimaryColor(color: string) {
            this.primaryColor = color;
            localStorage.setItem(PRIMARY_COLOR_KEY, color);
        },
        setAutoTheme(isAuto: boolean) {
            this.isAutoTheme = isAuto;
            localStorage.setItem(AUTO_THEME_KEY, isAuto.toString());
        },
        setRGBMode(isRGB: boolean) {
            this.isRGBMode = isRGB;
            localStorage.setItem(RGB_MODE_KEY, isRGB.toString());
        },
        setDialogBoxHairGlass(isDBH: boolean) {
            this.isDialogBoxHairGlass = isDBH;
            localStorage.setItem(DBH_MODE_KEY, isDBH.toString());
        },
    },
});
