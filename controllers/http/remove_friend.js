const Const = require("../../consts");
const User = require('../../models/User');
const {user_emit} = require('../../helpers/SocketPool');

const remove_friend = async(req, res)=>{

    let ans = valid(req.body);

    if(ans == Const.SUCCESS){

        let {user, friend_username} = req.body;

        let friend = await User.findOne({username:friend_username});
    
        if(friend){

            let i1 = user.friends.indexOf(friend._id);
            
            user.friends.splice(i1,1);

            user.markModified("friends");

            await user.save();

            let i2 = friend.friends.indexOf(user._id);
            
            friend.friends.splice(i2,1);

            friend.markModified("friends");

            await friend.save();

            user_emit(friend._id, "friend_removed", {
                username:user.username,
                xp:user.xp,
                icon:user.icon
            })

            console.log("done");
            

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
    }

    return Const.SUCCESS;
}

module.exports = remove_friend;