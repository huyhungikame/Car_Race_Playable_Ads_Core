import { _decorator, CCBoolean, CCFloat, Component, Node, Vec3 } from 'cc';
import { BaseMovement } from './BaseMovement';
import MapSplineManager from './MapSplineManager';
const { ccclass, property } = _decorator;

@ccclass('BaseGraphicCarPositionModule')
export abstract class BaseGraphicCarPositionModule extends Component {
    @property({ type: CCBoolean }) 
    useFallOut: false;

    @property(Node)
    positionGraphic: Node;

    @property(CCFloat)
    initHorizontal: number = 0.0;

    public graphicLocalPosition: Vec3 = new Vec3();
    private timeFallOut: number = 0.0;
    protected movement: BaseMovement;
    public centerRadius: Vec3 = new Vec3();
    public angleRadius: number = 0;

    abstract updateCarGraphic(dt: number): void;
    abstract teleport(): void;
    abstract moveGraphic(ratio: number): void;
    public abstract startGame(startIndex: number): void;

    public setUpMovement(base: BaseMovement): void {
        this.movement = base;
    }
    
    public resetState(): void {
        this.graphicLocalPosition.set(Vec3.ZERO);
    }

    public handleFallout(dt: number): void {
        if (!this.useFallOut) return;
        var isFallOut = this.movement.isFallOutOfRoad;
        if (isFallOut) this.fallOutOfRoad(dt);
        if (MapSplineManager.current.roadPoints[this.movement.currentIndex].ignoreControl || isFallOut)
        {
            this.movement.isFly(dt);
            return
        }

        if (!isFallOut) this.movement.isGround();
    }

    fallOutOfRoad(dt: number)
    {
        this.graphicLocalPosition.y -= dt * 30;
        this.timeFallOut += dt;
        if(this.timeFallOut > 0.75)
        {
            this.timeFallOut = 0;
            this.movement.fallout();
        }
    }
}