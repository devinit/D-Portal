// Copyright (c) 2014 International Aid Transparency Initiative (IATI)
// Licensed under the MIT license whose full text can be found at http://opensource.org/licenses/MIT


var view_dash_quality=exports;
exports.name="dash";

var ctrack=require("./ctrack.js")
var plate=require("./plate.js")
var iati=require("./iati.js")
var fetch=require("./fetch.js")
var iati_codes=require("../../dstore/json/iati_codes.json")

var commafy=function(s) { return (""+s).replace(/(^|[^\w.])(\d{4,})/g, function($0, $1, $2) {
		return $1 + $2.replace(/\d(?=(?:\d\d\d)+(?!\d))/g, "$&,"); }) };

// the chunk names this view will fill with new data
view_dash_quality.chunks=[
	"dash_quality_pub",
	"dash_quality_act_count",
	"dash_quality_budget_count",
	"dash_quality_trans_count",
	"dash_quality_country_count",
];

view_dash_quality.view=function()
{
	view_dash_quality.chunks.forEach(function(n){ctrack.chunk(n,"{spinner}");});

	ctrack.setcrumb(1);
	ctrack.change_hash();
	view_dash_quality.ajax({});
}

view_dash_quality.calc=function()
{
//	var s=(new Date).toUTCString();	
//	ctrack.chunk("dash_updated_date",s);
}

//
// Perform ajax call to get numof data
//
view_dash_quality.ajax=function(args)
{
	args=args || {};
	args.pub=ctrack.hash.pub;
	args.country=ctrack.hash.country;
	
	ctrack.chunk("dash_quality_pub",args.pub);
	ctrack.chunk("dash_quality_pub_name",iati_codes.publisher_names[args.pub]);	
	
	view_dash_quality.ajax1(args); // chain
}

view_dash_quality.ajax1=function(args)
{
	args=args || {};
	var dat={
			"country_code":(args.country),
			"reporting_ref":(args.pub),
			"select":"stats",
			"from":"act",
			"limit":-1
		};
	fetch.ajax(dat,args.callback || function(data)
	{
		console.log("view_dash_quality.ajax1");
		console.log(data);
			
		if(data.rows.length==1)
		{
			var v=data.rows[0];
			var count=v["COUNT(DISTINCT aid)"];
			ctrack.chunk("dash_quality_act_count",commafy(Math.floor(count)));
		}
		
		view_dash_quality.calc();
		ctrack.display(); // every fetch.ajax must call display once

		view_dash_quality.ajax2(args);
	});
}

view_dash_quality.ajax2=function(args)
{
	args=args || {};
	var dat={
			"country_code":(args.country),
			"reporting_ref":(args.pub),
			"select":"count",
			"from":"budget,act",
			"limit":-1
		};
	fetch.ajax(dat,args.callback || function(data)
	{
		console.log("view_dash_quality.ajax2");
		console.log(data);
			
		if(data.rows.length==1)
		{
			var v=data.rows[0];
			var count=v.count;
			ctrack.chunk("dash_quality_budget_count",commafy(Math.floor(count)));
		}
		
		view_dash_quality.calc();
		ctrack.display(); // every fetch.ajax must call display once

		view_dash_quality.ajax3(args);
	});
}

view_dash_quality.ajax3=function(args)
{
	args=args || {};
	var dat={
			"country_code":(args.country),
			"reporting_ref":(args.pub),
			"select":"count",
			"from":"trans,act",
			"limit":-1
		};
	fetch.ajax(dat,args.callback || function(data)
	{
		console.log("view_dash_quality.ajax3");
		console.log(data);
			
		if(data.rows.length==1)
		{
			var v=data.rows[0];
			var count=v.count;
			ctrack.chunk("dash_quality_trans_count",commafy(Math.floor(count)));
		}
		
		view_dash_quality.calc();
		ctrack.display(); // every fetch.ajax must call display once

		view_dash_quality.ajax4(args);
	});
}

view_dash_quality.ajax4=function(args)
{
	args=args || {};
	var dat={
			"country_code":(args.country),
			"reporting_ref":(args.pub),
			"select":"count",
			"from":"country,act",
			"groupby":"country_code",
			"limit":-1
		};
	fetch.ajax(dat,args.callback || function(data)
	{
		console.log("view_dash_quality.ajax4");
		console.log(data);
			
		ctrack.chunk("dash_quality_country_count",commafy(Math.floor(data.rows.length)));
		
		view_dash_quality.calc();
		ctrack.display(); // every fetch.ajax must call display once

//		view_dash_quality.ajax4(args);
	});
}
