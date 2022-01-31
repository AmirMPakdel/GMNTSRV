const Const = require("../../consts");
const User = require('../../models/User');
const {user_emit} = require('../../helpers/SocketPool');

const invite_friend = async(req, res)=>{

    let ans = valid(req.body);

    if(ans == Const.SUCCESS){

        let {user, friend_username} = req.body;

        let friend = await User.findOne({username:friend_username});
    
        if(friend){

            let failed = false;
            user_emit(friend._id, "friend_invite", {
                username:user.username,
                icon:user.icon,
                xp:user.xp
            },()=>{
                failed = true;
            })

            if(failed){
            
                res.json({rc:Const.FRIEND_OFFLINE});
            
            }else{
                res.json({rc:Const.SUCCESS});
            }
    
        }else{
            res.json({rc:Const.INVALID_FRIEND_USERNAME});
        }

    }else{
        res.json({rc:ans});
    }
}

function valid(body){
    if(!body.friend_username){

        return Const.INVALID_FRIEND_USERNAME;
    }

    return Const.SUCCESS;
}

module.exports = invite_friend;