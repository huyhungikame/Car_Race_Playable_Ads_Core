import { _decorator, BoxCollider, CCFloat, CCInteger, clamp, clamp01, Component, game, lerp, Material, Node, ParticleSystem, Quat, RigidBody, Tween, tween, Vec2, Vec3, Vec4 } from 'cc';
import { CheckPointManager } from './CheckPointManager';
import MapSplineManager from './MapSplineManager';
import { BaseGraphicCarRotationModule } from './BaseGraphicCarRotationModule';
import { BaseGraphicCarPositionModule } from './BaseGraphicCarPositionModule';
import { ScriptExtensions } from '../ScriptExtensions';
const { ccclass, property } = _decorator;

@ccclass('BaseMovement')
export abstract class BaseMovement extends Component {
    @property({ group: { name: 'Settings' , displayOrder: 1}, type: CCFloat }) 
    public currentSpeed: number = 0;
    public length: number = 0;
    public currentIndex: number = 0;
    public maxSpeed: number = 100;
    public currentNitroSpeed: number = 1;
    public currentBoosterSpeed: Vec3 = new Vec3(1, 1, 1);
    public currentBoosterMaxSpeed: number = 1.5;
    public isStartGame: boolean = false;
    public currentNitroBoosterValue = new Vec2(0,0);

    public isFallOutOfRoad: boolean = false;
    public isCheckGround: boolean = false;
    public isFlying: boolean = false;
    public onDie: boolean = false;
    lastHorizontal: number = 0.0;
    deltaInputHorizontal: number = 0.0;
    isNitro: boolean = false;

    private currentPosition: Vec3 = new Vec3();
    private currentRotation: Quat = new Quat();
    private currentEulerAngles: Vec3 = new Vec3();
    private currentCaculatorPosition: Vec3 = new Vec3();
    private currentPoint1Rotation: Vec3 = new Vec3();
    private currentPoint2Rotation: Vec3 = new Vec3();

    @property({ group: { name: 'Settings' , displayOrder: 1}, type: CCInteger }) 
    public rank: number = 0;

    @property({ group: { name: 'Settings' , displayOrder: 1}, type: CCFloat }) 
    public progress: number = 0;

    @property({ group: { name: 'Settings' , displayOrder: 1}, type: CCFloat }) 
    protected speedFactor: number = 0.25;

    @property({ group: { name: 'Settings' , displayOrder: 1}, type: CCFloat }) 
    public maxNitroFactor: number = 1;

    @property({ group: { name: 'Settings' , displayOrder: 1}, type: CCFloat }) 
    ratioRustSpeedValue: number = 1;

    @property({ group: { name: 'Settings' , displayOrder: 1}, type: CCFloat }) 
    ratioRustSpeedAmount: number = 0;

    @property({ group: { name: 'Settings' , displayOrder: 1} }) 
    ratioRustSpeedKeep: Vec2 = new Vec2();

    @property({ group: { name: 'Module' , displayOrder: 4}, type: BaseGraphicCarPositionModule }) 
    public positionModule: BaseGraphicCarPositionModule;

    @property({ group: { name: 'Module' , displayOrder: 4}, type: BaseGraphicCarRotationModule }) 
    public rotationModule: BaseGraphicCarRotationModule;

    //#region Physic Propeties

    @property({ group: { name: 'Physic' , displayOrder: 2}, type: RigidBody }) 
    public physicBody: RigidBody;

    private graphicLocalPostLerpTime: number = 0.0;
    //  down,up, left , right
    public lockDirection: Vec4 = new Vec4(0,0,0,0);
    private currentPhysicBodyPosition = new Vec3();
    private revertCurrentPhysicBodyPosition = new Vec3();

    //#endregion

    //#region Effect Propeties

    @property({ group: { name: 'Effect' , displayOrder: 3}, type: ParticleSystem }) 
    private explosionCar : ParticleSystem;

    @property({ group: { name: 'Effect' , displayOrder: 3}, type: BoxCollider }) 
    private colliderNode: BoxCollider;

    @property({ group: { name: 'Effect' , displayOrder: 3}, type: Material }) 
    carMaterial: Material;

    @property({ group: { name: 'Effect' , displayOrder: 3}, type: Node }) 
    nitroEffect: Node;

    private currentWheelRotate: number = 0.0;
    handleMaterials: boolean = false;

    //#endregion

    protected onLoad(): void {
        this.handleMaterials = this.carMaterial != null;
        this.positionModule.setUpMovement(this);
        this.rotationModule.setUpMovement(this);
    }

