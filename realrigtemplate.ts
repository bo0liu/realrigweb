/// <reference path="scripts/d3.d.ts"/>
/// <reference path="scripts/jquery.d.ts"/>
/// <reference path="vo/TemplateVO.ts"/>
/// <reference path="view/head/TrackHeadView.ts"/>
/// <reference path="view/body/TrackBodyView.ts"/>
/// <reference path="view/digit/DigitParameterDIV.ts"/>
/// <reference path="realrigtemplatedialog.ts"/>
/// <reference path="realrigparameterdialog.ts"/>

module Realrig {
    export class Template {
        public digitParameterDives:Realrig.DigitParameterDIV[];
        public templateContainerVO:Realrig.TemplateContainerVO;
        public trackHeadMap:any = {};
        public trackBodyMap:any = {};
        public curveSelectList:Realrig.CurveSelect[];
        constructor() {
            var self = this;
            var bodyheight:number = window.innerHeight;
            if (bodyheight == 0) {
                bodyheight = screen.availHeight;
            }
            var bodyWidth:number = window.innerWidth;
            if (bodyWidth == 0) {
                bodyWidth = screen.availWidth;
            }
            var dhstr:string = d3.select("#navbar-main").style("height");
            var navHeight:number = <number><any>(dhstr.replace("px", ""));
            d3.select("#digitContainer").style("position","absolute").style("width","370px")
                .style("height",(bodyheight-navHeight).toString() + "px").style("left","10px").style("overflow-y","auto");
            d3.select("#templateHead").style("position","relative")
                .style("width", (bodyWidth - 400).toString() + "px").style("left", "390px");
            d3.select("#templateBody").style("position","relative")
                .style("width", (bodyWidth - 400).toString() + "px")
                .style("left", "390px").style("flow-y","auto");
            self.curveSelectList = [];
            d3.json('data/mudlogrange.json', function (error, data) {
                if(data)
                {
                    var lines = data.lines;
                    lines.forEach(function(element){
                        var curveSelect:Realrig.CurveSelect = new Realrig.CurveSelect();
                        curveSelect.linename = element.linename;
                        curveSelect.showname = element.showname;
                        self.curveSelectList.push(curveSelect);
                    });
                }
            });
            d3.json('data/mudlogtime.json', function (error, data) {
                var digitList:any = data.digites;
                self.initDigitItems(digitList);
                var container:any = data.container;
                self.initTemplateContainer(container);
                self.createTrack();
            });
        }

        /**
         * 解析数字显示块
         * @param digites
         */
        initDigitItems(digites:any):void {
            //this.digitProperties = [];
            this.digitParameterDives = [];
            var i:number = 0;
            for (var index in digites) {
                var digit:any;
                digit = digites[index].digitalItem;
                var digitProperty:Realrig.DigitPropertyVO = new Realrig.DigitPropertyVO();
                digitProperty.lineName = digit.lineName;
                digitProperty.showName = digit.showName;
                digitProperty.formulaType = digit.formulaType;
                digitProperty.formulaA = digit.formulaA;
                digitProperty.formulaB = digit.formulaB;
                digitProperty.precision = digit.precision;
                var dv:Realrig.DigitParameterDIV = new Realrig.DigitParameterDIV(digitProperty,index);
                this.digitParameterDives.push(dv);
                i++;
            }
//            var id0:string = this.digitNumberDives[0].attr("id");
//            var dd:any = d3.select("#" + id0).datum();
        }

