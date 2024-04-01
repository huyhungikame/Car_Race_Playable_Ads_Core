import { _decorator, Component, Node } from 'cc';
import { BaseGraphicCarPositionModule } from './BaseGraphicCarPositionModule';
const { ccclass, property } = _decorator;

@ccclass('PinelineGraphicPosition')
export class PinelineGraphicPosition extends BaseGraphicCarPositionModule {

    updateCarGraphic(dt: number): void {
        // var roadPoint = MapSplineManager.current.roadPoints[this.currentIndex];
        // var roadLateral = MapSplineManager.current.roadLaterals[roadPoint.lateralIndex];
        // var ignoreControl = roadPoint.ignoreControl;
        // var offset = roadLateral.maxOffset;
        // if (!ignoreControl && !this.isFallOutOfRoad && !this.isCheckGround) this.graphicLocalPosition.x = clamp(this.graphicLocalPosition.x, -offset, offset);
        // // var radius = roadLateral.radius;
        
        // // if (radius > 0 && !this.isFallOutOfRoad)
        // // {
        
        //     // var position =  new Vec3(this.player.position);
        //     // var rotation = new Quat(this.player.rotation);
        //     // var angle = this.xOffset / radius;
        //     // var centerUp = Vec3.transformQuat(new Vec3(), Vec3.UP, rotation).multiplyScalar(radius);
        //     // var center = new Vec3(position).add(centerUp)
        //     // var degress = (-180.0 / Math.PI * angle);
        //     // var radiusRotation = Quat.fromAxisAngle(new Quat(),Vec3.transformQuat(new Vec3(), Vec3.FORWARD, rotation),degress * (Math.PI / 180))
        //     // var down = Vec3.transformQuat(new Vec3(), new Vec3(0,-1,0), rotation).multiplyScalar(radius);
        //     // var direction = Vec3.transformQuat(new Vec3(),down,radiusRotation);
        //     // var radiusPosition = direction.normalize().multiplyScalar(radius).add(center);
        //     // radiusPosition.x *= -1;
        //     // var invert = this.player.inverseTransformPoint(new Vec3(),radiusPosition);
            
        //     // this.graphicLocalPosition =  new Vec3(this.graphicOffset).add(invert);
        //     // this.carGraphic.position = Vec3.lerp(new Vec3(),this.graphicLocalPosition, this.carGraphic.position, 0.65);

        //     //Rotation

        //     // this.updateGraphicLocalPos();
        //     // var up =  new Vec3(-center.x,center.y,center.z).subtract(this.carGraphic.worldPosition).normalize();
        //     // var forwardRotate = Vec3.transformQuat(new Vec3(), Vec3.FORWARD, this.player.worldRotation).normalize();
        //     // var upOffset = Quat.fromAxisAngle(new Quat(),forwardRotate,  angle * -100 * (Math.PI / 180));
        //     // up = Vec3.transformQuat(new Vec3(), up, upOffset);
        //     // var forwardAngle = Quat.fromAxisAngle(new Quat(),up,this.currentGraphicRotate * (Math.PI / 180));
        //     // forwardRotate.multiplyScalar(-1);
        //     // var forward = Vec3.transformQuat(new Vec3(), forwardRotate, forwardAngle).normalize();
        //     // this.carGraphic.worldRotation = Quat.fromViewUp(new Quat(),forward,up);
        //     // this.localGraphicAngle = this.carGraphic.eulerAngles;
        //     // return;
        // // }

        // Vec3.lerp(this.carGraphic.position,this.graphicLocalPosition, this.carGraphic.position, 0.65);
        // this.updateGraphicLocalPos();
        // // this.localGraphicAngle = Vec3.lerp(new Vec3(),new Vec3(0, this.currentGraphicRotate, 0), this.localGraphicAngle, 0.35);
        // // this.carGraphic.eulerAngles = this.localGraphicAngle;
        // this.materialWheel(dt);
    }
    
}


