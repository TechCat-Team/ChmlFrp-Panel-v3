import { defineStore } from 'pinia';

interface ThemeState {
    theme: string;
    primaryColor: string;
    isAutoTheme: boolean;
    isRGBMode: boolean;
    isDialogBoxHairGlass: boolean;
    backgroundImage: string;
    backgroundBlur: number;
    backgroundOpacity: number;
    colorBlindMode: boolean;
    highContrastMode: boolean;
}

const THEME_KEY = 'app-theme';
const PRIMARY_COLOR_KEY = 'app-primary-color';
const AUTO_THEME_KEY = 'app-auto-theme';
const RGB_MODE_KEY = 'app-rgb-mode';
const DBH_MODE_KEY = 'app-dialog-box-hair-glass';
const BACKGROUND_IMAGE_KEY = 'app-background-image';
const BACKGROUND_BLUR_KEY = 'app-background-blur';
const BACKGROUND_OPACITY_KEY = 'app-background-opacity';
const COLOR_BLIND_MODE_KEY = 'app-color-blind-mode';
const HIGH_CONTRAST_MODE_KEY = 'app-high-contrast-mode';

export const useThemeStore = defineStore('theme', {
    state: (): ThemeState => ({
        theme: localStorage.getItem(THEME_KEY) || 'light',
        primaryColor: localStorage.getItem(PRIMARY_COLOR_KEY) || '#722ed1',
        isAutoTheme: localStorage.getItem(AUTO_THEME_KEY) === 'true' || localStorage.getItem(AUTO_THEME_KEY) === null,
        isRGBMode: localStorage.getItem(RGB_MODE_KEY) === 'true' || false,
        isDialogBoxHairGlass: localStorage.getItem(DBH_MODE_KEY) === 'true' || false,
        backgroundImage: localStorage.getItem(BACKGROUND_IMAGE_KEY) || '',
        backgroundBlur: Number(localStorage.getItem(BACKGROUND_BLUR_KEY)) || 3,
        backgroundOpacity: (() => {
            const stored = localStorage.getItem(BACKGROUND_OPACITY_KEY);
            const num = stored ? Number(stored) : 100;
            return isNaN(num) ? 100 : num;
        })(),
        colorBlindMode: localStorage.getItem(COLOR_BLIND_MODE_KEY) === 'true' || false,
        highContrastMode: localStorage.getItem(HIGH_CONTRAST_MODE_KEY) === 'true' || false,
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
        setBackgroundImage(imageUrl: string) {
            this.backgroundImage = imageUrl;
            localStorage.setItem(BACKGROUND_IMAGE_KEY, imageUrl);
        },
        setBackgroundBlur(blur: number) {
            this.backgroundBlur = blur;
            localStorage.setItem(BACKGROUND_BLUR_KEY, blur.toString());
        },
        setBackgroundOpacity(opacity: number) {
            this.backgroundOpacity = opacity;
            localStorage.setItem(BACKGROUND_OPACITY_KEY, opacity.toString());
        },
        setColorBlindMode(enabled: boolean) {
            this.colorBlindMode = enabled;
            localStorage.setItem(COLOR_BLIND_MODE_KEY, enabled.toString());
        },
        setHighContrastMode(enabled: boolean) {
            this.highContrastMode = enabled;
            localStorage.setItem(HIGH_CONTRAST_MODE_KEY, enabled.toString());
        },
    },
});
