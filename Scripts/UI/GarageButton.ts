import { _decorator, CCBoolean, CCInteger, Component, Node } from 'cc';
import { GarageView } from './GarageView';
import { GarageGroup } from './GarageGroup';
import { GameManager } from '../GamePlay/GameManager';
const { ccclass, property } = _decorator;

@ccclass('GarageButton')
export class GarageButton extends Component {
    @property()
    isSelect: boolean = false;

    @property(CCInteger)
    index: number = 0;

    @property(CCInteger)
    indexButton: number = 0;

    @property(GarageGroup)
    group: GarageGroup;

    @property(GarageView)
    garageView: GarageView;

    @property(Node)
    select: Node;

    onClick(): void {
        this.eventButton();
        GameManager.instance.ActionFirstClick();
    }

    eventButton() {
        this.group.disableAllButton();
        this.isSelect = true;
        this.select.active = true;
        this.garageView.onClick(this.index, this.indexButton);
    }
}