/**
 * Namespace: Main
 *
 * Main is a JavaScript library to provide a set of functions to manage
 *  the web requests.
 *
 * $Id: /var/www/html/fps/javascripts/gages/main.js, v 1.46 2026/08/16 09:45:57 llorzol Exp $
 * $Revision: 1.46 $
 * $Date: 2026/08/16 09:45:57 $
 * $Author: llorzol $
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
// Prevent jumping to top of page when clicking a href
//
jQuery('.noJump a').click(function(event){
   event.preventDefault();
});

// Global objects
//
var mySites             = {};
var mySiteInfo          = {};
var myFpsInfo           = {};
var myStates            = {};

var myAreaList          = [];
var myLastArea          = null;

var process_dt          = '4/3/2025'

// loglevel
//
let myLogger = log.getLogger('myLogger');
//myLogger.setLevel('debug');
myLogger.setLevel('info');

// Request data
//
$(document).ready(function() {

    // Loading message
    //
    message = "Preparing USGS Federal Priority Streamgages";
    openModal(message);
    fadeModal(3000);

    // Build ajax requests
    //
    const urls = [];

    // Request for site information
    //
    urls.push("data/CenterInfoMaster.xml");

    // Request FPS information
    //
    urls.push("data/FPSNetwork_mapper.geojson");

    // Request for us and states boundaries information
    //
    urls.push("data/states.geojson");

    // Request for us and states boundaries information
    //
    urls.push("https://api.waterdata.usgs.gov/ogcapi/v0/collections/states/items?f=json&lang=en-US&sortby=country_code,state_name&filter-lang=cql-text&filter=country_code IN ('US')");

    // Call the async function
    //
    webRequests(urls, 'text', processData)
});

function processData([myCenterText, mySitesText, myStatePolygons, myFipsText]) {
    myLogger.info("processData");
    myLogger.debug(myCenterText);
    myLogger.debug(mySitesText);
    myLogger.debug(myStatePolygons);
    myLogger.debug('myStateFips', myFipsText);

    // Check for WSC data
    //
    if (!myCenterText) {

        // Warning message
        //
        message = `No WSC information for Federal Priority Streamgages (FPS) Network Mapper website`;
        myLogger.error.log(message);
        updateModal(message);
        fadeModal(3000);

        return false;
    }

    // Processed WSC information
    //
    let parser = new DOMParser();
    let xmlDoc = parser.parseFromString(myCenterText, "text/xml");
    let myJson = $.xml2json(xmlDoc); // Convert XML to JSON
    let myCenterData = myJson['#document']['Centers']['Center'];
    myLogger.debug(myCenterData);
 
    // Check for site data
    //
    if (!mySitesText) {

        // Warning message
        //
        message = `No site information for Federal Priority Streamgages (FPS) Network Mapper website`;
        myLogger.error.log(message);
        updateModal(message);
        fadeModal(3000);

        return false;
    }
    mySiteData = JSON.parse(mySitesText)
    myLogger.debug('mySiteData',mySiteData);
    
    // Check for state boundary layer
    //
    if (!myStatePolygons) {

        // Warning message
        //
        message = `No state boundary layer information for Federal Priority Streamgages (FPS) Network Mapper website`;
        myLogger.error.log(message);
        updateModal(message);
        fadeModal(3000);

        return false;
    }
  
    // Check for fips data
    //
    if (!myFipsText) {

        // Warning message
        //
        message = `No FIPS information for Federal Priority Streamgages (FPS) Network Mapper website`;
        myLogger.error.log(message);
        updateModal(message);
        fadeModal(3000);

        return false;
    }
    myFipsData = JSON.parse(myFipsText)
    myLogger.debug('myFipsData',myFipsData);

    // Prepare sites
    //
    myFipsData.features.map(feature => {
    
        // Build state and territories list
        //
        if(feature.properties.state_name !== 'Unspecified') {
            myAreaList.push(feature.properties.state_name)
        }
    });
    myLogger.debug('myAreaList', myAreaList);
    
    // Build area selection in left panel
    //
    buildAreaList(myAreaList);

    // Current url
    //-------------------------------------------------
    var url = new URL(window.location.href);
    myLogger.info("Current Url " + window.location.href);

    // Parse
    //-------------------------------------------------
    //state_abbrev  = url.searchParams.get('state_abbrev');
    state_nm      = url.searchParams.get('state_nm');
    site_type     = url.searchParams.get('site_type');
    funding_level = url.searchParams.get('funding_level');
    monitoring_level = url.searchParams.get('monitoring_level');
    
    myLogger.info('myArea', state_nm);

    //if(state_abbrev) { state_nm = myFipsCodes[state_postal_code] }
    if(state_nm) { $('#select-area').val(state_nm); }
    else { $('#select-area').val('All states and territories'); }
    if(site_type) { $('#select-sitetype').val(site_type); }
    else { $('#select-sitetype').val('All site types'); }
    if(funding_level) { $('#select-funding').val(funding_level); }
    else { $('#select-funding').val('All funding levels'); }
    if(monitoring_level) { $('#select-monitoring').val(monitoring_level); }
    else { $('#select-monitoring').val('Active'); }

    myLastArea = $('#select-area').val();

    // Prepare data
    //-------------------------------------------------
    prepareData(mySiteData, myCenterData, myStatePolygons)

}

function saveObjectToFile(obj, filename) {
  // 1. Convert the object to a formatted JSON string
  const jsonString = JSON.stringify(obj, null, 2);
  
  // 2. Create a Blob containing the JSON string data
  const blob = new Blob([jsonString], { type: "application/json" });
  
  // 3. Create an anchor element to handle the download
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.json`;
  
  // 4. Append to body, simulate a click, and remove it
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // 5. Clean up the URL object to free up memory
  URL.revokeObjectURL(link.href);
}