### PyrusProxy

Proxy/node for [https://pyrus.ubiqsmart.com](https://pyrus.ubiqsmart.com) nodes.

### Install

```
npm install
```

### Requires

```
sudo apt-get install nginx
sudo apt-get install screen
curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
sudo apt-get install -y nodejs
```
### nginx

The proxy is expected to be behind an nginx reverse proxy. See extra directory for a config example.

### iptables

See extra directory for iptables example. Note, check port numbers, if running ssh on non standard port (22), dont lock yourself out of VPS.

### start

```
nodejs app.js
```

Alternatively use something like forever to keep-alive

```
npm install -g forever
forever start app.js
```
