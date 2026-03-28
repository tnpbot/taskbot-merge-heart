// ===========================
// Bot Behavior Settings
// ===========================
/** @type {SettingsConfig} */
const _settings = {
  languageCode: "EN", // "EN", "ES", "FR", "JP", "UA", "DE", "PT_BR"
  maxTasksPerUser: 20, // default number 20
  scrollSpeed: 20, // default number 20
  pauseAtTop: 100, // milliseconds to pause at top (2 seconds)
  showUsernameColor: true, // true or false
  headerFeature: "timer", // "timer", "commands", "text", "tasks-only"
  headerCustomText: "Custom Text", // headerFeature above must be "text"
  botResponsePrefix: "🤖💬 ", // default bot message prefix
  testMode: false, // true or false - for testing purposes
  streamerDisplayName: "tnp", // This will appear in "What's [name] working on? of 
                              // broadcaster_overlay.html for focused tasks"
  
   // NEW: Customizable message when focus session ends and break starts
   // Message displayed when focus timer ends
  focusSessionEndMessage: "🎉 Focus session complete! If needed, take a break to get some movement in and hydrate! ☕", 
};
