/// <reference path="../../scripts/d3.d.ts"/>
/// <reference path="../../scripts/UUID.d.ts"/>
/// <reference path="../../vo/TemplateVO.ts"/>
var Realrig;
(function (Realrig) {
    var CurveHeadView = (function () {
        function CurveHeadView(g) {
            var self = this;
            this.uuid = UUID.generate();
            this.group = g;
            this.textName = this.group.append("text");
            this.textUnit = this.group.append("text");
            this.textLeft = this.group.append("text");
            this.textRight = this.group.append("text");
            this.lineMiddle = this.group.append("line");
        }
        CurveHeadView.prototype.setCurveData = function (curve, curveY, temmplateWidth) {
            this.group.datum(curve);
            var dy = curveY;
            curve.chuid = this.uuid;
            this.textName.text(curve.showname).attr("fill", curve.linecolor).style("font-size", curve.labelFontSize.toString() + "px");
            var tw;
            var th;
            this.textName.each(function () {
                var box = this.getBBox();
                tw = this.getBBox().width;
                th = this.getBBox().height;
            });
            this.textName.attr("x", (temmplateWidth - tw) * 0.5).attr("y", dy + th * 0.5);
            dy += th - 4;
            this.lineMiddle.attr("x1", 0).attr("y1", dy).attr("x2", temmplateWidth).attr("y2", dy).attr("stroke", curve.linecolor).attr("stroke-width", 2).attr("opacity");
            dy += 14;
            this.textLeft.text(curve.leftvalue).attr("fill", curve.linecolor).style("font-size", curve.labelFontSize.toString() + "px");
            this.textLeft.attr("x", 2).attr("y", dy);
            this.textRight.text(curve.rightvalue).attr("fill", curve.linecolor).style("font-size", curve.labelFontSize.toString() + "px");
            this.textRight.each(function () {
                tw = this.getBBox().width;
                th = this.getBBox().height;
            });
            this.textRight.attr("x", temmplateWidth - tw - 2).attr("y", dy);
            dy += th - 4;
            return dy;
        };

        CurveHeadView.prototype.destroy = function () {
            this.group.remove();
            this.lineMiddle.remove();
            this.textName.remove();
            this.textUnit.remove();
            this.textLeft.remove();
            this.textRight.remove();
            this.group.datum(null);
        };
        return CurveHeadView;
    })();
    Realrig.CurveHeadView = CurveHeadView;
})(Realrig || (Realrig = {}));
//# sourceMappingURL=CurveHeadView.js.map
