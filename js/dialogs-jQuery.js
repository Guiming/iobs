/* based on jQuery modal form demo
 * @ http://jqueryui.com/resources/demos/dialog/modal-form.html
*/

/*
 * global variables
*/

var userInfo = {
  name: "",
  age: "",
  occupation: "",
  email: "",
  updated: ""
};

var dataSaveInfo = {
  sightingsFn: "",
  routesFn: "",
  egcusrname: "",
  saveLocalCopy: "",
  updated: "",
  clearAfterSave: ""
};


var sightingInfo = {
  comname: "",
  sciname: "",
  date: "",
  number: "",
  comments: ""
};
var routeInfo = {
  date: "",
  weather: "",
  visibility: "",
  frequency: "",
  purpose: "",
  comments: ""
};

var dialog, tips;
var dialogWidth = 450;
var dialogHeight = 400;
var showEffect = "fade";
var showDuration = 500;
var hideEffect = "drop";
var hideDuration = 500;



function initDialogs(){

  /*
  $("#btnUserInfo").button().on("click", openDialogUserInfo);
  $("#btnSightingInfo").button().on("click", openDialogSightingInfo);
  $("#btnRouteInfo").button().on("click", openDialogRouteInfo);

  $("#btnDownload").button().on("click", function(){
    saveLocalCopy("my.geojson","test save a local copy.");
  });
  */
}

function openDialogUserInfo(){

    // first create the <div> for dialog
    var dialogId = 'dialog-form-user';
    var dialogDiv = document.createElement('div');
    dialogDiv.setAttribute('id', dialogId);
    //dialogDiv.setAttribute('class', 'jDialog');
    dialogDiv.setAttribute('title', 'Contributor information');

    document.body.appendChild(dialogDiv);

    // design form contents
    var htmlUser = '<p class="description">Please provide some basic information about you on a <i>VOLUNTARY</i> basis.</p>'
                    + '<p class="validateTips"><i>ALL</i> fields are <i>NOT</i> mandatory. But the format of your input, if any, will be checked.</p>'
                    + '<form><fieldset>'
                    + '<label for="name">Name</label>'
                    + '<input type="text" name="name" id="name" value="Anonymous" class="text ui-widget-content ui-corner-all">'
                    + '<label for="age">Age</label>'
                    + '<input type="number" name="age" id="age" value="0"  min="0" max="120" class="text ui-widget-content ui-corner-all">'
                    + '<label for="occupation">Occupation</label>'
                    + '<input type="text" name="occupation" id="occupation" value="Unknown" class="text ui-widget-content ui-corner-all">'
                    + '<label for="email">Email</label>'
                    + '<input type="email" name="email" id="email" value="Unknown" class="text ui-widget-content ui-corner-all">'
                    + '</fieldset></form>';

    dialogDiv.innerHTML = htmlUser;


    // initialize dialog
    tips = $(".validateTips");

    dialog = $("#" + dialogId).dialog({
      autoOpen: false,
      height: 500,
      width: dialogHeight,
      modal: true,
      resizable: false,
      buttons: {
        "Remember me": function() {
          updateInfoUsr();
          //console.log(JSON.stringify(userInfo));
        },
        "Stay anonymous": function() {

          // if user click cancel, set some defautl values for user info.
          setDefaultUserInfo();

          dialog.dialog("close");
        }
      },
      close: function() {
        dialogDiv.parentNode.removeChild(dialogDiv);
      },
      /* cool animation */
      show: {
        effect: showEffect,
        duration: showDuration
      },
      hide: {
        effect: hideEffect,
        duration: hideDuration
      }
  });

  // open dialog
  dialog.dialog("open");
}

