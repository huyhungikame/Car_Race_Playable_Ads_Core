import { clamp01 } from "cc";

export class ScriptExtensions {
    static inverseLerp(a: number, b: number, value: number): number {
        if (a !== b) {
            return clamp01((value - a) / (b - a));
        } else {
            return 0;
        }
    }

    static easeOutCirc(x: number): number {
        return Math.sqrt(1 - Math.pow(x - 1, 2));
    }

    static easeOutQuad(x: number): number {
        return 1 - (1 - x) * (1 - x);
    }
}