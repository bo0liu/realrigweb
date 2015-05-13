/// <reference path="../../scripts/d3.d.ts"/>
/// <reference path="../../scripts/UUID.d.ts"/>
/// <reference path="../../vo/TemplateVO.ts"/>
module Realrig {
    export class TrackBodyView implements IDestroy
    {
        private bodysvg:D3.Selection;//主绘制的bodysvg
        private bodyboder:D3.Selection;//边界的bodyboder
        private bodywireframe:D3.Selection;//底下的线框
        private sclaes:any[];
        private linePointXes:any = [];
        private cellCount:number;//单元格的数量
        private
            uuid:string;

        constructor() {
            this.uuid = UUID.generate();
            this.bodysvg = d3.select("#templateBodyContainer").append("svg");
        }

        initTrackBody(template:Realrig.TrackPropertyVO, cellIndex:number):void {
            this.cellCount = cellIndex;
            var self = this;
            this.bodysvg.datum(template);
            template.tbuid = this.uuid;
            this.bodysvg.attr("x", template.startX).attr("y", 0);
            var line:D3.Selection;
            if (this.bodyboder == null) {
                this.bodyboder = this.bodysvg.append("g");
            }
            if (template.type == "curveLogTrack") {//对数模板
                this.linePointXes = this.createLogPoints(template.startRange, template.endRange, template.backGridWidth);
            }

            for (var i:number = 0; i < cellIndex; i++) {
                this.drawBodyCell(template, i);
            }
            this.bodysvg.attr("width", template.backGridWidth)
                .attr("height", cellIndex * template.cellHeight);
        }

        private createLogPoints(startRange:number, endRange:number, backGridWidth:number):number[] {
            var linePoints:number[] = [];
            //最大值和最小值的边界
            var minLogPeriphery:number;
            var maxLogPeriphery:number;
            //取log之后的整数边界
            var minIntegerPeriphery:number;
            var maxIntegerPeriphery:number;
            var perLogWidth:number;
            var iterator:number;
            var linePointX:number;
            if (startRange < endRange) {
                //取出最大值和最小值
                minLogPeriphery = Math.log(startRange) * Math.LOG10E;
                maxLogPeriphery = Math.log(endRange) * Math.LOG10E;
                //取出最大值和最小值之间的整数
                minIntegerPeriphery = Math.floor(minLogPeriphery);
                maxIntegerPeriphery = Math.ceil(maxLogPeriphery);
                perLogWidth = backGridWidth / (maxLogPeriphery - minLogPeriphery);
                //画左边非整数的部分
                for (iterator = 1; iterator <= 10; iterator++) {
                    if (Math.log(iterator) * Math.LOG10E >= minLogPeriphery - minIntegerPeriphery) {
                        linePointX = (Math.log(iterator) * Math.LOG10E - (minLogPeriphery - minIntegerPeriphery)) * perLogWidth;
                        linePoints.push(linePointX);
                    }
                }
                //画完整的框
                var leftWidth:number = (Math.log(10) * Math.LOG10E - (minLogPeriphery - minIntegerPeriphery)) * perLogWidth;
                for (var j:number = minIntegerPeriphery + 1; j < maxLogPeriphery - 1; j++) {
                    for (iterator = 1; iterator <= 10; iterator++) {
                        linePointX = leftWidth + (Math.log(iterator) * Math.LOG10E + (j - 1 - minIntegerPeriphery)) * perLogWidth;
                        linePoints.push(linePointX);
                    }
                }
                //画右边非整数的框
                if (maxIntegerPeriphery >= maxLogPeriphery) {
                    for (iterator = 1; iterator <= 10; iterator++) {
                        if (Math.log(iterator) * Math.LOG10E <= maxLogPeriphery - (maxIntegerPeriphery - 1)) {
                            linePointX = (Math.log(iterator) * Math.LOG10E) * perLogWidth + (maxIntegerPeriphery - minIntegerPeriphery - 2) * perLogWidth + leftWidth;
                            linePoints.push(linePointX);
                        }
                    }
                }
            }
            else {
                minLogPeriphery = Math.log(endRange) * Math.LOG10E;
                maxLogPeriphery = Math.log(startRange) * Math.LOG10E;
                //取出最大值和最小值之间的整数
                minIntegerPeriphery = Math.floor(minLogPeriphery);
                maxIntegerPeriphery = Math.ceil(maxLogPeriphery);
                perLogWidth = backGridWidth / (maxLogPeriphery - minLogPeriphery);
                //画右边非整数的部分
                for (iterator = 1; iterator <= 10; iterator++) {
                    if (Math.log(iterator) * Math.LOG10E >= minLogPeriphery - minIntegerPeriphery) {
                        linePointX = backGridWidth - (Math.log(iterator) * Math.LOG10E - minLogPeriphery + minIntegerPeriphery) * perLogWidth;
                        linePoints.push(linePointX);
                    }
                }
                //画完整的框
                var rightWidth:number = (Math.log(10) * Math.LOG10E - (minLogPeriphery - minIntegerPeriphery)) * perLogWidth;
                for (var k:number = minIntegerPeriphery + 1; k < maxIntegerPeriphery - 1; k++) {
                    for (iterator = 1; iterator <= 10; iterator++) {
                        linePointX = backGridWidth - (rightWidth + (Math.log(iterator) * Math.LOG10E + (k - 1 - minIntegerPeriphery)) * perLogWidth);
                        linePoints.push(linePointX);
                    }
                }
                //画左边非整数的框
                if (maxIntegerPeriphery >= maxLogPeriphery) {
                    for (iterator = 1; iterator <= 10; iterator++) {
                        if (Math.log(iterator) * Math.LOG10E <= maxLogPeriphery - (maxIntegerPeriphery - 1)) {
                            linePointX = backGridWidth - (Math.log(iterator) * Math.LOG10E) * perLogWidth - (maxIntegerPeriphery - minIntegerPeriphery - 2) * perLogWidth - rightWidth;
                            linePoints.push(linePointX);
                        }
                    }
                }
            }
            return linePoints;
        }

