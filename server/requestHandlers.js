var http = require("http");
var path = require('path');
var fs = require('fs');
var xml2js = require('xml2js');
var exec = require('child_process').exec;
var util = require("./utilities");
var webs = require("./webservices");

/* global variables */
// data directory
//var dataDir = './data/';
var egcDataDir = 'E:/jjc/WebSites/egcDataFiles';
var citizenDataRelativeDir = 'lasha/citizen observations';
var dataDir = egcDataDir + path.sep + citizenDataRelativeDir + path.sep;

// spatial reference
var sourceSrs = "EPSG:4326"; /* WGS84 in (Lat, Log) */
//var sourceSrs = "EPSG:900913";
//var targetSrs = "EPSG:900913"; /* Web Mercator, most used in web mapping */
var targetSrs = "EPSG:21417"; /* Beijing 1954 / Gauss-Kruger zone 17, for study area */

function saveCitizenData(request, response) {

	console.log("Request handler 'saveCitizenData' was called.");

	var data="";

	request.setEncoding('utf8');
	request.on('data',function(chunk){
		data += chunk;
	});

	request.on('end',function(){

        var json = JSON.parse(data);

        /* save GeoJson files */
        var polygonFn = dataDir + json["SightingsFilename"];
        util.saveGeoJsonFileSync(polygonFn, JSON.parse(json["SightingsGeoJSON"])); /* in WGS84*/

        var polylineFn = dataDir + json["RoutesFilename"];
        util.saveGeoJsonFileSync(polylineFn, JSON.parse(json["RoutesGeoJSON"])); /* in WGS84*/

        /* reproject and convert to shapefile in one step */
        /* use ogr2ogr functionalities */
        /*
        var outShpPolygon = polygonFn.replace('.geojson', '.shp');
        util.ogr2ogr_Reproject_ConvertGeoJson(polygonFn, sourceSrs, targetSrs, outShpPolygon);

        var outShpPolyline = polylineFn.replace('.geojson', '.shp');
        util.ogr2ogr_Reproject_ConvertGeoJson(polylineFn, sourceSrs, targetSrs, outShpPolyline);
        */

        /* reproject and convert to shapefile in one step */
        /* use ogre services @ http://ogre.adc4gis.com */
		
        var outShpPolyline = polylineFn.replace('.geojson', '.shp');
        //util.ogre_Reproject_ConvertGeoJson(polylineFn, sourceSrs, targetSrs, outShpPolyline);

        var outShpPolygon = polygonFn.replace('.geojson', '.shp');
        //util.ogre_Reproject_ConvertGeoJson(polygonFn, sourceSrs, targetSrs, outShpPolygon);
		
		var cmdr = 'ogr2ogr -s_srs ' + sourceSrs + ' -t_srs ' + targetSrs + ' -nlt LINESTRING -skipfailures "' + outShpPolyline + '" "' + polylineFn + '" OGRGeoJSON';
		var cmdp = 'ogr2ogr -s_srs ' + sourceSrs + ' -t_srs ' + targetSrs + ' -nlt POLYGON -skipfailures "' + outShpPolygon + '" "' + polygonFn + '" OGRGeoJSON';
        exec(cmdr, function (error, stdout, stderr) {
            if (error) console.error(stderr);
			
			console.log("log");
			console.log("FUNCTION CALLED: ogr2ogr of ROUTES");
			console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
	
			exec(cmdp, function (error, stdout, stderr) {
			   if (error) console.error(stderr);
			   
			   console.log("log");
			   console.log("FUNCTION CALLED: ogr2ogr of SIGHTINGS");
			   console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
			   
			   /*here's where things get ugly. callback hell!!*/
			   webs.mapping(outShpPolygon, outShpPolyline, response);
			});
		});

	});
}

/*
 * generate a habitat suitability map
*/
function mappingSuitability(request, response) {


}

exports.saveCitizenData = saveCitizenData;
exports.mappingSuitability = mappingSuitability;
