import { _decorator, Button, Component, EventHandler, Node } from 'cc';
import { PlayableAdsManager } from '../../../../TemplatePA/PlayableAdsManager';
const { ccclass, property } = _decorator;

@ccclass('GoToStoreButton')
export class GoToStoreButton extends Component {
    onLoad () {
        const clickEventHandler = new EventHandler();
        clickEventHandler.target = this.node;
        clickEventHandler.component = 'GoToStoreButton';
        clickEventHandler.handler = 'callback';
        const button = this.node.getComponent(Button);
        button.clickEvents = [];
        button.clickEvents.push(clickEventHandler);
    }

    callback (event: Event, customEventData: string) {
        PlayableAdsManager.instance.OpenURL_Button();
    }
}