const Const = require("../../consts");
const User = require('../../models/User');
const {user_emit} = require('../../helpers/SocketPool');
const {create_match_db} = require("../../helpers/match_starter");

const accept_invite = async(req, res)=>{

    let ans = valid(req.body);

    if(ans == Const.SUCCESS){

        let {user, friend_username} = req.body;

        let friend = await User.findOne({username:friend_username});
    
        if(friend){

            create_match_db(user._id.toString(), friend._id.toString(), true);

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

module.exports = accept_invite;