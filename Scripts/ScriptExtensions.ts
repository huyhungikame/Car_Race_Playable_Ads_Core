import { clamp01 } from "cc";

export class ScriptExtensions {
    static inverseLerp(a: number, b: number, value: number): number {
        if (a !== b) {
            return clamp01((value - a) / (b - a));
        } else {
            return 0;
        }
    }
}