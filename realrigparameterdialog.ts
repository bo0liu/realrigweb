/// <reference path="scripts/jquery.d.ts"/>
/// <reference path="realrigtemplate.ts"/>

module Realrig
{
    export class ParameterDialog
    {
        private selectedNode:any;
        constructor()
        {
            var self = this;
            $("#navbar-btn-edit-parameter").click(function () {
                (<any>$('#modal-parameter')).modal({
                    remote: "view/dialog/editparameter.html"
                }).on("loaded.bs.modal", function (e) {
                    (<any>$('#modal-parameter')).modal('show');
                    if (template) {
                        var length:number = template.digitParameterDives.length;
                        var data = [];
                        for (var i:number = 0; i < length; i++) {
                            var pdiv:Realrig.DigitParameterDIV = template.digitParameterDives[i];
                            var node = {};
                            node["uuid"] = pdiv.uuid;
                            node["track"] = true;
                            node["text"] = pdiv.getProperty().showName;
                            data.push(node);
                        }
                        //显示编辑channel
                        (<any>$('#treeview-parameter')).treeview({data: data,
                            levels: 1, showTags: true,color: "#428bca",
                            nodeIcon:""
                        });
                        $('#treeview-parameter').on('nodeSelected', function (event, node) {
                            self.selectedNode = node;
                            if(jQuery.isEmptyObject(self.selectedNode)){//判断是否为空
                                self.hideEditParameter();
                            }
                            else{
                                self.showEditParameter();

                            }
                        });
                        $("#edit-parameter-add").on("click",$.proxy(self.onAddClick,self));
                        $("#edit-parameter-remove").on("click",$.proxy(self.onRemoveClick,self));
                        $("#edit-parameter-up").on("click",$.proxy(self.onUpClick,self));
                        $("#edit-parameter-down").on("click",$.proxy(self.onDownClick,self));
                        $("#btn-parameter-save").on("click",$.proxy(self.saveParameter,self));
                        $("#btn-form-parameter-save").on("click",$.proxy(self.saveChange,self));
                    }
                }).on("hidden.bs.modal",function (e){
                    $(this).removeData("bs.modal");
                    (<any>$('#modal-parameter')).off("loaded.bs.modal");
                    (<any>$('#modal-parameter')).off("hidden.bs.modal");
                    $("#edit-parameter-add").off("click");
                    $("#edit-parameter-remove").off("click");
                    $("#edit-parameter-up").off("click");
                    $("#edit-parameter-down").off("click");
                    $("#btn-parameter-save").off("click");
                    $('#treeview-parameter').off("nodeSelected");
                    $("#select-parameter-formula").off("change");
                    $("#btn-form-save").off("click");
                });
            });
        }

        private hideEditParameter():void
        {
            $("#edit-parameter-remove-li").attr("class","disabled");
            $("#edit-parameter-up-li").attr("class","disabled");
            $("#edit-parameter-down-li").attr("class","disabled");
            $("#edit-parameter").hide();
        }

        private showEditParameter():void
        {
            $("#edit-parameter-remove-li").removeAttr("class");
            $("#edit-parameter-up-li").removeAttr("class");
            $("#edit-parameter-down-li").removeAttr("class");
            $("#edit-parameter").show();
            try{
                $('#form-edit-parameter').data('bootstrapValidator').resetForm(true);
            }
            catch(error){
              console.log(error);
            };
            var digitdiv:DigitParameterDIV = this.getDigitByUUID(this.selectedNode.uuid);
            if(digitdiv) {
                var digitProperty:Realrig.DigitPropertyVO = digitdiv.getProperty();
                $("#edit-track-header").text("Edit " + digitProperty.showName);
                $("#select-parameter-name").empty();
                var selectname:string;
                var i:number;
                for (i = 0; i < template.curveSelectList.length; i++) {
                    var curveSelect:CurveSelect = template.curveSelectList[i];
                    var jq:JQuery = $("#select-parameter-name").append("<option value='" + curveSelect.showname + "'>" + curveSelect.linename + "</option>");
                    jq.data("curve",curveSelect);
                    if (digitProperty.lineName == curveSelect.linename) {
                        selectname = curveSelect.showname;
                    }
                }
                if (selectname != null) {
                    (<any>$("#select-parameter-name")).val(selectname);
                }
                $("#select-parameter-name").on("change",$.proxy(this.onSelectParameterChange,this));
                (<any>$("#select-parameter-name")).selectpicker('render');
                $("#input-parameter-displayname").val(digitProperty.showName);
                $("#input-parameter-unit").val(digitProperty.unit);

                (<any>$("#select-parameter-formula")).on("change",function(){
                    var index:number = $("#select-parameter-formula").val();
                    if(index > 0){
                        $("#div-parameter-formula").show();
                        $("#input-parameter-formulaA").val(digitProperty.formulaA.toString());
                        $("#input-parameter-formulaB").val(digitProperty.formulaB.toString());
                    }
                    else{
                        $("#div-parameter-formula").hide();
                    }
                });
                (<any>$("#select-parameter-formula")).val(digitProperty.formulaType);
                if($("#select-parameter-formula").val() > 0){
                    $("#div-parameter-formula").show();
                    $("#input-parameter-formulaA").val(digitProperty.formulaA.toString());
                    $("#input-parameter-formulaB").val(digitProperty.formulaB.toString());
                }
                else{
                    $("#div-parameter-formula").hide();
                }
                (<any>$("#select-parameter-formula")).selectpicker('render');
                $("#input-parameter-precision").val(digitProperty.precision.toString());
            }//结束if
            else{
                $("#edit-parameter").show();
                $("#edit-track-header").text("New Parameter");
                $("#select-parameter-name").empty();
                for (var i:number = 0; i < template.curveSelectList.length; i++) {
                    var curveSelect:CurveSelect = template.curveSelectList[i];
                    var jq:JQuery = $("#select-parameter-name").append("<option value='" + curveSelect.showname + "'>" + curveSelect.linename + "</option>");
                    jq.data("curve",curveSelect);
                }
                curveSelect = template.curveSelectList[0];
                (<any>$("#select-parameter-name")).val(curveSelect.showname);
                $("#select-parameter-name").on("change",$.proxy(this.onSelectParameterChange,this));
                (<any>$("#select-parameter-name")).selectpicker('render');
                $("#input-parameter-displayname").val(curveSelect.showname);
                $("#input-parameter-unit").val("");
                (<any>$("#select-parameter-formula")).on("change",function(){
                    var index:number = $("#select-parameter-formula").val();
                    if(index > 0){
                        $("#div-parameter-formula").show();
                    }
                    else{
                        $("#div-parameter-formula").hide();
                    }
                });
                $("#input-parameter-formulaA").val("");
                $("#input-parameter-formulaB").val("");
                (<any>$("#select-parameter-formula")).val(0);
                $("#div-parameter-formula").hide();
                (<any>$("#select-parameter-formula")).selectpicker('render');
                $("#input-parameter-precision").val("");
            }
        }

