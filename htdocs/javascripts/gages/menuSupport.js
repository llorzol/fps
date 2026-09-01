/**
 * Namespace: menuSupport
 *
 * Script menuSupport is a JavaScript library to provide a set of functions to build
 *  the selection menus.
 *
 * version 1.15
 * June 24, 2021
*/

/*
###############################################################################
# Copyright (c) Oregon Water Science Center
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

function InitializeManyDropDown () 
  {
     console.log("InitializeManyDropDown ");

     // Initialize
     //-------------------------------------------------
     $('.select-person').select2( {
         enable: true,
         multiple: true,
         placeholder: 'Select one or more...'
     });  

  }
  
function InitializeSingleDropDown (selector) 
  {
     //console.log("InitializeSingleDropDown " + selector);
 
     // Initialize
     //-------------------------------------------------
     $(selector).select2( {
         //placeholder: 'Select only one...',
         //allowClear: true,
         multiple: false
     });  

  }

function InitializeSingleDropDown2 (selector) 
  {
     console.log("InitializeSingleDropDown " + selector);

     // Initialize
     //-------------------------------------------------
     $(selector).select2( {
         enable: true,
         multiple: true,
         maximumSelectionLength: 1,
         placeholder: 'Select only one...'
     });  

  }

function disableDropDown (selector) 
  {
     console.log("disableDropDown " + selector);

     // Initialize
     //-------------------------------------------------
     $(selector).select2( {
         enable: false
     });  

  }

function enableDropDown (selector) 
  {
     console.log("enableDropDown " + selector);

     // Initialize
     //-------------------------------------------------
     $(selector).select2( {
         enable: true
     });  

  }

function selectizeInit2 () 
  {
     console.log("selectizeInit ");

     // Selectize
     //-------------------------------------------------
     $('#select-person').selectize( {
         //create: true,
         sortField: 'text'
     });  

  }

function selectizeInit3 () 
  {
     console.log("selectizeInit ");

     // Initialize
     //-------------------------------------------------
     $('.select-person').select2();  

  }
