import { _decorator, BoxCollider, Component, ITriggerEvent, Node } from 'cc';
import { BaseMovement } from '../GamePlay/BaseMovement';
import { PlayerMovement } from '../GamePlay/PlayerMovement';
import { BotMovement } from '../GamePlay/BotMovement';
import { CarCollider } from '../GamePlay/CarCollider';
const { ccclass, property } = _decorator;

@ccclass('BoosterHalf')
export class BoosterHalf extends Component {
    @property({ type: BoxCollider})
    collider: BoxCollider;

    protected start(): void {
        this.collider.on('onTriggerEnter', this.onCollision, this);
    }

    private onCollision (event: ITriggerEvent) {
        var movement = event.otherCollider.node.getComponent(CarCollider).controller;
        movement.addBooster();
    }
}