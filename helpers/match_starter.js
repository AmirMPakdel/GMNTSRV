let {user_emit} = require('./SocketPool');
const Consts = require('../consts');
const {MatchQueue, QueueItem} = require('./MatchQeue');
const {xp2Level} = require('./utils');
const {Card, User, Deck, Match} = require('../models');
const match_controller = require('./match_controller');
const {create_bot} = require("./bot");

const MATCH_ACCEPT_TIME = 15000;// 15sec

/**
 * @param {SocketIO.Socket} socket
 */
const match_starter = {
    
    // done 50%
    create_match_db: async(p1_id, p2_id, friends=false)=>{

        let p1 = await Deck.findOne({user_id:p1_id});
        let user_1 = await User.findOne({_id:p1_id});

        let p2 = await Deck.findOne({user_id:p2_id});
        let user_2 = await User.findOne({_id:p2_id});

        let p1_faction = p1.selected_faction;
        let p2_faction = p2.selected_faction;
        let p1_deck = p1.decks[p1_faction];
        let p2_deck = p2.decks[p2_faction];
        
        let p1_icon = user_1.icon;
        let p2_icon = user_2.icon;
        let p1_current_xp = user_1.xp;
        let p2_current_xp = user_2.xp;
        let p1_level = xp2Level(user_1.xp);
        let p2_level = xp2Level(user_2.xp);

        let p1_leader_card = "";//p1.selected_leader_cards[p1_faction];
        let p2_leader_card = "";//p2.selected_leader_cards[p2_faction];

        let newMatch = {
            p1_id,
            p2_id,
            p1_faction,
            p2_faction,
            p1_deck,
            p2_deck,
            p1_leader_card,
            p2_leader_card,
            p1_icon,
            p2_icon,
            p1_current_xp,
            p2_current_xp,
            p1_level,
            p2_level,
            with_friend:friends
        }

        let db_newMatch = new Match(newMatch);

        await db_newMatch.save();

        let newMatch_id = db_newMatch._id;

        user_emit(p1_id, "match_found", {match_id:newMatch_id, friends});
        user_emit(p2_id, "match_found", {match_id:newMatch_id, friends});

        match_starter.delete_match_check(newMatch_id);
    },

    create_bot_match_db: async(p1_id)=>{

        let p1 = await Deck.findOne({user_id:p1_id});
        let user_1 = await User.findOne({_id:p1_id});
    
        let bot = create_bot(user_1.xp);

        let p2_id = bot._id;

        let p1_faction = p1.selected_faction;
        let p2_faction = bot.selected_faction;

        let p1_deck = p1.decks[p1_faction];
        let p2_deck = bot.deck;
        
        let p1_icon = user_1.icon;
        let p2_icon = bot.icon;
        let p1_current_xp = user_1.xp;
        let p2_current_xp = bot.xp;
        let p1_level = xp2Level(user_1.xp);
        let p2_level = bot.level;

        let p1_leader_card = "";//p1.selected_leader_cards[p1_faction];
        let p2_leader_card = "";//bot.selected_leader_cards;

        let newMatch = {
            p1_id,
            p2_id,
            p1_faction,
            p2_faction,
            p1_deck,
            p2_deck,
            p1_leader_card,
            p2_leader_card,
            p1_icon,
            p2_icon,
            p1_current_xp,
            p2_current_xp,
            p1_level,
            p2_level,
            with_friend:false
        }

        let db_newMatch = new Match(newMatch);

        db_newMatch.p2_accept = true;

        await db_newMatch.save();

        let newMatch_id = db_newMatch._id;

        user_emit(p1_id, "match_found", {match_id:newMatch_id, friends:false});

        match_starter.delete_match_check(newMatch_id);
    },

    // done 50%
    delete_match_check: (match_id)=>{

        // starting the timer
        setTimeout( async(match_id)=>{

            let match = await Match.findById(match_id);

            if(!match.p1_accept && !match.p2_accept){

                //TODO: have no idea match_declined is for?!
                user_emit(match.p1_id, "match_declined");
                if(match.p2_id != "bot"){
                    user_emit(match.p2_id, "match_declined");
                }
                
                await Match.deleteOne({_id:match_id});
            }

        }, MATCH_ACCEPT_TIME, match_id)
    },

    // done 25%
    match_accept_helper: async(user_id, match_id, res)=>{

        let match = await Match.findOne({_id:match_id.toString()});

        user_id = user_id.toString();

        if(match.p1_id === user_id){

            match.p1_accept = true;

            await match.save();

            if(match.p2_id !== "bot"){
                user_emit(match.p2_id, "opponent_accept");
            }

        }else if(match.p2_id === user_id){

            match.p2_accept = true;

            await match.save();

            user_emit(match.p1_id, "opponent_accept");

        }else{

            //TODO: save error in db
            console.log("wtf- this user is not part of this match");
        }

        res.json({rc:Consts.SUCCESS});

        if(match.p1_accept && match.p2_accept){

            match_controller.give_match_detail(match_id);
        }
    }
}

module.exports = match_starter;