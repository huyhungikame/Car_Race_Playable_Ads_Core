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
    startXRotate: number = -7.5;

    @property({ group: { name: 'Camera' , displayOrder: 1}, type: CCFloat }) 
    xRotate: number = -7.5;

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
    private currentXRotate: number = -7.5;
    private cameraValue: number = 0.0;
    private lastCameraTarget: Vec3 = new Vec3();

    //#endregion

    @property(ReviveView)
    uiReviveView : ReviveView;

    @property({ group: { name: 'Settings' , displayOrder: 1}, type: CCBoolean }) 
    useFallOut: false;

    @property({ group: { name: 'Settings' , displayOrder: 1}, type: CCInteger }) 
    startIndex: number = 4;

    private setRotation_targetUp: Vec3 = new Vec3();

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
        this.rotationModule.teleport();

        
        this.carMaterial.setProperty("offset", this.offsetMaterial);
        this.carMaterial.setProperty("strength", this.strength);
        this.currentXRotate = this.startXRotate;

        this.smokeEffect1.active = true;
        this.smokeEffect2.active = true;
    }

    onDestroy() {
        input.off(Input.EventType.TOUCH_END, this.onMouseUp, this);
        input.off(Input.EventType.TOUCH_START, this.onMouseDown, this);
        input.off(Input.EventType.TOUCH_MOVE, this.onMouseMove, this);
    }

    setRotation(): void {
        Vec3.transformQuat(this.setRotation_targetUp, Vec3.UP, this.node.rotation);

        var lookDirection = (this.cameraForwardPosSmooth.position.clone().subtract(this.node.position)).normalize();
        var playerEuler = this.node.eulerAngles.clone();
        var lockAt = new Vec3();
        Quat.fromViewUp(new Quat(),lookDirection,this.setRotation_targetUp).getEulerAngles(lockAt);
        this.convertVector(lockAt,playerEuler,lockAt);
        this.node.eulerAngles = lockAt;
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
        
        this.currentXRotate = this.startXRotate + this.cameraValue * this.xRotate;

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


    public endGame: boolean = false;
 
    
    speedChange: number = 35;
    cameraOffsetRotation: Quat;
    isMouseDown: boolean = false;
    isTouchDrag: boolean = false;
    previousTouchPosition: Vec2;
    lastHorizontal: number = 0.0;
    deltaInputHorizontal: number = 0.0;
    timeFallOut: number = 0.0;


    @property({ group: { name: 'Effect' , displayOrder: 3}, type: ParticleSystem }) 
    windEffect: ParticleSystem;

    @property({ group: { name: 'Effect' , displayOrder: 3}, type: Node }) 
    smokeEffect1: Node;

    @property({ group: { name: 'Effect' , displayOrder: 3}, type: Node }) 
    smokeEffect2: Node;



    @property(CCFloat)
    yRatio: number = -17.5;

    @property(CCFloat)
    zRatio: number = 5;


    @property(Vec4)
    offsetMaterial: Vec4 = new Vec4(0,0,0,1);

    @property(CCFloat)
    strength: number = 0;

    @property(CCFloat)
    yOffsetRatio : number = 0;


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
        this.rotationModule.currentGraphicRotate = new Vec2(0,0);
        if (!this.isTouchDrag)
        {
            this.previousTouchPosition = new Vec2(event.getLocation());
            this.isTouchDrag = true;
        }
    }

    startGame(position: Vec2) {
        this.isStartGame = true
        this.isMouseDown = true;
        if (!this.isTouchDrag)
        {
            this.previousTouchPosition = new Vec2(position);
            this.isTouchDrag = true;
        }
        
        this.windEffect.node.active = true;
    }

    protected update(dt: number): void {
        this.input(dt);
        this.setPosition(dt);
        this.setCameraPosition(dt);
        this.setRotation();
        CheckPointManager.current.onPlayerChangeCheckPoint(this.currentIndex, this.node.eulerAngles.clone());
        this.updateCarGraphic(dt);
        this.updateMaterial(dt);
        if (!this.useFallOut) return;
        if (this.isFallOutOfRoad) this.fallOutOfRoad(dt);
        if (MapSplineManager.current.roadPoints[this.currentIndex].ignoreControl || this.isFallOutOfRoad)
        {
            this.isFly(dt);
            return
        }

        if (!this.isFallOutOfRoad) this.isGround();
    }


    updateMaterial(dt: number): void {
        var value = this.rotationModule.currentGraphicRotate.y * this.yOffsetRatio;
        value = math.clamp(value,-1,1);
        this.offsetMaterial.z = value;
        this.offsetMaterial.w = value;
        this.carMaterial.setProperty("offset", this.offsetMaterial);
        // this.carMaterial.setProperty("strength", this.strength);
        this.rotationModule.rotateGraphicNode.eulerAngles = new Vec3(this.currentXRotate, this.yRatio * this.rotationModule.currentGraphicRotate.x, this.zRatio * this.rotationModule.currentGraphicRotate.y) 
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

        if(this.isMouseDown && this.lastHorizontal == 0){
            this.rotationModule.currentGraphicRotate.x = lerp(this.rotationModule.currentGraphicRotate.x, 0 , 0.1);
            this.rotationModule.currentGraphicRotate.y = lerp(this.rotationModule.currentGraphicRotate.y, 0 , 0.1);
        }else{
            this.rotationModule.currentGraphicRotate.y = lerp(this.rotationModule.currentGraphicRotate.y, 0 , 0.3);
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
                var currentTouchPosition = new Vec2(event.getLocation());
                
                if(!MapSplineManager.current.roadPoints[this.currentIndex].ignoreControl && !this.isCheckGround)
                {
                     this.normalControl(currentTouchPosition);
                }

                this.previousTouchPosition = currentTouchPosition;
            }
        }
    }

    minMaxDelta: number = 0.035;
    lastDeltalInput: number = 0;
    normalControl(currentTouchPosition: Vec2): void
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

        this.lastHorizontal = this.positionModule.graphicLocalPosition.x;
        var offset = MapSplineManager.current.roadLaterals[MapSplineManager.current.roadPoints[this.currentIndex].lateralIndex].maxOffset;
        this.positionModule.graphicLocalPosition.x = clamp(this.positionModule.graphicLocalPosition.x + this.deltaInputHorizontal, -offset, offset);

        this.lastHorizontal = this.positionModule.graphicLocalPosition.x - this.lastHorizontal;
        this.addRotateHorizontal();
    }


    addRotateHorizontal() : void
    {
        var dt = game.deltaTime;
        this.rotationModule.currentGraphicRotate.x = clamp(this.rotationModule.currentGraphicRotate.x - this.lastHorizontal * 25 *dt, -1, 1);
        this.rotationModule.currentGraphicRotate.y = this.rotationModule.currentGraphicRotate.x;
        // this.currentGraphicRotate.x = lerp(this.currentGraphicRotate.x, 0 , 0.05);
        // this.currentGraphicRotate.y = lerp(this.currentGraphicRotate.y, 0 , 0.05)
    }


    isFly(dt: number){
        this.isCheckGround = true;
        var ratio = clamp01(ScriptExtensions.inverseLerp(5, 55, this.currentSpeed) + 0.1);
        this.lastHorizontal = this.positionModule.graphicLocalPosition.x;
        this.positionModule.graphicLocalPosition.x = this.positionModule.graphicLocalPosition.x + this.deltaInputHorizontal * ratio;
    
        this.lastHorizontal = this.positionModule.graphicLocalPosition.x - this.lastHorizontal;
    
        if (this.lastHorizontal != 0)
        {
            this.lastHorizontal = (ScriptExtensions.inverseLerp(-0.05, 0.05, this.lastHorizontal) - 0.5) * 2;
            // this.currentGraphicRotate = clamp(this.currentGraphicRotate + this.lastHorizontal * 1.5, -25, 25);
        }
    }

    isGround() : void
    {
        if(!this.isCheckGround) return;
        this.isCheckGround = false;
        var roadLateral = MapSplineManager.current.roadLaterals[MapSplineManager.current.roadPoints[this.currentIndex].lateralIndex];
        var offset = roadLateral.maxOffset;
        if(Math.abs(this.positionModule.graphicLocalPosition.x) <= offset) return;
        this.isFallOutOfRoad = true;
    }

    fallOutOfRoad(dt: number)
    {
        this.positionModule.graphicLocalPosition.y -= dt * 30;
        this.timeFallOut += dt;
        if(this.timeFallOut > 0.75)
        {
            this.ActionReviveView();
        }
    }
    ActionReviveView(){
        if(this.onDie) return;
        this.die();
        this.isMouseDown = false;
        this.isTouchDrag = false;
        this.lastHorizontal = 0;
        this.lastHorizontal = 0.0;
        this.deltaInputHorizontal = 0.0;
        this.timeFallOut = 0;
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
        this.node.position = MapSplineManager.current.roadPoints[index].position.clone();
        this.cameraCurrentIndex = this.currentIndex + this.cameraOffsetIndex;
        this.cameraForwardPosSmooth.setPosition(MapSplineManager.current.roadPoints[this.cameraCurrentIndex].position.clone())
        this.smokeEffect1.active = true;
        this.smokeEffect2.active = true;
    }
}