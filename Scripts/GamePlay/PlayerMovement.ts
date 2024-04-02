import { _decorator, CCBoolean, clamp, clamp01, Enum, EventTouch, game, Input, input, Node, Quat, Vec2, Vec3, Tween, ParticleSystem, Game, Material, Vec4, Camera, lerp, CCFloat, CCInteger, Color, math, Button, EventHandler, Component } from 'cc';
import { BaseMovement } from './BaseMovement';
import { GameManager } from './GameManager';
import { ScriptExtensions } from '../ScriptExtensions';
import MapSplineManager from './MapSplineManager';
import { CheckPointManager } from './CheckPointManager';
import { ReviveView } from '../UI/ReviveView';
const { ccclass, property} = _decorator;

@ccclass('PlayerMovement')
export class PlayerMovement extends BaseMovement {
    public static current: PlayerMovement;

    //#region Camera Properties

    @property({ group: { name: 'Camera' , displayOrder: 1}, type: CCBoolean }) 
    controlCamera: boolean = true;

    @property({ group: { name: 'Camera' , displayOrder: 1}, type: Node }) 
    cameraTransform: Node;

    @property({ group: { name: 'Camera' , displayOrder: 1}, type: Camera }) 
    camera: Camera;

    @property({ group: { name: 'Camera' , displayOrder: 1}, type: Node }) 
    cameraPosSmooth: Node;

    @property({ group: { name: 'Camera' , displayOrder: 1}, type: Node }) 
    cameraForwardPosSmooth: Node;

    @property({ group: { name: 'Camera' , displayOrder: 1}, type: CCInteger }) 
    startCameraFOV: number = 45;

    @property({ group: { name: 'Camera' , displayOrder: 1}, type: CCInteger }) 
    cameraFOV: number = 8;

    @property({ group: { name: 'Camera' , displayOrder: 1}, type: CCFloat }) 
    startYCamera: number = 0;

    @property({ group: { name: 'Camera' , displayOrder: 1}, type: CCFloat }) 
    yCamera: number = -0.1;

    @property({ group: { name: 'Camera' , displayOrder: 1}, type: CCFloat }) 
    startZCamera: number = -4;

    @property({ group: { name: 'Camera' , displayOrder: 1}, type: CCFloat }) 
    zCamera: number = 3.1;

    @property({ group: { name: 'Camera' , displayOrder: 1}, type: CCFloat }) 
    cameraTargetXOffset: number = 0.3;

    @property({ group: { name: 'Camera' , displayOrder: 1}, type: CCFloat }) 
    startXRotateCamera: number = -1.6;

    @property({ group: { name: 'Camera' , displayOrder: 1}, type: CCFloat }) 
    xRotateCamera: number = -2.5;

    @property({ group: { name: 'Camera' , displayOrder: 1}, type: CCInteger }) 
    cameraOffsetIndex = 3;

    @property({ group: { name: 'Camera' , displayOrder: 1}, type: Vec3 }) 
    cameraOffset: Vec3 = new Vec3(0, 2.91, -3.62)

    private cameraCurrentIndex : number;
    private cameraCurrentTargetPosition: Vec3 = new Vec3();
    private cameraCaculatorPosition: Vec3 = new Vec3();

    private cameraNextPosSmooth: Vec3 = new Vec3();
    private cameraGraphicPos: Vec3 = new Vec3();
    private cameraGraphicRotation: Quat = new Quat();
    private cameraGraphicEulerAngles: Vec3 = new Vec3();
    private setCameraPositionAndRotation_rotation: Quat = new Quat();
    private setCameraPositionAndRotation_graphicPosition: Vec3 = new Vec3();
    private setCameraPositionAndRotation_offsetDirection: Vec3 = new Vec3();
    private setCameraPositionAndRotation_targetUp: Vec3 = new Vec3();
    private setCameraPositionAndRotation_outRotation: Quat = new Quat();
    private cameraValue: number = 0.0;
    private lastCameraTarget: Vec3 = new Vec3();

    //#endregion

    @property(ReviveView)
    uiReviveView : ReviveView;

