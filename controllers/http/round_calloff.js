const {round_call_off} = require("../../helpers/match_controller");

const round_calloff = (req, res)=>{

    let {user, match} = req.body;

    round_call_off(user._id.toString(), match, res);
}

module.exports = round_calloff;