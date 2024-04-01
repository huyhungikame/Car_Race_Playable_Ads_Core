import { _decorator, Component, Node, Vec3 } from 'cc';
import { BaseMovement } from './BaseMovement';
const { ccclass, property } = _decorator;

@ccclass('BaseGraphicCarPositionModule')
export abstract class BaseGraphicCarPositionModule extends Component {
    @property(Node)
    positionGraphic: Node;

    public graphicLocalPosition: Vec3 = new Vec3();

    protected movement: BaseMovement;

    public setUpMovement(base: BaseMovement): void {
        this.movement = base;
    }
    
    public resetState(): void {
        this.graphicLocalPosition.set(Vec3.ZERO);
    }

    abstract updateCarGraphic(dt: number): void;
}