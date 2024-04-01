import { _decorator, Component, Node, random, randomRange, Tween, tween, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('CameraShake')
export class CameraShake extends Component {
    public shake(): void 
    {
        Tween.stopAllByTarget(this.node);
        tween(this.node)
        .to(0.1,{position: new Vec3(0,0.09,0)},{easing: "circOut"})
        .to(0.125,{position: new Vec3(0,-0.06,0)},{easing: "circInOut"})
        .to(0.15,{position: new Vec3(0,0.03,0)},{easing: "circInOut"})
        .to(0.175,{position: new Vec3(0,0,0)},{easing: "circInOut"})
        .start();
    }
}