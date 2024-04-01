import { _decorator, Collider, Component, easing, ICollisionEvent, Node, tween, Vec3 } from 'cc';
import { CarCollider } from '../CarCollider';
const { ccclass, property } = _decorator;

@ccclass('SpikeBall')
export class SpikeBall extends Component {

    @property(Node)
    ballMove : Node;

    @property({ type: Collider})
    collider: Collider;

    @property(Node)
    topPoint : Node;

    @property(Node)
    bottomPoint : Node;

    @property
    timeMove : number = 2;  





    start() {
        this.collider.on('onCollisionEnter', this.onCollision, this);
        this.OnBallMove();
    }

    private onCollision (event: ICollisionEvent) {
        var player = event.otherCollider.node.getComponent(CarCollider);
        player.OnHitFan();
    }

    OnBallMove(){
        tween(this.ballMove)
            .to(this.timeMove, { worldPosition : this.topPoint.worldPosition},{easing: 'quadOut'})
            .delay(.1)
            .to(this.timeMove/2, { worldPosition : this.bottomPoint.worldPosition}, {easing : 'quadIn'})
            .union()
            .repeatForever()
            .start();
    }

}


