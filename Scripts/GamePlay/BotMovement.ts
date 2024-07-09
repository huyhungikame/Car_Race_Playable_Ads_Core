import { _decorator, animation, CCFloat, CCInteger, clamp, clamp01, game, lerp, math, Vec2, Vec3 } from 'cc';
import { BaseMovement } from './BaseMovement';
import MapSplineManager from './MapSplineManager';
const { ccclass, property } = _decorator;
const { randomRange } = math;

@ccclass('BotMovement')
export class BotMovement extends BaseMovement {
    @property({ group: { name: 'Settings' , displayOrder: 1}, type: CCInteger }) 
    startIndex: number = 4;

    @property({ group: { name: 'Settings' , displayOrder: 1}, type: CCInteger }) 
    offsetRevive: number = 0;

    @property({ group: { name: 'Settings' , displayOrder: 1} })
    firstSpeedValue: Vec2 = new Vec2();

    @property({ group: { name: 'Settings' , displayOrder: 1} })
    firstDurationChangeSpeed: Vec2 = new Vec2();

    @property({ group: { name: 'Settings' , displayOrder: 1} })
    firstDurationKeepSpeed: Vec2 = new Vec2();

    @property({ group: { name: 'Settings' , displayOrder: 1} })
    loopSpeedValue: Vec2 = new Vec2();

    @property({ group: { name: 'Settings' , displayOrder: 1} })
    loopDurationChangeSpeed: Vec2 = new Vec2();

    @property({ group: { name: 'Settings' , displayOrder: 1} })
    loopDurationKeepSpeed: Vec2 = new Vec2();

    lastHorizontal: number = 0.0;
    startHorizontal: number = 0.0;
    targetHorizontal: number = 0.0;
    timeGoStraight: number = 0.0;
    ratioHorizontalChange: number = 0.0;
    randomValue: number = 0.0;
    timeActive: number = 0.0;

    timeKeepSpeed: number = 0;
    startSpeed: number = 0;
    targetSpeed: number = 0;
    isFirstLoop: boolean = true;
    speedChangeSpeed: number = 0;

    @property(animation.AnimationController)
    animationPlayer: animation.AnimationController;

    isMoving: boolean = false;

    start() {
        this.isFirstLoop = true;
        this.positionModule.startGame(this.startIndex);
        this.rotationModule.startGame(this.startIndex);
        this.animationPlayer.setValue("default", true);
        this.animationPlayer.setValue("ground", true);
    }

    protected update(dt: number): void {
        if (!this.isStartGame) return;
        this.timeActive += dt;
        if (this.onDie) return;
        if (this.currentSpeed > 0)
        {
            if (!this.isMoving)
            {
                this.animationPlayer.setValue("ride", true);
                this.isMoving = true;
            }
        }
        else
        {
            if (this.isMoving)
            {
                this.animationPlayer.setValue("ride", false);
                this.isMoving = false;
            }
        }
        this.speed(dt);
        this.rotate(dt);
        this.setPosition(dt);
        this.updateCarGraphic(dt);
    }

    //#region Speed

    speed(dt: number): void {
        this.checkKeepSpeed();
    }

    checkKeepSpeed(): void{
        if (this.timeKeepSpeed <= 0)
        {
            this.changeSpeed();
            return;
        }

        this.onChangeSpeed();
    }

    changeSpeed() : void{
        this.startSpeed = this.currentSpeed;
        this.targetSpeed = this.isFirstLoop ? randomRange(this.firstSpeedValue.x, this.firstSpeedValue.y) : randomRange(this.loopSpeedValue.x, this.loopSpeedValue.y);
        this.speedChangeSpeed = this.isFirstLoop ? randomRange(this.firstDurationChangeSpeed.x, this.firstDurationChangeSpeed.y) : randomRange(this.loopDurationChangeSpeed.x, this.loopDurationChangeSpeed.y);
        this.timeKeepSpeed = this.isFirstLoop ? randomRange(this.firstDurationKeepSpeed.x, this.firstDurationKeepSpeed.y) : randomRange(this.loopDurationKeepSpeed.x, this.loopDurationKeepSpeed.y);
        this.isFirstLoop = false;
    }

    onChangeSpeed() : void{
        var dt = game.deltaTime;
        this.currentSpeed += dt * this.speedChangeSpeed;
        if (this.currentSpeed >= this.targetSpeed) {
            this.currentSpeed = this.targetSpeed;    
            this.timeKeepSpeed -= dt;
        }
    }

    //#endregion

    //#region Rotate

    beforeLateUpdate(dt: number): void {
        if(this.lockDirection.x > 0){
            if(this.currentSpeed < 0) this.currentSpeed *= -1;
            this.targetSpeed += 20 * dt;
            this.timeKeepSpeed = 0;
        }

        if(this.lockDirection.y > 0){
            if(this.currentSpeed > 0) this.currentSpeed *= -1;
            this.targetSpeed -= 20 * dt;
            this.timeKeepSpeed = 0;
        }
        else
        {
            if(this.currentSpeed < 0) this.currentSpeed = lerp(this.currentSpeed, 0,0.8);
        }

        if(this.lockDirection.z > 0) {
            this.positionModule.graphicLocalPosition.x += 5 * dt;
            this.targetHorizontal += 10 * dt;
            this.timeGoStraight = 0;
        }
        if(this.lockDirection.w > 0) {
            this.positionModule.graphicLocalPosition.x -= 5 * dt;
            this.targetHorizontal -= 10 * dt;
            this.timeGoStraight = 0;
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
        this.rotationModule.addRotate();
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
        this.currentSpeed = 0;
        var index = index + this.offsetRevive;
        if(index < 4) index = 4;
        var startPoint = MapSplineManager.current.roadPoints[index];
        this.node.position = startPoint.position.clone();
        this.positionModule.graphicLocalPosition.x = this.positionModule.initHorizontal;
        this.positionModule.positionGraphic.setPosition(new Vec3(this.positionModule.graphicLocalPosition.x,0,0));
        this.changeSpeed();
        this.startChangeGoStraight();
    }

    fallout(): void {
        
    }

    //#endregion
}