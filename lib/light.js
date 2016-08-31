'use strict';

let http = require('http');
let url = require('url');
let methods = require('methods');
let pathToRegexp = require('path-to-regexp');

class Layer {
  constructor(route, handler) {
    this.handle = handler;
    this.route = route;
  }
  match(path) {
    path = decodeURIComponent(path);
    let route = this.route;
    let names = [];
    let re = pathToRegexp(route, names);
    if (re.test(path)) {
      let params = {};
      for (var i = 0; i < names.length; i++) {
        params[names[i].name] = re.exec(path)[i + 1];
      }
      return { params };
    } else {
      return;
    }
  }
}

let app = { stack : [] };
module.exports = app;

app.listen = function() {
  let server = http.createServer(this);
  return server.listen.apply(server, arguments);
};

app.use = (route, handler) => {
  app.stack.push(new Layer(route, handler));
};

let makeRoute = (verb, handler) => {
  return (req, res, next) => {
    if (req.method.toLowerCase() === verb.toLowerCase()) {
      handler(req, res, next);
    } else {
      next();
    }
  };
};

methods.forEach((method) => {
  app[method] =(route, handler) => {
    app.use(route, makeRoute(method, handler));
  };
});

let call = (layer, req, res, next, dispatch) => {
  try {
    layer.handle(req, res, next);
    return;
  } catch (err) {
    dispatch(err);
  }
};

app.handle = (req, res, next) => {
  let index = 0;
  let dispatch = (err) => {
    let layer = app.stack[index];
    index += 1;
    if (layer === undefined) {
      if (err) {
        res.statusCode = 500;
        res.end(JSON.stringify(err));
      } else {
        res.statusCode = 404;
        res.end("route not found");
      }
      return;
    }
    let path = url.parse(req.url).pathname || '/';
    if (layer.match(path) === undefined) {
      return dispatch(err);
    }
    req.params = layer.match(path).params;
    call(layer, req, res, next, dispatch);
  };
  dispatch();
};