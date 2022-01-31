const match_maker = require("../../helpers/match_maker");

const stop_search = async(req, res)=>{

    let {user} = req.body;

    let rc = match_maker.remove_user_matchQueue(user.id, res);

    res.json({rc});
}

module.exports = stop_search;