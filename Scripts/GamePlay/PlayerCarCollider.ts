import { _decorator, CCInteger, ICollisionEvent, Node, ParticleSystem, randomRange, Vec3 } from 'cc';
import { CarCollider } from './CarCollider';
import { CameraShake } from './Feels/CameraShake';

const { ccclass, property } = _decorator;

@ccclass('PlayerCarCollider')
export class PlayerCarCollider extends CarCollider {
    @property(CameraShake)
    cameraShake: CameraShake;

    @property(Node)
    effectPool: Node;

    spankParticle : ParticleSystem[] = [];
    spankLength: number;

    @property(CCInteger)
    spankCurrentIndex: number = 0;
    hasSpank: boolean = false;
    worldPosition: Vec3 = new Vec3();

    protected start(): void {
        this.spankCurrentIndex = 0;
        this.collider.on('onCollisionStay', this.onCollisionStay, this);
        this.collider.on('onCollisionEnter', this.onCollisionEnter, this);
        this.hasSpank = this.effectPool != null;
        if(!this.hasSpank) return;
        this.spankParticle = this.effectPool.getComponentsInChildren(ParticleSystem);
        this.spankLength = this.spankParticle.length;
    }

    private onCollisionEnter (_event: ICollisionEvent) {
        if(this.controller.currentSpeed > 50) this.cameraShake.shake();
    }

    private onCollisionStay (event: ICollisionEvent) {
        if(!this.hasSpank) return;
        this.effect(event);
        this.effect(event);
    }

    private effect(event: ICollisionEvent): void{
        var effect = this.spankParticle[this.spankCurrentIndex * 2];
        var effect2 = this.spankParticle[this.spankCurrentIndex * 2 + 1];
        this.spankCurrentIndex++;
        if(this.spankCurrentIndex >= (this.spankLength / 2)) this.spankCurrentIndex = 0;
        event.contacts[0].getWorldPointOnA(this.worldPosition);
        effect.node.setWorldPosition(this.worldPosition);
        effect.node.active = true;
        var eulerAngles = effect.node.eulerAngles.clone();
        eulerAngles.y = randomRange(-160,-195);
        effect.node.eulerAngles = eulerAngles;
        effect.play();
        effect2.play();
    }
}


