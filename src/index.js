import App from "./app.js";
import { closeModal, openModal } from "./modal.js";
import TwitchChat from "./twitch/TwitchChat.js";
import { loadTestUsers } from "./twitch/loadTestUsers.js";

const {
	twitch_channel, twitch_oauth, twitch_username
} = _authConfig;

const twitchIRC = "wss://irc-ws.chat.twitch.tv:443";
const client = new TwitchChat(twitchIRC, {
	username: twitch_username,
	authToken: twitch_oauth,
	channel: twitch_channel,
});

window.addEventListener("load", () => {
	const hintsStrip = document.getElementById("hints-strip");
	if (hintsStrip && Array.isArray(_settings.hints)) {
		_settings.hints.forEach(({ cmd, desc }) => {
			const item = document.createElement("div");
			item.className = "hint-item";
			item.innerHTML = `<span class="hint-cmd">${cmd}</span><span class="hint-desc">${desc}</span>`;
			hintsStrip.appendChild(item);
		});
	}

	let storeName = "userList";
	if (_settings.testMode) {
		console.log("Test mode enabled");
		storeName = "testUserList";
	}
	const app = new App(storeName);
	app.render();

	window.addEventListener('focusSessionEnd', (event) => {
	const message = event.detail.message;
	if (message && client) {
		client.say(message);
	}
});

	client.on("command", (data) => {
		const { user, command, message, flags, extra } = data;
		const response = app.chatHandler(user, command, message, flags, extra);
		if (!response.error && response.message) {
			client.say(response.message, extra.messageId);
		} else {
			// error logs also are added to OBS logs
			console.error(response.message);
		}
	});

	client.on("oauthError", () => {
		openModal();
	});

	client.on("oauthSuccess", () => {
		closeModal();
	});

	client.connect();
	if (_settings.testMode) loadTestUsers(client);
});
