const {player_abandoned} = require('../../helpers/match_controller');

const abandoning_game = async (req, res)=>{

    let {user, match}  = req.body;

    let user_id = user._id.toString();

    player_abandoned(user_id, match, res);
}

module.exports = abandoning_game;