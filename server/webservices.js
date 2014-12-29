var soap = require('soap');
var exec = require('child_process').exec;
var path = require('path');

var dir = 'E:/jjc/WebSites/egcDataFiles/lasha/';

var ruleurl = 'http://localhost/WS_HabitatMapping/WS_RuleSetExtractorCitizenObservation/ws_RuleSetExtractorCitizenObservation.asmx?WSDL';
var poly = dir + 'citizen observations/PresencePolygons_Summer.shp';
var route = dir + 'citizen observations/Routes_summer.shp';
var rules = dir + 'relationships/rulesCitizen.xml';

var mappingurl = 'http://localhost/WS_HabitatMapping/WS_HabitatSuitabilityInference/wsHabitatSuitabilityInference.asmx?WSDL';
var lyrs = dir + 'monkey_elevation.asc#' +
           dir + 'monkey_slope_degree.asc#' +
           dir + 'monkey_aspect_category.asc#' +
           dir + 'monkey_dist2river.asc#' +
           dir + 'monkey_vegtype.asc#' +
           dir + 'monkey_dist2vilroad.asc';
var msrs = 'Terrain?1.0?DEM?1.0?scale?100#' +
           'Terrain?1.0?Slope Gradient?1.0?scale?5#' +
           'Terrain?1.0?Aspect?1.0?nominal?1#' +
           'Water Source?1.0?Distance to River?1.0?scale?50#' +
           'Shelter and Food?1.0?Vegetation Type?1.0?nominal?1#' +
           'Human Impact?1.0?Distance to Village or Road?1.0?scale?50';
var map = dir + 'suitability/suitability';

function mapping(polygonName, routeName, response){

	console.log("log");
    console.log("FUNCTION CALLED: mapping");
    console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
	
	generateRules(ruleurl, mappingurl, polygonName, routeName, map, response);
}

/*
 * webservice for extracting suitability-envrionment relationship from citizen observation
*/
function generateRules(rulewsdlUrl, mapwsdlUrl, polyShpName, routeShpName, mapName, response){
	console.log("log");
    console.log("FUNCTION CALLED: generateRules");
    console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
	
  var rulesName = rules;
  var args = {presencePolygons: polyShpName, routes: routeShpName, rulesetFn: rulesName};
  
  soap.createClient(rulewsdlUrl, function(err, client) {
      client.ruleSetExtractorForCitizenObservation(args, function(err, result) {
        if (err) {
			console.error(err);
		}
        // rule-based mapping, publish wms etc.
        generateMap(mapwsdlUrl, lyrs, msrs, rulesName, mapName, response);

      });
  });
}

/*
 * webservice for rule-based mapping
*/
function generateMap(wsdlUrl, evlayers, msrlevels, rulesName, suitName, response){

	console.log("log");
	console.log("FUNCTION CALLED: generateMap");
	console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
	
  var map = suitName;

  // rule-based mapping
  var args = {evlayers: lyrs,rulesetFn: rules, measurementLevel: msrs, habitatSuitabilityMap: map + '.asc'};
  soap.createClient(wsdlUrl, function(err, client) {
      client.habitatSuitabilityInference(args, function(err, result) {
          if (err) {
			console.error(err);
		  }
          // convert from .asc to .tif
          var cmd = 'gdal_translate -of GTiff -co "TILED=YES" ' + map + '.asc' + ' ' + map + '.tif';
          exec(cmd, function (error, stdout, stderr) {
            if (error) {
				console.error(stderr);
			}

            // reproject to wgs84
            var cmd = 'gdalwarp -t_srs "EPSG:4326" -srcnodata "-9999" -dstnodata "-9999" ' + map + '.tif' + ' ' + map + 'wgs.tif';
            exec(cmd, function (error, stdout, stderr) {
              if (error) {
				console.error(stderr);
			  }

              // publish geotif to geoserver
              var cmd = 'curl -v -u admin:geoserver -XPUT -H "Content-type: text/plain" ' +
                        '-d "file:///' + map + 'wgs.tif" ' +
                        'http://localhost:8080/geoserver/rest/workspaces/geows/coveragestores/maps/external.geotiff';
              exec(cmd, function (error, stdout, stderr) {
                if (error) {
					console.error(stderr);
				}
                // change the style
                var cmd = 'curl -v -u admin:geoserver -XPUT -H "Content-type: text/xml" ' +
                          '-d "<layer><defaultStyle><name>suitability100</name><workspace>geows</workspace></defaultStyle></layer>" ' +
                          'http://localhost:8080/geoserver/rest/layers/geows:' + path.basename(map) + 'wgs';
                exec(cmd, function (error, stdout, stderr) {
                  if (error) {
					console.error(stderr);
				  }
				  
                  console.log("log");
				  console.log("FINALLY: WRITE RESPONSE TO REQUEST....");
				  console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
	
				  response.setHeader("Access-Control-Allow-Origin", "*");
				  response.writeHead(200, {'Content-Type': 'text/plain'});
				  response.write("Thanks for your contribution. Check out the suitability map created using your data.<br>");
				  response.end();
				  
				  console.log("log");
				  console.log("DONE. GREAT JOB!!!");
				  console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
                });
              });
            });
    	});
      });
  });
}

exports.mapping = mapping;
