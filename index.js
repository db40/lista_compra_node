var express = require('express');
var app = express();

var bp = require('body-parser')

//La lista de la compra se almacena en memoria
var lista
//El identificador del siguiente item a dar de alta. Lo iremos incrementando manualmente
var idActual

//usamos el body parser para obtener el cuerpo de la petición en JSON
app.use(bp.json())

//Obtener la lista de todos los items
app.get('/api/items', function(pet, resp){
    var datos = Array.from(lista.values())
    resp.send(datos)
})

//Obtener un item dado su id
app.get('/api/items/:id', function(pet, resp){
    var idBuscado = parseInt(pet.params.id)
    //Si el id buscado no era un número
    if (isNaN(idBuscado)) {
        resp.status(400)
        //En el cuerpo de la respuesta mandamos más información sobre el error
        //Usar un "code" propio nos permite especificar mucho más el error exacto
        resp.send({code: 1, message:"El id debería ser numérico"})
    }
    else {
        var objeto = lista.get(idBuscado)
        //si el id buscado está en el Map, lo devolvemos. Si no, 404
        if (objeto) {
            resp.send(objeto)
        }
        else {
            resp.status(404)
            resp.send({code: 2, message:"El item con ese id no existe"})
        }
        
    }
})

//Crear nuevo item
//Para probarlo desde línea de comandos:
//curl -X POST -H 'Content-Type:application/json' -d '{"nombre":"agua"}' -v http://localhost:3000/api/items
app.post('/api/items', function(pet, resp){
    //obtenemos los datos que nos envían en el cuerpo de la petición
    //El body parser ya nos devuelve un objeto Javascript
    var nuevo = pet.body
    //comprobamos si el objeto tiene el campo "nombre"
    if (nuevo.nombre) {
        //creamos un nuevo objeto con un nuevo id y el nombre del objeto que nos pasaban
        //no insertamos directamente el objeto que nos pasaban porque nos podrían "colar"
        //campos no válidos
        var nuevoFiltrado = {id:idActual, nombre:nuevo.nombre}
        lista.set(nuevoFiltrado.id, nuevoFiltrado)
        resp.status(201)
        //Según la ortodoxia REST hay que hacer esto
        resp.header('Location', 'http://localhost:3000/api/items/'+idActual)
        //Muchos APIs además devuelven el objeto creado en el cuerpo de la respuesta
        resp.send(nuevoFiltrado)
        idActual++
    }
    //Si no tiene el campo "nombre" no lo podemos dar de alta
    else {
        resp.status(400)
        resp.send({code:3, message:"Falta el campo nombre"})
    }
})


//Este método delega en el server.listen "nativo" de Node
app.listen(3000, function () {
   console.log("El servidor express está en el puerto 3000");
   lista = new Map()
   lista.set(1, {id: 1, nombre:"patatas"})
   lista.set(2, {id: 2, nombre:"pan"})
   idActual = 3
});
