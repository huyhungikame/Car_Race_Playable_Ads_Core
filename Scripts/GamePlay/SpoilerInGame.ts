import { _decorator, Component, Material, Node, Texture2D } from 'cc';
import { GarageManager } from '../UI/GarageManager';
const { ccclass, property } = _decorator;

@ccclass('SpoilerInGame')
export class SpoilerInGame extends Component {
    @property(GarageManager)
    garageManager: GarageManager;

    @property([Texture2D])
    textureColor: Texture2D[] = [];

    @property(Material)
    materialCar: Material;

    @property([Node])
    spoiler: Node[] = [];

    protected onEnable(): void {
        var index = this.garageManager.currentSpoilerIndex;
        for (let i = 0; i < this.spoiler.length; i++) {
            var element = this.spoiler[i];
            element.active = index == i;
        } 

        var indexTexture = this.garageManager.currentColorIndex;
        if(indexTexture == -1) indexTexture = 0;
        this.materialCar.setProperty("matcapTexture",this.textureColor[indexTexture])
    }
}


