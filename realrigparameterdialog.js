/// <reference path="scripts/jquery.d.ts"/>
/// <reference path="realrigtemplate.ts"/>
var Realrig;
(function (Realrig) {
    var ParameterDialog = (function () {
        function ParameterDialog() {
            var self = this;
            $("#navbar-btn-edit-parameter").click(function () {
                $('#modal-parameter').modal({
                    remote: "view/dialog/editparameter.html"
                }).on("loaded.bs.modal", function (e) {
                    $('#modal-parameter').modal('show');
                    if (Realrig.template) {
                        var length = Realrig.template.digitParameterDives.length;
                        var data = [];
                        for (var i = 0; i < length; i++) {
                            var pdiv = Realrig.template.digitParameterDives[i];
                            var node = {};
                            node["uuid"] = pdiv.uuid;
                            node["track"] = true;
                            node["text"] = pdiv.getProperty().showName;
                            data.push(node);
                        }

                        //显示编辑channel
                        $('#treeview-parameter').treeview({
                            data: data,
                            levels: 1, showTags: true, color: "#428bca",
                            nodeIcon: ""
                        });
                        $('#treeview-parameter').on('nodeSelected', function (event, node) {
                            self.selectedNode = node;
                            if (jQuery.isEmptyObject(self.selectedNode)) {
                                self.hideEditParameter();
                            } else {
                                self.showEditParameter();
                            }
                        });
                        $("#edit-parameter-add").on("click", $.proxy(self.onAddClick, self));
                        $("#edit-parameter-remove").on("click", $.proxy(self.onRemoveClick, self));
                        $("#edit-parameter-up").on("click", $.proxy(self.onUpClick, self));
                        $("#edit-parameter-down").on("click", $.proxy(self.onDownClick, self));
                        $("#btn-parameter-save").on("click", $.proxy(self.saveParameter, self));
                        $("#btn-form-parameter-save").on("click", $.proxy(self.saveChange, self));
                    }
                }).on("hidden.bs.modal", function (e) {
                    $(this).removeData("bs.modal");
                    $('#modal-parameter').off("loaded.bs.modal");
                    $('#modal-parameter').off("hidden.bs.modal");
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
        ParameterDialog.prototype.hideEditParameter = function () {
            $("#edit-parameter-remove-li").attr("class", "disabled");
            $("#edit-parameter-up-li").attr("class", "disabled");
            $("#edit-parameter-down-li").attr("class", "disabled");
            $("#edit-parameter").hide();
        };

        ParameterDialog.prototype.showEditParameter = function () {
            $("#edit-parameter-remove-li").removeAttr("class");
            $("#edit-parameter-up-li").removeAttr("class");
            $("#edit-parameter-down-li").removeAttr("class");
            $("#edit-parameter").show();
            try  {
                $('#form-edit-parameter').data('bootstrapValidator').resetForm(true);
            } catch (error) {
                console.log(error);
            }
            ;
            var digitdiv = this.getDigitByUUID(this.selectedNode.uuid);
            if (digitdiv) {
                var digitProperty = digitdiv.getProperty();
                $("#edit-track-header").text("Edit " + digitProperty.showName);
                $("#select-parameter-name").empty();
                var selectname;
                var i;
                for (i = 0; i < Realrig.template.curveSelectList.length; i++) {
                    var curveSelect = Realrig.template.curveSelectList[i];
                    var jq = $("#select-parameter-name").append("<option value='" + curveSelect.showname + "'>" + curveSelect.linename + "</option>");
                    jq.data("curve", curveSelect);
                    if (digitProperty.lineName == curveSelect.linename) {
                        selectname = curveSelect.showname;
                    }
                }
                if (selectname != null) {
                    $("#select-parameter-name").val(selectname);
                }
                $("#select-parameter-name").on("change", $.proxy(this.onSelectParameterChange, this));
                $("#select-parameter-name").selectpicker('render');
                $("#input-parameter-displayname").val(digitProperty.showName);
                $("#input-parameter-unit").val(digitProperty.unit);

                $("#select-parameter-formula").on("change", function () {
                    var index = $("#select-parameter-formula").val();
                    if (index > 0) {
                        $("#div-parameter-formula").show();
                        $("#input-parameter-formulaA").val(digitProperty.formulaA.toString());
                        $("#input-parameter-formulaB").val(digitProperty.formulaB.toString());
                    } else {
                        $("#div-parameter-formula").hide();
                    }
                });
                $("#select-parameter-formula").val(digitProperty.formulaType);
                if ($("#select-parameter-formula").val() > 0) {
                    $("#div-parameter-formula").show();
                    $("#input-parameter-formulaA").val(digitProperty.formulaA.toString());
                    $("#input-parameter-formulaB").val(digitProperty.formulaB.toString());
                } else {
                    $("#div-parameter-formula").hide();
                }
                $("#select-parameter-formula").selectpicker('render');
                $("#input-parameter-precision").val(digitProperty.precision.toString());
            } else {
                $("#edit-parameter").show();
                $("#edit-track-header").text("New Parameter");
                $("#select-parameter-name").empty();
                for (var i = 0; i < Realrig.template.curveSelectList.length; i++) {
                    var curveSelect = Realrig.template.curveSelectList[i];
                    var jq = $("#select-parameter-name").append("<option value='" + curveSelect.showname + "'>" + curveSelect.linename + "</option>");
                    jq.data("curve", curveSelect);
                }
                curveSelect = Realrig.template.curveSelectList[0];
                $("#select-parameter-name").val(curveSelect.showname);
                $("#select-parameter-name").on("change", $.proxy(this.onSelectParameterChange, this));
                $("#select-parameter-name").selectpicker('render');
                $("#input-parameter-displayname").val(curveSelect.showname);
                $("#input-parameter-unit").val("");
                $("#select-parameter-formula").on("change", function () {
                    var index = $("#select-parameter-formula").val();
                    if (index > 0) {
                        $("#div-parameter-formula").show();
                    } else {
                        $("#div-parameter-formula").hide();
                    }
                });
                $("#input-parameter-formulaA").val("");
                $("#input-parameter-formulaB").val("");
                $("#select-parameter-formula").val(0);
                $("#div-parameter-formula").hide();
                $("#select-parameter-formula").selectpicker('render');
                $("#input-parameter-precision").val("");
            }
        };

        ParameterDialog.prototype.getDigitByUUID = function (uuid) {
            for (var i = 0; i < Realrig.template.digitParameterDives.length; i++) {
                var digit = Realrig.template.digitParameterDives[i];
                if (digit.uuid == uuid) {
                    return digit;
                }
            }
            return null;
        };

        /**
        *
        * 保存
        */
        ParameterDialog.prototype.saveParameter = function () {
            $('#form-edit-parameter').bootstrapValidator({
                message: 'This value is not valid',
                feedbackIcons: {
                    valid: 'glyphicon glyphicon-ok',
                    invalid: 'glyphicon glyphicon-remove',
                    validating: 'glyphicon glyphicon-refresh'
                },
                fields: {
                    select_parameter_name: {
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
                    input_parameter_precision: {
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
            });
            var formulaIndex = $("#select-parameter-formula").get(0).selectedIndex;
            if (formulaIndex > 0) {
                $('#form-edit-parameter').bootstrapValidator('addField', 'input_parameter_formulaA', {
                    validators: {
                        notEmpty: {
                            message: 'Formula A is required'
                        },
                        numeric: {
                            message: 'Formula A must be a number'
                        }
                    }
                });
                $('#form-edit-parameter').bootstrapValidator('addField', 'input_parameter_formulaB', {
                    validators: {
                        notEmpty: {
                            message: 'Formula B is required'
                        },
                        numeric: {
                            message: 'Formula B must be a number'
                        }
                    }
                });
            } else {
                $('#form-edit-parameter').bootstrapValidator('removeField', 'input_parameter_formulaA');
                $('#form-edit-parameter').bootstrapValidator('removeField', 'input_parameter_formulaB');
            }
            var bootstrapValidator = $('#form-edit-parameter').data('bootstrapValidator');
            bootstrapValidator.validate();
            var valid = bootstrapValidator.isValid();
            if (valid == false) {
                return;
            }
            var digitProperty;
            var curveindex = $("#select-parameter-name").get(0).selectedIndex;
            var curveSelect = Realrig.template.curveSelectList[curveindex];
            if (jQuery.isEmptyObject(this.selectedNode)) {
                digitProperty = new Realrig.DigitPropertyVO();
                digitProperty.lineName = curveSelect.linename;
                digitProperty.showName = $("#input-parameter-displayname").val();
                digitProperty.formulaType = formulaIndex;
                if (formulaIndex > 0) {
                    digitProperty.formulaA = $("#input-parameter-formulaA").val();
                    digitProperty.formulaB = $("#input-parameter-formulaB").val();
                }
                digitProperty.precision = $("#input-parameter-precision").val();
                var dv = new Realrig.DigitParameterDIV(digitProperty, Realrig.template.digitParameterDives.length);
                Realrig.template.digitParameterDives.push(dv);
                var treeView = $("#treeview-parameter").data("plugin_treeview");
                var nodes = treeView.tree;
                var node = {};
                node["uuid"] = dv.uuid;
                node["track"] = true;
                node["text"] = dv.getProperty().showName;
                nodes.push(node);
                $("#treeview-parameter").treeview({
                    data: nodes,
                    levels: 1, showTags: true, color: "#428bca",
                    nodeIcon: ""
                });
                $("#edit-parameter").hide();
                $('#form-edit-parameter').data('bootstrapValidator').resetForm(true);
            } else {
                var digitdiv = this.getDigitByUUID(this.selectedNode.uuid);
                digitProperty = digitdiv.getProperty();
                digitProperty.lineName = curveSelect.linename;
                digitProperty.showName = $("#input-parameter-displayname").val();
                digitProperty.formulaType = formulaIndex;
                if (formulaIndex > 0) {
                    digitProperty.formulaA = $("#input-parameter-formulaA").val();
                    digitProperty.formulaB = $("#input-parameter-formulaB").val();
                }
                digitProperty.precision = $("#input-parameter-precision").val();
                digitdiv.changeProperty(digitProperty);
            }
        };

        /**
        * 点击Add
        */
        ParameterDialog.prototype.onAddClick = function () {
            var treeView = $("#treeview-parameter").data("plugin_treeview");
            treeView._setSelectedNode(treeView.selectedNode);
            this.showEditParameter();
        };

        /**
        * 删除parameter
        */
        ParameterDialog.prototype.onRemoveClick = function () {
            var treeView = $("#treeview-parameter").data("plugin_treeview");
            var nodes = treeView.tree;
            var index = -1;
            for (var i = 0; i < nodes.length; i++) {
                if (nodes[i].uuid == this.selectedNode.uuid) {
                    index = i;
                    break;
                }
            }
            var temp = Realrig.template.digitParameterDives.splice(index, 1);
            var dp = temp[0];
            dp.destroy();
            nodes.splice(index, 1);
            $("#treeview-parameter").treeview({
                data: nodes,
                levels: 1, showTags: true, color: "#428bca",
                nodeIcon: ""
            });
        };

        /**
        * 上移位置
        */
        ParameterDialog.prototype.onUpClick = function () {
            var data = $("#treeview-parameter").data("plugin_treeview");
            var nodes = data.tree;
            var index = -1;
            for (var i = 0; i < nodes.length; i++) {
                if (nodes[i].uuid == this.selectedNode.uuid) {
                    index = i;
                    break;
                }
            }
            if (index >= 1 && nodes.length >= 2) {
                var preNode = nodes[index - 1];
                nodes[index - 1] = this.selectedNode;
                nodes[index] = preNode;
                var predp = Realrig.template.digitParameterDives[index - 1];
                var ndp = Realrig.template.digitParameterDives[index];
                Realrig.template.digitParameterDives[index - 1] = ndp;
                Realrig.template.digitParameterDives[index] = predp;
                $("#treeview-parameter").treeview({
                    data: nodes,
                    levels: 1, showTags: true, color: "#428bca",
                    nodeIcon: ""
                });
                $("#treeview-parameter").treeview("setSelectedIndex", this.selectedNode.uuid);
            }
        };

        /**
        * 下移位置
        */
        ParameterDialog.prototype.onDownClick = function () {
            var treeView = $("#treeview-parameter").data("plugin_treeview");
            var nodes = treeView.tree;
            var index = -1;
            for (var i = 0; i < nodes.length; i++) {
                if (nodes[i].uuid == this.selectedNode.uuid) {
                    index = i;
                    break;
                }
            }
            if (index >= 0 && index < (nodes.length - 1) && nodes.length >= 2) {
                var preNode = nodes[index + 1];
                nodes[index + 1] = this.selectedNode;
                nodes[index] = preNode;
                var predp = Realrig.template.digitParameterDives[index + 1];
                var ndp = Realrig.template.digitParameterDives[index];
                Realrig.template.digitParameterDives[index + 1] = ndp;
                Realrig.template.digitParameterDives[index] = predp;
                $("#treeview-parameter").treeview({
                    data: nodes,
                    levels: 1, showTags: true, color: "#428bca",
                    nodeIcon: ""
                });
                $("#treeview-parameter").treeview("setSelectedIndex", this.selectedNode.uuid);
            }
        };

        ParameterDialog.prototype.onSelectParameterChange = function () {
            var item = $("#select-parameter-name").val();
            $("#input-parameter-displayname").val(item);
        };

        ParameterDialog.prototype.saveChange = function () {
            Realrig.template.refreshParameter();
            $('#modal-parameter').modal('hide');
        };
        return ParameterDialog;
    })();
    Realrig.ParameterDialog = ParameterDialog;
})(Realrig || (Realrig = {}));
//# sourceMappingURL=realrigparameterdialog.js.map
