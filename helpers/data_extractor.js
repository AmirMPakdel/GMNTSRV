let socketPool = require("./SocketPool");
const Consts = require("../consts");
const { MatchQueue, QueueItem } = require("./MatchQeue");
const { xp2Level } = require("./utils");
const { Card, User, Deck, Match } = require("../models");
const { getCard } = require("../resources/cards");

const BASE_XP = 50;
const BASE_WIN_XP = 30;

function Match_data_extractor(player, match_data) {
  let r = match_data.current_round;
  let data = {};

  data["id"] = match_data[player + "_id"];

  data["accept"] = match_data[player + "_accept"];

  data["abandoned"] = match_data[player + "_abandoned"];

  data["round_calloff"] = match_data[player + "_round_calloff"];

  data["cards"] = match_data[player + "_cards"];

  data["deck"] = match_data[player + "_deck"];

  data["leader_card"] = match_data[player + "_leader_card"];

  data["current_round"] = match_data["current_round"];

  data["change_card_time"] = match_data["change_card_time"];

  data["change_card_left"] = match_data[player + "_change_card_left"];

  data["turn"] = match_data["turn"];

  data["spent_cards"] = match_data[player + "_spent_cards"];

  data["score"] = match_data[player + "_score"];

  data[r + "_score"] = match_data[r + "_" + player + "_score"];

  data[r + "_snowy"] = match_data[r + "_snowy"];

  data[r + "_foggy"] = match_data[r + "_foggy"];

  data[r + "_rainy"] = match_data[r + "_rainy"];

  ///////////////

  // match_data.r1_p1_melee_cards:{type:Array, default:[]},

  // match_data.r1_p2_melee_cards:{type:Array, default:[]},

  // match_data.r1_p1_range_cards:{type:Array, default:[]},

  // match_data.r1_p2_range_cards:{type:Array, default:[]},

  // match_data.r1_p1_long_cards:{type:Array, default:[]},

  // match_data.r1_p2_long_cards:{type:Array, default:[]},
}

async function match_start_detail_extractor(player, match) {
  let detail = {};

  let opponent_id = "";
  let player_cards = [];
  let player_deck = [];
  let opp_icon = "";
  let my_icon = "";
  let my_faction = "";
  let opp_faction = "";

  if (player == "p1") {
    opponent_id = match.p2_id;
    opp_icon = match.p2_icon;
    my_icon = match.p1_icon;
    my_faction = match.p1_faction;
    opp_faction = match.p2_faction;
    player_cards = match.p1_cards;
    player_deck = match.p1_deck;

  } else if (player == "p2") {
    opponent_id = match.p1_id;
    opp_icon = match.p1_icon;
    my_icon = match.p2_icon;
    my_faction = match.p2_faction;
    opp_faction = match.p1_faction;
    player_cards = match.p2_cards;
    player_deck = match.p2_deck;

  } else {
    console.log("wtf- player should be p1 or p2");
    return undefined;
  }

  let opponent;

  if(opponent_id !== "bot"){
    opponent = await User.findOne({ _id: opponent_id.toString() });
  }else{
    opponent = {name:"bot", level:0}//TODO:
  }

  detail.opponent = { name: opponent.name, level: xp2Level(opponent.xp) };

  detail.cards = player_cards;

  detail.my_icon = my_icon;

  detail.opp_icon = opp_icon;

  detail.my_faction = my_faction;

  detail.opp_faction = opp_faction;

  return detail;
}

function card_extractor(card_number) {
  return getCard(card_number);
}

function player_number_extractor(user_id, match) {
  if (match.p1_id == user_id) {
    return "p1";
  } else if (match.p2_id == user_id) {
    return "p2";
  } else {
    throw new Error(
      `wtf- match.p1_id=${match.p1_id} match.p2=${match.p2_id} user_id=${user_id}`
    );
  }
}

function opponent_number_extractor(user_id, match) {
  if (match.p1_id == user_id) {
    return "p2";
  } else if (match.p2_id == user_id) {
    return "p1";
  } else {
    throw new Error(
      `wtf- match.p1_id=${match.p1_id} match.p2=${match.p2_id} user_id=${user_id}`
    );
  }
}

function row_scores_extractor(player_number, match) {
  let player_id = match[player_number + "_id"];
  let opp_number = opponent_number_extractor(player_id, match);
  let r = match.current_round;

  let scores = {
    opp_s: match["r" + r + "_" + opp_number + "_score"]["s"],
    opp_r: match["r" + r + "_" + opp_number + "_score"]["r"],
    opp_m: match["r" + r + "_" + opp_number + "_score"]["m"],
    my_m: match["r" + r + "_" + player_number + "_score"]["m"],
    my_r: match["r" + r + "_" + player_number + "_score"]["r"],
    my_s: match["r" + r + "_" + player_number + "_score"]["s"],
  };

  return scores;
}

