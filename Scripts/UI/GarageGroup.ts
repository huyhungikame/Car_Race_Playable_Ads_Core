import { _decorator, Component } from 'cc';
import { GarageButton } from './GarageButton';
const { ccclass, property } = _decorator;

@ccclass('GarageGroup')
export class GarageGroup extends Component {
    buttonMember: GarageButton[];
    
    protected onLoad(): void {
        this.buttonMember = this.node.getComponentsInChildren(GarageButton);
    }

    disableAllButton(): void {
        for (let i = 0; i < this.buttonMember.length; i++) {
            var element = this.buttonMember[i];
            element.isSelect = false;
            element.select.active = false;
        }
    }

    protected onEnable(): void {
        for (let i = 0; i < this.buttonMember.length; i++) {
            var element = this.buttonMember[i];
            if(element.isSelect) element.eventButton();
        }
    }
    
}