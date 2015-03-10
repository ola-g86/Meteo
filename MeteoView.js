//средние данные за один день
DayView = Backbone.View.extend(
{
	tagName: 'li',
	className: 'ul',
	render: function() 
	{
		this.$el.html(
			'<table width="30%">'
				+'<tr>'
					+'<td>'
						+'<b>'+strDat(new Date(this.model.getAvg('dat')))+'</b>'
					+'</td>'
					+ '<td class="temperature">'
						+'<b>' + this.model.getAvg('temp_min')
						+' - '+ this.model.getAvg('temp_max')+'C</b>'
					+'</td>'
					+ '<td width="20%">' 
						+ this.model.getAvg('hum')+'% влажн.'
					+'</td>' 
					+ '<td width="30%" align="left">'
						+'Осадки - ' + this.model.getAvg('rainfall',2)+'мм'
					+'</td>'
				+'</tr>'
			+'</table>'
		);
		 return this;
	}
});

//средние данные за неделю
WeekView = Backbone.View.extend(
{
	tagName: 'ul',
	className: 'ul',
	render: function() 
	{
		this.collection.each(this.addOne, this);
		return this;
	},
	addOne: function(modDay) 
	{
		var dayView = new DayView({ model: modDay });
		this.$el.append(dayView.render().el);
	}
});
//список и графики
AppView = Backbone.View.extend(
{
   el: "#lst",
	weekView: null,
	chTemp: null,
	chHum: null,
	chRainfall: null,
	initialize: function() 
	{
		this.weekView = new WeekView({ collection: this.model.collection });
		this.model.on('invalid', function(model, error){alert(error);}, this);
	},
	render: function() 
	{
		if (this.model.collection.allDataUpd != true)
			return this;
		
		this.$el.append(this.weekView.render().el);
		$('#trTitle').show();
		var aDat = this.model.getArrAttr('dat');
		for (var i in aDat)
		{
			aDat[i] = strDat(new Date(aDat[i]));
		}
		var aTemp_min = this.model.getArrAttr('temp_min');
		var aTemp_max = this.model.getArrAttr('temp_max');
		var aHum = this.model.getArrAttr('hum');
		var aRainfall = this.model.getArrAttr('rainfall',2);
		if(this.chTemp != null)
			this.chTemp.destroy();
		if(this.chHum != null)
			this.chHum.destroy();
		if(this.chRainfall != null)
			this.chRainfall.destroy();
		var ct = $("#temp").get(0).getContext("2d");
		var ch = $("#hum").get(0).getContext("2d");
		var cr = $("#rainfall").get(0).getContext("2d");		
		this.chTemp = new Chart(ct);
		this.chHum = new Chart(ch);
		this.chRainfall = new Chart(cr);
		var data = {
			labels: aDat,
			datasets: [
				  {
						label: "Макс",
						fillColor: "rgba(255,255,255,0)",
						strokeColor: "rgba(220, 0, 0, 1)",
						pointColor: "rgba(220, 0, 0, 1)",
						pointStrokeColor: "#fff",
						pointHighlightFill: "#fff",
						pointHighlightStroke: "rgba(220, 0, 0, 1)",
						data: aTemp_max
				  },
				  {
						label: "Мин",
						fillColor: "rgba(255,255,255,0)",
						strokeColor: "rgba(0, 107, 255, 1)",
						pointColor: "rgba(0, 107, 255, 1)",
						pointStrokeColor: "#fff",
						pointHighlightFill: "#fff",
						pointHighlightStroke: "rgba(0, 107, 255, 1)",
						data: aTemp_min
				  }
			 ]
		};		
		this.chTemp.Line(data,{multiTooltipTemplate: "<%= datasetLabel %> - <%= value %>"});
		var data = {
			 labels: aDat,
			 datasets: [
				  {
						fillColor: "rgba(0, 140, 0, 0.5)",
						strokeColor: "rgba(0, 140, 0, 0.8)",
						highlightFill: "rgba(0, 140, 0, 0.75)",
						highlightStroke: "rgba(0, 140, 0, 1)",
						data: aHum
				  },
			 ]
		};
		this.chHum.Bar(data);
		var data = {
			labels: aDat,
			datasets: [
				  {
						fillColor: "rgba(170, 60, 255, 0.2)",
						strokeColor: "rgba(170, 60, 255, 1)",
						pointColor: "rgba(170, 60, 255, 1)",
						pointStrokeColor: "#fff",
						pointHighlightFill: "#fff",
						pointHighlightStroke: "rgba(170, 60, 255, 1)",
						data: aRainfall
				  }
			 ]
		};		
		this.chRainfall.Line(data);
		return this;
	}
});

function strDat(datevalue)
{
   var aMonth = ["января","февраля","марта","апреля","мая","июня"
		,"июля","августа","сентября","октября","ноября","декабря"];
	var value = datevalue.getDate();   
   var str = value;
   value = datevalue.getMonth();
   str += " "+aMonth[value];   
   return str;
}