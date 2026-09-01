/**
 * Namespace: datatablesSupport
 *
 * datatablesSupport is a JavaScript library to provide a set of functions to build
 *  a table with buttons to export table content.
 *
 * $Id: /var/www/html/fps/javascripts/gages/datatablesSupport.js, v 1.68 2026/07/19 18:10:33 llorzol Exp $
 * $Revision: 1.68 $
 * $Date: 2026/07/19 18:10:33 $
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
//let activeRe        = new RegExp(/(^<img)\s+(\w+)Green-Triangle.gif")');
//let discontinuedRed = new RegExp(/[<img src="Symbols/Red-Triangle.gif">]/);
                   //data.replace( /(^<img)\s+(\w+)Green-Triangle.gif(\w+)/, 'X' ) :

var te_excelButton = 
  {
   exportOptions: {
       format: {
           body: function ( data, row, column, node ) {

               // Strip href
               //
               //var data = column > 0 || column < 2 ? data.replace( /^<a\s+(?:[^>]*?\s+)?href=(["'])(.*?)/i, 'Yes' ) : data;
               //var data = column > 0 || column < 2 ? data.replace( /^(<a\s+(?:[^>]*?\s+)?href=(["'])(.*?)(\d+))/i, 'Yes' ) : data;
               //var data = column > 0 || column < 2 ? data.replace( /^(<a\s+(?:[^>]*?\s+)?href=(["'])(.*?)(\d+)*">)((\d+))<\/a>/i, $6 ) : data;
               var data = column > 0 || column < 2 ? data.replace( /^(<a\s+(?:[^>]*?\s+)?href=(["'])(.*?)(\d+)*">)/i, '' ) : data;
               data     = column > 0 || column < 2 ? data.replace( /(<\/a>)$/i, '' ) : data;
               data     = column === 0 ? data.replace( /^(<span class="site_no">)/i, '' ) : data;
               data     = column === 0 ? data.replace( /(<\/span>)$/i, '' ) : data;

               // Strip img tag
               //
               var data = column === 0 ? data.replace( /<img .*?>/, '' ) : data;
               var data = column === 0 ? data.replace( /&nbsp;/, '' ) : data;

               return data;
         }
       }
     }
  }

var excelButtonSave = 
  {
   exportOptions: {
       format: {
           body: function ( data, row, column, node ) {

               // Strip img tag
               //
               return column == 0 ?
                   data.replace( /<img src="\.\/\w+\/\w+.png">/, '' ) :
                   data;
         }
       }
     }
  }

var printButton = 
  {
   exportOptions: {
       format: {
           body: function (data, row, column, node ) {
               //jQuery('.stations_table > caption' ).remove();
               return data;
         }
       }
     }
  }

// Describes Excel structure
//
//    https://datatables.net/reference/button/excelHtml5#Customisation
//    https://docs.sheetjs.com/
//    http://officeopenxml.com/SSstyles.php
//
function te_DataTable (tableSelector, myTitle, excelFileName) 
  {
     // TableSorter - New Version with Fixed Headers
     //-------------------------------------------------
     jQuery(tableSelector).DataTable( {
         rowGroup: {dataSrc: 1 },
        "paging":    false,
         scrollCollapse: true,
         scrollX: true,
         scrollY: '40vh',
        "ordering":  true,
        //"info":      false,
        //"searching": false,
        "autoWidth": true,
        "stripeClasses": [],
        "bAutoWidth": false,
        "order": [[0, 'asc' ]],
        dom: 'Bfrtip',
        buttons: [
            $.extend( true, {}, te_excelButton, {
                extend: 'excelHtml5',
                text: 'Excel',
                sheetName: "FPS",
                messageTop: myTitle,
                title: '',
                filename: excelFileName,
                exportOptions: { columns: [0, 1, 2, 3, 4, 5, 7, 8],
                                 rows: ':visible',
                                 format: {
                                     body: function (data, row, column, node) {
                                         let div = document.createElement('div');
                                         div.innerHTML = data;

                                         // Find and use regex to extract the URL and the display text
                                         //
                                         if (data && data.toLowerCase().includes('<a ')) {
                                             const hrefMatch = data.match(/href=["']([^"']*)["']/);
                                             const textMatch = data.match(/>([^<]*)</);

                                             if (hrefMatch && textMatch) {
                                                 const url = hrefMatch[1];
                                                 const text = textMatch[1];

                                                 // Step 3: Return it structured as an Excel formula
                                                 return `=HYPERLINK("${url}", "${text}")`;
                                             }
                                         }

                                         // Check if the cell has href
                                         //
                                         if (div.querySelector('a')) {
                                             var linkUrl = div.attr('data-url');
                                             var cellText = div.text();
                                             //myLogger.info('Selected', linkUrl, cellText);
                                             div.innerHTML = 'Yes';
                                             return div.innerHTML;
                                         }

                                         // Check if the cell has an image
                                         //
                                         if (div.querySelector('img')) {
                                             div.querySelector('img').remove();
                                             div.innerHTML = 'Yes';
                                             return div.innerHTML;
                                         }
                                             
                                         return data;
                                     }}
                               },
                customize: function ( xlsx ) {
                    var sheet = xlsx.xl.worksheets['sheet1.xml'];

                    // Highlight table caption
                    //
                    $('row:first c', sheet).attr( 's', '42' );
 
                    // Left justify column A for all rows except row 1
                    //  [not working ??]
                    //
                    $('row:gt(0) c[r="A"]', sheet).attr( 's', '50' );
 
                    // Set column A to text for all rows except row 1
                    //
                    $('row:gt(0) c[r="A"]', sheet).attr( 's', '0' );
                }
            } ),
            $.extend( true, {}, printButton, {
                extend: 'print',
                title: myTitle,
                autoPrint: false,
                customize: function (doc) {
                    // Change font size of the entire print window body
                    $(doc.document.body).css('font-size', '10pt');
                    $(doc.document.body).find('h1').css('font-size', '15pt');
                    $(doc.document.body).find('h1').css('text-align', 'center'); 
                    $(doc.document.body).find('div').text(''); 

                    // Change font size of the table specifically and make it compact
                    $(doc.document.body).find('table').css('font-size', '8pt');
                    $(doc.document.body).find('th').css('font-size', '14pt');
                    $(doc.document.body).find('tr').css('font-size', '10pt');
                }
            } ),
            {
                extend: 'pdfHtml5',
                orientation: 'landscape',
                pageSize: 'A4',        // Expands page area (also try 'A3' or 'TABLOID')
                messageTop: myTitle,
                autoPrint: false,
                exportOptions: {
                    columns: [0, 1, 2, 3, 4, 5, 6, 7, 8],
                    rows: ':visible',
                    format: {
                        body: function (data, row, column, node) {
                            let div = document.createElement('div');
                            div.innerHTML = data;

                            // Check if the cell has an image
                            //
                            if (div.querySelector('img')) {
                                div.querySelector('img').remove();
                                div.innerHTML = 'Yes';
                                return div.innerHTML;
                            }

                            // Check if the cell has href
                            //
                            if (div.querySelector('a')) {
                                //var linkUrl = div.attr('data-url');
                                //var cellText = div.text();
                                //myLogger.info('Selected', div.innerText);
                                //div.innerHTML = cellText;
                                return div.innerText;
                            }

                            return data;
                        }}
                },
                customize: function (doc) {
                    // 1. Reduce font size to fit more data
                    doc.defaultStyle.fontSize = 8;
                    doc.styles.tableHeader.fontSize = 8;

                    // 2. Adjust margins to maximize printable area
                    //doc.pageMargins = [ 10, 10, 10, 10 ];

                    myLogger.info('Selected', doc);

                    // 3. Force the table to stretch exactly 100% of the page width
                    var colCount = doc.content[2].table.body[0].length;
                    doc.content[2].table.widths = Array(colCount).fill('auto');
                    //var tbl = doc.content.find(item => item.table);

                    //if (tbl) {
                        // Extract the exact number of columns included in the PDF matrix
                        //var colCount = tbl.table.body[0].length;
                        //console.log("Exported columns:", colCount);

                        // Example: Automatically set equal widths based on column count
                        //tbl.table.widths = Array(colCount + 1).join('*').split('');
                    //}
                }
            },
            {
                text: 'Geojson',
                autoPrint: true,
                action: function ( e, dt, node, config ) {
                    message = 'Exporting sites in geojson format';
                    openModal(message);
                    fadeModal(3000);
                    var file = 'Federal-Priority-Streamgages.geojson';
                      saveAs(new File([JSON.stringify(myGeoJson)], file, {
                        type: "text/plain;charset=utf-8"
                      }), file);
                }
            }
        ]
     });
  }

// Describes Excel structure
//
//    https://datatables.net/reference/button/excelHtml5#Customisation
//    https://docs.sheetjs.com/
//    http://officeopenxml.com/SSstyles.php
//
function te_DataTableSave (tableSelector, myTitle, excelFileName) 
  {
     console.log("datatablesInit " + jQuery(tableSelector).length);

     // TableSorter - New Version with Fixed Headers
     //-------------------------------------------------
     jQuery(tableSelector).DataTable( {
        "paging":    false,
        "ordering":  true,
        "info":      false,
        "searching": false,
        "autoWidth": true,
        "stripeClasses": [],
        "fixedHeader": { header: true, footer: false, headerOffset: $('#fixed').height() },
//        "columnDefs": [
//            { "type": "html", "targets": 0 }
//        ],
        dom: 'Bfrtip',
        "order": [[1, 'asc' ],[2, 'asc' ]],
        buttons: [
            $.extend( true, {}, te_excelButton, {
                extend: 'excelHtml5',
                exportOptions: { columns: [0, 1, 2, 3, 4, 5, 7] },
                title: '',
                messageTop: myTitle,
                sheetName: "T&E",
                filename: excelFileName,
                customize: function ( xlsx ) {
                    var sheet = xlsx.xl.worksheets['sheet1.xml'];

                    // Highlight table caption
                    //
                    $('row:first c', sheet).attr( 's', '42' );
 
                    // Left justify column A for all rows except row 1
                    //  [not working ??]
                    //
                    $('row:gt(0) c[r="A"]', sheet).attr( 's', '50' );
 
                    // Set column A to text for all rows except row 1
                    //
                    $('row:gt(0) c[r="A"]', sheet).attr( 's', '0' );
                }
            } ),
            $.extend( true, {}, printButton, {
                extend: 'print',
                title: myTitle,
                autoPrint: false
            } )
        ]
     });
  }

function minDataTables (tableSelector, myTitle) 
  {
     console.log("datatablesInit " + jQuery(tableSelector).length);

     // TableSorter - New Version with Fixed Headers
     //-------------------------------------------------
     jQuery(tableSelector).DataTable( {
        "paging":    false,
        "ordering":  true,
        "info":      false,
        "searching": false,
        "autoWidth": true,
        "stripeClasses": [],
        dom: 'Bfrtip',
        "bAutoWidth": false,
        "order": [[1, 'asc' ]],
        buttons: [
            {
                extend: 'excelHtml5',
                title: '',
                sheetName: myTitle
            },
            {
                extend: 'print',
                autoPrint: false
            },
            {
                text: 'Site Customer Approval Tool',
                action: function ( e, dt, node, config ) {
                            url          = 'index.html?wsc_id=' + wsc_id;
                            var myWindow = window.open(url, '_blank', '');
                               
                            // Change title
                            // 
                            //jQuery(myWindow.document).prop("title", "Customer Summary of All Active Sites for " + wsc_name);
                            myWindow.focus();
                }
            }
        ]
     });
  }

// Works but no preprocessing of Excel table
//
function maxDataTables (tableSelector, myTitle) 
  {
     console.log("datatablesInit " + jQuery(tableSelector).length);

     // TableSorter - New Version with Fixed Headers
     //-------------------------------------------------
     jQuery(tableSelector).DataTable( {
        "paging":    false,
        "ordering":  true,
        "info":      false,
        "searching": false,
        "autoWidth": true,
        "stripeClasses": [],
        dom: 'Bfrtip',
        "order": [[1, 'asc' ]],
        buttons: [
            $.extend( true, {}, excelButton, {
                extend: 'excelHtml5',
                columns: [0, 1, 2, 3, 4, 5, 6, 7],
                title: '',
                messageTop: myTitle,
                sheetName: "FPS sheet"
            } ),
            $.extend( true, {}, printButton, {
                extend: 'print',
                title: myTitle,
                //messageTop: myTitle,
                customize: function ( win ) {
                    jQuery('.customerHeader' )
                         .preappend('<p>');
                    jQuery('.customerHeader' )
                         .append('/p>');
                },
                autoPrint: false
            } )
        ]
     });
  }

// https://regex101.com/r/eR2oH3/24
// https://datatables.net/reference/button/excelHtml5#Built-in-styles
// https://stackoverflow.com/questions/41485310/exporting-jquery-datatable-to-excel-with-additional-rows-is-not-working-ie
// https://stackoverflow.com/questions/61313581/jquery-datatable-export-to-excel-customization-make-first-row-bold
// https://stackoverflow.com/questions/40243616/jquery-datatables-export-to-excelhtml5-hyperlink-issue
// https://stackoverflow.com/questions/41230596/datatables-how-to-fill-a-column-with-a-hyperlink
// https://datatables.net/extensions/buttons/examples/html5/titleMessage.html
//
function exportCustomExcel (tableSelector, myTitle) 
  {
     console.log("datatablesInit " + jQuery(tableSelector).length);

     // TableSorter - New Version with Fixed Headers
     //-------------------------------------------------
     jQuery(tableSelector).DataTable( {
        "paging":    false,
        "ordering":  true,
        "info":      false,
        "searching": false,
        "autoWidth": true,
        "stripeClasses": [],
        dom: 'Bfrtip',
        "order": [[1, 'asc' ]],
        buttons: [
            $.extend( true, {}, excelButton, {
                extend: 'excelHtml5',
                columns: [0, 1, 2, 3, 4, 5, 6, 7],
                title: '',
                messageTop: myTitle,
                sheetName: "FPS",
                customize: function ( xlsx ) {
                    var sheet = xlsx.xl.worksheets['sheet1.xml'];
                    $('row:first c', sheet).attr( 's', '42' );

                    // Loop over all cells in sheet
                    //
                    //$('row a', sheet).each( function () {
                    $('row href', sheet).each( function () {
                        console.log(" Row " + $(this).text());

                        // If cell starts with http
                        //
                        if ( $('is t', this).text().indexOf("<a href") === 0 ) {

                           // (2.) change the type to `str` which is a formula
                           //
                           $(this).attr('t', 'str');
                           
                           // Append the formula
                           //
                           $(this).append('<f>' + 'HYPERLINK("'+$('is t', this).text()+'","'+$('is t', this).text()+'")'+ '</f>');
                           
                           // Remove the inlineStr
                           //
                           $('is', this).remove();
                           
                           // (3.) underline
                           //
                           $(this).attr( 's', '4' );
                       }
                    });
                }
            } ),
            $.extend( true, {}, printButton, {
                extend: 'print',
                title: myTitle,
                autoPrint: false
            } )
        ]
     });
  }

function datatablesExport (tableSelector) 
  {
   var tableSelector = '#' + tableSelector;

     console.log("datatablesExport " + jQuery(tableSelector).length);

     // TableSorter - New Version with Fixed Headers
     //-------------------------------------------------
     jQuery(tableSelector).DataTable( {
        "paging":    false,
        "ordering":  false,
        "info":      false,
        "searching": false,
        dom: 'Bfrtip',
        buttons: [
            {
                extend: 'csv',
                autoClose: true,
                filename: 'file_name'
            }
        ]
     });

   $(".dt-buttons").hide();
   $('.buttons-csv').click()
  }

function datatablesFull (tableSelector, myTitle) 
  {
     console.log("datatablesExport " + jQuery(tableSelector).length);


     // TableSorter - New Version with Fixed Headers
     //-------------------------------------------------
     jQuery(tableSelector).DataTable( {
        "paging":    false,
        "ordering":  true,
        "info":      false,
        "searching": false,
        "stripeClasses": [],
        dom: 'Bfrtip',
        "order": [[1]],
        buttons: [
            {
                extend: 'excelHtml5',
                title: '',
                sheetName: myTitle
            },
            {
                extend: 'print',
                autoPrint: false
            }
        ]
     });
  }

function datatablesSearch () 
  {
     console.log("datatablesSearch " + jQuery("#employee_table").length);

     // TableSorter - New Version with Fixed Headers
     //-------------------------------------------------
     jQuery("#employee_table").DataTable( {
         //'searching': true,
         //'search': "Search for individual",
         'paging': false,
         'ordering': false,
         'info': false
     });

  }

function datatablesDestroy (tableSelector) 
  {
  console.log("datatablesDestroy " + jQuery(tableSelector).length);
  
  var table = $(tableSelector).DataTable();
  //console.log(table);
  
  table.destroy();
  
  jQuery(tableSelector).empty(); // empty in case the columns change

  console.log("Destroyed " + jQuery(tableSelector).length);
  }