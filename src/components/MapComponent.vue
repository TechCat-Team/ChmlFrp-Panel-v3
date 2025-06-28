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
            default: '100%',
        },
        height: {
            type: String,
            default: '500px',
        },
        markers: {
            type: Array as PropType<Marker[]>,
            default: () => [],
        },
    },
    setup(props) {
        const mapContainer = ref<HTMLDivElement | null>(null);

        const calculateCenterAndZoom = (points: [number, number][], map: TMap) => {
            const lngs = points.map((p) => p[0]);
            const lats = points.map((p) => p[1]);

            // 计算中心点
            const avgLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;
            const avgLat = (Math.min(...lats) + Math.max(...lats)) / 2;
            const center = new window.T.LngLat(avgLng, avgLat);

            // 计算两点之间的最大距离
            const point1 = new window.T.LngLat(Math.min(...lngs), Math.min(...lats));
            const point2 = new window.T.LngLat(Math.max(...lngs), Math.max(...lats));
            const distance = map.getDistance(point1, point2);

            let zoom = 13;
            if (distance > 2000 && distance <= 5000) zoom = 11;
            else if (distance > 5000 && distance <= 10000) zoom = 9;
            else if (distance > 10000 && distance <= 50000) zoom = 7;
            else if (distance > 50000 && distance <= 100000) zoom = 5;
            else if (distance > 100000) zoom = 4;

            return { center, zoom };
        };

        onMounted(() => {
            const script = document.createElement('script');
            script.src = 'https://api.tianditu.gov.cn/api?v=4.0&tk=27223d0a4fbccf8f071807d0050f465f';
            script.onload = () => {
                if (mapContainer.value && window.T) {
                    const map = new window.T.Map(mapContainer.value);

                    if (props.markers.length >= 2) {
                        const positions = props.markers.map((marker) => marker.position);
                        const { center, zoom } = calculateCenterAndZoom(positions, map);
                        map.centerAndZoom(center, zoom);
                    } else if (props.markers.length === 1) {
                        const center = new window.T.LngLat(props.markers[0].position[0], props.markers[0].position[1]);
                        map.centerAndZoom(center, 13);
                    } else {
                        const center = new window.T.LngLat(116.397428, 39.90923);
                        map.centerAndZoom(center, 13);
                    }

                    map.enableScrollWheelZoom(true);

                    // 添加标记
                    props.markers.forEach((markerData) => {
                        const point = new window.T.LngLat(markerData.position[0], markerData.position[1]);
                        const marker = new window.T.Marker(point);
                        map.addOverLay(marker);

                        if (markerData.title) {
                            const label = new window.T.Label({
                                position: point,
                                text: markerData.title,
                                offset: new window.T.Point(0, -20),
                            });
                            map.addOverLay(label);
                        }
                    });
                }
            };
            document.head.appendChild(script);
        });

        return {
            mapContainer,
        };
    },
});
</script>
