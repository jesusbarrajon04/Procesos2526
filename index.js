const path = require("path");
const fs = require("fs");
const express = require("express");
const app = express();
const modelo = require("./servidor/modelo.js");
const PORT = process.env.PORT || 3000;

let sistema = new modelo.Sistema();

/*
app.use(express.static(__dirname + "cliente"));

app.get("/", function (request, response) {
  var contenido = fs.readFileSync(__dirname + "/cliente/index.html");
  response.setHeader("Content-Type", "text/html");
  response.send(contenido);
});

*/
app.use(express.static(path.join(__dirname, "cliente")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "cliente", "index.html"));
});

app.get("/agregarUsuario/:nick",function(request,response){
  let nick=request.params.nick; 
  let res=sistema.agregarUsuario(nick);
  response.send(res); 
});

app.get("/obtenerUsuarios", function (request, response) {
  let res = sistema.obtenerUsuarios();
  response.send(res);
});

app.get("/usuarioActivo/:nick", function (request, response) {
  let nick = request.params.nick;
  let activo = sistema.usuarioActivo(nick);
  response.send({ activo: activo });
});

app.get("/numeroUsuarios", function (request, response) {
  let num = sistema.numeroUsuarios();
  response.send({ num: num });
});

app.get("/eliminarUsuario/:nick", function (request, response) {
  let nick = request.params.nick;
  sistema.eliminarUsuario(nick);
  response.send({ eliminado: nick });
});

app.listen(PORT, () => {
  console.log(`App está escuchando en el puerto ${PORT}`);
  console.log("Ctrl+C para salir");
});


// cd C:\Repositorios\Procesos2526
// C:\Users\Jesús\AppData\Local\Google\Cloud SDK
// Service URL: https://procesos2526-817150573239.europe-west1.run.app