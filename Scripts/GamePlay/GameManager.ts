import { _decorator, Camera, Component, EventTouch, Input, input, Vec2 } from 'cc';
import { BotMovement } from './BotMovement';
import { PlayerMovement } from './PlayerMovement';
import { StartView } from '../../../../Scripts/UI/StartView';
const { ccclass, property } = _decorator;

@ccclass('GameManager')
export class GameManager extends Component {
    @property(StartView)
    startViews: StartView[] = [];
    


    @property(PlayerMovement)
    playerMovement: PlayerMovement;

    @property({ type: [BotMovement] })
    botMovementInScene: BotMovement[] = [];

    hasAI: boolean = false;

    static instance : GameManager;
    static mousePos: Vec2;

    @property({ type: Camera })
    mainCamera : Camera = null;
    @property({ type: Camera })
    effectCamera : Camera = null;

    onLoad() {
        input.on(Input.EventType.TOUCH_START, this.onMouseDown, this);
        input.on(Input.EventType.TOUCH_MOVE, this.onMouseMove, this);
        this.hasAI = this.botMovementInScene.length > 0;
        GameManager.instance = this;
    }




    synchronizeCamera() {
        this.effectCamera.orthoHeight = this.mainCamera.orthoHeight;
    }
    
    onMouseDown(event: EventTouch) {
        GameManager.mousePos = event.getLocation();
        this.uiStartGame();
        input.off(Input.EventType.TOUCH_START, this.onMouseDown, this);
    }

    onMouseMove(event: EventTouch) {
        GameManager.mousePos = event.getLocation();
    }

    disableMouseMove(): void 
    {
        input.off(Input.EventType.TOUCH_MOVE, this.onMouseMove, this);
    }

    protected update(_dt: number): void {
        this.updateRank();
        if(!this.hasAI) return;
        for (let i = 0; i < this.botMovementInScene.length; i++) { 
           this.botMovementInScene[i].speedConvert(this.playerMovement.currentSpeed);
        }
    }

    RevivePlayer(){
        if(this.playerMovement.onDie){
            this.playerMovement.revivePlayer();
        }
        
    }

    openningTutorial : boolean = false;
    openTutorial(){
        this.openningTutorial = true;
        for (let i = 0; i < this.startViews.length; i++) {
            this.startViews[i].node.active = true;
            this.startViews[i].titleImage.active = false;
            this.startViews[i].openHoldToRide();
        }
    }
    closeTutorial(){
        this.openningTutorial = false;
        for (let i = 0; i < this.startViews.length; i++) {
            this.startViews[i].node.active = false;
        }
    }

    uiStartGame(): void
    {
        for (let i = 0; i < this.startViews.length; i++) {
            this.startViews[i].startUi();
        }
    }

    static startGame(): void
    {
        GameManager.instance.playerMovement.startGame(GameManager.mousePos);
        for (let i = 0; i < GameManager.instance.botMovementInScene.length; i++) { 
            GameManager.instance.botMovementInScene[i].isStartGame = true;
        }
        GameManager.instance.disableMouseMove();
    }

    onClickInstalGame(): void
    {
        // GoToStore.Open();
        // PlayableAdsManager.instance.OpenURL_Button();    
    }

    updateRank(): void 
    {
        var rank = 1;
        var playerProgress = this.playerMovement.progress;
        for (let i = 0; i < this.botMovementInScene.length; i++) { 
            if(this.botMovementInScene[i].progress > playerProgress) rank++;
         }
         this.playerMovement.rank = rank;
    }
}