import { _decorator, Camera, Component, EventTouch, Input, input, Vec2 } from 'cc';
import { BotMovement } from './BotMovement';
import { PlayerMovement } from './PlayerMovement';
import { StartView } from '../UI/StartView';
import { PlayableAdsManager } from '../../../../TemplatePA/PlayableAdsManager';
const { ccclass, property } = _decorator;

@ccclass('GameManager')
export class GameManager extends Component {
    @property(StartView)
    startView: StartView;

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
           this.botMovementInScene[i].speedConvert(PlayerMovement.current.currentSpeed);
        }
    }

    RevivePlayer(){
        if (PlayerMovement.current.onDie){
            PlayerMovement.current.revivePlayer();
        }
    }

    openningTutorial : boolean = false;
    openTutorial(){
        this.openningTutorial = true;
        this.startView.node.active = true;
        this.startView.titleImage.active = false;
        this.startView.openHoldToRide();
    }
    closeTutorial(){
        this.openningTutorial = false;
        this.startView.node.active = false;
    }

    uiStartGame(): void
    {
        this.startView.startUi();
    }

    static startGame(): void
    {
        PlayerMovement.current.startGame(GameManager.mousePos);
        for (let i = 0; i < GameManager.instance.botMovementInScene.length; i++) { 
            GameManager.instance.botMovementInScene[i].isStartGame = true;
        }
        GameManager.instance.disableMouseMove();
    }

    onClickInstalGame(): void
    {
        PlayableAdsManager.instance.OpenURL_Button();    
    }

    updateRank(): void 
    {
        var rank = 1;
        var playerProgress = PlayerMovement.current.progress;
        for (let i = 0; i < this.botMovementInScene.length; i++) { 
            if(this.botMovementInScene[i].progress > playerProgress) rank++;
         }
         PlayerMovement.current.rank = rank;
    }
}