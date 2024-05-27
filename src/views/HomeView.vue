<template>
  <n-space vertical size="large" style="height: 100%;">
    <n-layout style="height: 100%;">
      <n-layout-header bordered>
        <HeaderComponent/>
      </n-layout-header>
      <n-layout has-sider>
        <n-layout-sider
          bordered 
          collapse-mode="width"
          :collapsed-width="64"
          :width="240"
          :collapsed="collapsed"
          show-trigger
          @collapse="handleCollapse"
          @expand="handleExpand"
          :native-scrollbar="false"
          style="height: 92vh"
        >
          <MenuComponent/>
        </n-layout-sider>
        <n-layout-content content-style="padding: 24px;" :native-scrollbar="false">
          <router-view></router-view>
        </n-layout-content>
      </n-layout>
    </n-layout>
  </n-space>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { useLayoutStore } from '@/stores/useLayout';
import MenuComponent from '@/components/MenuComponent.vue';
import HeaderComponent from '@/components/HeaderComponent.vue';

export default defineComponent({
  components: {
    MenuComponent,
    HeaderComponent
  },
  setup() {
    const layoutStore = useLayoutStore();
    const collapsed = computed(() => layoutStore.collapsed);

    const handleCollapse = () => {
      layoutStore.setCollapse(true);
    };

    const handleExpand = () => {
      layoutStore.setCollapse(false);
    };

    return {
      collapsed,
      handleCollapse,
      handleExpand,
    };
  }
});
</script>

<style lang="scss">
span {
  transition: color 0.3s;
}
</style>