        /**
         * 画刻度线
         * @param TemplateCellMapHeight 每个格子映射的深度
         */
        public initScale(start:number, cellConvertHeight:number, cellIndex:number):void {
            var template:Realrig.TrackPropertyVO = this.bodysvg.datum();
            this.sclaes = [];
            var date:Date = new Date();
            var format = d3.time.format("%H:%M");
            for (var i:number = 0; i < cellIndex + 1; i++) {
                var scaleGroup:D3.Selection = this.bodysvg.append("g");
                var line:D3.Selection = scaleGroup.append("line");
                line.attr("x1", 0).attr("x2", template.backGridWidth)
                    .attr("y1", i * template.cellHeight).attr("y2", i * template.cellHeight)
                    .attr("stroke", template.backGridBorderColor)
                    .attr("stroke-width", template.backGridBorderThick)
                    .attr("fill", "none");
                var cDate:Date = new Date(start + i * cellConvertHeight);
                var text:D3.Selection = scaleGroup.append("text")
                    .text(format(cDate)).attr("fill", "black")
                    .style("font-size", "12px")
                    .attr("x", 0).attr("y", i * template.cellHeight + 23)
                    .attr("width", template.backGridWidth - 10).attr("height", 50);
                this.sclaes.push(scaleGroup);
            }
        }

        public expendBody():void {
            var template:TrackPropertyVO = this.bodysvg.datum();
            this.drawBodyCell(template, this.cellCount);
            this.cellCount++;
            this.bodysvg.attr("width", template.backGridWidth)
                .attr("height", this.cellCount * template.cellHeight);
        }

