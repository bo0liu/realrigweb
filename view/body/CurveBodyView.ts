/// <reference path="../../scripts/d3.d.ts"/>
/// <reference path="../../scripts/jquery.d.ts"/>
/// <reference path="../../vo/TemplateVO.ts"/>
module Realrig
{
    export class CurveBodyView implements IDestroy
    {
        private group:D3.Selection;
        private densityPos:number;
        private densityStart:number;
        public uuid:string;

        public lastline:D3.Selection;
        public pointLength:number = 0;
        public lastPoint:Realrig.Point;

        constructor(d3group:D3.Selection,lineUUID:string,densityPos:number,densityStart:number)
        {
            this.group = d3group;
            this.uuid = lineUUID;
            this.densityStart = densityStart;
            this.densityPos = densityPos;
        }

        /**
         *
         * @param points 点的集合
         * @param lineType 画线的类型，
         */
        public drawLine(points:Point[],lineType:string,drawDensity:boolean,isIntercept:boolean,intercept:number,lineColor:string,lineThick:number):void
        {

            if(jQuery.isEmptyObject(this.lastline) || this.pointLength >= 500)
            {
                var line:D3.Selection = this.group.append("path");
                this.lastline = line;
                this.pointLength = 0;
            }
            var start:number = 0;
            while(true)
            {
                var length:number = Math.min(500-this.pointLength,points.length);
                var parts:Point[] = points.slice(start,start+length);
                this.drawPartPoints(this.lastline,this.lastPoint,parts,lineType,drawDensity,isIntercept,intercept,lineColor,lineThick);
                this.lastPoint = parts[parts.length-1];
                this.pointLength = this.pointLength + length;
                start = start+length;
                if(start >= points.length) // 所有的数据画完break
                {
                    break;
                }
                else //是否新建line
                {
                    if(this.pointLength >= 500)
                    {
                        this.lastline = this.group.append("path");
                        this.pointLength = 0;
                    }
                }
            }
        }

        private drawPartPoints(line:D3.Selection,lastPoint:Point,points:Point[],lineType:string,drawDensity:boolean,isIntercept:boolean,intercept:number,lineColor:string,lineThick:number):void
        {
            var length:number = points.length;
            var pathStr:string = line.attr("d");
            for(var i:number = 0;i<length;i++)
            {
                var point:Point = points[i];
                //density刻度线
                if(drawDensity)
                {
                    var line:D3.Selection = this.group.append("line");

                    line.attr("x1",this.densityStart).attr("x2",this.densityStart+5*this.densityPos)
                        .attr("y1",point.y).attr("y2",point.y)
                        .attr("stroke", lineColor)
                        .attr("stroke-width", lineThick)
                        .attr("fill", "none");
                }

                if(i == 0)
                {
                    if(jQuery.isEmptyObject(lastPoint))
                    {
                        pathStr += "M";
                    }
                    else
                    {
                        if((point.y - lastPoint.y) > intercept)
                        {
                            pathStr += "M";
                        }
                        else
                        {
                            pathStr += "L";
                        }

                    }
                }
                else
                {
                    if((point.y - lastPoint.y) > intercept)
                    {
                        pathStr += "M";
                    }
                    else
                    {
                        pathStr += "L";
                    }
                }
                pathStr += " ";
                pathStr += point.toString();
                pathStr += " ";
                lastPoint = point;
            }
            this.lastline.attr("d", pathStr).attr("stroke", lineColor)
                .attr("stroke-width", lineThick)
                .attr("fill", "none");
        }

        public destroy():void
        {

        }
    }
}