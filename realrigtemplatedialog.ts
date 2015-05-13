/// <reference path="scripts/jquery.d.ts"/>
/// <reference path="realrigtemplate.ts"/>
module Realrig {
    export class TemplateDialog {
        private selectedNode:any;
        private editCurveUUID:string;
        private colors:string[] = ["#ff0000", "#000000", "#00ff00", "#0000ff", "#ff8000",
            "#800000", "#ff00ff", "#800080", "#DBB5AC", "#7BBCCC"];

        constructor() {
            var self = this;
            //显示diallog
            $("#navbar-btn-edit-template").click(function () {
                (<any>$('#modal-template')).modal({
                    remote: "view/dialog/edittemplate.html"
                }).on("loaded.bs.modal", function (e) {
                    (<any>$('#modal-template')).modal('show');
                    if (template) {
                        var length:number = template.templateContainerVO.tracks.length;
                        var data = [];
                        for (var i:number = 0; i < length; i++) {
                            var trackProperty:Realrig.TrackPropertyVO = template.templateContainerVO.tracks[i];
                            var node = {};
                            node["uuid"] = trackProperty.uuid;
                            node["track"] = true;
                            node["Extendible"] = false;
                            if (trackProperty.templateTitle == null || trackProperty.templateTitle == "") {
                                node["text"] = "Track " + i.toString();
                            }
                            else {
                                node["text"] = trackProperty.templateTitle;
                            }
                            if (trackProperty.type == "timeTrack" || trackProperty.type == "depthTrack") {
                                node["icon"] = "glyphicon glyphicon-lock";
                            }
                            else {
                                node["icon"] = "glyphicon glyphicon-list-alt";
                            }
                            if (trackProperty.curves != null && trackProperty.curves.length > 0) {
                                node["nodes"] = [];
                                for (var j:number = 0; j < trackProperty.curves.length; j++) {
                                    var curveNode:any = {};
                                    curveNode["text"] = trackProperty.curves[j].showname;
                                    curveNode["uuid"] = trackProperty.curves[j].uuid;
                                    curveNode["icon"] = "glyphicon glyphicon-bookmark";
                                    curveNode["Extendible"] = false;
                                    node["nodes"].push(curveNode);
                                }
                                node["tags"] = [trackProperty.curves.length];
                            }
                            data.push(node);
                        }
                        //显示编辑channel
                        (<any>$('#treeview-track')).treeview({data: data,
                            levels: 0, showTags: true, color: "#428bca",
                            expandIcon: 'glyphicon glyphicon-chevron-right',
                            collapseIcon: 'glyphicon glyphicon-chevron-down'});
                        $('#treeview-track').on('nodeSelected', $.proxy(self.onNodeSelected, self));
                        $("#btn-track-save").on("click", $.proxy(self.onTrackSave, self));
                        $("#edit-track-add").on("click", $.proxy(self.onEditTrackClick, self));
                        $("#edit-track-remove").on("click", $.proxy(self.onDeleteTrackClick, self));
                        $("#edit-curve-add").on("click", $.proxy(self.onAddCurveClick, self));
                        $("#edit-curve-remove").on("click", $.proxy(self.onRemoveCurveClick, self));
                        $("#btn-curve-save").on("click", $.proxy(self.onCurveSave, self));
                        $("#btn-form-track-save").on("click",$.proxy(self.onSaveTrackChange,self));
                    }
                }).on("hidden.bs.modal", function () {
                    $(this).removeData("bs.modal");
                    $('#treeview-track').off('nodeSelected');
                    $("#btn-track-save").off("click");
                    $("#edit-track-add").off("click");
                    $("#edit-track-remove").off("click");
                    $("#edit-curve-add").off("click");
                    $("#edit-curve-remove").off("click");
                    $("#btn-curve-save").off("click");
                    $("#btn-form-track-save").off("click");
                });
            });
        }

        private onNodeSelected(event, node):void {
            this.selectedNode = node;
            if (jQuery.isEmptyObject(this.selectedNode)) {
                $("#edit-track").hide();
                $("#edit-curve").hide();
            }
            else {
                if (node.hasOwnProperty("track") && node["track"] == true) {
                    this.showEditTrack(node);
                }//编辑track结束
                else {
                    this.showEditCurve(node);
                }
            }
        }

