const Consts = require("../../consts");
const path = require('path');

const get_icon = (req, res)=>{

    let ans = valid(req.query);

    if(ans == Consts.SUCCESS){

        let file_name = req.query.file_name;

        console.log(file_name);

        //res.set('Content-Type', 'image/jpeg');

        let options = {
            root: path.join(__dirname, '/../../resources/icons'),
            dotfiles: 'deny',
        }

        if(req.query.thumb=="yes"){
            options.root = path.join(__dirname, '/../../resources/icons_thumbnails')
        }

        res.sendFile(`${file_name}`, options, (err)=>{

            if(err){

                //console.log("StationPicHandler->err1"+err);

                res.end();
            }
        });

    }else{

        res.json({result_code:ans});
    }
    
}

const valid = (query)=>{

    if(query.file_name.length > 3){

        return Consts.SUCCESS;
    
    }else{

        return Consts.FILE_NOT_FOUND;
    }
}

module.exports = get_icon;