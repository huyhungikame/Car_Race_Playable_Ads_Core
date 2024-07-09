import { _decorator, Button, Camera, Color, Component, Label, Node, Scene, Size, Sprite, Tween, tween, UIOpacity, UITransform, Vec3, view } from 'cc';
import { GameManager } from '../GamePlay/GameManager';
import { CanvasScaler } from './CanvasScaler';
import { screen } from 'cc'
import { GarageManager } from './GarageManager';
import { GaragePropeties } from './GaragePropeties';
const { ccclass, property } = _decorator;

@ccclass('GarageView')
export class GarageView extends Component {
    @property(Node)
    contentView: Node;

    @property(Node)
    garage: Node;

    @property(CanvasScaler)
    canvasScaler: CanvasScaler;

    @property(GarageManager)
    garageManager: GarageManager;

    @property({ group: { name: 'Button' , displayOrder: 1}, type: [Button] }) 
    buttonToggle: Button[] = [];

    @property({ group: { name: 'Button' , displayOrder: 1}, type: Button }) 
    playHorizontal: Button;

    @property({ group: { name: 'Button' , displayOrder: 1}, type: Button }) 
    playVertical: Button;

    @property({ group: { name: 'Content' , displayOrder: 1}, type: [Node] }) 
    nodeView: Node[] = [];

    @property(GaragePropeties)
    garageProperties: GaragePropeties;

    @property(UIOpacity)
    shield: UIOpacity;

    @property(UIOpacity)
    allView: UIOpacity;

    @property(Camera)
    camera: Camera;

    private currentSize: Size;
    
    protected onEnable(): void {
        this.contentView.active = false;
        this.garage.active = true;
        GameManager.instance.hideCar();
        this.garageProperties.upgradeProperties(0,0,0);
        this.currentSize = view.getDesignResolutionSize();
        this.updateCanvas();
        this.shield.node.active = true;
        this.shield.opacity = 225;
        tween(this.shield)
            .to(0.5,{opacity: 0}, {onComplete: () => this.shield.node.active = false})
            .start();
    }

    protected lateUpdate(_dt: number): void {
        this.updateCanvas();
    }
    updateCanvas() : void {
        var windowSize = screen.windowSize;
        var changeWidth = Math.abs(this.currentSize.width - windowSize.width) > 1;
        var changeHeight = Math.abs(this.currentSize.height - windowSize.height) > 1;
        if (!changeWidth && !changeHeight) return;
        this.currentSize = windowSize.clone();
        var ratio = this.currentSize.width / this.currentSize.height;
        if(ratio < 0.64){
            this.canvasScaler.overriderMatchWidthOrHeight(0.5);
            this.playVertical.node.active = true;
            this.playHorizontal.node.active = false;
        }else if(ratio < 1.4){

            this.canvasScaler.overriderMatchWidthOrHeight(1);
            this.playVertical.node.active = true;
            this.playHorizontal.node.active = false;
        }else{
            this.canvasScaler.overriderMatchWidthOrHeight(0.75);
            this.playVertical.node.active = false;
            this.playHorizontal.node.active = true;
        }
    }

    onClickToggle (event: Event, customEventData: string) {
     GameManager.instance.ActionFirstClick();
       for (let i = 0; i < this.buttonToggle.length; i++) {
        var element = this.buttonToggle[i];
        var isTap = i.toString() == customEventData;
        element.interactable = !isTap;
        var uiTransform = element.getComponent(UITransform);
        Tween.stopAllByTarget(uiTransform);
        this.nodeView[i].active = isTap;
        if(isTap){
            tween(uiTransform)
                .to(0.15, {contentSize: new Size(uiTransform.contentSize.x, 69.5)})
                .start(); 
        }
        else{
            uiTransform.contentSize = new Size(uiTransform.contentSize.x, 60);
        }
       }
    }

    onClick(index: number, indexButton: number): void {
        switch (index) {
            case 0:
                this.garageManager.enableEngineColorAnimation(indexButton);
                break;
            case 1:
                this.garageManager.enableEngineAnimation(indexButton);
                break;
            case 2:
                this.garageManager.enableEngineWheelAnimation(indexButton);
                break;
            case 3: 
                this.garageManager.enableEngineSpolerAnimation(indexButton);
                break
            default:
                break;
        }
        this.garageProperties.upgradeProperties(this.garageManager.currentEngineIndex, this.garageManager.currentWheelIndex, this.garageManager.currentSpoilerIndex);
    }

    public closeGarage (): void {
        this.contentView.active = true;
        this.garage.active = false;
        GameManager.instance.showCar();
        this.allView.opacity = 225;
        tween(this.allView)
            .to(0.5,{opacity: 0}, {onComplete: () => 
                this.node.active = false
            })
            .start();
    }
}