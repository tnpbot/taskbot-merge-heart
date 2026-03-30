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
  showTimer: true, // true = mods can use !timer command; false = timer disabled
  botResponsePrefix: "🤖💬 ", // default bot message prefix
  testMode: false, // true or false - for testing purposes
   // NEW: Customizable message when focus session ends and break starts
   // Message displayed when focus timer ends
  focusSessionEndMessage: "🎉 Focus session complete! If needed, take a break to get some movement in and hydrate! ☕",
  clockTimezone: "America/New_York", // IANA timezone string, e.g. "America/New_York", "Europe/London", "Asia/Tokyo"
  clockFormat: "24", // "12" for 12-hour (3:45 PM) or "24" for 24-hour (15:45)
};
