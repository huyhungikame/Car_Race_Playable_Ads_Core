import { _decorator, CCFloat, clamp, Component, Node, Vec3 } from 'cc';
import { BaseGraphicCarPositionModule } from './BaseGraphicCarPositionModule';
import MapSplineManager from './MapSplineManager';
const { ccclass, property } = _decorator;

@ccclass('BotPositionModule')
export class BotPositionModule extends BaseGraphicCarPositionModule {
    @property(CCFloat)
    offsetIndex: number = 0.0;

    public startGame(startIndex: number): void {
        this.movement.length = MapSplineManager.current.roadPoints.length;
        this.movement.currentIndex = startIndex;
        var startPoint = MapSplineManager.current.roadPoints[startIndex];
        this.node.position = startPoint.position.clone().add(startPoint.directionToNext.clone().multiplyScalar(this.offsetIndex * startPoint.distanceToNext));
        this.movement.progress = startIndex + this.offsetIndex;
        this.graphicLocalPosition.x = this.initHorizontal;
        this.positionGraphic.setPosition(new Vec3(this.graphicLocalPosition.x,0,0));
    }
    
    updateCarGraphic(dt: number): void {
        var roadPoint = MapSplineManager.current.roadPoints[this.movement.currentIndex];
        var roadLateral = MapSplineManager.current.roadLaterals[roadPoint.lateralIndex];
        var ignoreControl = roadPoint.ignoreControl;
        var offset = roadLateral.maxOffset;
        if (!ignoreControl && !this.movement.isFallOutOfRoad && !this.movement.isCheckGround)  this.graphicLocalPosition.x = clamp(this.graphicLocalPosition.x, -offset, offset);
        var radius = roadLateral.radius;
        if (radius > 0 && !this.movement.isFallOutOfRoad) return;
        this.updateForceFly();
        Vec3.lerp(this.positionGraphic.position,this.graphicLocalPosition, this.positionGraphic.position, 0.65);
        this.movement.updateGraphicLocalPos();
        this.movement.materialWheel(dt);
    }

    teleport(): void {
       
    }

    moveGraphic(ratio: number): void {
        this.movement.lastHorizontal = this.graphicLocalPosition.x;
        var offset = MapSplineManager.current.roadLaterals[MapSplineManager.current.roadPoints[this.movement.currentIndex].lateralIndex].maxOffset;
        this.graphicLocalPosition.x = clamp(this.graphicLocalPosition.x + this.movement.deltaInputHorizontal, -offset, offset);
        this.movement.lastHorizontal = this.graphicLocalPosition.x - this.movement.lastHorizontal;
    }
}