/**
 * @param {"p1"|"p2"} player_number 
 * @typedef ScorchingCard
 * @property {number} number
 * @property {number} score
 * @property {"m"|"r"|"s"} position
 * @property {"p1"|"p2"} player_number
 * @param {ScorchingCard[]} scorching_cards;
 * @returns {player_data, opp_data}
 */
function scorch_data_extractor(player_number, scorching_cards){
  let data = {player_data:[], opp_data:[]};

  scorching_cards.forEach((v,i)=>{

    if(v.player_number == player_number){

      data.player_data.push({
        number: v.number,
        owns: "me",
        position:v.position
      });

      data.opp_data.push({
        number: v.number,
        owns: "opp",
        position:v.position
      });

    }else{

      data.player_data.push({
        number: v.number,
        owns: "opp",
        position:v.position
      });

      data.opp_data.push({
        number: v.number,
        owns: "me",
        position:v.position
      });
    }
  });

  return data;
}

function xp_calculator(player_number, match) {
  
  let p = player_number;
  let opp = "p1";
  if(p=="p1"){opp="p2"}

  let gain_xp = BASE_XP;

  if(match[p+"_abandoned"]){
    return {gain_xp:0, level_diff_bounce:0, unused_cards_bonuce:0, level_diff:0};
  }

  let my_xp = match[p+"_current_xp"];
  let opp_xp = match[opp+"_current_xp"];

  let my_level = xp2Level(my_xp);
  let opp_level = xp2Level(opp_xp);

  let level_diff = opp_level-my_level;

  let level_diff_bounce = ((level_diff)*2);

  if(level_diff_bounce < -20){
    level_diff_bounce = -20;
  }

  if(level_diff_bounce > 50){
    level_diff_bounce = 50;
  }

  gain_xp+= level_diff_bounce;

  gain_xp+=(Math.floor(my_level*0.66));

  let unused_cards = match[p+"_cards"].length + match[opp+"_cards"].length;

  let unused_cards_bonuce = 0;
  if(unused_cards > 4){
    unused_cards_bonuce = -Math.floor(unused_cards*6.3);

    if(gain_xp < ((-unused_cards_bonuce)+20)){
      gain_xp = Math.floor(gain_xp*0.12);
    }else{
      gain_xp += unused_cards_bonuce;
    }
  }

  let won_rounds = match[p+"_won_round"];
  if(won_rounds == 0){
    gain_xp = Math.floor(gain_xp*0.4);
  }else if(won_rounds == 1){
    gain_xp = Math.floor(gain_xp*0.65);
  }else{
    gain_xp += BASE_WIN_XP
  }

  if(level_diff>0){
    gain_xp = Math.floor(gain_xp * ((level_diff*0.08)+1));
  }

  if(match["with_friend"]){
    gain_xp = Math.floor(gain_xp*0.4);
  }

  if(gain_xp<=10){
    gain_xp+=10;
  }

  console.log(p+"->"+JSON.stringify({gain_xp, level_diff_bounce, unused_cards_bonuce}));
  
  return {gain_xp, level_diff_bounce, unused_cards_bonuce, level_diff};
}

function match_result_extractor(player_id, match) {
  let player_number = player_number_extractor(player_id, match);
  let opp_number = opponent_number_extractor(player_id, match);

  let result = {};

  result.my_abandoned = match[player_number + "_abandoned"];
  result.opp_abandoned = match[opp_number + "_abandoned"];

  result.xp = match[player_number + "_xp_gain"];

  result.r1_opp_score = match["r1_" + opp_number + "_score"];
  result.r2_opp_score = match["r2_" + opp_number + "_score"];
  result.r3_opp_score = match["r3_" + opp_number + "_score"];

  result.r1_my_score = match["r1_" + player_number + "_score"];
  result.r2_my_score = match["r2_" + player_number + "_score"];
  result.r3_my_score = match["r3_" + player_number + "_score"];

  result.r1_won = "tie";
  result.r2_won = "tie";
  result.r3_won = "tie";

  if (match.r1_winner == player_number) {
    result.r1_won = true;
  } else if (match.r1_winner == opp_number) {
    result.r1_won = false;
  }

  if (match.r2_winner == player_number) {
    result.r2_won = true;
  } else if (match.r2_winner == opp_number) {
    result.r2_won = false;
  }

  if (match.r3_winner == player_number) {
    result.r3_won = true;
  } else if (match.r3_winner == opp_number) {
    result.r3_won = false;
  }

  return result;
}

module.exports = {
  Match_data_extractor,
  match_start_detail_extractor,
  match_result_extractor,
  card_extractor,
  player_number_extractor,
  xp_calculator,
  opponent_number_extractor,
  row_scores_extractor,
  scorch_data_extractor,
};
