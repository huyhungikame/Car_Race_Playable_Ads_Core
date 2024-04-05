import { _decorator, CCFloat, Component, Label, Node, Size, Tween, tween, UIOpacity, Vec3, view, Widget } from 'cc';
import { GameManager } from '../GamePlay/GameManager';
import { screen } from 'cc'
const { ccclass, property } = _decorator;

@ccclass('StartView')
export class StartView extends Component {
    public static current: StartView;

    @property(Node)
    holdToRide: Node;

    @property(Node)
    handNode: Node;

    @property(Node)
    handGraphic: Node;

    @property(Widget)
    holdToRideWidget: Widget;

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
        view.resizeWithBrowserSize(true);
        this.currentSize = view.getDesignResolutionSize();
        this.updateCanvas();
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
        this.onHandMove();
    }

    protected onDestroy(): void {
        Tween.stopAllByTarget(this.node);
    }

    onHandMove(): void 
    {
        tween(this.holdToRide)
            .to(0.8, {scale: new Vec3(0.9 ,1.1 ,1)} , {easing: "backIn" })
            .to(0.45, {scale: Vec3.ONE} , {easing: "backOut" })
            .union()
            .repeatForever()
            .start();


        this.handAnimation1();
    }

    handAnimation1() : void {
        let t1 = tween(this.handGraphic)
            .to(0.15, { scale: new Vec3(1.1,1.1,1.1)} ,{easing: "sineOut"})
            .to(0.15, {  scale: new Vec3(1,1,1)} ,{easing: "sineIn"})
            .union();
        
        tween(this.handNode)
            .then(t1)
            .to(0.2, { eulerAngles: new Vec3(0,0,-22)}, {easing: "sineOut"})
            .to(0.4, { eulerAngles: new Vec3(0,0,22)}, {easing: "sineInOut"})
            .to(0.2, { eulerAngles: Vec3.ZERO}, {easing: "sineIn"})
            .union().repeatForever().start();
    }


    startGame(): void
    {
        this.node.active = false;
        GameManager.startGame();
    }

    @property(CCFloat)
    matchWidthOrHeight: number = 0.5;
    private currentSize: Size;

    protected lateUpdate(_dt: number): void {
        this.updateCanvas();
    }
    updateCanvas() : void {
        var windowSize = screen.windowSize;
        var changeWidth = Math.abs(this.currentSize.width - windowSize.width) > 1;
        var changeHeight = Math.abs(this.currentSize.height - windowSize.height) > 1;
        if (!changeWidth && !changeHeight) return;
        this.currentSize = windowSize.clone();
        if(this.currentSize.width > this.currentSize.height) {
            this.holdToRideWidget.bottom = this.currentSize.height - 185;
        }else{
            this.holdToRideWidget.bottom = 185;
        }
    }

}