        /**
         * 显示新建track
         * @param event
         */
        private onEditTrackClick(event):void {
            var tree:any = $("#treeview-track").data("plugin_treeview");
            $("#edit-track").show();
            $("#edit-curve").hide();
            $("#edit-track-remove-li").removeAttr("class");
            $("#edit-curve-add-li").removeAttr("class");
            $("#edit-curve-remove-li").attr("class", "disabled");
            (<any>$("#input-track-linecolor")).minicolors({
                control: $(this).attr('data-control') || 'hue',
                defaultValue: $(this).attr('data-defaultValue') || '',
                inline: $(this).attr('data-inline') === 'true',
                letterCase: $(this).attr('data-letterCase') || 'lowercase',
                opacity: $(this).attr('data-opacity'),
                position: $(this).attr('data-position') || 'bottom left',
                change: function (hex, opacity) {
                    if (!hex) return;
                    if (opacity) hex += ', ' + opacity;
                },
                theme: 'bootstrap'
            });
            (<any>$("#input-track-framecolor")).minicolors({
                control: $(this).attr('data-control') || 'hue',
                defaultValue: $(this).attr('data-defaultValue') || '',
                inline: $(this).attr('data-inline') === 'true',
                letterCase: $(this).attr('data-letterCase') || 'lowercase',
                opacity: $(this).attr('data-opacity'),
                position: $(this).attr('data-position') || 'bottom left',
                change: function (hex, opacity) {
                    if (!hex) return;
                    if (opacity) hex += ', ' + opacity;
                },
                theme: 'bootstrap'
            });

            $("#edit-track-header").text("New Track");
            $("#input-track-title").val("");
            (<any>$("#input-track-linecolor")).minicolors("value", "#cccccc");
            $("#input-track-linewidth").attr("value", 1);
            (<any>$("#input-track-framecolor")).minicolors("value", "#000000");
            $("#input-track-framewidth").attr("value", 2);
            (<any>$("input[name='input-track-linewidth']")).TouchSpin({
                verticalbuttons: true,
                min: 0.5,
                max: 10,
                step: 0.5,
                decimals: 1,
                postfix: 'px'
            });
            (<any>$("input[name='input-track-framewidth']")).TouchSpin({
                verticalbuttons: true,
                min: 0.5,
                max: 10,
                step: 0.5,
                decimals: 1,
                postfix: 'px'
            });
            $("input[type='radio'][name='radio_track_type'][value=0]").attr("checked", "checked");
            $(".radio_tracktype").on("change", $.proxy(this.onTrackTypeChange, this));
            $("#div-min").hide();
            $("#div-max").hide();
        }

        /**
         * 删除track
         * @param event
         */
        private onDeleteTrackClick(event):void {
            var treeView:any = $("#treeview-track").data("plugin_treeview");
            var nodes:any[] = treeView.tree;
            var index:number = -1;
            for (var i:number = 0; i < nodes.length; i++) {
                if (nodes[i].uuid == this.selectedNode.uuid) {
                    index = i;
                    break;
                }
            }
            this.selectedNode = {};
            var temp:any[] = template.templateContainerVO.tracks.splice(index, 1);
            var tp:Realrig.TrackPropertyVO = temp[0];
            nodes.splice(index, 1);
            (<any>$("#treeview-track")).treeview("remove");
            (<any>$('#treeview-track')).treeview({data: nodes,
                levels: 0, showTags: true, color: "#428bca",
                expandIcon: 'glyphicon glyphicon-chevron-right',
                collapseIcon: 'glyphicon glyphicon-chevron-down'});
            (<any>$('#treeview-track')).on('nodeSelected', $.proxy(this.onNodeSelected, this));
            $("#edit-track").hide();
            $("#edit-curve").hide();
        }

