import { _decorator, clamp, clamp01, Component, game, math, Node, Quat, Vec2, Vec3 } from 'cc';
import { BaseGraphicCarRotationModule } from './BaseGraphicCarRotationModule';
import MapSplineManager from './MapSplineManager';
import { PlayerMovement } from './PlayerMovement';
import { ScriptExtensions } from '../ScriptExtensions';
const { ccclass, property } = _decorator;

@ccclass('TurnCar')
export class TurnCar extends BaseGraphicCarRotationModule {
    localGraphicAngle: Vec3 = new Vec3;
    center: Vec3 = new Vec3();
    tempForward: Vec3 = new Vec3();
    upOffset: Quat = new Quat();
    forwardAngle: Quat = new Quat();
    forwardTemp: Vec3 = new Vec3();
    worldRotation: Quat = new Quat();

    public handleInput(currentTouchPosition: Vec2, playerMovement: PlayerMovement): number {
        var value = this.movement.isNitro ? 2.25 : 2.25;
        playerMovement.deltaInputHorizontal = (currentTouchPosition.x - playerMovement.previousTouchPosition.x) * value * game.deltaTime;
        var ratio = clamp01(ScriptExtensions.inverseLerp(5, 55, playerMovement.currentSpeed) + 0.1);
        playerMovement.deltaInputHorizontal = clamp(playerMovement.deltaInputHorizontal, -0.55, 0.55);
        return ratio;
    }
    addRotate(): void {
        if (this.movement.lastHorizontal != 0)
        {
            this.movement.lastHorizontal = (ScriptExtensions.inverseLerp(-0.05, 0.05, this.movement.lastHorizontal) - 0.5) * 2;
            this.currentGraphicRotate.y = clamp(this.currentGraphicRotate.y + this.movement.lastHorizontal * 1.5, -25, 25);
        }
    }
    removeRotate(_isMouseDown: boolean): void {
        if (this.movement.lastHorizontal == 0.0 && this.movement.currentSpeed > 0)
        {
            var ratio = clamp01(ScriptExtensions.inverseLerp(8, 65, this.movement.currentSpeed) + 0.2);
            if (this.currentGraphicRotate.y > 0)
            {
                this.currentGraphicRotate.y -= 65 * ratio * game.deltaTime;
                if (this.currentGraphicRotate.y < 0) this.currentGraphicRotate.y = 0;
            }
            else if (this.currentGraphicRotate.y < 0)
            {
                this.currentGraphicRotate.y += 65 * ratio * game.deltaTime;
                if (this.currentGraphicRotate.y > 0) this.currentGraphicRotate.y = 0;
            }
        }
    }

    updateCameraValue(_cameraValue: number): void {
      
    }
    public startGame(startIndex: number): void {
        this.movement.node.setRotation(MapSplineManager.current.roadPoints[startIndex].rotation);
        this.localGraphicAngle = this.rotateGraphicNode.eulerAngles;
    }

    updateCarGraphic(_dt: number): void {
        var roadPoint = MapSplineManager.current.roadPoints[this.movement.currentIndex];
        var roadLateral = MapSplineManager.current.roadLaterals[roadPoint.lateralIndex];
        var radius = roadLateral.radius;
        if (radius > 0 && !this.movement.isFallOutOfRoad)
        {
            this.center.set(this.movement.positionModule.centerRadius);
            this.center.x *= -1;
            var up =  this.center.subtract(this.rotateGraphicNode.worldPosition).normalize();
            Vec3.transformQuat(this.tempForward, Vec3.FORWARD, this.movement.node.worldRotation)
            var forwardRotate = this.tempForward.normalize();
            Quat.fromAxisAngle(this.upOffset, forwardRotate, this.movement.positionModule.angleRadius * -100 * (Math.PI / 180));
            Vec3.transformQuat(up, up, this.upOffset);
            Quat.fromAxisAngle(this.forwardAngle, up, this.currentGraphicRotate.y * (Math.PI / 180));
            forwardRotate.multiplyScalar(-1);
            var forward = Vec3.transformQuat(this.forwardTemp, forwardRotate, this.forwardAngle).normalize();
            this.rotateGraphicNode.worldRotation = Quat.fromViewUp(this.worldRotation, forward, up);
            this.localGraphicAngle = this.rotateGraphicNode.eulerAngles;
            return;
        }
       
        Vec3.lerp(this.localGraphicAngle, this.currentGraphicRotate, this.localGraphicAngle, 0.35);
        this.rotateGraphicNode.eulerAngles = this.localGraphicAngle;
    }

    teleport(): void {
        this.localGraphicAngle = this.rotateGraphicNode.eulerAngles;
    }
}