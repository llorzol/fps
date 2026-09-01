/**
 * Namespace: fpsSupport
 *
 * fpsSupport is a JavaScript library to provide a set of functions to build
 *  the FPS Web Site.
 *
*/

/*
###############################################################################
# Copyright (c) Office of Planning and Programming (OPP)
# 
# Permission is hereby granted, free of charge, to any person obtaining a
# copy of this software and associated documentation files (the "Software"),
# to deal in the Software without restriction, including without limitation
# the rights to use, copy, modify, merge, publish, distribute, sublicense,
# and/or sell copies of the Software, and to permit persons to whom the
# Software is furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included
# in all copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
# OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
# THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
# FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
# DEALINGS IN THE SOFTWARE.
###############################################################################
*/

// ==================================================
// Functions
// ==================================================
        
// Extend Leaflet to create a GeoJSON layer from a TopoJSON file
//
L.TopoJSON = L.GeoJSON.extend({
  addData: function (jsonData) {
    if (jsonData.type === 'Topology') {
      for (key in jsonData.objects) {
        geojson = topojson.feature(jsonData, jsonData.objects[key]);
        L.GeoJSON.prototype.addData.call(this, geojson);
      }
    } else {
      L.GeoJSON.prototype.addData.call(this, jsonData);
    }
  },
});

        
// Display state polygons 
//
function getStateBoundary(map, myState)
  {
   console.log("getStateBoundary for " + myState);
      
   var stateBoundary = null;
   var stateReg      = new RegExp(myState);

   // Topolayer exists clear
   //
   if(topoLayer)
     {
      topoLayer.eachLayer(clearLayer);
      topoLayer.eachLayer(colorLayer);
     }

   // Topolayer needs to be created
   //
   else
     {
      topoLayer           = new L.TopoJSON();
   
      $.getJSON('data/states-10m.json').done(addTopoData);
   
      function addTopoData(topoData) {
        topoLayer.addData(topoData);
        topoLayer.addTo(map);
        topoLayer.eachLayer(colorLayer);
      }     
     }
  
   // Topolayer clear shading
   //
   function clearLayer(layer) {
    
         layer.setStyle({
           fillColor: false,
           fillOpacity: 0.0,
           color: false,
           weight: 0.0,
           opacity: 0.0,
         });
     }

  
   // Topolayer shading
   //
   function colorLayer(layer) {
    
      const fillColor = '#555'
      var stateName   = layer.feature.properties.name
    
      if(stateReg.test(stateName))
        {
         stateBoundary = layer;
    
         layer.setStyle({
           fillColor: false,
           fillOpacity: 0.0,
           color: fillColor,
           weight: 0.0,
           opacity: 0.5,
         });
        }
    
      else
        {
         layer.setStyle({
           fillColor: fillColor,
           fillOpacity: 0.15,
           color: fillColor,
           weight: 1,
           opacity: 0.5,
         });
        }
     }

   return stateBoundary;
}
        
// Builds list of Wscs 
//
function getSelect2Choice(mySelector)
  {
   console.log("getSelect2Choice for " + mySelector);

   var id   = null;
   var text = null;
 
   // Check individual selection
   //
   var myChoice = $(mySelector).select2('data');
 
   // Determine choice
   //
   if(myChoice && myChoice.length > 0)
     {
      console.log('Checking Choice');
      console.log(myChoice);
      for(var i = 0; i < myChoice.length; i++)
         {
          id   = myChoice[i]['id'];
          text = myChoice[i]['text'];
          break;
         }
     }

   return {'id': id, 'text': text};
}

// Export
//
function exportFile(text)
 {
  var textFile    = null

    var data     = new Blob([text], {type: 'text/plain'});

    // If we are replacing a previously generated file we need to
    // manually revoke the object URL to avoid memory leaks.
    // 
    if(textFile !== null)
      {
       window.URL.revokeObjectURL(textFile);
      }

  textFile = window.URL.createObjectURL(data);

  return textFile;
 }


// Update URL
//
function updateURL(wsc_id)
 {
  var url  = document.URL;

  var root = location.protocol + '//' + location.host;

  location.hash.wsc_id = wsc_id;

  return;
 }

var clearQueryStringParam = function () {

    var baseUrl = [location.protocol, '//', location.host, location.pathname].join('');

    window.history.replaceState({}, "", baseUrl);
};

var updateQueryStringParam = function (key, value) {

    var baseUrl = [location.protocol, '//', location.host, location.pathname].join(''),
        urlQueryString = document.location.search,
        newParam = key + '=' + value,
        params = '?' + newParam;

    // If the "search" string exists, then build params from it
    if (urlQueryString) {
        var updateRegex = new RegExp('([\?&])' + key + '[^&]*');
        var removeRegex = new RegExp('([\?&])' + key + '=[^&;]+[&;]?');

        if( typeof value == 'undefined' || value == null || value == '' ) { // Remove param if value is empty
            params = urlQueryString.replace(removeRegex, "$1");
            params = params.replace( /[&;]$/, "" );

        } else if (urlQueryString.match(updateRegex) !== null) { // If param exists already, update it
            params = urlQueryString.replace(updateRegex, "$1" + newParam);

        } else { // Otherwise, add it to end of query string
            params = urlQueryString + '&' + newParam;
        }
    }

    // no parameter was set so we don't need the question mark
    params = params == '?' ? '' : params;

    window.history.replaceState({}, "", baseUrl + params);
};


// Build numeric sort
//
function sortNumber(a, b) {
    a = parseInt(a);
    b = parseInt(b);
    
    return a > b ? 1 : a < b ? -1 : 0;
}
