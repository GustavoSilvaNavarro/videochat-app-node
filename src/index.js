//ESTE ES EL ARCHIVO QUE ARRANCA TODA MI APLICACION
//Empiezo con Llamado de Modulos Instalados
const express = require('express'); //llamo modulo express
const app = express(); //ejecuto express y lo llamo app
const path = require('path'); //llamo modulo path para facilidad de rutas
const server = require('http').Server(app); //hago el llamado de mi servidor, OJO esto me permite usarlo con socket.io
const io = require('socket.io')(server); //llamo socket.io que tiene que ser llamado por el servidor
/*const { ExpressPeerServer } = require('peer'); //LLAMADO DE MI SERVIDOR PARA PEER //llamo mi modulo peer el metodo express para servidor
const peerServer = ExpressPeerServer(server, { //hago uso de metodo importado  //COLOCAR TODO JUNTO NO PONER COMENTARIOS EN EL MEDIO DE LOS LLAMADOS DE MIS MODULO SINO CODIGO NO CORRE
    debug: true
});*/

//SETTINGS DE LA APLICACION
app.set('port', 3000);
app.set('views', path.join(__dirname, 'views')); //doy direccion a node para que encuentre el html de room
app.engine('html', require('ejs').renderFile); //digo voy a usar html pero que renderice ejs que es donde se trabajo
app.set('view engine', 'ejs'); //digo quiero que mi motor sea ejs

//MIDDLEWEARS (son funciones que se ejecutan antes que las rutas procesen algo)

//RUTAS DE MI SERVIDOR
app.use(require('./routes/routes')); //Hago el llamado de mis rutas

//STATIC FILES (Archivos Java, CSS, foto o videos)
app.use(express.static(path.join(__dirname, 'public')));

//LLAMADO DE SERVIDOR PARA PEER (PERMITE USAR MISMO PUERTO PARA AMBOS) - COMO NOTA ESTO VA DESPUES DE COLOCAR LAS RUTAS DE SERVIDOR NO ANTES SINO NO LO AGARRA
//app.use('/peerjs', peerServer); //especifico el peerServer es decir el url que voy a utilizar


//COMUNICACION SOCKET.IO
 //lo uso cada vez que alguien ingresa a nuestra app
io.on('connection', socket => { //recibo el socket del usuario que este ingresando y ejecuto
    //quiero escuchar cuando alguien se conecta al room especifico y el usuario especifico
    socket.on('join-room', (roomId, userId) => { //escucho al evento join-room
        socket.join(roomId); //ese paquete de datos recibido lo coloco en el room especifico
        socket.to(roomId).broadcast.emit('user-connected', userId); //quiero oir el evento user coneected es decir el paquete de datos que va al room luego le retransmito datos a los otros usarios

        socket.on('disconnect', () => { //recibo el evento de desconeccion cuando un usuario se desconecta para que lo haga de manera inmediata y no se quede congelada la imagen
            socket.to(roomId).broadcast.emit('user-disconnected', userId); //emito de manera inmediata el evento deconeccion del usuario
        });

        //RECIBO LOS MENSAJES DE MI DOM QUE ALGUN USUARIO O YO ESCRBIO
        socket.on('message', message => { //al presionar enter y tener algun valor en input recibo el mensaje aqui
            io.to(roomId).emit('create-message', message); //recibo el mensaje y lo dirigo al roomId y lo retransmito a mi fornt end el mensaje recibido
        });
    });
});

//SERVIDOR YA ES MI APP EN SI LO QUE VA A INICIAR
server.listen(app.get('port'), () => { //basicamnete hago que se ejecute el servidor en puerto en especifico
    console.log('Server is working on Port...', app.get('port'));
})