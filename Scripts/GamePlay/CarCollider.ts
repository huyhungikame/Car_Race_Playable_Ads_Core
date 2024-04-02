import { _decorator, Component ,Collider, ICollisionEvent, ParticleSystem, Vec3, randomRange} from 'cc';
import { BaseMovement } from './BaseMovement';
import { PlayerMovement } from './PlayerMovement';
import { CameraShake } from './Feels/CameraShake';
const { ccclass, property } = _decorator;

@ccclass('CarCollider')
export class CarCollider extends Component {
    @property(BaseMovement)
    controller: BaseMovement;

    @property(CameraShake)
    cameraShake: CameraShake;

    isCheckDie: boolean = false;
    timeCheckDie: number = 0.0;
    collider: Collider;
    frameCount: number = 0;

    public onLoad () {
        this.collider = this.node.getComponent(Collider);
        this.collider.on('onCollisionStay', this.onCollision, this);
        this.collider.on('onCollisionExit', this.onCollisionExit, this);
        if(this.cameraShake != null) this.collider.on('onCollisionEnter', this.onCollisionEnter, this);
    }
    
    
    private onCollisionEnter (event: ICollisionEvent) {
        if(this.controller.currentSpeed > 50) this.cameraShake.shake();
    }

    private onCollisionExit (event: ICollisionEvent) {
        this.frameCount = 0;
        this.controller.collisionExit();
    }
    
    private onCollision (event: ICollisionEvent) {
        var normal = new Vec3();
        event.contacts[0].getLocalNormalOnA(normal);
        this.controller.applyPhysic(normal.normalize());
    }

    onHitObstacles(): void
    {
        if (this.controller instanceof PlayerMovement) {
            let movement: PlayerMovement = this.controller;
            movement.actionReviveView();
            return;
        }
        
        if(this.isCheckDie) return;
        this.controller.die();
        this.isCheckDie = true;
        this.timeCheckDie = 0.0;
    }

    protected update(dt: number): void {
        if(!this.isCheckDie) return;
        this.timeCheckDie += dt;
        if(this.timeCheckDie > 1.5){
            this.isCheckDie = false;
            this.controller.revive();
        }
    }
}