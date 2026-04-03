// ==========================
// Bot Visual Style Settings
// ==========================
/** @type {StyleConfig} */
const _styles = {
  // Font Family: available @ https://fonts.google.com
  headerFontFamily: "Fredoka",
  cardFontFamily: "Fredoka",



  // App Styles
  appBorderRadius: "20px", // px value
  appPadding: "10px", // px value
  appBackgroundImage: "url(../images/transparent-image.png)", // image must go in images folder
  appBackgroundColor: "rgba(18,20,32,0.96)", // rgba value https://rgbcolorpicker.com

  //  Header Styles
  headerDisplay: "flex", // "none" to hide header or "flex" to show header
  headerBorderRadius: "15px", // px value
  headerMarginBottom: "6px", // px value
  headerPadding: "12px", // px value
  headerBackgroundColor: "#1a1c2e", // rgba value https://rgbcolorpicker.com/
  headerFontSize: "18px", // px value
  headerFontColor: "#e2e4f0", // hex value
  headerFontWeight: "normal", // "normal", "lighter", "bold" — applies to all header elements unless overridden below
  headerLeftFontWeight: "bold", // overrides font-weight for the left side (title). Leave blank to inherit headerFontWeight
  headerRightFontWeight: "", // overrides font-weight for the right side (clock, timer). Leave blank to inherit headerFontWeight
  headerPillFontWeight: "400", // overrides font-weight for done/pomo pills. Leave blank to inherit headerFontWeight

  // Card Styles
  cardGapBetween: "8px", // px value
  cardBorderRadius: "0px", // px value
  cardPadding: "15px", // px value
  cardBackgroundColor: "rgba(22,24,40,0.95)", // rgba value https://rgbcolorpicker.com/

  // Username Styles
  usernameFontSize: "14px", // px value
  usernameColor: "#a0a8e0", // hex value
  usernameFontWeight: "normal", // "normal", "lighter", "bold"

  // Task Styles
  taskFontSize: "12px", // px value
  taskFontColor: "#e2e4f0", // hex value
  taskFontWeight: "normal", // "normal", "lighter", "bold"

  taskDoneFontColor: "rgba(226,228,240,0.38)", // hex value
  taskDoneFontStyle: "italic", // "italic" or "normal"
  taskDoneTextDecoration: "line-through", // "line-through" or "none"

  taskFocusFontColor: "#e2e4f0", // hex value
  taskFocusBackgroundColor: "rgba(160,168,224,0.45)", // rgba value https://rgbcolorpicker.com/
  taskFocusBorderRadius: "9px", // hex value

  // ==========================
  // NEW: Broadcaster Focus Overlay Styles
  // ==========================
  broadcasterOverlay: {
    // Font Settings
    fontFamily: "Fredoka, sans-serif", // Font family for the overlay
    fontSize: "14px", // Base font size
    headerFontSize: "18px", // Font size for "What's [Streamer] working on?" text
    taskFontSize: "12px", // Font size for the focused task text

    // Color Settings
    backgroundColor: "rgba(45, 45, 45, 0.9)", // Background color of the overlay
    headerColor: "#888", // Color of the "What's [Streamer] working on?" text
    taskColor: "#fff", // Color of the focused task text

    // Layout Settings
    borderRadius: "8px", // Border radius of the overlay
    border: "1px solid rgba(255, 255, 255, 0.2)", // Border style
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)", // Drop shadow
  }
};