        /**
         * 显示编辑track
         * @param node
         */
        private showEditTrack(node:any):void {
            var tree:any = $("#treeview-track").data("plugin_treeview");
            $("#edit-track").show();
            $("#edit-curve").hide();
            $("#edit-track-remove-li").removeAttr("class");
            $("#edit-curve-add-li").removeAttr("class");
            $("#edit-curve-remove-li").attr("class", "disabled");
            var uuid:string = node.uuid;
            var track:TrackPropertyVO = this.getTrackByUUID(uuid);
            (<any>$("#input-track-linecolor")).minicolors({
                control: $(this).attr('data-control') || 'hue',
                defaultValue: $(this).attr('data-defaultValue') || '',
                inline: $(this).attr('data-inline') === 'true',
                letterCase: $(this).attr('data-letterCase') || 'lowercase',
                opacity: $(this).attr('data-opacity'),
                position: $(this).attr('data-position') || 'bottom left',
                change: function (hex, opacity) {
                    if (!hex) return;
                    if (opacity) hex += ', ' + opacity;
                },
                theme: 'bootstrap'
            });
            (<any>$("#input-track-framecolor")).minicolors({
                control: $(this).attr('data-control') || 'hue',
                defaultValue: $(this).attr('data-defaultValue') || '',
                inline: $(this).attr('data-inline') === 'true',
                letterCase: $(this).attr('data-letterCase') || 'lowercase',
                opacity: $(this).attr('data-opacity'),
                position: $(this).attr('data-position') || 'bottom left',
                change: function (hex, opacity) {
                    if (!hex) return;
                    if (opacity) hex += ', ' + opacity;
                },
                theme: 'bootstrap'
            });
            if (track) {//设置各种属性的至
                $("#edit-track-header").text("Edit " + node.text);
                $("#input-track-title").val(node.text);
                (<any>$("#input-track-linecolor")).minicolors("value", track.backGridColor);
                $("#input-track-linewidth").attr("value", track.backGridThick);
                (<any>$("#input-track-framecolor")).minicolors("value", track.backGridBorderColor);
                $("#input-track-framewidth").attr("value", track.backGridBorderThick);
                (<any>$("input[name='input-track-linewidth']")).TouchSpin({
                    verticalbuttons: true,
                    min: 0.5,
                    max: 10,
                    step: 0.5,
                    decimals: 1,
                    postfix: 'px'
                });
                (<any>$("input[name='input-track-framewidth']")).TouchSpin({
                    verticalbuttons: true,
                    min: 0.5,
                    max: 10,
                    step: 0.5,
                    decimals: 1,
                    postfix: 'px'
                });
                var typevalue:number = track.isLogLine == true ? 1 : 0;
                $("input[type='radio'][name='radio_track_type'][value=" + typevalue.toString() + "]").attr("checked", "checked");
                $(".radio_tracktype").on("change", $.proxy(this.onTrackTypeChange, this));
                if (true == track.isLogLine) {
                    $("#div-min").show();
                    $("#div-max").show();
                }
                else {
                    $("#div-min").hide();
                    $("#div-max").hide();
                }
            }
        }

        private onTrackTypeChange(event):void {
            var tracktype:number = $("input[name=radio_track_type]:checked").val();
            if (tracktype > 0) {
                $("#div-min").show();
                $("#div-max").show();
            }
            else {
                $("#div-min").hide();
                $("#div-max").hide();
            }
        }

        /**
         * 获取track
         * @param uuid
         * @returns {*}
         */
        public getTrackByUUID(uuid:string):Realrig.TrackPropertyVO {
            for (var i:number = 0; i < Realrig.template.templateContainerVO.tracks.length; i++) {
                var track:TrackPropertyVO = Realrig.template.templateContainerVO.tracks[i];
                if (track.uuid == uuid) {
                    return track;
                }
            }
            return null;
        }

        private getTrackByChildUID(uuid:string):Realrig.TrackPropertyVO {
            for (var i:number = 0; i < Realrig.template.templateContainerVO.tracks.length; i++) {
                var track:TrackPropertyVO = Realrig.template.templateContainerVO.tracks[i];
                if (track.curves && track.curves.length > 0) {
                    for (var j:number = 0; j < track.curves.length; j++) {
                        var curve:Realrig.CurvePropertyVO = track.curves[j];
                        if (curve.uuid == uuid) {
                            return track;
                        }
                    }
                }
            }
            return null;
        }

