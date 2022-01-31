const mongoose = require("mongoose");

const CardSchema = new mongoose.Schema({

    number:{type:String},

    name:{type:String, default:""},

    point: {type:Number, default:0},

    position: {type:String, default:""}, // melee | range | siege

    faction: {type:String, default:""},

    effect: {type:String, default:"normal"}, // spy | healer | scorcher | ...

    pic: {type:String, default:""},

    is_royal: {type:Boolean, default:false},

});

const Card = mongoose.model("Card", CardSchema);
module.exports = Card;
