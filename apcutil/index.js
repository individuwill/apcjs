'use strict';

var snmp = require('net-snmp');
var util = require('util');
var EventEmitter = require('events').EventEmitter;

var STATUS_DICT = {1: 'On', 2: 'Off', 3: 'Reboot'};
var STATUS_DICT_R = {'On': 1, 'Off': 2, 'Reboot': 3};

function Oid() {}
Oid.a = function(outletId) { return Oid.OUTLET_CONTROL_NAMES + outletId; };
Oid.outletName = function(outletId) { return Oid.OUTLET_CONTROL_NAMES + outletId; };
Oid.outletStatus = function(outletId) { return Oid.OUTLET_CONTROL + outletId; };
Oid.outletNameStatus = function(outletId) {
  return [Oid.outletName(outletId), Oid.outletStatus(outletId)];
};
Oid.CONTROL_TABLE_SIZE = '1.3.6.1.4.1.318.1.1.4.4.1.0';
Oid.OUTLET_CONTROL = '1.3.6.1.4.1.318.1.1.4.4.2.1.3.';
Oid.OUTLET_CONTROL_NAMES = '1.3.6.1.4.1.318.1.1.4.4.2.1.4.';

// Initiates snmp session with host, does some initialization and calls callback
// when ready
function Apc(host, community, connectCallback) {
  this.session = snmp.createSession(host, community);
  var that = this;
  (function getMaxPorts() {
    that.session.get([Oid.CONTROL_TABLE_SIZE], function(error, varbinds) {
      if(error) { connectCallback(error); }
      else {
        that.MAX_PORTS = varbinds[0].value;
        connectCallback(null, that);
      }
    });
  })();
}

//util.inherits(Apc, EventEmitter);
/*
Apc.prototype.getStatus = function(portNum, callback) {
  this.session.get([OUTLET_CONTROL + portNum], function(error, varbinds) {
    if(error) {
      callback(error);
    } else {
      callback(null, varbinds[0].value, STATUS_DICT[varbinds[0].value]);
    }
  });
};

Apc.prototype.getName = function(portNum, callback) {
  this.session.get([OUTLET_NAMES + portNum], function(error, varbinds) {
    if(error) {
      callback(error);
    } else {
      callback(null, varbinds[0].value);
    }
  });
};
*/
Apc._buildOutlet = function(outletId, varbinds) {
  return {
    id: outletId,
    name: varbinds[0].value.toString(),
    status: STATUS_DICT[varbinds[1].value]
  };
};

// Returns json string with properties of port at specified portId
Apc.prototype.get = function(outletId, callback) {
  this.session.get(Oid.nameStatus(outletId), function(error, varbinds) {
    if(error) { callback(error); }
    else {
      var x = Apc._buildOutlet(outletId, varbinds);
      console.log('inside get');
      callback(null, x);
    }
  });
};

// call callback with json param of available ports
Apc.prototype.getAll = function(callback) {
  var oids = [];
  for(var i = 1; i <= this.MAX_PORTS; i++) {
    oids = oids.concat(Oid.outletNameStatus(i));
  }
  var that = this;
  this.session.getBulk(oids, oids.length, function(err, varbinds) {
    if(err) { callback(err); }
    else {
      var outlets = [];
      for(var portId = 1, i = 0; portId <= that.MAX_PORTS; portId++, i += 2) {
        var outlet = Apc._buildOutlet(portId, [varbinds[i], varbinds[i+1]]);
        outlets.push(outlet);
      }
      callback(null, outlets);
    }
  });
};

// takes an outlet object and applies properties to the outlet via snmp
// can't change outlet number though! calls callback with error, outlet object
// with new values
Apc.prototype.update = function(outlet, callback) {
  if(outlet.hasOwnProperty('status')) {
    var status = outlet.status;
    if(typeof(status) === 'string') { // if its a string, lets convert it to a number
      console.log('String provided');
      var newStatus = parseInt(status, 10); // try converting string directly to a number
      if(isNaN(newStatus)) { // must be a string of on, off, reboot
        console.log('string must not be a number');
        // capitalize first letter of string and trim away any white space
        status = status.toLowerCase().trim();
        newStatus = status.slice(1, status.length);
        newStatus = status.charAt(0).toUpperCase().concat(newStatus);
        status = STATUS_DICT_R[newStatus];
        console.log('converted from string to new status ', status);
        console.log(typeof(status));
      }
    }
    if(typeof(status) === 'number') {
      console.log('new status will be: %s', status);
      var varbinds = [{
        oid: Oid.outletStatus(outlet.id),
        type: snmp.ObjectType.Integer,
        value: status
      }];
      this.session.set(varbinds, function(error, vbs) {
        if(error) { callback(error); }
        else {
          console.log('all good');
          callback(null, {id: outlet.id, status: STATUS_DICT[vbs[0].value]});
          return;
        }
      });
    } else { callback(new Error('You must provide a valid string or number for status')); }
  } else { callback(new Error('Please provide a valid status')); }
};

/*
Apc.prototype.setStatus = function(portNum, status, callback) {
  var varbinds = [{
    oid: OUTLET_CONTROL + portNum,
    type: snmp.ObjectType.Integer,
    value: status,
  }];

  this.session.set(varbinds, function(error, vbs) {
    if(error) {
      callback(error);
    } else {
      callback(null, vbs[0].value, STATUS_DICT[vbs[0].value]);
    }
  });
};

// TODO add eventemmiters and polling for data change. set an interval to update
// polling to a default of 30 seconds
Apc.prototype.startPolling = function(interval) {

};

Apc.prototype.stopPolling = function() {
};
*/

exports.connect = function(host, community, connectCallback) {
  new Apc(host, community, connectCallback);
};
