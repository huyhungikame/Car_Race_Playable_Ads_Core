import { _decorator, Collider, Component, ICollisionEvent, Vec3 } from 'cc';
import { CarCollider } from '../CarCollider';

const { ccclass, property } = _decorator;

@ccclass('FanBehaviour')
export class FanBehaviour extends Component {
    @property(Vec3)
    private speedValue: Vec3 = new Vec3(0, 50, 0);

    @property({ type: Collider})
    private collider: Collider[] = [];

    private eulerAngles: Vec3 = new Vec3();
    private dtSpeed: Vec3 = new Vec3();

    protected start(): void {
        for (let i = 0; i < this.collider.length; i++) { 
            this.collider[i].on('onCollisionEnter', this.onCollision, this);
        }

        this.eulerAngles = this.node.eulerAngles;
    }

    private onCollision (event: ICollisionEvent) {
        var player = event.otherCollider.node.getComponent(CarCollider);
        player.onHitObstacles();
    }

    protected update(dt: number): void {
        this.dtSpeed.set(this.speedValue);
        this.eulerAngles.add(this.dtSpeed.multiplyScalar(dt));
        this.node.setRotationFromEuler(this.eulerAngles);
    }
}