/// <reference path="../../scripts/d3.d.ts"/>
/// <reference path="../../scripts/UUID.d.ts"/>
/// <reference path="CurveHeadView.ts"/>
/// <reference path="../../vo/TemplateVO.ts"/>
module Realrig {
    export class TrackHeadView implements IDestroy
    {
        private headsvg:D3.Selection;//整体绘制的svg
        private headboder:D3.Selection;//边框
        private curveHeaders:Realrig.CurveHeadView[];
        uuid:string;

        constructor() {
            this.uuid = UUID.generate();
            this.curveHeaders = [];
            this.headsvg = d3.select("#templateHead").append("svg");
        }

        /**
         * 设置曲线头
         * @param value
         * @returns {number}
         */
        public setTrackData(value:TrackPropertyVO):number {
            var self = this;
            this.headsvg.datum(value);
            value.thuid = this.uuid;
            this.headsvg.attr("x", value.startX).attr("y", 0);
            if (this.headboder == null) {
                this.headboder = this.headsvg.append("path");
            }
            //组织数据
            if (value.curves != null && value.curves.length > 0) {
                var cy:number = 25;
                value.curves.forEach(function (element:CurvePropertyVO) {
                    var curveHead:CurveHeadView = new CurveHeadView(self.headsvg.append("g"));
                    cy = curveHead.setCurveData(element, cy, value.backGridWidth);
                });//循环结束
            }
            return cy;
        }

        public setTrackWidthAndHeight(dx:number, dy:number, color:string, boderWidth:number):void {
            var data:any[] = [];
            data.push([0, 0], [0, dy], [dx, dy], [dx, 0], [0, 0]);
            var lineFunction;
            lineFunction = d3.svg.line()
                .x(function (d) {
                    return d[0];
                })
                .y(function (d) {
                    return d[1];
                });
            this.headboder.attr("d", lineFunction(data))
                .attr("stroke", color)
                .attr("stroke-width", boderWidth)
                .attr("fill", "none");
            this.headsvg.attr("width", dx)
                .attr("height", dy);
        }

        public destroy():void
        {
            if(this.curveHeaders){
                for(var i:number=0;i<this.curveHeaders.length;i++){
                    var curveheader:Realrig.CurveHeadView = this.curveHeaders[i];
                    curveheader.destroy();
                }
                this.curveHeaders.splice(0,this.curveHeaders.length);
            }
            this.headboder.remove();
            this.headsvg.remove();
            this.headsvg.datum(null);
        }
    }
}