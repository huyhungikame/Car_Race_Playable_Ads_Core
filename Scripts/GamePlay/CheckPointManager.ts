import { _decorator, CCInteger, Component, Node, Vec3 } from 'cc';
import { CameraShake } from './Feels/CameraShake';
const { ccclass, property } = _decorator;

@ccclass('CheckPointManager')
export class CheckPointManager extends Component {
    public static current: CheckPointManager;

    @property({ type:CCInteger})
    roadLaterals: number[] = [];

    @property({ type:CCInteger})
    goToStore: number[] = [];

    @property({ type:CCInteger})
    cameraSnake: number[] = [];

    @property(CCInteger)
    endIndex: number = 390;

    @property(Node)
    completedView: Node;

    current: number = 4; 
    currentRotation: Vec3 = new Vec3();
    index: number = 0; 
    indexGoToStore: number = 0;
    indexCameraSnake: number = 0;

    protected onLoad(): void {
        CheckPointManager.current = this;
    }

    onPlayerChangeCheckPoint(currentIndex: number,rotation: Vec3): void
    {
        if(currentIndex == this.endIndex)
        {
            this.completedView.active = true;
            return;
        }

        if(this.indexGoToStore < this.goToStore.length && currentIndex == this.goToStore[this.indexGoToStore]){
            //GoToStore.Open();
            this.indexGoToStore++;
        }

        if(this.indexCameraSnake < this.cameraSnake.length && currentIndex == this.cameraSnake[this.indexCameraSnake]){
            CameraShake.current.shake();
            this.indexCameraSnake++;
        }
       
        if (this.index >= this.roadLaterals.length || this.roadLaterals[this.index] != currentIndex) return;
        this.current = this.roadLaterals[this.index];
        this.currentRotation.set(rotation);
        this.index++;
    }

    revive(): { indexRevive: number, rotation: Vec3 } 
    {
        var indexRevive = this.current;
        var rotation = this.currentRotation;
        return { indexRevive , rotation };
    }
}