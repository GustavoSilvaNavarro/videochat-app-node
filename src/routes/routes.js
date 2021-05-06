//VAN A ESTAR MIS RUTAS DE ACCESO A ALGO
const express = require('express'); //llamo modulo express
const router = express.Router(); //llamo uno de los metdos de express que es router para creacion de multiples rutas
const { v4: uuidv4 } = require('uuid'); //llamo a propiedad v4 (generacion aleatoria de mi uuid) denominada uuidv4 que viene de modulo uuid

/* ESTO FUNCIONA DE FORMA ESTABLE PARA UNA SOLA PAGINA
router.get('/', (req, res) => { //creo ruta hacia pagina principal
    //res.render('room.html'); //aca defino que es room
    res.redirect(`/${uuidv4()}`); //redireecciono mi pagina a ese uuid aleatorio para que sea unico mi room lo pongo entre`${}` ya que es un valor dinamco no esttico
})

router.get('/:room', (req, res) => { //parametro dinamico que lo solicito luego
    res.render('room.html', { roomId: req.params.room }); //le solicito ir hacia mi archivo room.html mediante ese parametro generado llamado room que lo pido con req y lo denomino como roomId
})

module.exports = router; //exporto el router que se encarga de crear mis rutas
*/

//SEGUNDA FORMA CON PAGINA PRINCIPAL Y LA REDIRECCIONO HACIA ROOM
router.get('/', (req,res) => { //creo ruta hacia pagina principal
    res.render('index.html'); //pinto por pantalla el index
});

router.get('/room', (req, res) => { //creo ruta hacia room donde va a estar todo mi video chat
    res.redirect(`/${uuidv4()}`); //redireecciono mi pagina a ese uuid aleatorio para que sea unico mi room lo pongo entre`${}` ya que es un valor dinamco no esttico
});

router.get('/:room', (req, res) => { //parametro dinamico que lo solicito luego
    res.render('room.html', { roomId: req.params.room }); //le solicito ir hacia mi archivo room.html mediante ese parametro generado llamado room que lo pido con req y lo denomino como roomId
});

module.exports = router; //exporto el router que se encarga de crear mis rutas