        public getDigitByUUID(uuid:string):Realrig.DigitParameterDIV {
            for (var i:number = 0; i < Realrig.template.digitParameterDives.length; i++) {
                var digit:Realrig.DigitParameterDIV = Realrig.template.digitParameterDives[i];
                if(digit.uuid == uuid){
                    return digit;
                }
            }
            return null;
        }

        /**
         *
         * 保存
         */
        private saveParameter():void
        {
            (<any>$('#form-edit-parameter')).bootstrapValidator({
                message: 'This value is not valid',
                feedbackIcons: {
                    valid: 'glyphicon glyphicon-ok',
                    invalid: 'glyphicon glyphicon-remove',
                    validating: 'glyphicon glyphicon-refresh'
                },
                fields: {
                    select_parameter_name:
                    {
                        validators: {
                            notEmpty: {
                                message: 'Curve Name is required and cannot be empty'
                            }
                        }
                    },
                    input_parameter_displayname: {
                        validators: {
                            notEmpty: {
                                message: 'Display Name is required and cannot be empty'
                            }
                        }
                    },
                    input_parameter_precision:
                    {
                        validators: {
                            notEmpty: {
                                message: 'Precision is required and cannot be empty'
                            },
                            integer: {
                                message: 'The value is not an integer'
                            }
                        }
                    }
                }
            })
            var formulaIndex = (<any>$("#select-parameter-formula").get(0)).selectedIndex;
            if(formulaIndex > 0){
                (<any>$('#form-edit-parameter')).bootstrapValidator('addField', 'input_parameter_formulaA', {
                    validators: {
                        notEmpty: {
                            message: 'Formula A is required'
                        },
                        numeric:{
                            message: 'Formula A must be a number'
                        }
                    }
                });
                (<any>$('#form-edit-parameter')).bootstrapValidator('addField', 'input_parameter_formulaB', {
                    validators: {
                        notEmpty: {
                            message: 'Formula B is required'
                        },
                        numeric:{
                            message: 'Formula B must be a number'
                        }
                    }
                });
            }
            else{
                (<any>$('#form-edit-parameter')).bootstrapValidator('removeField', 'input_parameter_formulaA');
                (<any>$('#form-edit-parameter')).bootstrapValidator('removeField', 'input_parameter_formulaB');
            }
            var bootstrapValidator:any = $('#form-edit-parameter').data('bootstrapValidator');
            bootstrapValidator.validate();
            var valid:boolean = bootstrapValidator.isValid();
            if(valid == false){
                return;
            }
            var digitProperty:Realrig.DigitPropertyVO;
            var curveindex:number = (<any>$("#select-parameter-name").get(0)).selectedIndex;
            var curveSelect:CurveSelect = template.curveSelectList[curveindex];
            if(jQuery.isEmptyObject(this.selectedNode)) {//判断是否为空
                digitProperty = new Realrig.DigitPropertyVO();
                digitProperty.lineName = curveSelect.linename;
                digitProperty.showName = $("#input-parameter-displayname").val();
                digitProperty.formulaType = formulaIndex;
                if(formulaIndex > 0){
                    digitProperty.formulaA = <number><any>$("#input-parameter-formulaA").val();
                    digitProperty.formulaB = <number><any>$("#input-parameter-formulaB").val();
                }
                digitProperty.precision = <number><any>$("#input-parameter-precision").val();
                var dv:Realrig.DigitParameterDIV = new Realrig.DigitParameterDIV(digitProperty,template.digitParameterDives.length);
                template.digitParameterDives.push(dv);
                var treeView:any = $("#treeview-parameter").data("plugin_treeview");
                var nodes:any[] = treeView.tree;
                var node = {};
                node["uuid"] = dv.uuid;
                node["track"] = true;
                node["text"] = dv.getProperty().showName;
                nodes.push(node);
                (<any>$("#treeview-parameter")).treeview({data: nodes,
                    levels: 1, showTags: true,color: "#428bca",
                    nodeIcon:""
                });
                $("#edit-parameter").hide();
                $('#form-edit-parameter').data('bootstrapValidator').resetForm(true);
            }
            else{
                var digitdiv:DigitParameterDIV = this.getDigitByUUID(this.selectedNode.uuid);
                digitProperty = digitdiv.getProperty();
                digitProperty.lineName = curveSelect.linename;
                digitProperty.showName = $("#input-parameter-displayname").val();
                digitProperty.formulaType = formulaIndex;
                if(formulaIndex > 0){
                    digitProperty.formulaA = <number><any>$("#input-parameter-formulaA").val();
                    digitProperty.formulaB = <number><any>$("#input-parameter-formulaB").val();
                }
                digitProperty.precision = <number><any>$("#input-parameter-precision").val();
                digitdiv.changeProperty(digitProperty);
            }
        }

