'use strict';

var apcutil = require('./index');
var util = require('util');

apcutil.connect('apc', 'public', function(err, apc) {
  if(err) { console.error(err); return; }
  else {
    console.log(util.inspect(apc));

    apc.get(3, function(err, outletObj) {
      if(err) { console.error(err); return; }
      console.log(JSON.stringify(outletObj));
    });

    apc.getAll(function(err, outlets) {
      if(err) { console.error(err); return; }
      console.log(JSON.stringify(outlets));
    });
  }
});
