'use strict';

var apcutil = require('./index');

var apc = apcutil.connect('apc', 'private');

/*** TODO
 * allow calling apc.#.status or apc.#
 * ex: apc.3.on or apc.4.off or apc.3.reboot(fun)
 * also, apc.3 should return status of outlet
 * reboots should have multiple callback for off, then on again (how does this work if it started off?
 *
 * maybe apc.name.on where we query/walk for names. what if name isn't unique?
 */

var portNum = 3;
apc.setStatus(portNum, 2, function statusReturned(error, statusNum, statusStr) {
  if (error) {
    console.log(error.toString());
  } else {
    console.log('port %d is now set to status %s', portNum, statusStr);
  }
});
/*
for(i = 1; i <= 8; i++) {
  (function(portNum) {
    //var portNum = 1;
    apc.getStatus(portNum, function statusReturn(error, statusNum, statusStr) {
      console.log('port ' + portNum + ' is ' + statusStr);
    });
    apc.getName(portNum, function nameReturn(error, name) {
      console.log('port ' + portNum + ' is called ' + name);
    });
  })(i);
}
*/
