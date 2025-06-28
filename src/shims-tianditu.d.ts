declare global {
    interface Window {
        T: {
            Map: new (container: HTMLElement) => TMap;
            LngLat: new (lng: number, lat: number) => LngLat;
            Marker: new (position: LngLat) => Marker;
            Label: new (options: { position: LngLat; text: string; offset: Point }) => Label;
            Point: new (x: number, y: number) => Point;
        };
        TMAP_SATELLITE_MAP: any;
        TMAP_NORMAL_MAP: any;
    }

    interface TMap {
        centerAndZoom: (lngLat: LngLat, zoom: number) => void;
        enableScrollWheelZoom: (enable: boolean) => void;
        addOverLay: (overlay: Marker | Label) => void;
        getDistance: (point1: LngLat, point2: LngLat) => number;
    }

    interface LngLat {
        lng: number;
        lat: number;
    }

    interface Marker {
        setPosition: (lngLat: LngLat) => void;
    }

    interface Label {
        setText: (text: string) => void;
        setPosition: (lngLat: LngLat) => void;
    }

    interface Point {
        x: number;
        y: number;
    }
}

export {};
