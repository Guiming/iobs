


// call this function when page loads
function init(){
	
	// initialize the map
	initMap();
	
	// initialize dialogs
	initDialogs();
	
	// show tips for use	
	setTimeout(function(){
		openDialogHelp();
	}, 2000);	
}
