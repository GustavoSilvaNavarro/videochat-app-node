const moment = require('moment'); //llamo modulo para poder obtener la hora y fecha

function objectData (userName, message) {
    return {
        userName,
        message,
        time: moment().format('DD/MM h:mm a')
    } //lo que va hacer esta funcion es solo crearme un objeto con la data almacenada que le voy a pasar
}

module.exports = objectData;