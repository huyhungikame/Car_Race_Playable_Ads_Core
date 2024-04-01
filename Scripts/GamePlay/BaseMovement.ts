import { _decorator, BoxCollider, CCFloat, CCInteger, clamp, clamp01, Component, game, Material, Node, ParticleSystem, Quat, RigidBody, Vec2, Vec3, Vec4 } from 'cc';
import { CheckPointManager } from './CheckPointManager';
import MapSplineManager from './MapSplineManager';
const { ccclass, property } = _decorator;

@ccclass('BaseMovement')
export abstract class BaseMovement extends Component {
    public currentSpeed: number = 0;
    public length: number = 0;
    public currentIndex: number = 0;
    public maxSpeed: number = 100;
    public isStartGame: boolean = false;

    @property(Node)
    carGraphic: Node;

    @property(Node)
    player: Node

    @property(RigidBody)
    physicBody: RigidBody;

    @property(ParticleSystem)
    explosionCar : ParticleSystem;

    @property(Material)
    carMaterial: Material;

    @property(CCFloat)
    speedFactor: number = 0.25;

    @property(CCFloat)
    progress: number = 0;

    @property(CCInteger)
    rank: number = 0;

    @property(BoxCollider)
    colliderNode: BoxCollider;

    @property(Node)
    rotateGraphicNode: Node;

    // graphicOffset : Vec3 = new Vec3(0,0,0);
    xOffset: number = 0.0;
    yOffset: number = 0.0;
    graphicLerpTime: number = 0.0;
    currentGraphicRotate: Vec2 = new Vec2(0,0);
    localGraphicAngle: Vec3;
    graphicLocalPosition: Vec3;
    isFallOutOfRoad: boolean = false;
    isCheckGround: boolean = false;
    onDie: boolean = false;

    //  down,up, left , right
    lockDirection: Vec4 = new Vec4(0,0,0,0);

    resetState(): void
    {
        // this.graphicOffset = new Vec3(0,0,0);
        this.physicBody.node.setPosition(new Vec3(0,0,0));
        this.physicBody.clearState();
        this.xOffset = 0.0;
        this.yOffset = 0.0;
        this.graphicLerpTime = 0.0;
        this.currentGraphicRotate = new Vec2(0,0);
        this.isFallOutOfRoad = false;
        this.isCheckGround = false;
    }

