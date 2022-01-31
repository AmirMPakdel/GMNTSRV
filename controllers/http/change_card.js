const {change_card_helper} = require('../../helpers/match_controller');

const change_card = async (req, res)=>{

    let user = req.body.user;
    let match_id = req.body.match_id;
    let card_number = req.body.card_number;

    change_card_helper(user, match_id, card_number, res);
}

module.exports = change_card;