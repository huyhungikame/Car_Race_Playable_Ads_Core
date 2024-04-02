import { _decorator, Camera, Component, Node } from 'cc';
import { PlayerMovement } from './PlayerMovement';
const { ccclass, property } = _decorator;

@ccclass('BaseCameraFollow')
export abstract class BaseCameraFollow extends Component {
    @property({ group: { name: 'Camera' , displayOrder: 1}, type: Camera }) 
    camera: Camera;
    
    abstract onStart(movement: PlayerMovement): void;
    abstract onLateUpdate(dt: number): void;
}