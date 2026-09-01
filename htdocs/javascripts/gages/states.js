/**
 * Namespace: States -- FIPS state codes
 *
 * version 1.08
 * November 13, 2017
*/

/*
###############################################################################
# Copyright (c) 2017 U.S. Geological Survey
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

var data_struct = [
//                   - State abbrev
//                   |     - State code
//                   |     |     - State Name
//                   |     |     |
                   ['al', '01', 'Alabama',         ],
                   ['ak', '02', 'Alaska',          ],
                   ['az', '04', 'Arizona',         ],
                   ['ar', '05', 'Arkansas',        ],
                   ['ca', '06', 'California',      ],
                   ['co', '08', 'Colorado',        ],
                   ['ct', '09', 'Connecticut',     ],
                   ['de', '10', 'Delaware',        ],
                   ['dc', '11', 'Dist. of Columbia'],
                   ['fl', '12', 'Florida',         ],
                   ['ga', '13', 'Georgia',         ],
                   ['hi', '15', 'Hawaii',          ],
                   ['id', '16', 'Idaho',           ],
                   ['il', '17', 'Illinois',        ],
                   ['in', '18', 'Indiana',         ],
                   ['ia', '19', 'Iowa',            ],
                   ['ks', '20', 'Kansas',          ],
                   ['ky', '21', 'Kentucky',        ],
                   ['la', '22', 'Louisiana',       ],
                   ['me', '23', 'Maine',           ],
                   ['md', '24', 'Maryland',        ],
                   ['ma', '25', 'Massachusetts',   ],
                   ['mi', '26', 'Michigan',        ],
                   ['mn', '27', 'Minnesota',       ],
                   ['ms', '28', 'Mississippi',     ],
                   ['mo', '29', 'Missouri',        ],
                   ['mt', '30', 'Montana',         ],
                   ['ne', '31', 'Nebraska',        ],
                   ['nv', '32', 'Nevada',          ],
                   ['nh', '33', 'New Hampshire',   ],
                   ['nj', '34', 'New Jersey',      ],
                   ['nm', '35', 'New Mexico',      ],
                   ['ny', '36', 'New York',        ],
                   ['nc', '37', 'North Carolina',  ],
                   ['nd', '38', 'North Dakota',    ],
                   ['oh', '39', 'Ohio',            ],
                   ['ok', '40', 'Oklahoma',        ],
                   ['or', '41', 'Oregon',          ],
                   ['pa', '42', 'Pennsylvania',    ],
                   ['ri', '44', 'Rhode Island',    ],
                   ['sc', '45', 'South Carolina',  ],
                   ['sd', '46', 'South Dakota',    ],
                   ['tn', '47', 'Tennessee',       ],
                   ['tx', '48', 'Texas',           ],
                   ['ut', '49', 'Utah',            ],
                   ['vt', '50', 'Vermont',         ],
                   ['va', '51', 'Virginia',        ],
                   ['wa', '53', 'Washington',      ],
                   ['wv', '54', 'West Virginia',   ],
                   ['wi', '55', 'Wisconsin',       ],
                   ['wy', '56', 'Wyoming',         ],

                   // these were obtained from /usr/opt/nwis/doc/fips.html
                   ['aq', '60', 'American Samoa',  ],
                   // ['cz', '61', 'Canal Zone',      ],
                   // ['eq', '62', 'Canton and Enderbury Islands',  ],
                   // ['fm', '64', 'Federated States of Micronesia',],
                   ['gu', '66', 'Guam',            ],
                   // ['jq', '67', 'Johnston Atoll',  ],
                   // ['mh', '68', 'Marshal Islands', ],
                   ['mp', '69', 'Northern Mariana Islands',],
                   // ['pw', '70', 'Palau - Trust Territory',],
                   // ['mq', '71', 'Midway Islands',  ],
                   ['pr', '72', 'Puerto Rico',     ],
                   // ['yq', '73', 'Ryukyu Islands, Southern',],
                   // ['sq', '74', 'Swan Islands',    ],
                   // ['tq', '75', 'Trust Territories, Pacific Is',],
                   // ['bq', '76', 'U.S.Misc Caribbean Islands',],
                   // ['iq', '77', 'U.S.Misc Pacific Islands',],
                   ['vi', '78', 'Virgin Islands',  ],
                   // ['wq', '79', 'Wake Island',     ],
                   // ['mx', '80', 'Mexico',          ],
                   // ['mx', '81', 'Tamulipas',       ],
                   // ['mx', '82', 'Nuevo Leon',      ],
                   // ['mx', '83', 'Coahuila',        ],
                   // ['mx', '84', 'Chihauhau',       ],
                   // ['mx', '85', 'Sonora',          ],
                   // ['mx', '86', 'Baja California Norte',],
                   // ['cn', '90', 'New Brunswick',   ],
                   // ['cn', '91', 'Quebec',          ],
                   // ['cn', '92', 'Ontario',         ],
                   // ['cn', '93', 'Manitoba',        ],
                   // ['cn', '94', 'Saskatchewan',    ], 
                   // ['cn', '95', 'Alberta',         ],
                   // ['cn', '96', 'British Columbia',],
                   // ['cn', '97', 'Yukon Territories',],
                   // ['cn', '98', 'Nova Scotia',     ],
                  ];

   
//var abbrev2nm = jQuery.map(data_struct, function(val) { return { val[0]: val[2] }; }); 
//var abbrev2nm = data_struct.map( function(val) { return val[0] = val[2]; }); 

// Create abbrev to name object
//
function build_abbrev_to_nm()
  {
   var abbrevs = {};
   data_struct.map( function(val) { return abbrevs[val[0]] = val[2]; });

   return abbrevs;
  }

// Create state code to abbrev object
//
function build_stateCd_to_abbrev()
  {
   var abbrevs = {};
   data_struct.map( function(val) { return abbrevs[val[1]] = val[0]; });

   return abbrevs;
  }

// Create state code to name object
//
function build_stateCd_to_nm()
  {
   var abbrevs = {};
   data_struct.map( function(val) { return abbrevs[val[1]] = val[2]; });

   return abbrevs;
  }

// Create name to state code
//
function build_nm_to_stateCd()
  {
   var abbrevs = {};
   data_struct.map( function(val) { return abbrevs[val[2]] = val[1]; });

   return abbrevs;
  }

// Create name to state abbrev
//
function build_nm_to_stateAbbrev()
  {
   var abbrevs = {};
   data_struct.map( function(val) { return abbrevs[val[2]] = val[0]; });

   return abbrevs;
  }

