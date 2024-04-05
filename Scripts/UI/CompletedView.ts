import { _decorator, Component, Label, Node, ParticleSystem, Quat, Sprite, SpriteFrame, tween, UIOpacity, UITransform, Vec3, view, Widget } from 'cc';
import { PlayerMovement } from '../GamePlay/PlayerMovement';
import { screen } from 'cc'
import { CanvasScaler } from './CanvasScaler';
const { ccclass, property } = _decorator;

@ccclass('CompletedView')
export class CompletedView extends Component {
    @property(UIOpacity)
    completedView: UIOpacity;

    @property(Node)
    cupGraphic: Node;

    @property(Node)
    titleGraphic: Node;

    @property(Node)
    button: Node;

    @property(Node)
    effectGlow: Node;

    @property(Node)
    effectFirework: Node;

    @property(Sprite)
    cupSprite: Sprite;

    @property(Label)
    buttonText: Label;

    @property(SpriteFrame)
    cupFailSpriteFrame: SpriteFrame;

    @property(Sprite)
    buttonSprite: Sprite;

    @property(SpriteFrame)
    buttonSpriteFrame: SpriteFrame;

    @property(Widget)
    canvas: Widget;

    @property(CanvasScaler)
    canvasScale: CanvasScaler;

    playedEffect : boolean = false;

    protected onLoad(): void {
        var designSize = view.getDesignResolutionSize();
        var windowSize = screen.windowSize;
        var ratio = designSize.width / designSize.height;
        var windowWidth = windowSize.height * ratio;
        this.canvas.left = this.canvas.right = (windowSize.width - windowWidth) / 2;
        var scale = this.node.scale.x / this.canvasScale.scaleFactor;
        this.node.scale = new Vec3(scale,scale,scale);
    }

    protected start(): void {
        PlayerMovement.current.endGame = true;
        
        if(PlayerMovement.current.rank != 1){
            this.cupSprite.spriteFrame = this.cupFailSpriteFrame;
            this.buttonText.string = "TRY AGAIN";
            this.buttonSprite.spriteFrame = this.buttonSpriteFrame;
        }

        tween(this.completedView).to(0.5,{opacity: 255},{
            onComplete: () =>{
                this.startAnimationCompleted();
            }
        }).start();

        tween(PlayerMovement.current.cameraFollow.camera.node).to(1.75,{ worldPosition: new Vec3(228,17.82,-236.1)}).start();
    }

    startAnimationCompleted(): void
    {
        tween(this.titleGraphic).to(0.333,{scale: Vec3.ONE},{
            easing: "backOut",
            onComplete: () =>{
                tween(this.cupGraphic).to(0.333,{scale: Vec3.ONE},{
                    easing: "backOut",
                    onComplete: () =>{
                        tween(this.button).to(0.333,{scale: Vec3.ONE},{
                            easing: "backOut",
                            onComplete: () =>{
                                this.effectFirework.active = true;
                                this.effectFirework.children[0].children[0].getComponent(ParticleSystem).play();
                                this.effectFirework.children[1].children[0].getComponent(ParticleSystem).play();
                                tween(this.button)
                                .to(1.2,{scale: new Vec3(1.15,1.15,1)},{
                                    easing: "linear",
                                })
                                .to(0.5,{scale: Vec3.ONE},{
                                    easing: "linear",
                                })
                                .union()
                                .repeat(90000)
                                .start();
                            }
                        }).start();
                    }
                }).start();
            }
        }).start();
    }
}