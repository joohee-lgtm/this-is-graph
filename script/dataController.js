function DataController(){

}
// k: "1월", v: 100, comment: "aaa"
DataController.prototype = {
	customizing : function(userRawDataArray){
		var customizedDataMap = new Map();
		var prev, next = null;
		var nextPoint = 0;

		userRawDataArray.map(function(item){
			var next = userRawDataArray[++nextPoint];
			var object = {
				"value" : parseInt(item.v),
				"order" : nextPoint - 1,
				// "ratio" : item.v / totalValue,
				"comment" : item.comment,
				"prev" : prev!=null?prev.k:null,
				"next" : next!=null?next.k:null
			};
			prev = item;
			customizedDataMap.put(item.k, object);
		}.bind(this));
		return customizedDataMap;
	},

	getNeed : {
		total : function(userRawDataArray){
			var total = 0;
			userRawDataArray.map(function(item){
				total += item.v;
			});
			return total;
		},

		maximum : function(dataMap){
			if(dataMap===undefined)
				return 0;
			var max = 0;
			var dMap = dataMap.map;
			for(key in dMap){
				max = dMap[key].value>max?dMap[key].value:max;
			}
			return max;
		},

		dataLength : function(dataMap){
			if(dataMap===undefined)
				return 0;
			return dataMap.size();
		}
	}
}