function updateInfoUsr(){

  var valid = true;
  var name = $("#name");
  var age = $("#age");
  var occupation = $("#occupation");
  var email = $("#email");

  var allFields = $( [] ).add(name).add(age).add(occupation).add(email);

  var emailRegex = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  allFields.removeClass( "ui-state-error" );

  valid = valid && checkLength( name, "name", 0, 16 );
  valid = valid && checkLength( age, "age", 0, 3 );
  valid = valid && checkLength( occupation, "student", 0, 16 );
  valid = valid && checkLength( email, "email", 0, 80 );

  if(name.val().length>0){
    valid = valid && checkRegexp( name, /^[a-z]([a-z\s])+$/i, "Name may consist of a-z, spaces and must begin with a letter." );
  }

  valid = valid && checkNumberRange( age, "age", 0, 120);

  if(occupation.val().length>0){
    valid = valid && checkRegexp( occupation, /^[a-z]([a-z\s])+$/i, "Occupation may consist of a-z, spaces and must begin with a letter." );
  }

  if(email.val().length>0){
    valid = valid && checkRegexp( email, emailRegex, "eg. example@example.com" );
  }


  if ( valid ) {
    userInfo.name = name.val();
    userInfo.age = age.val();
    userInfo.occupation = occupation.val();
    userInfo.email = email.val();
    userInfo.updated = true;

    dialog.dialog( "close" );
  }
  return valid;
}

function openDialogSubmit(){

    // first create the <div> for dialog
    var dialogId = 'dialog-form-submit';
    var dialogDiv = document.createElement('div');
    dialogDiv.setAttribute('id', dialogId);
    dialogDiv.setAttribute('title', 'Submit data');

    document.body.appendChild(dialogDiv);

    // design form contents
    var htmlSubmit = '<p class="description">Now you have completed drawing wildlife sightings and activity routes on map. This dialog will walk you through <i>SAVING</i> the data on our <i>SERVER</i>.</p>'
                    + '<p class="validateTips"><i>ALL</i> fields are <i>REQUIRED</i> and have <i>DEFAULT</i> values. But the format of your input, if any, will be checked.</p>'
                    + '<form><fieldset>'
                    + '<label for="nameSightings">Sightings filename</label>'
                    + '<input type="text" name="nameSightings" id="nameSightings" value="monkey sightings.geojson" class="text ui-widget-content ui-corner-all">'
                    + '<label for="nameRoutes">Routes filename</label>'
                    + '<input type="text" name="nameRoutes" id="nameRoutes" value="activity routes.geojson" class="text ui-widget-content ui-corner-all">'
                    + '<label for="email">EGC username (required <b>if</b> want to update your EGC data list)</label>'
                    + '<input type="email" name="email" id="email" value="EGC username, or leave it blank" class="text ui-widget-content ui-corner-all">'
                    + '<label for="saveLocal"  style="display:block;">Save a local copy</label>'
                    + '<input type="radio" id="radioYes" name="saveLocal" style="display:inline;">Yes'
                    + '<input type="radio" id="radioNo" name="saveLocal" checked style="display:inline;">No'
                    + '<br><br><label for="clearDrawing" style="display:block;">Clear drawing after saving</label>'
                    + '<input type="radio" id="clearYes" name="clearDrawing" style="display:inline;">Yes'
                    + '<input type="radio" id="clearNo" name="clearDrawing" checked style="display:inline;">No'
                    + '</fieldset></form>';

    dialogDiv.innerHTML = htmlSubmit;


    // initialize dialog
    tips = $(".validateTips");


    dialog = $("#" + dialogId).dialog({
      autoOpen: false,
      height: 500,
      width: dialogWidth,
      modal: true,
      resizable: false,
      buttons: {
        "Submit": function() {
          updateInfoSubmit();
          //console.log(JSON.stringify(dataSaveInfo));
        },
        "Cancel": function() {
          dialog.dialog("close");
        }
      },
      close: function() {
        dialogDiv.parentNode.removeChild(dialogDiv);
      },
      /* cool animation */
      show: {
        effect: showEffect,
        duration: showDuration
      },
      hide: {
        effect: hideEffect,
        duration: hideDuration
      }
  });

  // open dialog
  dialog.dialog("open");
}

