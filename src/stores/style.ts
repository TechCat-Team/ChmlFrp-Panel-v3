import { defineStore } from 'pinia';
import { useThemeStore } from '@/stores/theme';

export const useStyleStore = defineStore('style', {
  actions: {
    getCardStyle() {
      const themeStore = useThemeStore();
      const primaryColor = themeStore.primaryColor;
      const rgbaColor = this.hexToRgba(primaryColor, 0.15);
      return {
        backgroundColor: rgbaColor,
      };
    },
    hexToRgba(hex: string, alpha: number): string {
      let r = 0, g = 0, b = 0;

      if (hex.length === 4) {
        r = parseInt(hex[1] + hex[1], 16);
        g = parseInt(hex[2] + hex[2], 16);
        b = parseInt(hex[3] + hex[3], 16);
      } else if (hex.length === 7) {
        r = parseInt(hex[1] + hex[2], 16);
        g = parseInt(hex[3] + hex[4], 16);
        b = parseInt(hex[5] + hex[6], 16);
      } else if (hex.length === 9) {
        r = parseInt(hex[1] + hex[2], 16);
        g = parseInt(hex[3] + hex[4], 16);
        b = parseInt(hex[5] + hex[6], 16);
      }

      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    },
  },
});