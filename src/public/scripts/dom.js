//ARCHIVO CON EL DOM DE MI PROYECTO (LUGAR DE MI FRONTEND)

const socket = io('/'); //referencio mi socket ya que lo voy a usar mucho aqui para que funcione y le doy la ruta principal /

//CREACION PROMP PARA USUARIO
const name = prompt('What is your Name and Last Name?');

//creo variables que unen html
const videoGrid = document.querySelector('#video-grid'); //llamo a mi elemeno con id video-grid
const myVideo = document.createElement('video'); //Creo elemento html
myVideo.muted = true; //esto lo hago ya que no quiero oir mi propio video sino quiero oir a la otra person por lo que muteo mi video para mi
const peers = [{}]; //creo variable que permite trackear que usuario hizo la llamada para cuando salga

//CREACION DE PEER PARA LA CONECCIÓN
const peer = new Peer(undefined, { //paso el undefined ya que peer generar un id automatico
    host: '/',
    port: '3001'
});

//NAVEGADORES ANTIGUOS PODRIAN NO IMPLEMENTAR LA FUNCION mediaDevices, ASI QUE LO CONFIGURAMOS COMO UN OBJETO VACIO PRIMERO
if (navigator.mediaDevices === undefined) {
    navigator.mediaDevices = {};
};

// Some browsers partially implement mediaDevices. We can't just assign an object
// with getUserMedia as it would overwrite existing properties.
// Here, we will just add the getUserMedia property if it's missing.
if (navigator.mediaDevices.getUserMedia === undefined) {
    navigator.mediaDevices.getUserMedia = function (constraints) {
        // First get ahold of the legacy getUserMedia, if present
        var getUserMedia = navigator.webKitGetUserMedia || navigator.mozGetUserMedia;
        // Some browsers just don't implement it - return a rejected promise with an error
        // to keep a consistent interface
        if (!getUserMedia) {
            return Promise.reject(new Error('getUserMed is not implement in this browser'));
        }

        // Otherwise, wrap the call to the old navigator.getUserMedia with a Promise
        return new Promise (function(resolve, reject) {
            getUserMedia.call(navigator, constraints, resolve, reject);
        });
    }
};

let myVideoStream; //creo variable que utilizaré mas adelante en otra parte de mi codigo por el momento esta vacia

//ACCESO (o CONECCION) A VIDEO Y AUDIO Y COLOCARLO POR PANTALLA
navigator.mediaDevices.getUserMedia ({ //recordar que esto se maneja con promesas
    video: true,
    audio: true
}).then(stream => { //una promesa que recibira la data de audio y video como stream
    myVideoStream = stream; //en mi variable creada anteriormente le guardo mis datos de stream de video y audio
    addVideoStream(myVideo, stream); //creo funcion que añada el video

    //DAR RESPUESTA A LA LLAMADA O CONTESTAR
    peer.on('call', call =>{
        call.answer(stream); //respondo la llamada con mi data stream video
        const video = document.createElement('video'); //creo elemento donde puedo poner mi video
        call.on('stream', userVideoStream => { //recibo respuesta del stream del usuario
            addVideoStream(video, userVideoStream); //ejecuto funcion que coloca el video
        });//ahora una vez que envie mi stream data ahora necesito recibir del usuario respuesta de su stream
        
    });

    //UNA VEZ QUE PUEDO COLOCAR MI CAMARA DEBO PODER PERMITIR EL INGRESO DE OTROS USUARIOS
    socket.on('user-connected', userId => { //recibo la info de otros usuario
        connectToNewUser(userId, stream); //le doy a la funcion el id del usuario que quiero llamar y le envio mi stream asi lo puede ver
    });

    //EMITIR O ENVIAR EVENTOS PARA MENSAJES EN CHAT
    let text = $('input'); //coloco varibale para luego llamarla (recordar que este metodo query es igual a decir document.querySelector();)
    $('html').keydown(e => { //llamo evento keydown por query
        let message = text.val();
        if(e.which == 13 && message.length !== 0) { //significa que cuyo evento es igual a presionar enter(13) y además el valor de lo escrito en el input su longitud es diferente de 0 ejecuta lo de adentro del if
            e.preventDefault();
            console.log(message);
            $('.messages').append(`<li class="message"><b>Me</b> <span>${getTime()}</span><br>${message}</li>`); //llamo a la etiqueta ul que tiene clase messages y le dijo colocale etiquetas li con los mensajes que estoy recibiendo del servidor            
            socket.emit('message', message); //emite mi mensaje a servidor
            text.val(''); //con el fin de que cuando envie el dato al presionar enter este se blakee o resetee
            text.focus(); //para que se quede parpadeando el |
            scrollToBotton(); //coloco para que cuando pegue mensajes baje el scroll
        }
    });

    //RECIBO EL MENSAJE DESDE MI SERVIDOR
    socket.on('create-message', data => { //recibo mensaje, viene del servidor
        console.log('This message comes from the server: ', data);
        $('.messages').append(`<li class="message"><b>${data.userName}</b> <span>${data.time}</span><br>${data.message}</li>`); //llamo a la etiqueta ul que tiene clase messages y le dijo colocale etiquetas li con los mensajes que estoy recibiendo del servidor
        scrollToBotton(); //llamo funcion que permite crear scroll al momento de enviar mails y baje el scroll
    });

}).catch(err => {
    console.log(err.name, ": ", err.message); // de esta manera puedo manejar mis errores
});

