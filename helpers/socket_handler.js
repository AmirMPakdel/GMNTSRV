const socket_controllers = require("../controllers/index").socket;
let {get_socket} = require('../helpers/SocketPool');

/**
 * @param {SocketIO.Socket} socket
 * @param {Map<any,any>} socketPool
*/
module.exports = (socket)=>{

    socket.on("online", (data)=>{
        socket_controllers.online(data, socket);
    });

    socket.on("disconnect", (data)=>{
        socket_controllers.disconnect(data, socket);
    })
}

