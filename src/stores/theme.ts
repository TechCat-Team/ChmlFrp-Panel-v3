import { defineStore } from 'pinia';

interface ThemeState {
  theme: string;
  primaryColor: string;
}

const THEME_KEY = 'app-theme';
const PRIMARY_COLOR_KEY = 'app-primary-color';

export const useThemeStore = defineStore('theme', {
  state: (): ThemeState => ({
    theme: localStorage.getItem(THEME_KEY) || 'light',
    primaryColor: localStorage.getItem(PRIMARY_COLOR_KEY) || '#722ed1',
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
  },
});
