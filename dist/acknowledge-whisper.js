const MODULE_NAME = "acknowledge-whisper";
const SOCKET_MESSAGE = "module." + MODULE_NAME;
const ACK_FLAG_NAME = "needs-acknowledgement";

function acknowledge_whisper(id) {
    // This function used to remove the button -- but 'setFlag'
    // results in an updateChatMessage which results in a re-render
    // anyway, and the html is apparently recreated from the
    // template. The normal checking suffices then.
    game.socket.emit(SOCKET_MESSAGE, {id});
}

game.socket.on(SOCKET_MESSAGE, () => {
//    const message = game.messages.get(id);
//    if (message.data.author.data._id == game.user.data._id) {
//        message.setFlag(MODULE_NAME, ACK_FLAG_NAME, null);
//    }
});

Hooks.on("createChatMessage", function(chat_message) {
    console.log(chat_message);
    if (chat_message.data.type == CHAT_MESSAGE_TYPES.WHISPER
        && chat_message.getFlag(MODULE_NAME, ACK_FLAG_NAME) == undefined
    ){
        chat_message.setFlag(MODULE_NAME, ACK_FLAG_NAME, true);
    }
})

Hooks.on("renderChatMessage", function(chat_message, html, data) {
    const needs_ack = chat_message.getFlag(MODULE_NAME, ACK_FLAG_NAME);
    if (chat_message.data.type == CHAT_MESSAGE_TYPES.WHISPER
        && needs_ack
    ) {
        if (data.author.data._id != game.user.data._id) {
            html.append("<button>acknowledge</button>");

            const button = html.find("button");
            button.click(() => acknowledge_whisper(data.message._id));

            html.css("background-color", "red");
        }
        else {
            html.css("background-color", "blue");
        }
    }
});
