import { _decorator, clamp, Component, Node, Quat, Vec3 } from 'cc';
import { BaseGraphicCarPositionModule } from './BaseGraphicCarPositionModule';
import MapSplineManager from './MapSplineManager';
const { ccclass, property } = _decorator;

@ccclass('PinelineGraphicPosition')
export class PinelineGraphicPosition extends BaseGraphicCarPositionModule {
    private currentPosition: Vec3 = new Vec3();
    private currentRotation: Quat = new Quat();
    private centerUp: Vec3 = new Vec3();
    private radiusRotation: Quat = new Quat();
    private radiusForward: Vec3 = new Vec3();
    private vectorDown: Vec3 = new Vec3(0, -1, 0);
    private down: Vec3 = new Vec3();
    private direction: Vec3 = new Vec3();

    public startGame(startIndex: number): void {
        this.movement.length = MapSplineManager.current.roadPoints.length;
        this.movement.currentIndex = startIndex;
        this.movement.node.setPosition(MapSplineManager.current.roadPoints[startIndex].position);
        this.movement.progress = startIndex;
    }

    updateCarGraphic(dt: number): void {
        var roadPoint = MapSplineManager.current.roadPoints[this.movement.currentIndex];
        var roadLateral = MapSplineManager.current.roadLaterals[roadPoint.lateralIndex];
        var ignoreControl = roadPoint.ignoreControl;
        var offset = roadLateral.maxOffset;
        if (!ignoreControl && !this.movement.isFallOutOfRoad && !this.movement.isCheckGround)  this.graphicLocalPosition.x = clamp(this.graphicLocalPosition.x, -offset, offset);
        var radius = roadLateral.radius;
        if (radius > 0 && !this.movement.isFallOutOfRoad)
        {
            this.movement.node.getPosition(this.currentPosition);
            this.movement.node.getRotation(this.currentRotation);
            this.angleRadius = this.graphicLocalPosition.x / radius;
            Vec3.transformQuat(this.centerUp, Vec3.UP, this.currentRotation)
            this.centerUp.multiplyScalar(radius);
            this.centerRadius.set(this.currentPosition.add(this.centerUp));
            var degress = (-180.0 / Math.PI * this.angleRadius);
            Vec3.transformQuat(this.radiusForward, Vec3.FORWARD, this.currentRotation)
            Quat.fromAxisAngle(this.radiusRotation, this.radiusForward, degress * (Math.PI / 180))
            Vec3.transformQuat(this.down, this.vectorDown, this.currentRotation);
            this.down.multiplyScalar(radius);
            Vec3.transformQuat(this.direction,this.down,this.radiusRotation);
            var radiusPosition = this.direction.normalize().multiplyScalar(radius).add(this.centerRadius);
            radiusPosition.x *= -1;
            this.movement.node.inverseTransformPoint(this.graphicLocalPosition, radiusPosition);
            Vec3.lerp(this.currentPosition,this.graphicLocalPosition, this.positionGraphic.position, 0.65);
            this.positionGraphic.setPosition(this.currentPosition);
            return;
        }

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
        this.graphicLocalPosition.x = clamp(this.graphicLocalPosition.x + this.movement.deltaInputHorizontal * ratio, -offset, offset);
        this.movement.lastHorizontal = this.graphicLocalPosition.x - this.movement.lastHorizontal;
    }
}


