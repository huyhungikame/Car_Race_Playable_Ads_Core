import { _decorator, Component, Node, SkeletalAnimation, Skeleton } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('BannerNitroView')
export class BannerNitroView extends Component {
    @property(Node)
    startView: Node;

    @property(Node)
    gamePlayView: Node;

    protected onLoad(): void {
        setTimeout(() => {
            this.node.active = false;
            this.startView.active = true;
            this.gamePlayView.active = true;
        }, 2800)    
    }
}


