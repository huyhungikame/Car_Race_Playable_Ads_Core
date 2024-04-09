import { _decorator, Camera, Component, EventTouch, Input, input, Vec2 } from 'cc';
import { BotMovement } from './BotMovement';
import { PlayerMovement } from './PlayerMovement';
import { PlayableAdsManager } from '../../../../TemplatePA/PlayableAdsManager';
import { StartView } from '../UI/StartView';
const { ccclass, property } = _decorator;

@ccclass('GameManager')
export class GameManager extends Component {

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

    hideCar(){
        for (let i = 0; i < this.botMovementInScene.length; i++) {
            var element = this.botMovementInScene[i];
            element.node.parent.active = false;
        }

        PlayerMovement.current.node.parent.active = false;
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
    }

    RevivePlayer(){
        if (PlayerMovement.current.onDie){
            PlayerMovement.current.revivePlayer();
        }
    }

    openningTutorial : boolean = false;
    openTutorial(){
        this.openningTutorial = true;
        StartView.current.node.active = true;
        StartView.current.titleImage.active = false;
        StartView.current.openHoldToRide();
    }
    closeTutorial(){
        this.openningTutorial = false;
        StartView.current.node.active = false;
    }

    uiStartGame(): void
    {
        StartView.current.startUi();
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