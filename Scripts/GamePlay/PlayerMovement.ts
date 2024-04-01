import { _decorator, CCBoolean, clamp, clamp01, Enum, EventTouch, game, Input, input, Node, Quat, Vec2, Vec3, Tween, ParticleSystem, Game, Material, Vec4, Camera, lerp, CCFloat, CCInteger, Color, math } from 'cc';
import { BaseMovement } from './BaseMovement';
import { GameManager } from './GameManager';
import { ReviveView } from '../../../../Scripts/UI/ReviveView';
import { ScriptExtensions } from '../ScriptExtensions';
import MapSplineManager from './MapSplineManager';
import { CheckPointManager } from './CheckPointManager';
const { ccclass, property} = _decorator;

// export enum PlayerControlType {
    // Normal = 0,
    // Hard_Drive = 1
// }

@ccclass('PlayerMovement')
export class PlayerMovement extends BaseMovement {
    public endGame: boolean = false;

    @property([Node])
    reviveViews : Node[] = [];

    // @property ({type:Enum(PlayerControlType)})
    // controlType: PlayerControlType = PlayerControlType.Normal;

    @property(Node)
    cameraTransform: Node;

    @property({type: CCBoolean})
    useFallOut: false;
 
    startIndex: number = 4;
    speedChange: number = 35;
    cameraOffsetRotation: Quat;
    isMouseDown: boolean = false;
    isTouchDrag: boolean = false;
    previousTouchPosition: Vec2;
    lastHorizontal: number = 0.0;
    deltaInputHorizontal: number = 0.0;
    timeFallOut: number = 0.0;
    cameraValue: number = 0.0;

    @property(Camera)
    camera: Camera;

    @property(CCBoolean)
    controlCamera: boolean = true;

    @property(ParticleSystem)
    windEffect: ParticleSystem;

    lastCameraTargetX: number;
    @property(Node)
    cameraPosSmooth: Node;

    @property(Node)
    cameraForwardPosSmooth: Node;

    @property(CCFloat)
    yRatio: number = -17.5;

    @property(CCFloat)
    zRatio: number = 5;

    @property(CCInteger)
    startCameraFOV: number = 55;

    @property(CCInteger)
    cameraFOV: number = 40;

    @property(CCFloat)
    startYCamera: number = 0;

    @property(CCFloat)
    yCamera: number = -0.1;

    @property(CCFloat)
    startZCamera: number = -4;

    @property(CCFloat)
    zCamera: number = 3.1;

    @property(CCFloat)
    test: number = 0;

    @property(CCFloat)
    cameraTargetXOffset: number = 0.3;

    @property(CCFloat)
    startXRotate: number = -7.5;

    @property(CCFloat)
    xRotate: number = -7.5;

    currentXRotate: number = -7.5;


    @property(CCFloat)
    startXRotateCamera: number = -1.6;

    @property(CCFloat)
    xRotateCamera: number = -2.5;

    @property(CCInteger)
    cameraOffsetIndex = 3;

    @property(Vec4)
    offsetMaterial: Vec4 = new Vec4(0,0,0,1);

    @property(CCFloat)
    strength: number = 0;

    @property(CCFloat)
    yOffsetRatio : number = 0;

    @property(Node)
    smokeEffect1: Node;

    @property(Node)
    smokeEffect2: Node;

    start() {
        // this.camera.camera.initGeometryRenderer();
        input.on(Input.EventType.TOUCH_END, this.onMouseUp, this);
        input.on(Input.EventType.TOUCH_START, this.onMouseDown, this);
        input.on(Input.EventType.TOUCH_MOVE, this.onMouseMove, this);

        console.log(this.node)
        this.length = MapSplineManager.current.roadPoints.length;
        this.currentIndex = this.startIndex;
        this.cameraCurrentIndex = this.currentIndex + this.cameraOffsetIndex;
        
        this.node.position = MapSplineManager.current.roadPoints[this.startIndex].position.clone();
        this.cameraForwardPosSmooth.setPosition(MapSplineManager.current.roadPoints[this.cameraCurrentIndex].position.clone())
        this.progress = this.startIndex;
        var rotation = MapSplineManager.current.roadPoints[this.startIndex].rotation.clone();
        this.node.rotation = rotation;
        this.setRotation();
        this.setCameraPositionAndRotation();
        this.rotationModule.localGraphicAngle = this.carGraphic.eulerAngles;
        this.lastCameraTargetX = this.node.inverseTransformPoint(new Vec3(), this.physicBody.node.worldPosition.clone()).x;
        this.carMaterial.setProperty("offset", this.offsetMaterial);
        this.carMaterial.setProperty("strength", this.strength);
        this.smokeEffect1.active = true;
        this.smokeEffect2.active = true;
    }

    onDestroy() {
        input.off(Input.EventType.TOUCH_END, this.onMouseUp, this);
        input.off(Input.EventType.TOUCH_START, this.onMouseDown, this);
        input.off(Input.EventType.TOUCH_MOVE, this.onMouseMove, this);
    }

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