        /**
         * 显示添加curve
         * @param event
         */
        private onAddCurveClick(event):void {
            this.editCurveUUID = null;
            $("#edit-track").hide();
            $("#edit-curve").show();
            var track:Realrig.TrackPropertyVO;
            if (!jQuery.isEmptyObject(this.selectedNode)) {
                if (this.selectedNode.hasOwnProperty("track") && this.selectedNode["track"] == true) {
                    track = this.getTrackByUUID(this.selectedNode["uuid"]);
                }
                else {
                    track = this.getTrackByChildUID(this.selectedNode["uuid"]);
                }
            }
            (<any>$("#input-curve-linecolor")).minicolors({
                control: $(this).attr('data-control') || 'hue',
                defaultValue: $(this).attr('data-defaultValue') || '',
                inline: $(this).attr('data-inline') === 'true',
                letterCase: $(this).attr('data-letterCase') || 'lowercase',
                opacity: $(this).attr('data-opacity'),
                position: $(this).attr('data-position') || 'bottom left',
                change: function (hex, opacity) {
                    if (!hex) return;
                    if (opacity) hex += ', ' + opacity;
                },
                theme: 'bootstrap'
            });
            $("#edit-curve-header").text("New Curve");
            $("#select-curve-name").empty();
            var selectname:string;
            var i:number;
            for (i = 0; i < template.curveSelectList.length; i++) {
                var curveSelect:CurveSelect = template.curveSelectList[i];
                $("#select-curve-name").append("<option value='" + curveSelect.showname + "'>" + curveSelect.linename + "</option>");
            }
            curveSelect = template.curveSelectList[0];
            (<any>$("#select-curve-name")).val(curveSelect.showname);
            (<any>$("#input-curve-displayname")).val(curveSelect.showname);
            $("#select-curve-name").on("change", $.proxy(this.onCurveSelected, this));
            (<any>$("#select-curve-name")).selectpicker('render');
            (<any>$("#select-curve-name")).prop('disabled', false);
            (<any>$("#select-curve-name")).selectpicker('refresh');
            $("#input-curve-unit").val("");
            (<any>$("#select-curve-formula")).change(function () {
                var index:number = $("#select-curve-formula").val();
                if (index > 0) {
                    $("#div-formula").show();
                }
                else {
                    $("#div-formula").hide();
                }
            });
            (<any>$("#select-curve-formula")).val(0);
            if ($("#select-curve-formula").val() > 0) {
                $("#div-formula").show();
            }
            else {
                $("#div-formula").hide();
            }
            (<any>$("#select-curve-formula")).selectpicker('render');
            $("#input-curve-precision").val("3");
            $("input[type='radio'][name='radio-linetype'][value=0]").attr("checked", "checked");
            $("#input-curve-leftvalue").val("");
            $("#input-curve-rightvalue").val("");
            var color:string = "#ffffff";
            if (track.curves.length < this.colors.length) {
                color = this.colors[track.curves.length];
            }
            (<any>$("#input-curve-linecolor")).minicolors("value", color);
            $("#input-curve-linewidth").attr("value", 1);
            (<any>$("input[name='input-curve-linewidth']")).TouchSpin({
                verticalbuttons: true,
                min: 0.5,
                max: 10,
                step: 0.5,
                decimals: 1,
                postfix: 'px'
            });
            (<any>$("#check-penup")).prop("checked", false);
            (<any>$("#input-intercept")).attr("disabled", true);
            $("#check-penup").on("click", function () {
                if ((<any>$("#check-penup")).prop("checked")) {
                    (<any>$("#input-intercept")).attr("disabled", false);
                }
                else {
                    (<any>$("#input-intercept")).attr("disabled", true);
                }
            });
            $("#input-curve-fontsize").val("12");
            (<any>$("input[name='input-curve-fontsize']")).TouchSpin({
                verticalbuttons: true,
                min: 8,
                max: 20,
                step: 1,
                decimals: 0
            });
            $("input[type='radio'][name='radio-showdensity'][value=false]").attr("checked", "checked");
        }

        /**
         * 删除curve
         * @param event
         */
        private onRemoveCurveClick(event):void {
            var treeView:any = $("#treeview-track").data("plugin_treeview");
            var nodes:any[] = treeView.tree;
            var i:number;
            var curve:Realrig.CurvePropertyVO = this.getCurveByUUID(this.selectedNode.uuid);
            var track:Realrig.TrackPropertyVO = this.getTrackByChildUID(this.selectedNode.uuid);
            var index:number;
            for(i=0;i<track.curves.length;i++){
                var temp:Realrig.CurvePropertyVO = track.curves[i];
                if(temp.uuid == curve.uuid){
                    track.curves.splice(i,1);
                    break;
                }
            }
            var trackNode:any;
            for(i = 0;i<nodes.length;i++){
                var node:any = nodes[i];
                if(node["uuid"] == track.uuid){
                    trackNode = node;
                }
                if(node.hasOwnProperty("nodes")){
                    node["_nodes"] = node["nodes"];
                    delete node["nodes"];
                }
                else if(node.hasOwnProperty("_nodes")){
                    node["nodes"] = node["_nodes"];
                    delete node["_nodes"];
                }
            }
            var trackNodeChildren:any[] = trackNode.nodes ?trackNode.nodes : trackNode._nodes;
            for(i=0;i<trackNodeChildren.length;i++){
                var trackNodeChild:any = trackNodeChildren[i];
                if(trackNodeChild.uuid == this.selectedNode.uuid){
                    trackNodeChildren.splice(i,1);
                    break;
                }
            }
            (<any>$("#treeview-track")).treeview({data: nodes,
                levels: 0, showTags: true, color: "#428bca",
                expandIcon: 'glyphicon glyphicon-chevron-right',
                collapseIcon: 'glyphicon glyphicon-chevron-down'});
            this.selectedNode = null;
            $("#edit-track").hide();
            $("#edit-curve").hide();
        }