        /**
         * 点击Add
         */
        private onAddClick():void
        {
            var treeView:any = $("#treeview-parameter").data("plugin_treeview");
            treeView._setSelectedNode(treeView.selectedNode);
            this.showEditParameter();
        }

        /**
         * 删除parameter
         */
        private onRemoveClick():void
        {
            var treeView:any = $("#treeview-parameter").data("plugin_treeview");
            var nodes:any[] = treeView.tree;
            var index:number = -1;
            for(var i:number = 0;i<nodes.length;i++){
                if(nodes[i].uuid == this.selectedNode.uuid){
                    index = i;
                    break;
                }
            }
            var temp:any[] = template.digitParameterDives.splice(index,1);
            var dp:DigitParameterDIV = temp[0];
            dp.destroy();
            nodes.splice(index,1);
            (<any>$("#treeview-parameter")).treeview({data: nodes,
                levels: 1, showTags: true,color: "#428bca",
                nodeIcon:""
            });
        }

        /**
         * 上移位置
         */
        private onUpClick():void
        {
            var data:any = $("#treeview-parameter").data("plugin_treeview");
            var nodes:any[] = data.tree;
            var index:number = -1;
            for(var i:number = 0;i<nodes.length;i++){
                if(nodes[i].uuid == this.selectedNode.uuid){
                    index = i;
                    break;
                }
            }
            if(index >= 1 && nodes.length >= 2){
                var preNode:any = nodes[index-1];
                nodes[index-1] = this.selectedNode;
                nodes[index] = preNode;
                var predp:DigitParameterDIV = template.digitParameterDives[index-1];
                var ndp:DigitParameterDIV = template.digitParameterDives[index];
                template.digitParameterDives[index-1] = ndp;
                template.digitParameterDives[index] = predp;
                (<any>$("#treeview-parameter")).treeview({data: nodes,
                    levels: 1, showTags: true,color: "#428bca",
                    nodeIcon:""
                });
                (<any>$("#treeview-parameter")).treeview("setSelectedIndex",this.selectedNode.uuid);
            }
        }

        /**
         * 下移位置
         */
        private onDownClick():void
        {
            var treeView:any = $("#treeview-parameter").data("plugin_treeview");
            var nodes:any[] = treeView.tree;
            var index:number = -1;
            for(var i:number = 0;i<nodes.length;i++){
                if(nodes[i].uuid == this.selectedNode.uuid){
                    index = i;
                    break;
                }
            }
            if(index >= 0 && index < (nodes.length-1) && nodes.length >= 2){
                var preNode:any = nodes[index+1];
                nodes[index+1] = this.selectedNode;
                nodes[index] = preNode;
                var predp:DigitParameterDIV = template.digitParameterDives[index+1];
                var ndp:DigitParameterDIV = template.digitParameterDives[index];
                template.digitParameterDives[index+1] = ndp;
                template.digitParameterDives[index] = predp;
                (<any>$("#treeview-parameter")).treeview({data: nodes,
                    levels: 1, showTags: true,color: "#428bca",
                    nodeIcon:""
                });
                (<any>$("#treeview-parameter")).treeview("setSelectedIndex",this.selectedNode.uuid);
            }
        }

        private onSelectParameterChange():void
        {
            var item:string = (<any>$("#select-parameter-name")).val();
            $("#input-parameter-displayname").val(item);
        }

        private saveChange():void
        {
            template.refreshParameter();
            (<any>$('#modal-parameter')).modal('hide');
        }
    }
}