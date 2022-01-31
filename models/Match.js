const mongoose = require("mongoose");

const default_horns ={p1_m:false, p2_m:false, p1_r:false, p2_r:false, p1_s:false, p2_s:false};

const defaultRoundScore = {m:0, r:0, s:0};

const MatchSchema = new mongoose.Schema({

    //card_collection_version:Number,

    p1_id:{type:String}, // id of player 1

    p2_id:{type:String},

    p1_icon:{type:String},// icon url of player 1

    p2_icon:{type:String},

    p1_current_xp:{type:Number},// player 1 current xp

    p2_current_xp:{type:Number},

    p1_level:{type:Number},// player 1 current level

    p2_level:{type:Number},

    with_friend:{type:Boolean, default:false}, // match is friendly

    p1_faction:{type:String, default:"nor"}, // selected faction of player1 ex: "nor" | "mon" ...

    p2_faction:{type:String, default:"nor"},

    p1_won_round:{type:Number, default:0}, // how may round player 1 won ex: 0 | 1 | 2

    p2_won_round:{type:Number, default:0},

    p1_accept:{type:Boolean, default:false},// player 1 accepted match

    p2_accept:{type:Boolean, default:false},

    p1_abandoned:{type:Boolean, default:false},// player 1 abandoned the game

    p2_abandoned:{type:Boolean, default:false},

    p1_round_calloff:{type:Object, default:{r1:false, r2:false, r3:false}},// player 1 dont want to draw any more

    p2_round_calloff:{type:Object, default:{r1:false, r2:false, r3:false}},
    
    p1_leader_card:{type:String},// number of leader card of player 1 ex: "45" | "66"...

    p2_leader_card:{type:String},

    p1_cards:{type:Array, default:[]},// array of player 1 cards ex: ["24","44","22", "33"]...

    p2_cards:{type:Array, default:[]},

    p1_deck:{type:Array},

    p2_deck:{type:Array},// array of player 1 deck ex: ["24","44","22", "33"]...
    
    p1_pile:{type:Array, default:[]},// array of cards player 1 used and burnt

    p2_pile:{type:Array, default:[]},

    current_round:{type:Number, default:1}, // 1, 2, 3

    change_card_time:{type:Boolean, default:true},// players can switch cards

    p1_change_card_left:{type:Number, default:2},// max 2

    p2_change_card_left:{type:Number, default:2},

    turn:{type:String, default:""},// id of player who has to draw now

    p1_did_turn:{type:Boolean, default:true},// lock drawing card if true

    p2_did_turn:{type:Boolean, default:true},

    p1_score:{type:Number, default:0},// total score (all rounds) of player 1 

    p2_score:{type:Number, default:0},

    p1_xp_gain:{type:Number, default:0},// total xp for player 1

    p2_xp_gain:{type:Number, default:0},

    game_finished:{type:Boolean, default:false},// true if game is finished

    ///////////////

    r1_winner:{type:String, default:"tie"},// winner for this round p1 | p2 | tie

    r1_p1_score:{type:Object, default:defaultRoundScore},// round 1 total score of player 1

    r1_p2_score:{type:Object, default:defaultRoundScore},

    r1_snowy:{type:Boolean, default:false},

    r1_foggy:{type:Boolean, default:false},

    r1_rainy:{type:Boolean, default:false},

    r1_p1_m_cards:{type:Array, default:[]},// round 1 player1 melee cards

    r1_p2_m_cards:{type:Array, default:[]},

    r1_p1_r_cards:{type:Array, default:[]},// round 1 player1 range cards

    r1_p2_r_cards:{type:Array, default:[]},

    r1_p1_s_cards:{type:Array, default:[]},// round 1 player1 siege cards

    r1_p2_s_cards:{type:Array, default:[]},

    r1_horns:{type:Object, default:default_horns}, // sey which row has x2 booster

    ///////////////

    r2_winner:{type:String, default:"tie"},

    r2_p1_score:{type:Object, default:defaultRoundScore},

    r2_p2_score:{type:Object, default:defaultRoundScore},

    r2_snowy:{type:Boolean, default:false},

    r2_foggy:{type:Boolean, default:false},

    r2_rainy:{type:Boolean, default:false},

    r2_p1_m_cards:{type:Array, default:[]},

    r2_p2_m_cards:{type:Array, default:[]},

    r2_p1_r_cards:{type:Array, default:[]},

    r2_p2_r_cards:{type:Array, default:[]},

    r2_p1_s_cards:{type:Array, default:[]},

    r2_p2_s_cards:{type:Array, default:[]},

    r2_horns:{type:Object, default:default_horns},


    ///////////////

    r2_winner:{type:String, default:"tie"},

    r3_p1_score:{type:Object, default:defaultRoundScore},

    r3_p2_score:{type:Object, default:defaultRoundScore},

    r3_snowy:{type:Boolean, default:false},

    r3_foggy:{type:Boolean, default:false},

    r3_rainy:{type:Boolean, default:false},

    r3_p1_m_cards:{type:Array, default:[]},

    r3_p2_m_cards:{type:Array, default:[]},

    r3_p1_r_cards:{type:Array, default:[]},

    r3_p2_r_cards:{type:Array, default:[]},

    r3_p1_s_cards:{type:Array, default:[]},

    r3_p2_s_cards:{type:Array, default:[]},

    r3_horns:{type:Object, default:default_horns},
});

const Match = mongoose.model("Match", MatchSchema);
module.exports = Match;