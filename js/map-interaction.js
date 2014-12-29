/*
 * Author: Guiming Zhang (guiming.zhang007@gmail.com)
 * Version: 0.1
 * Credit: based on OpenLayers js library (version 2.12)

 * Last updated on: August 05, 2014

*/

var map, studyAreaLyr, polygon, polyline;
var suitmap;
var deleteFeatureControl;
var curFeature;
var mustWithinLashaArea = true;

/*
 * This class inherits DrawFeature control. It adds a keyboard handler to manage ESCAPE
 * and DELETE key press.
 * SOURCE: OpenLayers Example @:
 * http://dev.openlayers.org/sandbox/sonxurxo/editfeature/examples/edit-feature.html
*/
OpenLayers.Control.DrawFeatureOpt = OpenLayers.Class(OpenLayers.Control.DrawFeature, {
	handlers: null,
	initialize: function(layer, handler, options) {
		OpenLayers.Control.DrawFeature.prototype.initialize.apply(this, [layer, handler, options]);
		// configure the keyboard handler
		var keyboardOptions = {
			keydown: this.handleKeypress
		};
		this.handlers = {
			keyboard: new OpenLayers.Handler.Keyboard(this, keyboardOptions)
		};
	},
	handleKeypress: function(evt) {
		var code = evt.keyCode;
		if (this.handler.active) {
			/*
			 * ESCAPE pressed. Remove second last vertix and finalize the drawing
			 */
			if (code === 27) {
				var index = this.handler.line.geometry.components.length - 2;
				this.handler.line.geometry.removeComponent(this.handler.line.geometry.components[index]);
				this.handler.finalize();
			}
			/*
			 * DELETE pressed. Remove third last vertix (actually the last drawn one)
			 * and redraw the feature
			 */
			if (code === 46) {
				var index = this.handler.line.geometry.components.length - 3;
				this.handler.line.geometry.removeComponent(this.handler.line.geometry.components[index]);
				this.handler.drawFeature();
			}
		}
		return true;
	},
	activate: function() {
		return this.handlers.keyboard.activate() &&
			OpenLayers.Control.DrawFeature.prototype.activate.apply(this, arguments);
	},
	deactivate: function() {
		var deactivated = false;
		// the return from the controls is unimportant in this case
		if(OpenLayers.Control.DrawFeature.prototype.deactivate.apply(this, arguments)) {
			this.handlers.keyboard.deactivate();
			deactivated = true;
		}
		return deactivated;
	},

	CLASS_NAME: "OpenLayers.Control.DrawFeatureOpt"
});

