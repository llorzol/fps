/**
 * Namespace: Map_Gages
 *
 * Map_Gages is a JavaScript library to provide a set of functions to build
 *  the Endangered Gages Web Site.
 *
 * $Id: /var/www/html/fps/javascripts/gages/map_gages.js, v 1.88 2026/08/18 12:49:43 llorzol Exp $
 * $Revision: 1.88 $
 * $Date: 2026/08/18 12:49:43 $
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

// Set bounds for small insert maps
//
var mapAreas            = {
                           "Alaska":      [ [74.21198, -181.58203], [49.03787, -120.58594] ],
                           "Hawaii":      [ [23.98625, -161.18042], [17.35064, -153.55591] ],
                           "Guam":        [ [14.00204,  144.49681], [13.1681,   144.85637] ],
                           "Puerto Rico": [ [19.7667,  -67.86804],  [16.39393,  -64.05579] ],
                           //"USA":         [ [56.36525, -155.56641], [24.521083, -33.57422] ]
                           "USA":         [ [49.38, -124.84], [24.39, -66.88] ]
};
var allSitesBounds;

var usaSites            = new L.FeatureGroup();
var alaskaSites         = new L.FeatureGroup();
var hawaiiSites         = new L.FeatureGroup();
var guamSites           = new L.FeatureGroup();
var puertoricoSites     = new L.FeatureGroup();

var basemap_tile_service = "https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/tile/{z}/{y}/{x}"

// Set maps
//
var map;
var mapUSA;
var mapAlaska;
var mapHawaii;
var mapGuam;
var mapPuertoRico;

var allSites            = new L.FeatureGroup();
var customSites         = new L.FeatureGroup();
var customSite          = new L.FeatureGroup();

var statePolygons       = new L.FeatureGroup();
var defaultStyle = { color: '#555', weight: 0, opacity: 0.0, fillOpacity: 0.0 };
var selectedStyle = { color: '#555555', weight: 2, opacity: 1, fillColor: '#555555', fillOpacity: 0.15 };

var myCenterCodes       = {};
var myWSCs              = {};

var mySitesList         = [];
var mySiteSet           = []

var zoomBar             = null;
var zoomToStart         = false;
var myZoomFlag          = false;

// The IBM Design Palette (High Contrast) for colorblindness
//
const ibmAccessiblePalette = [
  "#648FFF", // Ultramarine
  "#785EF0", // Indigo
  "#DC267F", // Magenta
  "#FE6100", // Orange
  "#FFB000"  // Gold
];

// Optimized for categorical charts (up to 8 categories)
//  for colorblindness
//
const okabeItoPalette = [
  "#E69F00", // Orange
  "#56B4E9", // Sky Blue
  "#009E73", // Bluish Green
  "#F0E442", // Yellow
  "#0072B2", // Blue
  "#D55E00", // Vermilion
  "#CC79A7", // Reddish Purple
  "#000000"  // Black
];

// Prepare data 
//
function prepareData(mySiteData, myCenterData, myStatePolygons, myStateAbbevs) {
    myLogger.info("prepareData");
    myLogger.info("mySiteData");
    myLogger.info(mySiteData);
    myLogger.info(myCenterData);
    myLogger.debug(myStatePolygons);
    myLogger.debug('myStateAbbevs', myStateAbbevs);

    // Process WSC information
    //
    myCenters = {}
    myCenterData.forEach(center => {
        let Address = [
            ` ${center.Address}`,
            ` ${center.City}`,
            ` ${center.State}`,
            ` ${center.ZipCode}`
        ].join(' ');
        myCenters[center.CenterCode] = {
            'CenterName': `${center.CenterName}`,
            'CenterAddress': `${Address}`,
            'CenterContact': `${center.CenterContacts.CenterContact.FirstName} ${center.CenterContacts.CenterContact.LastName}`,
            'CenterPhone': `${center.CenterContacts.CenterContact.PhoneWork}`,
            'CenterEmail': `${center.CenterContacts.CenterContact.Email}`
        }
    });
    myLogger.info('myCenters', myCenters);

    // Prepare sites
    //
    mySitesList = mySiteData.features.map(feature => {

        if(feature.properties.StateName) {
            if(!myCenterCodes[feature.properties.StateName]) {
                myCenterCodes[feature.properties.StateName] = [];
            }
            myCenterCodes[feature.properties.StateName].push(feature.properties.CenterCode);
        }        

        // Set icon
        //
        myIcon = setIcon(feature.properties.OperatingStatus,
                         feature.properties.FPSNetwork,
                         feature.properties.FPSFunding);
        feature.properties.symbol = myIcon;

        // Build marker
        //
        let site_no = feature.properties.SiteNumber;
        let Longitude = feature.geometry.coordinates[0];
        let Latitude = feature.geometry.coordinates[1]
        let latlng  = L.latLng(Latitude, Longitude)
	let layer  = L.marker(latlng, { icon: myIcon, title: site_no, site_no: site_no } );

        myRecord = {
            AgencyCode : feature.properties.AgencyCode,
            CenterCode : feature.properties.CenterCode,
            FPSFunding : feature.properties.FPSFunding,
            FPSNetwork : feature.properties.FPSNetwork,
            OperatingStatus : feature.properties.OperatingStatus,
            SiteName : feature.properties.SiteName,
            SiteNumber : feature.properties.SiteNumber,
            StateName : feature.properties.StateName,
            Longitude : feature.geometry.coordinates[0],
            Latitude : feature.geometry.coordinates[1]
        }

        layer.properties = myRecord;
        
        // Build all sites layer
        //
        allSites.addLayer(layer);
        
        // Build sites Four national maps
        //
        if(/^Alaska\b/i.test(feature.properties.StateName)) {
            let newLayer = L.marker(latlng, { icon: myIcon, title: site_no, site_no: site_no});
            newLayer.properties = myRecord;
            alaskaSites.addLayer(newLayer);
        }
        else if(/^Hawaii\b/i.test(feature.properties.StateName)) {
            let newLayer = L.marker(latlng, {icon: myIcon, title: site_no, site_no: site_no});
            newLayer.properties = myRecord;
            hawaiiSites.addLayer(newLayer);
        }
        else if(/^Guam\b/i.test(feature.properties.StateName)) {
            let newLayer = L.marker(latlng, {icon: myIcon, title: site_no, site_no: site_no});
            newLayer.properties = myRecord;
            guamSites.addLayer(newLayer);
        }
        else if(/^puerto rico\b/i.test(feature.properties.StateName)) {
            let newLayer = L.marker(latlng, {icon: myIcon, title: site_no, site_no: site_no});
            newLayer.properties = myRecord;
            puertoricoSites.addLayer(newLayer);
        }
        else if(Latitude <= mapAreas.USA[0][0] && Latitude >= mapAreas.USA[1][0] &&
                Longitude >= mapAreas.USA[0][1] && Longitude <= mapAreas.USA[1][1]) {
            let newLayer = L.marker(latlng, {pane: 'usaSites', icon: myIcon, title: site_no, site_no: site_no});
            newLayer.properties = myRecord;
            usaSites.addLayer(newLayer);
        }

        return {
            ...feature.properties, // Spread operator pulls out all custom properties
            Longitude: Longitude,
            Latitude: Latitude,
            geometryType: feature.geometry.type
        };
    });
    myLogger.info('mySitesList', mySitesList);
    myLogger.info('allSites', allSites);
    myLogger.info('myCenterCodes', myCenterCodes)
    
    // Prepare WSC records
    //
    Object.keys(myCenterCodes)
        .sort()
        .forEach(key => {
            myLogger.debug(`${key}: ${myCenterCodes[key]}`);
            const listWSCs = myCenterCodes[key].reduce((accumulator, currentItem) => {
                accumulator[currentItem] = (accumulator[currentItem] || 0) + 1;
                return accumulator;
            }, {});
            myLogger.debug('listWSCs', listWSCs)
            const sortedWSCs = Object.entries(listWSCs).sort((a, b) => a[1] - b[1])
            const selectedWSC = sortedWSCs.slice(-1);
            myWSCs[key] = selectedWSC[0][0];
        });
    myLogger.debug('myWSCs', myWSCs)
    
    // Prepare polygons of states
    //
    statePolygons = L.geoJSON(JSON.parse(myStatePolygons), {
        style: defaultStyle,
        onEachFeature: function (feature, layer) {
            // Verify it is a polygon before adding
            if (feature.geometry.type === "Polygon" || feature.geometry.type === "MultiPolygon") {
                statePolygons.addLayer(layer);
            }
        }
    });
    myLogger.debug(statePolygons);

    // Set choices
    //
    myArea = jQuery("#select-area").val();
    
    // Build map
    //
    if(/^all\b/i.test(myArea)) {

        // Create 4 maps
        //
        createFourMaps();

        // Close message
        //
        fadeModal(2000);
    }
    
    // Build map
    //
    else {

        // Create state map
        //
        createStateMap();

        // Close message
        //
        fadeModal(2000);
    }
}

// ==================================================
// Functions
// ==================================================

// Determine icon
//

// Set icon
//
function setIcon(status, myNetworks, funding) {

    let iconColor        = 'Gold';
    let iconSymbol       = 'Circle';

    let imgAlt           = [];

   // Type
   //
   if(myNetworks.length > 1)
     {
      iconSymbol = 'Star';
      imgAlt.push("Several site types");
     }
    else if(myNetworks.includes("Long-Term Hydrologic Trends and Extremes"))
     {
      iconSymbol = 'Square';
      imgAlt.push("Long-Term Hydrologic Trends and Extremes site");
     }
    else if(myNetworks.includes("Boundaries, Compacts, Treaties and Federal Lands"))
     {
      iconSymbol = 'Diamond';
      imgAlt.push("Boundaries, Compacts, Treaties and Federal Lands site");
     }
   else if(myNetworks.includes("Water Budgets"))
     {
      iconSymbol = 'Triangle';
      imgAlt.push("Water Budgets site");
     }
   else if(myNetworks.includes("Water Quality"))
     {
      iconSymbol = 'UTriangle';
      imgAlt.push("Water Quality site");
     }
   else
     {
      iconSymbol = 'Circle';
      imgAlt.push("Water Forecasting and Operations site");
     }

   // Status
   //
   if(/^active\b/i.test(status))
     {
      imgAlt.push("Active");
         if(/^full\b/i.test(funding)) {
             iconColor = "Blue";
             imgAlt.push("Fully funded");
         }
         else if(/^partial\b/i.test(funding)) {
             iconColor = "Orange";
             imgAlt.push("Partially funded");
         }
         else {
             iconColor = "Gold";
             imgAlt.push("No funding");
         }
     }
   else
     {
         imgAlt.push("Inactive");
         iconColor = "Grey";
     }

    // var iconUrl = 'Symbols/' + [iconColor, iconSymbol].join("-") + '.gif';
    var iconUrl = 'Symbols/' + [iconColor, iconSymbol].join("-") + '.svg';
    // var iconUrl = 'Symbols/Black-Circle.svg'
    // Set style
    //
    var myIcon = new L.Icon(
                 {
                  iconUrl: iconUrl,
                  iconSize: [12, 12],
                  iconAnchor: [1, 1],
                  popupAnchor: [1, -2],
                  imgAlt: imgAlt.join(" ")
                 });
               
   return myIcon;
}

// Set site counts in status summary table
//
function SetSiteCounts (mySiteSet) {
    myLogger.info("SetSiteCounts ");
    
    let myList = $('#select-sitetype option').map(function() { return this.value; }).get();
    let mySiteTypes = myList.filter(site => /^(?!All\b)/i.test(site));
    
    // Add counts to legend table directly beneath map
    //
    for (const mySiteType of mySiteTypes) {
        let myItem = mySiteType.replace(/[ ,]/g, "");
        let myActiveList = mySiteSet.filter(site => site.FPSNetwork.includes(mySiteType) &&
                                            /^Active$/i.test(site.OperatingStatus))
        $(`#Active${myItem}`).text(myActiveList.length);
        let myInactiveList = mySiteSet.filter(site => site.FPSNetwork.includes(mySiteType) &&
                                                                /^Inactive$/i.test(site.OperatingStatus))
        $(`#Inactive${myItem}`).text(myInactiveList.length);

        $(`#Total${myItem}`).text(`${myActiveList.length + myInactiveList.length}`);
        myLogger.info(`SetSiteCounts ${myItem} ${myActiveList.length} ${myInactiveList.length} ${myActiveList.length + myInactiveList.length}`);
    }

    return;
   }
        
// Builds four overview maps 
//
function createFourMaps() {
    myLogger.info('createFourMaps');

    //closeModal();
    message = "Preparing all states and territories";
    openModal(message);

    // Set insert maps
    //
    $('#mapState').hide();
    $(".state-level").hide();

    $("#mapUSA").show();
    $(".insertMaps").show();
    $(".national-level").show();

    let width = $("#mapUSA").width() * 0.33;
    $("#mapAlaska").css('width', width);
    $("#mapHawaii").css('width', width);
    $("#mapPuertoRico").css('width', width);

    // Does initial USA map exist
    //
    if(!mapUSA) {
        mapUSA = new L.map('mapUSA', { attributionControl: false, scrollWheelZoom: false, zoomControl: false });

        // Create map pane for us sites allow click on states polygons
        //
        dummyPane = mapUSA.createPane('usaSites');
        mapUSA.getPane('usaSites').style.pointerEvents = 'none';
        mapUSA.getPane('usaSites').style.zIndex = 600;

        // Disable controls for USA map view
        //
        $(".leaflet-control-zoom").css("visibility", "hidden");
        mapUSA.dragging.disable();
        mapUSA.touchZoom.disable();
        mapUSA.doubleClickZoom.disable();
        mapUSA.scrollWheelZoom.disable();

        // Set the initial USA map view
        //
        mapUSA.fitBounds(mapAreas['USA']);

        // Add base map
        //
        let usaBasemap = L.tileLayer(basemap_tile_service, {attribution: "Tiles &copy; Esri, USGS"});
        mapUSA.addLayer(usaBasemap);
        myLogger.info('created mapUSA');

        // Add state polygons
        //
        dummyPane = mapUSA.createPane('statesBoundary');
        mapUSA.getPane('statesBoundary').style.zIndex = 610;
        mapUSA.getPane('statesBoundary').style.pointerEvents = 'auto';

        let usaPolygons = L.geoJSON(statePolygons.toGeoJSON(), {
            pane: 'statesBoundary',
            style: defaultStyle,
        }).addTo(mapUSA).bringToFront();
        let selectedState = null;
        usaPolygons.on('click', function(e) {
            if (selectedState) {
                selectedState.setStyle(defaultStyle);
            }

            // Set the newly clicked layer as the selected layer
            //
            selectedState = e.layer;

            // 1. Get properties
            //
            const properties = selectedState.feature.properties;
            myLogger.info("Properties:", properties);
            myLogger.info("Polygon Name:", properties.NAME);

            $('#select-area').val(properties.NAME);
            let url = new URL(window.location.href);
            url.searchParams.set("state_nm", properties.NAME);

            createStateMap();
        });
    }

    [myUsaSet, customList] = filterSites(usaSites)

    // Add layer of selected sites
    //
    let myUsaSites = new L.FeatureGroup(customList);

    mapUSA.addLayer(myUsaSites);
                               
    myLogger.info('created mapUSA');
    
    // Does initial Alaska map exist
    //
    //myLogger.info("Total Alaska sites:", alaskaSites.getLayers().length);
    if(!mapAlaska) {
        mapAlaska = new L.map('mapAlaska', { attributionControl: false, scrollWheelZoom: false, zoomControl: false });

        mapAlaska.dragging.disable();
        mapAlaska.touchZoom.disable();
        mapAlaska.doubleClickZoom.disable();
        mapAlaska.scrollWheelZoom.disable();

        mapAlaska.fitBounds(mapAreas['Alaska']);

        // Add base map
        //
        let alaskaBasemap = L.tileLayer(basemap_tile_service, {attribution: "Tiles &copy; Esri, USGS"});
        mapAlaska.addLayer(alaskaBasemap);

        mapAlaska.on('click', function(e) {
            $('#select-area').val('Alaska');
            createStateMap();
        });
    }

    [myAlaskaSet, customList] = filterSites(alaskaSites)

    // Add layer of selected sites
    //
    let myAlaskaSites = new L.FeatureGroup(customList);

    mapAlaska.addLayer(myAlaskaSites);
    myLogger.info('created mapAlaska');

   // Does initial Hawaii map exist
   //
    if(!mapHawaii) {
        mapHawaii = new L.map('mapHawaii', { attributionControl: false, scrollWheelZoom: false, zoomControl: false });

        mapHawaii.dragging.disable();
        mapHawaii.touchZoom.disable();
        mapHawaii.doubleClickZoom.disable();
        mapHawaii.scrollWheelZoom.disable();

        mapHawaii.fitBounds(mapAreas['Hawaii']);

        // Add base map
        //
        let hawaiiBasemap = L.tileLayer(basemap_tile_service, {attribution: "Tiles &copy; Esri, USGS"});
        mapHawaii.addLayer(hawaiiBasemap);

        mapHawaii.on('click', function(e) {
            $('#select-area').val('Hawaii');
            createStateMap();
        });
    }

    [myHawaiiSet, customList] = filterSites(hawaiiSites)

    // Add layer of selected sites
    //
    let myHawaiiSites = new L.FeatureGroup(customList);

    mapHawaii.addLayer(myHawaiiSites);
    myLogger.info('created mapHawaii');

    // Does initial Puerto Rico map exist
    //
    if(!mapPuertoRico) {
        mapPuertoRico = new L.map('mapPuertoRico', { attributionControl: false, scrollWheelZoom: false, zoomControl: false });

        mapPuertoRico.dragging.disable();
        mapPuertoRico.touchZoom.disable();
        mapPuertoRico.doubleClickZoom.disable();
        mapPuertoRico.scrollWheelZoom.disable();

        mapPuertoRico.fitBounds(mapAreas['Puerto Rico']);

        // Add base map
        //
        let puertoricoBasemap = L.tileLayer(basemap_tile_service, {attribution: "Tiles &copy; Esri, USGS"});
        mapPuertoRico.addLayer(puertoricoBasemap);

        mapPuertoRico.on('click', function(e) {
            $('#select-area').val('Puerto Rico');
            myLogger.info('Create map for Puerto Rico');
            createStateMap();
        });
    }

     [myPRSet, customList] = filterSites(puertoricoSites)

    // Add layer of selected sites
    //
    let myPRSites = new L.FeatureGroup(customList);

    mapPuertoRico.addLayer(myPRSites);
    myLogger.info('created mapPuertoRico');

    // Set site list
    //
    let mySiteSet = [...myUsaSet, ...myAlaskaSet, ...myHawaiiSet, ...myPRSet]
    
    // Set site counts
    //
    SetSiteCounts(mySiteSet)

    // Build table
    //
    createTable(mySiteSet);

    // Close message
    //
    closeModal();

    return;
}
        
// Builds four overview maps 
//
function modifyFourMaps() {
    myLogger.info('modifyFourMaps');

    message = "Preparing all states and territories";
    openModal(message);

    [myUsaSet, customList] = filterSites(usaSites)

    // Add layer of selected sites
    //
    //if(mapUSA.hasLayer(myUsaSites)) { map.removeLayer(myUsaSites); }
    myUsaSites = new L.FeatureGroup(customList);

    mapUSA.addLayer(myUsaSites);

    [myAlaskaSet, customList] = filterSites(alaskaSites)

    // Add layer of selected sites
    //
    let myAlaskaSites = new L.FeatureGroup(customList);

    mapAlaska.addLayer(myAlaskaSites);

    [myHawaiiSet, customList] = filterSites(hawaiiSites)

    // Add layer of selected sites
    //
    let myHawaiiSites = new L.FeatureGroup(customList);

    mapHawaii.addLayer(myHawaiiSites);

     [myPRSet, customList] = filterSites(puertoricoSites)

    // Add layer of selected sites
    //
    let myPRSites = new L.FeatureGroup(customList);

    mapPuertoRico.addLayer(myPRSites);

    // Set site list
    //
    let mySiteSet = [...myUsaSet, ...myAlaskaSet, ...myHawaiiSet, ...myPRSet]
    
    // Set site counts
    //
    SetSiteCounts(mySiteSet)

    // Build table
    //
    createTable(mySiteSet);

    // Close message
    //
    closeModal();

    return;
}
        
// Builds state-level map 
//
function createStateMap() {
    myLogger.info("createStateMap");

    // Set choices
    //
    myArea = jQuery("#select-area").val();
    let myStateTest = new RegExp(`\^${myArea}\$`, "i");
    let zoom2Start = false

    // Set maps
    //
    $(".mapUSA").hide();
    $(".insertMaps").hide();
    //$(".national-level").hide();

    $(".mapState").show();
    //$(".state-level").show();
    $("#areaName").text(myArea);

    // Set map
    //
    if(!map) {
        map = new L.map('mapState', { attributionControl: false, scrollWheelZoom: false, zoomControl: false });

        // Create map pane for higlighted/unlighted site
        //
        customPane = map.createPane('customPane');
        map.getPane('customPane').style.zIndex = 620;

        // Create map pane for selected set using the left panel
        //
        customPane = map.createPane('customSites');
        map.getPane('customSites').style.pointerEvents = 'auto';
        map.getPane('customSites').style.zIndex = 615;

        // Zoom message
        //
        $(".mapState").on("mouseover", function () {
            if(!myZoomFlag) {
                myZoomFlag = true
                message = "Use Shift-Left Mouse Drag: Select a region by pressing the Shift key and dragging the left mouse button"
                openModal(message);
                fadeModal(2000);
            }
        });
    }

    // Set map bounds
    //
    stateBoundary = getStateBoundary();

    // Reset Alaska map bounds
    //
    if(stateBoundary) {
        if(/^alaska/i.test(myArea)) { map.fitBounds(mapAreas['Alaska']); }
        else { map.fitBounds(stateBoundary.getBounds()); }
    }
    lastZoom = map.getZoom();
    
    // Add base map
    //
    var stateBasemap = L.tileLayer(basemap_tile_service, {attribution: "Tiles &copy; Esri, USGS"});
    map.addLayer(stateBasemap);

    // Add to the map
    //
    map.addLayer(statePolygons);

    // Pan/Zoom and Home events
    //
    map.on('moveend', function(evt) {

        // Determine if pan or zoom occurs or return to state view
        //
        let myEvent = $('#currentArea').val();
        myLogger.info(`myEvent ${myEvent}`)

        // Loading message
        //
        message = `Preparing map from ${myEvent} Event`
        openModal(message);

        myLogger.info(`${message}`)

        // Close popup
        //
        map.closePopup();

        mapBounds = map.getBounds();

        // Select sites by state
        //
        if(myEvent === "area") {
            [mySiteSet, customList] = filterSites(allSites);
        }

        // Select sites within map extent
        //
        else {
            [mySiteSet, customList] = filterByMapextent(allSites, mapBounds);
        }

        // Add to the map
        //
        map.addLayer(allSites);

        // Count sites
        //
        if(mySiteSet.length > 0) {

            // Show fps contact information
            //
            setFpsContacts()

            // Set site counts
            //
            SetSiteCounts(mySiteSet)

            // Build table
            //
            createTable(mySiteSet);

            // Modify table caption state view
            //
            if(myEvent === "area") { $("span#pan-zoom").text(`for ${myArea}`); }
            else { $("span#pan-zoom").text(''); }

            // Build popup
            //
            customSites = new L.FeatureGroup(customList);
            customSites.on('click', function(e) {
                let mySite = e.layer.properties;
                clickOnSite (mySite)
            });
        }

        // No selected sites
        //
        else {
            // Loading message
            //
            //message = "No sites were selected in " + myArea + " for " + myStatus + " status type(s)";
            message = "No sites are located within map extent";
            openModal(message);
            fadeModal(3000);

            myLogger.info(message);

            // Show national information
            //
            $(".national-level").show();
            $(".state-level").hide();
            setFpsContacts (null)

            // Remove rows and update table caption
            //
            var table = new DataTable('#stationsTable');

            table.clear().draw();

            var caption = `USGS Streamgages - 0 sites (includes 0 Federal Priority Streamgages)`;
            $('#stationsCaption').html(caption);
        }

        fadeModal(1000);
    });

    // Add home button
    //
    if(zoomBar) {
        myLogger.info('Remove zoom bar');
        //    zoomBar = new L.Control.ZoomBar({position: 'topleft'}).addTo(map);
        map.removeControl(zoomBar);
    }
    let myBounds = L.latLngBounds(map.getBounds());
    myLogger.debug(`BBOX: South: ${myBounds.getSouth()}, North: ${myBounds.getNorth()}, West: ${myBounds.getWest()}, East: ${myBounds.getEast()}`);
    zoomBar = new L.Control.ZoomBar({
        position: 'topleft',
        homeBounds: [ [myBounds.getSouth(), myBounds.getWest()],
                      [myBounds.getNorth(), myBounds.getEast()]
                    ]}).addTo(map);

    // Set the type movement to zoom, pan, or area (state)
    //
    map.on('zoomstart', function(evt) {
        if(zoom2Start) { $('#currentArea').val('area'); }
        else { $('#currentArea').val('zoom'); }
        zoom2Start = false
        myLogger.info(`Triggered zoom ${$('#currentArea').val()} zoom2Start ${zoom2Start}`)
    });
    map.on('dragstart', function(evt) {
        if(zoom2Start) { $('#currentArea').val('area'); }
        else { $('#currentArea').val('pan'); }
        zoom2Start = false
        myLogger.info(`Triggered pan ${$('#currentArea').val()} zoom2Start ${zoom2Start}`)
    });
    $('.leaflet-control-zoom-to-start').on('click', function(e) {
        zoom2Start = true
        $('#currentArea').val('area');
        myLogger.info(`Triggered zoom-to-start ${zoom2Start}`)
    });
    $('.leaflet-control-zoom-to-area').on('click', function(e) {
        zoom2Start = false
        $('#currentArea').val('zoom');
        myLogger.info(`Triggered zoom-to-area ${$('#currentArea').val()}`)
    });

    // Select sites
    //
    [mySiteSet, customList] = filterSites(allSites);
    
    // Count sites
    //
    if(mySiteSet.length > 0) {

        // Show contact information
        //
        setFpsContacts()

        myLogger.info(`Selected ${mySiteSet.length} sites for myArea`);
        myLogger.info(mySiteSet);

        // Add to the map
        //
        map.addLayer(allSites);

        // Set site counts
        //
        SetSiteCounts(mySiteSet)

        // Build table
        //
        createTable(mySiteSet);

        // Modify table caption state view
        //
        $("span#pan-zoom").text(`for ${myArea}`);

        // Build popupfor sites within mapextent
        //
        customSites = new L.FeatureGroup(customList);
        customSites.on('click', function(e) {
            let mySite = e.layer.properties;
            clickOnSite (mySite)
        });
    }
    
    // No selected sites
    //
    else {
        // Loading message
        //
        //message = "No sites were selected in " + myArea + " for " + myStatus + " status type(s)";
        message = "No sites are located within map extent";
        openModal(message);
        fadeModal(3000);
        
        myLogger.info(message);

        // Show national information
        //
        setFpsContacts()

        // Remove rows and update table caption
        //
        var table = new DataTable('#stationsTable');

        table.clear().draw();

        var caption = `USGS Streamgages - 0 sites (includes 0 Federal Priority Streamgages)`;
        $('#stationsCaption').html(caption);
    }

   fadeModal(3000);
              
   return;
}
 
// Build custom sites
//
function clickOnSite (mySite) {
    myLogger.info(`Clicked site ${mySite.SiteNumber}`);

    // Check if in table
    //
    if($(`tr#tr_${mySite.SiteNumber}`).length) {
        myLogger.info(`Click site ${mySite.SiteNumber}`);

        let clickContent     = createPopUp(mySite);
        //let myPopup          = e.layer.bindPopup(clickContent,popupOptions).openPopup();
        //$(".leaflet-popup-close-button").before('<div class="leaflet-popup-title">Site Information</div>');

        // Enable selection of network and reset sites visible
        //
        $(".clickToTable").on( "click", function( e ) {
            var mySite  = $(this).prop('id');
            //console.log("Clicked site " + mySite);

            // Scroll down to table
            //
            document.getElementsByName(`tr_${mySite}`).scrollIntoView();
            $(`#tr_${mySite}`).css("border", "3px solid red");
            //$("#tr_" + mySite).css("background-color", "#ede978");
            //$("#tr_" + mySite).css("bgcolor", "#ede978");
            setTimeout(function() {
                $(`#tr_${mySite}`).css("border", "1px solid Red");
            }, 3000);
        });
    }

    return;
}
 
// Build custom sites
//
function getStateBoundary () {
    myLogger.info("getStateBoundary");

    let stateBoundary = null;

    // Set choices
    //
    let myArea = jQuery("#select-area").val();
    let myStateTest = new RegExp(`\^${myArea}\$`, "i");

    // State polygons exists clear
    //
    statePolygons.setStyle(defaultStyle);

    // Set state boundary
    //
    myLogger.info(`Search state boundary for ${myArea}`);
    statePolygons.eachLayer(function(layer) {

        // Verify the layer is a GeoJSON feature and has properties
        //
        if (layer.feature && layer.feature.properties) {

            // Check if the property matches your target value
            //
            stateName = layer.feature.properties.NAME
            if(myStateTest.test(stateName)) {

                // Select/highlight the polygon (e.g., change style)
                //
                myLogger.info(`State boundary for ${stateName}`);
                layer.setStyle(selectedStyle);
                stateBoundary = layer;
                //map.fitBounds(stateBoundary.getBounds());
                layer.setStyle(selectedStyle);
            }
        }
    });

    return stateBoundary;
}
 
// Build custom sites
//
function setFpsContacts () {
    myLogger.info("setFpsContacts");

    // Set choices
    //
    myArea = jQuery("#select-area").val();
    myLogger.info("myArea", myArea);
    myLogger.info("myWSCs", myWSCs);
    myLogger.info("myCenter", myWSCs[myArea]);

    let myEvent = $('#currentArea').val();
    myLogger.info(`myEvent ${myEvent}`)

    myCenter = null;
    if(myEvent === 'area' && myWSCs[myArea]) myCenter = myCenters[myWSCs[myArea]];
    myLogger.info("myCenter", myCenter);

    // Prepare contact info for area level
    //
    if(myCenter) {
        $(".national-level").hide();
        $(".state-level").show();

        $("#stateName").text(myCenter.CenterName);
        $("#contactName").text(`${myCenter.CenterContact}`);
        $("#contactPhoneNumber").text(`${myCenter.CenterPhone}`);
        $("#contactEmail").prop("href", `"https://water.usgs.gov/cgi-bin/feedback_form?${myCenter.Email}"`);
    }

    else {
        $(".state-level").hide();
        $(".national-level").show();
    }

    return;
}
 
// Build custom sites
//
function buildCustomSites (mySiteSet) {
    myLogger.debug("buildCustomSites");
   
    // Process selected sites
    //
    let customList = []
    for(let i = 0; i < mySiteSet.length; i++) {

        let site = mySiteSet[i];
        let site_no = site.SiteNumber;

        // Set marker
        //
        myIcon = site.symbol

        // Add layer
        //
        let latlng  = L.latLng({ lat: site.Latitude, lng: site.Longitude });
        let layer   = L.marker(latlng, {pane: 'customSites', icon: myIcon, title: site_no } );

        // Popup and highlight/unhighlight site in list of left panel
        //
        layer.on({
            click: (function(evt) { createPopUp(evt.target, site) }),
        });

        // Build custom layer
        //
        customList.push(layer);
    }
    myLogger.info(`Selected ${customList.length} sites for ${myArea}`, customList);

    return customList
}

// Build site summary table
//
function createTable (mySiteSet) {
    myLogger.info("createTable ");
    
    // Build geojson
    //
    myGeoJson = {
        type: "FeatureCollection",
        features: mySiteSet.map(site => ({
            type: "Feature",
            geometry: {
                type: "Point",
                coordinates: [site.Longitude, site.Latitude]
            },
            properties: {
                SiteNumber: site.SiteNumber,
                SiteName: site.SiteName,
                StateName: site.StateName,
                CenterCode: site.CenterCode,
                CenterName: site.CenterName,
                FPSFunding: site.FPSFunding,
                OperatingStatus: site.OperatingStatus,
                FPSNetwork: site.FPSNetwork
            }
        }))
    };

    // Prepare table
    //
    let summary_table = [];

    let myActiveList = mySiteSet.filter(site => /^Active$/i.test(site.OperatingStatus));
    let myFullList = mySiteSet.filter(site => /^Full/i.test(site.FPSFunding));
    let myPartialList = mySiteSet.filter(site => /^Partial/i.test(site.FPSFunding));
    let myNoFundsList = mySiteSet.filter(site => /^No/i.test(site.FPSFunding));

    let caption = [`USGS Federal Priorities Streamgage Status & Federal`,
                   `-- ${mySiteSet.length} sites`,
                   `<br>\ (${myActiveList.length} active with`,
                   `${myFullList.length} fully FPS funded,`,
                   `${myPartialList.length} partially FPS funded, and`,
                   `${myNoFundsList.length} no FPS funded)`,
                   `<br>\ [Updated: ${process_dt}]`
                  ];
    let myArea = jQuery("#select-area").val();
    if(/^(?!All\b)/i.test(myArea)) { caption[0] = `USGS Federal Priorities Streamgage Status & Federal <span id="pan-zoom">for ${myArea}</span>` }

    //summary_table.push(`<span id="stationsCaption" class="w-100 text-center fs-5 fw-bold">${caption}</span>`);
    summary_table.push('<table id="stationsTable" class="table table-striped-columns fs-5">');
    summary_table.push(`<caption id="stationsCaption" class="caption-top text-center fs-5 fw-bold border-bottom">${caption.join(' ')}</caption>`);
    summary_table.push('<thead class="text-start fs-6 fw-bold">');
    summary_table.push('<tr scope="row">');
    summary_table.push(' <th scope="col">Site<br />Number</th>');
    summary_table.push(' <th scope="col">Site<br />Name</th>');
    summary_table.push(' <th scope="col">Status</th>');
    summary_table.push(' <th scope="col">USGS <br />Funding</th>');
    summary_table.push(' <th scope="col">Water Forecasting and Operations</th>');
    summary_table.push(' <th scope="col">Long-Term Hydrologic Trends and Extremes</th>');
    summary_table.push(' <th scope="col">Boundaries, Compacts, Treaties and Federal Lands</th>');
    summary_table.push(' <th scope="col">Water Budgets</th>');
    summary_table.push(' <th scope="col">Water <br />Quality</th>');
    summary_table.push('</tr>');
    summary_table.push('</thead>');

    summary_table.push('<tbody class="text-start fs-6 fw-bold">');

    // Loop through sites
    //
    let myRe = /^\d{8,15}$/;
    let myList = $('#select-sitetype option').map(function() { return this.value; }).get();
    let mySiteTypes = myList.filter(site => /^(?!All\b)/i.test(site));
    
    for (const site of mySiteSet) {
        summary_table.push(`<tr scope="row" id="tr_${site.SiteNumber}" name="tr_${site.SiteNumber}">`);
        if(myRe.test(site.SiteNumber)) {
            summary_table.push(`<td scope="col"><a href="https://waterdata.usgs.gov/monitoring-location/${site.AgencyCode}-${site.SiteNumber}" target="_blank">${site.SiteNumber}</a></td>`);
        }
        else {
            summary_table.push(`<td scope="col">${site.SiteNumber}</td>`);
        }
        summary_table.push(`<td scope="col">${site.SiteName}</td>`);
        summary_table.push(`<td scope="col">${site.OperatingStatus}</td>`);
        summary_table.push(`<td scope="col">${site.FPSFunding}</td>`);
        for (const mySiteType of mySiteTypes) {
            if(site.FPSNetwork.includes(mySiteType)) {
                let myIcon = setIcon(site.OperatingStatus,
                                     [mySiteType],
                                     site.FPSFunding)
                let imgSrc = myIcon.options.iconUrl;
                let imgAlt = myIcon.options.imgAlt;

                summary_table.push(`<td scope="col" class="cell_center"><img src="${imgSrc}" width="18" alt="${imgAlt}"></td>`);
            }
            else {
                summary_table.push('<td scope="col" class="cell_center">---</td>');
            }
        }
        summary_table.push('</tr>');            
    }

    // Build table
    //
    $('#siteTable').html("");
    $("#siteTable").html(summary_table.join("\n"));
    te_DataTable("#stationsTable",
                 `${caption}`,
                 "FPS_" + myArea);

    // Close message
    //
    closeModal();

    return;
  }