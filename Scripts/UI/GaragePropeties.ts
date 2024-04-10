import { _decorator, Component, Label, Node, Sprite } from 'cc';
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

    max_Speed: number = 300;
    max_Acc: number = 100;
    max_Handling: number = 255;

    
}