const Const = require("../../consts");
const User = require('../../models/User');

const get_friendsList = async(req, res)=>{

    let {user} = req.body;

    let list = [];

    for(friend_id of user.friends){
        
        let f = await User.findById({_id:friend_id}, {username:true, xp:true, _id:false, icon:true});

        if(f){list.push(f)}
    }

    res.json({rc:Const.SUCCESS, data:list});
}

module.exports = get_friendsList;