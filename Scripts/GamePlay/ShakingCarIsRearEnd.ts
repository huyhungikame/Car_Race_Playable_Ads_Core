import { _decorator, CCFloat, clamp, Component, game, lerp, math, Node, Vec3, Vec4 } from 'cc';
import { BaseGraphicCarRotationModule } from './BaseGraphicCarRotationModule';
import MapSplineManager from './MapSplineManager';
const { ccclass, property } = _decorator;

@ccclass('ShakingCarIsRearEnd')
export class ShakingCarIsRearEnd extends BaseGraphicCarRotationModule {
    @property(CCFloat)
    yRatio: number = -15;

    @property(CCFloat)
    zRatio: number = 2.5;

    @property({type: CCFloat }) 
    startXRotate: number = -11.5;

    @property( {type: CCFloat }) 
    xRotate: number = -2.2;

    @property(Vec4)
    offsetMaterial: Vec4 = new Vec4(0,0,0,0);

    @property(CCFloat)
    strength: number = 6.25;

    @property(CCFloat)
    yOffsetRatio : number = 1.5;

    private currentRotate: Vec3 = new Vec3();

    public startGame(startIndex: number): void {
        this.movement.node.setRotation(MapSplineManager.current.roadPoints[startIndex].rotation);
        this.movement.carMaterial.setProperty("offset", this.offsetMaterial);
        this.movement.carMaterial.setProperty("strength", this.strength);
        this.currentRotate = new Vec3(this.startXRotate,0,0);
    }

    updateCarGraphic(dt: number): void {
        this.updateMaterial(dt);
    }

    teleport(): void {
        
    }

    updateCameraValue(cameraValue: number): void {
        this.currentRotate.x = this.startXRotate + cameraValue * this.xRotate;
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