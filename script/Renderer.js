
function Renderer(){
}

Renderer.prototype = {
	graphTypeDef : {
		"line" : "linear",
		"bar" : "linear",
		"circle" : "circular"
	},

	dispatch : function(selected, current, dController){

		this.dataController = dController;
		var isSimilarType = this.sorting.isSimilarType.bind(this)(selected, current);
		var isSameType = this.sorting.isSameType(selected, current);
		this.position.materialSet(this.dataController);
		this.graph.viewing(selected, current);

		if(isSimilarType && isSameType){
			this.position[this.graphTypeDef[selected]](this.dataController, this.position);
			this.graph[selected.toUpperCase()].bind(this)(this.dataController, this.position);
		}

		if(isSimilarType && !isSameType){
			this.position[this.graphTypeDef[selected]](this.dataController, this.position);
			this.graph[selected.toUpperCase()].bind(this)(this.dataController, this.position);
		}

		if(!isSimilarType && !isSameType){
			console.log(selected, current);
		}
	},

	sorting : {
		isSimilarType : function(selected, current){
			var isEqualGroup = this.graphTypeDef[selected] === this.graphTypeDef[current];
			return isEqualGroup;
		},

		isSameType : function(selected, current){
			return selected === current;
		}
	},

	position : {
		materialSet : function(dataController){
			var isLengthChange = dataController.extractedData.length != dataController.renderedData.length;
			var isMaxValueChange = dataController.extractedData.max != dataController.renderedData.max;
			if(isLengthChange) this.space.setXAxis(dataController.extractedData.length);
			if(isMaxValueChange) this.space.setYAxis(dataController.extractedData.max);
		},

		space : {
			setXAxis : function(length){
				var canvas = document.querySelector("svg #canvas");
				this.cWidth = parseInt(canvas.getAttribute("width")) * 0.9;
				this.xAxis = this.cWidth/(length+1);
			},

			setYAxis : function(max){
				var canvas = document.querySelector("svg #canvas");
				this.cHeight = parseInt(canvas.getAttribute("height")) * 0.9;
				this.yAxis = this.cHeight/max;
			}
		},

		linear : function(dataController){
			this.calculated = new Map();
			var data = dataController.extractedData.map;
			for(key in data){
				var eData = data[key];
				this.calculated.map[key] = this.coord.get(eData, this.space);
			}
			return this.calculated;
		},

		coord : {
			get : function(data, space){
				var yPos = space.yAxis * data.value;
				var adjustedY = space.cHeight - yPos;
				var xPos = space.xAxis * (data.order+1);
				return {"yPos" : adjustedY, "xPos": xPos};
			},

			getX : function(aa){
				console.log(aa);
			},

			getY : function(){

			}
		},

		circular : function(){

		}
	},

	graph : {
		viewing : function(selected, current){
			var notViewingList = document.querySelectorAll("svg > g:not(." + selected + ")");
			var viewingList = document.querySelectorAll("svg>g."+selected);
			for (var i=0 ; i<notViewingList.length ; i++){
				notViewingList[i].classList.add("unviewing");
			}
			for(var i=0 ; i<viewingList.length ; i++){
				viewingList[i].classList.remove("unviewing");
			}
		},
		LINE : function(){
			var toRenderDataMap = this.dataController.extractedData;
			var positionMap = this.position.calculated;

			this.drawing.LINE.group.setting(function(){
				this.drawing.LINE.group.moving(this.position.space);
				this.drawing.LINE.circleSet.bind(this.drawing)(toRenderDataMap, positionMap);
				this.drawing.LINE.lineSet.bind(this.drawing)(toRenderDataMap, positionMap);
			}.bind(this));
		},
		CIRCLE : function(){
			console.log("circle");
		},

		BAR : function(){
			var toRenderDataMap = this.dataController.extractedData;
			// var positionMap = this.position.calculated;
			
			this.drawing.BAR.group.setting(function(){
				this.drawing.BAR.group.moving.bind(this.drawing)(this.position.space);
				this.drawing.BAR.barSet.bind(this.drawing)(toRenderDataMap, this.position);
			}.bind(this));
		}
	},

	drawing : {
		getColor : function(value){
			var l = this.colorArray.length;
			var color = "";
			var prev = 0;
			for(var i=0 ; i<l ; i++){
				var next = this.colorArray[i].max;
				if(prev <= value && value < next){
					color = this.colorArray[i].color;
					break ;
				}
				prev = this.colorArray[i].max;
			}
			return color;
		},
		BAR : {
			group : {
				setting : function(callback){
					var canvas = document.querySelector("svg");
					var rect = canvas.querySelector("#canvas");
					var barGroup = canvas.querySelector("g.barGroup");
					if(barGroup!=null){
						callback(); 
						return;
					}
					var g = "<g class='barGroup rectGroup bar border'></g>";
					rect.insertAdjacentHTML("afterend",g);
					callback();
				},

				moving : function(space){
					var targetGroup = document.querySelector("svg>g.barGroup");
					var xPos = space.cWidth*0.05 + 6;
					var yPos = space.cHeight*0.05 + 6;
					var re = "translate(" + xPos +"px," + yPos+ "px)";
					targetGroup.style.webkitTransform = re;
				},
			},

			barSet : function(toRenderMap, position){
				var stickWidth = position.space.xAxis;
				var cHeight = position.space.cHeight;

				var barGroup = document.querySelector("svg>g.barGroup");
				var barArray = barGroup.querySelectorAll("rect");
				var rMap = toRenderMap.map;
				var pMap = position.calculated.map;
				var rectSet = document.querySelector("#rectSet").innerHTML;

				for (key in rMap){
					var order = rMap[key].order;
					var targetStick = barArray[order];
					var cFill = this.getColor(rMap[key].value);
					var renderType = targetStick===undefined?"newing":"changing";
					var info = this.BAR.stick.fourCoord(pMap[key], cHeight, stickWidth);
					info.dataKey = key;
					info.fill = cFill;
					this.BAR.stick[renderType](info, barGroup, rectSet, targetStick);
				}

				var renderedSize = toRenderMap.size();
				var barArraySize = barArray.length;
				var remain = barArraySize - renderedSize;
				if(remain > 0){
					for (var i=1 ; i<=remain ; i++){
						barGroup.removeChild(barArray[barArraySize-i]);
					}
				}
			},

			stick : {
				newing : function(setting, barGroup, template, targetStick){
					var rend = Mustache.render(template, setting);
					barGroup.insertAdjacentHTML("beforeEnd", rend);
				},

				changing : function(setting, barGroup, template, targetStick){
					targetStick.setAttribute("data-key", setting.dataKey);
					targetStick.setAttribute("width", setting.width);
					targetStick.setAttribute("height", setting.height);
					var re = "translate(" + setting.xPos +"," + setting.yPos+ ")";
					targetStick.style.webkitTransform = re;
					targetStick.style.fill = setting.fill;
				},


				fourCoord : function(position, cHeight, width){
					var obj = {
						"width" : width,
						"height" : cHeight - position.yPos,
						"xPos" : (position.xPos - width/2) + "px",
						"yPos" : position.yPos + "px",
						"x" : 0,
						"y" : 0
					}
					return obj;
				}
			}
		},

		LINE : {
			group : {
				moving :function(space){
					var canvas = document.querySelector("svg");
					var circleGroup = canvas.querySelector("g.circleGroup");
					var lineGroup = canvas.querySelector("g.lineGroup");
					var lineBorderGroup = canvas.querySelector("g.lineBorderGroup");
					var circleBorderGroup = canvas.querySelector("g.circleBorderGroup");

					this.transformStyle(circleGroup, space);
					this.transformStyle(circleBorderGroup, space);
					this.transformStyle(lineGroup, space);
					this.transformStyle(lineBorderGroup, space);
				},

				transformStyle : function(targetGroup, space){
					var xPos = space.cWidth*0.05 + 6;
					var yPos = space.cHeight*0.05 + 6;
					var re = "translate(" + xPos +"px," + yPos+ "px)";
					targetGroup.style.webkitTransform = re;
				},

				setting : function(callback){
					var canvas = document.querySelector("svg");
					var circleGroup = canvas.querySelector("g.circleGroup");
					var lineGroup = canvas.querySelector("g.lineGroup");
					var lineBorderGroup = canvas.querySelector("g.lineBorderGroup");
					if(circleGroup != null && lineGroup != null && lineBorderGroup!=null){
						callback(); 
						return;
					}
					var g = "<g class='lineGroup line '></g>"
							+ "<g class='lineBorderGroup line border'></g>"
							+ "<g class='circleGroup line'></g>"
							+ "<g class='circleBorderGroup line border'></g>";
					canvas.insertAdjacentHTML("beforeEnd",g);
					callback();
				}
			},

			lineSet : function(toRenderMap, positionMap){
				var canvas = document.querySelector("svg");
				
				var circleGroup = canvas.querySelector("g.circleGroup");

				var lineGroup = canvas.querySelector("g.lineGroup");
				var lineBorderGroup = canvas.querySelector("g.lineBorderGroup");

				var pointArray = circleGroup.querySelectorAll("circle");
				var lineArray = lineGroup.querySelectorAll("line");
				var lineBorderArray = lineBorderGroup.querySelectorAll("line");
				
				var lineSet = document.querySelector("#lineSet").innerHTML;
				var rMap = toRenderMap.map;
				var pMap = positionMap.map;

				for(key in rMap){
					var order = rMap[key].order;
					var targetOne = pointArray[order];
					var targetTwo = pointArray[order+1];

					var targetLine = lineArray[order];
					var targetBorderLine = lineBorderArray[order];

					var renderType = "";
					if(targetTwo === undefined) break;
					var renderType = targetLine===undefined?"newing":"changing";
					this.LINE.line[renderType](targetOne, targetTwo, pMap, lineGroup, lineSet, targetLine);
					this.LINE.line[renderType](targetOne, targetTwo, pMap, lineBorderGroup, lineSet, targetBorderLine);
				}

				var renderedSize = toRenderMap.size()-1;
				var lineArraySize = lineArray.length;
				var remain = lineArraySize - renderedSize;
				if(remain > 0){
					for (var i=1 ; i<=remain ; i++){
						lineGroup.removeChild(lineArray[lineArraySize-i]);
						lineBorderGroup.removeChild(lineBorderArray[lineArraySize-i]);
					}
				}
			},

			line : {
				changing : function(tOne, tTwo, pMap, group, set, targetLine){
					var oneKey = tOne.getAttribute("data-key");
					var twoKey = tTwo.getAttribute("data-key");
					var targetOnePos = pMap[oneKey];
					var targetTwoPos = pMap[twoKey];
					var slide = this.slideWidth(targetOnePos, targetTwoPos);
					var deg = this.angle(targetOnePos, targetTwoPos, slide);
					targetLine.setAttribute("data-key", oneKey+"-"+twoKey);
					targetLine.setAttribute("x2", slide);
					targetLine.style.webkitTransform = this.moveStyle(targetOnePos, deg);
				},

				moveStyle : function(targetOnePos, deg){
					var posX = targetOnePos.xPos;
					var posY = targetOnePos.yPos;
					var transform = "translate("+ posX + "px, " + posY + "px) rotate(" + deg + "deg)";
					return transform;
				},

				animate : function(attribute, pre, cur){
					var template = document.querySelector("#animateLineSet").innerHTML;
					var setting = {
						"attributeName" : attribute,
						"dur" : "2s",
						"from" : pre[attribute],
						"to" : cur[attribute],
						"repeatCount" : "1"
					}
					var render = Mustache.render(template, setting);
					return render;
				},

				newing : function(tOne, tTwo, pMap, group, set){
					var oneKey = tOne.getAttribute("data-key");
					var twoKey = tTwo.getAttribute("data-key");
					var targetOnePos = pMap[oneKey];
					var targetTwoPos = pMap[twoKey];
					var slide = this.slideWidth(targetOnePos, targetTwoPos);
					var deg = this.angle(targetOnePos, targetTwoPos, slide);
					var setting = {
						"dataKey" : oneKey + "-" + twoKey,
						"x1" : 0,
						"y1" : 0,
						"x2" : slide,
						"y2" : 0,
						"fill" : "blue",
						"xPos" : targetOnePos.xPos + "px",
						"yPos" : targetOnePos.yPos + "px",
						"rotate"  : deg + "deg" 
					}
					var lNode = Mustache.render(set, setting);
					group.insertAdjacentHTML('beforeEnd', lNode);
				},

				slideWidth : function(targetOnePos, targetTwoPos){
					var bottom = targetTwoPos.xPos - targetOnePos.xPos;
					var left = targetTwoPos.yPos - targetOnePos.yPos;
					var slide = (bottom*bottom) + (left*left);
					return Math.sqrt(slide);
				},

				angle : function(targetOnePos, targetTwoPos, slide){
					var mark = targetTwoPos.yPos > targetOnePos.yPos?+1:-1;
					var bottom = targetTwoPos.xPos - targetOnePos.xPos;
					var a = Math.acos(bottom/slide);
					var angle = (180/Math.PI)*a*mark;
					return angle;
				}
			},

			circleSet : function(toRenderMap, positionMap){
				// this.colorArray
				var canvas = document.querySelector("svg");
				var group = canvas.querySelector("g.circleGroup");
				var bGroup = canvas.querySelector("g.circleBorderGroup");
				var pointArray = group.querySelectorAll("circle");
				var bPointArray = bGroup.querySelectorAll("circle");
				var circleSet = document.querySelector("#circleSet").innerHTML;
				var rMap = toRenderMap.map;

				for(key in rMap){
					var order = rMap[key].order;

					var target = pointArray[order];
					var bTarget = bPointArray[order];
					var cFill = this.getColor(parseInt(rMap[key].value));

					if(target===undefined){
						var cNode = this.LINE.circle(key, positionMap.map[key], circleSet, 10, cFill);
						var cbNode = this.LINE.circle(key, positionMap.map[key], circleSet, 30);
						group.insertAdjacentHTML("beforeEnd", cNode);
						bGroup.insertAdjacentHTML("beforeEnd", cbNode);
					} else {
						target.setAttribute("data-key", key);
						bTarget.setAttribute("data-key", key);
						var t = "translate(" + positionMap.map[key].xPos +"px," + positionMap.map[key].yPos+ "px)";
						target.style.webkitTransform = t;
						bTarget.style.webkitTransform = t;
						target.style.fill = cFill;
					}
				}

				var renderedSize = toRenderMap.size();
				var pointArraySize = pointArray.length;
				var bPointArraySize = bPointArray.length;
				var remain = pointArraySize - renderedSize;
				if(remain > 0){
					for(var i=1 ; i<=remain ; i++){
						group.removeChild(pointArray[pointArraySize-i]);
						bGroup.removeChild(bPointArray[bPointArraySize-i]);
					}
				}
			},

			circle : function(key, position, circleSet, r, fill){
				var setting = {
					"dataKey" : key,
					"cx" : 0,
					"cy" : 0,
					"r" : r,
					"fill" : fill,
					"xPos" : position.xPos + "px",
					"yPos" : position.yPos + "px"
				}
				return Mustache.render(circleSet, setting);
			}
		}
	}
}

