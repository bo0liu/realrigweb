/// <reference path="../../scripts/d3.d.ts"/>
/// <reference path="../../scripts/jquery.d.ts"/>
/// <reference path="../../scripts/UUID.d.ts"/>
/// <reference path="../../vo/TemplateVO.ts"/>
var Realrig;
(function (Realrig) {
    var DigitParameterDIV = (function () {
        function DigitParameterDIV(dp, index) {
            this.template = {
                container: '<div class="digitdiv"></div>',
                dprop: '<label class="digitproplabel" id="proplabel">Name</label>',
                dvalue: '<label class="digitvaluelabel" id="valuelabel">0</label>'
            };
            this.uuid = UUID.generate();
            this.digitProperty = dp;

            var divclone = $(this.template.container);
            divclone.append(this.template.dprop);
            divclone.append(this.template.dvalue);
            divclone.find(".digitproplabel").text(this.digitProperty.showName);
            var px = 2 + (index % 2) * 172;
            var py = 5 + Math.floor(index / 2) * 63;
            divclone.css("left", px.toString() + "px").css("top", py.toString() + "px");
            divclone.appendTo("#digitContainer");
            this.pdiv = divclone;
        }
        DigitParameterDIV.prototype.getProperty = function () {
            return this.digitProperty;
        };

        DigitParameterDIV.prototype.changeProperty = function (newProperty) {
            this.digitProperty = newProperty;
            this.pdiv.find(".digitproplabel").text(this.digitProperty.showName);
        };

        DigitParameterDIV.prototype.changeIndex = function (index) {
            var px = 2 + (index % 2) * 167;
            var py = 5 + Math.floor(index / 2) * 63;
            this.pdiv.css("left", px.toString() + "px").css("top", py.toString() + "px");
        };

        DigitParameterDIV.prototype.destroy = function () {
            this.pdiv.remove();
            this.digitProperty = null;
        };
        return DigitParameterDIV;
    })();
    Realrig.DigitParameterDIV = DigitParameterDIV;
})(Realrig || (Realrig = {}));
//# sourceMappingURL=DigitParameterDIV.js.map
