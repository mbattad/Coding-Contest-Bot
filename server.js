const express = require("express");
const server = express();
server.all("/", (req, res) =>
{
  res.send("I'm awake!")
});

function keepAlive()
{
  server.listen(3000, () => {
    console.log("I'm ready!");
  });
}

module.exports = keepAlive;