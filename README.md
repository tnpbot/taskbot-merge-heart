<div align="center">
<img src="./images/slate.png" style="max-width: 200px;">
<img src="./images/espresso.png" style="max-width: 200px;">
<img src="./images/forest.png" style="max-width: 200px;">
<img src="./images/night.png" style="max-width: 00px;">
</div>

# Twitch Chatbot Multitask Task List Overlay

## What and Why?

A TaskList widget for Twitch TV which allows users to interact with the broadcaster's stream.
Viewers can create, edit, mark as done, and delete tasks from the list. This TaskList widget is designed to help streamers and their viewers to keep track of tasks, goals, or objectives during a stream. It is easy to use, and fast to setup. The TaskList widget is designed to be used in OBS or other streaming software.

## App Features ✨

- Free to use
- Easy setup
- Easy to customize
- Fast performance & super lightweight (19 kB bundle size)
- No coding required
- Customizable Multi-language support
- No third-party database required
- User features
  - user can create multiple tasks
  - user can focus on a task
  - user can edit tasks
  - user can mark tasks as done
  - user can delete tasks from their list
- Supports multiple languages translations
  - EN - English
  - ES - Español
  - FR - française
  - JP - 日本語
  - UA - українська
  - DE - German
  - PT_BR - Portuguese (Brazilian)

## Table of Contents

