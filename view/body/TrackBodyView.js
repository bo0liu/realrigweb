/// <reference path="../../scripts/d3.d.ts"/>
/// <reference path="../../scripts/UUID.d.ts"/>
/// <reference path="../../vo/TemplateVO.ts"/>
var Realrig;
(function (Realrig) {
    var TrackBodyView = (function () {
        function TrackBodyView() {
            this.linePointXes = [];
            this.uuid = UUID.generate();
            this.bodysvg = d3.select("#templateBodyContainer").append("svg");
        }
        TrackBodyView.prototype.initTrackBody = function (template, cellIndex) {
            this.cellCount = cellIndex;
            var self = this;
            this.bodysvg.datum(template);
            template.tbuid = this.uuid;
            this.bodysvg.attr("x", template.startX).attr("y", 0);
            var line;
            if (this.bodyboder == null) {
                this.bodyboder = this.bodysvg.append("g");
            }
            if (template.type == "curveLogTrack") {
                this.linePointXes = this.createLogPoints(template.startRange, template.endRange, template.backGridWidth);
            }

            for (var i = 0; i < cellIndex; i++) {
                this.drawBodyCell(template, i);
            }
            this.bodysvg.attr("width", template.backGridWidth).attr("height", cellIndex * template.cellHeight);
        };

        TrackBodyView.prototype.createLogPoints = function (startRange, endRange, backGridWidth) {
            var linePoints = [];

            //最大值和最小值的边界
            var minLogPeriphery;
            var maxLogPeriphery;

            //取log之后的整数边界
            var minIntegerPeriphery;
            var maxIntegerPeriphery;
            var perLogWidth;
            var iterator;
            var linePointX;
            if (startRange < endRange) {
                //取出最大值和最小值
                minLogPeriphery = Math.log(startRange) * Math.LOG10E;
                maxLogPeriphery = Math.log(endRange) * Math.LOG10E;

                //取出最大值和最小值之间的整数
                minIntegerPeriphery = Math.floor(minLogPeriphery);
                maxIntegerPeriphery = Math.ceil(maxLogPeriphery);
                perLogWidth = backGridWidth / (maxLogPeriphery - minLogPeriphery);

                for (iterator = 1; iterator <= 10; iterator++) {
                    if (Math.log(iterator) * Math.LOG10E >= minLogPeriphery - minIntegerPeriphery) {
                        linePointX = (Math.log(iterator) * Math.LOG10E - (minLogPeriphery - minIntegerPeriphery)) * perLogWidth;
                        linePoints.push(linePointX);
                    }
                }

                //画完整的框
                var leftWidth = (Math.log(10) * Math.LOG10E - (minLogPeriphery - minIntegerPeriphery)) * perLogWidth;
                for (var j = minIntegerPeriphery + 1; j < maxLogPeriphery - 1; j++) {
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
            } else {
                minLogPeriphery = Math.log(endRange) * Math.LOG10E;
                maxLogPeriphery = Math.log(startRange) * Math.LOG10E;

                //取出最大值和最小值之间的整数
                minIntegerPeriphery = Math.floor(minLogPeriphery);
                maxIntegerPeriphery = Math.ceil(maxLogPeriphery);
                perLogWidth = backGridWidth / (maxLogPeriphery - minLogPeriphery);

                for (iterator = 1; iterator <= 10; iterator++) {
                    if (Math.log(iterator) * Math.LOG10E >= minLogPeriphery - minIntegerPeriphery) {
                        linePointX = backGridWidth - (Math.log(iterator) * Math.LOG10E - minLogPeriphery + minIntegerPeriphery) * perLogWidth;
                        linePoints.push(linePointX);
                    }
                }

                //画完整的框
                var rightWidth = (Math.log(10) * Math.LOG10E - (minLogPeriphery - minIntegerPeriphery)) * perLogWidth;
                for (var k = minIntegerPeriphery + 1; k < maxIntegerPeriphery - 1; k++) {
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
        };

        /**
        * 画刻度线
        * @param TemplateCellMapHeight 每个格子映射的深度
        */
        TrackBodyView.prototype.initScale = function (start, cellConvertHeight, cellIndex) {
            var template = this.bodysvg.datum();
            this.sclaes = [];
            var date = new Date();
            var format = d3.time.format("%H:%M");
            for (var i = 0; i < cellIndex + 1; i++) {
                var scaleGroup = this.bodysvg.append("g");
                var line = scaleGroup.append("line");
                line.attr("x1", 0).attr("x2", template.backGridWidth).attr("y1", i * template.cellHeight).attr("y2", i * template.cellHeight).attr("stroke", template.backGridBorderColor).attr("stroke-width", template.backGridBorderThick).attr("fill", "none");
                var cDate = new Date(start + i * cellConvertHeight);
                var text = scaleGroup.append("text").text(format(cDate)).attr("fill", "black").style("font-size", "12px").attr("x", 0).attr("y", i * template.cellHeight + 23).attr("width", template.backGridWidth - 10).attr("height", 50);
                this.sclaes.push(scaleGroup);
            }
        };

        TrackBodyView.prototype.expendBody = function () {
            var template = this.bodysvg.datum();
            this.drawBodyCell(template, this.cellCount);
            this.cellCount++;
            this.bodysvg.attr("width", template.backGridWidth).attr("height", this.cellCount * template.cellHeight);
        };

        TrackBodyView.prototype.drawBodyCell = function (template, index) {
            var line;
            if (template.type != "timeTrack" && template.type != "depthTrack") {
                if (this.bodywireframe == null) {
                    this.bodywireframe = this.bodysvg.append("g");
                }
                var pathStr = "";
                var perHeight = template.cellHeight / template.horizontalCount;
                for (var m = 1; m < template.horizontalCount; m++) {
                    //先画水平
                    pathStr += "M0," + (index * template.cellHeight + m * perHeight).toString();
                    pathStr += "L" + template.backGridWidth.toString() + "," + (index * template.cellHeight + m * perHeight).toString();
                }
                if (template.type == "curveTrack") {
                    for (var n = 1; n < template.verticalCount; n++) {
                        var perWidth = template.backGridWidth / template.verticalCount;

                        //再画垂直的
                        pathStr += "M" + (perWidth * n).toString() + "," + (index * template.cellHeight).toString();
                        pathStr += "L" + (perWidth * n).toString() + "," + ((index + 1) * template.cellHeight);
                    }
                } else if (template.type == "curveLogTrack") {
                    for (var x = 1; x < this.linePointXes.length; x++) {
                        //再画垂直的
                        pathStr += "M" + (this.linePointXes[x]).toString() + "," + (index * template.cellHeight).toString();
                        pathStr += "L" + (this.linePointXes[x]).toString() + "," + ((index + 1) * template.cellHeight);
                    }
                }
                var path = this.bodywireframe.append("path");
                path.attr("d", pathStr).attr("stroke", template.backGridColor).attr("stroke-width", template.backGridThick).attr("fill", "none");

                //画水平的线
                line = this.bodyboder.append("line");
                line.attr("x1", 0).attr("x2", template.backGridWidth).attr("y1", index * template.cellHeight).attr("y2", index * template.cellHeight).attr("stroke", template.backGridBorderColor).attr("stroke-width", template.backGridBorderThick).attr("fill", "none");
                line = this.bodyboder.append("line");
                line.attr("x1", 0).attr("x2", template.backGridWidth).attr("y1", (index + 1) * template.cellHeight).attr("y2", (index + 1) * template.cellHeight).attr("stroke", template.backGridBorderColor).attr("stroke-width", template.backGridBorderThick).attr("fill", "none");
            }

            //画垂直的线
            line = this.bodyboder.append("line");
            line.attr("x1", 0).attr("x2", 0).attr("y1", index * template.cellHeight).attr("y2", (index + 1) * template.cellHeight).attr("stroke", template.backGridBorderColor).attr("stroke-width", template.backGridBorderThick).attr("fill", "none");
            line = this.bodyboder.append("line");
            line.attr("x1", template.backGridWidth).attr("x2", template.backGridWidth).attr("y1", index * template.cellHeight).attr("y2", (index + 1) * template.cellHeight).attr("stroke", template.backGridBorderColor).attr("stroke-width", template.backGridBorderThick).attr("fill", "none");
        };

        TrackBodyView.prototype.expendScale = function (cellConvertHeight) {
            var format = d3.time.format("%H:%M:%S");
            var template = this.bodysvg.datum();
            var scaleGroup = this.bodysvg.append("g");
            var line = scaleGroup.append("line");
            line.attr("x1", 0).attr("x2", template.backGridWidth).attr("y1", this.cellCount * template.cellHeight).attr("y2", this.cellCount * template.cellHeight).attr("stroke", template.backGridBorderColor).attr("stroke-width", template.backGridBorderThick).attr("fill", "none");
            var cDate = new Date(template.startScale + this.cellCount * cellConvertHeight);
            var text = scaleGroup.append("text").text(format(cDate)).attr("fill", "black").style("font-size", "12px").attr("x", 0).attr("y", this.cellCount * template.cellHeight + 23).attr("width", template.backGridWidth - 10).attr("height", 50);
            this.sclaes.push(scaleGroup);
        };

        TrackBodyView.prototype.destroy = function () {
            if (this.sclaes) {
                while (this.sclaes.length > 0) {
                    var temp = this.sclaes.shift();
                    temp.remove();
                }
            }
            this.bodyboder.remove();
            this.bodysvg.remove();
        };
        return TrackBodyView;
    })();
    Realrig.TrackBodyView = TrackBodyView;
})(Realrig || (Realrig = {}));
//# sourceMappingURL=TrackBodyView.js.map
