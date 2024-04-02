import { _decorator, CCBoolean, CCInteger, clamp01, Component, Node, Vec3 } from 'cc';
import { BaseMovement } from './BaseMovement';
import MapSplineManager from './MapSplineManager';
const { ccclass, property } = _decorator;

@ccclass('BaseGraphicCarPositionModule')
export abstract class BaseGraphicCarPositionModule extends Component {
    @property({ type: CCBoolean }) 
    useFallOut: false;

    @property(Node)
    positionGraphic: Node;

    public graphicLocalPosition: Vec3 = new Vec3();
    private timeFallOut: number = 0.0;
    protected movement: BaseMovement;

    abstract updateCarGraphic(dt: number): void;
    abstract teleport(): void;
    abstract moveGraphic(): void;

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