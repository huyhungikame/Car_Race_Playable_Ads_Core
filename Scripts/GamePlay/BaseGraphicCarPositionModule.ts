import { _decorator, CCBoolean, CCFloat, Component, game, lerp, Node, Vec2, Vec3 } from 'cc';
import { BaseMovement } from './BaseMovement';
import MapSplineManager from './MapSplineManager';
import { ScriptExtensions } from '../ScriptExtensions';
import { CameraShake } from './Feels/CameraShake';
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

    @property(CCFloat)
    public currentForceY: number = 0;

    @property(CCFloat)
    public targetForceY: number = 0;
    
    @property(CCFloat)
    private lastTargetForceY: number = 0;

    @property({ group: { name: 'Force Fly' , displayOrder: 1}, type: CCFloat }) 
    protected upSpeed: number = 1;

    @property({ group: { name: 'Force Fly' , displayOrder: 1}, type: CCFloat }) 
    protected downSpeed: number = 1;

    @property({ group: { name: 'Force Fly' , displayOrder: 1}, type: CCFloat }) 
    private currentForceRatio: number = 1;

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
        if (MapSplineManager.current.roadPoints[this.movement.currentIndex].ignoreControl 
            || isFallOut 
            || this.currentForceY > 0
        ) {
            this.movement.isFlying = true;
            this.movement.isFly(dt);
            return
        }

        this.movement.isFlying = false;
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

    addForceFly(forceDirection: Vec2, ratioSpeed: number): void {
        this.targetForceY = lerp(forceDirection.x, forceDirection.y, ratioSpeed);
        this.currentForceRatio = 0;
    }

    updateForceFly(): void {
        if(this.movement.isFallOutOfRoad) return;
        if(this.currentForceRatio >= 1) return;
        var dt = game.deltaTime;
        if(this.targetForceY > 0) {
            this.currentForceRatio += dt * this.upSpeed;
            var currentRatio = ScriptExtensions.easeOutSine(this.currentForceRatio);
            this.graphicLocalPosition.y = currentRatio * this.targetForceY;
            if(this.currentForceRatio >= 1){
                this.lastTargetForceY = this.targetForceY;
                this.targetForceY =  0;
                this.currentForceRatio = 0;
            }
        } else{
            this.currentForceRatio += dt * this.downSpeed;
            var currentRatio = ScriptExtensions.easeInSine(this.currentForceRatio);
            this.graphicLocalPosition.y = (1 - currentRatio) * this.lastTargetForceY;
            if(this.graphicLocalPosition.y <= 0) {
                this.graphicLocalPosition.y = 0;
                this.forceFlyGround();
            }
        }
    }

    forceFlyGround(): void {
        CameraShake.current.shake();
    }
}