    updateRustSpeedValue(): void {
        var progressValue = this.progress / this.length;
        this.ratioRustSpeedValue =  1 + ScriptExtensions.inverseLerp(this.ratioRustSpeedKeep.x, this.ratioRustSpeedKeep.y , progressValue) * this.ratioRustSpeedAmount;
    }

    protected setPosition(dt: number): void{
        var speedLength = this.currentSpeed * this.speedFactor * this.ratioRustSpeedValue * dt * this.currentNitroSpeed * this.currentBoosterSpeed.x;
        var isForward = speedLength >= 0;
        if (!isForward) speedLength *= -1;
        this.node.getPosition(this.currentPosition);
        this.node.getRotation(this.currentRotation);
        this.currentRotation.getEulerAngles(this.currentEulerAngles);
        var roadPoints = MapSplineManager.current.roadPoints;
        var nextIndex = isForward ? 1 : -1;
        while (speedLength > 0)
        {
            if (this.currentIndex == this.length - 2 || this.currentIndex <= 1) return;
            var roadPoint1 = roadPoints[this.currentIndex];
            var roadPoint2 = roadPoints[this.currentIndex + nextIndex];
            this.currentCaculatorPosition.set(roadPoint2.position);
            var distanceCompletedPath = (this.currentCaculatorPosition.subtract(this.currentPosition)).length();
            if (speedLength > distanceCompletedPath)
            {
                this.currentPosition.set(roadPoint2.position);
                speedLength -= distanceCompletedPath;
                this.currentIndex += nextIndex;
                this.progress = this.currentIndex;
                var addForce = roadPoints[this.currentIndex].addForce;
                if( nextIndex > 0 
                    && this.currentSpeed > 0 
                    && (addForce.x + addForce.y) > 0 )  this.positionModule.addForceFly(addForce, roadPoints[this.currentIndex].addForceRance, (this.currentSpeed * this.currentNitroSpeed) / (this.maxSpeed * this.maxNitroFactor))
                continue;
            }

            var distanceToNext = isForward ? roadPoint1.distanceToNext : roadPoint2.distanceToNext;
            var ratio = (distanceToNext - distanceCompletedPath + speedLength) / distanceToNext;
            Vec3.lerp(this.currentPosition,roadPoint1.position, roadPoint2.position, ratio);

            this.convertVector(this.currentPoint1Rotation,this.currentEulerAngles,roadPoint1.eulerAngles);
            this.convertVector(this.currentPoint2Rotation,this.currentEulerAngles,roadPoint2.eulerAngles);
            Vec3.lerp(this.currentEulerAngles,this.currentPoint1Rotation, this.currentPoint2Rotation, ratio);
            speedLength = 0;
            this.progress = this.currentIndex + ratio;
        }

        this.node.setPosition(this.currentPosition);
        this.node.eulerAngles = this.currentEulerAngles;
    }

    protected convertVector(out:Vec3, origin: Vec3, convert: Vec3): void
    {
        out.set(convert);
        var x = origin.x - convert.x;
        if(x > 250) out.x += 360;
        if(x < -250) out.x -= 360;

        var y = origin.y - convert.y;
        if(y > 250) out.y += 360;
        if(y < -250) out.y -= 360;
    }

    protected updateCarGraphic(dt: number): void
    {
        this.positionModule.updateCarGraphic(dt);
        this.positionModule.handleFallout(dt);
        this.rotationModule.updateCarGraphic(dt);
    }

    isFly(dt: number){
        this.isCheckGround = true;
        var ratio = clamp01(ScriptExtensions.inverseLerp(5, 55, Math.abs(this.currentSpeed)) + 0.1);
        this.lastHorizontal = this.positionModule.graphicLocalPosition.x;
        this.positionModule.graphicLocalPosition.x = this.positionModule.graphicLocalPosition.x + this.deltaInputHorizontal * ratio * 0.3;
    
        this.lastHorizontal = this.positionModule.graphicLocalPosition.x - this.lastHorizontal;
    
        if (this.lastHorizontal != 0)
        {
            this.lastHorizontal = (ScriptExtensions.inverseLerp(-0.05, 0.05, this.lastHorizontal) - 0.5) * 2;
            this.rotationModule.currentGraphicRotate.y = clamp(this.rotationModule.currentGraphicRotate.y + this.lastHorizontal * 1.5, -25, 25);
        }
    }

    isGround() : void
    {
        if(!this.isCheckGround) return;
        this.isCheckGround = false;
        var roadLateral = MapSplineManager.current.roadLaterals[MapSplineManager.current.roadPoints[this.currentIndex].lateralIndex];
        var offset = roadLateral.maxOffset;
        if(offset == 0){
            this.isFallOutOfRoad = true;
            return;
        }
        if(Math.abs(this.positionModule.graphicLocalPosition.x) <= offset + 2) return;
        this.isFallOutOfRoad = true;
    }

