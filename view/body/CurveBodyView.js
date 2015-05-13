/// <reference path="../../scripts/d3.d.ts"/>
/// <reference path="../../scripts/jquery.d.ts"/>
/// <reference path="../../vo/TemplateVO.ts"/>
var Realrig;
(function (Realrig) {
    var CurveBodyView = (function () {
        function CurveBodyView(d3group, lineUUID, densityPos, densityStart) {
            this.pointLength = 0;
            this.group = d3group;
            this.uuid = lineUUID;
            this.densityStart = densityStart;
            this.densityPos = densityPos;
        }
        /**
        *
        * @param points 点的集合
        * @param lineType 画线的类型，
        */
        CurveBodyView.prototype.drawLine = function (points, lineType, drawDensity, isIntercept, intercept, lineColor, lineThick) {
            if (jQuery.isEmptyObject(this.lastline) || this.pointLength >= 500) {
                var line = this.group.append("path");
                this.lastline = line;
                this.pointLength = 0;
            }
            var start = 0;
            while (true) {
                var length = Math.min(500 - this.pointLength, points.length);
                var parts = points.slice(start, start + length);
                this.drawPartPoints(this.lastline, this.lastPoint, parts, lineType, drawDensity, isIntercept, intercept, lineColor, lineThick);
                this.lastPoint = parts[parts.length - 1];
                this.pointLength = this.pointLength + length;
                start = start + length;
                if (start >= points.length) {
                    break;
                } else {
                    if (this.pointLength >= 500) {
                        this.lastline = this.group.append("path");
                        this.pointLength = 0;
                    }
                }
            }
        };

        CurveBodyView.prototype.drawPartPoints = function (line, lastPoint, points, lineType, drawDensity, isIntercept, intercept, lineColor, lineThick) {
            var length = points.length;
            var pathStr = line.attr("d");
            for (var i = 0; i < length; i++) {
                var point = points[i];

                //density刻度线
                if (drawDensity) {
                    var line = this.group.append("line");

                    line.attr("x1", this.densityStart).attr("x2", this.densityStart + 5 * this.densityPos).attr("y1", point.y).attr("y2", point.y).attr("stroke", lineColor).attr("stroke-width", lineThick).attr("fill", "none");
                }

                if (i == 0) {
                    if (jQuery.isEmptyObject(lastPoint)) {
                        pathStr += "M";
                    } else {
                        if ((point.y - lastPoint.y) > intercept) {
                            pathStr += "M";
                        } else {
                            pathStr += "L";
                        }
                    }
                } else {
                    if ((point.y - lastPoint.y) > intercept) {
                        pathStr += "M";
                    } else {
                        pathStr += "L";
                    }
                }
                pathStr += " ";
                pathStr += point.toString();
                pathStr += " ";
                lastPoint = point;
            }
            this.lastline.attr("d", pathStr).attr("stroke", lineColor).attr("stroke-width", lineThick).attr("fill", "none");
        };

        CurveBodyView.prototype.destroy = function () {
        };
        return CurveBodyView;
    })();
    Realrig.CurveBodyView = CurveBodyView;
})(Realrig || (Realrig = {}));
//# sourceMappingURL=CurveBodyView.js.map