function updateInfoSubmit(){

    var valid = true;
    var nameSightings = $("#nameSightings");
    var nameRoutes = $("#nameRoutes");
    var email = $("#email");

    var allFields = $( [] ).add(nameSightings).add(nameRoutes);

    var emailRegex = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

    allFields.removeClass( "ui-state-error" );

    valid = valid && checkLength(nameSightings, "sightings filename", 8, 30 );
    valid = valid && checkLength(nameRoutes, "routes filename", 8, 30 );
    valid = valid && checkLength( email, "email", 0, 80 );

    valid = valid && checkRegexp(nameSightings, /^[a-z]([0-9a-z_.\s])+$/i, "Sightings filename may consist of a-z, 0-9, underscores, spaces and must begin with a letter.");
    valid = valid && checkRegexp(nameRoutes, /^[a-z]([0-9a-z_.\s])+$/i, "Routes filename may consist of a-z, 0-9, underscores, spaces and must begin with a letter.");
    if(email.val().length>0){
      valid = valid && checkRegexp( email, emailRegex, "eg. example@example.com" );
    }

    if (valid) {

    var sightingsFn = nameSightings.val();
	if(!checkExtention(sightingsFn, ".geojson")){
	 	  sightingsFn = sightingsFn + ".geojson";
	 }

	var routesFn = nameRoutes.val();
	if(!checkExtention(routesFn, ".geojson")){
	 	  routesFn = routesFn + ".geojson";
	 }

    dataSaveInfo.sightingsFn = sightingsFn;
    dataSaveInfo.routesFn = routesFn;

    dataSaveInfo.egcusrname = email.val();
    //userInfo.email = email.val();

    if(document.getElementById('radioYes').checked){
        dataSaveInfo.saveLocalCopy = true;
    }
    if(document.getElementById('radioNo').checked){
          dataSaveInfo.saveLocalCopy = false;
    }

    if(document.getElementById('clearYes').checked){
        dataSaveInfo.clearAfterSave = true;
    }
    if(document.getElementById('clearNo').checked){
          dataSaveInfo.clearAfterSave = false;
    }

    dataSaveInfo.updated = true;

    // submit data to server
    saveDrawings();

    dialog.dialog("close");

  }
  return valid;

  dialog.dialog("close");
}

function openDialogSightingInfo(){

  // first create the <div> for dialog
    var dialogId = 'dialog-form-sighting';
    var dialogDiv = document.createElement('div');
    dialogDiv.setAttribute('id', dialogId);
    dialogDiv.setAttribute('title', 'Wildlife sighting information');

    document.body.appendChild(dialogDiv);

    // design form contents
    var htmlSighting = '<p class="description">Please provide more <i>DETAILS</i> about this record of your wildlife sighting.</p>'
                    + '<p class="validateTips"><i>NOT ALL</i> fields are required. But the format of your input, if any, will be checked.</p>'
                    + '<form><fieldset>'
                    + '<label for="nameCom">Species common name (required)</label>'
                    + '<select name="nameCom" id="nameCom" class="select ui-widget-content ui-corner-all">'
                    + '<option value="Black-and-white snub-nosed monkey" selected>Black-and-white snub-nosed monkey</option>'
                    + '<option value="Others...">Others...</option>'
                    +'</select><br><br>'
                    + '<label for="nameSci">Species scientific name</label>'
                    + '<select name="nameSci" id="nameSci" class="select ui-widget-content ui-corner-all">'
                    + '<option value="Rhinopithecus bieti" selected>Rhinopithecus bieti</option>'
                    + '<option value="Others...">Others...</option>'
                    +'</select><br><br>'
                    + '<label for="dateSighting" >Date of sighting (required, as precise as possible)</label>'
                    + '<input type="date" name="dateSighting" id="dateSighting" value="2014-08-02" class="text ui-widget-content ui-corner-all">'
                    + '<label for="number">Number of wildlife</label>'
                    + '<input type="number" name="number" id="number" value="1"  min="1" max="200" class="text ui-widget-content ui-corner-all">'
                    + '<label for="comments">Other comments (500 words in maximum)</label>'
                    + '<textarea rows="5" name="comments" id="comments" class="text ui-widget-content ui-corner-all">'
                    + 'Please and your comments here...</textarea>'
                    + '</fieldset></form>';

    dialogDiv.innerHTML = htmlSighting;


    // initialize dialog
    tips = $(".validateTips");


    dialog = $("#" + dialogId).dialog({
      autoOpen: false,
      height: 600,
      width: dialogWidth,
      resizable: false,
      modal: true,
      buttons: {
        "Ok": function() {
          updateSightingInfo();
          //console.log(JSON.stringify(sightingInfo));
        },
        "Cancel": function() {

          deleteFeature(curFeature);
          dialog.dialog("close");

        }
      },
      close: function() {

        dialogDiv.parentNode.removeChild(dialogDiv);
      },
      /* cool animation */
      show: {
        effect: showEffect,
        duration: showDuration
      },
      hide: {
        effect: hideEffect,
        duration: hideDuration
      }
  });

  // open dialog
  dialog.dialog("open");

}

