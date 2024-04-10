import { _decorator, Component } from 'cc';
import { GarageButton } from './GarageButton';
const { ccclass, property } = _decorator;

@ccclass('GarageGroup')
export class GarageGroup extends Component {
    disableAllButton(): void {
        var buttonMember = this.node.getComponentsInChildren(GarageButton);
        for (let i = 0; i < buttonMember.length; i++) {
            var element = buttonMember[i];
            element.isSelect = false;
            element.select.active = false;
        }
    }
}