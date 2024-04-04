import { _decorator, Component, Label, Node, Tween, tween, UIOpacity, Vec3, Widget } from 'cc';
import { GameManager } from '../GamePlay/GameManager';

const { ccclass, property } = _decorator;

@ccclass('StartView')
export class StartView extends Component {
    public static current: StartView;

    @property(Node)
    holdToRide: Node;

    @property(Widget)
    hand: Widget;

    @property(Node)
    titleImage: Node;

    @property(Label)
    titleText: Label;

    @property(UIOpacity)
    titleOpacity: UIOpacity;

    @property(Node)
    gamePlayView: Node;

    protected onLoad(): void {
        StartView.current = this;
    }

    protected start(): void {

        this.openHoldToRide();
        this.titleImage.active =false;
        // tween(this.titleText.node)
        // .to(.85, { scale: new Vec3(0.95,0.95,0.95)} ,{easing: "sineOut"})
        // .to(0.85, { scale: new Vec3(1.2,1.2,1.2)} ,{easing: "sineIn"})
        // .union()
        // .repeat(9999)
        // .start()

        // tween(this.titleOpacity) 
        // .to(.85, { opacity: 200} ,{easing: "sineOut"})
        // .to(0.85, { opacity: 255} ,{easing: "sineIn"})
        // .union()
        // .repeat(9999)
        // .start()
    }


    startUi(): void
    {
        // this.openHoldToRide();
        // Tween.stopAllByTarget(this.titleText.node);
        // Tween.stopAllByTarget(this.titleOpacity);
        // this.titleOpacity.opacity = 255;
        // this.titleText.node.setScale(new Vec3(2,2,1));
        // this.titleText.string = "3";
        // tween(this.titleText.node)
        //     .to(.75, {scale: Vec3.ONE},{
        //         onComplete: () => {
        //             this.titleText.node.setScale(new Vec3(2,2,1));
        //             this.titleText.string = "2";
        //             tween(this.titleText.node)
        //                 .to(.75, {scale: Vec3.ONE},{
        //                     onComplete: () => {
        //                         this.titleText.node.setScale(new Vec3(2,2,1));
        //                         this.titleText.string = "1";
        //                         tween(this.titleText.node)
        //                             .to(.75, {scale: Vec3.ONE},{
        //                                 onComplete: () => {
        //                                     this.startGame();
        //                                 }
        //                             }).start();
        //                     }
        //                 }).start();
        //         }
        //     }).start();
        
        this.startGame();
        this.gamePlayView.active = true;
    }

    openHoldToRide(): void
    {
        this.holdToRide.active = true;
        this.holdToRide.setScale(Vec3.ZERO);
        tween(this.holdToRide).to(0.2, {scale: Vec3.ONE} , {
            easing: "backOut",
            onComplete: () => {
                this.onHandMove();
            }
        }).start();
    }

    onHandMove(): void 
    {
        tween(this.hand)
            .to(1.2, { horizontalCenter: 185} ,{easing: "sineInOut"})
            .to(1.2, { horizontalCenter: -170} ,{easing: "sineInOut"})
            .union()
            .repeat(99)
            .start()
    }

    startGame(): void
    {
        this.node.active = false;
        GameManager.startGame();
    }
}