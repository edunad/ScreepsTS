'use strict';

declare global {
    interface Math {
        getRandom(min: number, max: number): number;
        clamp(value: number, min: number, max: number): number;
        toRad(value: number): number;
        toDeg(value: number): number;
        toGrid(grid: number, value: number): number;
        distance(start: [number, number], end: [number, number]): number;
    }
}

(Math as any).distance = (start: [number, number], end: [number, number]): number => {
    return Math.sqrt(Math.pow(end[0] - start[0], 2) + Math.pow(end[1] - start[1], 2));
};

(Math as any).getRandom = (min: number, max: number): number => {
    return Math.floor(Math.random() * (Math.floor(max) - Math.ceil(min) + 1)) + Math.ceil(min);
};

(Math as any).toGrid = (grid: number, value: number): number => {
    return grid * Math.round(value / grid);
};

(Math as any).clamp = (value: number, min: number, max: number): number => {
    return Math.min(max, Math.max(min, value));
};

(Math as any).toRad = (degrees: number): number => {
    return (degrees * Math.PI) / 180;
};

(Math as any).toDeg = (rad: number): number => {
    return (rad * 180) / Math.PI;
};

export {};
