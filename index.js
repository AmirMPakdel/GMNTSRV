var Express = require('express');
let app = Express();
var socket_server = require('http').createServer(app);
var io = require('socket.io')(socket_server);

const UserAuth = require('./middlewares/UserAuth');
const PlayerAuth = require('./middlewares/PlayerAuth');
const socket_handler = require('./helpers/socket_handler');
const http_controllers = require('./controllers').http;
const setup = require('./setup');
const env = require('./env');
let {socketPool, set_socket, get_socket} = require('./helpers/SocketPool');
const bodyParser = require('body-parser');
const Logger = require('./middlewares/Logger');

app.use(Express.json()) // for parsing application/json

app.use(Express.urlencoded({extended: false})) // for parsing application/x-www-form-urlencoded

app.use(Logger);

///////////////////////

app.post("/api/register", http_controllers.register);

app.post("/api/login", http_controllers.login);

app.post("/api/check_token", http_controllers.check_token);

app.get("/api/check_username", http_controllers.check_username);

app.post("/api/change_username", UserAuth, http_controllers.change_username);

app.post("/api/change_icon", UserAuth, http_controllers.change_icon);

app.post("/api/get_iconList", UserAuth, http_controllers.get_iconList);

app.get("/get_icon", http_controllers.get_icon);

app.get("/test", (req,res)=>{res.send("Hi")})

///////////////////////

app.post("/api/friend_request", UserAuth, http_controllers.friend_request);

app.post("/api/accept_friend", UserAuth, http_controllers.accept_friend);

app.post("/api/invite_friend", UserAuth, http_controllers.invite_friend);

app.post("/api/accept_invite", UserAuth, http_controllers.accept_invite);

app.post("/api/remove_friend", UserAuth, http_controllers.remove_friend);

app.post("/api/get_friendsList", UserAuth, http_controllers.get_friendsList);

///////////////////////

app.post("/api/change_faction", UserAuth, http_controllers.change_faction);

app.post("/api/get_decks", UserAuth, http_controllers.get_decks);

app.post("/api/set_decks", UserAuth, http_controllers.set_decks);

///////////////////////

app.post("/api/find_match", UserAuth, http_controllers.find_match);

app.post("/api/stop_search", UserAuth, http_controllers.stop_search);

app.post("/api/change_card", UserAuth, PlayerAuth, http_controllers.change_card);

app.post("/api/draw_card", UserAuth, PlayerAuth, http_controllers.draw_card);

app.post("/api/get_pile", UserAuth, PlayerAuth, http_controllers.get_pile);

app.post("/api/match_accept", UserAuth, PlayerAuth, http_controllers.match_accept);

app.post("/api/round_calloff", UserAuth, PlayerAuth, http_controllers.round_calloff);

app.post("/api/abandoning_game", UserAuth, PlayerAuth, http_controllers.abandoning_game);

///////////////////////

app.post("/api/bot_info", UserAuth, http_controllers.bot_info);

///////////////////////

io.on("connection", (socket)=>{
    console.log("new socket : "+socket.id);
    global.io = io;
    socket_handler(socket);
});

///////////////////////

setup(app, socket_server);
