import { _decorator, CCBoolean, CCFloat, Component, game, lerp, Node, randomRange, Vec2, Vec3 } from 'cc';
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
    public targetForceY: number = 0;
    
    @property(CCFloat)
    private lastTargetForceY: number = 0;

    @property({ group: { name: 'Force Fly' , displayOrder: 1}, type: CCFloat }) 
    protected upSpeed: number = 1;

    @property({ group: { name: 'Force Fly' , displayOrder: 1}, type: CCFloat }) 
    protected downSpeed: number = 1;

    @property({ group: { name: 'Force Fly' , displayOrder: 1}, type: CCFloat }) 
    private currentForceRatio: number = 1;

    @property({ group: { name: 'Force Fly' , displayOrder: 1}, type: Vec2 }) 
    private randomRotate: Vec2 = new Vec2(-10,10);

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
            || !this.canControl()
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
        this.graphicLocalPosition.z += dt * 60;
        this.timeFallOut += dt;
        if(this.timeFallOut > 1.25)
        {
            this.timeFallOut = 0;
            this.movement.fallout();
        }
    }

    addForceFly(forceDirection: Vec2,forceRange: Vec2, ratioSpeed: number): void {
        if(this.graphicLocalPosition.x <= forceRange.x) return;
        if(this.graphicLocalPosition.x >= forceRange.y) return;
        this.targetForceY = lerp(forceDirection.x, forceDirection.y, ratioSpeed);
        console.log(this.targetForceY)
        this.currentForceRatio = 0;
    }

    canControl(): boolean{
        return this.graphicLocalPosition.y < 0.05;
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
        if(this.lastTargetForceY > 20){
            CameraShake.current.shake2();
        }else{
            CameraShake.current.shake();
        }
        this.movement.rotationModule.currentGraphicRotate.y += randomRange(this.randomRotate.x,this.randomRotate.y);
    }
}