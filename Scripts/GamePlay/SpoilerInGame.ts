import { _decorator, Component, Material, Node, Texture2D } from 'cc';
import { GarageManager } from '../UI/GarageManager';
const { ccclass, property } = _decorator;

@ccclass('SpoilerInGame')
export class SpoilerInGame extends Component {
    @property(GarageManager)
    garageManager: GarageManager;

    @property([Texture2D])
    texture: Texture2D[] = [];

    @property(Material)
    materialCar: Material;

    @property([Node])
    car: Node[] = [];

    protected onEnable(): void {
        var index = this.garageManager.currentCarIndex;
        for (let i = 0; i < this.car.length; i++) {
            var element = this.car[i];
            element.active = index == i;
        } 

        this.materialCar.setProperty("mainTexture",this.texture[index])
    }
}