//ESCUCHO EVENTO DE DESCONECCION
socket.on('user-disconnected', userId => { //recibo el evento que viene de servidor para desconeccion de usuario es decir recibo la indiccion de desconeccion
    if (peers[userId]) { //pongo un if para que solo funcione cuando haya usuarios es decir si existen usuarios
        peers[userId].close(); //ahora al momento de la desconeccion voy a llamar a peers de userId y voy a cerrar la llamada del usuario que sale
    }
})

//INICIA CONEXION PEER 2 PEER (RECIVO LA CONECCION)
peer.on('open', id => { //INICIA CONEXION DE PEER QUE GENERA UN ID DINAMICO que luego se lo doy al room especifico para que envie el dato del room con los usuarios que se conecten
    //EMISION DE DATOS DEL STREAM
    socket.emit('join-room', ROOM_ID, id, name); //envio los datos del room especifico que los pase por el frontend y el id de usuario que le puse 10
});

//LLAMADA Y ENVIO DE MI STREAM AL NUEVO USARIO
function connectToNewUser (userId, stream) { //le digo que reciba el id de usario y mi stream que ya lo declare arriba tambien
    const call = peer.call(userId, stream); //activo la llamado a los usuarios y paso mi stream
    const video = document.createElement('video'); //creo otro elemento video para los usuarios
    call.on('stream', userVideoStream => { //Recibo este evento y lo esccucho donde practicamente recibo el nuevo stream de los usuarios que que estoy llamando
        addVideoStream(video, userVideoStream);
    });
    call.on('close', () =>{ //con esta funcion recibo el cerrado o desconeccion de algun usuario para que no queden por ahi videos vacios sino que se cierren
        video.remove(); //remuevo los videos es decir cuando alguien sale cierra su video
    });

    //AL DECLARAR LA ARIABLE ARRIBA PUEDO TRACKEAR QUE USURIO DE QUE LLAMADA SE HIZO
    peers[userId] = call; //digo voy a colocar una lista con los id de usuario y este es igual a la llamada creada (basicamente cada usuario esta linkeado a la llamada realizada)
}

//FUNCION DE INSERTAR DATOS DE STREAM Y PINTARLOS POR PANTALLA
function addVideoStream (video, stream) {
    if("srcObject" in video) {
        video.srcObject = stream; //le doy la fuente es decir al elemento video que llegue le digo colocale el stream
    } else {
        //Impide usar esto en nuevos navegadores, mientras funcione lo de arriba
        video.src = window.URL.createObjectURL(stream);
    };

    video.addEventListener('loadedmetadata', () => { //agrego evento de carga de stream y cuando lo escuhe que se ejecute la funcion flecha que es reproducir el video
        video.play();
    });

    videoGrid.append(video); //agrego a ese div los archivos de video
};

//CREO FUNCION PARA COLOCAR SCROLL CUANDO ENVIO MUCHOS MENSAJES
function scrollToBotton () { // coloco un scroll cuando tenga muchos mensajes
    //PRIMERA FORMA

    //var d = $('.main_chat_window'); // llamo a mi clase main_chat_window
    //d.scrollTop(d.prop("scrollHeight")); // le doy funcion para colocar scroll solo en la vertical y le doy la propiedad scrollHeigt para decirle que este en toda la altura de la ventana

    //SEGUNDA FORMA es la mas optima!!!!
    const chatWindow = document.querySelector('.main_chat_window');
    chatWindow.scrollTop = chatWindow.scrollHeight;
};

