function GraphFlag(){
	this.renderer = new Renderer();
}

GraphFlag.prototype = {
	flag : {
		// "line" : new LineGraph()
	},

	adapt : function(customizedFromFormMap, colorArray){
		var selectedGraph = this.getGraph.selectedType();
		var currentGraph = this.getGraph.currentType();
		this.changeCanvasClass(selectedGraph, currentGraph);

		this.renderer.drawing.colorArray = colorArray;
		this.renderer.dispatch(
			selectedGraph, currentGraph, this.getControllerData(customizedFromFormMap)
		);
	},

	changeCanvasClass : function(selectedGraph, currentGraph){
		var svg = document.querySelector("svg");
		svg.classList.remove(currentGraph);
		svg.classList.add(selectedGraph);
	},

	getControllerData : function(customizedFromFormMap){
		this.dataController.renderedData = this.dataController.extractedData;
		this.dataController.extractedData = customizedFromFormMap;

		this.dataController.extractedData.max = this.dataController.getNeed.maximum(this.dataController.extractedData);
		this.dataController.extractedData.length = this.dataController.getNeed.dataLength(this.dataController.extractedData);

		if(this.dataController.renderedData === undefined)
			this.dataController.renderedData = new Map();

		this.dataController.renderedData.max = this.dataController.getNeed.maximum(this.dataController.renderedData);
		this.dataController.renderedData.length = this.dataController.getNeed.dataLength(this.dataController.renderedData);
		
		this.dataController.compared = this.getComparedData(this.dataController);
		return this.dataController;
	},

	getGraph : {
		selectedType : function(){
			var gTypeWrapper =  document.querySelector("#GraphType");
			var selected = gTypeWrapper.querySelector("input[type='button'].selected");
			return selected.value.toLowerCase();
		},

		currentType : function(){
			var svg = document.querySelector("svg");
			var cur = svg.getAttribute("class").toLowerCase();
			return cur;
		}
	},

	getComparedData : function(dataController){
		var extracted = dataController.extractedData;
		var rendered = dataController.renderedData;
		var eMap = extracted.map;
		var rMap = rendered.map;
		var changedData = [];
		var newData = [];
		var constantData = [];

		for(key in eMap){
			if(rMap[key] === undefined){
				newData.push(key);
				continue ;
			}
			if(rMap[key] != undefined && rMap[key].value != eMap[key].value){
				changedData.push(key);
			}
			if(rMap[key] != undefined && rMap[key].value === eMap[key].value){
				constantData.push(key);
			}
		}

		var dataObject = {
			"newDataArray" : newData, 
			"changedDataArray" : changedData,
			"constantDataArray" : constantData
		};
		return dataObject;
	}
}















