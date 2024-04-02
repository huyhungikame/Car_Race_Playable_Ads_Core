import { _decorator, CCInteger, Component, Node, Vec3 } from 'cc';
import { BaseMovement } from './BaseMovement';
import MapSplineManager from './MapSplineManager';
const { ccclass, property } = _decorator;

@ccclass('BaseGraphicCarPositionModule')
export abstract class BaseGraphicCarPositionModule extends Component {
    @property(Node)
    positionGraphic: Node;

    public graphicLocalPosition: Vec3 = new Vec3();
    protected movement: BaseMovement;

    abstract updateCarGraphic(dt: number): void;
    abstract teleport(): void;

    public setUpMovement(base: BaseMovement): void {
        this.movement = base;
    }
    
    public resetState(): void {
        this.graphicLocalPosition.set(Vec3.ZERO);
    }

    public startGame(startIndex: number): void {
        this.movement.length = MapSplineManager.current.roadPoints.length;
        this.movement.currentIndex = startIndex;
        this.movement.node.setPosition(MapSplineManager.current.roadPoints[startIndex].position);
        this.movement.progress = startIndex;
    }
}