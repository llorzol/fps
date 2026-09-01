/**
 * Namespace: Main
 *
 * Main is a JavaScript library to provide a set of functions to build
 *  a Federal Priority Streamgages (FPS) Web Site.
 *
 * version 1.11
 *  November 30, 2021
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
// Set
//
var mySiteInfo   = {};
var mySites      = {};
var myCenterJson = {};

// Set global variables
//
var district_cd;
var state_cd;
var state_nm;
var state_abbrev;
var network_type;

var myArea    = null;
var myNetwork = null;
var myFunding = null;
var myMessage = null;

// Build fips code objects
//
var stateCd2nm          = build_stateCd_to_nm();
var nm2stateCd          = build_nm_to_stateCd();
var stateAbbrev2nm      = build_abbrev_to_nm();
var stateNm2abbrev      = build_nm_to_stateAbbrev();

var myAreaList          = {
                          };

var myNetworkList       = {
                           "All" : 'All site types',
                           "ForecastSites": "Forecast",
                           "WaterQualitySites": "Water Quality",
                           "CompactBorderSites": "Compact/Border",
                           "BasinSites": "Water Availabilty",
                           "SentinelSites": "Sentinel"
                          };

var networkTypes        = [
                           "Forecast",
                           "Water Quality",
                           "Compact/Border",
                           "Water Availabilty",
                           "Sentinel"
                          ];

var myFundingList       = {
                           "All" : 'All funding levels',
                           "Full" : 'Full FPS funds',
                           "Partial": "Partial FPS funds",
                           "None": "No FPS Funds"
                          };

var fundingTypes        = [
                           "Full",
                           "Partial",
                           "None"
                          ];

var statusTypes         = [
                           "Active",
                           "Inactive"
                          ];

var agencyUseCodes      = {
                           "A" : "Active",
                           "L" : "Active",
                           "M" : "Active",
                           "I" : "Inactive",
                           "R" : "Inactive",
                           "D" : "Inactive",
                           "O" : "Inactive",
                           "U" : "Inactive"
                          };

// Request data
//
$(document).ready(function() 
  {
   // Loading message
   //
   message = "Preparing USGS Federal Priority Streamgages";
   openModal(message);
   //console.log(message);
   
   // Hide elements
   //-------------------------------------------------
   $('#mapUSA').hide();
   $('.insertMaps').hide();
   $('.mapState').hide();
   $('.state-level').hide();
   $(".printMap").hide();
   
   // Check for incoming URL components
   //-------------------------------------------------
   state_abbrev  = jQuery.url.param("state_abbrev");
   console.log("state_abbrev " + state_abbrev);

   state_nm      = jQuery.url.param("state_nm");
   console.log("state_nm " + state_nm);
  
   if(typeof state_abbrev !== "undefined")
     {
      console.log("Using state_abbrev ==> " + state_abbrev);
      if($.isNumeric(state_abbrev))
        {
         myArea = stateCd2nm[state_abbrev];
         console.log("Using state_cd ==> area " + myArea);
         if(typeof myArea !== "undefined")
           {
            console.log("myArea ==> " + myArea);
            $("button#area").prop("value", myArea);
            $("button#area").html(myArea + ' <span class="caret"></span>');
           }
         else
           {
            var message = "Unable to identify your specific state from " +  state_abbrev
            openModal(message);
            fadeModal(3000);
            return false
           }
        }
      else if(state_abbrev.length == 2)
        {
         console.log("state_abbrev ==> " + state_abbrev);
         myArea = stateAbbrev2nm[state_abbrev];
         if(typeof myArea !== "undefined")
           {
            $("button#area").prop("value", myArea);
            $("button#area").html(myArea + ' <span class="caret"></span>');
           }
         else
           {
            var message = "Unable to identify your state specific from " +  state_abbrev
            openModal(message);
            fadeModal(3000);
            return false
           }
        }
      else
        {
         var message = "Unable to identify your state specific from " +  state_abbrev
         openModal(message);
         fadeModal(3000);
         return false
        }
     }

   else if(typeof state_nm !== "undefined")
     {
      console.log("Using state_nm ==> " + state_nm);
      if($.isNumeric(state_nm))
        {
         myArea = stateCd2nm[state_nm];
         console.log("Using state_nm ==> area " + myArea);
         if(typeof myArea !== "undefined")
           {
            console.log("myArea ==> " + myArea);
            $("button#area").prop("value", myArea);
            $("button#area").html(myArea + ' <span class="caret"></span>');
           }
         else
           {
            var message = "Unable to identify your specific state code from " +  state_nm
            openModal(message);
            fadeModal(3000);
            return false
           }
        }
      else if(state_nm.length > 2)
        {
         console.log("state_nm ==> " + state_nm);
         myArea  = state_nm;
         myState = stateNm2abbrev[state_nm];
         console.log("Using state_nm " + state_nm + " ==> " + myArea);
         if(typeof myState !== "undefined")
            {
            $("button#area").prop("value", myArea);
            $("button#area").html(myArea + ' <span class="caret"></span>');
           }
         else
           {
            var message = "Unable to identify your state name specific from " +  state_nm
            openModal(message);
            fadeModal(3000);
            return false
           }
        }
      else
        {
         var message = "Unable to identify your state name specific from " +  state_nm
         openModal(message);
         fadeModal(3000);
         return false
        }
     }
  
   else
     {
      myArea = 'All states and territories';
     }
  
   network_type = jQuery.url.param("network_type");
   console.log("network_type " + network_type);

   if(typeof network_type !== "undefined")
     {
      console.log("Using network_type ==> " + network_type);
      if($.isNumeric(network_type))
        {
         var message = "Unable to identify your specific state from " +  network_type
         openModal(message);
         fadeModal(3000);
         return false
        }
      else if($.inArray(network_type, networkTypes) > -1)
        {
         myNetwork  = network_type;
         console.log("network " + myNetwork);
         $("button#network").prop("value", myNetwork);
         $("button#network").html(myNetwork + ' <span class="caret"></span>');
        }
      else
        {
         var message = "Unable to identify your network specific from " +  network_type
         openModal(message);
         fadeModal(3000);
         return false
        }
     }
  
   else
     {
      myNetwork = 'All site types';
     }

   funding_level = jQuery.url.param("funding_level");
   console.log("funding_level " + funding_level);

   if(typeof funding_level !== "undefined")
     {
      console.log("Using funding_level ==> " + funding_level);
      if($.isNumeric(funding_level_type))
        {
         var message = "Unable to identify your specific funding level " +  funding_level
         openModal(message);
         fadeModal(3000);
         return false
        }
      else if($.inArray(funding_level, fundingTypes) > -1)
        {
         myFunding  = funding_level;
         console.log("funding " + myFunding);
         $("button#funding").prop("value", myFunding);
         $("button#funding").html(myFunding + ' <span class="caret"></span>');
        }
      else
        {
         var message = "Unable to identify your funding level specific from " +  funding_level_type
         openModal(message);
         fadeModal(3000);
         return false
        }
     }
  
   else
     {
      myFunding = 'All funding levels';
     }

   // Build ajax requests
   //-------------------------------------------------
   var webRequests  = [];

   // Request center information
   //
   var request_type = "GET";
   var script_http  = "data/CenterInfoMaster.xml";
   var data_http    = "";
   var dataType     = "xml";
      
   // Web request
   //
   $.support.cors = true;
   webRequests.push($.ajax( {
                             method:   request_type,
                             url:      script_http, 
                             data:     data_http, 
                             dataType: dataType
   }));

   // Request site information
   //
   var request_type = "GET";
   var script_http  = "data/FPSSiteMaster.xml";
   var data_http    = "";
   var dataType     = "xml";
      
   // Web request
   //
   $.support.cors = true;
   webRequests.push($.ajax( {
                             method:   request_type,
                             url:      script_http, 
                             data:     data_http, 
                             dataType: dataType
   }));

   // Run ajax requests
   //
   $.when.apply($, webRequests).then(function() {
        //console.log('Responses');
        //console.log(arguments);

        // Retrieve center information
        //
        var i = 0;
        if(arguments.length > i)
          {
           var myInfo = arguments[i];

           if(myInfo[1] === "success")
             {
              // Loading message
              //
              message = "Processed center information";
              //console.log(message);

              myData       = myInfo[0];
              myJson       = $.xml2json(myData);
              myCenterJson = myJson['#document']['Centers']['Center'];
              //console.log(myCenterJson);
             }
            else
             {
              // Loading message
              //
              message = "Failed to load center information";
              //console.log(message);
              return false;
             }
          }

        // Retrieve site information
        //
        i++;
        if(arguments.length > i)
          {
           var myInfo = arguments[i];

           if(myInfo[1] === "success")
             {
              // Loading message
              //
              message = "Processed site information";
              //console.log(message);

              myData = myInfo[0];
              myJson = $.xml2json(myData);
              mySites = myJson['#document']['FPSSites']['FPSSite'];
              //console.log('mySites');
              //console.log(mySites);
             }
            else
             {
              // Loading message
              //
              message = "Failed to load site information";
              //console.log(message);
              return false;
             }
          }

        // Build
        //
        buildMap()
   });
  })
