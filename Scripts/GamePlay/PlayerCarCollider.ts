import { _decorator, Component, ICollisionEvent, Node, ParticleSystem, randomRange, Vec3 } from 'cc';
import { CarCollider } from './CarCollider';

const { ccclass, property } = _decorator;

@ccclass('PlayerCarCollider')
export class PlayerCarCollider extends CarCollider {
    @property([Node])
    spankParticle : Node[] = [];

    spankLength: number;
    spankCurrentIndex: number = 0;

    protected start(): void {
        this.spankCurrentIndex = 0;
        this.spankLength = this.spankParticle.length;
        this.collider.on('onCollisionStay', this.onCollisionStay, this);
    }

    private onCollisionStay (event: ICollisionEvent) {
        this.frameCount++;
        if(this.frameCount % 2 != 0) return;
        var effect = this.spankParticle[this.spankCurrentIndex];
        var effect2 = this.spankParticle[this.spankCurrentIndex].children[0];
        this.spankCurrentIndex++;
        if(this.spankCurrentIndex >= this.spankLength) this.spankCurrentIndex = 0;
        var position = new Vec3(0,0,0);
        event.contacts[0].getWorldPointOnA(position);
        effect.worldPosition =  position;
        effect.active = true;
        var eulerAngles = effect.eulerAngles.clone();
        eulerAngles.y = randomRange(-160,-195);
        effect.eulerAngles = eulerAngles;
        //
        effect.getComponent(ParticleSystem).play();
        effect2.getComponent(ParticleSystem).play();
    }
}