    cameraCurrentIndex : number;
    setCameraPosition(dt: number): void{
        var speedLength = this.currentSpeed * this.speedFactor * dt;
        var position = new Vec3(this.cameraForwardPosSmooth.position);
 
        while (speedLength > 0)
        {
            if (this.cameraCurrentIndex == this.length - 2) return;
            var roadPoint1 = MapSplineManager.current.roadPoints[this.cameraCurrentIndex];
            var roadPoint2 = MapSplineManager.current.roadPoints[this.cameraCurrentIndex + 1];
            var distanceCompletedPath = (roadPoint2.position.clone().subtract(position)).length();
            if (speedLength > distanceCompletedPath)
            {
                position = roadPoint2.position.clone();
                speedLength -= distanceCompletedPath;
                this.cameraCurrentIndex++;
                continue;
            }

            var ratio = (roadPoint1.distanceToNext - distanceCompletedPath + speedLength) / roadPoint1.distanceToNext;
            Vec3.lerp(position,roadPoint1.position, roadPoint2.position, ratio);
            speedLength = 0;
        }

        this.cameraForwardPosSmooth.position = position;
        // this.camera?.camera?.geometryRenderer?.addSphere(this.cameraForwardPosSmooth.worldPosition, 1, Color.GREEN, 5);
    }

    setRotation(){
        var targetUp =  Vec3.transformQuat(new Vec3(), Vec3.UP, this.node.rotation);
        var lookDirection = (this.cameraForwardPosSmooth.position.clone().subtract(this.node.position)).normalize();
        var playerEuler = this.node.eulerAngles.clone();
        var lockAt = new Vec3()
        Quat.fromViewUp(new Quat(),lookDirection,targetUp).getEulerAngles(lockAt);
        this.convertVector(lockAt,playerEuler,lockAt);
        this.node.eulerAngles = lockAt;
    }


    updateMaterial(dt: number): void {
        var value = this.rotationModule.currentGraphicRotate.y * this.yOffsetRatio;
        value = math.clamp(value,-1,1);
        this.offsetMaterial.z = value;
        this.offsetMaterial.w = value;
        this.carMaterial.setProperty("offset", this.offsetMaterial);
        // this.carMaterial.setProperty("strength", this.strength);
        this.rotateGraphicNode.eulerAngles = new Vec3(this.currentXRotate, this.yRatio * this.rotationModule.currentGraphicRotate.x, this.zRatio * this.rotationModule.currentGraphicRotate.y) 
    }


    protected lateUpdate(dt: number): void {
       
        var next = this.node.inverseTransformPoint(new Vec3(),this.physicBody.node.worldPosition);
        this.lastCameraTargetX = lerp(this.lastCameraTargetX, next.x, this.cameraTargetXOffset);
        next.x = this.lastCameraTargetX;
        
        this.cameraPosSmooth.setPosition(next);

        if(!this.controlCamera) return;
        if(this.endGame) return;
        this.cameraValue = ScriptExtensions.inverseLerp(0, 100, this.currentSpeed);

        // this.cameraValue = clamp01(this.test / 10);

        var valueConvert = this.easeOutQuad(this.cameraValue);
        this.camera.fov = valueConvert * this.cameraFOV + this.startCameraFOV;
        
        var cameraGraphicPos = this.camera.node.parent.position.clone();
        var cameraGraphicRotation = this.camera.node.parent.eulerAngles.clone();

        cameraGraphicPos.y = this.startYCamera + this.yCamera * valueConvert;
        cameraGraphicPos.z = this.startZCamera + this.zCamera * valueConvert;
        cameraGraphicRotation.x = this.startXRotateCamera + this.xRotateCamera * valueConvert;

        this.camera.node.parent.position = cameraGraphicPos;
        this.camera.node.parent.eulerAngles = cameraGraphicRotation;
        
        this.currentXRotate = this.startXRotate + this.cameraValue * this.xRotate;


        this.setCameraPositionAndRotation();
    }

    setCameraPositionAndRotation(): void
    {
        var rotation = new Quat(this.node.rotation);
        var graphicPosition =  new Vec3(this.cameraPosSmooth.worldPosition);
        graphicPosition.x *= -1;
        this.cameraTransform.position = graphicPosition.clone().add(Vec3.transformQuat(new Vec3(), new Vec3(0,2.91,-3.62), rotation));

        this.cameraOffsetRotation = rotation;
    
        var targetUp =  Vec3.transformQuat(new Vec3(), Vec3.UP, this.cameraOffsetRotation);
        var lookDirection = (graphicPosition.subtract(this.cameraTransform.position)).normalize();
      
        this.cameraTransform.rotation = Quat.fromViewUp(new Quat(),lookDirection,targetUp);
    }

    easeOutCirc(x: number): number {
        return Math.sqrt(1 - Math.pow(x - 1, 2));
    }

    easeOutQuad(x: number): number {
        return 1 - (1 - x) * (1 - x);
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
            for (let i = 0; i < this.reviveViews.length; i++) {
                this.reviveViews[i].active = true;
                this.reviveViews[i].getComponent(ReviveView).TweenPopup();
            }   
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