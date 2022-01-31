const User = require('../../models/User');
const Match = require('../../models/Match');
const consts = require('../../consts');
const Validate = require('../../helpers/Validate');
let {socketPool, get_socket} = require('../../helpers/SocketPool');
const match_controller = require("../../helpers/match_controller");

/**
 * @param {JSON} data
 * @param {SocketIO} socket
 * @param {Map<any, any>} socketPool
 */
module.exports = async (data, socket)=>{

    let user_id = "";

    socketPool.forEach((value, key)=>{
        if(value == socket.id){
            user_id = key;
        }
    })

    if(Validate._id(user_id)){

        let user = await User.findOne({_id:user_id.toString()});

        if(user){

            if(user.current_match != "none"){
        
                let match = await Match.findOne({_id:user.current_match});
                if(match){
                    await match_controller.player_abandoned(user._id.toString(), match);
                }
                user.current_match = "none";
                user.status = "online";
                await user.save();
            }

            console.log(user_id+" went offline");
            
            user.status="offline";

            user.last_online = Date.now().toString();

            socketPool.delete(user_id);

            await user.save();
        }

    }
}