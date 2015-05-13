/// <reference path="../scripts/UUID.d.ts"/>
var Realrig;
(function (Realrig) {
    var DigitPropertyVO = (function () {
        function DigitPropertyVO() {
            this.precision = 3;
            this.uuid = UUID.generate();
        }
        return DigitPropertyVO;
    })();
    Realrig.DigitPropertyVO = DigitPropertyVO;

    var CurvePropertyVO = (function () {
        function CurvePropertyVO() {
            this.precision = 3;
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
        return CurvePropertyVO;
    })();
    Realrig.CurvePropertyVO = CurvePropertyVO;

    var TrackPropertyVO = (function () {
        function TrackPropertyVO() {
            this.curves = [];
            this.backGridColor = "#000000";
            this.backGridBorderColor = "#000000";
            this.backGridThick = 1;
            this.uuid = UUID.generate();
        }
        return TrackPropertyVO;
    })();
    Realrig.TrackPropertyVO = TrackPropertyVO;

    var TemplateContainerVO = (function () {
        function TemplateContainerVO() {
            this.tracks = [];
            this.initContainerWidth = 380;
            this.initContainerHeight = 730;
            this.templateWidth = 730;
            this.templateHeight = 380;
            this.cellHeight = 180;
            this.cellConvertHeight = 50;
        }
        return TemplateContainerVO;
    })();
    Realrig.TemplateContainerVO = TemplateContainerVO;

    var CurveSelect = (function () {
        function CurveSelect() {
        }
        return CurveSelect;
    })();
    Realrig.CurveSelect = CurveSelect;

    var Point = (function () {
        function Point(x, y) {
            if (typeof x === "undefined") { x = 0; }
            if (typeof y === "undefined") { y = 0; }
            this.x = x;
            this.y = y;
        }
        Point.prototype.clone = function () {
            return new Realrig.Point(this.x, this.y);
        };

        Point.prototype.toString = function () {
            return this.x + "," + this.y;
        };
        return Point;
    })();
    Realrig.Point = Point;
})(Realrig || (Realrig = {}));
//# sourceMappingURL=TemplateVO.js.map
