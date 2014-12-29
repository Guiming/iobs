/*
 * this js library contains functions that might be used quite often
*/

/*
 * required packages
*/
var fs = require('fs');
var path = require('path');
var request = require("superagent");
var ogr2ogr = require("ogr2ogr");
var unzip = require("unzip");
var xml2js = require('xml2js');

var _this = this;

module.exports = {
  /*
   * read geojosn file
   * Async version
  */
  readGeoJsonFile: function (geoJsonFn){
    console.log("log");
    console.log("FUNCTION CALLED: readGeoJsonFile");
    console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");

    fs.readFile(file, "utf8", function (err, data) {
      if (err) {
        console.log('Error: ' + err);
        return;
      }

      return data;
      console.log("GeoJson readed from " + path.basename(geoJsonFn));

    });
  },

  /*
   * read geojosn file
   * Sync version
  */
  readGeoJsonFileSync: function (geoJsonFn){
    console.log("log");
    console.log("FUNCTION CALLED: readGeoJsonFileSync");
    console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");

    try{
      var jsonString = fs.readFileSync(geoJsonFn, 'utf8');
      return jsonString;
      console.log("GeoJson readed from " + path.basename(geoJsonFn));
    }
    catch(e){
      console.log("Failed to read GeoJson file: " + path.basename(geoJsonFn));
      console.log("Error: " + e);
      return;
    }
  },

  /*
   * this function save a JSON object to a GeoJson file
   * Async version
  */
  saveGeoJsonFile: function (outputFn, JsonObj){
    console.log("log");
    console.log("FUNCTION CALLED: saveGeoJsonFile");
    console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
    fs.writeFile(outputFn, JSON.stringify(JsonObj), function(err) {
          if(err) {
            console.log("Error: " + err);
          } else {
            console.log("GeoJson saved to " + path.basename(outputFn));
          }
      });
  },

  /*
   * this function save a JSON object to a GeoJson file
   * Sync version
  */
  saveGeoJsonFileSync: function (outputFn, JsonObj){
    console.log("log");
    console.log("FUNCTION CALLED: saveGeoJsonFileSync");
    console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
      try{
          fs.writeFileSync(outputFn, JSON.stringify(JsonObj));
          console.log("GeoJson saved to " + path.basename(outputFn));
      }
      catch(e){
          console.log("Error: " + err);
      }
  },

  /*
   * this function converts a GeoJson file to Shapefile
   * Based on ogr2ogr @: https://github.com/wavded/ogr2ogr
  */
  ogr2ogr_ReprojectGeoJsonFromWGS84: function (geoJsonFn, targetSrs, geoJsonFnReprj) {
    console.log("log");
    console.log("FUNCTION CALLED: ogr2ogr_ReprojectGeoJsonFromWGS84");
    console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");

    var ogr = ogr2ogr(geoJsonFn).project(targetSrs);
    ogr.exec(function (er, data) {
      if (er) console.error(er)
      module.exports.saveGeoJsonFileSync(geoJsonFnReprj, JSON.parse(JSON.stringify(data)))
      console.log(path.basename(geoJsonFn) + " has been reprojected to " + path.basename(geoJsonFnReprj) + " ( EPSG: 4326" + " --> " + targetSrs + ")")
    })
  },

  /*
   * this function converts a GeoJson file to Shapefile
   * Based on ogr2ogr @: https://github.com/wavded/ogr2ogr
   * it is a good practice to explicitly specify sourceSrc
  */
  ogr2ogr_ReprojectGeoJson: function (geoJsonFn, sourceSrs, targetSrs, geoJsonFnReprj) {
    console.log("log");
    console.log("FUNCTION CALLED: ogr2ogr_ReprojectGeoJson");
    console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");

    var ogr = ogr2ogr(geoJsonFn).project(targetSrs, sourceSrs);
    ogr.exec(function (er, data) {
      if (er) console.error(er)
      module.exports.saveGeoJsonFileSync(geoJsonFnReprj, JSON.parse(JSON.stringify(data)))
      console.log(path.basename(geoJsonFn) + " has been reprojected to " + path.basename(geoJsonFnReprj) + " ("+ sourceSrs + " --> " + targetSrs + ")")
    })
  },

  /*
   * this function converts a GeoJson file to Shapefile
   * Based on ogr2ogr @: https://github.com/wavded/ogr2ogr
  */
  ogr2ogr_ConvertGeoJson: function (geoJsonFn, outShpName) {
    console.log("log");
    console.log("FUNCTION CALLED: ogr2ogr_ConvertGeoJson");
    console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");

    var ogr = ogr2ogr(geoJsonFn).format('shp');
    ogr.exec(function (er, buf) {
      if(er){
        console.log("error: " + er );
      }

      //console.log(typeof buf);
      var zipFn = outShpName.replace('.shp', '.zip');
      var writeStream = fs.createWriteStream(zipFn);
      writeStream.write(buf);
      writeStream.end();

      writeStream.on('close', function(){
        // can only unzip after the zip file being created
        var dir = path.dirname(zipFn);
        module.exports.unzipShp(zipFn, dir);
        console.log(path.basename(geoJsonFn) + " has been converted to " + outShpName);

      });

    });
  },

  /*
   * this function reprojects and then converts a GeoJson file to Shapefile
   * Based on ogr2ogr @: https://github.com/wavded/ogr2ogr
  */
  ogr2ogr_Reproject_ConvertGeoJson: function (geoJsonFn, sourceSrs, targetSrs, outShpName) {
    console.log("log");
    console.log("FUNCTION CALLED: ogr2ogr_Reproject_ConvertGeoJson");
    console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");

    var ogr = ogr2ogr(geoJsonFn).project(targetSrs, sourceSrs);
    ogr.format('shp');
    ogr.exec(function (er, buf) {
      if(er){
        console.log("error: " + er );
      }

      //console.log(typeof buf);
      var zipFn = outShpName.replace('.shp', '.zip');
      var writeStream = fs.createWriteStream(zipFn);
      writeStream.write(buf);
      writeStream.end();

      writeStream.on('close', function(){
        // can only unzip after the zip file being created
        var dir = path.dirname(zipFn);
        module.exports.unzipShp(zipFn, dir);

        console.log(path.basename(geoJsonFn) + " has been reprojected and converted to " + outShpName);

      });

    });
  },

  /*
   * this function reprojects a GeoJson file
   * Based on services @: http://ogre.adc4gis.com/
  */
  ogre_Reproject_ConvertGeoJson: function (geoJsonFn, sourceSrs, targetSrs, outShpName) {
    console.log("log");
    console.log("FUNCTION CALLED: ogre_Reproject_ConvertGeoJson");
    console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");

    request
      .post('http://ogre.adc4gis.com/convert')
      .field('sourceSrs', sourceSrs)
      .field('targetSrs', targetSrs)
      .attach('upload', geoJsonFn)
      .end(function (er, res) {
        if (er) {
          return console.error(er)
        }
        else{
          var geoJsonString = JSON.stringify(res.body)
          module.exports.ogre_ConvertGeoJsonString(geoJsonString, outShpName)

          console.log(path.basename(geoJsonFn) + " has been reprojected and converted to " + outShpName);
        }
      })
  },

  /*
   * this function reprojects a GeoJson file
   * Based on services @: http://ogre.adc4gis.com/
  */
  ogre_ReprojectGeoJson: function (geoJsonFn, sourceSrs, targetSrs, geoJsonFnReprj) {
    console.log("log");
    console.log("FUNCTION CALLED: ogre_ReprojectGeoJson");
    console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");

    request
      .post('http://ogre.adc4gis.com/convert')
      .field('sourceSrs', sourceSrs)
      .field('targetSrs', targetSrs)
      .attach('upload', geoJsonFn)
      .end(function (er, res) {
        if (er) {
          return console.error(er)
        }
        else{
          module.exports.saveGeoJsonFileSync(geoJsonFnReprj, JSON.parse(JSON.stringify(res.body)))
          console.log(path.basename(geoJsonFn) + " has been reprojected to " + geoJsonFnReprj);
        }
      })
  },

  /*
   * this function converts a GeoJson file to Shapefile(zipped)
   * Based on services @: http://ogre.adc4gis.com/
  */
  ogre_ConvertGeoJson: function (geoJsonFn, outShpName) {
    console.log("log");
    console.log("FUNCTION CALLED: ogre_ConvertGeoJson")
    console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");

    var outZipName = outShpName.replace('.shp', '.zip');

    var geoJsonString = module.exports.readGeoJsonFileSync(geoJsonFn);
    var writeStream = fs.createWriteStream(outZipName);

    request
      .post('http://ogre.adc4gis.com/convertJson')
      .type('form')
      .send({'json': geoJsonString})
      .pipe(writeStream)

    writeStream.on('close', function(){
      module.exports.unzipShp(outZipName, path.dirname(outShpName))

      console.log(path.basename(geoJsonFn) + " has been converted to " + outShpName);
    });

  },

  /*
   * this function converts a GeoJson file to Shapefile(zipped)
   * Based on services @: http://ogre.adc4gis.com/
  */
  ogre_ConvertGeoJsonString: function (geoJsonString, outShpName) {
    console.log("log");
    console.log("FUNCTION CALLED: ogre_ConvertGeoJson")
    console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");

    var outZipName = outShpName.replace('.shp', '.zip');
    var writeStream = fs.createWriteStream(outZipName);

    request
      .post('http://ogre.adc4gis.com/convertJson')
      .type('form')
      .send({'json': geoJsonString})
      .pipe(writeStream)

    writeStream.on('close', function(){
      module.exports.unzipShp(outZipName, path.dirname(outShpName))

      console.log("A GeoJson string has been converted to " + outShpName);
    });

  },

  /* unzip shapefile */
  unzipShp: function(zipShpFn, unzipDir) {
    console.log("log");
    console.log("FUNCTION CALLED: unzipShp");
    console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");

    /* if no zip file, exit */
    if(!fs.existsSync(zipShpFn)){
      console.log(".zip file does not exist.");
      return;
    }

    /* otherwise, unzip */
    // if unzip dir does not exist, create one
    if(!fs.existsSync(unzipDir)){
        fs.mkdirSync(unzipDir);
    }

    // create a tmp folder to hold unzipped files
    var tmpDir = unzipDir + path.sep + path.basename(zipShpFn).replace('.zip', '');
    if(!fs.existsSync(tmpDir)){
        fs.mkdirSync(tmpDir);
    }

    // unzip
    var unzipExtractor = unzip.Extract({ path: tmpDir });
    fs.createReadStream(zipShpFn).pipe(unzipExtractor);

    unzipExtractor.on('error', function(err) {
      throw err;
    });

    unzipExtractor.on('close', function(err) {
      fs.unlinkSync(zipShpFn); // delete zip file after unzipping

      // rename unzipped shapefiles
      var defaultName = 'OGRGeoJSON';
      var newname = path.basename(zipShpFn).replace('.zip', '');
      module.exports.renameShp(unzipDir, defaultName, newname);

      fs.rmdirSync(tmpDir); // delete zip file after unzipping

    });
  },

  /* reanme shapefile */
  renameShp: function (dir, oldname, newname){
    console.log("log");
    console.log("FUNCTION CALLED: renameShp");
    console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");

    // full set of shapefile specification
    var suffix = ['.shp', '.dbf', '.prj', '.shx', '.sbn', '.sbx'];
    // renaming
    for(var i in suffix){
      var oldFn = dir + path.sep + newname + path.sep + oldname + suffix[i];
      var newFn = dir + path.sep + newname + suffix[i];
      //console.log(oldFn);
      if(fs.existsSync(oldFn)){
        fs.renameSync(oldFn, newFn);
      }
    }
  },

  updateDataFile: function(outShpPolygon, polygonExt, outShpPolyline, polylineExt,
                            citizenDataRelativeDir, dataFile, isLasha){
    console.log("log");
    console.log("FUNCTION CALLED: updateDataFile");
    console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");

    if(fs.existsSync(dataFile)){
      if(fs.existsSync(outShpPolygon) && fs.existsSync(outShpPolyline)){
        var parser = new xml2js.Parser();
        fs.readFile(dataFile, function(err, data) {

          if(err) throw err;
            parser.parseString(data, function (err, result) {

              if(err) throw err;

              // file size
              var polygonFileSize = module.exports.getFilesizeInKb(outShpPolygon);
              var polylineFileSize = module.exports.getFilesizeInKb(outShpPolyline);

              var sufix = [".shx", ".prj", ".dbf"];

              for(var i = 0; i< sufix.length; i++){
                var polygonfn = path.dirname(outShpPolygon) + path.sep
                                + path.basename(outShpPolygon).replace('.shp', sufix[i]);
                polygonFileSize = polygonFileSize + module.exports.getFilesizeInKb(polygonfn);

                var polylinefn = path.dirname(outShpPolyline) + path.sep
                                + path.basename(outShpPolyline).replace('.shp', sufix[i]);
                polylineFileSize = polylineFileSize + module.exports.getFilesizeInKb(polylinefn);
              }


              var polygonObj = {
                  fileName: citizenDataRelativeDir + '/' + path.basename(outShpPolygon),
                  fileSize: Math.round(polygonFileSize * 100) / 100 + "KB",
                  type: "vector",
                  format: "shp",
                  semantic: "Sighting Polygons",
                  top: polygonExt.top,
                  down: polygonExt.bottom,
                  left: polygonExt.left,
                  right: polygonExt.right
              };

              var polylineObj = {
                  fileName: citizenDataRelativeDir + '/' + path.basename(outShpPolyline),
                  fileSize: Math.round(polylineFileSize * 100) / 100 + "KB",
                  type: "vector",
                  format: "shp",
                  semantic: "Activity Routes",
                  top: polylineExt.top,
                  down: polylineExt.bottom,
                  left: polylineExt.left,
                  right: polylineExt.right
              };

              if(isLasha){
                  var top = 26.347553;
                  var down = 26.311944;
                  var left = 99.220176;
                  var right = 99.287922;

                  polygonObj.top = top;
                  polygonObj.down = down;
                  polygonObj.left = left;
                  polygonObj.right = right;

                  polylineObj.top = top;
                  polylineObj.down = down;
                  polylineObj.left = left;
                  polylineObj.right = right;

              }

              var json = JSON.parse(JSON.stringify(result));
              json.files.file.push(polygonObj);
              json.files.file.push(polylineObj);

              var builder = new xml2js.Builder();
              var xml = builder.buildObject(json);

              fs.writeFile(dataFile, xml, function (err) {
                if (err) throw err;
                console.log('EGC user data file updated!');
              });

            });
        });
      }
    }
  },

  getFilesizeInKb: function(filename) {
     var stats = fs.statSync(filename);
     var fileSizeInBytes = stats["size"];
     return fileSizeInBytes / 1024.0;
  }
};
