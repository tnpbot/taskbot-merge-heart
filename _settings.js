// ===========================
// Bot Behavior Settings
// ===========================
/** @type {SettingsConfig} */
const _settings = {
  languageCode: "EN", // "EN", "ES", "FR", "JP", "UA", "DE", "PT_BR"
  maxTasksPerUser: 10, // default number 10
  scrollSpeed: 60, // default number 20
  pauseAtTop: 100, // milliseconds to pause at top (2 seconds)
  showUsernameColor: true, // true or false
  headerTitle: "coworking session", // text shown on the left side of the header
  showTimer: true, // true = the !timer feature is enabled (mods can start/control it); false = the timer feature is disabled entirely (command ignored, timer never shown)
  botResponsePrefix: "🤖💬 ", // default bot message prefix
  testMode: false, // true or false - for testing purposes
  allowSharedChatCommands: false, // true = process commands relayed in from other channels via Twitch Shared Chat; false (default) = ignore them. Mods can also flip this live with !sharedchat on/off, which persists across reloads and overrides this default.
   // NEW: Customizable message when focus session ends and break starts
   // Message displayed when focus timer ends
  focusSessionEndMessage: "🎉 Focus session complete! If needed, take a break to get some movement in and hydrate! ☕",
  clockTimezone: "America/New_York", // IANA timezone string, e.g. "America/New_York", "Europe/London", "Asia/Tokyo"
  clockFormat: "24", // "12" for 12-hour (3:45 PM) or "24" for 24-hour (15:45)
  hints: [
    { cmd: "!task",        desc: "add a task" },
    { cmd: "!done",        desc: "mark complete" },
    { cmd: "!doneall",     desc: "finish all" },
    { cmd: "!delete",      desc: "delete a task" },
    { cmd: "!currenttask", desc: "spotlight it" },
    { cmd: "!edit",        desc: "edit a task" },
  ],
};
