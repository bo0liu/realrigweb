/// <reference path="../scripts/UUID.d.ts"/>
module Realrig {
    export class DigitPropertyVO {
        showName:string;
        lineName:string;
        parentName:string;
        unit:string;
        formulaType:number;
        formulaA:number;
        formulaB:number;
        precision:number;
        uuid:string;

        constructor() {
            this.precision = 3;
            this.uuid = UUID.generate();
        }
    }

    export class CurvePropertyVO {
        templateIndex:number;
        recordid:string;
        itemid:number;
        linename:string;
        //显示名称
        showname:string;
        //取值的时候父节点的名称（只对LWD有效）
        parentname:string;
        //曲线单位
        unit:string;
        //左边值
        leftvalue:number;
        //右边值
        rightvalue:number;
        //倍数用于调整对数曲线的显示
        multiple:number;
        //系数
        ratio:number;
        //线的颜色
        linecolor:string;
        //虚线颜色
        lineVitualColor:number;
        //线条粗细
        lineThick:number;
        //是否是对数曲线
        isLogLine:boolean;
        //是否是直线
        linetype:number;//0 Polyline 1 Square Line
        //字体大小
        labelFontSize:number;
        //字体
        labelFontFamily:string;
        //相对高度变量
        relativeDepth:string;
        //是否显示密度道
        drawDensity:boolean;
        //是否要曲线断开
        isIntercept:boolean;
        //曲线断开
        intercept:number;
        //截取左边数据
        isLeftWarp:boolean;
        //左边的值
        leftWarp:number;
        //截取左边数据
        isRightWarp:boolean;
        //左边的值
        rightWarp:number;
        //显示仪表盘
        showMeter:boolean;
        //转换类型
        formulaType:number;
        formulaA:number;
        formulaB:number;
        precision:number = 3;
        uuid:string;
        chuid:string;//对应head的显示对象的uuid
        buid:string;//对应画线部分的uuid
        constructor() {
            this.multiple = 1;
            this.ratio = 1;
            this.labelFontSize = 12;
            this.labelFontFamily = "宋体";
            this.formulaType = 0;
            this.formulaA = 1;
            this.formulaB = 0;
            this.precision = 3;
            this.uuid = UUID.generate();
        }
    }

    export class TrackPropertyVO {
        //模板编号
        templateIndex:number;
        //当前的曲线头的高度
        headerHeight:number;
        allHeaderHeight:number;
        startX:number;
        endX:number;
        backGridColor:string;
        backGridBorderColor:string;
        backGridThick:number;
        backGridBorderThick:number;
        backGridWidth:number;//整个模板的宽度
        cellHeight:number;//每一个大格子的高度
        horizontalCount:number;//y轴上的线数
        verticalCount:number;//x轴上的线数
        isLogLine:boolean;
        endRange:number;
        startRange:number;
        //模板类型
        type:string;
        //模板状态
        templateTitle:string;
        uuid:string;
        thuid:string;//对应的head的uuid
        tbuid:string;//对应的body的uuid
        curves:Realrig.CurvePropertyVO[];
        startScale:number;//开始刻度
        constructor() {
            this.curves = [];
            this.backGridColor = "#000000";
            this.backGridBorderColor = "#000000";
            this.backGridThick = 1;
            this.uuid = UUID.generate();
        }
    }

    export class TemplateContainerVO {
        /**
         * 默认容器的宽度
         */
        initContainerWidth:number;
        /**
         * 默认容器的高度
         */
        initContainerHeight:number;
        /**
         * 实际模板的宽度
         */
        templateWidth:number;
        /**
         * 实际模板的高度
         */
        templateHeight:number;
        /**
         * 模板中的有效宽度（去掉深度道和时间道）
         */
        actualTemplateWidth:number;
        /**
         * 每个单元格的高度
         */
        cellHeight:number;
        /**
         * 对应的深度或者时间长度
         */
        cellConvertHeight:number;

        yAxis:string;

        tracks:Realrig.TrackPropertyVO[];

        constructor() {
            this.tracks = [];
            this.initContainerWidth = 380;
            this.initContainerHeight = 730;
            this.templateWidth = 730;
            this.templateHeight = 380;
            this.cellHeight = 180;
            this.cellConvertHeight = 50;
        }
    }

    export class CurveSelect
    {
        public showname:string;
        public linename:string;
    }

    export class Point
    {
        public x:number;
        public y:number;
        constructor(x:number = 0,y:number = 0){
            this.x = x;
            this.y = y;
        }

        public clone():Realrig.Point
        {
            return new Realrig.Point(this.x,this.y);
        }

        public toString():string
        {
            return this.x + "," + this.y;
        }
    }

    export interface IDestroy{
        destroy():void;
    }
}
