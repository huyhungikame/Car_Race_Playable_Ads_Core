import { _decorator, Component, Node } from 'cc';
import { GameManager } from '../GamePlay/GameManager';
const { ccclass, property } = _decorator;

@ccclass('GarageView')
export class GarageView extends Component {
    @property(Node)
    contentView: Node;

    @property(Node)
    garage: Node;
    
    protected onEnable(): void {
        this.contentView.active = false;
        this.garage.active = true;
        GameManager.instance.hideCar();
    }
}