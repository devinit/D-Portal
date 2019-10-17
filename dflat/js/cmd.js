#!/usr/bin/env node
// Copyright (c) 2019 International Aid Transparency Initiative (IATI)
// Licensed under the MIT license whose full text can be found at http://opensource.org/licenses/MIT

var cmd=exports;

var pfs=require("pify")( require("fs") )

var dflat=require("./dflat.js")
var jml=require("./jml.js")
var xson=require("./xson.js")

var stringify = require('json-stable-stringify');


var ls=function(a) { console.log(util.inspect(a,{depth:null})); }


cmd.parse=function(argv)
{

	argv.dir   =           argv.dir   || process.env.DFLAT_DIR   || "data"
	argv.limit = parseInt( argv.limit || process.env.DFLAT_LIMIT || "999999"     )

}

cmd.run=async function(argv)
{
	if( argv._[0]=="fetch" )
	{
		await require("./fetch.js").all()
		return
	}

	if( argv._[0]=="xml2json" )
	{
		var filename=argv.filename || argv._[1] ;
		if(filename)
		{
			var dat=await pfs.readFile(filename+".xml",{ encoding: 'utf8' });
			var json=dflat.xml_to_xson(dat)
			await pfs.writeFile(filename+".xml.json",stringify(json,{space:" "}));

			return
		}
	}
	
	if( argv._[0]=="json2xml" )
	{
		var filename=argv.filename || argv._[1] ;
		if(filename)
		{
			var dat=await pfs.readFile(filename+".json",{ encoding: 'utf8' });
			var json=JSON.parse(dat)
			var xml=jml.to_xml( xson.to_jml(json) )
			await pfs.writeFile(filename+".json.xml",xml);

			return
		}
	}

	if( argv._[0]=="xml2csv")
	{
		var filename=argv.filename || argv._[1] ;
		if(filename)
		{
			var dat=await pfs.readFile(filename+".xml",{ encoding: 'utf8' });
			var json=dflat.xml_to_xson(dat)
			var csv=dflat.xson_to_xsv(json,"/iati-activities/iati-activity",{"/iati-activities/iati-activity":true})

			await pfs.writeFile(filename+"xml.csv",csv);

			return
		}
	}
	
	if( argv._[0]=="frankenstein" )
	{
		await require("./frankenstein.js").all()
		return
	}

	if( argv._[0]=="stats" )
	{
		await require("./stats.js").cmd(argv)
		return
	}

	if( argv._[0]=="packages" )
	{
		await require("./packages.js").prepare_download(argv)
		return
	}

	// help text
	console.log(
		"\n"+
		">	dflat fetch \n"+
		"Fetch remote files and update cached data\n"+
		"\n"+
		">	dflat xml2json filename[.xml] \n"+
		"Convert activities from filename.xml into filename.json/*\n"+
		"\n"+
		">	dflat xml2csv filename[.xml] \n"+
		"Convert activities from filename.xml into filename.csv/*\n"+
		"\n"+
		">	dflat json2xml filename[.jxon] \n"+
		"Convert activities from filename.jxon into filename.xml/*\n"+
		"\n"+
		">	dflat frankenstein \n"+
		"Build a full example activity from parts of other activities\n"+
		"\n"+
		">	dflat stats \n"+
		"Build or update json based stats\n"+
		"\n"+
		">	dflat packages \n"+
		"Prepare a data directory to fetch IATI packages into.\n"+
		"\n"+
		"	--dir data \n"+
		"	Directory to download into.\n"+
		"\n"+
		"	--limit 999999 \n"+
		"	Maximum number of packages to download.\n"+
		"\n"+
		"\n"+
	"");
}

// if global.argv is set then we are inside another command so do nothing
if(!global.argv)
{
	var argv = require('yargs').argv
	global.argv=argv
	cmd.parse(argv)
	cmd.run(argv)
}
