import { _decorator, Component, Node, Vec2, Vec3 } from 'cc';
import { BaseMovement } from './BaseMovement';
import { PlayerMovement } from './PlayerMovement';
const { ccclass, property } = _decorator;

@ccclass('BaseGraphicCarRotationModule')
export abstract class BaseGraphicCarRotationModule extends Component {
    @property(Node)
    rotateGraphicNode: Node;

    currentGraphicRotate: Vec3 =new Vec3();
    protected movement: BaseMovement;

    abstract updateCarGraphic(dt: number): void;
    abstract teleport(): void;
    abstract startGame(startIndex: number): void;
    abstract updateCameraValue(cameraValue: number) : void;
    abstract addRotate(): void;
    abstract removeRotate(isMouseDown: boolean): void;
    public abstract handleInput(currentTouchPosition: Vec2, playerMovement: PlayerMovement): number;

    public setUpMovement(base: BaseMovement): void {
        this.movement = base;
    }

    public resetState(): void {
        this.currentGraphicRotate.set(Vec3.ZERO);
    }
}