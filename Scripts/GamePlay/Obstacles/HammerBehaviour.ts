import { _decorator, CCFloat, Collider, Component, ICollisionEvent, Node, tween, Vec3 } from 'cc';
import { CarCollider } from '../CarCollider';
const { ccclass, property } = _decorator;

@ccclass('HammerBehaviour')
export class HammerBehaviour extends Component {
    @property(Collider)
    collider: Collider;

    @property(CCFloat)
    inTime: number = 1;

    @property(CCFloat)
    outTime: number = 1;

    protected start(): void {
        this.collider.on('onCollisionEnter', this.onCollision, this);
        this.playTween();
    }

    private onCollision (event: ICollisionEvent) {
        var player = event.otherCollider.node.getComponent(CarCollider);
        player.onHitObstacles();
    }

    playTween(){
        var eulerAnglesX = this.node.eulerAngles.x;
        var eulerAnglesY = this.node.eulerAngles.y;
        var eulerAnglesZ = this.node.eulerAngles.z;
        tween(this.node)
            .to(this.inTime,{eulerAngles: new Vec3(eulerAnglesX - 90,eulerAnglesY,eulerAnglesZ)}, {easing: "backIn"})
            .delay(0.33)
            .to(this.outTime,{eulerAngles: new Vec3(eulerAnglesX,eulerAnglesY,eulerAnglesZ)},{easing: "linear"})
            .union()
            .repeatForever()
            .start();
    }
}