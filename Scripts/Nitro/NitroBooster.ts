import { _decorator, BoxCollider, CCFloat, Component, ITriggerEvent, Node, ParticleSystem, Vec2 } from 'cc';
import { CarCollider } from '../GamePlay/CarCollider';
const { ccclass, property } = _decorator;

@ccclass('NitroBooster')
export class NitroBooster extends Component {
    @property({ type: BoxCollider})
    collider: BoxCollider;

    @property(Vec2)
    addValueNitro: Vec2 = new Vec2();

    particaleSystem: ParticleSystem;

    protected start(): void {
        this.particaleSystem = this.node.getComponent(ParticleSystem);
        this.collider.on('onTriggerEnter', this.onCollision, this);
    }

    private onCollision (event: ITriggerEvent) {
        var movement = event.otherCollider.node.getComponent(CarCollider).controller;
        movement.addNitro(this.addValueNitro);
        this.particaleSystem.enabled = false;
        setTimeout ( ()=>{
            this.particaleSystem.enabled = true;
            this.particaleSystem.play();
        }, 750)
    }
}