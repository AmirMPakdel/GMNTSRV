const Consts = require("../../consts");
const User = require('../../models/User');

const check_username = async(req, res)=>{

    let ans = valid(req.query);

    if(ans == Consts.SUCCESS){

        let username = req.query.username;

        let user = await User.findOne({username});

        if(user){
            res.json({rc:Consts.INVALID_USERNAME});

        }else{
            res.json({rc:Consts.SUCCESS});
        }

    }else{

        res.json({rc:ans});
    }
    
}

const valid = (query)=>{

    if(query.username.length >= 8){

        return Consts.SUCCESS;
    
    }else{

        return Consts.INVALID_USERNAME;
    }
}

module.exports = check_username;