import { _decorator, ICollisionEvent, Node, ParticleSystem, randomRange, Vec3 } from 'cc';
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
    spankCurrentIndex: number = 0;
    hasSpank: boolean = false;

    protected start(): void {
        this.spankCurrentIndex = 0;
        this.spankLength = this.spankParticle.length;
        this.collider.on('onCollisionStay', this.onCollisionStay, this);
        this.collider.on('onCollisionEnter', this.onCollisionEnter, this);
        this.hasSpank = this.effectPool != null;
        if(!this.hasSpank) return;
        this.spankParticle = this.effectPool.getComponentsInChildren(ParticleSystem);
    }

    private onCollisionEnter (_event: ICollisionEvent) {
        if(this.controller.currentSpeed > 50) this.cameraShake.shake();
    }

    private onCollisionStay (event: ICollisionEvent) {
        if(!this.hasSpank) return;
        this.frameCount++;
        if(this.frameCount % 2 != 0) return;
        var effect = this.spankParticle[this.spankCurrentIndex * 2];
        var effect2 = this.spankParticle[this.spankCurrentIndex * 2 + 1];
        this.spankCurrentIndex++;
        if(this.spankCurrentIndex >= (this.spankLength / 2)) this.spankCurrentIndex = 0;
        event.contacts[0].getWorldPointOnA(effect.node.worldPosition);
        effect.node.active = true;
        var eulerAngles = effect.node.eulerAngles.clone();
        eulerAngles.y = randomRange(-160,-195);
        effect.node.eulerAngles = eulerAngles;
        effect.play();
        effect2.play();
    }
}


