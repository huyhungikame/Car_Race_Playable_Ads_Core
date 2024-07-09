import { _decorator, Component, Material, Node, Quat, Texture2D, Tween, tween, Vec3 } from 'cc';
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

    @property(Material)
    materialCar: Material;
//
    @property([Texture2D])
    textureColor: Texture2D[] = [];

    carRotation: Quat = new Quat();
    rotationAdd: Quat = new Quat();
    isRotate: boolean = true;
    currentAnimation: number = -1;

    currentEngineIndex = -1;
    public currentSpoilerIndex = -1;
    currentWheelIndex = -1;
    public currentColorIndex = -1;

    protected update(dt: number): void {
        if(!this.isRotate) return;
        this.car.getRotation(this.carRotation);
        Quat.fromEuler(this.rotationAdd, 0, -20 * dt, 0);
        Quat.multiply(this.carRotation,this.carRotation,this.rotationAdd);
        this.car.setRotation(this.carRotation);
    }

    enableEngineAnimation(level: number): void {
        Tween.stopAllByTag(100);
        Tween.stopAllByTag(101);
        Tween.stopAllByTag(102);
        var lastAnimation = this.currentAnimation;
        this.currentAnimation = 1;
        if(this.currentEngineIndex == level && lastAnimation == 1) return;
        if(this.currentEngineIndex == -1) this.currentEngineIndex = 0;
        for (let i = 0; i < this.engine.length; i++) {
            var element = this.engine[i];
            element.active = level == i;
            if(level == i) this.animationCabinLib(element, this.currentEngineIndex != level);
        }
        this.currentEngineIndex = level
    }

    animationCabinLib(animaiton: Node, upgrade: boolean): void {
        this.isRotate = false;
        tween(this.cabinLid)
            .to(0.3, {eulerAngles: new Vec3(-75, 0, 0)}, {easing: "backOut"})
            .tag(100)
            .start();

        if(!upgrade) {
            tween(this.car)
            .to(0.25, {eulerAngles: new Vec3(0, 10, 0)},{easing: "backOut"})
            .to(0.15, {scale: new Vec3(1.02, 0.98,1)}, {easing: "backOut"})
            .to(0.1, {scale: Vec3.ONE}, {easing: 'backOut', onComplete: () => this.isRotate = true})
            .tag(100)
            .start();
            this.updateCamera();
            return;
        }

        tween(this.car)
        .to(0.25, {eulerAngles: new Vec3(0, 10, 0)},{easing: "backOut"})
        .to(0.15, {scale: new Vec3(1.05, 0.9,1)}, {easing: "backOut"})
        .to(0.1, {scale: Vec3.ONE}, {easing: 'backOut'})
        .tag(100)
        .start();

        this.updateCamera();

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

    updateCamera(): void {
        tween(this.camera)
        .to(0.25, {
            position: new Vec3(0, 5.678, 8.58),
            eulerAngles: new Vec3(-30, 0, 0)
        },{easing: "backOut"})
        .tag(102)
        .start();
    }

    hideCamera(): void {
        tween(this.camera)
            .to(0.2, {
                position: new Vec3(0, 1.878, 8.58),
                eulerAngles: new Vec3(-9, 0, 0)
            },{easing: "backOut"})
            .tag(102)
            .start();
            //
    }

    closeCabinLib(): void {
        this.isRotate = false;
        tween(this.cabinLid)
            .to(0.3, {eulerAngles: new Vec3(0, 0, 0)}, {easing: "sineOut"})
            .tag(101)
            .start();
        this.hideCamera();
        for (let i = 0; i < this.engine.length; i++) {
            var element = this.engine[i];
            element.active = false;
        }
    }

    enableEngineColorAnimation(index: number): void{
        Tween.stopAllByTag(101);
        Tween.stopAllByTag(102);
        if(this.currentAnimation == 1){
            this.closeCabinLib();
        } 
        this.currentAnimation = 0;
        Tween.stopAllByTag(100);
        this.isRotate = false;
        tween(this.car)
            .to(0.15, {eulerAngles: new Vec3(0, -45, 0)},{easing: "sineOut", onComplete: () => {
                this.currentColorIndex = index;
                this.materialCar.setProperty("matcapTexture",this.textureColor[index])}})
            .to(0.1, {scale: new Vec3(1.02, 0.98,1)}, {easing: "backOut"})
            .to(0.075, {scale: Vec3.ONE}, {easing: 'backOut', onComplete: ()=> this.isRotate = true})
            .tag(100)
            .start();
    }

    enableEngineSpolerAnimation(index: number) : void {
        Tween.stopAllByTag(101);
        Tween.stopAllByTag(102);
        if(this.currentAnimation == 1){
            this.closeCabinLib();
        } 
        var lastAnimation = this.currentAnimation;
        this.currentAnimation = 3;
        if(this.currentSpoilerIndex == index && lastAnimation == 3) return;
        Tween.stopAllByTag(100);
        if(this.currentSpoilerIndex == -1) this.currentSpoilerIndex = 0;
        for (let i = 0; i < this.spoiler.length; i++) {
            var element = this.spoiler[i];
            element.active = index == i;
            if(index == i) this.animationSpoiler(element, this.currentSpoilerIndex != index);
        } 

        this.currentSpoilerIndex = index;
    }

    animationSpoiler(animaiton: Node,  upgrade: boolean): void {
        this.isRotate = false;

        if(!upgrade) {
                tween(this.car)
                .to(0.25, {eulerAngles: new Vec3(0, 155, 0)},{easing: "backOut"})
                .to(0.15, {scale: new Vec3(1.02, 0.98,1)}, {easing: "backOut"})
                .to(0.1, {scale: Vec3.ONE}, {easing: 'backOut', onComplete: () => this.isRotate = true})
                .tag(100)
                .start();
                return;
            }
    
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
        Tween.stopAllByTag(101);
        Tween.stopAllByTag(102);
        if(this.currentAnimation == 1){
            this.closeCabinLib();
        } 
        var lastAnimation = this.currentAnimation;
        this.currentAnimation = 2;
        if(this.currentWheelIndex == index && lastAnimation == 2) return;
        Tween.stopAllByTag(100);
        if(this.currentWheelIndex == -1) this.currentWheelIndex = 0;
        for (let i = 0; i < this.wheel.length; i++) {
            var element = this.wheel[i];
            element.active = index == i;
            if(index == i) this.animationWheel(element, this.currentWheelIndex != index);
        } 
        this.currentWheelIndex = index;
    }

    animationWheel(animaiton: Node, upgrade: boolean): void {
        this.isRotate = false;

        if(!upgrade) {
            tween(this.car)
                .to(0.25, {eulerAngles: new Vec3(0, 90, 0)},{easing: "backOut"})
                .to(0.15, {scale: new Vec3(1.02, 0.98,1)}, {easing: "backOut"})
                .to(0.1, {scale: Vec3.ONE}, {easing: 'backOut', onComplete: () => this.isRotate = true})
                .tag(100)
                .start();
                return;
            }
    
        tween(this.car)
            .to(0.25, {eulerAngles: new Vec3(0, 90, 0)},{easing: "backOut"})
            .to(0.15, {scale: new Vec3(1.025, 0.985,1)}, {easing: "backOut"})
            .to(0.1, {scale: Vec3.ONE}, {easing: 'backOut'})
            .tag(100)
            .start();

        animaiton.setScale(new Vec3(0.5,1.25,1));
        animaiton.setPosition(new Vec3(0.63,0.234 - 1.5, 0.984));
        animaiton.active = false;
        tween(animaiton)
            .delay(0.15)
            .to(0.15, {
                position: new Vec3(0.63,0.234, 0.984),
                scale: new Vec3(1, 0.8,1)
            }, {easing: "backOut", onStart: () => animaiton.active = true})
            .to(0.2, {scale: Vec3.ONE}, {easing: 'backOut', onComplete: () => this.isRotate = true})
            .tag(100)
            .start()
    }
}