    applyPhysic(normal: Vec3): void {
        this.graphicLerpTime = 0;
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

    UpdateGraphicOffset(): void{
        var currentPosition = new Vec3(this.physicBody.node.position);
        currentPosition.y = 0;
        this.physicBody.node.position = Vec3.lerp(new Vec3(),currentPosition, Vec3.ZERO, this.graphicLerpTime);
        this.physicBody.setLinearVelocity(new Vec3(currentPosition.multiplyScalar(-1)));
        this.physicBody.node.position = new Vec3(this.physicBody.node.position).multiply3f(1,0,1);
        if(this.currentSpeed < 2) this.graphicLerpTime += 0.8;
        this.graphicLerpTime = clamp01(this.graphicLerpTime + game.deltaTime * 0.05);
    }

    inverseLerp(a: number, b: number, value: number): number {
        if (a !== b) {
            return clamp01((value - a) / (b - a));
        } else {
            return 0;
        }
    }

    setPosition(dt: number): void{
        var speedLength = this.currentSpeed * this.speedFactor * dt;
        var position = new Vec3(this.player.position);
        var rotation = new Vec3(this.player.eulerAngles);
        var roadPoints = MapSplineManager.current.roadPoints;
        while (speedLength > 0)
        {
            if (this.currentIndex == this.length - 2) return;
            var roadPoint1 = roadPoints[this.currentIndex];
            var roadPoint2 = roadPoints[this.currentIndex + 1];
            var distanceCompletedPath = (roadPoint2.position.clone().subtract(position)).length();
            if (speedLength > distanceCompletedPath)
            {
                position = roadPoint2.position.clone();
                speedLength -= distanceCompletedPath;
                this.currentIndex++;
                this.progress = this.currentIndex;
                continue;
            }

            var ratio = (roadPoint1.distanceToNext - distanceCompletedPath + speedLength) / roadPoint1.distanceToNext;
            Vec3.lerp(position,roadPoint1.position, roadPoint2.position, ratio);

            var rotation1 = this.convertVector(rotation,roadPoint1.eulerAngles.clone());
            var rotation2 = this.convertVector(rotation,roadPoint2.eulerAngles.clone());
            Vec3.lerp(rotation,rotation1, rotation2, ratio);
            speedLength = 0;
            this.progress = this.currentIndex + ratio;
        }

        this.player.position = position;
        this.player.eulerAngles = rotation;
    }

    convertVector(origin: Vec3,convert: Vec3): Vec3
    {
        var result = convert.clone();

        var xOffset = origin.x - convert.x;
        if(xOffset > 250) result.x += 360;
        if(xOffset < -250) result.x -= 360;

        var yOffset = origin.y - convert.y;
        if(yOffset > 250) result.y += 360;
        if(yOffset < -250) result.y -= 360;

        return result;
    }

    updateCarGraphic(dt: number): void
    {
        var roadLateral = MapSplineManager.current.roadLaterals[MapSplineManager.current.roadPoints[this.currentIndex].lateralIndex];
        var ignoreControl = MapSplineManager.current.roadPoints[this.currentIndex].ignoreControl;
        var offset = roadLateral.maxOffset;
        if (!ignoreControl && !this.isFallOutOfRoad && !this.isCheckGround) this.xOffset = clamp(this.xOffset, -offset, offset);
        // var radius = roadLateral.radius;
        
        // if (radius > 0 && !this.isFallOutOfRoad)
        // {
        
            // var position =  new Vec3(this.player.position);
            // var rotation = new Quat(this.player.rotation);
            // var angle = this.xOffset / radius;
            // var centerUp = Vec3.transformQuat(new Vec3(), Vec3.UP, rotation).multiplyScalar(radius);
            // var center = new Vec3(position).add(centerUp)
            // var degress = (-180.0 / Math.PI * angle);
            // var radiusRotation = Quat.fromAxisAngle(new Quat(),Vec3.transformQuat(new Vec3(), Vec3.FORWARD, rotation),degress * (Math.PI / 180))
            // var down = Vec3.transformQuat(new Vec3(), new Vec3(0,-1,0), rotation).multiplyScalar(radius);
            // var direction = Vec3.transformQuat(new Vec3(),down,radiusRotation);
            // var radiusPosition = direction.normalize().multiplyScalar(radius).add(center);
            // radiusPosition.x *= -1;
            // var invert = this.player.inverseTransformPoint(new Vec3(),radiusPosition);
            
            // this.graphicLocalPosition =  new Vec3(this.graphicOffset).add(invert);
            // this.carGraphic.position = Vec3.lerp(new Vec3(),this.graphicLocalPosition, this.carGraphic.position, 0.65);

            //Rotation

            // this.UpdateGraphicOffset();
            // var up =  new Vec3(-center.x,center.y,center.z).subtract(this.carGraphic.worldPosition).normalize();
            // var forwardRotate = Vec3.transformQuat(new Vec3(), Vec3.FORWARD, this.player.worldRotation).normalize();
            // var upOffset = Quat.fromAxisAngle(new Quat(),forwardRotate,  angle * -100 * (Math.PI / 180));
            // up = Vec3.transformQuat(new Vec3(), up, upOffset);
            // var forwardAngle = Quat.fromAxisAngle(new Quat(),up,this.currentGraphicRotate * (Math.PI / 180));
            // forwardRotate.multiplyScalar(-1);
            // var forward = Vec3.transformQuat(new Vec3(), forwardRotate, forwardAngle).normalize();
            // this.carGraphic.worldRotation = Quat.fromViewUp(new Quat(),forward,up);
            // this.localGraphicAngle = this.carGraphic.eulerAngles;
            // return;
        // }

        this.graphicLocalPosition = new Vec3( this.xOffset , this.yOffset,0);
        this.carGraphic.position = Vec3.lerp(new Vec3(),this.graphicLocalPosition, this.carGraphic.position, 0.65);
        this.UpdateGraphicOffset();
        // this.localGraphicAngle = Vec3.lerp(new Vec3(),new Vec3(0, this.currentGraphicRotate, 0), this.localGraphicAngle, 0.35);
        // this.carGraphic.eulerAngles = this.localGraphicAngle;
        this.materialWheel(dt);
    }

    die() : void 
    {
        if(this.onDie) return;
        this.onDie = true;
        this.currentSpeed = 0;
        this.currentGraphicRotate = new Vec2(0,0);
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
        var rotation = MapSplineManager.current.roadPoints[this.currentIndex].eulerAngles.clone();
        this.progress = this.currentIndex;
        this.colliderNode.enabled = true;
    
        if (Math.abs(rotation.y - reviveContent.rotation.y) > 150) rotation.y -= 360;
        if (Math.abs(rotation.x - reviveContent.rotation.x) > 150) rotation.x -= 360;
    
        this.player.eulerAngles = rotation;
        this.localGraphicAngle = this.carGraphic.eulerAngles;
    }

    abstract revivePosition(index: number) : void;

    currentWheelRotate: number = 0.0;
    materialWheel(dt: number) : void
    {
        this.currentWheelRotate += dt * this.currentSpeed * 3.6;
        if(this.currentWheelRotate > 360) this.currentWheelRotate -= 360;
        this.carMaterial.setProperty("wheelRotate", this.currentWheelRotate);
    }
}