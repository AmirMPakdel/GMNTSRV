const Consts = require('../consts');
const Match = require('../models/Match');

const PlayerAuth = async (req, res, next)=>{

    let match_id = req.body.match_id?req.body.match_id.toString():"";

    if(match_id.length == 24){

        let data = await Match.findOne({_id:match_id});

        if(data){

            req.body.match = data;

            next();

        }else{
            res.json({rc:Consts.INVALID_MATCH_ID});
        }

    }else{
        
        res.json({rc:Consts.INVALID_MATCH_ID});
    }
}

module.exports = PlayerAuth;