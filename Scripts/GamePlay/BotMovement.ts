import { _decorator, CCFloat, CCInteger, clamp, clamp01, game, lerp, math, Vec3 } from 'cc';
import { BaseMovement } from './BaseMovement';
import { PlayerMovement } from './PlayerMovement';
import MapSplineManager from './MapSplineManager';
const { ccclass, property } = _decorator;
const { randomRange } = math;

@ccclass('BotMovement')
export class BotMovement extends BaseMovement {
    @property(CCInteger)
    startIndex: number = 4;

    @property(CCFloat)
    offsetIndex: number = 0.0;

    @property(CCFloat)
    initHorizontal: number = 0.0;

    @property(CCFloat)
    minSpeed: number = 40;

    @property(CCInteger)
    offsetRevive: number = 0;

    @property(PlayerMovement)
    playerMovement: PlayerMovement;

    lastHorizontal: number = 0.0;
    startHorizontal: number = 0.0;
    targetHorizontal: number = 0.0;
    timeGoStraight: number = 0.0;
    ratioHorizontalChange: number = 0.0;
    randomValue: number = 0.0;
    timeActive: number = 0.0;

    start() {
        this.length = MapSplineManager.current.roadPoints.length;
        this.currentIndex = this.startIndex;
        var startPoint = MapSplineManager.current.roadPoints[this.startIndex];

        this.node.position = startPoint.position.clone().add(startPoint.directionToNext.clone().multiplyScalar(this.offsetIndex * startPoint.distanceToNext));
        this.progress = this.startIndex + this.offsetIndex;
        var rotation = startPoint.rotation.clone();
        this.node.rotation = rotation;
        this.rotationModule.localGraphicAngle = this.carGraphic.eulerAngles;
        this.positionModule.graphicLocalPosition.x = this.initHorizontal;
        this.carGraphic.setPosition(new Vec3(this.positionModule.graphicLocalPosition.x,0,0));
        var offsetGraphic = Math.abs(this.playerMovement.progress - this.progress);
        var offset = 1 - clamp01(offsetGraphic / 5);
        this.rotateGraphicNode.eulerAngles = this.playerMovement.rotateGraphicNode.eulerAngles.clone().multiply3f(offset,1,1);
    }

    protected update(dt: number): void {
        if(!this.isStartGame) return;
        this.timeActive += dt;
        this.rotate(dt);
        this.setPosition(dt);
        this.updateCarGraphic(dt);

        var offsetGraphic = Math.abs(this.playerMovement.progress - this.progress);
        var offset = 1 - clamp01(offsetGraphic / 5);
        this.rotateGraphicNode.eulerAngles = this.playerMovement.rotateGraphicNode.eulerAngles.clone().multiply3f(offset,1,1);
    }

    speedConvert(speed: number): void {
        if(this.onDie) return;
        if(!this.isStartGame) return;
        var lastSpeed = this.currentSpeed;
        var lastRandomValue = this.randomValue;
        this.randomValue = clamp(this.randomValue + randomRange(-1, 1) * 0.3, -1, 1);
        this.randomValue = lerp(this.randomValue, lastRandomValue, 0.85);
        this.currentSpeed = speed + this.randomValue * 25;
        if(this.currentSpeed < this.minSpeed) this.currentSpeed = this.minSpeed;
        this.currentSpeed = lerp(this.currentSpeed, lastSpeed, 0.85);
        this.currentSpeed = clamp(this.currentSpeed, 0, this.maxSpeed);
        if (lastSpeed > this.currentSpeed && this.lockDirection.x > 0) 
        {
            this.currentSpeed = lastSpeed + 15;
        }
        
        if (lastSpeed < this.currentSpeed && this.lockDirection.y > 0) 
        {
            this.currentSpeed = -15;
            this.StartChangeGoStraight();
        }
    }

    currentRotateChange: number = 0;
    rotate(dt: number): void {
        if (MapSplineManager.current.roadPoints[this.currentIndex].ignoreControl) return;
        this.CheckGoStraight();
        this.lastHorizontal = this.positionModule.graphicLocalPosition.x;
        this.positionModule.graphicLocalPosition.x = lerp(this.startHorizontal, this.targetHorizontal, this.ratioHorizontalChange);
        this.lastHorizontal = this.positionModule.graphicLocalPosition.x - this.lastHorizontal;
        
        if((this.lastHorizontal > 0 && this.lockDirection.w > 0)
            || (this.lastHorizontal < 0 && this.lockDirection.z > 0)
        ) {

            this.StartChangeGoStraight();
            return;
        }


        if (Math.abs(this.lastHorizontal) > 0.07)
        {
            var newRotate = clamp(this.rotationModule.currentGraphicRotate.x - this.lastHorizontal * 30 *dt, -1, 1);
            this.currentRotateChange = newRotate - this.rotationModule.currentGraphicRotate.x;
            this.rotationModule.currentGraphicRotate.x = newRotate;
        }

        var detal = Math.abs(this.currentRotateChange);
        detal = clamp(detal,0.1,0.2);
        this.rotationModule.currentGraphicRotate.x = lerp(this.rotationModule.currentGraphicRotate.x, 0 , detal);
    }

    
    CheckGoStraight(): void{
        if (this.timeGoStraight <= 0)
        {
            this.StartChangeGoStraight();
            return;
        }

        this.OnChangeDirection();
    }

    StartChangeGoStraight() : void{
        var offset = MapSplineManager.current.roadLaterals[MapSplineManager.current.roadPoints[this.currentIndex].lateralIndex].maxOffset;
        this.startHorizontal = this.positionModule.graphicLocalPosition.x;
        this.targetHorizontal = randomRange(-offset, offset);
        this.ratioHorizontalChange = 0;
        this.timeGoStraight = randomRange(0, 2.5);
    }

    OnChangeDirection() : void{
        var dt = game.deltaTime;
        this.ratioHorizontalChange = clamp01(this.ratioHorizontalChange + dt * 0.3);
        if (this.ratioHorizontalChange >= 1) this.timeGoStraight -= dt;
    }

    revivePosition(index: number): void {
        var index = index + this.offsetRevive;
        if(index < 4) index = 4;
        var startPoint = MapSplineManager.current.roadPoints[index];
        this.node.position = startPoint.position.clone();
        this.positionModule.graphicLocalPosition.x = this.initHorizontal;
        this.carGraphic.setPosition(new Vec3(this.positionModule.graphicLocalPosition.x,0,0));
    }
}


