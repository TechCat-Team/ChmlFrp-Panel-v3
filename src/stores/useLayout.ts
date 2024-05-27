import { defineStore } from 'pinia';

export const useLayoutStore = defineStore('layout', {
  state: () => ({
    collapsed: JSON.parse(localStorage.getItem('collapsed') || 'false')
  }),
  actions: {
    toggleCollapse() {
      this.collapsed = !this.collapsed;
      localStorage.setItem('collapsed', JSON.stringify(this.collapsed));
    },
    setCollapse(collapsed: boolean) {
      this.collapsed = collapsed;
      localStorage.setItem('collapsed', JSON.stringify(this.collapsed));
    }
  }
});