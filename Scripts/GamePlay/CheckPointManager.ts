import { _decorator, CCInteger, Component, Node, Quat, Vec3 } from 'cc';
// import { GoToStore } from './GoToStore';
const { ccclass, property } = _decorator;

@ccclass('CheckPointManager')
export class CheckPointManager extends Component {
    @property({ type:CCInteger})
    roadLaterals: number[] = [];

    @property({ type:CCInteger})
    goToStore: number[] = [];

    @property(CCInteger)
    endIndex: number = 390;

    @property([Node])
    completedViews: Node[] = [];

    current: number = 4;
    currentRotation: Vec3;
    index: number = 0;
    indexGoToStore: number = 0;

    onPlayerChangeCheckPoint(currentIndex: number,rotation: Vec3): void
    {
        if(currentIndex == this.endIndex)
        {
            for(let i = 0; i < this.completedViews.length; i++){
                this.completedViews[i].active = true;
            }
            return;
        }

        if(this.indexGoToStore < this.goToStore.length && currentIndex == this.goToStore[this.indexGoToStore]){
            //GoToStore.Open();
            this.indexGoToStore++;
        }
       
        if (this.index >= this.roadLaterals.length || this.roadLaterals[this.index] != currentIndex) return;
        this.current = this.roadLaterals[this.index];
        this.currentRotation = rotation;
        this.index++;
    }

    revive(): { indexRevive: number, rotation: Vec3 } 
    {
        var indexRevive = this.current;
        var rotation = this.currentRotation;
        return { indexRevive , rotation };
    }
}