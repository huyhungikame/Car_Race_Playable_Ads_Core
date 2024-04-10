import { _decorator, clamp, Component, Gradient, Label, Node, Sprite } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('GaragePropeties')
export class GaragePropeties extends Component {
    @property(Sprite)
    maxSpeed: Sprite;
    
    @property(Sprite)
    acc: Sprite;

    @property(Sprite)
    handling: Sprite;

    @property(Label)
    maxSpeedAmount: Label;

    @property(Label)
    accAmount: Label;

    @property(Label)
    handlingAmount: Label;

    @property(Gradient)
    colorGradient: Gradient = new Gradient();

    max_Speed: number = 300;
    min_Speed: number = 125;
    max_Acc: number = 100;
    min_Acc: number = 40;
    max_Handling: number = 255;
    min_Handling: number = 125;
    currentSpeed: number = 0;
    currentAcc: number = 0;
    currentHandling: number = 0;

    upgradeProperties(currentEngine: number, currentWheel: number, currentSpoiler: number): void {
        if(currentEngine < 0) currentEngine = 0;
        if(currentWheel < 0) currentWheel = 0;
        if(currentSpoiler < 0) currentSpoiler = 0;

        this.currentSpeed = clamp(currentEngine * 60 + currentSpoiler * 15 + currentWheel * 15 + this.min_Speed, this.min_Speed, this.max_Speed);
        this.currentAcc = clamp(currentEngine * 10 + currentWheel * 20 + currentSpoiler * 10 + this.min_Acc, this.min_Acc, this.max_Acc);
        this.currentHandling = clamp(currentWheel * 40 + currentSpoiler * 25 + this.min_Handling, this.min_Handling, this.max_Handling);

        this.maxSpeed.fillStart = this.currentSpeed / this.max_Speed;
        this.maxSpeedAmount.string = this.currentSpeed.toString();
        this.maxSpeed.color = this.colorGradient.evaluate(this.maxSpeed.fillStart);

        this.acc.fillStart = this.currentAcc / this.max_Acc;
        this.accAmount.string = this.currentAcc.toString();
        this.acc.color = this.colorGradient.evaluate(this.acc.fillStart);

        this.handling.fillStart = this.currentHandling / this.max_Handling;
        this.handlingAmount.string = this.currentHandling.toString();
        this.handling.color = this.colorGradient.evaluate(this.handling.fillStart);
    }
}