const {match_accept_helper} = require('../../helpers/match_starter');

const match_accept = async (req, res)=>{
    
    let {user, match} = req.body;

    match_accept_helper(user._id, match._id, res);
}

module.exports = match_accept;