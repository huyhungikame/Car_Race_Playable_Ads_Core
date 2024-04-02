import { _decorator, Component, Label, Sprite, tween, Widget } from 'cc';
import { PlayerMovement } from '../GamePlay/PlayerMovement';

const { ccclass, property } = _decorator;

@ccclass('GamePlayView')
export class GamePlayView extends Component {
    @property(Sprite)
    progressImage: Sprite;

    @property(Sprite)
    speedImage: Sprite;

    @property(Label)
    speedText: Label;

    @property(Label)
    posText: Label;

    timeChangeRandomValue: number = 0.0;
    textSpeedOffset: number = 0.0;
    nextTimeChange: number = 0.0;

    protected start(): void {
        let widget : Widget = this.node.getComponent(Widget);
        tween(widget)
        .to(.3, { top: 0} ,{easing: "sineIn"})
        .start()
    }

    protected lateUpdate(dt: number): void 
    {
        this.setProgressMap();
        this.setProgressSpeed();
        this.posText.string = PlayerMovement.current.rank.toString();
        this.timeChangeRandomValue += dt;
        if(this.timeChangeRandomValue > this.nextTimeChange)
        {
            this.textSpeedOffset = -5 * Math.random();
            this.timeChangeRandomValue = 0;
            this.nextTimeChange = Math.random();
        }
    }

    setProgressMap(): void 
    {
        this.progressImage.fillStart = (PlayerMovement.current.currentIndex - 4) / (PlayerMovement.current.length - 5);
    }

    setProgressSpeed(): void
    {
        var speedRatio = PlayerMovement.current.currentSpeed / PlayerMovement.current.maxSpeed;
        //-0.25,-0.5
        this.speedImage.fillRange = -0.25 - 0.25 * speedRatio;
        var textSpeedValue = PlayerMovement.current.currentSpeed * 2.2;
        if(textSpeedValue <= 0) 
        {    
            textSpeedValue = 0;
            this.speedText.string = "0";
            return;
        }
        textSpeedValue = Math.round(textSpeedValue + this.textSpeedOffset);
        if(textSpeedValue <= 0) textSpeedValue = 0;
        this.speedText.string = textSpeedValue.toString();
    }
}