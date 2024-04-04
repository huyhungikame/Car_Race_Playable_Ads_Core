import { _decorator, CCFloat, CCInteger, clamp, clamp01, game, lerp, math, Vec3 } from 'cc';
import { BaseMovement } from './BaseMovement';
import MapSplineManager from './MapSplineManager';
const { ccclass, property } = _decorator;
const { randomRange } = math;

@ccclass('BotMovement')
export class BotMovement extends BaseMovement {
    @property({ group: { name: 'Settings' , displayOrder: 1}, type: CCInteger }) 
    startIndex: number = 4;

    @property({ group: { name: 'Settings' , displayOrder: 1}, type: CCFloat }) 
    minSpeed: number = 40;

    @property({ group: { name: 'Settings' , displayOrder: 1}, type: CCInteger }) 
    offsetRevive: number = 0;

    lastHorizontal: number = 0.0;
    startHorizontal: number = 0.0;
    targetHorizontal: number = 0.0;
    timeGoStraight: number = 0.0;
    ratioHorizontalChange: number = 0.0;
    randomValue: number = 0.0;
    timeActive: number = 0.0;

    start() {
        this.positionModule.startGame(this.startIndex);
        this.rotationModule.startGame(this.startIndex);
    }

    protected update(dt: number): void {
        if(!this.isStartGame) return;
        this.timeActive += dt;
        this.rotate(dt);
        this.setPosition(dt);
        this.updateCarGraphic(dt);
    }

    // speedConvert(speed: number): void {
    //     if(this.onDie) return;
    //     if(!this.isStartGame) return;
    //     var lastSpeed = this.currentSpeed;
    //     var lastRandomValue = this.randomValue;
    //     this.randomValue = clamp(this.randomValue + randomRange(-1, 1) * 0.3, -1, 1);
    //     this.randomValue = lerp(this.randomValue, lastRandomValue, 0.85);
    //     this.currentSpeed = speed + this.randomValue * 25;
    //     if(this.currentSpeed < this.minSpeed) this.currentSpeed = this.minSpeed;
    //     this.currentSpeed = lerp(this.currentSpeed, lastSpeed, 0.85);
    //     this.currentSpeed = clamp(this.currentSpeed, 0, this.maxSpeed);
    //     if (lastSpeed > this.currentSpeed && this.lockDirection.x > 0) 
    //     {
    //         this.currentSpeed = lastSpeed + 15;
    //     }
        
    //     if (lastSpeed < this.currentSpeed && this.lockDirection.y > 0) 
    //     {
    //         this.currentSpeed = -15;
    //         this.StartChangeGoStraight();
    //     }
    // }

    beforeLateUpdate(dt: number): void {
        if(this.lockDirection.y > 0){
            if(this.currentSpeed > 0) this.currentSpeed *= -1;
        }
        else
        {
            if(this.currentSpeed < 0) this.currentSpeed = lerp(this.currentSpeed, 0,0.8);
        }

        if(this.lockDirection.z > 0) {
            this.positionModule.graphicLocalPosition.x += 5 * dt;
            this.targetHorizontal += 10 * dt;
        }
        if(this.lockDirection.w > 0) {
            this.positionModule.graphicLocalPosition.x -= 5 * dt;
            this.targetHorizontal -= 10 * dt;
        }

        this.resteLockDirection();
    }
    
    onLateUpdate(dt: number): void {
        
    }

    rotate(dt: number): void {
        if (MapSplineManager.current.roadPoints[this.currentIndex].ignoreControl) return;
        this.checkGoStraight();
        this.lastHorizontal = this.positionModule.graphicLocalPosition.x;
        this.positionModule.graphicLocalPosition.x = lerp(this.startHorizontal, this.targetHorizontal, this.ratioHorizontalChange);
        this.lastHorizontal = this.positionModule.graphicLocalPosition.x - this.lastHorizontal;
    }

    
    checkGoStraight(): void{
        if (this.timeGoStraight <= 0)
        {
            this.startChangeGoStraight();
            return;
        }

        this.onChangeDirection();
    }

    startChangeGoStraight() : void{
        var offset = MapSplineManager.current.roadLaterals[MapSplineManager.current.roadPoints[this.currentIndex].lateralIndex].maxOffset;
        this.startHorizontal = this.positionModule.graphicLocalPosition.x;
        this.targetHorizontal = randomRange(-offset, offset);
        this.ratioHorizontalChange = 0;
        this.timeGoStraight = randomRange(0, 2.5);
    }

    onChangeDirection() : void{
        var dt = game.deltaTime;
        this.ratioHorizontalChange = clamp01(this.ratioHorizontalChange + dt * 0.3);
        if (this.ratioHorizontalChange >= 1) this.timeGoStraight -= dt;
    }

    revivePosition(index: number): void {
        var index = index + this.offsetRevive;
        if(index < 4) index = 4;
        var startPoint = MapSplineManager.current.roadPoints[index];
        this.node.position = startPoint.position.clone();
        this.positionModule.graphicLocalPosition.x = this.positionModule.initHorizontal;
        this.positionModule.positionGraphic.setPosition(new Vec3(this.positionModule.graphicLocalPosition.x,0,0));
    }

    fallout(): void {
        
    }
}