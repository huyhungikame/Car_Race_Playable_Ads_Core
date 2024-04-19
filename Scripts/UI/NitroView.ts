import { _decorator, Component, lerp, Node, Sprite } from 'cc';
import { PlayerMovement } from '../GamePlay/PlayerMovement';
const { ccclass, property } = _decorator;

@ccclass('NitroView')
export class NitroView extends Component {
    @property(Sprite)
    nitroSprite: Sprite;

    @property(PlayerMovement)
    playerMovement: PlayerMovement;

    public static current: NitroView;

    protected onLoad(): void {
        NitroView.current = this;
    }

    protected lateUpdate(dt: number): void {
        this.nitroSprite.fillStart = lerp(this.nitroSprite.fillStart,this.playerMovement.currentNitroBoosterValue.x,0.35);
    }
}