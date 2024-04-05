import { _decorator, CCFloat, clamp, Component, game, lerp, math, Node, Vec2, Vec3, Vec4 } from 'cc';
import { BaseGraphicCarRotationModule } from './BaseGraphicCarRotationModule';
import MapSplineManager from './MapSplineManager';
import { PlayerMovement } from './PlayerMovement';
const { ccclass, property } = _decorator;

@ccclass('ShakingCarIsRearEnd')
export class ShakingCarIsRearEnd extends BaseGraphicCarRotationModule {
    @property(CCFloat)
    yRatio: number = -15;

    @property(CCFloat)
    zRatio: number = 2.5;

    @property({type: CCFloat }) 
    startScaleZ: number = 1;

    @property( {type: CCFloat }) 
    scaleZ: number = 0;

    @property(Vec4)
    offsetMaterial: Vec4 = new Vec4(0,0,0,0);

    @property(CCFloat)
    strength: number = 6.25;

    @property(CCFloat)
    yOffsetRatio : number = 1.5;

    private currentRotate: Vec3 = new Vec3();
    private currentScale: Vec3 = new Vec3();

    public startGame(startIndex: number): void {
        this.movement.node.setRotation(MapSplineManager.current.roadPoints[startIndex].rotation);
        this.movement.carMaterial.setProperty("offset", this.offsetMaterial);
        this.movement.carMaterial.setProperty("strength", this.strength);
        this.currentRotate = new Vec3(0,0,0);
        this.currentScale = new Vec3(1,1,this.startScaleZ);
    }

    updateCarGraphic(dt: number): void {
        this.updateMaterial(dt);
    }

    teleport(): void {
        
    }

    updateCameraValue(cameraValue: number): void {
        this.currentScale.z = this.startScaleZ + cameraValue * this.scaleZ;
    }
    
    updateMaterial(dt: number): void {
        var value = this.currentGraphicRotate.y * this.yOffsetRatio;
        value = math.clamp(value,-1,1);
        this.offsetMaterial.z = value;
        this.offsetMaterial.w = value;
        this.movement.carMaterial.setProperty("offset", this.offsetMaterial);
        this.currentRotate.y = this.yRatio * this.currentGraphicRotate.x;
        this.currentRotate.z = this.zRatio * this.currentGraphicRotate.y;
        this.rotateGraphicNode.eulerAngles = this.currentRotate;
        this.rotateGraphicNode.setScale(this.currentScale);
    }

    public handleInput(currentTouchPosition: Vec2, playerMovement: PlayerMovement): number {
        playerMovement.deltaInputHorizontal = (currentTouchPosition.x - playerMovement.previousTouchPosition.x) * 2 * game.deltaTime;
        if(playerMovement.lockDirection.w > 0 && playerMovement.deltaInputHorizontal > 0) playerMovement.deltaInputHorizontal = 0;
        if(playerMovement.lockDirection.z > 0 && playerMovement.deltaInputHorizontal < 0) playerMovement.deltaInputHorizontal = 0;

        if((playerMovement.deltaInputHorizontal < 0 && playerMovement.lastDeltalInput < 0) || (playerMovement.deltaInputHorizontal > 0 && playerMovement.lastDeltalInput > 0)){
            playerMovement.minMaxDelta = math.clamp(playerMovement.minMaxDelta + 0.7 * game.deltaTime,0.125,0.3) 
        }
        else{
            playerMovement.minMaxDelta = 0.125;
        }
        playerMovement.lastDeltalInput = playerMovement.deltaInputHorizontal;

        playerMovement.deltaInputHorizontal = clamp(playerMovement.deltaInputHorizontal, -playerMovement.minMaxDelta, playerMovement.minMaxDelta);
        return 1;
    }

    addRotate(): void {
        var dt = game.deltaTime;
        this.currentGraphicRotate.x = clamp(this.currentGraphicRotate.x - this.movement.lastHorizontal * 25 *dt, -1, 1);
        this.currentGraphicRotate.y = this.currentGraphicRotate.x;
    }

    removeRotate(isMouseDown: boolean): void {
        if(isMouseDown && this.movement.lastHorizontal == 0){
            this.currentGraphicRotate.x = lerp(this.currentGraphicRotate.x, 0 , 0.1);
            this.currentGraphicRotate.y = lerp(this.currentGraphicRotate.y, 0 , 0.1);
        }else{
            this.currentGraphicRotate.y = lerp(this.currentGraphicRotate.y, 0 , 0.3);
        }
    }
}