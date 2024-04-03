import { _decorator, CCBoolean, clamp, EventTouch, game, Input, input, Node, Quat, Vec2, Vec3, ParticleSystem, Camera, lerp, CCFloat, CCInteger, math } from 'cc';
import { BaseMovement } from './BaseMovement';
import { GameManager } from './GameManager';
import MapSplineManager from './MapSplineManager';
import { CheckPointManager } from './CheckPointManager';
import { ReviveView } from '../UI/ReviveView';
import { BaseCameraFollow } from './BaseCameraFollow';
const { ccclass, property} = _decorator;

@ccclass('PlayerMovement')
export class PlayerMovement extends BaseMovement {
    public static current: PlayerMovement;

    //#region Camera Properties

    @property({ group: { name: 'Camera' , displayOrder: 1}, type: BaseCameraFollow }) 
    cameraFollow: BaseCameraFollow;

    @property({ group: { name: 'Camera' , displayOrder: 1}, type: Node }) 
    cameraTransform: Node;

    @property({ group: { name: 'Camera' , displayOrder: 1}, type: Node }) 
    cameraForwardPosSmooth: Node;

    @property({ group: { name: 'Camera' , displayOrder: 1}, type: CCInteger }) 
    cameraOffsetIndex = 3;

    public cameraCurrentIndex : number;
    public cameraCurrentTargetPosition: Vec3 = new Vec3();
    public cameraCaculatorPosition: Vec3 = new Vec3();

    //#endregion

    @property(ReviveView)
    uiReviveView : ReviveView;

    @property({ group: { name: 'Settings' , displayOrder: 1}, type: CCInteger }) 
    startIndex: number = 4;

    @property({ group: { name: 'Settings' , displayOrder: 1}, type: CCBoolean }) 
    forwardContent: boolean = true;

    @property({ group: { name: 'Effect' , displayOrder: 3}, type: ParticleSystem }) 
    windEffect: ParticleSystem;

    @property({ group: { name: 'Effect' , displayOrder: 3}, type: Node }) 
    smokeEffect1: Node;

    @property({ group: { name: 'Effect' , displayOrder: 3}, type: Node }) 
    smokeEffect2: Node;

    private setRotation_targetUp: Vec3 = new Vec3();
    private setRotation_lookDirection: Vec3 = new Vec3();
    private setRotation_lockAt: Vec3 = new Vec3();
    private setRotation_Rotation: Quat = new Quat();
    public endGame: boolean = false;
    speedChange: number = 35;
    cameraOffsetRotation: Quat;
    isMouseDown: boolean = false;
    isTouchDrag: boolean = false;
    previousTouchPosition: Vec2;
    private onMouseMove_currentTouchPosition: Vec2 = new Vec2();
    minMaxDelta: number = 0.035;
    lastDeltalInput: number = 0;

    start() {
        PlayerMovement.current = this;
        input.on(Input.EventType.TOUCH_END, this.onMouseUp, this);
        input.on(Input.EventType.TOUCH_START, this.onMouseDown, this);
        input.on(Input.EventType.TOUCH_MOVE, this.onMouseMove, this);

        this.positionModule.startGame(this.startIndex);
        this.rotationModule.startGame(this.startIndex);

        if(this.forwardContent) this.setRotation();
        this.cameraFollow.onStart(this);
        this.smokeEffect1.active = true;
        this.smokeEffect2.active = true;
    }

    public getStartRotation(): Quat {
        return MapSplineManager.current.roadPoints[this.startIndex].rotation;
    }

    startGame(position: Vec2) {
        this.isStartGame = true
        this.isMouseDown = true;
        if (!this.isTouchDrag)
        {
            this.previousTouchPosition = position;
            this.isTouchDrag = true;
        }
        
        this.windEffect.node.active = true;
    }

    onDestroy() {
        input.off(Input.EventType.TOUCH_END, this.onMouseUp, this);
        input.off(Input.EventType.TOUCH_START, this.onMouseDown, this);
        input.off(Input.EventType.TOUCH_MOVE, this.onMouseMove, this);
    }

