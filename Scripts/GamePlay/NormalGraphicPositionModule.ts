import { _decorator, clamp, Component, Node, Vec3 } from 'cc';
import { BaseGraphicCarPositionModule } from './BaseGraphicCarPositionModule';
import MapSplineManager from './MapSplineManager';
const { ccclass, property } = _decorator;

@ccclass('NormalGraphicPositionModule')
export class NormalGraphicPositionModule extends BaseGraphicCarPositionModule {
    updateCarGraphic(dt: number): void {
        var roadPoint = MapSplineManager.current.roadPoints[this.movement.currentIndex];
        var roadLateral = MapSplineManager.current.roadLaterals[roadPoint.lateralIndex];
        var offset = roadLateral.maxOffset;
        this.graphicLocalPosition.x = clamp(this.graphicLocalPosition.x, -offset, offset);
        Vec3.lerp(this.positionGraphic.position,this.graphicLocalPosition, this.positionGraphic.position, 0.65);
        this.movement.updateGraphicLocalPos();
        this.movement.materialWheel(dt);
    }

    teleport(): void {
       
    }

    moveGraphic(): void {
        this.movement.lastHorizontal = this.graphicLocalPosition.x;
        var offset = MapSplineManager.current.roadLaterals[MapSplineManager.current.roadPoints[this.movement.currentIndex].lateralIndex].maxOffset;
        this.graphicLocalPosition.x = clamp(this.graphicLocalPosition.x + this.movement.deltaInputHorizontal, -offset, offset);
        this.movement.lastHorizontal = this.graphicLocalPosition.x - this.movement.lastHorizontal;
    }
}