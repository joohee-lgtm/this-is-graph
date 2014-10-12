function InfoController(){}

InfoController.prototype = {
	setEvent : function(){
		this.createInfoBox();
		var svg = document.querySelector("svg");

		svg.addEventListener('mouseover', function(e){
			var target = e.target;
			var isBorderTarget = target.parentNode.classList.contains("border");
			if(isBorderTarget) {
				this.borderEffect.On(target);// console.log("mouseover", target.tagName);
				this.changeInfoBoxState();
			}
			
		}.bind(this));

		svg.addEventListener('mouseout', function(e){
			var target = e.currentTarget;
			var fromTarget = e.fromElement;
			// debugger;

			var isFromBorder = fromTarget.parentNode.classList.contains("border");
			var isBorder = target.parentNode.classList.contains("border");
			
			if(isBorder && isFromBorder) {
				return ;
			}
			if(isFromBorder){
				this.borderEffect.Off(fromTarget);
				this.changeInfoBoxState();
				return ;
			}

			//console.log("mouseout", target.tagName, target.getAttribute("data-key"));
		}.bind(this));

		svg.addEventListener('mousemove', function(e){
			var g = document.querySelector("svg>g#infoBox");
			var isViewing = !g.classList.contains("unviewing");
			if(isViewing) this.showInfo(e, g);
		}.bind(this));

	},

	changeInfoBoxState : function(){
		var g = document.querySelector("svg>g#infoBox");
		var isUnViewing = g.classList.contains("unviewing");
		if(isUnViewing){ // 안보일떄
			g.classList.remove("unviewing");
		} else{ //보일때
			g.classList.add("unviewing");
		}
		
	},

	showInfo : function(e, infoBox){
		var re = this.check.Side(e, infoBox);
		var translate = "translate(" + re.posX + "px, " + re.posY +"px)";
		infoBox.style.webkitTransform = translate;
	},

	check : {
		Side : function(e, infoBox){
			var box = infoBox.querySelector("rect");
			var boxBoundary = this.getBoxBoundary(e, box);
			var canvasBoundary = this.getCanvasBoundary();
			var outBoundArray = this.outOfBound(boxBoundary, canvasBoundary);
			for(var i=0 ; i<outBoundArray.length ; i++){
				var bou = outBoundArray[i];
				boxBoundary = this.rePosition[bou](boxBoundary, canvasBoundary, e);
			}
			return {"posX" : boxBoundary["Left"], "posY" :boxBoundary["Top"]};
		},

		getBoxBoundary : function(e, box){
			var bWidth = parseInt(box.getAttribute("width"));
			var bHeight = parseInt(box.getAttribute("height"));
			var calPosX = e.offsetX - bWidth/2;
			var calPosY = e.offsetY - bHeight - 30;
			
			var boundary = {
				"Top" : calPosY,
				"Left" : calPosX,
				"Right" : calPosX + bWidth,
				"Bottom" : calPosY + bHeight
			}
			return boundary;
		},

		getCanvasBoundary : function(){
			var canvas = document.querySelector("svg>rect#canvas");
			var cWidth = this.attributeToInt(canvas, "width");
			var cHeight = this.attributeToInt(canvas,"height");
			var posX = this.attributeToInt(canvas,"x");
			var posY = this.attributeToInt(canvas,"y");
			var boundary = {
				"Top" : posY,
				"Left" : posX,
				"Right" : posX + cWidth,
				"Bottom" : posY + cHeight
			}
			return boundary;
		},

		attributeToInt : function(target, attr){
			return parseInt(target.getAttribute(attr));
		},

		outOfBound : function(boxBound, canvasBound){
			var result = [];
			var compare = function(bou){
				return boxBound[bou] - canvasBound[bou];
			}
			if(compare("Top") < 0) result.push("Top");
			if(compare("Left") < 0 ) result.push("Left");
			if(compare("Bottom") > 0 ) result.push("Bottom");
			if(compare("Right") > 0  ) result.push("Right");
			return result;
		},
		
		rePosition : {
			Top : function(boxBoundary, canvasBoundary, e){
				var canvasTop = canvasBoundary["Top"];
				var boxHeight = boxBoundary["Top"] - boxBoundary["Bottom"];
				boxBoundary["Top"] = e.offsetY + 30;
				boxBoundary["Bottom"] = boxBoundary["Top"] + boxHeight;
				return boxBoundary;
			},
			Left : function(boxBoundary, canvasBoundary){
				var canvasLeft = canvasBoundary["Left"];
				var boxWidth = boxBoundary["Right"] - boxBoundary["Left"];
				boxBoundary["Left"] = canvasLeft + 10;
				boxBoundary["Right"] = boxBoundary["Left"] + boxWidth;
				return boxBoundary;
			},
			Right : function(boxBoundary, canvasBoundary){
				var canvasRight = canvasBoundary["Right"];
				var boxWidth = boxBoundary["Right"] - boxBoundary["Left"];
				boxBoundary["Right"] = canvasRight - 10;
				boxBoundary["Left"] = boxBoundary["Right"] - boxWidth;
				return boxBoundary;
			},
			Bottom : function(boxBoundary, canvasBoundary){
				return boxBoundary;
			}
		}
	},

	borderEffect : {
		On : function(target){
			var dataKey = target.getAttribute("data-key");
			var type = target.tagName.toLowerCase();			
			var query = "svg>g."+type+"Group>"+type+"[data-key='"+dataKey+"']";
			var toStyling = document.querySelector(query);
			if(type==="rect"){this.onBarStyle(toStyling); return;};
			var computedStyle = window.getComputedStyle(toStyling);
			var material ={
				"stroke" : computedStyle.fill,
				"strokeWidth" : 10,
				"strokeOpacity" : 0.5
			}
			this.strokeStyle(toStyling, material);
		},

		onBarStyle : function(target){
			var computedStyle = window.getComputedStyle(target);
			target.style.opacity = 0.5;
		},

		offBarStyle : function(target){
			target.style.opacity = 1;
		},

		Off : function(target){
			if("canvas" === target.getAttribute("id")) return;
			var dataKey = target.getAttribute("data-key");
			var type = target.tagName.toLowerCase();
			var query = "svg>g."+type+"Group>"+type+"[data-key='"+dataKey+"']";
			var toStyling = document.querySelector(query);
			if(type==="rect"){this.offBarStyle(toStyling); return;};
			var computedStyle = window.getComputedStyle(toStyling);
			var material ={
				"stroke" : computedStyle.fill,
				"strokeWidth" : type==="line"?2:0,
				"strokeOpacity" : 1
			}
			this.strokeStyle(toStyling, material);
		},

		strokeStyle : function(target, material){
			//stroke, strokeWidth, strokeOpacity
			for(style in material){
				target.style[style] = material[style];
			}
		}
	},

	createInfoBox : function(){
		var gTemplate = document.querySelector("#infoBoxSet").innerHTML;
		var setting = {};
		var rend = Mustache.render(gTemplate, setting);
		var svg = document.querySelector("svg");
		svg.insertAdjacentHTML("beforeEnd", rend);
		var g = svg.querySelector("g#infoBox");
		g.classList.add("unviewing");
	}
}