function initMap() {

	//dialog = document.getElementById("dialog_confirm");
	//dialog.style.display="none";

	//----------------------------------------------------------------------------
	// map obj
	//----------------------------------------------------------------------------
	// focus
	var center = new OpenLayers.LonLat(99.24968, 26.3237055); // Mt. Lasha
	// zoom extent
	var deltaX = 0.08;
	var deltaY = 0.05;
	var extent = new OpenLayers.Bounds(99.24968 - deltaX, 26.3237055 - deltaY,
									   99.24968 + deltaX, 26.3237055 + deltaY);
	//set up projections
	// World Geodetic System 1984 projection
	var WGS84 = new OpenLayers.Projection("EPSG:4326");
	// WGS84 Google Mercator projection
	var WGS84_google_mercator = new OpenLayers.Projection("EPSG:900913");

	// map
	map = new OpenLayers.Map("map", {
		allOverlays: false,
		projection: WGS84_google_mercator,
		displayProjection: WGS84
	});


	//----------------------------------------------------------------------------
	// basemaps
	//----------------------------------------------------------------------------
	// base map from osgeo
	var wms = new OpenLayers.Layer.WMS( "OpenLayers WMS",
		"http://vmap0.tiles.osgeo.org/wms/vmap0?",
		{layers: 'basic',

		"tileOptions": {"crossOriginKeyword": null}
	});
  
	
	// base map from google
	var gsat = new OpenLayers.Layer.Google(
		"Google Satellite",
		{type: google.maps.MapTypeId.SATELLITE, numZoomLevels: 22}
	);

	var gphy = new OpenLayers.Layer.Google(
		"Google Physical",
		{type: google.maps.MapTypeId.TERRAIN, visibility: false}
	);
	var gmap = new OpenLayers.Layer.Google(
		"Google Streets", // the default
		{numZoomLevels: 20, visibility: false}
	);
	var ghyb = new OpenLayers.Layer.Google(
		"Google Hybrid",
		{type: google.maps.MapTypeId.HYBRID, numZoomLevels: 22, visibility: false}
	);

	// setup suitability map layer
	var smap = new OpenLayers.Layer.WMS(
		"Base Suitability Map", "http://localhost:8080/geoserver/geows/wms",
		{
			"LAYERS": 'geows:suitabilitymap',
			"STYLES": '',
			transparent: true,
			format: 'image/png'
		},
		{
		   singleTile: false,
		   ratio: 1,
		   isBaseLayer: false,
		   yx : {'EPSG:4326' : true}
		}
	);

	// might want the real data polygon/route layers


	if(mustWithinLashaArea){
		// control zoom level for google maps
		map.events.register('zoomend', this, function (event) {
			var x = map.getZoom();

			if( x > 16)
			{
				map.zoomTo(16);
				//map.refresh();
			}
			if( x < 13)
			{
				map.zoomTo(13);
			}
		});
	}



	//----------------------------------------------------------------------------
	// overlay vecter layers
	//----------------------------------------------------------------------------
	// vector layer to hold polygons
	polygon = new OpenLayers.Layer.Vector("Sightings", {

		/* examine whether the drawn polygon is within study area */
		preFeatureInsert: function(feature){ }
	});

	// vector layer to hold polylines
	polyline = new OpenLayers.Layer.Vector("Routes", {

		/* examine whether the drawn polygon is within study area */
		preFeatureInsert: function(feature){ }
	});

	if(mustWithinLashaArea){
		// study area
		studyAreaLyr = new OpenLayers.Layer.Vector("Mt. Lasha");
		studyAreaLyr.addFeatures(new OpenLayers.Format.GeoJSON().read(studyArea));
		studyAreaLyr.features[0].style = {
			//fillColor: "#8EBFEA",
			fillColor: "#21610B",
			fillOpacity: 0.05,
			strokeColor: "red",
			strokeOpacity: 0.4
		};
		map.addLayer(studyAreaLyr);
		var studyAreaPolygon = studyAreaLyr.features[0];
	}

	/*
	var studyareaFeat = new OpenLayers.Format.GeoJSON().read(studyArea);
	var transformedFeatures = [];
	for(var i= 0; i < studyareaFeat.length; i++){
	  transformedFeatures.push(studyareaFeat[i].geometry.transform(
		 new OpenLayers.Projection("EPSG:4326"),
		 map.getProjectionObject()
	  ));
	}
    studyAreaLyr.addFeatures(transformedFeatures);
	*/


	//----------------------------------------------------------------------------
	// add layers to map, set map center and zoom level (for NON-GOOGLE MAPS ONLY)
	//----------------------------------------------------------------------------
	/*
	map.addLayers([wms, polyline, polygon]);
	map.setCenter(new OpenLayers.LonLat(99.24968, 26.3237055), 8);
	*/

	//----------------------------------------------------------------------------
	// add layers to map, set map center and zoom level (for GOOGLE MAPS ONLY)
	//----------------------------------------------------------------------------
	// add layers to map
	//  Google.v3 uses EPSG:900913 as projection, so we have to
    //   transform our coordinates
	map.addLayers([polyline, polygon, smap, ghyb, gphy, gmap]);
	smap.setVisibility(false);

    map.setCenter(new OpenLayers.LonLat(99.24968, 26.3237055).transform(
        new OpenLayers.Projection("EPSG:4326"),
        map.getProjectionObject()
    ), 14);

	if(mustWithinLashaArea){
		extent = extent.transform(new OpenLayers.Projection("EPSG:4326"), map.getProjection());
		map.setOptions({restrictedExtent: extent});
	}
	//map.zoomToExtent(extent);

	//------------------------------------------------------------------------------
	// basic controls
	//------------------------------------------------------------------------------
	// a LayerSwitcher control
	map.addControl(new OpenLayers.Control.LayerSwitcher());

	// a navigation control
	var panControl = new OpenLayers.Control.Navigation({
		clickout: false,
		toggle: false,
		title: "Pan",
		displayClass: "olControlNavigation"
	});

	// scale bar
	var scalebar = new OpenLayers.Control.ScaleLine({bottomOutUnits: ''});
    map.addControl(scalebar);

	//---------------------------------------------------------------------------------
	// control for select feature
	// modifyPolygonControl and modifyPolylineControl build on it)
	//----------------------------------------------------------------------------------
	var options = {
		hover: true,
		clickout: false,
		toggle: false,
		multiple: false,
		onBeforeSelect: function(feature){
			//alert("SELECT: before select a feature");
		},
		onSelect: function(feature){
			// show popup
			showPopup(feature);
		},
		onUnselect: function(feature)	{
			// destroy popup
			destroyPopup(feature);
		}
	};
	var select = new OpenLayers.Control.SelectFeature([polyline, polygon], options);
	map.addControl(select);
	select.activate();


	//------------------------------------------------------------------------------
	// control for drawing / modifying polygon
	//-------------------------------------------------------------------------------
	var drawPolygonControl = new OpenLayers.Control.DrawFeatureOpt(
		polygon,
		OpenLayers.Handler.Polygon,
		{
			title: "Draw sightings",
			displayClass: "olControlDrawPolygon"
		}
	);

	// once drawPolygonControl is activated, selectControl should be deactivated
	drawPolygonControl.events.register("activate", this, function(e){
		if(select.active){
			select.deactivate();
		}
		// prompt for user info.
		if(!userInfo.updated){

			openDialogUserInfo();
		}

	});
	// similarly, once drawPolygonControl is deactivated, selectControl should be activated
	drawPolygonControl.events.register("deactivate", this, function(e){
		if(!select.active){
			select.activate();
		}
	});

	// After adding a polygon, deactivate drawPolygonControl
	drawPolygonControl.events.register("featureadded", this, function(e) {

		drawPolygonControl.deactivate();

		curFeature = e.feature;

		// impose the condition that polygon must within Mt. Lasha area
		if(mustWithinLashaArea){
			// within Lasha area
			if(featureWithinPolygon(e.feature, studyAreaPolygon)){
				openDialogSightingInfo();
			}
			else{
				var warningText = "Sorry, we cannot accept this sighting as valid because it is not within Mt. Lasha area.";
				openDialogMessage("Warning", warningText);
			}
		}
		// not impose the conditon
		else{
			/* here comes out a dialog asking for info. on wildlife sightings */
			openDialogSightingInfo();
		}
	});

	// control for modifying polygon
	var modifyPolygonControl = new OpenLayers.Control.ModifyFeature(polygon, {
		clickout: true,
		toggle: true,
		hover: false,
		multiple: false,
		deleteCodes: [46, 68, 27],
		title: "Modify sightings",
		displayClass: "olControlModify",
		mode: OpenLayers.Control.ModifyFeature.RESHAPE,
		createVertices: true,

		beforeSelectFeature: function(feature){
			//alert("MODIFY: before select a feature");
		},

		displayClass: "olControlModifyPolygon"
		// according to this, we can set icon for it in css
	});

	// once modifyPolygonControl is activated, selectControl should be deactivated
	modifyPolygonControl.events.register("activate", this, function(e){
			if(select.active){
				select.deactivate();
			}
	});
	// similarly, once modifyPolygonControl is deactivated, selectControl should be activated
	modifyPolygonControl.events.register("deactivate", this, function(e){
			if(!select.active){
				select.activate();
			}
	});

	// events on polygons
	polygon.events.on({
		"beforefeaturemodified": null,
		"featuremodified": null,
		"afterfeaturemodified": function(e) {
			//alertify.success('A sighting polygon was modified.');
			console.log('A sighting polygon was modified.');
		},
		"vertexmodified": null,
		"sketchmodified": null,
		"sketchstarted": null,
		"sketchcomplete": null,
		"featureselected": null,
		"featureunselected":null,
	});

	//---------------------------------------------------------------------------------
	// control for drawing / mofifying polyline
	//----------------------------------------------------------------------------------
	var drawPolylineControl = new OpenLayers.Control.DrawFeatureOpt(
		polyline,
		OpenLayers.Handler.Path,
		{
			title: "Draw routes",
			displayClass: "olControlDrawPolyline"
		}
	);

	// once drawPolylineControl is activated, selectControl should be deactivated
	drawPolylineControl.events.register("activate", this, function(e){
		if(select.active){
			select.deactivate();
		}
		// prompt for user info.
		if(!userInfo.updated){

			openDialogUserInfo();
		}
	});
	// similarly, once drawPolylineControl is deactivated, selectControl should be activated
	drawPolylineControl.events.register("deactivate", this, function(e){
		if(!select.active){
			select.activate();
		}
	});

	//After adding a feature, deactivate drawPolylineControl
	drawPolylineControl.events.register("featureadded", this, function(e) {

		drawPolylineControl.deactivate();

		curFeature = e.feature;

		// impose the condition that routes must within Mt. Lasha area
		if(mustWithinLashaArea){
			// within Lasha area
			if(featureWithinPolygon(e.feature, studyAreaPolygon)){
				openDialogRouteInfo();
			}
			else{
				var warningText = "Sorry, we cannot accept this route as valid because it is not within Mt. Lasha area.";
				openDialogMessage("Warning", warningText);
			}
		}
		// not impose the conditon
		else{
			/* here comes out a dialog asking for info. on wildlife sightings */
			openDialogRouteInfo();
		}
	});

	// control for modifying polygon
	var modifyPolylineControl = new OpenLayers.Control.ModifyFeature(polyline, {
		hover: false,
		clickout: true,
		toggle: true,
		multiple: false,
		deleteCodes: [46, 68, 27],
		title: "Modify routes",
		displayClass: "olControlModify",
		mode: OpenLayers.Control.ModifyFeature.RESHAPE,
		createVertices: true,

		beforeSelectFeature: function(feature){
			//alert("MODIFY: before select a feature");
		},

		displayClass: "olControlModifyPolyline"
	});

	// once modifyPolylineControl is activated, selectControl should be deactivated
	modifyPolylineControl.events.register("activate", this, function(e){
			if(select.active){
				select.deactivate();
				//console.log('SELECT CONTROL deactivated.')
			}
	});
	// similarly, once modifyPolylineControl is deactivated, selectControl should be activated
	modifyPolylineControl.events.register("deactivate", this, function(e){
			if(!select.active){
				select.activate();
				//console.log('SELECT CONTROL activated.')
			}
	});

	// events on polyline
	polyline.events.on({
		"beforefeaturemodified": null,
		"featuremodified": null,
		"afterfeaturemodified": function(e) {
			//alertify.success('A activity route was modified.');
			console.log('A activity route was modified.');
		},
		"vertexmodified": null,
		"sketchmodified": null,
		"sketchstarted": null,
		"sketchcomplete": function(){
			//openDialogRouteInfo();
		},
		"featureselected": null,
		"featureunselected":null
	});

	//---------------------------------------------------------------------------------------
	// control for deleting polygon / polyline
	//----------------------------------------------------------------------------------------
	deleteFeatureControl = new OpenLayers.Control.SelectFeature([polygon, polyline], {
		hover: false,
		clickout: false,
		toggle: false,
		title: "Delete",
		displayClass: "olControlDelete",
		onSelect: function(e){

			curFeature = e;

			var warningText = "Are you sure you want to delete it?";

			openDialogConfirm("Warning", warningText);
		}
	});

	// once deleteFeatureControl is activated, selectControl should be deactivated
	deleteFeatureControl.events.register("activate", this, function(e){
			if(select.active){
				select.deactivate();
				//console.log('SELECT CONTROL deactivated.')
			}
	});
	// similarly, once deleteFeatureControl is deactivated, selectControl should be activated
	deleteFeatureControl.events.register("deactivate", this, function(e){
			if(!select.active){
				select.activate();
				//console.log('SELECT CONTROL activated.')
			}
	});

	//---------------------------------------------------------------------------------------
	// control for saving polygon / polyline
	//----------------------------------------------------------------------------------------
	var saveControl = new OpenLayers.Control.Button({
        title: "Make a map!",
        trigger: function() {

            if(modifyPolygonControl.feature) {
                modifyPolygonControl.unselectFeature(feature);
            }
						if(modifyPolylineControl.feature) {
                modifyPolylineControl.unselectFeature(feature);
            }

					// if there are any drawings, asking for file name etc.
					if(polyline.features.length > 0 && polygon.features.length > 0){

						//openDialogSubmit();

						/* set default info. without open the dialog to ask for them */
						var date = new Date();
						var timestamp = date.getTime();

						dataSaveInfo.sightingsFn = 'sightings' + timestamp + '.geojson';
						dataSaveInfo.routesFn = 'routes' + timestamp + '.geojson';
						dataSaveInfo.egcusrname = '';
						dataSaveInfo.saveLocalCopy = false;
						dataSaveInfo.clearAfterSave = false;
						dataSaveInfo.updated = true;
						// submit data to server
						saveDrawings();
						//openDialogProgress();
      		}
				// no drawings
				else{
					openDialogMessage("Message", "No enough data. At least one wildlife sighting AND one route are required.");
				}
      },
      displayClass: "olControlSaveFeatures"
    });

	//---------------------------------------------------------------------------------------
	// control for showing help info.
	//----------------------------------------------------------------------------------------
	var helpControl = new OpenLayers.Control.Button({
        title: "Help",
        trigger: function() {

			openDialogHelp();
        },
        displayClass: "olControlHelp"
    });

	//----------------------------------------------------------------------------------------
	// add controls to map
	//----------------------------------------------------------------------------------------
	var panel = new OpenLayers.Control.Panel({
		displayClass: 'olControlEditingToolbar'
	});

	panel.addControls([saveControl, deleteFeatureControl, modifyPolylineControl,
					   drawPolylineControl, modifyPolygonControl,
					   drawPolygonControl, panControl, helpControl]);

	map.addControls([
		panel, modifyPolygonControl, modifyPolylineControl
		//panel
	]);

	//map.addControl(new OpenLayers.Control.ScaleBar());

	//disableDraging();
}