function updateSightingInfo(){

  var valid = true;

  var nameCom = $("#nameCom");
  var nameSci = $("#nameSci");
  var dateSighting = $("#dateSighting");
  var number = $("#number");
  var comments = $("#comments");

  var allFields = $( [] ).add(nameCom).add(nameSci).add(dateSighting).add(number).add(comments);

  allFields.removeClass( "ui-state-error" );

  valid = valid && checkDate(dateSighting);
  valid = valid && checkLength( nameCom, "Species common name", 1, 300 );
  valid = valid && checkLength( nameSci, "Species scientific name", 0, 300 );

  valid = valid && checkRegexp( nameCom, /^[a-z]([a-z.-\s])+$/i, "Species common name may consist of a-z, spaces, '-', ' .' and must begin with a letter." );
  if(nameSci.val().length > 0){
    valid = valid && checkRegexp( nameSci, /^[a-z]([a-z.-\s])+$/i, "Species scientific name may consist of a-z, spaces, '-', ' .'  and must begin with a letter." );
  }

  valid = valid && checkNumberRange( number, "Number of wildlife", 1, 200);

  if(comments.val().length > 0){

    valid = valid && checkRegexp( comments, /^[a-z]([0-9a-z.-\s])+$/i, "Comments may consist of a-z, 0-9, spaces and must begin with a letter." );
    valid = valid && checkWordsLength( comments, "Comments", 500);
  }

  if ( valid ) {

    sightingInfo["comname"] = nameCom.val();
    sightingInfo["sciname"] = nameSci.val();
    sightingInfo["date"] = dateSighting.val();
    sightingInfo["number"] = number.val();
    sightingInfo["comments"] = comments.val();

    if(curFeature != null){
      setPolyAttributes(sightingInfo, curFeature);
      //alertify.success('A sighting polygon was created.')
      console.log('A sighting polygon was created.')
    }

    dialog.dialog( "close" );
  }
  return valid;
}

function openDialogRouteInfo(){

    // first create the <div> for dialog
    var dialogId = 'dialog-form-route';
    var dialogDiv = document.createElement('div');
    dialogDiv.setAttribute('id', dialogId);
    dialogDiv.setAttribute('title', 'Activity route information');

    document.body.appendChild(dialogDiv);

    // design form contents
    var htmlRoute = '<p class="description">Please provide more <i>DETAILS</i> about this record of your activity route.</p>'
        + '<p class="validateTips"><i>NOT ALL</i> fields are required. But the format of your input, if any, will be checked.</p>'
        + '<form><fieldset>'
        + '<label for="date" >Date of taking this route (required, as precise as possible)</label>'
        + '<input type="date" name="date" id="date" value="2014-08-02" class="text ui-widget-content ui-corner-all">'
        + '<label for="purpose">Purpose of taking this route</label>'
        + '<input type="text" name="purpose" id="purpose" value="Tourist" class="text ui-widget-content ui-corner-all">'
        + '<label for="weather">Weather condition</label>'
        + '<input type="text" name="weather" id="weather" value="Sunny" class="text ui-widget-content ui-corner-all">'
        + '<label for="visibility">Visible distance on average (in meter)</label>'
        + '<input type="number" name="visibility" id="visibility" value="500"  min="500" max="2000" class="text ui-widget-content ui-corner-all">'
        + '<label for="frequency">Frequncy of taking this route (times per month)</label>'
        + '<input type="number" name="frequency" id="frequency" value="0"  min="0" max="30" class="text ui-widget-content ui-corner-all">'
        + '<label for="comments">Other comments (500 words in maximum)</label>'
        + '<textarea rows="5" name="comments" id="comments" class="text ui-widget-content ui-corner-all">'
        + 'Please and your comments here...</textarea>'
        + '</fieldset></form>';

    dialogDiv.innerHTML = htmlRoute;


    // initialize dialog
    tips = $(".validateTips");


    dialog = $("#" + dialogId).dialog({
      autoOpen: false,
      height: 600,
      width: dialogWidth,
      modal: true,
      resizable: false,
      buttons: {
        "Ok": function() {
          updateRouteInfo();
          //console.log(JSON.stringify(routeInfo));
        },
        "Cancel": function() {

          // if canceled, delete this unfinished feature
          deleteFeature(curFeature);
          dialog.dialog("close");
        }
      },
      close: function() {
        dialogDiv.parentNode.removeChild(dialogDiv);
      },
      /* cool animation */
      show: {
        effect: showEffect,
        duration: showDuration
      },
      hide: {
        effect: hideEffect,
        duration: hideDuration
      }
  });

  // open dialog
  dialog.dialog("open");
}

