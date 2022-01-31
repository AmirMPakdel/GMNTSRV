const neu_cards = require('./cards_neu.json');
const nor_cards = require('./cards_nor.json');
const sco_cards = require('./cards_sco.json');
const nil_cards = require('./cards_nil.json');
const mon_cards = require('./cards_mon.json');

const cards = {...neu_cards, ...nor_cards, ...sco_cards, ...nil_cards, ...mon_cards};

/**
 * @typedef Card 
 * @property {string} faction
 * @property {string} name
 * @property {string} position
 * @property {number} point
 * @property {string} effect
 * @property {boolean} is_royal
 * @property {string} number
 * @param {string} card_number 
 * @param {Card} faction
 * @returns {Card}
 */
function getCard(card_number, faction=undefined){

    let c = cards[card_number];
    if(!c){
        return false;
    }else{
        c.number = card_number;
        return c;
    }
}

function sortCardsNumberArray(cards, by="point"){
    
    let cards_list = [];

    cards.forEach((v)=>{
        cards_list.push(getCard(v));
    });

    let n = cards_list.length; 
    for (let i = 0; i < n-1; i++){
        for (let j = 0; j < n-i-1; j++){
            if (cards_list[j].point > cards_list[j+1].point) 
            { 
                // swap arr[j+1] and arr[i] 
                let temp = cards_list[j]; 
                cards_list[j] = cards_list[j+1]; 
                cards_list[j+1] = temp; 
            }
        }
    }

    return cards_list;
}

const default_decks = {
    nor:[
    "2","3","6","7","18",
    "19","24","25","32","34","35",
    "42","43","50","51","52","53",
    "55","56","57","58","59","60",
    "61","62","66","68","69","70","71"],
    nil:["2","3","6","7","18","19","24","25"],
    sco:["2","3","6","7","18","19","24","25"],
    mon:["2","3","6","7","18","19","24","25"]
};

const default_collections = {
    nor:[],
    nil:[],
    sco:[],
    mon:[]
};

const default_leaders = {
    nor:["45"],
    nil:["120"],
    sco:["88"],
    mon:["168"]
};

const default_selected_leaders = {
    nor:"45",
    nil:"120",
    sco:"88",
    mon:"168"
}

module.exports = {default_collections, default_decks, default_leaders, 
    getCard, sortCardsNumberArray, default_selected_leaders};