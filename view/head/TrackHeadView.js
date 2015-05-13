/// <reference path="../../scripts/d3.d.ts"/>
/// <reference path="../../scripts/UUID.d.ts"/>
/// <reference path="CurveHeadView.ts"/>
/// <reference path="../../vo/TemplateVO.ts"/>
var Realrig;
(function (Realrig) {
    var TrackHeadView = (function () {
        function TrackHeadView() {
            this.uuid = UUID.generate();
            this.curveHeaders = [];
            this.headsvg = d3.select("#templateHead").append("svg");
        }
        /**
        * 设置曲线头
        * @param value
        * @returns {number}
        */
        TrackHeadView.prototype.setTrackData = function (value) {
            var self = this;
            this.headsvg.datum(value);
            value.thuid = this.uuid;
            this.headsvg.attr("x", value.startX).attr("y", 0);
            if (this.headboder == null) {
                this.headboder = this.headsvg.append("path");
            }

            //组织数据
            if (value.curves != null && value.curves.length > 0) {
                var cy = 25;
                value.curves.forEach(function (element) {
                    var curveHead = new Realrig.CurveHeadView(self.headsvg.append("g"));
                    cy = curveHead.setCurveData(element, cy, value.backGridWidth);
                }); //循环结束
            }
            return cy;
        };

        TrackHeadView.prototype.setTrackWidthAndHeight = function (dx, dy, color, boderWidth) {
            var data = [];
            data.push([0, 0], [0, dy], [dx, dy], [dx, 0], [0, 0]);
            var lineFunction;
            lineFunction = d3.svg.line().x(function (d) {
                return d[0];
            }).y(function (d) {
                return d[1];
            });
            this.headboder.attr("d", lineFunction(data)).attr("stroke", color).attr("stroke-width", boderWidth).attr("fill", "none");
            this.headsvg.attr("width", dx).attr("height", dy);
        };

        TrackHeadView.prototype.destroy = function () {
            if (this.curveHeaders) {
                for (var i = 0; i < this.curveHeaders.length; i++) {
                    var curveheader = this.curveHeaders[i];
                    curveheader.destroy();
                }
                this.curveHeaders.splice(0, this.curveHeaders.length);
            }
            this.headboder.remove();
            this.headsvg.remove();
            this.headsvg.datum(null);
        };
        return TrackHeadView;
    })();
    Realrig.TrackHeadView = TrackHeadView;
})(Realrig || (Realrig = {}));
//# sourceMappingURL=TrackHeadView.js.map