function updateRouteInfo(){

  var valid = true;

  var date = $("#date");
  var purpose = $("#purpose");
  var weather = $("#weather");
  var frequency = $("#frequency");
  var visibility = $("#visibility");
  var comments = $("#comments");

  var allFields = $( [] ).add(date).add(purpose).add(weather).add(frequency).add(visibility).add(comments);


  allFields.removeClass( "ui-state-error" );

  valid = valid && checkDate(date);
  valid = valid && checkLength( purpose, "Purpose", 0, 300 );
  valid = valid && checkLength( weather, "Weather", 0, 50 );
  valid = valid && checkWordsLength( comments, "Comments", 500 );
  valid = valid && checkNumberRange( frequency, "Frequency", 0, 30);
  valid = valid && checkNumberRange( visibility, "Visible distance", 0, 2000);

  if(purpose.val().length > 0){
    valid = valid && checkRegexp( purpose, /^[a-z]([a-z.-\s])+$/i, "Purpose may consist of a-z, spaces and must begin with a letter." );
  }

  if(weather.val().length > 0){
    valid = valid && checkRegexp( weather, /^[a-z]([a-z.-\s])+$/i, "Weather may consist of a-z, spaces and must begin with a letter." );
  }

  if(comments.val().length > 0){

    valid = valid && checkRegexp( comments, /^[a-z]([0-9a-z.-\s])+$/i, "Comments may consist of a-z, 0-9, spaces and must begin with a letter." );
    valid = valid && checkWordsLength( comments, "Comments", 500);
  }


  if ( valid ) {
    routeInfo["date"] = date.val();
    routeInfo["purpose"] = purpose.val();
    routeInfo["weather"] = weather.val();
    routeInfo["visibility"] = visibility.val();
    routeInfo["frequency"] = frequency.val();
    routeInfo["comments"] = comments.val();

    // set attributes for a polygon/polyline
    if(curFeature != null){
      setPolyAttributes(routeInfo, curFeature);
      //alertify.success('A activity route was created.');
      console.log('A activity route was created.');
    }

    dialog.dialog( "close" );
  }
  return valid;
}

function openDialogMessage(title, message){

  // first create the <div> for dialog
    var dialogId = 'dialog-message';
    var dialogDiv = document.createElement('div');
    dialogDiv.setAttribute('id', dialogId);
    dialogDiv.setAttribute('title', title);
    document.body.appendChild(dialogDiv);

    var htmlMessage = '<p id="serverResponse"></p>';
    dialogDiv.innerHTML = htmlMessage;
    document.getElementById("serverResponse").innerHTML = message;

    dialog = $("#" + dialogId).dialog({
      autoOpen: false,
      modal: true,
      resizable: false,
      buttons: {
        "Ok": function() {

          if(title == "Server response"){
             // save a local copy
            if(dataSaveInfo.saveLocalCopy){

              saveLocalCopy(dataSaveInfo.sightingsFn, polygonGeoJSON);

              setTimeout( function(){

                saveLocalCopy(dataSaveInfo.routesFn, polylineGeoJSON);
              }, 1500);
            }

            // clean it up if data saved successfully
            if(serverSuccess && dataSaveInfo.clearAfterSave){
              polygon.removeAllFeatures();
              polyline.removeAllFeatures();
            }

          }

          // if feature exceeds study area
          else if(title == "Warning"){
            deleteFeature(curFeature);
          }

          dialog.dialog("close");
        }
      },
      close: function() {
        dialogDiv.parentNode.removeChild(dialogDiv);
      },
      /* cool animation */
      show: {
        effect: showEffect,
        duration: showDuration
      },
      hide: {
        effect: hideEffect,
        duration: hideDuration
      }
    });

  // open dialog
  dialog.dialog("open");

}

