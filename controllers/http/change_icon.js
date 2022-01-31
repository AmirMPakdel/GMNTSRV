const Consts = require("../../consts");

const change_icon = async(req, res)=>{

    let ans = valid(req.body);

    if(ans == Consts.SUCCESS){

        let {user} = req.body;

        user.icon = req.body.url;

        await user.save();

        res.json({rc:Consts.SUCCESS});

    }else{

        res.json({rc:ans});
    }
    
}

const valid = (body)=>{

    if(body.url.length >= 24){

        return Consts.SUCCESS;
    
    }else{

        return Consts.INVALID_ICON;
    }
}

module.exports = change_icon;