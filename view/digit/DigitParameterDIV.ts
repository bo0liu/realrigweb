/// <reference path="../../scripts/d3.d.ts"/>
/// <reference path="../../scripts/jquery.d.ts"/>
/// <reference path="../../scripts/UUID.d.ts"/>
/// <reference path="../../vo/TemplateVO.ts"/>
module Realrig
{
    export class DigitParameterDIV implements IDestroy
    {
        private template:any =
        {
            container: '<div class="digitdiv"></div>',
            dprop: '<label class="digitproplabel" id="proplabel">Name</label>',
            dvalue: '<label class="digitvaluelabel" id="valuelabel">0</label>'
        };

        uuid:string;
        private digitProperty:Realrig.DigitPropertyVO;
        private pdiv:JQuery;
        constructor(dp:Realrig.DigitPropertyVO,index:number)
        {
            this.uuid = UUID.generate();
            this.digitProperty = dp;

            var divclone:JQuery = $(this.template.container);
            divclone.append(this.template.dprop);
            divclone.append(this.template.dvalue);
            divclone.find(".digitproplabel").text(this.digitProperty.showName);
            var px:number = 2 + (index%2)*172;
            var py:number = 5 + Math.floor(index/2)*63;
            divclone.css("left",px.toString()+"px").css("top",py.toString()+"px");
            divclone.appendTo("#digitContainer");
            this.pdiv = divclone;
        }

        public getProperty():Realrig.DigitPropertyVO
        {
            return this.digitProperty;
        }

        public changeProperty(newProperty:Realrig.DigitPropertyVO):void
        {
            this.digitProperty = newProperty;
            this.pdiv.find(".digitproplabel").text(this.digitProperty.showName);
        }

        public changeIndex(index:number):void
        {
            var px:number = 2 + (index%2)*167;
            var py:number = 5 + Math.floor(index/2)*63;
            this.pdiv.css("left",px.toString()+"px").css("top",py.toString()+"px");
        }

        public destroy():void
        {
            this.pdiv.remove();
            this.digitProperty = null;
        }

    }

}