function openDialogProgress(){

  // first create the <div> for dialog
    var dialogId = 'dialog-progress';
    var dialogDiv = document.createElement('div');
    dialogDiv.setAttribute('id', dialogId);

    var dialogClass = 'progress-label';
    var dialogDivlabel = document.createElement('div');
    dialogDivlabel.setAttribute('class', dialogClass);
    dialogDivlabel.innerHTML = "Processing...";
    dialogDiv.appendChild(dialogDivlabel);

    document.body.appendChild(dialogDiv);

    //document.getElementById("serverResponse").innerHTML = message;

    dialog = $("#" + dialogId).dialog({
      autoOpen: false,
      modal: true,
      resizable: false,
      buttons: {
        /*
        "Ok": function() {
          dialog.dialog("close");
        }
        */
      },
      open: function(){
        var progressbar = $( "#dialog-progress" ),
        progressLabel = $( ".progress-label");

        progressbar.progressbar({
          value: false,
          change: function() {
            progressLabel.text( progressbar.progressbar( "value" ) + "%" );
          },
          complete: function() {
            progressLabel.text( "Complete!" );
            dialog.dialog("close");
          }
        });

        function progress() {
          var val = progressbar.progressbar( "value" ) || 0;

          progressbar.progressbar( "value", val + 5 );

          if ( val < 99 ) {
            setTimeout( progress, 80 );
          }
        }

        setTimeout( progress, 500 );
      },
      close: function() {
        dialogDiv.parentNode.removeChild(dialogDiv);
      },
      /* cool animation */
      show: {
        effect: showEffect,
        duration: showDuration
      },
      hide: {
        effect: hideEffect,
        duration: hideDuration
      }
    });

  // open dialog
  dialog.dialog("open");

}

function openDialogConfirm(title, message){

  // first create the <div> for dialog
  var dialogId = 'dialog-confirm';
  var dialogDiv = document.createElement('div');
  dialogDiv.setAttribute('id', dialogId);
  dialogDiv.setAttribute('title', title);
  document.body.appendChild(dialogDiv);

  var htmlMessage = '<p id="message"></p>';
  dialogDiv.innerHTML = htmlMessage;
  document.getElementById("message").innerHTML = message;

  dialog = $("#" + dialogId).dialog({
    resizable: false,
    height:200,
    modal: true,
    buttons: {
      "Delete": function() {
        $( this ).dialog( "close" );
        deleteFeature(curFeature);
        deleteFeatureControl.deactivate();
      },
      Cancel: function() {
        $( this ).dialog( "close" );
        deleteFeatureControl.unselect(curFeature);
		deleteFeatureControl.deactivate();
      }
    },
    close: function() {
        dialogDiv.parentNode.removeChild(dialogDiv);
    },
    /* cool animation */
    show: {
      effect: showEffect,
      duration: showDuration
    },
    hide: {
      effect: hideEffect,
      duration: hideDuration
    }
  });

}

function openDialogHelp(){

  // first create the <div> for dialog
    var dialogId = 'dialog-help';
    var dialogDiv = document.createElement('div');
    dialogDiv.setAttribute('id', dialogId);
    dialogDiv.setAttribute('title', 'Introduction to contributors');
    document.body.appendChild(dialogDiv);

    var htmlHelp = '<iframe id="helpFrame" src="help.html"></iframe>';
    dialogDiv.innerHTML = htmlHelp;

    dialog = $("#" + dialogId).dialog({
      autoOpen: false,
      width:  750,
      height: 600,
      resizable: false,
      modal: false,
      buttons: {
        "Got it!": function() {
          dialog.dialog("close");
        }
      },
      close: function() {
        dialogDiv.parentNode.removeChild(dialogDiv);
      },
      /* cool animation */
      show: {
        effect: showEffect,
        duration: showDuration
      },
      hide: {
        effect: hideEffect,
        duration: hideDuration
      }
    });

  // open dialog
  dialog.dialog("open");

}