function disableDraging(){

	for (var i = 0; i< map.controls.length; i++) {
		if (map.controls[i].displayClass ==
								"olControlNavigation") {
			map.controls[i].deactivate();
		}
	}
}

function enableDraging(){

	for (var i = 0; i< map.controls.length; i++) {
		if (map.controls[i].displayClass ==
								"olControlNavigation") {
			map.controls[i].activate();
		}
	}
}

function setPolyAttributes(userInputs, feature){

	if(feature.geometry.CLASS_NAME == "OpenLayers.Geometry.LineString"){
		/* set info. to a route */
		feature.attributes["date"] = userInputs.date;
		feature.attributes["purpose"] = userInputs.purpose;
		feature.attributes["weather"] = userInputs.weather;
		feature.attributes["visibility"] = userInputs.visibility;
		feature.attributes["frequency"] = userInputs.frequency;
		feature.attributes["comments"] = userInputs.comments;

		// --------two default fields -----------
		if(userInputs.frequency == 0){
			feature.attributes["Weigh"] = "1";
		}
		else if(userInputs.frequency != 0){
			feature.attributes["Weigh"] = userInputs.frequency;
		}
		if(userInputs.frequency == 0){
			feature.attributes["R500"] = "500";
		}
		else if(userInputs.frequency != 0){
			feature.attributes["R500"] = userInputs.visibility;
		}

		// ---------------------------------------

		feature.attributes["name"] = userInfo.name;
		feature.attributes["age"] = userInfo.age;
		feature.attributes["occupation"] = userInfo.occupation;
		feature.attributes["email"] = userInfo.email;
	}
	else{
		/* set info. to a wildlife sighting */
		feature.attributes["comname"] = userInputs.comname;
		feature.attributes["sciname"] = userInputs.sciname;
		feature.attributes["date"] = userInputs.date;
		feature.attributes["number"] = userInputs.number;
		feature.attributes["comments"] = userInputs.comments;

		feature.attributes["name"] = userInfo.name;
		feature.attributes["age"] = userInfo.age;
		feature.attributes["occupation"] = userInfo.occupation;
		feature.attributes["email"] = userInfo.email;
	}
}

