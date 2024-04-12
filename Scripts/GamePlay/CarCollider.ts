import { _decorator, Component ,Collider, ICollisionEvent, Vec3} from 'cc';
import { BaseMovement } from './BaseMovement';
import { PlayerMovement } from './PlayerMovement';
const { ccclass, property } = _decorator;

@ccclass('CarCollider')
export class CarCollider extends Component {
    @property(BaseMovement)
    controller: BaseMovement;

    isCheckDie: boolean = false;
    timeCheckDie: number = 0.0;
    collider: Collider;
    frameCount: number = 0;
    normal: Vec3 = new Vec3();

    public onLoad () {
        this.collider = this.node.getComponent(Collider);
        this.collider.on('onCollisionStay', this.onCollision, this);
        this.collider.on('onCollisionExit', this.onCollisionExit, this);
    }

    private onCollisionExit (_event: ICollisionEvent) {
        this.frameCount = 0;
        this.controller.collisionExit();
    }
    
    private onCollision (event: ICollisionEvent) {
        event.contacts[0].getLocalNormalOnA(this.normal);
        this.controller.applyPhysic(this.normal.normalize());
    }

    onHitObstacles(): void
    {
        if (this.controller instanceof PlayerMovement) {
            let movement: PlayerMovement = this.controller;
            if(movement.isNitro) return;
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