const MODULE_NAME = "acknowledge-whisper";
const SOCKET_MESSAGE = "module." + MODULE_NAME;
const ACK_FLAG_NAME = "needs-acknowledgement";

// Flow:
//
// Sender (person) writes whisper; sender VTT transmits the message.
//
// All (relevant?) VTTs create the chat message and call
// 'createChatMessage' hook. If the message does not have the
// 'needs-ack' flag, then we assume it is a new message and set it to
// true. In the sender, we color it blue; in the recipient, red, and
// add the button.
//
// The recipient clicks the acknowledge button. Recipient VTT sends a
// socket message meaning that the message with the given ID is ack'ed.
//
// The *sender* traps on that message, in 'game.socket.on'. The sender
// then calls setFlag to set 'needs-ack' to false.
//
// We need the extra step because the recipient can't set the flag in
// most circumstances -- if the GM whispers to the player, the player
// will not have permission.


Hooks.on("ready", () => {
    game.socket.on(SOCKET_MESSAGE, (payload) => {
        const message = game.messages.get(payload.id);
        if (message.user.data._id == game.user.data._id) {
            message.setFlag(MODULE_NAME, ACK_FLAG_NAME, false);
        }
    });
})

Hooks.on("createChatMessage", function(chat_message) {
    console.log(chat_message)
    if (chat_message.data.type == CHAT_MESSAGE_TYPES.WHISPER
        && chat_message.getFlag(MODULE_NAME, ACK_FLAG_NAME) == undefined
        && chat_message.user.data._id == game.user.data._id
    ){
        chat_message.setFlag(MODULE_NAME, ACK_FLAG_NAME, true);
    }
})

Hooks.on("renderChatMessage", function(chat_message, html, data) {
    if (chat_message.data.type == CHAT_MESSAGE_TYPES.WHISPER
        && chat_message.getFlag(MODULE_NAME, ACK_FLAG_NAME)
    ){
        if (data.author.data._id != game.user.data._id) {
            html.append("<button>acknowledge</button>");

            const button = html.find("button");
            button.click(() => {
                game.socket.emit(SOCKET_MESSAGE, {id: data.message._id});
            });

            html.css("background-color", "red");
        }
        else {
            html.css("background-color", "blue");
        }
    }
});
