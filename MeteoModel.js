//данные с одного сайта
SiteModel = Backbone.Model.extend();

//набор данных с одного сайта
SiteCollect = Backbone.Collection.extend({model: SiteModel});

//модель с данными за день
DayModel = Backbone.Model.extend(
{
	relations: {
      "dataMeteo": SiteCollect
   },
	getAvg: function(attr, kolRound) 
	{
		if (typeof(kolRound) == "undefined")
			kolRound = 0;
		var dm = this.get("dataMeteo");
		if (dm.length>0)
		{
			var sum = 0;
			for (var i = 0; i<dm.length; i++)
			{
				sum += dm.at(i).get(attr);
			}
			return this.round(sum/dm.length, kolRound);
		}
		else
		{
			return 0;
		}
	},
	round: function(value, decimals) 
	{
		if (decimals == 0)
			return (Math.round(value))
		else
			return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
	}
}
)

//коллекция с данными за неделю
WeekCollect = Backbone.Collection.extend(
{
	model: DayModel,
	allDataUpd: false,
	addObjMeteo: function(obj)
	{
		for (var i=0; i<obj.length;i++)
		{
			if (this.length>i)
			{
				var oMd = this.at(i).get("dataMeteo").add(new SiteModel(obj[i]));
				this.allDataUpd = true;
			}
			else
			{
				this.add({
					"dataMeteo":new SiteCollect(
						[new SiteModel(obj[i])])
					});
			}
		}		
	}
}
)

//модель для получения данных с сайтов
AppModel = Backbone.Model.extend(
{
	collection: null,
	parse: function(response,options) 
	{
		//разбор ответа в зависимости от сайта
		var aOurWeather = [];
		if (typeof(response.list)!= "undefined")
		{
			var aWeather = response.list;
			aOurWeather = [];
			for (var i in aWeather)
			{
				var obj = aWeather[i];
				aOurWeather[aOurWeather.length] = 
				{
					dat: obj.dt*1000,
					temp_min: obj.temp.min,
					temp_max: obj.temp.max,
					hum: obj.humidity,
					rainfall: (typeof(obj.rain) != "undefined" ? obj.rain 
					:(typeof(obj.snow) != "undefined" ? obj.snow : 0))
				}
				//console.log(JSON.stringify(aWeather[i]));
				//console.log("----");
			}
		}
		else if (typeof(response.daily) != "undefined" 
			&& typeof(response.daily.data) != "undefined")
		{
			var aWeather = response.daily.data;
			aOurWeather = [];
			for (var i=0;i<7;i++)
			{
				var obj = aWeather[i];
				aOurWeather[aOurWeather.length] = 
				{
					dat: obj.time*1000,
					temp_min: obj.temperatureMin,
					temp_max: obj.temperatureMax,
					hum: obj.humidity*100,
					rainfall: obj.precipIntensity
				}
				//console.log(JSON.stringify(aWeather[i]));
				//console.log("----");
			}
		}
		this.updateCollect(aOurWeather);
		return aOurWeather;
	},
	updateCollect:function(objWeather)
	{
		this.collection.addObjMeteo(objWeather);
		console.log("Коллекция обновлена");
	},
	//получим массив только нужных атрибутов
	getArrAttr: function(attr, kolRound)
	{
		var retArr = [];
		var coll = this.collection;
		for (var i = 0; i<coll.length; i++)
		{
			var mod = coll.at(i);
			retArr[i] = mod.getAvg(attr, kolRound);
		}
		return retArr;
	}
})