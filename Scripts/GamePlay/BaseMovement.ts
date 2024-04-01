import { _decorator, BoxCollider, CCFloat, CCInteger, clamp01, Component, game, Material, Node, ParticleSystem, Quat, RigidBody, Vec3, Vec4 } from 'cc';
import { CheckPointManager } from './CheckPointManager';
import MapSplineManager from './MapSplineManager';
import { BaseGraphicCarRotationModule } from './BaseGraphicCarRotationModule';
import { BaseGraphicCarPositionModule } from './BaseGraphicCarPositionModule';
const { ccclass, property } = _decorator;

@ccclass('BaseMovement')
export abstract class BaseMovement extends Component {
    public currentSpeed: number = 0;
    public length: number = 0;
    public currentIndex: number = 0;
    public maxSpeed: number = 100;
    public isStartGame: boolean = false;

    protected isFallOutOfRoad: boolean = false;
    protected isCheckGround: boolean = false;
    protected onDie: boolean = false;

    private currentPosition: Vec3 = new Vec3();
    private currentRotation: Quat = new Quat();
    private currentEulerAngles: Vec3 = new Vec3();
    private currentCaculatorPosition: Vec3 = new Vec3();
    private currentPoint1Rotation: Vec3 = new Vec3();
    private currentPoint2Rotation: Vec3 = new Vec3();

    @property({ group: { name: 'Car Settings' , displayOrder: 1}, type: CCInteger }) 
    public rank: number = 0;

    @property({ group: { name: 'Car Settings' , displayOrder: 1}, type: CCFloat }) 
    public progress: number = 0;

    @property({ group: { name: 'Car Settings' , displayOrder: 1}, type: CCFloat }) 
    protected speedFactor: number = 0.25;

    @property({ group: { name: 'Module' , displayOrder: 4}, type: BaseGraphicCarPositionModule }) 
    protected positionModule: BaseGraphicCarPositionModule;

    @property({ group: { name: 'Module' , displayOrder: 4}, type: BaseGraphicCarRotationModule }) 
    protected rotationModule: BaseGraphicCarRotationModule;

    //#region Physic Propeties

    @property({ group: { name: 'Physic' , displayOrder: 2}, type: Node }) 
    public carGraphic: Node;

    @property({ group: { name: 'Physic' , displayOrder: 2}, type: RigidBody }) 
    protected physicBody: RigidBody;

    private graphicLocalPostLerpTime: number = 0.0;
    //  down,up, left , right
    protected lockDirection: Vec4 = new Vec4(0,0,0,0);
    private currentPhysicBodyPosition = new Vec3();

    //#endregion

    //#region Effect Propeties

    @property({ group: { name: 'Effect' , displayOrder: 3}, type: ParticleSystem }) 
    private explosionCar : ParticleSystem;

    @property({ group: { name: 'Effect' , displayOrder: 3}, type: BoxCollider }) 
    private colliderNode: BoxCollider;

    @property({ group: { name: 'Effect' , displayOrder: 3}, type: Material }) 
    carMaterial: Material;

    private currentWheelRotate: number = 0.0;

    //#endregion

    protected onLoad(): void {
        this.positionModule.setUpMovement(this);
        this.rotationModule.setUpMovement(this);
    }

    protected setPosition(dt: number): void{
        var speedLength = this.currentSpeed * this.speedFactor * dt;
        this.node.getPosition(this.currentPosition);
        this.node.getRotation(this.currentRotation)
        this.currentRotation.getEulerAngles(this.currentEulerAngles);
        var roadPoints = MapSplineManager.current.roadPoints;

        while (speedLength > 0)
        {
            if (this.currentIndex == this.length - 2) return;
            var roadPoint1 = roadPoints[this.currentIndex];
            var roadPoint2 = roadPoints[this.currentIndex + 1];
            this.currentCaculatorPosition.set(roadPoint2.position);
            var distanceCompletedPath = (this.currentCaculatorPosition.subtract(this.currentPosition)).length();
            if (speedLength > distanceCompletedPath)
            {
                this.currentPosition.set(roadPoint2.position);
                speedLength -= distanceCompletedPath;
                this.currentIndex++;
                this.progress = this.currentIndex;
                continue;
            }

            var ratio = (roadPoint1.distanceToNext - distanceCompletedPath + speedLength) / roadPoint1.distanceToNext;
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
        this.rotationModule.updateCarGraphic(dt);
    }

    //#region Physic Handle

    public applyPhysic(normal: Vec3): void {
        this.graphicLocalPostLerpTime = 0;
        this.resteLockDirection();
        if(normal.x > 0.75) this.lockDirection.w = normal.x;
        if(normal.x < 0.75) this.lockDirection.z = -normal.x;
        if(normal.z > 0.75) this.lockDirection.x = normal.z;
        if(normal.z < 0.75) this.lockDirection.y = -normal.z;
    }
    
    collisionExit(): void 
    {
        this.resteLockDirection();
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
        this.physicBody.setLinearVelocity(this.currentPhysicBodyPosition);
        if(this.currentSpeed < 2) this.graphicLocalPostLerpTime += 0.8;
        this.graphicLocalPostLerpTime = clamp01(this.graphicLocalPostLerpTime + game.deltaTime * 0.05);
    }

    //#endregion

    //#region Effect Handle

    materialWheel(dt: number) : void
    {
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
        this.rotationModule.resetState();
        this.explosionCar.node.active = true;
        this.explosionCar.play();
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
        this.rotationModule.localGraphicAngle = this.carGraphic.eulerAngles;
    }

    abstract revivePosition(index: number) : void;

    //#endregion
}