        private drawBodyCell(template:TrackPropertyVO, index:number):void {
            var line:D3.Selection;
            if (template.type != "timeTrack" && template.type != "depthTrack") {
                if (this.bodywireframe == null) {
                    this.bodywireframe = this.bodysvg.append("g");
                }
                var pathStr:string = "";
                var perHeight:number = template.cellHeight / template.horizontalCount;
                for (var m:number = 1; m < template.horizontalCount; m++) {
                    //先画水平
                    pathStr += "M0," + (index * template.cellHeight + m * perHeight).toString();
                    pathStr += "L" + template.backGridWidth.toString() + "," + (index * template.cellHeight + m * perHeight).toString();
                }
                if (template.type == "curveTrack") {
                    for (var n:number = 1; n < template.verticalCount; n++) {
                        var perWidth:number = template.backGridWidth / template.verticalCount;

                        //再画垂直的
                        pathStr += "M" + (perWidth * n).toString() + "," + (index * template.cellHeight).toString();
                        pathStr += "L" + (perWidth * n).toString() + "," + ((index + 1) * template.cellHeight);
                    }
                }
                else if (template.type == "curveLogTrack") {//对数模板
                    for (var x:number = 1; x < this.linePointXes.length; x++) {
                        //再画垂直的
                        pathStr += "M" + (this.linePointXes[x]).toString() + "," + (index * template.cellHeight).toString();
                        pathStr += "L" + (this.linePointXes[x]).toString() + "," + ((index + 1) * template.cellHeight);
                    }
                }
                var path:D3.Selection = this.bodywireframe.append("path");
                path.attr("d", pathStr).attr("stroke", template.backGridColor)
                    .attr("stroke-width", template.backGridThick)
                    .attr("fill", "none");
                //画水平的线
                line = this.bodyboder.append("line");
                line.attr("x1", 0).attr("x2", template.backGridWidth)
                    .attr("y1", index * template.cellHeight).attr("y2", index * template.cellHeight)
                    .attr("stroke", template.backGridBorderColor)
                    .attr("stroke-width", template.backGridBorderThick)
                    .attr("fill", "none");
                line = this.bodyboder.append("line");
                line.attr("x1", 0).attr("x2", template.backGridWidth)
                    .attr("y1", (index + 1) * template.cellHeight).attr("y2", (index + 1) * template.cellHeight)
                    .attr("stroke", template.backGridBorderColor)
                    .attr("stroke-width", template.backGridBorderThick)
                    .attr("fill", "none");
            }
            //画垂直的线
            line = this.bodyboder.append("line");
            line.attr("x1", 0).attr("x2", 0)
                .attr("y1", index * template.cellHeight).attr("y2", (index + 1) * template.cellHeight)
                .attr("stroke", template.backGridBorderColor)
                .attr("stroke-width", template.backGridBorderThick)
                .attr("fill", "none");
            line = this.bodyboder.append("line");
            line.attr("x1", template.backGridWidth).attr("x2", template.backGridWidth)
                .attr("y1", index * template.cellHeight).attr("y2", (index + 1) * template.cellHeight)
                .attr("stroke", template.backGridBorderColor)
                .attr("stroke-width", template.backGridBorderThick)
                .attr("fill", "none");
        }

        public expendScale(cellConvertHeight:number):void {
            var format = d3.time.format("%H:%M:%S");
            var template:Realrig.TrackPropertyVO = this.bodysvg.datum();
            var scaleGroup:D3.Selection = this.bodysvg.append("g");
            var line:D3.Selection = scaleGroup.append("line");
            line.attr("x1", 0).attr("x2", template.backGridWidth)
                .attr("y1", this.cellCount * template.cellHeight).attr("y2", this.cellCount * template.cellHeight)
                .attr("stroke", template.backGridBorderColor)
                .attr("stroke-width", template.backGridBorderThick)
                .attr("fill", "none");
            var cDate:Date = new Date(template.startScale + this.cellCount * cellConvertHeight);
            var text:D3.Selection = scaleGroup.append("text")
                .text(format(cDate)).attr("fill", "black")
                .style("font-size", "12px")
                .attr("x", 0).attr("y", this.cellCount * template.cellHeight + 23)
                .attr("width", template.backGridWidth - 10).attr("height", 50);
            this.sclaes.push(scaleGroup);
        }

        public destroy():void
        {
            if(this.sclaes){
                while(this.sclaes.length > 0){
                    var temp:D3.Selection = this.sclaes.shift();
                    temp.remove();
                }
            }
            this.bodyboder.remove();
            this.bodysvg.remove();
        }
    }
}