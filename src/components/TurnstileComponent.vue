<template>
    <div ref="turnstileContainer"></div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';

export default defineComponent({
    name: 'TurnstileComponent',
    props: {
        siteKey: {
            type: String,
            required: true,
        },
    },
    setup(props) {
        const turnstileContainer = ref<HTMLDivElement | null>(null);

        onMounted(() => {
            if (turnstileContainer.value) {
                (window as any).turnstile.render(turnstileContainer.value, {
                    sitekey: props.siteKey,
                    callback: (token: string) => {
                        console.log('Turnstile token:', token);
                    },
                });
            }
        });

        return {
            turnstileContainer,
        };
    },
});
</script>