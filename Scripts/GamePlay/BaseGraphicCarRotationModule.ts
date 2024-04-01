import { _decorator, Component, Node, Vec2, Vec3 } from 'cc';
import { BaseMovement } from './BaseMovement';
const { ccclass, property } = _decorator;

@ccclass('BaseGraphicCarRotationModule')
export abstract class BaseGraphicCarRotationModule extends Component {
    @property(Node)
    rotateGraphicNode: Node;
 
    currentGraphicRotate: Vec2 = new Vec2(0,0);
    localGraphicAngle: Vec3;


    protected movement: BaseMovement;

    public setUpMovement(base: BaseMovement): void {
        this.movement = base;
    }

    public resetState(): void {
        this.currentGraphicRotate.set(Vec2.ZERO);
    }
    
    abstract updateCarGraphic(dt: number): void;
}