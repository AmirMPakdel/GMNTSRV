const Consts = require("../consts");

const Validate = {

    _id:(id)=>{
        
        try{
            id = id.toString();
        }catch(e){

            id = "";
            return false;
        }
        
        if(id.length == 24){
            return true;
        }

        return false;
    },

    http_id:(id, res)=>{

        if(Validate._id(id)){

            return true;
            
        }else{

            res.json({rc:Consts.INVALID_TOKEN});
            return false;
        }

    }
}

module.exports = Validate;