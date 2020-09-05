const users = [];

//JOIN USER TO CHAT
function userJoin (id, username, room) {
    const user = { id, username, room }; //creo objeto con los datos 
    users.push(user); //añado mi objeto a una lista originando una lista de objetos que seran mis usarios que vayan ingresando
    return user; //finalmente que me retorno el objeto creado
}

//GET CURRENT USER
function getCurrentUser (id) {
    return users.find(user => user.id === id);
}

//USER LEAVES THE CHAT
function userLeaves (id) {
    const index = users.findIndex(user => user.id === id); //me retorna la posiscion del primer elemento que encuentra si es igual a id

    if(index !== -1) {
        return users.splice(index, 1)[0]; //remuevo objeto en la posicion de index y le digo solo remuve un elemento luego de eso que me de el primer elemento de esa nueva lista
    }
}

//GET ROOM USERS
function getRoomUsers (room) {
    return users.filter(user => user.room === room);
}

module.exports = { userJoin, getCurrentUser, userLeaves, getRoomUsers }