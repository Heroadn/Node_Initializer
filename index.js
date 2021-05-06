const app = require("express")();
const consign = require("consign");
const db = require("./config/db");
const { port } = require('./.env')
app.db = db;

/*
 *  Carregamento automatico das libs
*/
consign()
  .include("./config/passport.js")
  .then("./config/middlewares.js")
  .then("./api/validation.js")
  .then("./api")
  .then("./config/routes.js")
  .into(app);

app.listen(port, () => {
  console.log("Backend executando...");
});
