<template>
    <div :style="{ width: width, height: height }" ref="mapContainer"></div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, PropType } from 'vue';

interface Marker {
    position: [number, number];
    title?: string;
}

export default defineComponent({
    name: 'MapComponent',
    props: {
        width: {
            type: String,
            default: '100%'
        },
        height: {
            type: String,
            default: '500px'
        },
        markers: {
            type: Array as PropType<Marker[]>,
            default: () => []
        }
    },
    setup(props) {
        const mapContainer = ref<HTMLDivElement | null>(null);

        onMounted(() => {
            const script = document.createElement('script');
            script.src = `https://api.tianditu.gov.cn/api?v=4.0&tk=27223d0a4fbccf8f071807d0050f465f`;
            script.onload = () => {
                if (mapContainer.value && window.T) {
                    const map = new window.T.Map(mapContainer.value);
                    const center = new window.T.LngLat(
                        props.markers.length > 0 ? props.markers[0].position[0] : 116.397428,
                        props.markers.length > 0 ? props.markers[0].position[1] : 39.90923
                    );
                    map.centerAndZoom(center, 13);
                    map.enableScrollWheelZoom(true);

                    // 添加标记
                    props.markers.forEach(markerData => {
                        const point = new window.T.LngLat(markerData.position[0], markerData.position[1]);
                        const marker = new window.T.Marker(point);
                        map.addOverLay(marker);

                        if (markerData.title) {
                            const label = new window.T.Label({
                                position: point,
                                text: markerData.title,
                                offset: new window.T.Point(0, -20) // 使用 Point 而不是 Pixel
                            });
                            map.addOverLay(label);
                        }
                    });
                }
            };
            document.head.appendChild(script);
        });

        return {
            mapContainer
        };
    }
});
</script>