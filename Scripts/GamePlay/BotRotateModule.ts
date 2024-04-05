import { _decorator, Component, Node, clamp01, Quat, Vec3, clamp, lerp, game, math, Vec2} from 'cc';
import { BaseGraphicCarRotationModule } from './BaseGraphicCarRotationModule';
import MapSplineManager from './MapSplineManager';
import { PlayerMovement } from './PlayerMovement';
const { ccclass, property } = _decorator;

@ccclass('BotRotateModule')
export class BotRotateModule extends BaseGraphicCarRotationModule {
    private currentRotate: Quat = new Quat();
    private currentEulerAngles: Vec3 = new Vec3();
    private currentRotateChange: number = 0;
    private currentScaler: Vec3 = new Vec3();

    public handleInput(_currentTouchPosition: Vec2, _playerMovement: PlayerMovement): number {
        return 1;
    }

    addRotate(): void {
        if (Math.abs(this.movement.lastHorizontal) > 0.001)
        {
            var horizontalValue = (this.movement.lastHorizontal * 300 * game.deltaTime) * 15;
            var newRotate = clamp(this.currentGraphicRotate.y + horizontalValue, -15, 15);
            this.currentRotateChange = newRotate - this.currentGraphicRotate.y;
            this.currentGraphicRotate.y = newRotate;
        }

        var detal = Math.abs(this.currentRotateChange);
        detal = clamp(detal,0.1,0.2);
        this.currentGraphicRotate.y = lerp(this.currentGraphicRotate.y, 0 , detal);
    }
    removeRotate(_isMouseDown: boolean): void {
        
    }

    updateCameraValue(_cameraValue: number): void {
      
    }
    public startGame(startIndex: number): void {
        this.movement.node.setRotation(MapSplineManager.current.roadPoints[startIndex].rotation);
        this.updateCarGraphic(0);
    }

    updateCarGraphic(_dt: number): void {
        var offsetGraphic = PlayerMovement.current.progress + 0.75 - this.movement.progress;
        var offset = 1 - clamp01(offsetGraphic / 2.55);
        PlayerMovement.current.rotationModule.rotateGraphicNode.getRotation(this.currentRotate);
        this.currentRotate.getEulerAngles(this.currentEulerAngles);
        this.currentEulerAngles.y = this.currentGraphicRotate.y;
        this.rotateGraphicNode.eulerAngles = this.currentEulerAngles;
        this.rotateGraphicNode.getScale(this.currentScaler);
        this.currentScaler.z =  clamp(PlayerMovement.current.rotationModule.rotateGraphicNode.scale.z * offset,0.2,1);
        this.rotateGraphicNode.setScale(this.currentScaler);
    }

    teleport(): void {
        
    }
}


