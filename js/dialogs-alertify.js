function alertify_reset () {
    alertify.set({
        labels : {
            ok     : "Ok",
            cancel : "Cancel"
        },
        delay : 5000,
        buttonReverse : false,
        buttonFocus   : "ok"
    });
}

function alertify_reset_next () {
    alertify.set({
        labels : {
            ok     : "Next",
            cancel : "Get back to map"
        },
        delay : 5000,
        buttonReverse : false,
        buttonFocus   : "ok"
    });
}

function alertify_reset_ok () {
    alertify.set({
        labels : {
            ok     : "Ok",
            cancel : "Get back to map"
        },
        delay : 5000,
        buttonReverse : false,
        buttonFocus   : "ok"
    });
}

function alertify_reset_confirm () {
    alertify.set({
        labels : {
            ok     : "Submit",
            cancel : "Get back to map"
        },
        delay : 5000,
        buttonReverse : false,
        buttonFocus   : "ok"
    });
}

function onclickSave_alertify(){
						
    // prompt the user a dialog
    var message1 = "Please input a file name for wildlife sightings:";
    var message2 = "Please input a file name for activity routes:";

    var defaultValue1 = "sightings.geojson";	
    var defaultValue2 = "routes.geojson";

    // ask for data file name for wildlife sightings
    alertify_reset_next();
    alertify.prompt(message1, function (e, input) {
        if (e) {
            geojsonFilenames["sightingsFn"] = input;
            alertify.success("You will name wildlife sightings data as: " + input);

            // ask for data file name for activity routes
            //------------------------------------------------------
            alertify_reset_next();
            alertify.prompt(message2, function (e, input) {
                if (e) {
                    geojsonFilenames["routesFn"] = input;
                    alertify.success("You will name activity routes data as: " + input);

                    // confirmation and redirect info.
                    //--------------------------------------------------------------------
                    alertify_reset_confirm();
                    alertify.confirm("Are you sure to submit your citizen data? ", function (e) {
                        if (e) {
                            alertify.success("Submit your data.");
                            
                            saveDrawings();
                            
                            //some response from server.
                            //-------------------------------------------------------------
                            setTimeout(function () { 
                                alertify_reset();
                                alertify.alert(serverResponse); // serverResponse is a global variable       
                                
                                // if saved successfully, clear drawings
                                var success = true;
                                if(success){
                                    polygon.removeAllFeatures();
                                    polyline.removeAllFeatures();
                                }

                            }, 3000);
                            //-------------------------------------------------------------
                        } else {
                            alertify.error("Get back to map and continue drawing.");
                        }
                    });

                    //--------------------------------------------------------------------

                } else {
                    alertify.error("Get back to map and continue drawing.");
                }
            }, defaultValue2);
            //-------------------------------------------------------

        } else {
            alertify.error("Get back to map and continue drawing.");
        }
    }, defaultValue1);
}