    protected update(dt: number): void {
        this.input(dt);
        this.setPosition(dt);
        if(this.forwardContent)
        {
            this.setCameraPosition(dt);
            this.setRotation();
        }
        this.updateCarGraphic(dt);
        CheckPointManager.current.onPlayerChangeCheckPoint(this.currentIndex, this.node.eulerAngles);
    }

    //#region Input

    onMouseUp(_event: EventTouch) {
        if(this.onDie) return;
        if(!this.isStartGame) return;
        this.isMouseDown = false;
        this.isTouchDrag = false;
    }

    onMouseDown(event: EventTouch) {
        if(this.onDie) return;
        if(GameManager.instance.openningTutorial) GameManager.instance.closeTutorial();
        if(!this.isStartGame) return;
        this.isMouseDown = true;
        this.rotationModule.resetState();
        if (!this.isTouchDrag)
        {
            this.previousTouchPosition.set(event.getLocation());
            this.isTouchDrag = true;
        }
    }

    onMouseMove(event: EventTouch) {
        if(this.onDie) return;
        if(this.endGame) return;
        if(this.isFallOutOfRoad) return;
        this.lastHorizontal = 0;
        if (this.isMouseDown)
        {
            if (this.isTouchDrag)
            {
                this.onMouseMove_currentTouchPosition.set(event.getLocation());
                
                if (!MapSplineManager.current.roadPoints[this.currentIndex].ignoreControl && !this.isCheckGround)
                {
                     this.moveGraphic(this.onMouseMove_currentTouchPosition);
                }

                this.previousTouchPosition.set(this.onMouseMove_currentTouchPosition);
            }
        }
    }

    
    moveGraphic(currentTouchPosition: Vec2): void
    {
        this.deltaInputHorizontal = (currentTouchPosition.x - this.previousTouchPosition.x) * 2 * game.deltaTime;
        if(this.lockDirection.w > 0 && this.deltaInputHorizontal > 0) this.deltaInputHorizontal = 0;
        if(this.lockDirection.z > 0 && this.deltaInputHorizontal < 0) this.deltaInputHorizontal = 0;

        if((this.deltaInputHorizontal < 0 && this.lastDeltalInput < 0) || (this.deltaInputHorizontal > 0 && this.lastDeltalInput > 0)){
            this.minMaxDelta = math.clamp(this.minMaxDelta + 0.65 * game.deltaTime,0.075,0.3) 
        }else{
            this.minMaxDelta = 0.075;
        }
        this.lastDeltalInput = this.deltaInputHorizontal;
        this.deltaInputHorizontal = clamp(this.deltaInputHorizontal, -this.minMaxDelta, this.minMaxDelta);
        this.positionModule.moveGraphic();
        this.rotationModule.addRotate();
    }

    // this.deltaInputHorizontal = (currentTouchPosition.x - this.previousTouchPosition.x) * 2.25 * game.deltaTime;
    // var ratio = clamp01(this.inverseLerp(5, 55, this.currentSpeed) + 0.1);
    // this.deltaInputHorizontal = clamp(this.deltaInputHorizontal, -0.55, 0.55);

    // this.lastHorizontal = this.xOffset;
    // var offset = this.splineManager.roadLaterals[this.splineManager.roadPoints[this.currentIndex].lateralIndex].maxOffset;
    // this.xOffset = clamp(this.xOffset + this.deltaInputHorizontal * ratio, -offset, offset);

    // this.lastHorizontal = this.xOffset - this.lastHorizontal;

    // if (this.lastHorizontal != 0)
    // {
    //     this.lastHorizontal = (this.inverseLerp(-0.05, 0.05, this.lastHorizontal) - 0.5) * 2;
    //     this.currentGraphicRotate = clamp(this.currentGraphicRotate + this.lastHorizontal * 1.5, -25, 25);
    // }

