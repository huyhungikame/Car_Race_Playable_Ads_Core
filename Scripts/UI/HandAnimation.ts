import { _decorator, Component, Node, Tween, tween, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('HandAnimation')
export class HandAnimation extends Component {
   @property(Node)
   targetNode: Node = null;  // Đối tượng bạn muốn tween
   targetTween : Tween<Node>;

   @property
    moveHand : boolean = false;

    @property
    loop : boolean = false;

    @property(Node)
    targetMove : Node;

   start() {
       //Tween thu nhỏ đối tượng từ kích thước hiện tại về (0.5, 0.5, 1) trong 1 giây
       
       if(!this.moveHand){
            if(this.loop){
                this.targetNode.scale = new Vec3(0.7, 0.7, .7);
                this.targetTween = tween(this.targetNode)
                .to(.5, { scale: new Vec3(1, 1, 1) })  
                .to(.5, { scale: new Vec3(0.7, 0.7, .7) })
                .union()  // Kết hợp tween trên với tween dưới
                .repeatForever()  // Lặp lại vô hạn
                .start();
            }else{
                this.targetNode.scale = new Vec3(0.7, 0.7, .7);
                this.targetTween = tween(this.targetNode)
                    .to(.8, { scale: new Vec3(1, 1, 1) })  // Tween trở lại kích thước ban đầu trong 1 giây
                    .start();
            }
            
       }
       
   }

   protected onEnable(): void {
    if(this.moveHand){
        var cachePosition = this.targetNode.position;
        if(this.loop){
            this.targetTween = tween(this.targetNode)
            .to(1, { position: new Vec3(cachePosition.x + 50,cachePosition.y -50,0)},{easing : 'sineOut'})
            .to(1, { position: new Vec3(cachePosition.x,cachePosition.y,0)},{easing : 'sineIn'})  // Tween trở lại kích thước ban đầu trong 1 giây
            .union()  // Kết hợp tween trên với tween dưới
            .repeatForever()  // Lặp lại vô hạn
            .start();
        }else{
            this.targetTween = tween(this.targetNode)
            .to(.35, { position: new Vec3(cachePosition.x + 50,cachePosition.y -50,0)},{easing : 'sineOut'})
            .to(.35, { position: new Vec3(cachePosition.x,cachePosition.y,0)},{easing : 'sineIn'})  // Tween trở lại kích thước ban đầu trong 1 giây
            .start();
        }
    }

   }
}