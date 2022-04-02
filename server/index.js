const http = require('http');
const Express = require("express");
const fs = require('fs');

const app = new Express();
const server = new http.Server(app);

app.get("/", (req, res) => {
  let text = fs.readFileSync("../dist/index.js", 'utf-8');
  res.send(text);
});

app.get("/getWR.js", (req, res) => {
  let text = fs.readFileSync("../dist/getWR.js", 'utf-8');
  res.send(text);
});

server.listen(4566, () => {
  console.info("WebServer running on http://localhost:4566");
});
