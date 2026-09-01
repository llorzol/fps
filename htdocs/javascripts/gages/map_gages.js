/**
 * Namespace: Map_Gages
 *
 * Map_Gages is a JavaScript library to provide a set of functions to build
 *  a Federal Priority Streamgages (FPS) Web Site.
 *
 * version 1.86
 * December 1, 2021
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
                           "USA":         [ [56.36525, -155.56641], [5.96575, -33.57422] ]
                          };

var myZoomFlag          = false;

// Set feature groups
//
var allSites            = new L.FeatureGroup();

var usaSites            = new L.FeatureGroup();
var alaskaSites         = new L.FeatureGroup();
var hawaiiSites         = new L.FeatureGroup();
var guamSites           = new L.FeatureGroup();
var puertoricoSites     = new L.FeatureGroup();

var activeSites         = new L.FeatureGroup();
var inactiveSites       = new L.FeatureGroup();
var partialSites        = new L.FeatureGroup();
var proposedSites       = new L.FeatureGroup();
var otherSites          = new L.FeatureGroup();
var borderSites         = new L.FeatureGroup();
var compactSites        = new L.FeatureGroup();
var qwSites             = new L.FeatureGroup();
var nwsSites            = new L.FeatureGroup();
var nrcsSites           = new L.FeatureGroup();

var topoLayer           = null;

var stateBoundary       = null;

// Set map variables
//
var popup;
var popupOptions        = { 'maxHeight': '250', 'maxWidth': '300' };

var map;
var mapUSA;
var mapAlaska;
var mapHawaii;
var mapGuam;
var mapPuertoRico;

var maxZoom             = 13;
var usaZoomLevel        = null;

var zoomHome            = null;

var printControl        = null;

// Prepare when the DOM is ready 
//
function buildMap()
  {
   console.log("buildMap");

   // Loading message
   //
   //message = "Building map ";
   //openModal(message);

   // Hide maps
   //
   $('#mapUSA').hide();
   $('.insertMaps').hide();
   $('.mapState').hide();
   $('.state-level').hide();
   $(".printMap").hide();

   // Add sites to map layers and build/bind popups
   //
   var myLayer;
   for(var i = 0; i < mySites.length; i++)
      {
        var site_no          = mySites[i]['SiteNumber'];
        var station_nm       = mySites[i]['SiteName'];
        var state_abbrev     = mySites[i]['StateName'].toLowerCase();
        var agencyusecode    = mySites[i]['AgencyUseCode'];
        var active_va        = mySites[i]['Active'];
        var centercode          = mySites[i]['CenterCode'];
        var typecode         = mySites[i]['TypeCode'];
        var realtime         = mySites[i]['RealTime'];
        var border           = mySites[i]['BorderSite'];
        var compact          = mySites[i]['CompactSite'];
        var bordercompact    = mySites[i]['BorderCompactSite'];
        var qw_site          = mySites[i]['WaterQualitySite'];
        var basin            = mySites[i]['KeyRiverBasinSite'];
        var sentinel         = mySites[i]['SentinelWatershedSite'];
        var nws_site         = mySites[i]['NWSForecastSite'];
        var nrcs_site        = mySites[i]['NRCSSite'];
        var score            = mySites[i]['Score'];
        var latitude         = mySites[i]['Latitude'];
        var longitude        = mySites[i]['Longitude'];

        var fullFunding      = mySites[i]['FPSFullFunding'];
        var partialFunding   = mySites[i]['FPSPartialFunding'];

        var networks         = [];
        if(parseInt(qw_site) > 0)                             { networks.push("Water Quality"); }
        if(parseInt(bordercompact) > 0)                       { networks.push("Compact/Border"); }
        //if(parseInt(compact) > 0 || parseInt(border) > 0)     { networks.push("Compact/Border"); }
        if(parseInt(basin) > 0)                               { networks.push("Water Availabilty"); }
        if(parseInt(sentinel) > 0)                            { networks.push("Sentinel"); }
        if(parseInt(nws_site) > 0 || parseInt(nrcs_site) > 0) { networks.push("Forecast"); }

        var status           = "Inactive";
        // if(agencyusecode in agencyUseCodes)
        //   {
        //    status = agencyUseCodes[agencyusecode];
        //   }
        if(active_va === 'Y')
          {
           status = 'Active';
          }
        //console.log("Site " + site_no + " Status " + status + " agencyusecode " + agencyusecode);
     
        // Funding level
        //
        var funding          = 'None';
        if(fullFunding == 'Y') { funding = 'Full'; }
        if(partialFunding == 'Y') { funding = 'Partial'; }

        var myIcon           = style(status, networks, funding);
        var latlng           = L.latLng({ lat: latitude, lng: longitude });
        var layer            = L.marker(latlng, {icon: myIcon, title: site_no, site_no: site_no});
     
        // Fix Guam sites attached to Hawaii
        //
        if(longitude > 130.00) { state_abbrev = "gu"; }

        // Add sites to site hash
        //
        if(!(site_no in mySiteInfo)) { mySiteInfo[site_no] = {}; }

        mySiteInfo[site_no]['site_no']      = site_no;
        mySiteInfo[site_no]['station_nm']   = station_nm;
        mySiteInfo[site_no]['status']       = status;
        mySiteInfo[site_no]['networks']     = networks;
        mySiteInfo[site_no]['state_abbrev'] = state_abbrev;
        mySiteInfo[site_no]['centercode']      = centercode;
        mySiteInfo[site_no]['funding']      = funding;

        // Add sites to layer groups based on type
        //  [Need to replicate each layer first to allow multiple maps]
        //
        switch(state_abbrev)
          {
            case "ak":
              var newLayer      = L.marker(latlng, {icon: myIcon, title: site_no, site_no: site_no});
              alaskaSites.addLayer(newLayer);
              break;
     
            case "hi":
              var newLayer      = L.marker(latlng, {icon: myIcon, title: site_no, site_no: site_no});
              hawaiiSites.addLayer(newLayer);
              break;
     
            case "gu":
              var newLayer      = L.marker(latlng, {icon: myIcon, title: site_no, site_no: site_no});
              guamSites.addLayer(newLayer);
              break;
     
            case "pr":
              var newLayer      = L.marker(latlng, {icon: myIcon, title: site_no, site_no: site_no});
              puertoricoSites.addLayer(newLayer);
              break;
     
            default:
              var newLayer      = L.marker(latlng, {icon: myIcon, title: site_no, site_no: site_no});
              usaSites.addLayer(newLayer);
              break;
          }

        // Build layer for all sites
        //
        allSites.addLayer(layer);

        // Build state code list for left panel
        //
        if(typeof stateAbbrev2nm[state_abbrev] !== "undefined")
          {
           var stateName = stateAbbrev2nm[state_abbrev];
           if(typeof myAreaList[stateName] === "undefined")
             {
              myAreaList[stateName] = state_abbrev;
             }
          }

        // Missing state code
        //
        else
          {
           console.log("Missing state abbrev " + state_abbrev + " for site " +  site_no);
          }
         
        // Attach cursor events
        //
        layer.on({
                  //mouseover: highlightFeature,
                  //mouseout: resetHighlight
                 });
	}
  //console.log('mySiteInfo');
  //console.log(mySiteInfo);

  // Build area selection in left panel
  //
  //console.log(myAreaList);
  buildAreaList(myAreaList);
  
  // Check what the area currently set to
  //
  $(".select-area").on( "change", function( e ) {  
 
      myArea = null;
 
      // Check individual selection
      //
      var myChoice = $('.select-area').select2('data');
      console.log('myChoice');
      console.log(myChoice);
 
      // Determine center/office choice
      //
      if(myChoice.length > 0)
        {
         mySelectedList = [];
         for(var i = 0; i < myChoice.length; i++)
            {
             var ID   = myChoice[i].id;
             var text = myChoice[i].text;
             myArea   = text;
             break;
            }

         // Loading message
         //
         message = "Preparing map for " + myArea;
         openModal(message);
  
         // Clear URL
         //
         clearQueryStringParam()

         // Add state or territory name and update URL
         //
         updateQueryStringParam('state_nm', myArea)
   
         // Check what state or territory are currently set to
         //
         if(/^all/i.test(myArea))
           {
            createMaps();
           }
         else
           {
            createStateMap();
           }
        }
  });

  // Build network selection in left panel
  //
  //console.log(myNetworkList);
  buildNetworkList(myNetworkList);

  // Enable selection of network and reset sites visible
  //
  $(".select-network").on( "change", function( e ) {  
 
      myNetwork = null;
 
      // Check individual selection
      //
      var myChoice = $('.select-network').select2('data');
      console.log('myChoice');
      console.log(myChoice);
 
      // Determine center/office choice
      //
      if(myChoice.length > 0)
        {
         mySelectedList = [];
         for(var i = 0; i < myChoice.length; i++)
            {
             var ID    = myChoice[i].id;
             var text  = myChoice[i].text;
             myNetwork = text;
             break;
            }

         // Loading message
         //
         //message = "Preparing map for " + myArea;
         //openModal(message);
   
         // Check what state or territory are currently set to
         //
         if(/^all/i.test(myArea))
           {
            createMaps();
           }
         else
           {
            createStateMap();
           }
        }
  });

  // Build funding selection in left panel
  //
  //console.log(myFundingList);
  buildFundingList(myFundingList);

  // Enable selection of funding level and reset sites visible
  //
  $(".select-funding").on( "change", function( e ) {  
 
      myFunding = null;
 
      // Check individual selection
      //
      var myChoice = $('.select-funding').select2('data');
      console.log('myChoice');
      console.log(myChoice);
 
      // Determine center/office choice
      //
      if(myChoice.length > 0)
        {
         mySelectedList = [];
         for(var i = 0; i < myChoice.length; i++)
            {
             var ID    = myChoice[i].id;
             var text  = myChoice[i].text;
             myFunding = ID;
             break;
            }

         // Loading message
         //
         //message = "Preparing map for " + myArea;
         //openModal(message);
   
         // Check what state or territory are currently set to
         //
         if(/^all/i.test(myArea))
           {
            createMaps();
           }
         else
           {
            createStateMap();
           }
        }
  });

  // Create maps
  //
  if(/^all/i.test(myArea))
    {
     // Set area selection in left panel
     //
     $(".select-area").val('all').trigger('change');
               
     //createMaps();
    }
  else
    {
     // Set area selection in left panel
     //
     setArea(myArea);
               
     //createStateMap();
    }

  // Close message
  //
  fadeModal(3000);
}

//
// Functions
//
//================================================

// Set highlight
//
function highlightFeature(e) {
                               var layer = e.target;

                               //info.update(layer.feature.properties);
                             }

function resetHighlight(e) {
                             //info.update();
                           }

// Set icon
//
function style(status, myNetworks, funding) {

   var iconColor        = 'Red';
   var iconSymbol       = 'Circle';

   var imgAlt           = [];

   // Type
   //
   if(myNetworks.length > 1)
     {
      iconSymbol = 'Star';
      imgAlt.push("Several site types");
     }
   else if($.inArray("Water Quality", myNetworks) > -1)
     {
      iconSymbol = 'Square';
      imgAlt.push("Water Quality site");
     }
   else if($.inArray("Compact/Border", myNetworks) > -1)
     {
      iconSymbol = 'Triangle';
      imgAlt.push("Compact/Border site");
     }
   else if($.inArray("Water Availabilty", myNetworks) > -1)
     {
      iconSymbol = 'Diamond';
      imgAlt.push("Water Availabilt site");
     }
   else if($.inArray("Sentinel", myNetworks) > -1)
     {
      iconSymbol = 'Cross';
      imgAlt.push("Sentinel site");
     }
   else
     {
      iconSymbol = 'Circle';
      imgAlt.push("Forecast  site");
     }

   // Status
   //
   if(/^Active/i.test(status))
     {
      imgAlt.push("Active");
      switch(funding.toLowerCase())
        {
        case "full":
          iconColor = "Blue";
          imgAlt.push("Fully funded");
          break;
        case "partial":
          iconColor = "Green";
          imgAlt.push("Partially funded");
          break;
        default:
          iconColor = "Gray";
          imgAlt.push("No funding");
          break;
        }
     }
   else
     {
      imgAlt.push("Inactive");
     }

    var iconUrl = 'Symbols/' + [iconColor, iconSymbol].join("-") + '.gif';

    // Set style
    //
    var myIcon = new L.Icon(
                 {
                  iconUrl: iconUrl,
                  iconSize: [8, 8],
                  iconAnchor: [1, 1],
                  popupAnchor: [1, -2],
                  imgAlt: imgAlt.join(" ")
                 });
               
   return myIcon;
}
        
// Builds list of Wscs 
//
function buildAreaList(myAreaList)
  {
   console.log("buildAreaList for sites ");
   console.log("Current Area " + myArea);

   // Add to selection
   //
   var myList = [];
   jQuery.each(myAreaList, function(key, value) {
     //console.log("State code " + key + " ====> " + value);
     myList.push(key);  
   });
   myList.sort();

   myList.unshift('All states and territories');
   myAreaList['All states and territories'] = 'all';
      
   var newList = [];

   newList.push('<select class="select-area">');
   //newList.push('<option></option>');
       
   // Loop through employees
   //
   jQuery.each(myList, function(index, stateName) {
                   
      newList.push('<option value="' + myAreaList[stateName] + '">' + stateName + '</option>');
   });
   newList.push('</select>');
                   
   // Build select feature
   //
   //console.log("Centers");
   //console.log(newList.join(""));
   jQuery('#area-selection').html(newList.join(""));
   InitializeSingleDropDown('.select-area');
   //$('.select-area').select2();

   return;
}
        
// Set Area selection 
//
function setArea(myArea)
  {
   var stateAbbrev = stateNm2abbrev[myArea];
   $(".select-area").val(stateAbbrev).trigger('change');
              
   return;
}
        
// Builds list of Network 
//
function buildNetworkList(myNetworkList)
  {
   console.log("buildNetworkList for sites ");

   // Add to selection
   //
   var myList = [
                 "All",
                 "ForecastSites",
                 "WaterQualitySites",
                 "CompactBorderSites",
                 "BasinSites",
                 "SentinelSites"
                ];

   var newList = [];

   newList.push('<select class="select-network">');
   //newList.push('<option></option>');
       
   // Loop through employees
   //
   jQuery.each(myList, function(index, networkName) {
                   
      newList.push('<option value="' + networkName + '">' + myNetworkList[networkName] + '</option>');
   });
   newList.push('</select>');
                   
   // Build select feature
   //
   //console.log("Centers");
   //console.log(newList.join(""));
   jQuery('#network-selection').html(newList.join(""));
   InitializeSingleDropDown('.select-network');

   setNetwork('All');

   return;
}
        
// Set Network selection 
//
function setNetwork(myNetwork)
  {
      for ( var networkName in myNetworkList) {
                   
          if(myNetwork == myNetworkList[networkName])
          {
              $(".select-network").val(myNetwork).trigger('change');
              break;
          }
      }              
   return;
}
        
// Builds list of Funding 
//
function buildFundingList(myFundingList)
  {
   console.log("buildFundingList");

   // Add to selection
   //
   var myList = [
                 "All",
                 "Full",
                 "Partial",
                 "None"
                ];

   var newList = [];

   newList.push('<select class="select-funding">');
   //newList.push('<option></option>');
       
   // Loop through employees
   //
   jQuery.each(myList, function(index, fundingName) {
                   
      newList.push('<option value="' + fundingName + '">' + myFundingList[fundingName] + '</option>');
   });
   newList.push('</select>');
                   
   // Build select feature
   //
   //console.log("Centers");
   //console.log(newList.join(""));
   jQuery('#funding-selection').html(newList.join(""));
   InitializeSingleDropDown('.select-funding');

   setFunding('All');

   return;
}
        
// Set Funding selection 
//
function setFunding(myFunding)
  {
   for(var fundingName in myFundingList) {
                   
       if(myFunding == myFundingList[fundingName])
         {
          $(".select-funding").val(myFunding).trigger('change');
          break;
         }
      }              
                        
   return;
}
        
// Click on usa map 
//
function clickUsaMap(activeLayer, evt)
  {
   console.log("clickUsaMap");
            
   //var message = "Preparing state-level map";
   //openModal(message);

   // Set click
   //
   if(/^click/i.test(evt.type))
     {
      var dec_long_va    = evt.latlng.lng;
      var dec_lat_va     = evt.latlng.lat;
      var click_lat_long = L.latLng({ lat: dec_lat_va, lng: dec_long_va });
     }
 
   // Set zoom
   //
   else
     {
      var dec_long_va    = evt.target._animateToCenter.lng;
      var dec_lat_va     = evt.target._animateToCenter.lat;
      var click_lat_long = L.latLng({ lat: dec_lat_va, lng: dec_long_va });
     }

   // Loop through sites find to nearest
   //
   var minDistance = null;
   activeLayer.eachLayer(function(site) {
         var site_no          = site.options.title;
         var station_nm       = mySiteInfo[site_no]['station_nm'];
         var networks         = mySiteInfo[site_no]['networks'];
         var state_abbrev     = mySiteInfo[site_no]['state_abbrev'];

         var site_lat_long    = site.getLatLng();
         var distance_from_click = site_lat_long.distanceTo(click_lat_long);
         if(!minDistance) { minDistance = distance_from_click; }
         else if(distance_from_click < minDistance)
           {
            minDistance = distance_from_click;
            stateAbbrev = state_abbrev;
           }
   });
   //console.log("stateAbbrev " + stateAbbrev + " minDistance " + minDistance);

   // Set Area
   //
   var myArea = stateAbbrev2nm[stateAbbrev];
   setArea(myArea);

   // Set Map
   //
   createStateMap();

   return;
}
        
// Builds four overview maps 
//
function createMaps()
  {
   console.log("createMaps ");
            
   //closeModal();
   message = "Preparing all states and territories";
   openModal(message);
  
   // Clear URL
   //
   clearQueryStringParam()

   // Set insert maps
   //
   $('.mapState').hide();
   $(".state-level").hide();
   $("#countsTable").html('');
   $("#siteTable").html('');
   $(".printMap").hide();

   $(".mapUSA").show();
   $(".insertMaps").show();
   $(".national-level").show();
  
   console.log("creating US Map ");
   // Does initial USA map exist
   //
   if(typeof mapUSA === "undefined")
     {
      mapUSA = new L.map('mapUSA', { attributionControl: false, zoomControl: false });
     }
   console.log("create US Map ");

   var width = $(".mapUSA").width() * 0.33;
   $(".mapAlaska").css('width', width);
   $(".mapHawaii").css('width', width);
   $(".mapPuertoRico").css('width', width);
  
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
   if(!usaZoomLevel) { usaZoomLevel = mapUSA.getZoom(); console.log(" usaZoomLevel " + usaZoomLevel); }

   filterSites(usaSites)

   mapUSA.addLayer(usaSites);

   var usaBasemap = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}", {attribution: 'MRLC, State of Oregon, State of Oregon DOT, State of Oregon GEO, Esri, DeLorme, HERE, TomTom, USGS, NGA, EPA, NPS, U.S. Forest Service'});
   mapUSA.addLayer(usaBasemap);

   // Monitor click of USA map
   //
   mapUSA.on('click', function(evt) {
      console.log("Clicked USA map ");
   
      clickUsaMap(usaSites, evt)
   
   });

   // Monitor zoom of USA map
   //
   mapUSA.on('zoomend', function(evt) {
      console.log("Zoom USA map ");
   
      // Set zoom level
      //
      zoomLevelUSA = mapUSA.getZoom();
      console.log("zoomend USA map " + zoomLevelUSA);
   
      if(zoomLevelUSA > usaZoomLevel)
        {
         clickUsaMap(usaSites, evt)
        }
   });

   // Does initial Alaska map exist
   //
   if(typeof mapAlaska === "undefined")
     {
      mapAlaska = new L.map('mapAlaska', { attributionControl: false, zoomControl: false });
     }

   mapAlaska.dragging.disable();
   mapAlaska.touchZoom.disable();
   mapAlaska.doubleClickZoom.disable();
   mapAlaska.scrollWheelZoom.disable();

   mapAlaska.fitBounds(mapAreas['Alaska']);

   filterSites(alaskaSites)

   mapAlaska.addLayer(alaskaSites);

   var alaskaBasemap = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}", {attribution: 'MRLC, State of Oregon, State of Oregon DOT, State of Oregon GEO, Esri, DeLorme, HERE, TomTom, USGS, NGA, EPA, NPS, U.S. Forest Service'});
   mapAlaska.addLayer(alaskaBasemap);
   
   mapAlaska.on('click zoomend', function(evt) {
      console.log("Clicked Alaska map ");
   
      // Set the area
      //
      setArea("Alaska");
   
      // Check what state or territory are currently set to
      //
      filterSites(alaskaSites);
   });

   // Does initial Hawaii map exist
   //
   if(typeof mapHawaii === "undefined")
     {
      mapHawaii = new L.map('mapHawaii', { attributionControl: false, zoomControl: false });
     }

   mapHawaii.dragging.disable();
   mapHawaii.touchZoom.disable();
   mapHawaii.doubleClickZoom.disable();
   mapHawaii.scrollWheelZoom.disable();

   mapHawaii.fitBounds(mapAreas['Hawaii']);

   filterSites(hawaiiSites)

   mapHawaii.addLayer(hawaiiSites);

   var hawaiiBasemap = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}", {attribution: 'MRLC, State of Oregon, State of Oregon DOT, State of Oregon GEO, Esri, DeLorme, HERE, TomTom, USGS, NGA, EPA, NPS, U.S. Forest Service'});
   mapHawaii.addLayer(hawaiiBasemap);
   
   mapHawaii.on('click zoomend', function(evt) {
      console.log("Clicked Hawaii map ");
 
      // Set the area
      //
      setArea("Hawaii");
   
      // Check what state or territory are currently set to
      //
      filterSites(hawaiiSites);
   });

   // Does initial Puerto Rico map exist
   //
   if(typeof mapPuertoRico === "undefined")
     {
      mapPuertoRico = new L.map('mapPuertoRico', { attributionControl: false, zoomControl: false });
     }

   mapPuertoRico.dragging.disable();
   mapPuertoRico.touchZoom.disable();
   mapPuertoRico.doubleClickZoom.disable();
   mapPuertoRico.scrollWheelZoom.disable();

   mapPuertoRico.fitBounds(mapAreas['Puerto Rico']);

   filterSites(puertoricoSites)

   mapPuertoRico.addLayer(puertoricoSites);

   var puertoricoBasemap = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}", {attribution: 'MRLC, State of Oregon, State of Oregon DOT, State of Oregon GEO, Esri, DeLorme, HERE, TomTom, USGS, NGA, EPA, NPS, U.S. Forest Service'});
   mapPuertoRico.addLayer(puertoricoBasemap);
   
   mapPuertoRico.on('click zoomend', function(evt) {
      console.log("Clicked Puerto Rico map ");
   
      // Set the area
      //
      setArea("Puerto Rico");
   
      // Check what state or territory are currently set to
      //
      filterSites(puertoricoSites);
   });

  // Build table
  //
  var mySiteSet  = jQuery.map(mySiteInfo, function(element,index) {return index}).sort();
  console.log("mySiteSet " + mySiteSet.length);
  var allTable   = buildTables(mySiteSet, "States and Territories");
  $("#siteTable").html(allTable);
  fpsDataTable(".stations_table",
               "USGS Federal Priorities Streamgage Status & Federal Needs for States and Territories",
               "FPS_States_and_Territories");

   // Close message
   //
   fadeModal(3000);
   //closeModal();
              
   return;
}
        
// Builds state-level map 
//
function createStateMap()
  {
   console.log("createStateMap for sites in " + myArea + " for network " + myNetwork + " with funding " + myFunding);

   // Loading message
   //
   message = "Preparing map for " + myArea;
   openModal(message);

   var mySiteSet  = [];
   var CenterCode    = '';
  
   // Clear URL
   //
   clearQueryStringParam()

   // Add state or territory name and update URL
   //
   updateQueryStringParam('state_nm', myArea)
  
   // Set maps
   //
   $(".mapUSA").hide();
   $(".insertMaps").hide();
   //$(".national-level").hide();

   $("#map").show();
   //$(".state-level").show();
   $("#areaName").text(myArea);

   // Set site within state boundary
   //
   var customList = filterSites(allSites);
   customSites    = new L.FeatureGroup(customList);

   // Add layer of selected sites
   //
   var mySiteSet  = [];
   var siteCount  = 0;
   customSites.eachLayer(function(layer) { 
        var site_no = layer.options.site_no;
        CenterCode     =  mySiteInfo[site_no]['centercode'];

        siteCount++;

        if($.inArray(site_no, mySiteSet) < 0) { mySiteSet.push(site_no); }
   });

   console.log("Selected " + siteCount + " sites for " + myArea);
   console.log(mySiteSet);

   // Add layer of selected sites
   //
   if(siteCount > 0)
     {
      // Prepare contact info for area level
      //
      var contactHelp = prepareContact(CenterCode);

      // Check contact info
      //
      if(contactHelp)
        {
         $(".national-level").hide();
         $(".state-level").show();

         $("#stateName").text(contactHelp.CenterName);
         $("#contactName").text(contactHelp.FirstName + " " + contactHelp.LastName);
         $("#contactPhoneNumber").text(contactHelp.PhoneWork);
         $("#contactEmail").prop("href", "https://water.usgs.gov/cgi-bin/feedback_form?" + contactHelp.Email);
        }

      else
        {
         $(".state-level").hide();
         $(".national-level").show();
        }

      // Does map exist
      //
      if(typeof map === "undefined")
        {
         map = new L.map('map', { attributionControl: true, zoomControl: false });
         map.createPane('stateMap');
        }
  
       // Disable controls for map view
       //
       $(".leaflet-control-zoom").css("visibility", "visible");
       map.scrollWheelZoom.disable();
    
       // Zoom message
       //
       $("#map").on("mouseover", function () {
           if(!myZoomFlag)
             {
              myZoomFlag = true
              message = "Use Shift-Left Mouse Drag: Select a region by pressing the Shift key and dragging the left mouse button"
              openModal(message);
              fadeModal(4000);
             }
          });
   	  
      // Add base map
      //
      var stateBasemap = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}", {attribution: 'MRLC, State of Oregon, State of Oregon DOT, State of Oregon GEO, Esri, DeLorme, HERE, TomTom, USGS, NGA, EPA, NPS, U.S. Forest Service'});
      map.addLayer(stateBasemap);
    
      // Set site within state boundary
      //
      customSites   = new L.FeatureGroup(customList);
  
      // Set state boundary
      //
      stateBoundary = getStateBoundary(map, myArea)

      // Set map bounds 
      //
      if(stateBoundary)
        {
         if(/^alaska/i.test(myArea)) { map.fitBounds(customSites.getBounds()); }
         else { map.fitBounds(stateBoundary.getBounds()); }
        }
      else
        {
         map.fitBounds(customSites.getBounds());
        }
      var zoomLevel = map.getZoom();
      if(zoomLevel > maxZoom) { map.setZoom(maxZoom); }

      // Add zoom home
      //
      if(!zoomHome)
        {
         zoomHome = L.Control.zoomHome();
         zoomHome.addTo(map);
        }
      else
        {
         zoomHome.setHomeBounds(map.getBounds());
        }

      // Add sites
      //
      map.addLayer(allSites);
      //map.addLayer(customSites);

      // Build table
      //
      var siteCount   = mySiteSet.length;
      var countsTable = buildCountsTable (mySiteSet, myArea);
      var siteTable   = buildTables(mySiteSet, myArea);
         
      $("#countsTable").html(countsTable);
      $("#siteTable").html(siteTable);
      fpsDataTable(".stations_table",
                   "USGS Federal Priorities Streamgage Status & Federal Needs for " + myArea,
                   "FPS_" + myArea);
         
      // Build popup
      //
      customSites.on('click', function(e) { 
      
        //var site_no          = e.layer.feature.properties.site_no;
        var site_no          = e.layer.options.site_no;
        //console.log("Clicked " + site_no);

        // Check if in table
        // 
        if($('tr#tr_' + site_no).length)
          {               
           var station_nm       = mySiteInfo[site_no]['station_nm']
           var network          = mySiteInfo[site_no]['networks'].join(", ");
           var funding          = mySiteInfo[site_no]['funding'];
         
           var clickContent     = createPopUp(site_no, station_nm, network, funding);
           var myPopup          = e.layer.bindPopup(clickContent,popupOptions).openPopup();
           $(".leaflet-popup-close-button").before('<div class="leaflet-popup-title">Site Information</div>');
   
           // Enable selection of network and reset sites visible
           //
           $(".clickToTable").on( "click", function( e ) {  
              var mySite  = $(this).prop('id');
              //console.log("Clicked site " + mySite);
           
              // Scroll down to table
              //
              document.getElementsByName("tr_" + mySite)[0].scrollIntoView();
              $("#tr_" + mySite).css("border", "3px solid red");
              //$("#tr_" + mySite).css("background-color", "#ede978");
              //$("#tr_" + mySite).css("bgcolor", "#ede978");
              setTimeout(function() {
                  $("#tr_" + mySite).css("border", "1px solid black");
              }, 3000);
           });
          }
      });
     }

   // No selected sites
   //
   else
     {
      // Loading message
      //
      message = "No sites were selected in " + myArea + " for " + myNetwork + " network type(s)";
      openModal(message);
      fadeModal(3000);
     }

   fadeModal(3000);
   //closeModal();
              
   return;
}
        
// Builds list of sites 
//
function filterSites(activeLayer)
  {
   console.log("filterSites");

   var customList = [];
   var siteCount  = 0;

   // Prepare area search
   //
   var myAbbrev   = stateNm2abbrev[myArea];
   var myTest     = new RegExp(myAbbrev, "i");

   // Loop for search
   //
   activeLayer.eachLayer(function(site) {
      var site_no          = site.options.title;
      var state_abbrev     = mySiteInfo[site_no]['state_abbrev'];
      var networks         = mySiteInfo[site_no]['networks'];
      var siteFunding      = mySiteInfo[site_no]['funding'];

      var siteOpacity      = false;
      var siteArea         = false;

      // Within selected area
      //
      if(/^all/i.test(myArea) && /^all/i.test(myNetwork) && /^all/i.test(myFunding))
        {
         siteArea    = true;
         siteOpacity = true;
        }

      else if(/^all/i.test(myArea))
        {
         siteArea    = true;
         if(/^all/i.test(myNetwork) && /^all/i.test(myFunding)) { siteOpacity = true; }
         else if(/^all/i.test(myNetwork)) { siteOpacity = filterByFunding(siteFunding); }
         else if(/^all/i.test(myFunding)) { siteOpacity = filterByNetwork(networks); }
         else {
               networkOpacity = filterByNetwork(networks);
               fundingOpacity = filterByFunding(siteFunding);
               if(networkOpacity && fundingOpacity) { siteOpacity = true; }
              }
        }

      else if(myTest.test(state_abbrev))
        {
         //console.log("Processing myFunding -> " + myFunding + " Site -> " + siteFunding + " Flag -> " + siteOpacity);
         siteArea    = true;
         if(/^all/i.test(myNetwork) && /^all/i.test(myFunding)) { siteOpacity = true; }
         else if(/^all/i.test(myNetwork)) { siteOpacity = filterByFunding(siteFunding); }
         else if(/^all/i.test(myFunding)) { siteOpacity = filterByNetwork(networks); }
         else {
               networkOpacity = filterByNetwork(networks);
               fundingOpacity = filterByFunding(siteFunding);
               if(networkOpacity && fundingOpacity) { siteOpacity = true; }
              }
         //console.log("Processed siteOpacity -> " + siteOpacity);
        }

      else
        {
         //console.log("Processing Site -> " + site_no + " Funding -> " + siteFunding + " Network -> " + networks.join(", "));
         if(/^all/i.test(myNetwork) && /^all/i.test(myFunding)) { siteOpacity = true; }
         else if(/^all/i.test(myNetwork)) { siteOpacity = filterByFunding(siteFunding); }
         else if(/^all/i.test(myFunding)) { siteOpacity = filterByNetwork(networks); }
         else {
               networkOpacity = filterByNetwork(networks);
               fundingOpacity = filterByFunding(siteFunding);
               if(networkOpacity && fundingOpacity) { siteOpacity = true; }
              }
         //console.log("Processed siteOpacity -> " + siteOpacity);
        }
       
      //console.log("Processing myFunding -> " + myFunding + "    Site -> " + siteFunding + "    Flag -> " + siteOpacity);
       
      // Site within search area
      //
      if(siteArea)
        {
         siteCount++;
         customList.push(site);
        }
       
      // Site Opacity
      //
      if(siteOpacity)
        {
         site.setOpacity(1.0);
        }
      else
        {
         site.setOpacity(0.1);
        }
   });

   return customList;
  }
        
// Set funding level for site
//
function filterByNetwork(siteNetwork)
   {
    //console.log("filterByNetwork to " + siteNetwork + " for sites ");

    var networkFlag = false;

    var reNetwork   = new RegExp(myNetwork, 'i')

    if(/^all/i.test(myNetwork))
      {
       networkFlag = true;
      }

    else if($.inArray(myNetwork, siteNetwork) > -1)
      {
       networkFlag = true;
      }

   return networkFlag;
  }
        
// Set funding level for site
//
function filterByFunding(siteFunding)
   {
    //console.log("filterByfunding");

    var fundingFlag = false;

    var reFunding   = new RegExp(myFunding, 'i')

    if(/^all/i.test(myFunding))
      {
       fundingFlag = true;
      }

    else if(reFunding.test(siteFunding))
      {
       fundingFlag = true;
      }

    //console.log("Processing myFunding -> " + myFunding + " Site -> " + siteFunding + " Flag -> " + fundingFlag);

    return fundingFlag;
   }
 
var customPrintFunction = (context, mode) => {
    return () => {
        // **** Where put this blockUI? ****
        //$.blockUI({ message: '<h2><span><img src="'+require('./images/rolling202.gif')+'" /> Cargando impresión...</span></h2>' });		
        context._printCustom(mode);
    }
}        
        
// Builds contact information
//
function prepareContact(CenterCode)
  {
   console.log("prepareContact CenterCode -> " + CenterCode);
   //console.log(myCenterJson);

   var myReCenterCode   = new RegExp(CenterCode, 'i');

   var myContactInfo = null;

   // Set contact 
   //
   for(i = 0; i < myCenterJson.length; i++)
      {
       myCenterRecord  = myCenterJson[i];
       myCenterCode = myCenterRecord.CenterCode;

       if(myReCenterCode.test(myCenterCode))
         {
          myContactInfo            = {};
          myContactInfo.CenterName = myCenterRecord.CenterName;

          if("CenterContacts" in myCenterRecord)
            {
             if("FirstName" in myCenterRecord.CenterContacts.CenterContact)
               {
                myContactInfo.FirstName  = myCenterRecord.CenterContacts.CenterContact.FirstName;
                myContactInfo.LastName   = myCenterRecord.CenterContacts.CenterContact.LastName;
                myContactInfo.Email      = myCenterRecord.CenterContacts.CenterContact.Email;
                myContactInfo.PhoneWork  = myCenterRecord.CenterContacts.CenterContact.PhoneWork;
               }
             else
               {
                myContactInfo = null;
               }
            }

          else
            {
             myContactInfo = null;
            }

          break;
         }
      }

   return myContactInfo;
  }

// Build site summary table
//
function buildTables (mySiteSet, myArea) 
  {
   //console.log("Build table");

   var counts_table  = [];
   var summary_table = [];
   var myColumns     = [
                        'site_no',
                        'station_nm',
                        'status',
                        'funding',
                        'Water Quality',
                        'Compact/Border',
                        'Water Availabilty',
                        'Sentinel',
                        'Forecast',
                        'Map'
                       ];

   // Number of sites
   //
   var siteCount     = mySiteSet.length;

   if(siteCount < 1)
     {
      return [ siteCount, counts_table.join("\n"), summary_table.join("\n") ];
     }
  
   // Table of sites
   //
   summary_table.push('<table class="stations_table">');
   summary_table.push('<thead>');
   summary_table.push('<tr>');
   summary_table.push(' <th scope="col">Site<br />Number</th>');
   summary_table.push(' <th scope="col">Site<br />Name</th>');
   summary_table.push(' <th scope="col">Status</th>');
   summary_table.push(' <th scope="col">USGS<br />Funding</th>');
   summary_table.push(' <th scope="col">Water<br />Quality</th>');
   summary_table.push(' <th scope="col">Compact/Border</th>');
   summary_table.push(' <th scope="col">Water Availabilty</th>');
   summary_table.push(' <th scope="col">Sentinel</th>');
   summary_table.push(' <th scope="col">Forecast</th>');
   summary_table.push(' <th scope="col">Site<br />Map</th>');
   summary_table.push('</tr>');
   summary_table.push('</thead>');
   summary_table.push('<tbody>');

   // Loop through sites
   //
   var mySiteNos      = mySiteSet.sort();
   var siteCount      = mySiteNos.length;
   var activeCount    = 0;
   var fullCount      = 0;
   var partialCount   = 0;
   var noneCount      = 0;

   for(var i = 0; i <  mySiteNos.length; i++)
     {
      var site_no    = mySiteNos[i];
      var status     = mySiteInfo[site_no]['status'];
      var myNetworks = mySiteInfo[site_no]['networks'];
      var funding    = mySiteInfo[site_no]['funding'];
      //console.log("Site " + site_no);
    
      if(/^active/i.test(status))
        {
         activeCount += 1;
    
         if(/^full/i.test(funding)) { fullCount += 1; }
         else if(/^partial/i.test(funding)) { partialCount += 1; }
         else { noneCount += 1; }
        }
    
      summary_table.push('<tr id="tr_' + site_no + '" name="tr_' + site_no + '">');

      // Loop through columns
      //
      var myRe = /^(\d{8,15})$/g;

      for(var ii = 0; ii < myColumns.length; ii++)
         {
          if(/^site_no$/i.test(myColumns[ii]))
            {
             if(myRe.test(site_no))
               {
                value = '<a href="https://waterdata.usgs.gov/nwis/inventory/?agency_code=&site_no=' + site_no + '", target="_blank">' + site_no + '</a>';
               }
             else
               {
                value = '<span class="site_no">' + site_no + '</span>';
               }
              
             summary_table.push('<td>' + value + '</td>');
            }
          else if(/^station_nm/i.test(myColumns[ii]))
            {
             var value = mySiteInfo[site_no][myColumns[ii]];

             summary_table.push('<td>' + value + '</td>');
            }
          else if(/^status/i.test(myColumns[ii]))
            {
             var value         = status;

             summary_table.push('<td>' + value + '</td>');
            }
          else if(/^funding/i.test(myColumns[ii]))
            {
             var value         = funding;

             summary_table.push('<td>' + value + '</td>');
            }
          else if(/^Map/i.test(myColumns[ii]))
            {
             var value = '<a href="https://maps.waterdata.usgs.gov/mapper/map_only.html?site_no=' + site_no + '&agency_cd=USGS", target="_blank">Map</a>';

             summary_table.push('<td>' + value + '</td>');
            }
          else
            {
             var myNetwork = myColumns[ii];
             if($.inArray(myNetwork, myNetworks) > -1)
               {
                var myIcon = style(status, [myNetwork], funding);
                var imgSrc = myIcon.options.iconUrl;
                var imgAlt = myIcon.options.imgAlt;

                summary_table.push('<td><img src="' + imgSrc + '" alt="' + imgAlt + '"></td>');
               }
             else
               {
                summary_table.push('<td>---</td>');
               }
            }
         }
     }
	
   summary_table.push('</tbody>');
   var process_dt = '1/16/2024'
   var caption = [];
   caption.push('<caption>' + myArea + '  --  ' + siteCount + ' sites (');
   caption.push(activeCount + ' active with ');
   caption.push(fullCount + ' fully FPS funded, ' + partialCount + ' partially FPS funded, and ' + noneCount + ' no FPS funding)<br>\ [Updated: ' + process_dt + ']\ ');
   caption.push('</caption>');
   summary_table.push(caption.join("\ "));
   summary_table.push('</table>');
 
   return summary_table.join("\n");
  }

// Build counts table
//
function buildCountsTable (mySiteSet, myArea) 
  {
   console.log("Build buildCountsTable table");
      
   var counts_table  = [];
   var counts_thead  = [];
   var counts_tbody  = [];

   var countsHash    = {};
   for(var i = 0; i < networkTypes.length; i++)
      {
       countsHash[networkTypes[i]] = {};
       //console.log("networkTypes " + networkTypes[i]);
       for(var ii = 0; ii < statusTypes.length; ii++)
          {
           countsHash[networkTypes[i]][statusTypes[ii]] = 0;
          }
       countsHash[networkTypes[i]]['Total'] = 0;
      }

   // Build body of counts table
   //
   counts_tbody.push('<tbody>');

   for(var i = 0; i < networkTypes.length; i++)
     {
      counts_tbody.push('<tr>');

      // Network
      //
      var myNetwork = networkTypes[i];

      // Status
      //
      for(var ii = 0; ii < statusTypes.length; ii++)
        {
         var myStatus  = statusTypes[ii];

         for(var iii = 0; iii <  mySiteSet.length; iii++)
           {
            var site_no = mySiteSet[iii];
            var status  = mySiteInfo[site_no]['status'];
            var funding = mySiteInfo[site_no]['funding'];

            if(status == myStatus)
              {
               var myNetworks = mySiteInfo[site_no]['networks'];
               if($.inArray(myNetwork, myNetworks) > -1)
                 {
                  countsHash[myNetwork][myStatus] += 1;
                  countsHash[myNetwork]['Total']  += 1;
                 }
              }
           }

         var imgSrc = 'Black-Circle-Hollow.gif';
         var imgAlt = 'Forecast site';
         switch(myNetwork.toLowerCase())
           {
           case "forecast":
             imgSrc = 'Black-Circle-Hollow.gif';
             imgAlt = 'Forecast site';
             break;
           case "water quality":
             imgSrc = 'Black-Square-Hollow.gif';
             imgAlt = 'Water Quality site';
             break;
           case "compact/border":
             imgSrc = 'Black-Triangle-Hollow.gif';
             imgAlt = 'Compact/Border site';
             break;
           case "water availabilty":
             imgSrc = 'Black-Diamond-Hollow.gif';
             imgAlt = 'Water Availabilty site';
             break;
           case "sentinel":
             imgSrc = 'Black-Cross-Hollow.gif';
             iconColor = "Green";
             imgAlt = 'Sentinel site';
             break;
           default:
             iconColor = 'Black-Circle-Hollow.gif';
             imgAlt = 'Forecast site';
             break;
           }
         imgSrc = '<img src="Symbols/' + imgSrc + '"' + ' alt="'+ imgAlt + '">';
            
         var count  = countsHash[myNetwork][myStatus];
         counts_tbody.push('<td><span class="counts">' + count + '</span><span class="counts">' + imgSrc + '</span>' + myNetwork + '</td>');
        }

      var count     = countsHash[myNetwork]['Total'];
      counts_tbody.push('<td class="text-right"><span>' + count + '</span></td>');

      counts_tbody.push('</tr>');
     }

   counts_tbody.push('</tbody>');

   // Build head of counts table
   //
   counts_thead.push('<thead>');
   counts_thead.push('<tr>');
   counts_thead.push(' <th scope="col">Active</th>');
   counts_thead.push(' <th scope="col">Inactive</th>');
   counts_thead.push(' <th scope="col">Total</th>');
   counts_thead.push('</tr>');
   counts_thead.push('</thead>');

   // Build counts table
   //
   counts_table.push('<table class="counts_table ">');
   counts_table.push('<caption>USGS Federal Priorities Streamgage Status & Federal Needs -- Selected sites can meet more than one Federal need</caption>');
   counts_table.push(counts_thead.join("\n"));
   counts_table.push(counts_tbody.join("\n"));
   counts_table.push('</table>');
 
   return counts_table.join("\n");
  }


// Zoom to site
//
function zoomToSite (siteInfo) {
     var site_no     = siteInfo.site_no;
     var dec_lat_va  = siteInfo.dec_lat_va;
     var dec_long_va = siteInfo.dec_long_va;
     //console.log("Zoom to site " + site_no);

     if(typeof site_no != "undefined")
       {
        map.setView([dec_lat_va, dec_long_va], 15);
       }
     else
       {
        alert("The map does not contain the site " + site_no + " requested.  Super sorry.");
       }

    window.location = "#map";
}

// Adds a new DIV table row
//
function addTableRow (col1, col2) {
	var content = '<div class="divTableRow">';
	content += '<div class="divTableCell">';
	content += col1;
	content += '</div>';
	content += '<div class="divTableCell">';
	content += col2;
	content += '</div>';
	content += '</div>';
	return content;
}

// Build numeric sort
//
function sortNumber(a, b) {
    a = parseInt(a);
    b = parseInt(b);
    
    return a > b ? 1 : a < b ? -1 : 0;
}

// Sort
//
function sorting(tmpObject, column, typeSort)
  {
   if(typeSort === "number")
     {
      sortedObject = tmpObject.sort(function(a,b) {return (parseFloat(a[column]) > parseFloat(b[column])) ? 1 : ((parseFloat(b[column]) > parseFloat(a[column])) ? -1 : 0);} );
     }
   else
     {
      sortedObject = tmpObject.sort(function(a,b) {return (a[column] > b[column]) ? 1 : ((b[column] > a[column]) ? -1 : 0);} );
     }

  return sortedObject;
}


// Create popup
//
function createPopUp(site_no, station_nm, network, funding)
 {
  // Build click popup content and bind
  //
  var clickContent  = '<div class="leaflet-popup-body">';
  clickContent     += '<div class="divTable">';
  clickContent     += '<div class="divTableBody">';

  var link          = '<a target="_blank" href="https://waterdata.usgs.gov/nwis/inventory/?site_id=' + site_no + '">';
  link             += '<span class="popup_label">' + site_no + '</span></a>';

  clickContent     += addTableRow('<span class="popup_label">Site Number</span>', link);

  clickContent     += addTableRow('<span class="popup_label">Site Name:</span>', station_nm);
  clickContent     += addTableRow('<span class="popup_label">Network:</span>', network);
  clickContent     += addTableRow('<span class="popup_label">Funding Level:</span>', funding);
  clickContent     += addTableRow('<span class="popup_label">For more site information:</span>', 
                                  '<span id="' + site_no + '" class="clickToTable">Click for Table below</span>');

  clickContent     += '</div></div></div>';

  return clickContent;
 }




// Create svg output
//
function createPng(myNode)
{
domtoimage.toPng(myNode)
    .then(function (dataUrl) {
        var img = new Image();
        img.src = dataUrl;
        document.body.appendChild(img);
    })
    .catch(function (error) {
        console.error('oops, something went wrong!', error);
    });

  return;
}



function getScreenshotOfElement(element, posX, posY, width, height, callback) {
    html2canvas(element, {
        onrendered: function (canvas) {
            var context = canvas.getContext('2d');
            var imageData = context.getImageData(posX, posY, width, height).data;
            var outputCanvas = document.createElement('canvas');
            var outputContext = outputCanvas.getContext('2d');
            outputCanvas.width = width;
            outputCanvas.height = height;

            var idata = outputContext.createImageData(width, height);
            idata.data.set(imageData);
            outputContext.putImageData(idata, 0, 0);
            callback(outputCanvas.toDataURL().replace("data:image/png;base64,", ""));
        },
        width: width,
        height: height,
        useCORS: true,
        taintTest: false,
        allowTaint: false
    });
}
