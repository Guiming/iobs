var serverUrl = "http://localhost:3030/save";
//var serverUrl = "http://192.168.6.56:3030/save";
var serverResponse;
var serverSuccess;

var polygonGeoJSON;
var polylineGeoJSON;


//----------------------------------------------------------------------------------------
// function for saving drawings to server
//----------------------------------------------------------------------------------------
function saveDrawings(){

	// open up a progress bar (indicative, not accurate)
	openDialogProgress();

	// get data extent
	var sightingsExt, routesExt;


	var extent = polygon.getDataExtent().transform(map.getProjection(), new OpenLayers.Projection("EPSG:4326"));
	sightingsExt = JSON.stringify(extent);

	extent = polyline.getDataExtent().transform(map.getProjection(), new OpenLayers.Projection("EPSG:4326"));
	routesExt = JSON.stringify(extent);

	// data json
	var geoJsonWriter = new OpenLayers.Format.GeoJSON({
  		'internalProjection': new OpenLayers.Projection("EPSG:900913"),
  		'externalProjection': new OpenLayers.Projection("EPSG:4326")
	});

	var prettyJson = false;
	polygonGeoJSON = geoJsonWriter.write(polygon.features, prettyJson);
	polylineGeoJSON = geoJsonWriter.write(polyline.features, prettyJson);

	/*
	console.log('GeoJson representation for sighting polygons:');
	console.log(polygonGeoJSON);

	console.log('GeoJson representation for activity routes:');
	console.log(polylineGeoJSON);
	*/

	var sightingsFn = dataSaveInfo.sightingsFn;
	var routesFn = dataSaveInfo.routesFn;
	var egcEmail = dataSaveInfo.egcusrname;

	var params = {
		SightingsFilename: sightingsFn,
		SightingsGeoJSON: polygonGeoJSON,
		SightingsExtent: sightingsExt,
		RoutesFilename: routesFn,
		RoutesGeoJSON: polylineGeoJSON,
		RoutesExtent: routesExt,
		EGCUsername: egcEmail,
		isLasha: false
	};

	if(mustWithinLashaArea){
		params.isLasha = true;
	}

	/* HTTP POST request to save drawings on server */
	var xmlhttp;
	if(window.XMLHttpRequest){
		// code for IE7+, Firefox, Chrome, Opera, Safari
	  	xmlhttp=new XMLHttpRequest();
	  }
	else{
		// code for IE6, IE5
	  	xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
	  }
	xmlhttp.onreadystatechange=function(){
		if (xmlhttp.readyState==4){
			if(xmlhttp.status==200){
				// data were successfully processed and saved on server
				serverResponse = xmlhttp.responseText;

				if(dataSaveInfo.clearAfterSave){
					serverResponse = serverResponse + " Your drawings will be cleared.";
				}

				openDialogMessage("Server response", serverResponse);
				serverSuccess = true;

				//alertify.success(serverResponse);
				console.log(serverResponse);
				addSuitabilityMap();
			}
			else{
				// error happened while saving data on server
				var errmsg = "Some thing went wrong. Please try again later.";
				openDialogMessage("Server response", errmsg);
				serverSuccess = false;

				//alertify.error(errmsg);
				console.log(errmsg);
			}
		}
	}
	try{
		xmlhttp.open("POST", serverUrl, true);
		xmlhttp.setRequestHeader("Content-type","text/plain");
		xmlhttp.send(JSON.stringify(params));
	}
	catch(e){

		// error happened while saving data on server
		var errmsg = e.toString();
		openDialogMessage("Error message", errmsg);
		serverSuccess = false;

		//alertify.error(errmsg);
		console.log(errmsg);
	}
}

function addSuitabilityMap() {

		// setup suitability map layer
		if(map.getLayersByName("Suitability").length != 0){
			suitmap.setVisibility(false);
			map.removeLayer(suitmap);

		}

		if(suitmap != null){
			suitmap.destroy();
		}

		suitmap = new OpenLayers.Layer.WMS(
			"Predicted Suitability Map", "http://localhost:8080/geoserver/geows/wms",
			{
				"LAYERS": 'geows:suitabilitywgs',
				"STYLES": '',
				transparent: true,
				format: 'image/png'
			},
			{
				//singleTile: true,
				//ratio: 1,
				isBaseLayer: false,
				yx : {'EPSG:4326' : true}
			}
		);

		map.addLayer(suitmap);

		/*this redraw is critical to update browser side cache*/
		suitmap.redraw(true);
}
