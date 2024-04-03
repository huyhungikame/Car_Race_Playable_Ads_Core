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

    public handleInput(_currentTouchPosition: Vec2, _playerMovement: PlayerMovement): number {
        return 1;
    }

    addRotate(): void {
       
    }
    removeRotate(_isMouseDown: boolean): void {
        if (Math.abs(this.movement.lastHorizontal) > 0.07)
        {
            var newRotate = clamp(this.currentGraphicRotate.x - this.movement.lastHorizontal * 30 * game.deltaTime, -1, 1);
            this.currentRotateChange = newRotate - this.currentGraphicRotate.x;
            this.currentGraphicRotate.x = newRotate;
        }

        var detal = Math.abs(this.currentRotateChange);
        detal = clamp(detal,0.1,0.2);
        this.currentGraphicRotate.x = lerp(this.currentGraphicRotate.x, 0 , detal);
    }

    updateCameraValue(_cameraValue: number): void {
      
    }
    public startGame(startIndex: number): void {
        this.movement.node.setRotation(MapSplineManager.current.roadPoints[startIndex].rotation);
        this.updateCarGraphic(0);
    }

    updateCarGraphic(_dt: number): void {
        var offsetGraphic = Math.abs(PlayerMovement.current.progress - this.movement.progress);
        var offset = 1 - clamp01(offsetGraphic / 6);
        PlayerMovement.current.rotationModule.rotateGraphicNode.getRotation(this.currentRotate);
        this.currentRotate.getEulerAngles(this.currentEulerAngles);
        this.currentEulerAngles.multiply3f(offset,1,1);
        this.rotateGraphicNode.eulerAngles = this.currentEulerAngles;
    }

    teleport(): void {
        
    }
}