    //#region Physic Handle

    
    //  down,up, left , right
    public applyPhysic(normal: Vec3): void {
        this.graphicLocalPostLerpTime = 0;
        if(normal.x > 0.25) this.lockDirection.w += normal.x;
        if(normal.x < -0.25) this.lockDirection.z += -normal.x;
        if(normal.z > 0.25) this.lockDirection.x += normal.z;
        if(normal.z < -0.25) this.lockDirection.y += -normal.z;
    }
    
    protected lateUpdate(dt: number): void {
        this.beforeLateUpdate(dt);
        this.onLateUpdate(dt);
    }

    abstract beforeLateUpdate(dt: number) : void;

    abstract onLateUpdate(dt: number): void;

    collisionExit(): void 
    {
        this.resteLockDirection();
        if(this.currentSpeed < 0) this.currentSpeed = lerp(this.currentSpeed, 0,0.8);
    }

    resteLockDirection(): void
    {
        this.lockDirection.x = 0;
        this.lockDirection.y = 0;
        this.lockDirection.z = 0;
        this.lockDirection.w = 0;
    }

    updateGraphicLocalPos(): void{
        this.physicBody.node.getPosition(this.currentPhysicBodyPosition);
        this.currentPhysicBodyPosition.y = 0;
        Vec3.lerp(this.currentPhysicBodyPosition,this.currentPhysicBodyPosition, Vec3.ZERO, this.graphicLocalPostLerpTime);
        this.physicBody.node.setPosition(this.currentPhysicBodyPosition);
        this.revertCurrentPhysicBodyPosition.set(this.currentPhysicBodyPosition);
        this.physicBody.setLinearVelocity(this.revertCurrentPhysicBodyPosition.normalize());
        if(Math.abs(this.currentSpeed) < 2) this.graphicLocalPostLerpTime += 0.8;
        this.graphicLocalPostLerpTime = clamp01(this.graphicLocalPostLerpTime + game.deltaTime * 0.05);
    }

    //#endregion

    //#region Effect Handle

    materialWheel(dt: number) : void
    {
        if(!this.handleMaterials) return;
        this.currentWheelRotate += dt * this.currentSpeed * 3.6;
        if(this.currentWheelRotate > 360) this.currentWheelRotate -= 360;
        this.carMaterial.setProperty("wheelRotate", this.currentWheelRotate);
    }

    //#endregion

    //#region GameState

    resetState(): void
    {
        this.positionModule.resetState();
        this.rotationModule.resetState();
        this.physicBody.node.setPosition(Vec3.ZERO);
        this.physicBody.clearState();
        this.graphicLocalPostLerpTime = 0.0;
        this.isFallOutOfRoad = false;
        this.isCheckGround = false;
    }

    die() : void 
    {
        if(this.onDie) return;
        this.onDie = true;
        this.currentSpeed = 0;
        // this.rotationModule.resetState();
        if(!this.isFallOutOfRoad){
            this.explosionCar.node.active = true;
            this.explosionCar.play();
        }

        this.colliderNode.enabled = false;
    }

    revive() : void 
    {
        this.onDie = false;
        this.explosionCar.node.active = false;
        this.resetState();
        var reviveContent = CheckPointManager.current.revive();
        this.currentIndex = reviveContent.indexRevive;
        this.revivePosition(this.currentIndex);
        this.progress = this.currentIndex;
        this.colliderNode.enabled = true;
        var rotation = MapSplineManager.current.roadPoints[this.currentIndex].eulerAngles;
        this.convertVector(this.node.eulerAngles,rotation,reviveContent.rotation);
        this.rotationModule.teleport();
    }

    abstract revivePosition(index: number) : void;
    abstract fallout() : void;

    //#endregion

    addBooster() : void {
        Tween.stopAllByTarget(this.currentBoosterSpeed)
        tween(this.currentBoosterSpeed)
            .to(0.5, {x : this.currentBoosterMaxSpeed}, {easing: "cubicOut"})
            .to(0.65,{x : 1})
            .union()
            .start()
    }

    addNitro(value : Vec2): void {
        this.currentNitroBoosterValue.x = clamp01((this.isNitro ? value.y : value.x) + this.currentNitroBoosterValue.x);
        if(this.currentNitroBoosterValue.x >= 1){
            this.isNitro = true;
            if(this.nitroEffect != null) this.nitroEffect.active = true;
        }
    }
}