const Consts = require('../consts');
const User = require('../models/User');

const UserAuth = async (req, res, next)=>{

    let token = req.body.token?req.body.token.toString():"";

    if(token.length == 24){

        let data = await User.findOne({_id:token});

        if(data){

            req.body.user = data;

            next();

        }else{
            
            res.json({rc:Consts.INVALID_TOKEN});
        }

    }else{
        
        res.json({rc:Consts.INVALID_TOKEN});
    }
}

module.exports = UserAuth;