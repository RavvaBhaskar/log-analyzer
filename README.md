## Purpose
This code base is for the EBPP project to auto analyze logs from the incidents

## Usage
Ensure that your machine is has node installed and check the version your machine is using by typing `node -v` . Node v6 must be used, Check the [node](httt://www.node.org) for more info on how to install and use node.

1. To install all the dev dependencies
```javascript
npm install
```
1.1 Install bower
```javascript
npm install bower
```
1.2 Run bower install
```javascript
bower install
```
2. Run application

2.1 Set environment variable as NODE_ENV=local

2.2 Start the server
```javascript
node server.js
```