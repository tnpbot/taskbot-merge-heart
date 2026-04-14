/**
 * @typedef {Object} AuthConfig
 * @property {string} twitch_oauth - The Twitch oauth token
 * @property {string} twitch_channel - The Twitch channel
 * @property {string} twitch_username - The Twitch username
 */

/**
 * @typedef {Object} SettingsConfig
 * @property {string} languageCode - The language code
 * @property {number} maxTasksPerUser - The max number of tasks per user
 * @property {number} scrollSpeed - The scroll speed
 * @property {number} pauseAtTop - Milliseconds to pause at top
 * @property {boolean} showUsernameColor - Whether to show username color
 * @property {string} headerTitle - Text shown on the left side of the header
 * @property {boolean} showTimer - Whether the !timer command is enabled
 * @property {string} botResponsePrefix - The bot response prefix
 * @property {boolean} testMode - Whether test mode is enabled
 * @property {string} focusSessionEndMessage - Custom message when focus session ends and break starts
 * @property {string} clockTimezone - IANA timezone string for the live clock
 * @property {string} clockFormat - "12" or "24" hour clock format
 * @property {{cmd: string, desc: string}[]} [hints] - Command hint items shown in the hints strip
 */

/**
 * @typedef {Object} StyleConfig
 * @property {string} headerFontFamily - The header font family
 * @property {string} cardFontFamily - The card font family
 * @property {string} appBorderRadius - The app border radius
 * @property {string} appPadding - The app padding
 * @property {string} appBackgroundImage - The app background image
 * @property {string} appBackgroundColor - The app background color
 * @property {string} headerDisplay - The header display
 * @property {string} headerBorderRadius - The header border radius
 * @property {string} headerPadding - The header padding
 * @property {string} headerMarginBottom - The header margin bottom
 * @property {string} headerBackgroundColor - The header background color
 * @property {string} headerFontSize - The header font size
 * @property {string} headerFontColor - The header font color
 * @property {string} headerFontWeight - The header font weight
 * @property {string} [headerLeftFontWeight] - Override font weight for header left side
 * @property {string} [headerRightFontWeight] - Override font weight for header right side
 * @property {string} [headerPillFontWeight] - Override font weight for header pills
 * @property {string} cardGapBetween - The card gap between
 * @property {string} cardBorderRadius - The card border radius
 * @property {string} cardBackgroundColor - The card background color
 * @property {string} cardPadding - The card padding
 * @property {string} usernameFontSize - The username font size
 * @property {string} usernameColor - The username color
 * @property {string} usernameFontWeight - The username font weight
 * @property {string} taskFontSize - The task font size
 * @property {string} taskFontColor - The task font color
 * @property {string} taskFontWeight - The task font weight
 * @property {string} taskDoneFontColor - The task done font color
 * @property {string} taskDoneFontStyle - The task done font style
 * @property {string} taskDoneTextDecoration - The task done text decoration
 * @property {string} taskFocusFontColor - The focus task font color
 * @property {string} taskFocusBackgroundColor - The focus task background color
 * @property {string} taskFocusBorderRadius - The focus task border radius
 * @property {string} [spotlightFontFamily] - Spotlight card font family
 * @property {string} [spotlightBg] - Spotlight card background
 * @property {string} [spotlightBorderColor] - Spotlight card border color
 * @property {string} [spotlightBorderRadius] - Spotlight card border radius
 * @property {string} [spotlightAccentStart] - Spotlight accent gradient start color
 * @property {string} [spotlightAccentEnd] - Spotlight accent gradient end color
 * @property {string} [spotlightWhoColor] - Spotlight username and task-number color
 * @property {string} [spotlightTaskSize] - Spotlight task text font size
 * @property {string} [hintsDisplay] - Show/hide the hints strip ("flex" or "none")
 * @property {string} [hintsCmdColor] - Command text color in hints strip
 * @property {string} [hintsCmdSize] - Command text font size in hints strip
 * @property {string} [hintsDescColor] - Description text color in hints strip
 * @property {string} [hintsDescSize] - Description text font size in hints strip
 * @property {string} [shelfDisplay] - Show/hide the session tray ("block" or "none")
 * @property {string} [shelfLabelColor] - Session tray label color
 * @property {string} [shelfPillColor] - Session tray pill text color
 * @property {string} [shelfPillBg] - Session tray pill background color
 * @property {string} [shelfPillBorder] - Session tray pill border color
 * @property {string} [shelfFontSize] - Session tray pill font size
 */

/**
 * @typedef {Object} AdminConfig
 * @property {Object} commands - The admin commands
 * @property {Object} responseTo - The admin response to
 */

/**
 * @typedef {Object} UserConfig
 * @property {Object} commands - The user commands
 * @property {Object} responseTo - The user response to
 */