//DOY FUNCIONALIDAD A MIS BOTONES

//FUNCIONALIDAD A MUTE - UNMUTE
function muteUnmute () {
    let enabled = myVideoStream.getAudioTracks()[0].enabled; // creo constate llamada habilitado entonces de mi stream (audio y video) voy a obtener audios y de esa gran lista solo es cogo el de posicion 0 o el primero que seran el mio y el de cada usuario y lo habilito con .enabled
    if (enabled) { //si el audio esta habilitado osea audio encendido entonces puedo ejecutar
        myVideoStream.getAudioTracks()[0].enabled = false; //aqui lo desabilito el audio o sonido es decir audio apagado
        setUnmuteButton(); // seteo el boton de unmute ya que el audio esta apagado
    } else { // de lo contrario si no hay audio osea apagado
        setMuteButton(); //y seteo mi boton de apagado o mute
        myVideoStream.getAudioTracks()[0].enabled = true; //vuelvo a encender el audio
    }
};

//MUTE BUTTON
function setMuteButton () {
    const mute = `
        <i class="fas fa-microphone"></i>
        <span>Mute</span>
    `; //creo el html que quiero reemplazar
    document.querySelector('.main_mute_button').innerHTML = mute; //le pego el html creado a esa clase para que la reemplace
};

//UNMUTE BUTTON
function setUnmuteButton () {
    const unMute = `
        <i class="fas fa-microphone-slash mute"></i>
        <span>Unmute</span>
    `; //creo mi html que quiero reemplazar
    document.querySelector('.main_mute_button').innerHTML = unMute; //pego mi html para que lo reemplace
};

//FUNCIONALIDAD VIDEO - STOP VIDEO
function playStop () {
    let enabled = myVideoStream.getVideoTracks()[0].enabled; // creo variable enabled y de los datos stream voy obtener el video solo el primero de cada ussuario y mio y lo habilito
    if (enabled) { //si el video esta habilitado ejecuto
        myVideoStream.getVideoTracks()[0].enabled = false; // voy a apagar mi video
        setPlayVideo (); // y seteo el boton de iniciar video ya que esta apagado
    } else { //en caso este apagado el video
        setStopVideo ();
        myVideoStream.getVideoTracks()[0].enabled = true; //enciendo mi video
    }
};

//STOP VIDEO
const setStopVideo = () => { //seteo mi boton en Stop
    const stop = `
        <i class="fas fa-video"></i>
        <span>Stop Video</span>
    `; //creo html para reemplaar el actual
    document.querySelector('.main_video_button').innerHTML = stop; //pego el html creado y reemplazo
};

//PLAY VIDEO
const setPlayVideo = () => {
    const play = `
        <i class="fas fa-video-slash stop"></i>
        <span>Play Video</span>
    `; //creo html para reemplazar el actual
    document.querySelector('.main_video_button').innerHTML = play; //pego el html creado y reemplazo
}

function getTime() {
    //CALCULO DE FECHA Y HORA ACTUAL
    let fechaHora = new Date (); //llamo modulo de fechas

    //CONDICIONALES PARA DARLE FORMATO A LA HORA Y FECHA con dos posiciones contando el cero
    let day = (fechaHora.getDate().toString().length < 2) ? "0" + fechaHora.getDate() : fechaHora.getDate(); //uso operador ternario con (condicion) ? valor si verdad : valor si falso (es parecido a tener un if)
    let month = ((fechaHora.getMonth() + 1).toString().length < 2) ? "0" + (fechaHora.getMonth() + 1) : (fechaHora.getMonth() + 1); //clacula de 0 a 11 por eso le pongo +1 para que calculo mes correcto
    let hour = (fechaHora.getHours().toString().length < 2) ? "0" + fechaHora.getHours() : fechaHora.getHours();
    let minute = (fechaHora.getMinutes().toString().length < 2) ? "0" + fechaHora.getMinutes() : fechaHora.getMinutes();
    let jornada = hour >= 12 ? 'pm' : 'am'; //para que diferencie entre pm y am

    let time = `${day}/${month} ${hour % 12}:${minute} ${jornada}`;//el hour le coloco % 12 para que saque reloj de 12 hrs y no de 24 hrs

    return time;
}