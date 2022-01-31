const Consts = require("../../consts");
const User = require('../../models/User');
const icons = require("../../resources/icons.json");
const {xp2Level} = require('../../helpers/utils');

const get_iconList = async(req, res)=>{

    
    let {user} = req.body;

    let user_level = xp2Level(user.xp);

    let list = [];
    Object.keys(icons).forEach(v=>{
        if(icons[v].level > user_level){
            list.push({name:null,level:icons[v].level,url:null});
        }else{
            list.push(icons[v])
        }
    });

    res.json({rc:Consts.SUCCESS, data:list});
}

module.exports = get_iconList;