    @property({ group: { name: 'Settings' , displayOrder: 1}, type: CCInteger }) 
    startIndex: number = 4;

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
        this.setCameraStartGame();
        this.rotationModule.startGame(this.startIndex);
        this.setRotation();
        this.setCameraPositionAndRotation();
        this.smokeEffect1.active = true;
        this.smokeEffect2.active = true;
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
        this.setCameraPosition(dt);
        this.setRotation();
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
        this.node.eulerAngles.set(this.setRotation_lockAt);
    }


    //#region Camera

    setCameraStartGame(): void {
        this.cameraCurrentIndex = this.currentIndex + this.cameraOffsetIndex;
        this.cameraForwardPosSmooth.setPosition(MapSplineManager.current.roadPoints[this.cameraCurrentIndex].position)
        this.node.inverseTransformPoint(this.lastCameraTarget, this.physicBody.node.worldPosition);
    }
 
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
       
        this.node.inverseTransformPoint(this.cameraNextPosSmooth, this.physicBody.node.worldPosition);
        this.lastCameraTarget.x = lerp(this.lastCameraTarget.x, this.cameraNextPosSmooth.x, this.cameraTargetXOffset);
        this.cameraNextPosSmooth.x = this.lastCameraTarget.x;
        this.cameraPosSmooth.setPosition(this.cameraNextPosSmooth);

        if(!this.controlCamera) return;
        if(this.endGame) return;
        this.cameraValue = ScriptExtensions.inverseLerp(0, 100, this.currentSpeed);
        var valueConvert = ScriptExtensions.easeOutQuad(this.cameraValue);

        this.camera.fov = valueConvert * this.cameraFOV + this.startCameraFOV;
        
        this.camera.node.parent.getPosition(this.cameraGraphicPos);
        this.camera.node.parent.getRotation(this.cameraGraphicRotation);
        this.cameraGraphicRotation.getEulerAngles(this.cameraGraphicEulerAngles);

        this.cameraGraphicPos.y = this.startYCamera + this.yCamera * valueConvert;
        this.cameraGraphicPos.z = this.startZCamera + this.zCamera * valueConvert;
        this.cameraGraphicEulerAngles.x = this.startXRotateCamera + this.xRotateCamera * valueConvert;

        this.camera.node.parent.position = this.cameraGraphicPos;
        this.camera.node.parent.eulerAngles = this.cameraGraphicEulerAngles;
        this.rotationModule.updateCameraValue(this.cameraValue);
        this.setCameraPositionAndRotation();
    }

    setCameraPositionAndRotation(): void
    {
        this.node.getRotation(this.setCameraPositionAndRotation_rotation);
        this.cameraPosSmooth.getWorldPosition(this.setCameraPositionAndRotation_graphicPosition)
        this.setCameraPositionAndRotation_graphicPosition.x *= -1;
        Vec3.transformQuat(this.setCameraPositionAndRotation_offsetDirection, this.cameraOffset, this.setCameraPositionAndRotation_rotation)
        this.cameraTransform.setPosition(this.setCameraPositionAndRotation_offsetDirection.add(this.setCameraPositionAndRotation_graphicPosition));

        this.cameraOffsetRotation = this.setCameraPositionAndRotation_rotation;
    
        Vec3.transformQuat(this.setCameraPositionAndRotation_targetUp, Vec3.UP, this.cameraOffsetRotation);
        var lookDirection = (this.setCameraPositionAndRotation_graphicPosition.subtract(this.cameraTransform.position)).normalize();
      
        this.cameraTransform.rotation = Quat.fromViewUp(this.setCameraPositionAndRotation_outRotation,lookDirection,this.setCameraPositionAndRotation_targetUp);
    }

    //#endregion

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
        this.cameraCurrentIndex = this.currentIndex + this.cameraOffsetIndex;
        this.cameraForwardPosSmooth.setPosition(MapSplineManager.current.roadPoints[this.cameraCurrentIndex].position);
        this.smokeEffect1.active = true;
        this.smokeEffect2.active = true;
    }
}