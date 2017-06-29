'use strict';

var app = require('express')();
var bodyParser = require('body-parser');
var helmet = require('helmet');

var Web3 = require('web3');
var BigNumber = require('bignumber.js');

var web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:8588'));
var port = 8888;

var logger = function(req, res, next) {
  console.log(new Date().toString().split(' ')[4], req.headers['user-agent']);
  next(); // Passing the request to the next handler in the stack.
}

var formatAddress = function(addr) {
	if (addr.substring(0, 2) == "0x") return addr;
	return "0x" + addr;
}

var handleRequest = function(req, res) {
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Origin', '*');
  	res.header('Content-Type', 'application/json');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'DNT,X-Mx-ReqToken,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type');
    res.header('Access-Control-Max-Age', 1728000);
    res.header('Content-Type', 'text/plain charset=UTF-8');
    res.header('Content-Length', 0);
    res.status(200).send();
  } else if (req.method === 'POST'){
    if (!req.body) {
      res.status(400).send();
    } else if (Array.isArray(req.body)){
      //txdata
      res.json([{
        // balance
        jsonrpc: '2.0',
        result: web3.toHex(web3.eth.getBalance(req.body[0].params[0], 'pending')),
        id: req.body[0].id
      },{
        // gas price
        jsonrpc: '2.0',
        result: web3.toHex(web3.eth.gasPrice),
        id: req.body[1].id
      },{
        // nonce
        jsonrpc: '2.0',
        result: web3.toHex(web3.eth.getTransactionCount(req.body[0].params[0], 'pending')),
        id: req.body[2].id
      }]);
    } else if (!req.body.method) {
      res.status(400).send();
    } else {
      switch (req.body.method) {
        case 'eth_getBlockByNumber':
          if (req.body.params[0] == 'latest' || req.body.params[0] == 'pending' || req.body.params[0] == 'earliest') {
            res.json({
  					  jsonrpc: '2.0',
  					  result: web3.eth.getBlock(req.body.params[0], req.body.params[1]),
              id: req.body.id
            });
          } else {
            res.json({
  					  jsonrpc: '2.0',
  					  result: web3.eth.getBlock(web3.toDecimal(req.body.params[0]), req.body.params[1]),
              id: req.body.id
            });
          }
          break;
        case 'eth_getCode':
          res.json({
            jsonrpc: '2.0',
            result: web3.eth.getCode(req.body.params[0], req.body.params[1]),
            id: req.body.id
          });
          break;
        case 'eth_getTransactionCount':
          res.json({
            jsonrpc: '2.0',
            result: web3.eth.getTransactionCount(req.body.params[0], req.body.params[1]),
            id: req.body.id
          });
          break;
        case 'net_version':
          res.json({
            jsonrpc: '2.0',
            result: web3.version.network,
            id: req.body.id
          });
          break;
        case 'eth_blockNumber':
          res.json({
					  jsonrpc: '2.0',
					  result: web3.toHex(web3.eth.blockNumber),
            id: req.body.id
          });
          break;
        case 'eth_getBalance':
          res.json({
            jsonrpc: '2.0',
					  address: formatAddress(req.body.params[0]),
					  result: new BigNumber(web3.eth.getBalance(req.body.params[0], 'pending')),
            id: req.body.id
          });
          break;
        case 'eth_call':
          res.json({
            jsonrpc: '2.0',
					  result: web3.eth.call(req.body.params[0]),
            id: req.body.id
          });
          break;
        case 'eth_sendRawTransaction':
          res.json({
            jsonrpc: '2.0',
					  result: web3.eth.sendRawTransaction(req.body.params[0]),
            id: req.body.id
          });
          break;
        case 'eth_estimateGas':
          res.json({
            jsonrpc: '2.0',
					  result: web3.eth.estimateGas(req.body.params[0]),
            id: req.body.id
          });
          break;
        case 'eth_gasPrice':
          res.json({
            jsonrpc: '2.0',
					  result: web3.toHex(web3.eth.gasPrice),
            id: req.body.id
          });
          break;
        default:
          res.json({
            jsonrpc: '2.0',
            error: true,
            msg: 'invalid method: ' + req.body.method,
            id: req.body.id
          });
      }
    }
  } else {
    res.status(400).send();
  }
}

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