        public refreshParameter():void
        {
            for(var i:number = 0;i<template.digitParameterDives.length;i++){
                var element:DigitParameterDIV = template.digitParameterDives[i];
                element.changeIndex(i);
            }
        }
        /**
         * 解析画线模板
         * @param container
         */
        public initTemplateContainer(container:any):void {
            var rwpx:string = d3.select("#templateHead").style("width");
            rwpx = rwpx.replace("px", "");
            var realwidth:number = <number><any>rwpx;
            this.templateContainerVO = new Realrig.TemplateContainerVO();
            this.templateContainerVO.yAxis = container.yAxis;
            this.templateContainerVO.initContainerWidth = realwidth;
            this.templateContainerVO.cellHeight = (container.perHeight) * (window.screen.height / 900);
            this.templateContainerVO.initContainerHeight = this.templateContainerVO.cellHeight;
            this.templateContainerVO.cellConvertHeight = container.realPerHeight;
            this.templateContainerVO.templateWidth = this.templateContainerVO.initContainerWidth - 30;
            this.templateContainerVO.templateHeight = this.templateContainerVO.initContainerHeight;
            var templates:any = container.templates;
            var atWidth:any = this.templateContainerVO.templateWidth;
            var tLength:number = 0;
            templates.forEach(function (element) {
                if (element.hasOwnProperty("timeTrack")) {
                    atWidth -= element.timeTrack.width;
                }
                else if (element.hasOwnProperty("depthTrack")) {
                    atWidth -= element.depthTrack.width;
                }
                else {
                    tLength++;
                }
            });
            this.templateContainerVO.actualTemplateWidth = atWidth;
            var cellWidth:number = this.templateContainerVO.actualTemplateWidth / tLength;
            var templateIndex:number = 0;
            var currentPos:number = 0;
            for (var index in templates) {
                var track = templates[index];
                var template;
                var templateProperty:Realrig.TrackPropertyVO;
                if (track.hasOwnProperty("curveTrack")) {
                    template = track.curveTrack;
                    templateProperty = this.initCurveTrack(template, templateIndex, cellWidth, currentPos);
                    this.templateContainerVO.tracks.push(templateProperty);
                    currentPos += cellWidth;
                }
                else if (track.hasOwnProperty("timeTrack")) {
                    template = track.timeTrack;
                    templateProperty = this.initTimeTrack(template, templateIndex, currentPos);
                    this.templateContainerVO.tracks.push(templateProperty);
                    currentPos += template.width;
                }
                else if (track.hasOwnProperty("depthTrack")) {
                    template = track.depthTrack;
                    templateProperty = this.initDepthTrack(template, templateIndex, currentPos);
                    this.templateContainerVO.tracks.push(templateProperty);
                    currentPos += template.width;
                }
                templateIndex++;
            }
        }

        /**
         * 曲线块
         * @param template
         * @param templateIndex
         * @returns {TemplatePropertyVO}
         */
        public initCurveTrack(template:any, templateIndex:number, cellWidth:number, currentPos:number):Realrig.TrackPropertyVO {
            var templateProperty:TrackPropertyVO = new Realrig.TrackPropertyVO();
            templateProperty.type = template.type.toString();
            templateProperty.backGridBorderColor = template.backGridBorderColor;
            templateProperty.backGridBorderThick = template.backGridBorderThick;
            templateProperty.templateIndex = templateIndex;
            templateProperty.headerHeight = 25;
            templateProperty.allHeaderHeight = 25;
            templateProperty.backGridWidth = cellWidth;
            templateProperty.cellHeight = this.templateContainerVO.cellHeight;
            templateProperty.horizontalCount = template.horizontalCount;
            templateProperty.verticalCount = template.verticalCount;
            templateProperty.startX = currentPos;
            templateProperty.endX = templateProperty.startX + templateProperty.backGridWidth;
            templateProperty.backGridColor = template.backGridColor;
            templateProperty.backGridThick = template.backGridThick;
            templateProperty.templateTitle = template.status;

            if (templateProperty.type == "curveTrack") {
                templateProperty.isLogLine = false;
            } else if (templateProperty.type == "curveLogTrack") {//是对数曲线
                templateProperty.isLogLine = true;
                templateProperty.startRange = template.startRange;
                templateProperty.endRange = template.endRange;
            }
            if (template.hasOwnProperty("curves")) {
                var curveList:any = template.curves;
                if (curveList && curveList.length > 0) {
                    for (var index in curveList) {
                        var curve:any = curveList[index];
                        var curveProperty:Realrig.CurvePropertyVO = this.initCurve(templateProperty, curve);
                        templateProperty.curves.push(curveProperty);
                    }
                }
            }

            return templateProperty;
        }

