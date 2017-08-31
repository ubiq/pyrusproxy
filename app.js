'use strict';

var app = require('express')();
var bodyParser = require('body-parser');
var helmet = require('helmet');
var nanotimer = require('nanotimer');
var fs = require('fs');
var objectAssign = require('object-assign');

var Nodeman = require('./lib/nodemanager');
var Response = require('./lib/response');
var Loop = require('./lib/loop');

var port = 8888;
var web3Timer = new nanotimer();

var logger = function(req, res, next) {
  console.log(new Date().toString().split(' ')[4], req.headers['user-agent']);
  next(); // Passing the request to the next handler in the stack.
}

var formatAddress = function(addr) {
	if (addr.substring(0, 2) == "0x") return addr;
	return "0x" + addr;
}

var standardResponse = function(res, obj, id) {
  res.json(
    objectAssign({
      jsonrpc: '2.0',
      id: id
    }, obj)
  );
}

var handleMethod = function(res, method, params) {
  switch (method) {
    case 'eth_blockNumber':
      return {result: Response.blockNumber()};
      break;
    case 'eth_getBalance':
      return {
        address: formatAddress(params[0]),
        result: Response.getBalance(params[0]),
      };
      break;
    case 'eth_call':
      return {result: Response.ethCall(params[0])};
      break;
    case 'eth_sendRawTransaction':
      return {result: Response.sendRawTransaction(params[0])};
      break;
    case 'eth_estimateGas':
      return {result: Response.getEstimatedGas(params[0])};
      break;
    case 'eth_gasPrice':
      return {result: Response.gasPrice()};
      break;
    case 'eth_getTransactionCount':
      return {result: Response.nonce(params[0])};
      break;
    default:
      return {
        error: true,
        msg: 'invalid method: ' + method
      };
  }
}

var handleRequest = function(req, res) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Content-Type', 'application/json');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'DNT,X-Mx-ReqToken,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type');
  res.header('Access-Control-Max-Age', 1728000);
  if (req.method === 'OPTIONS') {
    res.header('Content-Length', 0);
    res.status(200).send();
  } else if (req.method === 'POST'){
    if (!req.body) {
      res.status(400).send();
    } else if (Array.isArray(req.body)){
      var multiResponse = [];
      Loop(req.body.length, function(loop){
        var i = loop.iteration();
        multiResponse.push(
          objectAssign({
            jsonrpc: '2.0',
            id: req.body[i].id
          }, handleMethod(res, req.body[i].method, req.body[i].params))
        );
        loop.next();
      }, function(){
        res.json(multiResponse);
      });
    } else if (!req.body.method) {
      res.status(400).send();
    } else {
      standardResponse(res, handleMethod(res, req.body.method, req.body.params), req.body.id);
    }
  } else {
    res.status(400).send();
  }
}

var checkProvider = function() {
  if (!Response.web3.isConnected()) {
    if (fs.existsSync('./bin/gubiq')) {
      Nodeman.startGubiq(function(){
        return;
      });
    } else {
      Nodeman.downloadGubiq(function(){
        return;
      });
    }
  } else {
    return;
  }
}

web3Timer.setInterval(checkProvider, '', '10s');

app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(bodyParser.json());
app.use(helmet());

app.use(logger); // Here you add your logger to the stack.

app.all('/', function(req, res) {
  handleRequest(req, res);
});

app.listen(port, function(){
  console.log('listening on port %s', port);
});
