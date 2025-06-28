import { defineStore } from 'pinia';
import { useThemeStore } from '@/stores/theme';

export const useStyleStore = defineStore('style', {
    actions: {
        getCardStyle() {
            const themeStore = useThemeStore();
            const primaryColor = themeStore.primaryColor;
            const rgbaColor = this.colorToRgba(primaryColor, 0.15);
            return {
                backgroundColor: rgbaColor,
            };
        },
        colorToRgba(color: string, alpha: number): string {
            let r = 0,
                g = 0,
                b = 0;

            if (color.startsWith('#')) {
                if (color.length === 4) {
                    r = parseInt(color[1] + color[1], 16);
                    g = parseInt(color[2] + color[2], 16);
                    b = parseInt(color[3] + color[3], 16);
                } else if (color.length === 7) {
                    r = parseInt(color[1] + color[2], 16);
                    g = parseInt(color[3] + color[4], 16);
                    b = parseInt(color[5] + color[6], 16);
                } else if (color.length === 9) {
                    r = parseInt(color[1] + color[2], 16);
                    g = parseInt(color[3] + color[4], 16);
                    b = parseInt(color[5] + color[6], 16);
                }
            } else if (color.startsWith('rgb')) {
                const rgbValues = color.match(/\d+/g);
                if (rgbValues) {
                    r = parseInt(rgbValues[0], 10);
                    g = parseInt(rgbValues[1], 10);
                    b = parseInt(rgbValues[2], 10);
                }
            }

            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        },
        getTheme() {
            const themeStore = useThemeStore();
            return themeStore.theme;
        },
    },
});
