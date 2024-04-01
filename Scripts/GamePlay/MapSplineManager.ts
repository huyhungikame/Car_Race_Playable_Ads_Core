import { CCBoolean, CCFloat, CCInteger, Component, Quat, TextAsset, Vec3, _decorator } from "cc";

const { ccclass, executeInEditMode, property} = _decorator;

@ccclass("RoadPoint")
export class RoadPoint {
    @property(CCFloat)
    public distanceToNext: number = 0;

    @property(CCFloat)
    public progress: number = 0;

    @property(CCInteger)
    public lateralIndex: number = 0;

    @property(CCBoolean) 
    public semilast: boolean = false;

    @property(CCBoolean) 
    public ignoreControl: boolean = false;

    @property(Vec3)
    public position: Vec3 = new Vec3();

    @property(Quat)
    public rotation: Quat = new Quat();
    
    @property(Vec3)
    public eulerAngles: Vec3 = new Vec3();
    
    @property(Vec3)
    public directionToNext: Vec3 = new Vec3();

    public setData(
        posX: number = 0,
        posY: number = 0,
        posZ: number = 0,
        rotX: number = 0,
        rotY: number = 0,
        rotZ: number = 0,
        rotW: number = 0,
        dirNextX: number = 0,
        dirNextY: number = 0,
        dirNextZ: number = 0,
        distToNext: number = 0,
        progress: number = 0,
        lateralIndex: number = 0,
        semilast: boolean = false,
        ignoreControl: boolean = false
    ) : void {
        this.position = new Vec3(posX, posY, posZ);
        this.rotation = new Quat(rotX, rotY, rotZ, rotW);
        this.rotation.getEulerAngles(this.eulerAngles);
        this.directionToNext = new Vec3(dirNextX, dirNextY, dirNextZ);
        this.distanceToNext = distToNext;
        this.progress = progress;
        this.lateralIndex = lateralIndex;
        this.semilast = semilast;
        this.ignoreControl = ignoreControl;
    }
}

@ccclass("RoadLateral")
export class RoadLateral {
    @property(CCFloat)
    public maxOffset: number = 0;

    @property(CCFloat)
    public radius: number = 0;
}

@ccclass("MapSplineManager")
@executeInEditMode(true)
export default class MapSplineManager extends Component {
    public static current: MapSplineManager;

    @property(CCBoolean)
    private needUpdate: boolean = false;

    @property({ 
        type: [RoadPoint],
        visible: false,
        serializable: true
    })
    public roadPoints: RoadPoint[] = [];

    @property({ type: [RoadLateral] })
    public roadLaterals: RoadLateral[] = [];

    @property({ type: TextAsset })
    private text: TextAsset = null;

    protected onLoad(): void {
        MapSplineManager.current = this;
        this.needUpdate = false;
    }

    protected update(_dt: number): void {
        if (!this.needUpdate) return;
        this.needUpdate = false;
        this.dataConvert();
    }

    private dataConvert() 
    {
        var content = this.text.text;
        var road = content.split('\n');
        this.roadPoints = [];
        for (let i = 0; i < road.length; i++) { 
            var r = road[i].split('|');
            var roadPoint = new RoadPoint();
            roadPoint.setData(
                parseFloat(r[0]), 
                parseFloat(r[1]), 
                parseFloat(r[2]),
                parseFloat(r[3]), 
                parseFloat(r[4]), 
                parseFloat(r[5]), 
                parseFloat(r[6]),
                parseFloat(r[7]), 
                parseFloat(r[8]), 
                parseFloat(r[9]),
                parseFloat(r[10]),
                parseFloat(r[11]),
                parseInt(r[12]),
                parseInt(r[13]) !== 0,
                parseInt(r[14]) !== 0,
            );
            this.roadPoints.push(roadPoint); 
        }
        console.log("Convert Data Completed")
    }
}