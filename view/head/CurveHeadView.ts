/// <reference path="../../scripts/d3.d.ts"/>
/// <reference path="../../scripts/UUID.d.ts"/>
/// <reference path="../../vo/TemplateVO.ts"/>

module Realrig {
    export class CurveHeadView implements IDestroy
    {

        private group:D3.Selection;//整个的组
        private lineMiddle:D3.Selection;//中线
        private textName:D3.Selection;//曲线名
        private textUnit:D3.Selection;//单位
        private textLeft:D3.Selection;//左边的值
        private textRight:D3.Selection;//右边的值
        uuid:string;

        constructor(g:D3.Selection) {
            var self = this;
            this.uuid = UUID.generate();
            this.group = g;
            this.textName = this.group.append("text");
            this.textUnit = this.group.append("text");
            this.textLeft = this.group.append("text");
            this.textRight = this.group.append("text");
            this.lineMiddle = this.group.append("line");
        }

        setCurveData(curve:CurvePropertyVO, curveY:number, temmplateWidth:number):number {
            this.group.datum(curve);
            var dy:number = curveY;
            curve.chuid = this.uuid;
            this.textName.text(curve.showname).attr("fill", curve.linecolor).style("font-size", curve.labelFontSize.toString() + "px");
            var tw:number;
            var th:number;
            this.textName.each(function () {
                var box:any = this.getBBox();
                tw = this.getBBox().width;
                th = this.getBBox().height;
            });
            this.textName.attr("x", (temmplateWidth - tw) * 0.5).attr("y", dy + th * 0.5);
            dy += th - 4;
            this.lineMiddle.attr("x1", 0).attr("y1", dy)
                .attr("x2", temmplateWidth).attr("y2", dy)
                .attr("stroke", curve.linecolor).attr("stroke-width", 2).attr("opacity");
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
        }

        public destroy():void
        {
            this.group.remove();
            this.lineMiddle.remove();
            this.textName.remove();
            this.textUnit.remove();
            this.textLeft.remove();
            this.textRight.remove();
            this.group.datum(null);
        }
    }
}