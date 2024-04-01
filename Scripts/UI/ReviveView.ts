import { _decorator, Component, Node, tween, UIOpacity, Vec3 } from 'cc';
import { GameManager } from '../GamePlay/GameManager';

const { ccclass, property } = _decorator;

@ccclass('ReviveView')
export class ReviveView extends Component {
    @property(UIOpacity)
    background : UIOpacity;

    @property(Node)
    targetNode : Node;

    // protected onEnable(): void {
    //     this.TweenPopup();
    // }
    public TweenPopup(): void {
        console.log("TweenPopup");
        this.node.active = true;
        tween(this.background)
            .set({ opacity: 0 })
            .to(1, { opacity: 255 }, { easing: 'quintInOut' })
        .start();
        tween(this.targetNode)
            .repeat(1,
                tween(this.targetNode)
                    .set({ scale: new Vec3(5, 5, 5), 
                        position: new Vec3(0, 0, 0),
                        angle: 0 })
                    .parallel(
                        tween(this.targetNode).to(1, { scale: new Vec3(1, 1, 1) }, { easing: 'quintInOut' }),
                        tween(this.targetNode).to(.25, { position: new Vec3(0, 0, 0) }, { easing: 'backOut' })
                    )
                    .delay(0.25)
                    .to(0.15, { scale: new Vec3(1.5, 1.5, 1.5) }, { easing: 'quintIn' })
                    .delay(.15)
            )
        .start();

        tween(this.targetNode.getComponent(UIOpacity))
            .repeat(1,
                tween(this.targetNode.getComponent(UIOpacity))
                    .set({ opacity: 0 })
                    .parallel(
                        tween(this.targetNode.getComponent(UIOpacity)).to(1, { opacity: 255 }, { easing: 'quintInOut' }),
                        tween(this.targetNode.getComponent(UIOpacity)).delay(.25)
                    )
                    .delay(0.25)
                    .to(0.15, { opacity: 0 }, { easing: 'quintIn' })
                    .delay(.15)
            )
            .call(() => {
                GameManager.instance.RevivePlayer();
                this.node.active = false;
            })
        .start();
        



    }
}


