import { _decorator, Component, Node, Quat, Vec3 } from 'cc';
import { BaseCameraFollow } from './BaseCameraFollow';
import { PlayerMovement } from './PlayerMovement';
import { ScriptExtensions } from '../ScriptExtensions';
const { ccclass, property } = _decorator;

@ccclass('ZoomOutCameraFollow')
export class ZoomOutCameraFollow extends BaseCameraFollow {
    private playerMovement: PlayerMovement;
    private onStart_cameraPosition: Vec3 = new Vec3();
    private cameraOffsetRotation: Quat = new Quat();
    private cameraOffset: Vec3 = new Vec3(0,2.91,-3.62);
    private onLateUpdate_rotation: Quat = new Quat();
    private onLateUpdate_graphicPosition: Vec3 = new Vec3();
    private onLateUpdate_offset: Vec3 = new Vec3();
    private onLateUpdate_offsetDirection: Vec3 = new Vec3();
    private onLateUpdate_offsetDirection2: Vec3 = new Vec3();
    private onLateUpdate_offsetDirection3: Vec3 = new Vec3();
    private onLateUpdate_cameraPosition: Vec3 = new Vec3();
    private directionOffset: Vec3 = new Vec3(0,0,3.5);
    private onLateUpdate_targetUp: Vec3 = new Vec3();
    private resultQuat: Quat = new Quat();
    private isFallOut: boolean = false;

    onStart(movement: PlayerMovement): void {
        this.playerMovement = movement;
        var rotation = this.playerMovement.getStartRotation();
        this.playerMovement.node.getPosition(this.onStart_cameraPosition);
        this.playerMovement.cameraTransform.position = this.onStart_cameraPosition.add(Vec3.transformQuat(new Vec3(), this.cameraOffset, rotation));
        this.playerMovement.cameraTransform.setRotation(rotation);
        this.cameraOffsetRotation.set(rotation);
    }

    onLateUpdate(dt: number): void {
        if(this.isFallOut) return;
        this.playerMovement.node.getRotation(this.onLateUpdate_rotation);
        this.playerMovement.positionModule.positionGraphic.getWorldPosition(this.onLateUpdate_graphicPosition);
        this.onLateUpdate_graphicPosition.x *= -1;
        this.onLateUpdate_offset.set(this.cameraOffset);
        var valueZ = -1.75 * ScriptExtensions.inverseLerp(0, 100, this.playerMovement.currentSpeed);
        valueZ += -2 * ScriptExtensions.inverseLerp(1, this.playerMovement.maxNitroFactor, this.playerMovement.currentNitroSpeed);
        valueZ += -1.5 * ScriptExtensions.inverseLerp(1, this.playerMovement.currentBoosterMaxSpeed, this.playerMovement.currentBoosterSpeed.x);
        this.onLateUpdate_offsetDirection.z = valueZ;
        this.onLateUpdate_offset.add(this.onLateUpdate_offsetDirection);

        if(this.playerMovement.endGame) return;
        Vec3.transformQuat(this.onLateUpdate_offsetDirection2, this.onLateUpdate_offset, this.onLateUpdate_rotation);
        this.onLateUpdate_graphicPosition.add(this.onLateUpdate_offsetDirection2);
        this.playerMovement.cameraTransform.setPosition(this.onLateUpdate_graphicPosition);
        Quat.slerp(this.cameraOffsetRotation, this.cameraOffsetRotation, this.onLateUpdate_rotation, 0.25);
    
        this.playerMovement.positionModule.positionGraphic.getWorldPosition(this.onLateUpdate_cameraPosition);
        this.onLateUpdate_cameraPosition.x *= -1;
        Vec3.transformQuat(this.onLateUpdate_offsetDirection3, this.directionOffset, this.onLateUpdate_rotation)
        this.onLateUpdate_cameraPosition.add(this.onLateUpdate_offsetDirection3);
        
        Vec3.transformQuat(this.onLateUpdate_targetUp, Vec3.UP, this.cameraOffsetRotation);
        var lookDirection = (this.onLateUpdate_cameraPosition.subtract(this.playerMovement.cameraTransform.position)).normalize();
        Quat.fromViewUp(this.resultQuat, lookDirection, this.onLateUpdate_targetUp);
        this.playerMovement.cameraTransform.setRotation(this.resultQuat);
    }

    fallout(): void {
        this.isFallOut = true;
    }

    revive(): void {
        this.isFallOut = false;
    }
}