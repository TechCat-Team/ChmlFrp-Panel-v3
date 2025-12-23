import { ref } from 'vue';
import axios from 'axios';
import type { Marker, NodeDetails } from '../types';
import { DEFAULT_MARKERS, IP_API_URL, IP_API_TIMEOUT } from '../constants';

export function useNodeMap() {
    const loadingNodeMap = ref(true);
    const markers = ref<Marker[]>([
        { position: [...DEFAULT_MARKERS[0].position], title: DEFAULT_MARKERS[0].title },
        { position: [...DEFAULT_MARKERS[1].position], title: DEFAULT_MARKERS[1].title },
    ]);

    const fetchLocalAddr = async (nodeDetails: NodeDetails | undefined) => {
        loadingNodeMap.value = true;
        try {
            const response = await axios.get(IP_API_URL, { timeout: IP_API_TIMEOUT });
            const { latitude, longitude } = response.data;
            markers.value[0] = { position: [longitude, latitude], title: '我的位置' };

            if (nodeDetails?.coordinates) {
                const nodeCoordinates = nodeDetails.coordinates.split(',').map(Number);
                if (nodeCoordinates.length === 2 && !isNaN(nodeCoordinates[0]) && !isNaN(nodeCoordinates[1])) {
                    markers.value[1] = { position: nodeCoordinates, title: '节点位置' };
                } else {
                    console.error('节点位置无效');
                }
            }
        } catch (error) {
            console.error('获取位置失败:', error);
        } finally {
            loadingNodeMap.value = false;
        }
    };

    return {
        loadingNodeMap,
        markers,
        fetchLocalAddr,
    };
}