    input(dt: number): void {
        this.lastHorizontal = 0;
        var ignoreControl = MapSplineManager.current.roadPoints[this.currentIndex].ignoreControl;
        if (this.isMouseDown && this.lockDirection.y == 0)
        {
            this.currentSpeed += this.speedChange * 2 * dt;
        }
        else
        {
            if (!ignoreControl && this.lockDirection.x == 0) this.currentSpeed -= this.speedChange * 4.5 * dt;
        }

        this.currentSpeed = clamp(this.currentSpeed, 0, this.maxSpeed);

        this.rotationModule.removeRotate(this.isMouseDown);
    }

    //#endregion

    setRotation(): void {
        Vec3.transformQuat(this.setRotation_targetUp, Vec3.UP, this.node.rotation);
        this.cameraForwardPosSmooth.getPosition(this.setRotation_lookDirection);
        this.setRotation_lookDirection = (this.setRotation_lookDirection.subtract(this.node.position)).normalize();
        Quat.fromViewUp(this.setRotation_Rotation, this.setRotation_lookDirection, this.setRotation_targetUp);
        this.setRotation_Rotation.getEulerAngles(this.setRotation_lockAt);
        this.convertVector(this.setRotation_lockAt, this.node.eulerAngles, this.setRotation_lockAt);
        this.node.eulerAngles = this.setRotation_lockAt;
    }


    //#region Camera
 
    setCameraPosition(dt: number): void{
        var speedLength = this.currentSpeed * this.speedFactor * dt;
        this.cameraForwardPosSmooth.getPosition(this.cameraCurrentTargetPosition);
        var roadPoints = MapSplineManager.current.roadPoints;
 
        while (speedLength > 0)
        {
            if (this.cameraCurrentIndex == this.length - 2) return;
            var roadPoint1 = roadPoints[this.cameraCurrentIndex];
            var roadPoint2 = roadPoints[this.cameraCurrentIndex + 1];
            this.cameraCaculatorPosition.set(roadPoint2.position);
            var distanceCompletedPath = (this.cameraCaculatorPosition.subtract(this.cameraCurrentTargetPosition)).length();
            if (speedLength > distanceCompletedPath)
            {
                this.cameraCurrentTargetPosition.set(roadPoint2.position);
                speedLength -= distanceCompletedPath;
                this.cameraCurrentIndex++;
                continue;
            }

            var ratio = (roadPoint1.distanceToNext - distanceCompletedPath + speedLength) / roadPoint1.distanceToNext;
            Vec3.lerp(this.cameraCurrentTargetPosition, roadPoint1.position, roadPoint2.position, ratio);
            speedLength = 0;
        }

        this.cameraForwardPosSmooth.position = this.cameraCurrentTargetPosition;
    }

    protected lateUpdate(dt: number): void {
       this.cameraFollow.onLateUpdate(dt); 
    }

    //#endregion

    actionReviveView(): void {
        this.fallout();
    }

    fallout(): void {
        if(this.onDie) return;
        this.die();
        this.isMouseDown = false;
        this.isTouchDrag = false;
        this.lastHorizontal = 0;
        this.lastHorizontal = 0.0;
        this.deltaInputHorizontal = 0.0;
        setTimeout(() => {
            this.uiReviveView.TweenPopup();   
        }, 350)    
        this.windEffect.node.active = false;
        this.smokeEffect1.active = false;
        this.smokeEffect2.active = false;
    }

    revivePlayer() : void
    {
        this.revive();
        GameManager.instance.openTutorial();
        var quatRotation = this.node.rotation;
        this.cameraTransform.rotation = quatRotation;
        this.cameraOffsetRotation = quatRotation;
        this.windEffect.node.active = true;
        this.cameraCurrentIndex = this.currentIndex + this.cameraOffsetIndex;
    }

    revivePosition(index: number): void {
        this.node.setPosition(MapSplineManager.current.roadPoints[index].position);
        this.node.setRotation(MapSplineManager.current.roadPoints[index].rotation);
        this.cameraCurrentIndex = this.currentIndex + this.cameraOffsetIndex;
        this.cameraForwardPosSmooth.setPosition(MapSplineManager.current.roadPoints[this.cameraCurrentIndex].position);
        this.smokeEffect1.active = true;
        this.smokeEffect2.active = true;
    }
}