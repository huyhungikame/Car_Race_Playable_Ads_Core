import { _decorator, CCFloat, Collider, Component, ICollisionEvent, Node, Vec3 } from 'cc';
import { CarCollider } from '../CarCollider';

const { ccclass, property } = _decorator;

@ccclass('FanBehaviour')
export class FanBehaviour extends Component {
    @property
    speed: number = 0.0;

    @property({ type: Collider})
    collider: Collider[] = [];

    protected start(): void {
        for (let i = 0; i < this.collider.length; i++) { 
            this.collider[i].on('onCollisionEnter', this.onCollision, this);
        }
        this.rotateZ =this.node.eulerAngles.z
    }

    private onCollision (event: ICollisionEvent) {
        var player = event.otherCollider.node.getComponent(CarCollider);
        player.onHitObstacles();
    }

    rotateZ : number = 0;
    protected update(dt: number): void {
        this.rotateZ += dt * this.speed ;
        //if(this.rotateZ > 180) this.rotateZ = 0;
        // var angle = new Vec3(this.node.eulerAngles);
        // angle.add(new Vec3(0,0,dt * this.speed));
        this.node.setRotationFromEuler(0, this.rotateZ,0);
    }
}