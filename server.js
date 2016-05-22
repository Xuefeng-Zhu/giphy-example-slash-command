var express = require('express');
var bodyParser = require('body-parser');
var sync = require('synchronize');
var cors = require('cors');
var pem = require('pem');
var https = require('https');

// Since Mixmax calls this API directly from the client-side, it must be whitelisted.
var corsOptions = {
  origin: /^[^.\s]+\.mixmax\.com$/,
  credentials: true
};


pem.createCertificate({days:1, selfSigned:true}, function(err, keys){
  var app = express();

  // Use fibers in all routes so we can use sync.await() to make async code easier to work with.
  app.use(function(req, res, next) {
    sync.fiber(next);
  });

  app.get('/typeahead', cors(corsOptions), require('./api/typeahead'));
  app.get('/resolver', cors(corsOptions), require('./api/resolver'));

  https.createServer({key: keys.serviceKey, cert: keys.certificate},
    app).listen(process.env.PORT || 9145);
});