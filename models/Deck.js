const mongoose = require("mongoose");
const {default_collections, default_decks, 
    default_selected_leaders, default_leaders} = require('../resources/cards');

const DeckSchema = new mongoose.Schema({

    user_id:{type:String, default:""},

    selected_faction:{type:String, default:"nor"},

    decks:{type:Object, default:default_decks},

    collections:{type:Object, default:default_collections},

    leader_cards:{type:Object, default:default_leaders},

    selected_leader_cards:{type:Object, default:default_selected_leaders}
    
});

const Deck = mongoose.model("Deck", DeckSchema);
module.exports = Deck;