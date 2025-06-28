<template>
    <div ref="viewerContainer" style="width: 100%; height: 300px; position: relative">
        <canvas ref="viewerCanvas" style="width: 100%; height: 100%"></canvas>
        <div v-if="playerName" class="player-name">
            {{ playerName }}
        </div>
    </div>
</template>

<script lang="ts">
import { SkinViewer, WalkingAnimation } from 'skinview3d';

export default defineComponent({
    name: 'MinecraftSkinViewer',
    props: {
        skinUrl: {
            type: String,
            required: true,
        },
        capeUrl: {
            type: String,
            required: false,
        },
        playerName: {
            type: String,
            required: false,
        },
    },
    setup(props) {
        const viewerContainer = ref<HTMLDivElement | null>(null);
        const viewerCanvas = ref<HTMLCanvasElement | null>(null);

        onMounted(() => {
            if (viewerContainer.value && viewerCanvas.value) {
                const viewer = new SkinViewer({
                    canvas: viewerCanvas.value,
                    width: viewerContainer.value.clientWidth,
                    height: viewerContainer.value.clientHeight,
                });

                window.addEventListener('resize', () => {
                    if (viewerContainer.value) {
                        viewer.width = viewerContainer.value.clientWidth;
                        viewer.height = viewerContainer.value.clientHeight;
                    }
                });

                viewer.loadSkin(props.skinUrl);

                if (props.capeUrl) {
                    viewer.loadCape(props.capeUrl);
                }

                const animation = new WalkingAnimation();
                viewer.animation = animation;
            }
        });

        return {
            viewerContainer,
            viewerCanvas,
        };
    },
});
</script>

<style scoped>
.player-name {
    position: absolute;
    top: 10px;
    left: 50%;
    transform: translateX(-50%);
    color: white;
    background-color: rgba(0, 0, 0, 0.3);
    padding: 5px 10px;
    border-radius: 5px;
}
</style>