function setDefaultUserInfo(){

  userInfo.name = "Anonymous";
  userInfo.age = 0;
  userInfo.occupation = "Unknown";
  userInfo.email = "Unknown";
  userInfo.updated = true;

}

/*
 * utility functions
*/
function updateTips( t ) {
    tips
        .text( t )
        .addClass( "ui-state-highlight" );
    setTimeout(function() {
        tips.removeClass( "ui-state-highlight", 1500 );
    }, 500 );
}

function checkLength( o, n, min, max ) {
    if ( o.val().length > max || o.val().length < min ) {
        o.addClass( "ui-state-error" );
        updateTips( "Length of " + n + " must be between " +
            min + " and " + max + "." );
        return false;
    } else {
        return true;
    }
}


function checkWordsLength( o, n, max ) {
    var words = o.val().split(" ");
    if ( words.length > max) {
        o.addClass( "ui-state-error" );
        updateTips( n + " must not exceed " + max + " words." );
        return false;
    } else {
        return true;
    }
}

function checkNumberRange( o, n, min, max ) {
    if ( o.val() > max || o.val() < min ) {
        o.addClass( "ui-state-error" );
        updateTips( "Range of " + n + " must be between " +
            min + " and " + max + "." );
        return false;
    } else {
        return true;
    }
}

function checkRegexp( o, regexp, n ) {
    if ( !( regexp.test( o.val() ) ) ) {
        o.addClass( "ui-state-error" );
        updateTips( n );
        return false;
    } else {
        return true;
    }
}

function checkDate(o){

  if ( o.val() == "") {
        o.addClass( "ui-state-error" );
        updateTips( "You must specify a date." );
        return false;
    } else {
        return true;
    }
}

function checkExtention(filename, extension){
	var fnlength = filename.length;
	var exlength = extension.length;

	var str = filename.substr(fnlength - exlength);

	if(str == extension) return true;
	else return false;
}


/* may only works in Chrome
 * demo @ http://html5-demos.appspot.com/static/a.download.html
*/

function saveLocalCopy(filename, content) {

  var output = document.createElement('output');
  document.body.appendChild(output);

  window.URL = window.webkitURL || window.URL;

  var prevLink = output.querySelector('a');
  if (prevLink) {
    window.URL.revokeObjectURL(prevLink.href);
    output.innerHTML = '';
  }

  var bb = new Blob([content], {type: 'text/plain'});

  var a = document.createElement('a');
  a.setAttribute("id","download");
  a.download = filename;
  a.href = window.URL.createObjectURL(bb);

  a.dataset.downloadurl = ['text/plain', a.download, a.href].join(':');

  output.appendChild(a);

  a.onclick = function(e) {
      setTimeout(function() {
        window.URL.revokeObjectURL(a.href);
      }, 1500);
  };

  //$("#download").click(); // thisdoes not work
  fakeClick(event, a);

  a.parentNode.removeChild(a);

};


/* simulate a click on a anchor */
function fakeClick(event, anchorObj) {
  if(anchorObj.click) {
    anchorObj.click()
  }
  else if(document.createEvent) {
    if(event.target !== anchorObj) {
      var evt = document.createEvent("MouseEvents");
      evt.initMouseEvent("click", true, true, window,
          0, 0, 0, 0, 0, false, false, false, false, 0, null);
      var allowDefault = anchorObj.dispatchEvent(evt);
    }
  }
}

function deleteFeature(feature){
    if(feature.geometry.CLASS_NAME == "OpenLayers.Geometry.Polygon"){
        polygon.removeFeatures([feature]);
        //alertify.error('A sighting polygon was deleted.');
        console.log('A sighting polygon was deleted.')
    }
    else{
        polyline.removeFeatures([feature]);
        //alertify.error('A activity route was deleted.');
        console.log('A activity route was deleted.')
    }
}
