'use strict';

let app = require('../index.js')();

let hello = (req, res) => {
  let helloStr = 'hello ' + req.params.name;
  console.log(helloStr);
  res.end(helloStr);
};

app.get('/hi/:name', hello);

app.listen(3333);
