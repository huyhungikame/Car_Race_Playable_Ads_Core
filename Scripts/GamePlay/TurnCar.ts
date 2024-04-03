import { _decorator, clamp, clamp01, Component, game, math, Node, Vec2, Vec3 } from 'cc';
import { BaseGraphicCarRotationModule } from './BaseGraphicCarRotationModule';
import MapSplineManager from './MapSplineManager';
import { PlayerMovement } from './PlayerMovement';
import { ScriptExtensions } from '../ScriptExtensions';
const { ccclass, property } = _decorator;

@ccclass('TurnCar')
export class TurnCar extends BaseGraphicCarRotationModule {
    graphicOffset : Vec3 = new Vec3(0,0,0);
    localGraphicAngle: Vec3 = new Vec3;

    public handleInput(currentTouchPosition: Vec2, playerMovement: PlayerMovement): number {
        playerMovement.deltaInputHorizontal = (currentTouchPosition.x - playerMovement.previousTouchPosition.x) * 2.25 * game.deltaTime;
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

    updateCarGraphic(dt: number): void {
        // var roadPoint = MapSplineManager.current.roadPoints[this.currentIndex];
        // var roadLateral = MapSplineManager.current.roadLaterals[roadPoint.lateralIndex];
        // var ignoreControl = roadPoint.ignoreControl;
        // var offset = roadLateral.maxOffset;
        // if (!ignoreControl && !this.isFallOutOfRoad && !this.isCheckGround) this.graphicLocalPosition.x = clamp(this.graphicLocalPosition.x, -offset, offset);
        // var radius = roadLateral.radius;
        
        // if (radius > 0 && !this.isFallOutOfRoad)
        // {
        
            // var position =  new Vec3(this.player.position);
            // var rotation = new Quat(this.player.rotation);
            // var angle = this.xOffset / radius;
            // var centerUp = Vec3.transformQuat(new Vec3(), Vec3.UP, rotation).multiplyScalar(radius);
            // var center = new Vec3(position).add(centerUp)
            // var degress = (-180.0 / Math.PI * angle);
            // var radiusRotation = Quat.fromAxisAngle(new Quat(),Vec3.transformQuat(new Vec3(), Vec3.FORWARD, rotation),degress * (Math.PI / 180))
            // var down = Vec3.transformQuat(new Vec3(), new Vec3(0,-1,0), rotation).multiplyScalar(radius);
            // var direction = Vec3.transformQuat(new Vec3(),down,radiusRotation);
            // var radiusPosition = direction.normalize().multiplyScalar(radius).add(center);
            // radiusPosition.x *= -1;
            // var invert = this.player.inverseTransformPoint(new Vec3(),radiusPosition);
            
            // this.graphicLocalPosition =  new Vec3(this.graphicOffset).add(invert);
            // this.carGraphic.position = Vec3.lerp(new Vec3(),this.graphicLocalPosition, this.carGraphic.position, 0.65);

            //Rotation

            // this.updateGraphicLocalPos();
            // var up =  new Vec3(-center.x,center.y,center.z).subtract(this.carGraphic.worldPosition).normalize();
            // var forwardRotate = Vec3.transformQuat(new Vec3(), Vec3.FORWARD, this.player.worldRotation).normalize();
            // var upOffset = Quat.fromAxisAngle(new Quat(),forwardRotate,  angle * -100 * (Math.PI / 180));
            // up = Vec3.transformQuat(new Vec3(), up, upOffset);
            // var forwardAngle = Quat.fromAxisAngle(new Quat(),up,this.currentGraphicRotate * (Math.PI / 180));
            // forwardRotate.multiplyScalar(-1);
            // var forward = Vec3.transformQuat(new Vec3(), forwardRotate, forwardAngle).normalize();
            // this.carGraphic.worldRotation = Quat.fromViewUp(new Quat(),forward,up);
            // this.localGraphicAngle = this.carGraphic.eulerAngles;
            // return;
        // }

       
        Vec3.lerp(this.localGraphicAngle, this.currentGraphicRotate, this.localGraphicAngle, 0.35);
        this.rotateGraphicNode.eulerAngles = this.localGraphicAngle;
    }

    teleport(): void {
        this.localGraphicAngle = this.rotateGraphicNode.eulerAngles;
    }
}