        /**
         * 显示编辑curve
         * @param node
         */
        private showEditCurve(node:any):void {
            $("#edit-track").hide();
            $("#edit-curve").show();
            $("#edit-track-remove-li").removeAttr("class");
            $("#edit-curve-add-li").removeAttr("class");
            $("#edit-curve-remove-li").removeAttr("class");
            var curve:CurvePropertyVO = this.getCurveByUUID(node.uuid);
            (<any>$("#input-curve-linecolor")).minicolors({
                control: $(this).attr('data-control') || 'hue',
                defaultValue: $(this).attr('data-defaultValue') || '',
                inline: $(this).attr('data-inline') === 'true',
                letterCase: $(this).attr('data-letterCase') || 'lowercase',
                opacity: $(this).attr('data-opacity'),
                position: $(this).attr('data-position') || 'bottom left',
                change: function (hex, opacity) {
                    if (!hex) return;
                    if (opacity) hex += ', ' + opacity;
                },
                theme: 'bootstrap'
            });
            if (curve) {
                this.editCurveUUID = curve.uuid;
                $("#edit-curve-header").text("Edit " + curve.showname);
                $("#select-curve-name").empty();
                var selectname:string;
                var i:number;
                for (i = 0; i < template.curveSelectList.length; i++) {
                    var curveSelect:CurveSelect = template.curveSelectList[i];
                    $("#select-curve-name").append("<option value='" + curveSelect.showname + "'>" + curveSelect.linename + "</option>");
                    if (curve.linename == curveSelect.linename) {
                        selectname = curve.showname;
                    }
                }
                if (selectname != null) {
                    (<any>$("#select-curve-name")).val(selectname);
                }
                $("#select-curve-name").on("change", $.proxy(this.onCurveSelected, this));
                (<any>$("#select-curve-name")).selectpicker('render');
                (<any>$("#select-curve-name")).prop('disabled', true);
                (<any>$("#select-curve-name")).selectpicker('refresh');
                $("#input-curve-displayname").val(curve.showname);
                if (curve.unit != null && curve.unit != "") {
                    $("#input-curve-unit").val(curve.unit);
                }
                (<any>$("#select-curve-formula")).change(function () {
                    var index:number = $("#select-curve-formula").val();
                    if (index > 0) {
                        $("#div-formula").show();
                        $("#input-curve-formulaA").val(curve.formulaA.toString());
                        $("#input-curve-formulaB").val(curve.formulaB.toString());
                    }
                    else {
                        $("#div-formula").hide();
                    }
                });
                (<any>$("#select-curve-formula")).val(curve.formulaType);
                if ($("#select-curve-formula").val() > 0) {
                    $("#div-formula").show();
                    $("#input-curve-formulaA").val(curve.formulaA.toString());
                    $("#input-curve-formulaB").val(curve.formulaB.toString());
                }
                else {
                    $("#div-formula").hide();
                }
                (<any>$("#select-curve-formula")).selectpicker('render');
                $("#input-curve-precision").val(curve.precision.toString());
                $("input[type='radio'][name='radio-linetype'][value=" + curve.linetype + "]").attr("checked", "checked");
                $("#input-curve-leftvalue").val(curve.leftvalue.toString());
                $("#input-curve-rightvalue").val(curve.rightvalue.toString());
                (<any>$("#input-curve-linecolor")).minicolors("value", curve.linecolor);
                $("#input-curve-linewidth").attr("value", curve.lineThick);
                (<any>$("input[name='input-curve-linewidth']")).TouchSpin({
                    verticalbuttons: true,
                    min: 0.5,
                    max: 10,
                    step: 0.5,
                    decimals: 1,
                    postfix: 'px'
                });
                (<any>$("#check-penup")).prop("checked", curve.isIntercept);
                if (curve.isIntercept) {
                    (<any>$("#input-intercept")).attr("disabled", false);
                    if (!isNaN(curve.intercept)) {
                        $("#input-intercept").val(curve.intercept.toString());
                    }
                }
                else {
                    (<any>$("#input-intercept")).attr("disabled", true);
                }
                $("#check-penup").on("click", function () {
                    if ((<any>$("#check-penup")).prop("checked")) {
                        (<any>$("#input-intercept")).attr("disabled", false);
                        if (!isNaN(curve.intercept)) {
                            $("#input-intercept").val(curve.intercept.toString());
                        }
                    }
                    else {
                        (<any>$("#input-intercept")).attr("disabled", true);
                    }
                });
                $("#input-curve-fontsize").val(curve.labelFontSize.toString());
                (<any>$("input[name='input-curve-fontsize']")).TouchSpin({
                    verticalbuttons: true,
                    min: 8,
                    max: 20,
                    step: 1,
                    decimals: 0
                });
                $("input[type='radio'][name='radio-showdensity'][value=" + curve.drawDensity + "]").attr("checked", "checked");
            }//结束if
        }

