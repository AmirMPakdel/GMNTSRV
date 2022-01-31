module.exports = {

    http:{
        register : require('./http/register'),
        login : require('./http/login'),
        check_token : require('./http/check_token'),
        change_username : require("./http/change_username"),
        change_icon: require("./http/change_icon"),
        ////////////////
        get_decks : require('./http/get_decks'),
        set_decks : require('./http/set_decks'),
        change_faction : require('./http/change_faction'),
        get_iconList : require("./http/get_iconList"),
        /////////////////
        get_friendsList: require('./http/get_friendsList'),
        friend_request:require('./http/friend_request'),
        accept_friend: require("./http/accept_friend"),
        remove_friend: require("./http/remove_friend"),
        invite_friend: require("./http/invite_friend"),
        accept_invite: require("./http/accept_invite"),
        ////////////////
        find_match : require('./http/find_match'),
        stop_search : require('./http/stop_search'),
        change_card : require('./http/change_card'),
        draw_card : require('./http/draw_card'),
        get_pile : require("./http/get_pile"),
        match_accept : require('./http/match_accept'),
        round_calloff : require('./http/round_calloff'),
        abandoning_game : require('./http/abandoning_game'),
        ////////////////
        get_icon: require('./http/get_icon'),
        check_username: require("./http/check_username"),
        ///////////////
        bot_info: require("./http/bot_info"),
    },

    socket:{
        online : require('./socket/online'),
        disconnect : require("./socket/disconnect"),
    }
}