function InitialSetting(){
	this.dataController = new DataController();
	this.graphFlag = new GraphFlag();
	this.infoController = new InfoController();
}


InitialSetting.prototype = {
	service : function(svgWidth, svgHeight, initialDataArray){
		var article = document.querySelector("article");
		var sideBar = document.querySelector("aside");
		this.SVGCanvas(article, svgWidth, svgHeight);
		this.SideBar.set(sideBar, this.graphFlag, this.dataController, this.infoController);

		this.graphFlag.dataController = this.dataController;
		var initCustomizedData = this.dataController.customizing(initialDataArray);
		var cWrapper = document.querySelector("#ColorSet");
		this.graphFlag.adapt(initCustomizedData, this.SideBar.extract.Color(cWrapper));
		this.infoController.dataMap = initCustomizedData;
		this.infoController.setEvent();
	},

	SVGCanvas : function(position, sWidth, sHeight){
		var border = 3;
		var svgTemplate = document.getElementById("svgSet").innerHTML;
		var svgSetting = {"width" : sWidth, "height" :  sHeight};
		var svgRendered = Mustache.render(svgTemplate, svgSetting);
		position.insertAdjacentHTML("beforeEnd",svgRendered);

		var canvasMargin = border*2;
		var canvasTemplate = document.getElementById("rectSet").innerHTML;
		var canvasSetting = {
			"width" : sWidth - canvasMargin*2,
			"height" : sHeight - canvasMargin*2,
			"rx" : border*2,
			"ry" : border*2,
			"x" : canvasMargin,
			"y" : canvasMargin
		};
		var canvasRendered = Mustache.render(canvasTemplate, canvasSetting);
		var svg = position.querySelector("svg");
		svg.setAttribute("class", this.graphFlag.getGraph.selectedType());
		svg.insertAdjacentHTML("beforeEnd",canvasRendered);

		var canvas = svg.querySelector("rect");
		canvas.setAttribute("id", "canvas");
	},

	SideBar : {
		set : function(sideBar, graphFlag, dataController, infoController){
			var material = {
				"graphTypeButtonWrapper" : sideBar.querySelector("#GraphType"),
				"hidingSidebarButton" : document.querySelector("aside>button:last-child"),
				"reflectDataButton" : sideBar.querySelector("#dataApplyButton"),
				"dataFormWrapper" : document.querySelector("#DataForm"),
				"colorFormWrapper" : document.querySelector("#ColorSet"),
				"extractData" : this.extract.Data,
				"infoController" : infoController,
				"extractColor" : this.extract.Color,
				"checkData" : this.isPossibleData,
				"graphFlag" : graphFlag,
				"dataController" : dataController
			}

			this.fillColorSetForm(material.colorFormWrapper, customizedColor);
			this.fillTestDataForm(material.dataFormWrapper, testDataArray);
			this.inputCheckEvent.service(material);
			this.buttonEvent.service(material);
		},
		inputCheckEvent : {
			service : function(material){
				var cWrapper = material.colorFormWrapper;
				var dWrapper = material.dataFormWrapper;
				this.colorRange(cWrapper);
				this.dataValueType(dWrapper);
			},

			colorRange : function(wrapper){
				wrapper.addEventListener("focusout", function(e){
					if(e.target.parentNode.className === "add") return;
					if(e.target.className!="inputed") return;
					var focusedTarget = e.target;
					var toSetValue = focusedTarget.value;
					var nextEle = focusedTarget.parentNode.nextElementSibling;
					var prevEle = focusedTarget.parentNode.previousElementSibling;
					
					if(toSetValue===""){
						alert("값을 입력하세요");
						focusedTarget.value = nextEle.firstElementChild.innerHTML;
						return ;
					}

					if(!this.tool.isNumber(toSetValue)){
						alert("숫자를 입력하세여");
						focusedTarget.value = nextEle.firstElementChild.innerHTML;
						return ;
					}

					var prevValue = this.tool.getValue(prevEle);
					var nextValue = this.tool.getValue(nextEle);

					if(!this.tool.isInGap(prevValue, nextValue, toSetValue)){
						alert(prevValue + " 초과, " + nextValue + " 미만의 값이어야함");
						focusedTarget.value = nextEle.firstElementChild.innerHTML;
					} else {
						nextEle.querySelector(".over").innerHTML = toSetValue;
						var ele = nextEle.nextElementSibling;
						if(ele.className === "add") ele.querySelector(".over").innerHTML = toSetValue;
					}
				}.bind(this));
			},

			tool : {
				getValue : function(target){
					if(target===null || target===undefined) return 0;

					var realTarget = target.querySelector('.inputed');
					var tag = realTarget.tagName.toLowerCase();
					if(tag==="input") return realTarget.value;
					if(tag==="p") return realTarget.innerHTML;
				},

				isInGap : function(pre, next, target){
					if(parseInt(pre) >= parseInt(target))
						return false;
					if(next==="Infinity")
						return true;
					if(parseInt(next) < parseInt(target))
						return false;
					return true;
				},

				isNumber : function(target){
					return !isNaN(target);
				}
			},

			dataValueType : function(wrapper){

			}

		},
		buttonEvent : {
			service : function(material){
				this.hidingSidebar(material.hidingSidebarButton);
				this.reflectData(material);
				this.addData(material.dataFormWrapper, material.checkData);
				this.removeData(material.dataFormWrapper);
				this.graphTypeSelect(material.graphTypeButtonWrapper);
				this.colorAdd(material.colorFormWrapper);
				this.colorRemove(material.colorFormWrapper);
			},

			colorAdd : function(wrapper){
				wrapper.addEventListener("click", function(e){

					var target = e.target;
					var clsName = target.parentNode.className.toLowerCase();
					var tgName = target.tagName.toLowerCase();
					if(clsName != "add" || tgName != "input") return;
					var type = target.type.toLowerCase();
					if(type != "button") return;

					var fixed = wrapper.querySelector("li.fixed");
					var li = target.parentNode;
					var overNumber = parseInt(li.querySelector("p.over").innerHTML);
					var inputedNumber = li.querySelector("input[type='text']").value;
					if(isNaN(inputedNumber)){
						alert("숫자를 입력하세요");
						return ;
					}
					if(parseInt(inputedNumber) < overNumber){
						alert(overNumber +"보다 큰 숫자를 입력하세요");
						return;
					}
					var colorValue = li.querySelector("input[type='color']").value;
					var tpl = document.querySelector("#colorSelectSet").innerHTML;
					var setting = {"over" : overNumber, 
								"upper" : inputedNumber, 
								"colorValue" : colorValue };
					var rendered = Mustache.render(tpl, setting);
					fixed.insertAdjacentHTML("beforebegin", rendered);

					fixed.querySelector("p.over").innerHTML = inputedNumber;
					li.querySelector("p.over").innerHTML = inputedNumber;
				});
			},

			colorRemove : function(wrapper){
				wrapper.addEventListener("click", function(e){
					var target = e.target;
					var clsName = target.parentNode.className.toLowerCase();
					var tgName = target.tagName.toLowerCase();
					if(clsName === "add" || tgName != "input") return;
					var type = target.type.toLowerCase();
					if(type != "button") return;
					
					var li = target.parentNode;
					var curOverNumber = li.querySelector("p.over").innerHTML;
					var nextLi = li.nextElementSibling;
					var nextOverNumber = nextLi.querySelector("p.over");
					console.log(nextOverNumber);
					nextOverNumber.innerHTML = curOverNumber;
					li.parentNode.removeChild(li);
					
					var fixed = wrapper.querySelector("li.fixed");
					var add = wrapper.querySelector("li.add");
					var fixedOverNumber = fixed.querySelector("p.over").innerHTML;
					add.querySelector("p.over").innerHTML = fixedOverNumber;
				});
			},

			graphTypeSelect : function(wrapper){
				wrapper.addEventListener("click", function(e){
					var target = e.target;
					var beforeSelected = wrapper.querySelector("input[type='button'].selected");
					if(target.tagName.toLowerCase()==="input"){
						beforeSelected.classList.remove("selected");
						target.classList.add("selected");
					}
				});
			},

			hidingSidebar : function(button){
				button.addEventListener("click", function(){
					var article = document.querySelector("article");
					var sidebar = document.querySelector("aside");
					var state = sidebar.getAttribute("class");
					var changing = state==="closed"?"opened":"closed";
					sidebar.classList.remove(state);
					sidebar.classList.add(changing);
					article.classList.remove(state);
					article.classList.add(changing);
				});
			},

			reflectData : function(material){
				var button = material.reflectDataButton;
				var dWrapper = material.dataFormWrapper;
				var cWrapper = material.colorFormWrapper;
				var colorExtracter = material.extractColor;
				var dataExtracter = material.extractData;
				var flag = material.graphFlag;
				
				button.addEventListener("click",function(){
					var extractedData = dataExtracter(dWrapper);
					var extractedColor = colorExtracter(cWrapper);
					var customizedDataMap = material.dataController.customizing(extractedData);
					material.infoController.dataMap = customizedDataMap;
					flag.adapt(customizedDataMap, extractedColor);
				});
			},

			addData : function(wrapper, isPossibleData){
				var targetForm = wrapper.querySelector(".dataAddForm");
				var button = targetForm.querySelector("input[type='button']");

				button.addEventListener('click', function(e){
					var key = targetForm.querySelector("input[name=key]").value;
					var value = targetForm.querySelector("input[name=value]").value;
					var comment = targetForm.querySelector("input[name=comment]").value;
					var setting = {
						"key" : key,
						"value" : parseInt(value),
						"comment" : comment
					}
					
					if(!isPossibleData(wrapper, setting)){
						alert("모든 값을 정확히 입력하세요");
						return ;
					}

					var template = document.getElementById("dataInput").innerHTML;
					var rendered = Mustache.render(template, setting);
					wrapper.insertAdjacentHTML("beforeEnd", rendered);
				});
			},

			removeData : function(wrapper){
				wrapper.addEventListener('click', function(e){
					var target = e.target;
					var tagName = target.tagName.toLowerCase();
					var className = target.className.toLowerCase();

					if( tagName==="input" && className ==="delete"){
						var targetForm = target.parentNode;
						var formWrap = targetForm.parentNode;
						formWrap.removeChild(targetForm);
					}
				});
			}
		},

		fillColorSetForm : function(wrapper, customizedColor){
			var template = document.querySelector("#colorSelectSet").innerHTML;
			var renderedForm = "";
			var prevValue = 0;
			customizedColor.map(function(item){
				var setting = {
					"over" : prevValue,
					"upper" : item.max,
					"colorValue" : item.color
				}
				prevValue = item.max;
				var rendered = Mustache.render(template, setting);
				if(item.max===Infinity) return;
				renderedForm += rendered;
			});
			var rd = renderedForm;
			var ul = wrapper.querySelector("ul");
			ul.insertAdjacentHTML("afterbegin", rd);
		},

		fillTestDataForm : function(wrapper, testDataArray){
			var template = document.getElementById("dataInput").innerHTML;
			var renderedForm = "";
			testDataArray.map(function(item){
				var setting = {
					"key" : item.k,
					"value" : item.v,
					"comment" : item.comment
				}
				var rendered = Mustache.render(template, setting);
				renderedForm += rendered;
			});
			wrapper.insertAdjacentHTML("beforeEnd", renderedForm);
		},

		extract : {
			Data : function(wrapper){
				var dataFormList = wrapper.querySelectorAll("form:not(.dataAddForm)");
				var dataList = [];
				for(var i=0 ; i<dataFormList.length ; i++){
					var targetForm = dataFormList[i];
					var key = targetForm.querySelector("input[name=key]").value;
					var value = targetForm.querySelector("input[name=value]").value;
					var comment = targetForm.querySelector("input[name=comment]").value;
					var dataObject = {
						"k" : key,
						"v" : value,
						"comment" : comment
					}
					dataList.push(dataObject);
				}
				return dataList;
			},

			Color : function(wrapper){
				var list = wrapper.querySelectorAll("ul>li:not(.add)");
				var colorArray = [];
				for(var i=0 ; i<list.length ; i++){
					var cr = list[i].querySelector("input[type='color']").value;
					if(i===list.length-1){
						var last = {"max" : Infinity, "color" : cr};
						colorArray.push(last);
						continue;
					}
					var mValue = list[i].querySelector("input[type='text']").value;
					var colorSet ={
						"max" : mValue==="Infinity"?Infinity:parseInt(mValue),
						"color" : cr
					}
					colorArray.push(colorSet);
				}
				return colorArray;
			}
		},

		isPossibleData : function(wrapper, data){
			var keyFormList = wrapper.querySelectorAll("form:not(.dataAddForm) > input[name=key]");
			var keyList = [];
			for(var i=0 ; i<keyFormList.length ; i++){
				keyList.push(keyFormList[i].value);
			}
			var alreadyExistKey = keyList.filter(function(item,index,array){
				return item === data.key;
			});

			if(alreadyExistKey.length != 0){
				return false;
			}
			if(data.key==="" || data.value==="" || isNaN(data.value)){
				return false;
			}

			return true;
		}
	}
}
