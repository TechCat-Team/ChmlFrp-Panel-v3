<template>
  <n-card size="small" :bordered="false" style="min-width: 200px;">
    <n-skeleton v-if="loading" text :repeat="3"/>
    <div v-else ref="recaptchaContainer" class="g-recaptcha" :data-sitekey="recaptchaSiteKey"></div>
  </n-card>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, nextTick } from 'vue';
import { NCard, NSkeleton } from 'naive-ui';
import { loadScript } from '@/utils/loadScript';

export default defineComponent({
  name: 'CaptchaComponent',
  components: { NCard, NSkeleton },
  emits: ['verified'],
  setup(_, { emit }) {
    const recaptchaContainer = ref<HTMLDivElement | null>(null);
    const loading = ref(true);

    // recaptcha验证SiteKey
    const recaptchaSiteKey = '6LcWcIYoAAAAAIChORGxbsSwUGhRs7waMwJ6RDqE';

    const onCaptchaVerified = (token: string) => {
      emit('verified', token);
    };

    onMounted(async () => {
      try {
        await loadScript('https://www.recaptcha.net/recaptcha/api.js');
        nextTick(() => {
          if (recaptchaContainer.value && window.grecaptcha) {
            window.grecaptcha.render(recaptchaContainer.value, {
              sitekey: recaptchaSiteKey,
              callback: onCaptchaVerified
            });
          } else {
            console.error('reCAPTCHA容器不可用或grecaptcha未加载。');
          }
        });
      } catch (error) {
        console.error('未能加载验证脚本:', error);
      } finally {
        loading.value = false;
      }
    });

    return {
      recaptchaContainer,
      recaptchaSiteKey,
      loading
    };
  }
});
</script>

<style scoped>
.g-recaptcha {
  display: inline-block;
}
</style>