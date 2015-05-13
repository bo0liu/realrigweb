/// <reference path="../vo/TemplateVO.ts"/>
var Realrig;
(function (Realrig) {
    var ModelLocator = (function () {
        function ModelLocator() {
            if (ModelLocator._instance) {
                throw "ModelLocator Error";
            }
            ModelLocator._instance = this;
            this.digites = new Array();
        }
        ModelLocator.getInstance = function () {
            return ModelLocator._instance;
        };
        ModelLocator._instance = null;
        return ModelLocator;
    })();
    Realrig.ModelLocator = ModelLocator;
})(Realrig || (Realrig = {}));
//# sourceMappingURL=model.js.map
