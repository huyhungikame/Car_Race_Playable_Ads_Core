import { _decorator, Component, Node, Quat, Tween, tween, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('GarageManager')
export class GarageManager extends Component {
    @property(Node)
    car: Node;

    @property(Node)
    camera: Node;

    @property([Node])
    engine: Node[] = [];

    @property(Node)
    cabinLid: Node;

    @property([Node])
    spoiler: Node[] = [];

    @property([Node])
    wheel: Node[] = [];

    carRotation: Quat = new Quat();
    rotationAdd: Quat = new Quat();
    isRotate: boolean = true;
    currentAnimation: number = -1;

    protected update(dt: number): void {
        if(!this.isRotate) return;
        this.car.getRotation(this.carRotation);
        Quat.fromEuler(this.rotationAdd, 0, -20 * dt, 0);
        Quat.multiply(this.carRotation,this.carRotation,this.rotationAdd);
        this.car.setRotation(this.carRotation);
    }

    enableEngineAnimation(level: number): void {
        Tween.stopAllByTag(100);
        this.currentAnimation = 1;
        for (let i = 0; i < this.engine.length; i++) {
            var element = this.engine[i];
            element.active = level == i;
            if(level == i) this.animationCabinLib(element);
        }
    }

    animationCabinLib(animaiton: Node): void {
        this.isRotate = false;
        tween(this.cabinLid)
            .to(0.3, {eulerAngles: new Vec3(-75, 0, 0)}, {easing: "backOut"})
            .tag(100)
            .start();

        tween(this.car)
            .to(0.25, {eulerAngles: new Vec3(0, -25, 0)},{easing: "backOut"})
            .to(0.15, {scale: new Vec3(1.05, 0.9,1)}, {easing: "backOut"})
            .to(0.1, {scale: Vec3.ONE}, {easing: 'backOut'})
            .tag(100)
            .start();

        animaiton.setScale(new Vec3(0.5,1.5,1));
        animaiton.setPosition(new Vec3(0,1.5,0));
        animaiton.active = false;
        tween(animaiton)
            .delay(0.15)
            .to(0.15, {
                position: Vec3.ZERO,
                scale: new Vec3(1.35, 0.5,1)
            }, {easing: "sineOut", onStart: () => animaiton.active = true})
            .to(0.2, {scale: Vec3.ONE}, {easing: 'backOut', onComplete: () => this.isRotate = true})
            .tag(100)
            .start()
    }

    closeCabinLib(): void {
        this.isRotate = false;
        tween(this.cabinLid)
            .to(0.3, {eulerAngles: new Vec3(0, 0, 0)}, {easing: "sineOut"})
            .tag(100)
            .start();

        for (let i = 0; i < this.engine.length; i++) {
            var element = this.engine[i];
            element.active = false;
        }
    }

    enableEngineColorAnimation(index: number): void{
        Tween.stopAllByTag(100);
        if(this.currentAnimation == 1){
            this.closeCabinLib();
        }
        this.currentAnimation = 0;
    }

    enableEngineSpolerAnimation(index: number) : void {
        Tween.stopAllByTag(100);
        if(this.currentAnimation == 1){
            this.closeCabinLib();
        } 
        this.currentAnimation = 3;

        for (let i = 0; i < this.spoiler.length; i++) {
            var element = this.spoiler[i];
            element.active = index == i;
            if(index == i) this.animationSpoiler(element);
        } 
    }

    animationSpoiler(animaiton: Node): void {
        this.isRotate = false;

        tween(this.car)
            .to(0.25, {eulerAngles: new Vec3(0, 155, 0)},{easing: "backOut"})
            .to(0.15, {scale: new Vec3(1.05, 0.9,1)}, {easing: "backOut"})
            .to(0.1, {scale: Vec3.ONE}, {easing: 'backOut'})
            .tag(100)
            .start();

        animaiton.setScale(new Vec3(0.5,1.5,1));
        animaiton.setPosition(new Vec3(0,1.5,0));
        animaiton.active = false;
        tween(animaiton)
            .delay(0.15)
            .to(0.15, {
                position: Vec3.ZERO,
                scale: new Vec3(1, 0.5,1)
            }, {easing: "sineOut", onStart: () => animaiton.active = true})
            .to(0.2, {scale: Vec3.ONE}, {easing: 'backOut', onComplete: () => this.isRotate = true})
            .tag(100)
            .start()
    }


    enableEngineWheelAnimation(index: number) : void {
        Tween.stopAllByTag(100);
        if(this.currentAnimation == 1){
            this.closeCabinLib();
        } 
        this.currentAnimation = 2;

        for (let i = 0; i < this.wheel.length; i++) {
            var element = this.wheel[i];
            element.active = index == i;
            if(index == i) this.animationWheel(element);
        } 
    }

    animationWheel(animaiton: Node): void {
        this.isRotate = false;

        tween(this.car)
            .to(0.25, {eulerAngles: new Vec3(0, 90, 0)},{easing: "backOut"})
            .to(0.15, {scale: new Vec3(1.025, 0.985,1)}, {easing: "backOut"})
            .to(0.1, {scale: Vec3.ONE}, {easing: 'backOut'})
            .tag(100)
            .start();

        animaiton.setScale(new Vec3(0.5,1.5,1));
        animaiton.setPosition(new Vec3(0.63,0.234 - 1.5, 0.984));
        animaiton.active = false;
        tween(animaiton)
            .delay(0.15)
            .to(0.15, {
                position: new Vec3(0.63,0.234, 0.984),
                scale: new Vec3(1, 0.5,1)
            }, {easing: "sineOut", onStart: () => animaiton.active = true})
            .to(0.2, {scale: Vec3.ONE}, {easing: 'backOut', onComplete: () => this.isRotate = true})
            .tag(100)
            .start()
    }
}