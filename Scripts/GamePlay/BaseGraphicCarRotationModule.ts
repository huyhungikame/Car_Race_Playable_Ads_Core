import { _decorator, Component, Node, Vec2, Vec3 } from 'cc';
import { BaseMovement } from './BaseMovement';
import MapSplineManager from './MapSplineManager';
const { ccclass, property } = _decorator;

@ccclass('BaseGraphicCarRotationModule')
export abstract class BaseGraphicCarRotationModule extends Component {
    @property(Node)
    rotateGraphicNode: Node;

    currentGraphicRotate: Vec2 = new Vec2(0,0);
    protected movement: BaseMovement;

    abstract updateCarGraphic(dt: number): void;
    abstract teleport(): void;

    public setUpMovement(base: BaseMovement): void {
        this.movement = base;
    }

    public resetState(): void {
        this.currentGraphicRotate.set(Vec2.ZERO);
    }

    public startGame(startIndex: number): void {
        this.movement.node.setRotation(MapSplineManager.current.roadPoints[startIndex].rotation);
    }
}