        /**
         * 时间道
         * @param template
         * @param templateIndex
         * @returns {TemplatePropertyVO}
         */
        public initTimeTrack(template:any, templateIndex:number, currentPos:number):Realrig.TrackPropertyVO {
            var templateProperty:TrackPropertyVO = new Realrig.TrackPropertyVO();
            templateProperty.type = template.type.toString();
            templateProperty.backGridBorderColor = template.backGridBorderColor;
            templateProperty.backGridBorderThick = template.backGridBorderThick;
            templateProperty.templateIndex = templateIndex;
            templateProperty.headerHeight = 25;
            templateProperty.allHeaderHeight = 25;
            templateProperty.backGridWidth = template.width;
            templateProperty.cellHeight = this.templateContainerVO.cellHeight;
            templateProperty.horizontalCount = template.horizontalCount;
            templateProperty.verticalCount = template.verticalCount;
            templateProperty.startX = currentPos;
            templateProperty.endX = templateProperty.startX + templateProperty.backGridWidth;
            templateProperty.isLogLine = false;
            return templateProperty;
        }

        /**
         * 深度道
         * @param template
         * @param templateIndex
         * @returns {TemplatePropertyVO}
         */
        public initDepthTrack(template:any, templateIndex:number, currentPos:number):Realrig.TrackPropertyVO {
            var templateProperty:TrackPropertyVO = new Realrig.TrackPropertyVO();
            templateProperty.type = template.type.toString();
            templateProperty.backGridBorderColor = template.backGridBorderColor;
            templateProperty.backGridBorderThick = template.backGridBorderThick;
            templateProperty.templateIndex = templateIndex;
            templateProperty.headerHeight = 25;
            templateProperty.allHeaderHeight = 25;
            templateProperty.backGridWidth = template.width;
            templateProperty.cellHeight = this.templateContainerVO.cellHeight;
            templateProperty.horizontalCount = template.horizontalCount;
            templateProperty.verticalCount = template.verticalCount;
            templateProperty.startX = currentPos;
            templateProperty.endX = templateProperty.startX + templateProperty.backGridWidth;
            templateProperty.isLogLine = false;
            templateProperty.headerHeight = 25;
            if (template.hasOwnProperty("curves")) {
                var curveList:any = template.curves;
                if (curveList && curveList.length > 0) {
                    for (var index in curveList) {
                        var curve:any = curveList[index];
                        var curveProperty:Realrig.CurvePropertyVO = this.initCurve(templateProperty, curve);
                        templateProperty.curves.push(curveProperty);
                    }
                }
            }
            return templateProperty;
        }

        public initCurve(template:TrackPropertyVO, curve:any):Realrig.CurvePropertyVO {
            var curveProperty:CurvePropertyVO = new CurvePropertyVO();
            curveProperty.showname = curve.showname;
            curveProperty.linename = curve.linename;
            curveProperty.linetype = curve.linetype;
            if (curve.hasOwnProperty("unit")) {
                curveProperty.unit = curve.unit;
            }
            if (curve.hasOwnProperty("multiple")) {
                curveProperty.multiple = curve.multiple;
            }
            if (curve.hasOwnProperty("ratio")) {
                curveProperty.ratio = curve.ratio;
            }

            if (template.type == "curveLogTrack") {
                curveProperty.isLogLine = true;
                curveProperty.leftvalue = template.startRange * curveProperty.multiple;
                curveProperty.rightvalue = template.endRange * curveProperty.multiple;
            }
            else {
                curveProperty.isLogLine = false;
                curveProperty.leftvalue = curve.leftValue * curveProperty.multiple;
                curveProperty.rightvalue = curve.rightValue * curveProperty.multiple;
            }
            curveProperty.linecolor = curve.lineColor;
            curveProperty.lineThick = curve.lineThick;
            curveProperty.labelFontFamily = curve.labelFontFamily;
            curveProperty.labelFontSize = curve.labelFontSize;
            if (curve.hasOwnProperty("relativeDepth")) {
                curveProperty.relativeDepth = curve.relativeDepth;
            }
            //是否画密度道
            if (curve.hasOwnProperty("drawDensity")) {
                curveProperty.drawDensity = curve.drawDensity;
            }
            else {
                curveProperty.drawDensity = false;
            }
            //是否截取数据
            if (curve.hasOwnProperty("isIntercept")) {
                if (curve.isIntercept == true) {
                    curveProperty.isIntercept = true;
                    if (curve.hasOwnProperty("intercept")) {
                        curveProperty.intercept = curve.intercept;
                    }
                }
                else {
                    curveProperty.isIntercept = false;
                }
            }
            //配置转换
            if(curve.hasOwnProperty("formulaType")){
                curveProperty.formulaType = curve.formulaType;
                if(curveProperty.formulaType > 0){
                    if(curve.hasOwnProperty("formulaA"))curveProperty.formulaA = curve.formulaA;
                    if(curve.hasOwnProperty("formulaB"))curveProperty.formulaB = curve.formulaB;
                }
            }
            return curveProperty;
        }

