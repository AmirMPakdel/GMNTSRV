const User = require('../../models/User');
const consts = require('../../consts');
const Validate = require('../../helpers/Validate');
let {socketPool, get_socket} = require('../../helpers/SocketPool');

/**
 * @param {JSON} data
 * @param {SocketIO} socket
 * @param {Map<any, any>} socketPool
 */
module.exports = async (data, socket)=>{

    let {token} = data;

    if(Validate._id(token)){

        let user = await User.findOne({_id:token.toString()});

        if(user){
            
            socketPool.set(token, socket.id);

            get_socket(socket.id).emit("online", {rc:consts.SUCCESS});

            user.status="online";

            user.last_online = Date.now().toString();

            await user.save();

        }else{
            socket.disconnect(true);
        }

    }else{

        socket.disconnect(true);
    }
}