        private onCurveSave():void {
            (<any>$('#form-edit-curve')).bootstrapValidator({
                message: 'This value is not valid',
                feedbackIcons: {
                    valid: 'glyphicon glyphicon-ok',
                    invalid: 'glyphicon glyphicon-remove',
                    validating: 'glyphicon glyphicon-refresh'
                },
                fields: {
                    select_curve_name: {
                        validators: {
                            notEmpty: {
                                message: 'Curve Name is required and cannot be empty'
                            }
                        }
                    },
                    input_curve_displayname: {
                        validators: {
                            notEmpty: {
                                message: 'Display Name is required and cannot be empty'
                            }
                        }
                    },
                    select_curve_formula: {
                        validators: {
                            notEmpty: {
                                message: 'Calculator is required and cannot be empty'
                            }
                        }
                    },
                    input_curve_precision: {
                        validators: {
                            notEmpty: {
                                message: 'Precision is required and cannot be empty'
                            },
                            integer: {
                                message: 'The value is not an integer'
                            }
                        }
                    },
                    input_curve_leftvalue: {
                        validators: {
                            notEmpty: {
                                message: 'Left Value is required and cannot be empty'
                            },
                            numeric: {
                                message: 'Left Value B must be a number'
                            }
                        }
                    },
                    input_curve_rightvalue: {
                        validators: {
                            notEmpty: {
                                message: 'Right Value is required and cannot be empty'
                            },
                            numeric: {
                                message: 'Right Value must be a number'
                            }
                        }
                    },
                    input_curve_linecolor: {
                        validators: {
                            notEmpty: {
                                message: 'Line Color is required and cannot be empty'
                            },
                            hexColor: {
                                message: 'The color code is not valid'
                            }
                        }
                    },
                    input_curve_linewidth: {
                        validators: {
                            notEmpty: {
                                message: 'Line Width is required and cannot be empty'
                            },
                            numeric: {
                                message: 'Line Width must be a number'
                            },
                            between: {
                                min: 0.5,
                                max: 10,
                                message: 'Line Width must be between 0.5 and 10'
                            }
                        }
                    },
                    input_curve_fontsize: {
                        validators: {
                            notEmpty: {
                                message: 'Font Size is required and cannot be empty'
                            },
                            numeric: {
                                message: 'Font Size must be a number'
                            },
                            between: {
                                min: 8,
                                max: 20,
                                message: 'Font Size must be between 8 and 20'
                            }
                        }
                    },
                    radio_showdensity: {
                        validators: {
                            notEmpty: {
                                message: 'Show Data Density is required and cannot be empty'
                            }
                        }
                    }
                }
            });

            var formulaIndex = (<any>$("#select-curve-formula").get(0)).selectedIndex;
            if (formulaIndex > 0) {
                (<any>$('#form-edit-curve')).bootstrapValidator('addField', 'input_curve_formulaA', {
                    validators: {
                        notEmpty: {
                            message: 'Formula A is required'
                        },
                        numeric: {
                            message: 'Formula A must be a number'
                        }
                    }
                });
                (<any>$('#form-edit-curve')).bootstrapValidator('addField', 'input_curve_formulaB', {
                    validators: {
                        notEmpty: {
                            message: 'Formula B is required'
                        },
                        numeric: {
                            message: 'Formula B must be a number'
                        }
                    }
                });
            }
            else {
                (<any>$('#form-edit-curve')).bootstrapValidator('removeField', 'input_curve_formulaA');
                (<any>$('#form-edit-curve')).bootstrapValidator('removeField', 'input_curve_formulaB');
            }

            var penupable:boolean = (<any>$("#check-penup")).prop("checked");
            if (penupable) {
                (<any>$('#form-edit-curve')).bootstrapValidator('addField', 'input_curve_intercept', {
                    validators: {
                        notEmpty: {
                            message: 'Gap is required'
                        },
                        numeric: {
                            message: 'Gap must be a number'
                        }
                    }
                });
            }
            else {
                (<any>$('#form-edit-curve')).bootstrapValidator('removeField', 'input_curve_intercept');
            }

            var bootstrapValidator:any = $('#form-edit-curve').data('bootstrapValidator');
            bootstrapValidator.validate();
            var valid:boolean = bootstrapValidator.isValid();
            if (valid == false) {
                return;
            }

            var track:Realrig.TrackPropertyVO;
            var curve:Realrig.CurvePropertyVO;
            if (!jQuery.isEmptyObject(this.selectedNode)) {
                if (this.selectedNode.hasOwnProperty("track") && this.selectedNode["track"] == true) {
                    track = this.getTrackByUUID(this.selectedNode["uuid"]);
                }
                else {
                    track = this.getTrackByChildUID(this.selectedNode["uuid"]);
                }
            }
            if (jQuery.isEmptyObject(track)) {
                return;
            }
            var curveindex:number = (<any>$("#select-curve-name").get(0)).selectedIndex;
            var curveSelect:CurveSelect = template.curveSelectList[curveindex];
            if (jQuery.isEmptyObject(this.editCurveUUID) == true)//新建curve
            {
                curve = new Realrig.CurvePropertyVO();
            }
            else {
                curve = this.getCurveByUUID(this.selectedNode["uuid"]);
            }
            curve.linename = curveSelect.linename;
            curve.showname = $("#input-curve-displayname").val();
            var unit:string = $("#input-curve-unit").val();
            if (jQuery.isEmptyObject(unit) == false) {
                curve.unit = unit;
            }
            else {
                curve.unit = "";
            }
            curve.formulaType = formulaIndex;
            if (curve.formulaType > 0) {
                curve.formulaA = <number><any>$("#input-curve-formulaA").val();
                curve.formulaB = <number><any>$("#input-curve-formulaB").val();
            }
            else {
                curve.formulaA = 0;
                curve.formulaB = 0;
            }
            curve.precision = <number><any>$("#input-curve-precision").val();
            ''
            curve.linetype = $("input[name=radio-linetype]:checked").val();
            curve.leftvalue = <number><any>$("#input-curve-leftvalue").val();
            curve.rightvalue = <number><any>$("#input-curve-rightvalue").val();
            curve.linecolor = $("#input-curve-linecolor").val();
            curve.labelFontSize = <number><any>$("#input-curve-fontsize").val();
            curve.lineThick = <number><any>$("#input-curve-linewidth").val();
            var dd:string = $("input[name=radio_showdensity]:checked").val();
            curve.drawDensity = dd == "true" ? true : false;
            curve.isIntercept = penupable;
            if (curve.isIntercept) {
                curve.intercept = <number><any>$("#input-curve-intercept").val();
            }
            else {
                curve.intercept = 0;
            }
            if (jQuery.isEmptyObject(this.editCurveUUID) == true)//新建curve
            {
                track.curves.push(curve);
                var treeView:any = $("#treeview-track").data("plugin_treeview");
                var nodes:any[] = treeView.nodes;
                var node = {};
                node["uuid"] = curve.uuid;
                node["track"] = false;
                node["text"] = curve.showname;
                node["icon"] = "glyphicon glyphicon-bookmark";
                node["Extendible"] = false;
                for (var i:number = 0; i < nodes.length; i++) {
                    var tracknode:any = nodes[i];
                    if(tracknode.hasOwnProperty("_nodes"))
                    {
                        tracknode["nodes"] = tracknode["_nodes"];
                        delete  tracknode["_nodes"];
                    }
                    if (tracknode["uuid"] == track["uuid"]) {
                        tracknode["nodes"].push(node);
                    }
                }
                (<any>$('#treeview-track')).treeview('remove');
                (<any>$('#treeview-track')).treeview({data: nodes,
                    levels: 0, showTags: true, color: "#428bca",
                    expandIcon: 'glyphicon glyphicon-chevron-right',
                    collapseIcon: 'glyphicon glyphicon-chevron-down'});
                (<any>$('#treeview-track')).on('nodeSelected', $.proxy(this.onNodeSelected, this));
                this.editCurveUUID = node["uuid"];
                $("#edit-track").hide();
                $("#edit-curve").hide();
            }
            $("#form-edit-curve").data('bootstrapValidator').resetForm();
        }