        private createTrack():void
        {
            var self = this;
            var bodyheight:number = window.innerHeight;
            if (bodyheight == 0) {
                bodyheight = screen.availHeight;
            }
            var bodyWidth:number = window.innerWidth;
            if (bodyWidth == 0) {
                bodyWidth = screen.availWidth;
            }

            this.templateContainerVO.tracks.forEach(function (element:TrackPropertyVO) {
                var trackHeader:Realrig.TrackHeadView = new TrackHeadView();
                element.allHeaderHeight = maxHeight;
                var cy = trackHeader.setTrackData(element);
                element.headerHeight = cy;
                self.trackHeadMap[element.uuid] = trackHeader;
            });//结束循环
            //计算最大高度
            var maxHeight:number = 25;
            this.templateContainerVO.tracks.forEach(function (element:TrackPropertyVO) {
                if (element.headerHeight > maxHeight) {
                    maxHeight = element.headerHeight;
                }
            });//循环结束
            //设置最大高度
            var dhstr:string = d3.select("#navbar-main").style("height");
            var navHeight:number = <number><any>(dhstr.replace("px", ""));
            var trackbodyheight:number = bodyheight - maxHeight - navHeight;
            d3.select("#templateHead").style("height", maxHeight.toString() + "px");
            //计算开始刻度
            var date:Date = new Date();
            var startTime:number = (Math.floor(date.getTime() / this.templateContainerVO.cellConvertHeight)) * this.templateContainerVO.cellConvertHeight;
            this.templateContainerVO.tracks.forEach(function (element:TrackPropertyVO) {
                element.allHeaderHeight = maxHeight;
                var header:Realrig.TrackHeadView = self.trackHeadMap[element.uuid];
                header.setTrackWidthAndHeight(element.backGridWidth, element.allHeaderHeight, element.backGridBorderColor, element.backGridBorderThick);
                var templateBody:Realrig.TrackBodyView = new Realrig.TrackBodyView();
                var initCellIndex:number = Math.ceil(trackbodyheight / self.templateContainerVO.cellHeight);
                templateBody.initTrackBody(element, initCellIndex);
                if (element.type == "timeTrack") {
                    templateBody.initScale(startTime, self.templateContainerVO.cellConvertHeight, initCellIndex);
                }
                element.startScale = startTime;
                self.trackBodyMap[element.uuid] = templateBody;
            });//循环结束
            d3.select("#templateBody").style("height",bodyheight - navHeight - maxHeight + "px").style("overflow-y","auto");
        }
        public refreshTrack():void{
            var key;
            for(key in this.trackHeadMap){
                var trackHeader:Realrig.TrackHeadView = this.trackHeadMap[key];
                trackHeader.destroy();
                delete this.trackHeadMap[key];
            }

            for(key in this.trackBodyMap){
                var trackBody:Realrig.TrackBodyView = this.trackBodyMap[key];
                trackBody.destroy();
                delete this.trackBodyMap[key];
            }
            this.createTrack();
        }
    }
    export var template:Realrig.Template = new Realrig.Template();
}
var tempDialog:Realrig.TemplateDialog;
tempDialog = new Realrig.TemplateDialog();
var paramDialog:Realrig.ParameterDialog;
paramDialog = new Realrig.ParameterDialog();