- [Installation Instructions](#installation-instructions)
  - [Download App](#download-app)
  - [Get Twitch oAuth](#get-twitch-oauth)
  - [Setup in OBS](#setup-in-obs)
- [Customization settings](#customization-settings)
  - [App Behavior Settings](#behavior-settings)
  - [Styles Settings](#styles-settings)
    - [Style Config Tool](#style-config-tool)
- [Commands](#commands)
  - [Commands for Everyone](#commands-for-everyone)
  - [Commands for Broadcasters and Moderators](#commands-for-broadcasters-and-moderators)
- [Aliases](#aliases)
  - [User Commands](#user-commands)
- [Credits](#credits)

## Installation Instructions

### Download App

1. **Downloading this App** - Download App by clicking on the green `Code` button and selecting `Download ZIP`.

2. **Unzip the Download** - Once the download is complete, unzip (aka open) the downloaded file to a location on your computer where you can easily access it and remember where it is.

### Get Twitch oAuth

1. **Log in to Twitch Developer Console**

   - Open and log into [https://dev.twitch.tv/console](https://dev.twitch.tv/console) using your web browser.
   - Log in using your bot account or your main Twitch account.

2. **Register The App with Twitch**

   - Once logged in, Click the **"Register Your Application"** button.
   - Enter a unique name for your application in the **Name** field. (e.g., "TaskListBot123")
   - In the **OAuth Redirect URLs** field, enter `http://localhost`
   - In the **Category** field, select **"Chat Bot"**.
   - For the **Client Type**, select **"Public"**.
   - Click the **"Create"** button to complete the registration.
   - Once the App is registered, you will see a **Client ID**. Copy this ID and save it for later. (do not share this ID with anyone)

3. **Generate an OAuth Access Token**

   - Copy the following URL and replace the `YOUR-APP-CLIENT-ID` with the **Client ID** from your registered app you had made in the previous step.

    ```txt
    https://id.twitch.tv/oauth2/authorize?response_type=token&client_id=YOUR-APP-CLIENT-ID&redirect_uri=http://localhost&scope=chat:read+chat:edit+user:bot
    ```

   - Open your browser and enter the URL containing your **Client ID** into the address bar. See [Twitch Authorize page Example](./images/twitch-authorize.png)
   - After granting Authorization, you'll be redirected to a blank page which will show an error message. This is normal.
   - The blank page will contain a URL in the address bar. This URL contains the access token you need. See [Access Token Example](./images/access-token-page.png)
   - Copy the token from the URL (it follows `#access_token=` and ends just before `&scope`).
   - Save this token in a safe place for the next step.

4. **Update Your \_auth.js File**

   - Navigate to the location where you unzipped the downloaded files.
   - Open the `_auth.js` file in a text editor. (Notepad works, but I recommend downloading VS Code to make it easier to read and edit the file.)
   - Replace `OAUTHTOKEN` with the access token you copied.
   - Replace `USERNAME` with your Twitch main username or bot username.
   - Replace `CHANNEL` with your Twitch channel name.

When you are done, it should look something like this:

```js
twitch_oauth = "138kjl2a0r3dpaf93as4d1fz",
twitch_username = "JujocoBot",
twitch_channel = "Jujoco_Dev",
```

### Setup in OBS

1. **Setup a Browser Source in OBS** - Open OBS and add a new `Browser Source` to your scene. Name it `TaskList overlay` or something you can easily remember.

2. **Select the Local file checkbox** - In the Browser Source settings, select `Local file` and then `Browse` to the location where you unzipped the downloaded files. Select the `tasklist.html` file and click `Open`.

3. **Set the Width and Height** - Next, in the Browser Source, set the width and height. I recommend 660px Width and 1600px Height. Adjust as needed.

4. **Done!** - Select OK to save!. Read the [Customization settings](#customization-settings) section to customize the MultiTask list widget and connect it to your Twitch chat.

<img width="480px" src="./images/obs-source-example.png"/>

## Customization settings

> IMPORTANT! — Any changes you make to `_auth.js`, `_settings.js`, `_configAdmin.js`, or `_configUser.js` directly will require you to click the `Refresh Cache of Current Page` button in the Browser Source to apply the changes. Changes made through the **Style Config tool** (`config.html`) are applied on next refresh automatically.

### Behavior Settings

Open the `_settings.js` file and modify the following settings to customized the TaskList behavior. Default values are provided below. If at any point you want to reset the styles to the default values you can find the default values below next to each style name.

`languageCode`: Default = **"EN"**

- **"EN"**: English translation
- **"ES"**: Spanish translation
- **"FR"**: French translation
- **"JP"**: Japanese translation
- **"UA"**: Ukrainian translation
- **"DE"**: German translation
- **"PT_BR"**: Brazilian Portuguese translation

`maxTasksPerUser`: Default = **10**

- **number**: A value between 1 - 20.

`scrollSpeed`: Default = **60**

- **number**: A value between 1 - 100.

`pauseAtTop`: Default = **100**

- **number**: Milliseconds to pause at the top of the list before scrolling again.

`showUsernameColor`: Default = **true**

- **true**: will show the user's Twitch chat color
- **false**: will show the color you set in the `usernameColor` style

`headerTitle`: Default = **"coworking session"**

- **string**: Text displayed on the left side of the header.

`showTimer`: Default = **true**

- **true**: Mods can use the `!timer` command to start a focus/break timer in the header. A focus cycle pill (🍅) is displayed in the header tracking completed focus periods for the session.
- **false**: Timer is disabled and the focus cycle pill is hidden.

`botResponsePrefix`: Default = **"🤖💬 "**

The prefix the bot uses to respond to users in chat.

`focusSessionEndMessage`: Default = **"🎉 Focus session complete! ..."**

- **string**: Message sent to chat when a focus timer session ends.

`clockTimezone`: Default = **"America/New_York"**

- **string**: [IANA timezone string](https://nodatime.org/TimeZones) (e.g. `"Europe/London"`, `"Asia/Tokyo"`). 

`clockFormat`: Default = **"24"**

- **"12"**: 12-hour format (e.g. 3:45 PM)
- **"24"**: 24-hour format (e.g. 15:45)

`testMode`: Default = **false**

- **false**: turn OFF test mode.
- **true**: turn ON test mode.

Use this to test the TaskList without affecting the real task list and visually see the style changes you make. When test mode is OFF, the TaskList will work as normal and remove any test tasks.

### Styles Settings

#### Style Config Tool

The easiest way to customize the overlay's appearance is to open **`config.html`** in your browser. It provides a live-preview editor where you can tweak all style values and save them directly back to `_styles.js` — no text editing required.

- **Open** — loads your current `_styles.js` file
- **Backup (⬇)** — downloads a timestamped copy of your current styles
- **Save** — writes your changes back to `_styles.js`

If you ever need to roll back to a saved backup, see **`restore-guide.html`** for step-by-step instructions.

#### Manual Styles (advanced)

You can also open `_styles.js` directly in a text editor. Default values are listed below.

##### Font Family - more available @ <https://fonts.google.com>

- headerFontFamily: "Roboto Mono"
- cardFontFamily: "Roboto Mono"

##### App Styles

- appBorderRadius: Default = **"5px"**
- appPadding: Default = **"8px"**
- appBackgroundImage: Default = **"url(../images/transparent-image.png)"**
- appBackgroundColor: Default = **"rgba(0, 0, 0, 0)"**

##### Header Styles

- headerDisplay: Default = **"flex"**
- headerBorderRadius: Default = **"6px"**
- headerMarginBottom: Default = **"6px"**
- headerBackgroundColor: Default = **"rgba(0, 0, 0, 0.7)"**
- headerFontSize: Default = **"20px"**
- headerFontColor: Default = **"#FFFFFF"**
- headerFontWeight: Default = **"normal"**

##### Card Styles

- cardGapBetween: Default = **"6px"**
- cardBorderRadius: Default = **"6px"**
- cardBackgroundColor: Default = **"rgba(0, 0, 0, 0.7)"**

##### Username Styles

- usernameFontSize: Default = **"18px"**
- usernameColor: Default = **"#FFFFFF"**
- usernameFontWeight: Default = **"normal"**

##### Task Styles

- taskFontSize: Default = **"16px"**
- taskFontColor: Default = **"#FFFFFF"**
- taskFontWeight: Default = **"normal"**
- taskDoneFontColor: Default = **"#aaaaaa"**
- taskDoneFontStyle: Default = **"#italic"**
- taskDoneTextDecoration: Default = **"line-through"**
- taskFocusFontColor: Default = **"#111111"**
- taskFocusBackgroundColor: Default = **"rgba(255, 255, 255, 0.7)"**
- taskFocusBorderRadius: Default = **"8px"**

## Commands

### Commands for Everyone

- `!task` or `!add` - Add task(s) (multiple tasks must be separated by a comma)

  - example: `!task read ch 3`
  - example: `!task prep for exam, walk cat, clean room`

- `!focus` - Focus on a specific task

  - example: `!focus 1`
  - example: `!focus 3`

- `!unfocus` - Clear the current focused task

  - example: `!unfocus`

- `!edit` - Edit a single task

  - example: `!edit 1 read ch. 4`
  - example: `!edit 2 walk bella`

- `!done` - Mark task(s) as done (multiple tasks must be separated by a comma)

  - example: `!done 1`
  - example: `!done 2, 3`

- `!doneall` - Mark all of your tasks as done

  - example: `!doneall`

- `!delete` - Delete task(s) (multiple tasks must be separated by a comma or use `all` to delete all tasks)

  - example: `!delete 1`
  - example: `!delete 2, 3`
  - example: `!delete all`

- `!check` - Check your remaining tasks

  - example: `!check`

- `!mytasks` or `!backlog` - List all of your current tasks

  - example: `!mytasks`

- `!currenttask` or `!ct` - Show your current focused task

  - example: `!currenttask`

- `!clearmydone` - Clear your own completed tasks

  - example: `!clearmydone`

- `!taskhelp` - Show available commands

  - example: `!taskhelp`

- `!credit` - Show the credits

  - example: `!credit`

### Commands for Broadcasters and Moderators

- `!timer` - Set the focus and break timer for a session (in minutes). Optionally specify number of cycles.

  - example: `!timer 60/10` — 60 min focus / 10 min break, 1 cycle
  - example: `!timer 90/15` — 90 min focus / 15 min break, 1 cycle
  - example: `!timer 40/10/3` — 40 min focus / 10 min break, 3 cycles

- `!timer pause` - Pause a running timer (focus or break)

  - example: `!timer pause`

- `!timer continue` - Resume a paused timer

  - example: `!timer continue`

- `!clearlist` - Clear all tasks from the list

  - example: `!clearlist`

- `!cleardone` - Clear all done tasks

  - example: `!cleardone`

- `!clearuser` - Remove all tasks from a User (the username is not case sensitive)

  - example: `!clearuser jujoco_dev` or `Jujoco_Dev`

- `!clearold` - Clear tasks older than a set number of days

  - example: `!clearold 7`

## Aliases

### User Commands

**add task commands:**

- `!task`
- `!t`
- `!add`
- `!añadir` (Spanish)
- `!ajouter` (French)
- `!追加` (Japanese)
- `!додати` (Ukrainian)
- `!aufgabe` (German)
- `!tarefa` (Brazilian Portuguese)

**focus commands:**

- `!focus`
- `!enfocar` (Spanish)
- `!concentrer` (French)
- `!集中` (Japanese)
- `!фокус` (Ukrainian)
- `!fokus` (German)
- `!focar` (Brazilian Portuguese)

**unfocus commands:**

- `!unfocus`
- `!desenfoque` (Spanish)
- `!défocaliser` (French)
- `!集中解除` (Japanese)
- `!розфокус` (Ukrainian)
- `!entfokus` (German)
- `!desfocar` (Brazilian Portuguese)

**edit task commands:**

- `!edit`
- `!editar` (Spanish)
- `!modifier` (French)
- `!編集` (Japanese)
- `!редагувати` (Ukrainian)
- `!bearbeiten` (German)
- `!editar` (Brazilian Portuguese)

**complete task commands:**

- `!done`
- `!hecho` (Spanish)
- `!terminé` (French)
- `!完了` (Japanese)
- `!готово` (Ukrainian)
- `!erledigt` (German)
- `!concluir` (Brazilian Portuguese)

**delete task commands:**

- `!delete`
- `!remove`
- `!clear`
- `!eliminar` (Spanish)
- `!supprimer` (French)
- `!削除` (Japanese)
- `!видалити` (Ukrainian)
- `!löschen` (German)
- `!deletar` (Brazilian Portuguese)

**check commands:**

- `!check`
- `!mytask`
- `!prüfen` (German)
- `!verificar` (Brazilian Portuguese)

**help commands:**

- `!taskhelp`
- `!ayuda` (Spanish)
- `!aide` (French)
- `!ヘルプ` (Japanese)
- `!допомога` (Ukrainian)
- `!hilfe` (German)
- `!ajuda` (Brazilian Portuguese)

**extra commands:**

- `!credit`
- `!crédito` (Spanish)
- `!crédit` (French)
- `!クレジット` (Japanese)
- `!кредит` (Ukrainian)
- `!kontakt` (German)
- `!credito` (Brazilian Portuguese)

## Credits

**Authors:** [**@Jujoco_Dev**](https://twitch.tv/Jujoco_Dev)

[**@teamnopants**](https://twitch.tv/teamnopants)

[**@afroduckling**](https://twitch.tv/afroduckling)

[**@mjheart**](https://twitch.tv/mjheart)

**Contributors:** [**Thank you to all the OG Contributors!**](https://github.com/jujoco/twitch-multitask-task-list-overlay/graphs/contributors)
