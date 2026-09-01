/**
 * Namespace: leftPanel
 *
 * leftPanel is a JavaScript library to set of functions to build
 *  a list of sites in a left panel that is linked to the sites on
 *  on the web map.
 *
 $Id: /var/www/html/fps/javascripts/gages/leftPanel.js, v 3.19 2026/08/15 11:29:19 llorzol Exp $
 $Revision: 3.19 $
 $Date: 2026/08/15 11:29:19 $
 $Author: llorzol $
*/

/*
###############################################################################
# Copyright (c) U.S. Geological Survey Oregon Water Science Center
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
    
// Builds list of areas 
//
function buildAreaList(myAreaList) {
    myLogger.info("buildAreaList");

    // Add to selection
    //
    myAreaList.sort();

    // Loop through
    //
    for (let stateName of myAreaList) {
        $('#select-area').append(new Option(stateName, stateName));
    }

    // Add current hidden area option needed to determine if pan/zoom status
    //
    $('#select-area').append($('<option>', {
        id: 'currentArea',
        value: null,
        text: 'Current Area'
    }));
    $('#currentArea').prop('value', 'area');
    $('#currentArea').prop('hidden', true);

    return;
}

// Monitor selection of sitetype, monitoring, and funding choices
//
$("#select-area").on( "change", function( evt ) {
    myLogger.info('Change of choice');
    myLogger.debug('One of the monitored elements changed:', $(this).val());
    const selectedValue = $(this).val();
    const elementId = $(this).attr('id');
    myLogger.info(`Dropdown ${elementId} changed to: ${selectedValue}`);

    myEvent = elementId
    
    // Restrict selecting sites for count/sites tables to specific state or four map view
    //
    $('#currentArea').prop('value', 'area');
    
    // Create map and tables
    //
    let myArea = jQuery("#select-area").val();
    let mySiteType = jQuery("#select-sitetype").val();
    let myFunding   = jQuery("#select-funding").val();
    let myMonitoring = jQuery("#select-monitoring").val();

    // Refresh URL with form results
    //
    let url = new URL(window.location.href);
    if(/^All\b/i.test(myArea)) { url.searchParams.delete("state_nm"); }
    else { url.searchParams.set("state_nm", myArea); }
    myLogger.debug(`Current url ${url} -> state_nm ${myArea} site_type ${mySiteType} funding_level ${myFunding} monitoring_level ${myMonitoring}`);

    window.history.pushState(null, '', url.toString());
    myLogger.debug("Modified Url " + window.location.href);
    
    // Only area change
    //
    if(/^all\b/i.test(myArea)) {
        createFourMaps();
    }
    else {
        createStateMap();
    }
});

// Monitor selection of sitetype, monitoring, and funding choices
//
$("#select-sitetype, #select-funding, #select-monitoring").on( "change", function( evt ) {
    myLogger.info('Change of choice');
    myLogger.debug('One of the monitored elements changed:', $(this).val());
    const selectedValue = $(this).val();
    const elementId = $(this).attr('id');
    myLogger.info(`Dropdown ${elementId} changed to: ${selectedValue}`);

    myEvent = elementId
    
    // Create map and tables
    //
    let myArea = jQuery("#select-area").val();
    let mySiteType = jQuery("#select-sitetype").val();
    let myFunding   = jQuery("#select-funding").val();
    let myMonitoring = jQuery("#select-monitoring").val();

    // Refresh URL with form results
    //
    let url = new URL(window.location.href);
    if(/^All\b/i.test(mySiteType)) { url.searchParams.delete("site_type"); }
    else { url.searchParams.set("site_type", mySiteType); }
    if(/^All\b/i.test(myFunding)) { url.searchParams.delete("funding_level"); }
    else { url.searchParams.set("funding_level", myFunding); }
    url.searchParams.set("monitoring_level", myMonitoring);
    myLogger.debug(`Current url ${url} -> state_nm ${myArea} site_type ${mySiteType} funding_level ${myFunding} monitoring_level ${myMonitoring}`);

    window.history.pushState(null, '', url.toString());
    myLogger.debug("Modified Url " + window.location.href);
    
    // Area setting
    //
    if(/^all\b/i.test(myArea)) {
        modifyFourMaps();
    }
    
    // State map changes
    //
    else {

        // Set boundary to current map
        //
        mapBounds = map.getBounds();

        // Restrict selection
        //
        if($('#currentArea').val() == 'area') { [mySiteSet, customList] = filterSites(allSites) }
        else { [mySiteSet, customList] = filterByMapextent(allSites, mapBounds); }

        // Set site counts
        //
        SetSiteCounts (mySiteSet)

        // Create map
        //
        createTable(mySiteSet);

        // Set site counts
        //
        customSites = new L.FeatureGroup(customList);
        customSites.on('click', function(e) {
            let mySite = e.layer.properties;
            clickOnSite (mySite)
        });
    }
});

// Builds selected sites
//
function filterSites(activeLayer) {
    myLogger.info('------------- filterSites -------------');

    let mySiteSet  = [];
    let customList = [];

    // Set choices
    //
    myArea     = jQuery("#select-area").val();
    mySiteType = jQuery("#select-sitetype").val();
    myFunding   = jQuery("#select-funding").val();
    myMonitoring = jQuery("#select-monitoring").val();
    
    const myAreaTest = new RegExp(`^${myArea}`, "i");
    const myFundingTest = new RegExp(`^${myFunding}`, "i");
    const myMonitoringTest = new RegExp(`^${myMonitoring}`, "i");
    
    //myLogger.info(`filterSites => myEvent ${myEvent} myArea ${myArea} mySiteType ${mySiteType} myFunding ${myFunding} myMonitoring ${myMonitoring}`);
    myLogger.info(`filterSites => myArea ${myArea} mySiteType ${mySiteType} myFunding ${myFunding} myMonitoring ${myMonitoring}`);

    // Site type
    //
    activeLayer.eachLayer(function(site) {

        let SiteNumber = site.properties.SiteNumber;
        let StateName = site.properties.StateName;
        let FPSFunding = site.properties.FPSFunding;
        let FPSNetwork = site.properties.FPSNetwork;
        let OperatingStatus = site.properties.OperatingStatus;

        myLogger.debug(`Site ${SiteNumber} => myArea ${StateName} | mySiteType ${FPSNetwork.join(', ')} | myFunding ${FPSFunding} | myMonitoring ${OperatingStatus}`);

        let siteArea = true;
        let siteOpacity = true;

        // Within state
        //
        if(/^(?!All\b)/i.test(myArea)) {
            //if(StateName !== myArea) { siteArea = false; }
            if(!myAreaTest.test(StateName)) { siteArea = false; }
        }
        myLogger.debug(`siteOpacity ${siteOpacity}`)

        // Site Type
        //
        if(/^(?!All\b)/i.test(mySiteType)) {
            if(!FPSNetwork.includes(mySiteType)) { siteOpacity = false; }
        }

        // Funding level
        //
        if(/^(?!All\b)/i.test(myFunding)) {
            //if(FPSFunding !== myFunding) { siteOpacity = false; }
            if(!myFundingTest.test(FPSFunding)) { siteOpacity = false; }
        }

        // Monitoring level
        //
        if(/^(?!All\b)/i.test(myMonitoring)) {
//            if(OperatingStatus !== myMonitoring) { siteOpacity = false; }
            if(!myMonitoringTest.test(OperatingStatus)) { siteOpacity = false; }
        }
        
        myLogger.debug(`Site ${SiteNumber} => myArea ${myAreaTest.test(StateName)} mySiteType ${FPSNetwork.includes(mySiteType)} myFunding ${myFundingTest.test(FPSFunding)} myMonitoring ${myMonitoringTest.test(OperatingStatus)}`);
        
        // Site within search area
        //
        if(siteArea && siteOpacity) {
            mySiteSet.push(site.properties);
            customList.push(site);
        }

        // Site Opacity
        //
        site.setOpacity(0.0);
        if(siteOpacity) {
            site.setOpacity(1.0);
        }
    });
    myLogger.info(`Number of sites selected ${customList.length}`)

    return [mySiteSet, customList]
  }

// Builds selected sites
//
function filterByMapextent(activeLayer, mapBounds) {
    myLogger.info('------------- filterByMapextent -------------');

    let mySiteSet  = [];
    let customList = [];

    // Set choices
    //
    myArea     = jQuery("#select-area").val();
    mySiteType = jQuery("#select-sitetype").val();
    myFunding   = jQuery("#select-funding").val();
    myMonitoring = jQuery("#select-monitoring").val();
    
    const myAreaTest = new RegExp(`^${myArea}`, "i");
    const myFundingTest = new RegExp(`^${myFunding}`, "i");
    const myMonitoringTest = new RegExp(`^${myMonitoring}`, "i");
    
    //myLogger.info(`Settings => myEvent ${myEvent} myArea ${myArea} mySiteType ${mySiteType} myFunding ${myFunding} myMonitoring ${myMonitoring}`);
    myLogger.info(`Settings => myArea ${myArea} | mySiteType ${mySiteType} | myFunding ${myFunding} | myMonitoring ${myMonitoring}`);

    // Site type
    //
    activeLayer.eachLayer(function(site) {

        let SiteNumber = site.properties.SiteNumber;
        let StateName = site.properties.StateName;
        let FPSFunding = site.properties.FPSFunding;
        let FPSNetwork = site.properties.FPSNetwork;
        let OperatingStatus = site.properties.OperatingStatus;

        let siteArea = true;
        let siteOpacity = true;

        // Within mapextent
        //
        if(mapBounds.contains(site.getLatLng())) {

            myLogger.debug(`Site ${SiteNumber} => myArea ${StateName} | mySiteType ${FPSNetwork.join(', ')} | myFunding ${FPSFunding} | myMonitoring ${OperatingStatus}`);

            // Site Type
            //
            if(/^(?!All\b)/i.test(mySiteType)) {
                if(!FPSNetwork.includes(mySiteType)) { siteOpacity = false; }
            }
            myLogger.debug(`\tSite Type ${siteOpacity}`)

            // Funding level
            //
            if(/^(?!All\b)/i.test(myFunding)) {
                //if(FPSFunding !== myFunding) { siteOpacity = false; }
                if(!myFundingTest.test(FPSFunding)) { siteOpacity = false; }
            }
            myLogger.debug(`\tFunding level ${FPSFunding} => ${siteOpacity}`)

            // Monitoring level
            //
            if(/^(?!All\b)/i.test(myMonitoring)) {
                //            if(OperatingStatus !== myMonitoring) { siteOpacity = false; }
                if(!myMonitoringTest.test(OperatingStatus)) { siteOpacity = false; }
            }
            myLogger.debug(`\tMonitoring level ${OperatingStatus} => ${siteOpacity}`)

        myLogger.debug(`Site ${SiteNumber} => myArea ${StateName} mySiteType ${FPSNetwork.includes(mySiteType)} myFunding ${myFundingTest.test(FPSFunding)} myMonitoring ${myMonitoringTest.test(OperatingStatus)}`);
        }

        // Outside mapextent
        //
        else {
            siteArea = false;
            siteOpacity = false;
        }

        //myLogger.info(`Site ${SiteNumber} => myArea ${StateName} mySiteType ${FPSNetwork.includes(mySiteType)} myFunding ${FPSFunding} myMonitoring ${myMonitoringTest.test(OperatingStatus)}`);

        // Site within search area
        //
        if(siteArea && siteOpacity) {
            mySiteSet.push(site.properties);
            customList.push(site);
        }
            
        // Site Opacity
        //
        site.setOpacity(0.0);
        if(siteOpacity) {
            site.setOpacity(1.0);
        }
    });
    myLogger.info(`Number of sites selected ${customList.length}`)

    return [mySiteSet, customList]
  }

// Builds selected sites
//
function setMapextent(activeLayer) {
    myLogger.info('------------- setMapextent -------------');

    // State polygons exists clear
    //
    statePolygons.setStyle(defaultStyle);

    // Set choice
    //
    myArea = jQuery("#select-area").val();
    let myList = $('#select-area option').map(function() { return this.value; }).get();
    let myStateList = myList.filter(state => /^(?!All\b)/i.test(state));

    // No state chosen then use specified feature group
    //
    if(/^All\b/i.test(myArea)) {
        mapExtent = activeLayer.getBounds();
    }

    // Within state
    //
    else if(myStateList.includes(myArea)) {

        // Set state boundary
        //
        myLogger.info(`Search state boundary for ${myArea}`);
        myLogger.info(statePolygons)
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
                    mapExtent = stateBoundary.getBounds();
                    layer.setStyle(selectedStyle);
                }
            }
        });
    }

    // Pan or Zoom
    //
    else {
        mapExtent = activeLayer.getBounds();
    }
 
    return mapExtent
  }