'use strict';

var apcutil = require('../../../apcutil');


function callApc(callback) {
  apcutil.connect('apc', 'private', callback);
}

exports.list = function(req, res, next){
  callApc(function(err, apc) {
    if(err) { next(err); }
    else {
      apc.getAll(function(err2, outlets) {
        if(err2) { next(err2); }
        else { res.json(outlets); }
      });
    }
  });
};

exports.get = function(req, res, next){
  callApc(function(err, apc) {
    if(err) { next(err); }
    else {
      apc.get(req.params.id, function(err2, outlet) {
        if(err2) { next(err2); }
        else { res.json(outlet); }
      });
    }
  });
};

exports.update = function(req, res, next) {
  console.log('patch called for ' + req.params.id + JSON.stringify(req.body));
  callApc(function(err, apc) {
    if(err) { next(err); }
    else {
      var o = req.body;
      o.id = req.params.id;
      apc.update(o, function(err2, outlet) {
        if(err2) { next(err2); }
        else {
          res.json(outlet);
        }
      });
    }
  });
};
