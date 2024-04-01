import { _decorator, CCFloat, Collider, Component, ICollisionEvent, lerp, Node, Vec3 } from 'cc';
import { CarCollider } from '../CarCollider';
const { ccclass, property } = _decorator;

@ccclass('SawMovement')
export class SawMovement extends Component {
    @property(CCFloat)
    speed: number = 5;
    
    @property(CCFloat)
    lenght: number = 7;

    @property(CCFloat)
    startDirection: number = 1;

    @property(CCFloat)
    currentOffset: number = 0;
    
    @property(CCFloat)
    originPosX: number = 0;

    @property({ type: Collider})
    collider: Collider;

    @property(Node)
    graphic: Node;

    @property(Vec3)
    rotaion: Vec3 = new Vec3(0,0,1);

    protected start(): void {
        this.collider.on('onCollisionEnter', this.onCollision, this);
    }

    private onCollision (event: ICollisionEvent) {
        var player = event.otherCollider.node.getComponent(CarCollider);
        player.OnHitFan();
    }

    protected onLoad(): void {
        this.originPosX = this.graphic.position.x;
    }

    update(deltaTime: number) {
        var angle = this.graphic.eulerAngles;
        var offsetRoation = -1 * this.startDirection * 360 * deltaTime;
        angle.add(new Vec3(this.rotaion).multiplyScalar(offsetRoation));
        this.graphic.eulerAngles = angle;
        
        var newOffset = this.currentOffset + this.startDirection * this.speed * deltaTime;
        this.currentOffset = lerp(this.currentOffset,newOffset,0.7);

        if(Math.abs(this.currentOffset) >= this.lenght) {
            this.currentOffset = this.startDirection * this.lenght;
            this.startDirection *= -1;
        }

        var newPos = new Vec3(this.graphic.position);
        newPos.x = this.originPosX + this.currentOffset;
        this.graphic.setPosition(newPos);
    }
}