function showPopup(feature){
	if(feature.geometry.CLASS_NAME == "OpenLayers.Geometry.LineString"){
		/* popup for a route */
		// where does this popup pops up
		var index = Math.floor(feature.geometry.components.length / 2);
		var centerLon = feature.geometry.components[index].x;
		var centerLat = feature.geometry.components[index].y;
		var center = new OpenLayers.LonLat(centerLon, centerLat);
		// what contents will be shown
		var contentHtml = "<div class='popup'>" +
			"<b><i>Activity route information</i></b>"
			+ "<ul>"
			+ "<li><b>Date</b>: " + feature.attributes.date + "</li>"
			+ "<li><b>Purpose</b>: " + feature.attributes.purpose + "</li>"
			+ "<li><b>Weather</b>: " + feature.attributes.weather + "</li>"
			+ "<li><b>Visibility</b>: " + feature.attributes.visibility + " meters</li>"
			+ "<li><b>Frequency</b>: " + feature.attributes.frequency +" time(s) per month</li>"
			+ "<li><b>Comments</b>: " + feature.attributes.comments +"</li>"
			+ "</ul><ul>"
			+ "<li><b>Observer</b>: " + feature.attributes.name + "</li>"
			+ "<li><b>Age</b>: " + feature.attributes.age +"</li>"
			+ "<li><b>Occupation</b>: " + feature.attributes.occupation +"</li>"
			+ "<li><b>Email</b>: " + feature.attributes.email +"</li>"
			+ "</ul>"
			+ "</div>";
		// create the popup
		var popup = new OpenLayers.Popup.CSSFramedCloud("popup", center, null,
			contentHtml, null, true);
		// bind popup to to feature, add it to map
		feature.popup = popup;
		map.addPopup(popup);
	}
	else{
		/* popup for a sighting */
		// where does this popup pops up
		var polybound = feature.geometry.bounds;
		var centerLon = (polybound.left + polybound.right) / 2;
		var centerLat = (polybound.bottom + polybound.top) / 2;
		var center = new OpenLayers.LonLat(centerLon, centerLat);
		// what contents will be shown
		var contentHtml = "<div class='popup'>" +
			"<b><i>Wildlife sighting information</i></b>"
			+ "<ul>"
			+ "<li><b>Species</b>: " + feature.attributes.comname +"</li>"
			+ "<li><b>Scientific name</b>: <i>" + feature.attributes.sciname +"</i></li>"
			+ "<li><b>Date of sighting</b>: " + feature.attributes.date + "</li>"
			+ "<li><b>Number of wildlife</b>: " + feature.attributes.number + "</li>"
			+ "<li><b>Comments</b>: " + feature.attributes.comments +"</li>"
			+ "</ul><ul>"
			+ "<li><b>Observer</b>: " + feature.attributes.name + "</li>"
			+ "<li><b>Age:</b> " + feature.attributes.age +"</li>"
			+ "<li><b>Occupation:</b> " + feature.attributes.occupation +"</li>"
			+ "<li><b>Email:</b> " + feature.attributes.email +"</li>"
			+ "</ul>"
			+ "</div>";
		// create the popup
		var popup = new OpenLayers.Popup.CSSFramedCloud("popup", center, null,
			contentHtml, null, true);
		// bind popup to to feature, add it to map
		feature.popup = popup;
		map.addPopup(popup);
	}
}

function destroyPopup(feature){
	map.removePopup(feature.popup);
	feature.popup.destroy();
	feature.popup = null;
}

/* test wether featureA is within polygonFeature
 * that is, all points of feature are within polygonFeature
*/
function featureWithinPolygon(feature, polygonFeature){

	var isWithin = true;
	var points;
	var stpolygon = polygonFeature.geometry;

	if(feature.geometry.CLASS_NAME == "OpenLayers.Geometry.Polygon"){

		points = feature.geometry.components[0].components;
	}

	else{
		points = feature.geometry.components;
	}

	for(var i = 0; i < points.length; i++){

		isWithin = isWithin && stpolygon.containsPoint(points[i]);
	}

	return isWithin;

}
