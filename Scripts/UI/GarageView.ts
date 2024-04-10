import { _decorator, Button, Component, Node, Scene, Size, Tween, tween, UITransform, Vec3, view } from 'cc';
import { GameManager } from '../GamePlay/GameManager';
import { CanvasScaler } from './CanvasScaler';
import { screen } from 'cc'
const { ccclass, property } = _decorator;

@ccclass('GarageView')
export class GarageView extends Component {
    @property(Node)
    contentView: Node;

    @property(Node)
    garage: Node;

    @property(CanvasScaler)
    canvasScaler: CanvasScaler;

    @property({ group: { name: 'Button' , displayOrder: 1}, type: [Button] }) 
    buttonToggle: Button[] = [];

    @property({ group: { name: 'Button' , displayOrder: 1}, type: Button }) 
    playHorizontal: Button;

    @property({ group: { name: 'Button' , displayOrder: 1}, type: Button }) 
    playVertical: Button;

    @property({ group: { name: 'Content' , displayOrder: 1}, type: [Node] }) 
    nodeView: Node[] = [];
    
    protected onEnable(): void {
        this.contentView.active = false;
        this.garage.active = true;
        GameManager.instance.hideCar();

        if(screen.windowSize.width < screen.windowSize.height) return;
        var scale = this.node.scale.x / this.canvasScaler.scaleFactor;
        scale *= this.canvasScaler.caculatorScale(0.05);
        this.node.scale = new Vec3(scale,scale,scale);
        this.playVertical.node.active = false;
        this.playHorizontal.node.active = true;
    }

    onClickToggle (event: Event, customEventData: string) {
       for (let i = 0; i < this.buttonToggle.length; i++) {
        var element = this.buttonToggle[i];
        var isTap = i.toString() == customEventData;
        element.interactable = !isTap;
        var uiTransform = element.getComponent(UITransform);
        Tween.stopAllByTarget(uiTransform);
        this.nodeView[i].active = isTap;
        if(isTap){
            tween(uiTransform)
                .to(0.15, {contentSize: new Size(uiTransform.contentSize.x, 69.5)})
                .start();
        }
        else{
            uiTransform.contentSize = new Size(uiTransform.contentSize.x, 60);
        }
       }
    }
}