        /**
         * 获取curve
         * @param trackUid
         * @param uuid
         * @returns {*}
         */
        public getCurveByUUID(uuid:string):Realrig.CurvePropertyVO {
            for (var i:number = 0; i < Realrig.template.templateContainerVO.tracks.length; i++) {
                var track:TrackPropertyVO = Realrig.template.templateContainerVO.tracks[i];
                for (var j:number = 0; j < track.curves.length; j++) {
                    var curve:CurvePropertyVO = track.curves[j];
                    if (curve.uuid == uuid) {
                        return curve;
                    }
                }
            }
            return null;
        }

        private onCurveSelected():void {
            var item:string = (<any>$("#select-curve-name")).val();
            $("#input-curve-displayname").val(item);
        }

        /**
         *
         */
        private onTrackSave(event):void {
            (<any>$('#form-edit-track')).bootstrapValidator({
                message: 'This value is not valid',
                feedbackIcons: {
                    valid: 'glyphicon glyphicon-ok',
                    invalid: 'glyphicon glyphicon-remove',
                    validating: 'glyphicon glyphicon-refresh'
                },
                fields: {
                    input_track_title: {
                        validators: {
                            notEmpty: {
                                message: 'Title is required and cannot be empty'
                            }
                        }
                    },
                    input_track_linewidth: {
                        validators: {
                            notEmpty: {
                                message: 'Line Width is required and cannot be empty'
                            },
                            integer: {
                                message: 'The value is not an integer'
                            }
                        }
                    },
                    input_track_framewidth: {
                        validators: {
                            notEmpty: {
                                message: 'Frame Width is required and cannot be empty'
                            },
                            integer: {
                                message: 'The value is not an integer'
                            }
                        }
                    },
                    input_track_linecolor: {
                        validators: {
                            notEmpty: {
                                message: 'Color is required and cannot be empty'
                            },
                            hexcolor: {
                                message: 'Please Select a Color or input like #000000'
                            }
                        }
                    },
                    input_track_framecolor: {
                        validators: {
                            notEmpty: {
                                message: 'Frame Width is required and cannot be empty'
                            },
                            hexcolor: {
                                message: 'Please Select a Color or input like #000000'
                            }
                        }
                    }
                }
            })
            var tracktype:number = $("input[name=radio_track_type]:checked").val();
            if (tracktype > 0) {
                (<any>$('#form-edit-track')).bootstrapValidator('addField', 'input_track_min', {
                    validators: {
                        notEmpty: {
                            message: 'Min. is required'
                        },
                        numeric: {
                            message: 'Min. must be a number'
                        }
                    }
                });
                (<any>$('#form-edit-track')).bootstrapValidator('addField', 'input_track_max', {
                    validators: {
                        notEmpty: {
                            message: 'Max. is required'
                        },
                        numeric: {
                            message: 'Max. must be a number'
                        }
                    }
                });
            }
            else {
                (<any>$('#form-edit-track')).bootstrapValidator('removeField', 'input_track_min');
                (<any>$('#form-edit-track')).bootstrapValidator('removeField', 'input_track_max');
            }
            var bootstrapValidator:any = $('#form-edit-track').data('bootstrapValidator');
            bootstrapValidator.validate();
            var valid:boolean = bootstrapValidator.isValid();
            if (valid == false) {
                return;
            }
            var track:Realrig.TrackPropertyVO;
            if (jQuery.isEmptyObject(this.selectedNode)) {
                track = new Realrig.TrackPropertyVO();
                template.templateContainerVO.tracks.push(track);
            }
            else {
                track = this.getTrackByUUID(this.selectedNode.uuid);
            }
            track.isLogLine = tracktype > 0 ? true : false;
            track.templateTitle = $("#input-track-title").val();
            track.backGridThick = <number><any>$("#input-track-linewidth").val();
            track.backGridColor = $("#input-track-linecolor").val();
            track.backGridBorderThick = <number><any>$("#input-track-framewidth").val();
            track.backGridColor = $("#input-track-framecolor").val();
            if (tracktype > 0) {
                track.startRange = <number><any>$("#input-track-min").val();
                track.endRange = <number><any>$("#input-track-max").val();
                track.type = "curveLogTrack";
            }
            else {
                track.type = "curveTrack";
            }
            if (jQuery.isEmptyObject(this.selectedNode)) {
                var treeView:any = $("#treeview-track").data("plugin_treeview");
                var nodes:any[] = treeView.nodes;
                var node = {};
                node["uuid"] = track.uuid;
                node["track"] = true;
                if (track.templateTitle == null || track.templateTitle == "") {
                    node["text"] = "Track " + nodes.length.toString();
                }
                else {
                    node["text"] = track.templateTitle;
                }
                if (track.type == "timeTrack" || track.type == "depthTrack") {
                    node["icon"] = "glyphicon glyphicon-lock";
                }
                else {
                    node["icon"] = "glyphicon glyphicon-list-alt";
                }
                node["Extendible"] = false;
                node["nodes"] = [];
                node["tags"] = [0];
                nodes.push(node);
                (<any>$('#treeview-track')).treeview('remove');
                (<any>$('#treeview-track')).treeview({data: nodes,
                    levels: 0, showTags: true, color: "#428bca",
                    expandIcon: 'glyphicon glyphicon-chevron-right',
                    collapseIcon: 'glyphicon glyphicon-chevron-down'});
                (<any>$('#treeview-track')).on('nodeSelected', $.proxy(this.onNodeSelected, this));
                $("#edit-track").hide();
                $("#edit-curve").hide();
            }
            $("#form-edit-track").data('bootstrapValidator').resetForm();
        }

        private onSaveTrackChange():void{
            template.refreshTrack();
            (<any>$('#modal-template')).modal('hide');
        }
    }
}