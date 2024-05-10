import { _decorator, Camera, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('CameraParticle')
export class CameraParticle extends Component {
    @property(Camera)
    mainCamera: Camera;

    particleCamera: Camera;

    protected onLoad(): void {
        this.particleCamera = this.getComponent(Camera);
    }

    protected lateUpdate(dt: number): void {
        this.particleCamera.orthoHeight = this.mainCamera.orthoHeight;
    }
}


