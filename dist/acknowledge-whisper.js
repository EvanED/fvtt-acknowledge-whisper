const MODULE_NAME = "acknowledge-whisper";
const ACK_FLAG_NAME = "needs-acknowledgement";

function acknowledge_whisper(id) {
    const chat_li = document.querySelector(`li[data-message-id="${id}"]`);
    chat_li.style = "";

    const button = chat_li.querySelector("button");
    chat_li.removeChild(button);

    const message = game.messages.get(id);
    console.log(message);
    const sender_id = message.data.user;
    ChatMessage.create({
	type: CHAT_MESSAGE_TYPES.WHISPER,
	whisper: [sender_id],
	content: `[Acknowledging ${message.data.content}]`,
    });
}

Hooks.on("createChatMessage", function(chat_message) {
    console.log(chat_message);
    if (chat_message.data.type == CHAT_MESSAGE_TYPES.WHISPER
	&& chat_message.getFlag(MODULE_NAME, ACK_FLAG_NAME) == undefined
    ){
	chat_message.setFlag(MODULE_NAME, ACK_FLAG_NAME, true);
    }
})

Hooks.on("renderChatMessage", function(chat_message, html, data) {
    const flag = chat_message.getFlag(MODULE_NAME, ACK_FLAG_NAME);
    if (chat_message.data.type == CHAT_MESSAGE_TYPES.WHISPER
	&& data.author.data._id != game.user.data._id
    ) {
	html.append("<button>acknowledge</button>");

	const button = html.find("button");
	button.click(() => acknowledge_whisper(data.message._id));

	html.css("background-color", "red");
    }
});
