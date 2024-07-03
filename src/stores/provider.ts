import { defineStore } from 'pinia'
import { ref } from 'vue'
import { LoadingBarApi } from 'naive-ui'

export const useProviderStore = defineStore('provider', () => {
    const loadingBar = ref<LoadingBarApi>()

    function setLoadingBar(b: LoadingBarApi) {
        loadingBar.value = b
    }

    return { loadingBar, setLoadingBar }
})