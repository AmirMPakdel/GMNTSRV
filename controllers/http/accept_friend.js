const Const = require("../../consts");
const User = require('../../models/User');
const {user_emit} = require('../../helpers/SocketPool');

const accept_friend = async(req, res)=>{

    let ans = valid(req.body);

    if(ans == Const.SUCCESS){

        let {user, friend_username} = req.body;

        let friend = await User.findOne({username:friend_username});
    
        if(friend){

            let i1 = friend.friends.indexOf(user._id);

            if(i1 == -1){
                friend.friends.push(user._id);
                await friend.save();
            }

            let i2 = user.friends.indexOf(friend._id);

            if(i2 == -1){
                user.friends.push(friend._id);
                await user.save();
                user_emit(friend._id, "friend_added", {
                    username:user.username,
                    xp:user.xp,
                    icon:user.icon
                })
            }

            res.json({rc:Const.SUCCESS});
    
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
    }else{
        if(body.friend_username.length<8){
            return Const.INVALID_FRIEND_USERNAME;
        }
    }

    return Const.SUCCESS;
}

module.exports = accept_friend;