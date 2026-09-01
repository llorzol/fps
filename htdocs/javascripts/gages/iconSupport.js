/**
 * Namespace: iconSupport
 *
 * iconSupport is a JavaScript library to provide a set of functions to build
 *  the Customer Icon Web Site.
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

// Process
//
function processWSCs(myWscData)
  {
   console.log("processWSCs");

   myWscInfo = myWscData;

   // Loading message
   //
   message = "Processing WSCs and office information";
   openModal(message);
   //fadeModal(2000);

   // Check for wsc_id/wsc_cd
   //
   if(wsc_id || wsc_cd)
      {
      if(wsc_id)
         {
            var wscFlag = null 
            console.log("wsc_id " + wsc_id)
            for(var i = 0; i < myWscData.length; i++)
            {
                var myWscRecord = myWscData[i];
                //console.log(myWscRecord)
                var myWscID     = myWscRecord.ID;
                if(parseFloat(wsc_id) == myWscID)
                {
                    wscFlag  = wsc_id
                    wsc_name = myWscRecord.Name
                    break;
                }
            }
   
             // Warning message
             //
             if(!wscFlag)
             {
                 message = "No matching WSCs and office information for WSC ID " + wsc_id;
                 openModal(message);
                 fadeModal(3000);
   
                 return false
             }
        }
   
      // Check for wsc_cd
      //
      else if(wsc_cd)
        {
            var wscFlag = null 
            console.log("wsc_cd " + wsc_cd)
            for(var i = 0; i < myWscData.length; i++)
            {
                var myWscRecord = myWscData[i];
                //console.log(myWscRecord)
                var myWsc       = myWscRecord.Code;
                if(wsc_cd.toUpperCase() == myWsc)
                {
                    wscFlag  = wsc_cd
                    wsc_id   = myWscRecord.ID;
                    wsc_name = myWscRecord.Name
                    break;
                }
            }
   
             // Warning message
             //
             if(!wscFlag)
             {
                 message = "No matching WSCs and office information for WSC Code " + wsc_cd;
                 openModal(message);
                 fadeModal(3000);
   
                 return false
             }
        }

      // Request wsc information
      //
      requestWscInfo(wsc_id, wsc_name)
     }

   // Build listing
   //
   else
     {
      buildWscMenu(myWscData);
     }
  }

// Prepare when the DOM is ready 
//
function buildWscMenu(myJson)
  {
   console.log("buildWscMenu");
   //console.log(myJson);

   // Loading message
   //
   message = "Building Water Science Center menu ";
   updateModal(message);

   // Loading message
   //
   buildWscList(myJson);

  // Close message
  //
  fadeModal(3000);
}
        
// Builds list of Wscs 
//
function buildWscList(myJson)
  {
   console.log("buildWscList ");
       
   var myWscInfo = {};
       
   // Loop through 
   //
   for(var i = 0; i < myJson.length; i++) 
     {
      var Record  = myJson[i];
      var myWsc   = Record.Name;
      var wsc_id  = Record.ID;
      var wsc_cd  = Record.Code;
                   
      if(wsc_cd != 'HIF') { myWscInfo[myWsc] = wsc_id; }
     }

   var myWSCs  = jQuery.map(myWscInfo, function(element,index) {return index; }).sort();

   var newList = [];

   newList.push('<select class="select-wsc" multiple="multiple">');
   //newList.push('<option></option>');
       
   // Loop through 
   //
   for(var i = 0; i < myWSCs.length; i++) 
     {
      var myWsc   = myWSCs[i];
      var myWscID = myWscInfo[myWsc];
                   
      newList.push('<option value="' + myWscID + '">' + myWsc + '</option>');
     }
   newList.push('</select>');
                   
   // Build select feature
   //
   //console.log("Centers");
   //console.log(newList.join(""));
   jQuery('#wsc-selection').html(newList.join(""));
   InitializeSingleDropDown('.select-wsc');

   // Enable selection of wsc
   //
   $(".select-wsc").on( "change", function( e ) {  
 
      console.log('Clicked wsc menu');
 
      var myWsc     = null;
      var myWscName = null;

      // Empty table
      //
      $('#summary_table').empty();
   
      // Check selection
      //
      var myChoice = getSelect2Choice('.select-wsc');
      myWsc     = myChoice.id;
      myWscName = myChoice.text;
   
      // Null choice
      //
      if(!myWscName)
        {
         return;
        }
   
      // Choice
      //
      else
        {
         wsc_id   = myWsc;
         wsc_name = myWscName;
         updateQueryStringParam('wsc_id',wsc_id)
         requestWscInfo(myWsc, myWscName)
        }
   
      console.log('wsc_name -> ' + wsc_name);
   });

   return;
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

// Build site summary table
//
function createTable (mySiteInfo) 
  {
   console.log("createTable ");
   //console.log(mySiteInfo);
   //console.log("wsc_id " + wsc_id);
      
   message            = "Building site table";
   openModal(message);

   // Determine partial or full report
   //
   var path           = window.location.pathname;
   var page           = path.split("/").pop();
   var fullTable      = false;
   if(page && page == 'fullReport.html') { fullTable = true; }

   // Table header
   //
   var missingCount   = 0;
   var changingCount  = 0;
   var matchingCount  = 0;
   var updatingCount  = 0;
   var insertingCount = 0;
   var orphanCount    = 0;
      
   var missingSites   = {};
   var changingSites  = {};
   var matchingSites  = {};
   var updatingSites  = {};
   var insertingSites = {};
   var orphanSites    = {};

   var summary_table  = [];

       summary_table.push('<table id="stationsTable" class="stations_table">');
       summary_table.push('<caption id="stationsCaption"></caption>');
       summary_table.push('<thead>');
       summary_table.push('<tr>');
       summary_table.push(' <th>Agency<br />Code</th>');
       summary_table.push(' <th>Site<br />Number</th>');
       summary_table.push(' <th>Station<br />Name</th>');
       summary_table.push(' <th>Approved</th>');
       summary_table.push(' <th>Customer<br />Name</th>');
       summary_table.push(' <th>Customer<br />URL</th>');
       summary_table.push(' <th>Icon<br />URL</th>');
       //summary_table.push(' <th>Modification<br />Date</th>');
       summary_table.push('</tr>');
       summary_table.push('</thead>');
      
       summary_table.push('<tbody>');

   // Loop through sites
   //
   var mySiteSet   = jQuery.map(mySiteInfo, function(element,index) { return index; });
   //var mySiteSet   = jQuery.map(mySiteInfo, function(element,index) { return index; }).sort();
   //console.log(mySiteSet);
   var imageTitle = 'Click on icon for enlarged view';
      
   for(var i = 0; i <  mySiteSet.length; i++)
     {
      var site_no          = mySiteSet[i];
      var agency_cd        = mySiteInfo[site_no].agency_cd;
      var station_nm       = mySiteInfo[site_no].station_nm;
      var status_types     = mySiteInfo[site_no].status;
      var site_types       = mySiteInfo[site_no].site_tp_cd;
      var coopNames        = mySiteInfo[site_no].name;
      var coopUrls         = mySiteInfo[site_no].url;
      var iconUrls         = mySiteInfo[site_no].iconurl;
      var newCustomers     = mySiteInfo[site_no].newCustomer;
      var newUrls          = mySiteInfo[site_no].newUrl;
      var newIcons         = mySiteInfo[site_no].newIcon;
      var approved         = mySiteInfo[site_no].approved;
      var mod_date         = mySiteInfo[site_no].mod_date;

      var showRecord       = false;

      var trClasses        = [];

      // List for full table or just incomplete records
      //
      if(fullTable)
        {
         showRecord = true;
         if(/^no/i.test(approved))
           {
            trClasses.push("warning");
           }

         newCustomers = [];
         newUrls      = [];
         newIcons     = [];
        }

      // List for map table showing incomplete records
      //
      else
        {
         if(/^no/i.test(approved))
           {
            showRecord = true;
           }

         if(newCustomers.length > 0 || newUrls.length > 0 || newIcons.length > 0 )  { showRecord = true; }
        }

      // List just incomplete records
      //
      if(showRecord)
        {      
         var tr_id            = 'id="tr_' + site_no + '" name="tr_' + site_no + '"';
         
         var symbol           = mySiteInfo[site_no].symbol;
         var symbol_img_src   = '<img src="' + symbol + '"> &nbsp;';
              
         // Add classes to mark
         //
         if(i == 0) { trClasses.join("topBorder") }

         summary_table.push('<tr ' + tr_id + ' class="' + trClasses.join(" ") + '">');
         
         // Agency code
         //
         summary_table.push(
                            ' <td>',
                            agency_cd,
                            ' </td>'
                           );
         
         // Site number
         //
         summary_table.push(
                            ' <td>',
                            //'  <a target="_blank" href="https://waterdata.usgs.gov/nwis/inventory/?site_no=' + site_no +'&agency_cd=' + agency_cd + '">' + site_no + '</a>',
                            //'  <a target="_blank" href="https://waterdata.usgs.gov/nwis/uv/?site_id=' + site_no + '">' + site_no + '</a>',
                            '  <a target="_blank" href="https://sifta.water.usgs.gov/NationalFunding//Site.aspx?SiteNumber=' + site_no + '">' + site_no + '</a>',
                            ' </td>'
                           );
         
         // Station name
         //
         summary_table.push(
                            ' <td class="stationName">',
                            station_nm,
                            ' </td>'
                           );
         
         // Modification date in database table
         //
         //summary_table.push(
         //                   ' <td class="stationName">',
         //                   mod_date,
         //                   ' </td>'
         //                  );
         //summary_table.push('</tr>');
   
         // Group customer names
         //
         // -------------------------------------------------------------
         var coopName   = [];
         var newName    = [];
         var buttonText = 'Yes';
         var clickFlag  = false;
   
         // Update customer name
         //
         if(coopNames.length > 0 && newCustomers.length > 0 && !fullTable)
           {
            coopFlag = false;
            coopName.push('<ol class="customer customer_' + site_no + '">');
            coopName.push('<lh class="customerHeader">Current</lh>');
            for(var ii = 0; ii < coopNames.length; ii++)
               {
                if(coopNames[ii].length < 1) { coopName.push('<li class="notAvailable">blank in SIFTA</li>'); }
                else if(coopNames[ii] == 'None')
                  {
                   coopName.push('<li class="notAvailable">Funding expired in SIFTA</li>');
                   if(!coopFlag) { coopFlag = true; }
                  }
                else { coopName.push('<li>' + coopNames[ii] + '</li>'); }
               }
            coopName.push('</ol>');
   
            newFlag = false;
            newName.push('<ol class="newCustomer newcustomer_' + site_no + '">');
            newName.push('<lh class="customerHeader">Update</lh>');
            for(var ii = 0; ii < newCustomers.length; ii++)
               {
                if(newCustomers[ii].length < 1) { newName.push('<li class="notAvailable">blank in SIFTA</li>'); }
                else if(newCustomers[ii] == 'None')
                  {
                   newName.push('<li class="notAvailable">Funding expired in SIFTA</li>');
                   if(!newFlag) { newFlag = true; }
                  }
                else{ newName.push('<li>' + newCustomers[ii] + '</li>'); }
               }
            newName.push('</ol>');

            // Set button text
            //
            if(coopFlag && newFlag) { clickFlag = true; buttonText = 'Click to Confirm'; }
            if(!clickFlag) { clickFlag = true; buttonText = 'Click to Update'; }
           }
   
         // Insert customer name
         //
         else if(coopNames.length < 1 && newCustomers.length > 0 && !fullTable)
           {
            coopName.push('<ol class="customer customer_' + site_no + '">');
            coopName.push('<lh class="customerHeader">Current</lh>');
            coopName.push('<li class="notAvailable">None previously</li>');
            coopName.push('</ol>');
   
            newName.push('<ol class="newCustomer newcustomer_' + site_no + '">');
            newName.push('<lh class="customerHeader">Update</lh>');
            for(var ii = 0; ii < newCustomers.length; ii++)
               {
                newName.push('<li>' + newCustomers[ii] + '</li>');
               }
            newName.push('</ol>');

            // Set button text
            //
            if(!clickFlag) { clickFlag = true; buttonText = 'Click to Update'; }
           }
   
         // Keep customer name, but need to approve
         //
         else if(coopNames.length > 0 && newCustomers.length < 1 && !fullTable)
           {
            coopName.push('<ol class="customer customer_' + site_no + '">');
            coopName.push('<lh class="customerHeader">Current</lh>');
            for(var ii = 0; ii < coopNames.length; ii++)
               {
                coopName.push('<li>' + coopNames[ii] + '</li>');
               }
            coopName.push('</ol>');

            //if(approved == 'No') { missingSites[site_no] = 1; }

            // Set button text
            //
            if(!clickFlag) { clickFlag = true; buttonText = 'Click to Confirm'; }
           }
   
         // Customer name
         //
         else if(fullTable)
           {
            coopName.push('<ol class="customer customer_' + site_no + '">');
            if(coopNames.length > 0)
              {               
               for(var ii = 0; ii < coopNames.length; ii++)
                  {
                   if(coopNames[ii].length < 1) { coopName.push('<li class="notAvailable">blank in SIFTA</li>'); }
                   else if(coopNames[ii] == 'None') { coopName.push('<li class="notAvailable">Funding expired in SIFTA</li>'); }
                   else { coopName.push('<li>' + coopNames[ii] + '</li>'); }
                  }
              }
            else
              {               
               coopName.push('<li>No funding in SIFTA</li>');

               //if(approved == 'No') { missingSites[site_no] = 1; }
              }
            coopName.push('</ol>');
           }
   
         // No customer name
         //
         else
           {
            coopName.push('<ol class="customer customer_' + site_no + '">');
            coopName.push('<lh class="customerHeader">Current</lh>');
            coopName.push('<li class="notAvailable">No funding in SIFTA</li>');
            coopName.push('</ol>');
   
            newName.push('<ol class="newCustomer newcustomer_' + site_no + '">');
            newName.push('<lh class="customerHeader">Update</lh>');
            newName.push('<li class="notAvailable">No funding</li>');
            newName.push('</ol>');
   
            //if(approved == 'No') { missingSites[site_no] = 1; }

            if(!clickFlag) { clickFlag = true; buttonText = 'Click to Confirm'; }
           }
   
         // Group customer urls
         //
         // -------------------------------------------------------------
         var coopUrl = [];
         var newUrl  = [];
   
         // Update customer url
         //
         if(coopUrls.length > 0 && newUrls.length > 0 && !fullTable)
           {
            coopUrl.push('<ol class="customer customer_' + site_no + '">');
            for(var ii = 0; ii < coopUrls.length; ii++)
               {
                if(coopUrls[ii].length < 1) { coopUrl.push('<li class="notAvailable">blank in SIFTA</li>'); }
                else if(coopUrls[ii] == 'None') { coopUrl.push('<li class="notAvailable">Funding expired in SIFTA</li>'); }
                else { coopUrl.push('<li><a href="' + coopUrls[ii] + '">' + coopUrls[ii] + '</a></li>'); }
               }
            coopUrl.push('</ol>');
               
            newUrl.push('<ol class="newCustomer newcustomer_' + site_no + '">');
            for(var ii = 0; ii < newUrls.length; ii++)
               {
                if(newUrls[ii].length < 1) { newUrl.push('<li class="notAvailable">blank in SIFTA</li>'); }
                else if(newUrls[ii] == 'None') { newUrl.push('<li class="notAvailable">Funding expired in SIFTA</li>'); }
                else { newUrl.push('<li><a href="' + newUrls[ii] + '">' + newUrls[ii] + '</a></li>'); }
               }
            newUrl.push('</ol>');

            //updatingSites[site_no] = 1;

            if(!clickFlag) { clickFlag = true; buttonText = 'Click to Update'; }
           }
   
         // Insert customer url
         //
         else if(coopUrls.length < 1 && newUrls.length > 0 && !fullTable)
           {
            coopUrl.push('<ol class="customer customer_' + site_no + '">');
            coopUrl.push('<li class="notAvailable">None previously</li>');
            coopUrl.push('</ol>');
               
            newUrl.push('<ol class="newCustomer newcustomer_' + site_no + '">');
            for(var ii = 0; ii < newUrls.length; ii++)
               {
                if(newUrls[ii].length < 1) { newUrl.push('<li class="notAvailable">blank in SIFTA</li>'); }
                else if(newUrls[ii] == 'None') { newUrl.push('<li class="notAvailable">Funding expired in SIFTA</li>'); }
                else { newUrl.push('<li><a href="' + newUrls[ii] + '">' + newUrls[ii] + '</a></li>'); }
               }
            newUrl.push('</ol>');

            //updatingSites[site_no] = 1;

            //if(approved == 'No') { missingSites[site_no] = 1; }

            if(!clickFlag) { clickFlag = true; buttonText = 'Click to Update'; }
           }
   
         // Keep customer url, but need to approve
         //
         else if(coopUrls.length > 0 && newCustomers.length < 1 && !fullTable)
           {
            coopUrl.push('<ol class="customer customer_' + site_no + '">');
            for(var ii = 0; ii < coopUrls.length; ii++)
               {
                if(coopUrls[ii].length < 1) { coopUrl.push('<li class="notAvailable">blank in SIFTA</li>'); }
                else if(coopUrls[ii] == 'None') { coopUrl.push('<li class="notAvailable">Funding expired in SIFTA</li>'); }
                else { coopUrl.push('<li><a href="' + coopUrls[ii] + '">' + coopUrls[ii] + '</a></li>'); }
               }
            coopUrl.push('</ol>');

            matchingSites[site_no] = 1;

            if(!clickFlag) { clickFlag = true; buttonText = 'Click to Confirm'; }
           }
   
         // Customer url
         //
         else if(fullTable)
           {
            coopUrl.push('<ol class="customer customer_' + site_no + '">');
            if(coopUrls.length > 0)
              {               
               for(var ii = 0; ii < coopUrls.length; ii++)
                  {
                   if(coopUrls[ii].length < 1) { coopUrl.push('<li class="notAvailable">blank in SIFTA</li>'); }
                   else if(coopUrls[ii] == 'None') { coopUrl.push('<li class="notAvailable">Funding expired in SIFTA</li>'); }
                   else { coopUrl.push('<li><a href="' + coopUrls[ii] + '">' + coopUrls[ii] + '</a></li>'); }
                  }
              }
            else
              {               
               coopUrl.push('<li>No funding in SIFTA</li>');

               if(approved == 'No') { missingSites[site_no] = 1; }
              }
            coopUrl.push('</ol>');
           }
   
         // No customer url
         //
         else
           {
            coopUrl.push('<ol class="customer customer_' + site_no + '">');
            coopUrl.push('<li class="notAvailable">No funding in SIFTA</li>');
            coopUrl.push('</ol>');
   
            newUrl.push('<ol class="newCustomer newcustomer_' + site_no + '">');
            newUrl.push('<li class="notAvailable">No funding</li>');
            newUrl.push('</ol>');
   
            //if(approved == 'No') { missingSites[site_no] = 1; }

            if(!clickFlag) { clickFlag = true; buttonText = 'Click to Confirm'; }
           }
   
         // Group customer icon urls
         //
         // -------------------------------------------------------------
         var iconUrl = [];
         var newIcon = [];
   
         // Update customer icons
         //
         if(iconUrls.length > 0 && newIcons.length > 0 && !fullTable)
           {
            iconUrl.push('<ol class="customer customer_' + site_no + '">');
            for(var ii = 0; ii < iconUrls.length; ii++)
               {
                if(iconUrls[ii].length < 1) { iconUrl.push('<li class="notAvailable">blank in SIFTA</li>'); }
                else if(iconUrls[ii] == 'None') { iconUrl.push('<li class="notAvailable">Funding expired in SIFTA</li>'); }
                else { iconUrl.push('<li><img src="' + iconUrls[ii] + '" class="customerIcon" title="' + imageTitle + '"> &nbsp;</li>'); }
               }
            iconUrl.push('</ol>');
   
            newIcon.push('<ol class="newCustomer newcustomer_' + site_no + '">');
            for(var ii = 0; ii < newIcons.length; ii++)
               {
                if(newIcons[ii].length < 1) { newIcon.push('<li class="notAvailable">blank in SIFTA</li>'); }
                else if(newIcons[ii] == 'None') { newIcon.push('<li class="notAvailable">Funding expired in SIFTA</li>'); }
                else { newIcon.push('<li><img src="' + newIcons[ii] + '" class="customerIcon" title="' + imageTitle + '"> &nbsp;</li>'); }
               }
            newIcon.push('</ol>');

            //updatingSites[site_no] = 1;

            if(!clickFlag) { clickFlag = true; buttonText = 'Click to Update'; }
           }
   
         // Insert customer icon
         //
         else if(iconUrls.length < 1 && newIcons.length > 0 && !fullTable)
           {
            iconUrl.push('<ol class="customer customer_' + site_no + '">');
            iconUrl.push('<li class="notAvailable">None previously</li>');
            iconUrl.push('</ol>');
               
            newIcon.push('<ol class="newCustomer newcustomer_' + site_no + '">');
            for(var ii = 0; ii < newIcons.length; ii++)
               {
                newIcon.push('<li><img src="' + newIcons[ii] + '" class="customerIcon" title="' + imageTitle + '"> &nbsp;</li>');
               }
            newIcon.push('</ol>');

            //updatingSites[site_no] = 1;

            //if(approved == 'No') { missingSites[site_no] = 1; }

            if(!clickFlag) { clickFlag = true; buttonText = 'Click to Update'; }
           }
   
         // Keep customer icon, but need to approve
         //
         else if(iconUrls.length > 0 && newIcons.length < 1 && !fullTable)
           {
            iconUrl.push('<ol class="customer customer_' + site_no + '">');
            for(var ii = 0; ii < iconUrls.length; ii++)
               {
                if(iconUrls[ii].length < 1) { iconUrl.push('<li class="notAvailable">blank in SIFTA</li>'); }
                else if(iconUrls[ii] == 'None') { iconUrl.push('<li class="notAvailable">Funding expired in SIFTA</li>'); }
                else { iconUrl.push('<li><img src="' + iconUrls[ii] + '" class="customerIcon" title="' + imageTitle + '"> &nbsp;</li>'); }
               }
            iconUrl.push('</ol>');

            matchingSites[site_no] = 1;

            if(!clickFlag) { clickFlag = true; buttonText = 'Click to Confirm'; }
           }
   
         // Customer url
         //
         else if(fullTable)
           {
            iconUrl.push('<ol class="customer customer_' + site_no + '">');
            if(iconUrls.length > 0)
              {               
               for(var ii = 0; ii < iconUrls.length; ii++)
                  {
                   if(iconUrls[ii].length < 1) { iconUrl.push('<li class="notAvailable">blank in SIFTA</li>'); }
                   else if(iconUrls[ii] == 'None') { iconUrl.push('<li class="notAvailable">Funding expired in SIFTA</li>'); }
                   else { iconUrl.push('<li><img src="' + iconUrls[ii] + '" class="customerIcon" title="' + imageTitle + '"> &nbsp;</li>'); }
                  }
              }
            else
              {               
               iconUrl.push('<li>No funding in SIFTA</li>');

               if(approved == 'No') { missingSites[site_no] = 1; }
              }
            iconUrl.push('</ol>');
           }
   
         // No customer icon
         //
         else
           {
            iconUrl.push('<ol class="customer customer_' + site_no + '">');
            iconUrl.push('<li class="notAvailable">No funding in SIFTA</li>');
            iconUrl.push('</ol>');
   
            newIcon.push('<ol class="newCustomer newcustomer_' + site_no + '">');
            newIcon.push('<li class="notAvailable">No funding</li>');
            newIcon.push('</ol>');
   
            //if(approved == 'No') { missingSites[site_no] = 1; }

            if(!clickFlag) { clickFlag = true; buttonText = 'Click to Confirm'; }
           }
   

         // Set count
         //
         if(buttonText == 'Click to Confirm')
           {
            missingSites[site_no] = 1;
           }

         if(buttonText == 'Click to Update')
           {
            updatingSites[site_no] = 1;
           }

         if(approved == 'No' && fullTable) { missingSites[site_no] = 1; }
         
         // Approved
         //
         var approvedText = '<button id="button_' + site_no + '" class="dt-button approvalClick" value="' + approved + '">Click for Yes</button>';
         if(clickFlag) { approvedText = '<button id="button_' + site_no + '" class="dt-button approvalClick" value="' + approved + '">' + buttonText + '</button>'; }
         //if(approved == 'Yes') { approvedText = '<button id="button_' + site_no + '" class="dt-button approvalClick" value="' + approved + '">Click for No</button>'; }
         if(fullTable) { approvedText = approved; }
         summary_table.push(
                            ' <td id="td_' + site_no + '" class="buttonChoice">',
                            //approved,
                            approvedText,
                            ' </td>'
                           );
   
         // Write customer names
         //
         summary_table.push(
                            ' <td>',
                            coopName.join(""),
                            newName.join(""),
                            ' </td>'
                           );
   
         // Write customer urls
         //
         summary_table.push(
                            ' <td>',
                            coopUrl.join(" "),
                            newUrl.join(""),
                            ' </td>'
                           );
   
         // Write customer icons
         //
         summary_table.push(
                            ' <td class="customerIcons">',
                            iconUrl.join(" "),
                            newIcon.join(""),
                            ' </td>'
                           );
        }
     }
	
   summary_table.push('</tbody>');
   summary_table.push('</table>');

   // Update table
   //
   var mymissingCount = jQuery.map(missingSites, function(element,index) {return index; });
   var myupdatesCount = jQuery.map(updatingSites, function(element,index) {return index; });
   //console.log(missingSites);
      
   $("#summary_table").html(summary_table.join("\n"));
   if(fullTable) { $(".customerHeader").remove(); }

   caption = '<span id="totalCount">--</span> Active USGS gages for <span id="myWsc">--</span> -- <span id="updatingCount">--</span> with updates and <span id="missingCount">--</span> having incomplete customer information';
   if(fullTable)
     {
      caption = '<span id="totalCount">--</span> Active USGS gages for <span id="myWsc">--</span> -- <span id="missingCount">--</span> needing approved customer information';
     }
  
   $("#stationsCaption").html(caption);
   $("#missingCount").html(mymissingCount.length);
   $("#updatingCount").html(myupdatesCount.length);
   $("#totalCount").html(mySiteSet.length);
   $("#myWsc").html(wsc_name + ' Water Science Center');
   var myTitle = 'Sites for ' + wsc_name + ' Water Science Center';
   if(fullTable)
     {
      minDataTables(".stations_table", myTitle);
     }
   else
     {
      maxDataTables(".stations_table", myTitle);
     }

   //fadeModal(2000);

   // Add click on icon to better view it
   //
   $(".customerIcons img").on('click', function() {
        var popup = $(this).prop('src');
        console.log('Image');
        console.log(popup);
      
        message = 'Customer icon <img class="imagePopUp" src="' + popup + '">';
        openModal(message);
        fadeModal(3000);
     
   });

   // Add click on icon to better view it
   //
   if(!fullTable)
     {
      $(".approvalClick").on('click', function(el) {
           var popup   = $(this).prop('id');
           var siteID  = popup.split('_');
           var siteNo  = siteID[1];
           
           //message = 'Changing customer story for site ' + siteNo + ' to Yes';
           //openModal(message);
           //fadeModal(3000);
          
           $(this).prop('value', "Yes");
           $(this).text("Confirmed");
         
           updateStory(siteNo, approved)     
      });
     }
     
   return;
  }



// Update story
//
function updateStory(siteNo, approved)
 {
   console.log("updateStory for site " + siteNo);
     
   message = 'Changing customer story for site ' + siteNo + ' to Yes';
   openModal(message);
   fadeModal(3000);

   // Build ajax requests
   //
   var request_type = "GET";
   var script_http  = "/cgi-bin/iconProject/updateStory.py";
   var data_http    = "sites=" + siteNo + "&approved=Yes";
   var dataType     = "json";
      
   // Web request
   //
   webRequest(request_type, script_http, data_http, dataType, processStory);

  return;
 }


// Update story
//
function processStory(jsonResponse)
 {
   console.log("processStory");
   console.log(jsonResponse);

   var siteNo   = jsonResponse.site_no;
   var approved = jsonResponse.approved;
     
   message = 'Updated customer story for site ' + siteNo + ' to ' + approved;
   openModal(message);
   fadeModal(3000);
     
   // Remove row for specific site from table
   //
   var table = $('#stationsTable').DataTable();
   table
        .row( $('#tr_' + siteNo) )
        .remove()
        .draw();
     
   // Remove marker for specific site from map
   //
   allSites.eachLayer(function(site) {
       var siteNumber = site.options.site_no;
       if(siteNumber == siteNo)
         {
          site.closePopup();
          site.setOpacity(0);
          map.removeLayer(site);
         }
   });  
     
   return;
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
