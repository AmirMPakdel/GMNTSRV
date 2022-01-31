// key -> user_id
// value -> socket.id
/**@type {Map<string,string>}}*/
let socketPool = new Map();

/**@returns {SocketIO.Socket} */
function get_socket(socket_id){
    return global.io.sockets.connected[socket_id];
}

/**@param {string} socket_id
 * @param {string} event
 * @param {Object} data
 * @param {function(socket_id, event, data)} failed
 */
function socket_emit(socket_id, event, data, failed=()=>{}){
    let socket = get_socket(socket_id)
    if(socket){
        if(socket.emit){
            if(!socket.emit(event, data)){
                failed();
            }
        }else{
            failed();
        }
    }else{
        failed();
    }
}

function user_emit(user_id, event, data, failed=()=>{}){
    let user_sid = socketPool.get(user_id.toString());
    if(user_sid){
        socket_emit(user_sid, event, data, failed);
    }else{
        failed();
    }
}

exports.user_emit = user_emit;
exports.socket_emit = socket_emit;
exports.get_socket = get_socket;
exports.socketPool = socketPool;

// key -> match_id
// value -> timeout
/**@type {Map<string,NodeJS.Timeout>}}*/
let turnTimeout = new Map();

/**@returns {NodeJS.Timeout} */
function getTurnTimeout(match_id){
    return turnTimeout.get(match_id.toString());
}

/**@param {string} match_id
 * @param {NodeJS.Timeout} timeout
 */
function setTurnTimeout(match_id, timeout){
    turnTimeout.set(match_id.toString(), timeout);
}

function deleteTurnTimeout(match_id){
    turnTimeout.delete(match_id.toString())
}

exports.getTurnTimeout = getTurnTimeout;
exports.setTurnTimeout = setTurnTimeout;
exports.deleteTurnTimeout = deleteTurnTimeout;


