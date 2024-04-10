import { _decorator, CCFloat, clamp01, Component, lerp, Size, Vec3, view } from 'cc';
import { screen } from 'cc'
const { ccclass, property } = _decorator;

@ccclass('CanvasScaler')
export class CanvasScaler extends Component {
    public scaleFactor: number = 1;
    @property(CCFloat)
    matchWidthOrHeight: number = 0.5;
    private designSize: Size;
    private currentSize: Size;
    protected onLoad(): void {
        view.resizeWithBrowserSize(true);
        this.designSize = view.getDesignResolutionSize();
        this.currentSize = this.designSize.clone();
        this.updateCanvas();
    }
    protected lateUpdate(_dt: number): void {
        this.updateCanvas();
    }
    updateCanvas() : void {
        var windowSize = screen.windowSize;
        var changeWidth = Math.abs(this.currentSize.width - windowSize.width) > 1;
        var changeHeight = Math.abs(this.currentSize.height - windowSize.height) > 1;
        if (!changeWidth && !changeHeight) return;
        this.currentSize = windowSize.clone();
        this.node.setScale(Vec3.ONE.clone().multiplyScalar(this.handleScaleWithScreenSize()));
    }
    private handleScaleWithScreenSize(): number {
        this.scaleFactor = 1 / view.getScaleX();
        var kLogBase = 2;
        let logWidth = Math.log(this.currentSize.width / this.designSize.width) / Math.log(kLogBase);
        let logHeight = Math.log(this.currentSize.height / this.designSize.height) / Math.log(kLogBase);
        let logWeightedAverage = lerp(logWidth, logHeight, clamp01(this.matchWidthOrHeight));
        this.scaleFactor *= Math.pow(kLogBase, logWeightedAverage);
        return this.scaleFactor
    }

    caculatorScale(value: number): number{
        var kLogBase = 2;
        let logWidth = Math.log(this.currentSize.width / this.designSize.width) / Math.log(kLogBase);
        let logHeight = Math.log(this.currentSize.height / this.designSize.height) / Math.log(kLogBase);
        let logWeightedAverage = lerp(logWidth, logHeight, clamp01(value));
        return Math.pow(kLogBase, logWeightedAverage);
    }
}