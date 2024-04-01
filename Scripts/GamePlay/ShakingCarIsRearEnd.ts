import { _decorator, Component, Node } from 'cc';
import { BaseGraphicCarRotationModule } from './BaseGraphicCarRotationModule';
const { ccclass, property } = _decorator;

@ccclass('ShakingCarIsRearEnd')
export class ShakingCarIsRearEnd extends BaseGraphicCarRotationModule {
    updateCarGraphic(dt: number): void {
        
    }
}