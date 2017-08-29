'use strict';
var Web3 = require('web3');
var BigNumber = require('bignumber.js');

var web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:8588'));

var Response = function() {};

Response.web3 = web3;

Response.getBalance = function(params) {
  return new BigNumber(web3.eth.getBalance(params, 'pending'));
};

Response.gasPrice = function() {
  return web3.toHex(web3.eth.gasPrice);
};

Response.nonce = function(params) {
  return web3.toHex(web3.eth.getTransactionCount(params, 'pending'));
};

Response.ethCall = function(params) {
  return web3.eth.call(params, 'pending');
};

Response.sendRawTransaction = function(params) {
  return web3.eth.sendRawTransaction(params);
};

//gettransactiondata: handle in app.js with loop, multiple responses required.

Response.getEstimatedGas = function(params) {
  return web3.eth.estimateGas(params);
};

Response.blockNumber = function() {
  return web3.toHex(web3.eth.blockNumber);
};

module.exports = Response;
