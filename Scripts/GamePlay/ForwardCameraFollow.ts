import { _decorator, Camera, CCBoolean, CCFloat, CCInteger, clamp01, Component, lerp, Node, Quat, Vec3 } from 'cc';
import { BaseCameraFollow } from './BaseCameraFollow';
import { PlayerMovement } from './PlayerMovement';
import MapSplineManager from './MapSplineManager';
import { ScriptExtensions } from '../ScriptExtensions';
const { ccclass, property } = _decorator;

@ccclass('ForwardCameraFollow')
export class ForwardCameraFollow extends BaseCameraFollow {
    @property({ group: { name: 'Start' , displayOrder: 1}, type: CCInteger }) 
    startCameraFOV: number = 45;

    @property({ group: { name: 'Add' , displayOrder: 1}, type: CCInteger }) 
    cameraFOV: number = 8;

    @property({ group: { name: 'Start' , displayOrder: 1}, type: CCFloat }) 
    startYCamera: number = -4.15;

    @property({ group: { name: 'Add' , displayOrder: 1}, type: CCFloat }) 
    yCamera: number = 1.05375;

    @property({ group: { name: 'Start' , displayOrder: 1}, type: CCFloat }) 
    startZCamera: number = -6;

    @property({ group: { name: 'Add' , displayOrder: 1}, type: CCFloat }) 
    zCamera: number = 1.8;

    @property({ group: { name: 'Camera' , displayOrder: 1}, type: CCFloat }) 
    cameraTargetXOffset: number = 0.175;

    @property({ group: { name: 'Start' , displayOrder: 1}, type: CCFloat }) 
    startXRotateCamera: number = 29.6;

    @property({ group: { name: 'Add' , displayOrder: 1}, type: CCFloat }) 
    xRotateCamera: number = 0.8;

    @property({ group: { name: 'Camera' , displayOrder: 1} }) 
    cameraOffset: Vec3 = new Vec3(0, 2.91, -3.62)

    @property({ group: { name: 'Camera' , displayOrder: 1} }) 
    controlCamera: boolean = true;

    @property({ group: { name: 'Camera' , displayOrder: 1}, type: Node }) 
    cameraPosSmooth: Node;

    @property(CCFloat)
    overrideCameraValue: number = 0;

    @property
    overrideCamera:boolean = false;

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
    private playerMovement: PlayerMovement;

    onStart(movement: PlayerMovement): void {
        this.playerMovement = movement;
        this.setCameraStartGame();
        this.setCameraPositionAndRotation();
    }

    setCameraStartGame(): void {
        this.playerMovement.cameraCurrentIndex = this.playerMovement.currentIndex + this.playerMovement.cameraOffsetIndex;
        this.playerMovement.cameraForwardPosSmooth.setPosition(MapSplineManager.current.roadPoints[this.playerMovement.cameraCurrentIndex].position)
        this.node.inverseTransformPoint(this.lastCameraTarget, this.playerMovement.physicBody.node.worldPosition);
    }

    onLateUpdate(dt: number): void {
        this.node.inverseTransformPoint(this.cameraNextPosSmooth, this.playerMovement.physicBody.node.worldPosition);
        this.lastCameraTarget.x = lerp(this.lastCameraTarget.x, this.cameraNextPosSmooth.x, this.cameraTargetXOffset);
        this.cameraNextPosSmooth.x = this.lastCameraTarget.x;
        this.cameraPosSmooth.setPosition(this.cameraNextPosSmooth);

        if(!this.controlCamera) return;
        if(this.playerMovement.endGame) return;
        this.cameraValue = ScriptExtensions.inverseLerp(0, 100, this.playerMovement.currentSpeed);

        if(this.overrideCamera) this.cameraValue = clamp01(this.overrideCameraValue);

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
        this.playerMovement.rotationModule.updateCameraValue(this.cameraValue);
        this.setCameraPositionAndRotation();
    }

    setCameraPositionAndRotation(): void
    {
        this.node.getRotation(this.setCameraPositionAndRotation_rotation);
        this.cameraPosSmooth.getWorldPosition(this.setCameraPositionAndRotation_graphicPosition)
        this.setCameraPositionAndRotation_graphicPosition.x *= -1;
        Vec3.transformQuat(this.setCameraPositionAndRotation_offsetDirection, this.cameraOffset, this.setCameraPositionAndRotation_rotation)
        this.playerMovement.cameraTransform.setPosition(this.setCameraPositionAndRotation_offsetDirection.add(this.setCameraPositionAndRotation_graphicPosition));

        this.playerMovement.cameraOffsetRotation = this.setCameraPositionAndRotation_rotation;
    
        Vec3.transformQuat(this.setCameraPositionAndRotation_targetUp, Vec3.UP, this.playerMovement.cameraOffsetRotation);
        var lookDirection = (this.setCameraPositionAndRotation_graphicPosition.subtract(this.playerMovement.cameraTransform.position)).normalize();
      
        this.playerMovement.cameraTransform.rotation = Quat.fromViewUp(this.setCameraPositionAndRotation_outRotation,lookDirection,this.setCameraPositionAndRotation_targetUp);
    }
}