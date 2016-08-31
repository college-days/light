'use strict';

let light = require('./lib/light');
let merge = require('utils-merge');

module.exports = () => {
  let dispatch = (req, res, next) => {
    dispatch.handle(req, res, next);
  };
  merge(dispatch, light);
  return dispatch;
};
