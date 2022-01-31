const Consts = require("../../consts");
const User = require('../../models/User');

const change_username = async(req, res)=>{

    let ans = valid(req.body);

    if(ans == Consts.SUCCESS){

        let username = req.body.username;

        let user = await User.findOne({username});

        if(user){
            res.json({rc:Consts.INVALID_USERNAME});

        }else{
            
            let {user} = req.body;

            user.username = username;

            await user.save();

            res.json({rc:Consts.SUCCESS});
        }

    }else{

        res.json({rc:ans});
    }
    
}

const valid = (body)=>{

    if(body.username.length >= 8){

        return Consts.SUCCESS;
    
    }else{

        return Consts.INVALID_USERNAME;
    }
}

module.exports = change_username;