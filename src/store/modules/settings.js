import { defineStore } from 'pinia'
const storageSetting = JSON.parse(localStorage.getItem('layout-setting')) || ''
export const useSettingsStore = defineStore('settings', {
  state: () => ({
    sideTheme: 'dark',
    showLogo: true,
    theme: storageSetting.theme || '#d52b31',
  }),
  actions: {
    toggleTheme() {
      this.sideTheme = this.sideTheme === 'light' ? 'dark' : 'light'
    },
    toggleLogo() {
      this.showLogo = !this.showLogo
    },
  },
})
