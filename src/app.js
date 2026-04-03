import { animateScroll } from "./animations/animateScroll.js";
import { fadeInOutText } from "./animations/fadeCommands.js";
import { celebrate, celebrateAll } from "./animations/celebrate.js";
import { loadStyles } from "./styleLoader.js";
import UserList from "./classes/UserList.js";
import { breakStartAudioEl, breakEndAudioEl } from "./Timer.js";

/** @typedef {import("./classes/User").default} User */

/**
 * @class App
 * @property {UserList} userList - The user list
 * @method render - Render the task list to the DOM
 * @method chatHandler - Handles chat commands and responses
 */
export default class App {
	#timerIntervalId = null;
	#timerPaused = false;
	#timerResumeFn = null;
	#ctTimer = null;
	#roster = {};
	#languageCode;
	#maxTasksPerUser;
	#headerTitle;
	#showTimer;
	#sessionCycles;
	#storeName;

	/**
	 * @constructor
	 * @param {string} storeName - The store name
	 */
	constructor(storeName) {
		this.userList = new UserList(storeName);
		loadStyles(_styles);
		this.#languageCode = _settings.languageCode;
		this.#maxTasksPerUser = _settings.maxTasksPerUser;
		this.#headerTitle = _settings.headerTitle || "";
		this.#showTimer = !!_settings.showTimer;
		this.#storeName = storeName;
		this.#sessionCycles = parseInt(localStorage.getItem(storeName + "_sessionCycles") || "0", 10);
	}

	/**
	 * Initial render the components to the DOM. Should only be called once.
	 * @returns {void}
	 */
	render() {
		this.renderTaskList();
		this.renderTaskHeader();
	}

	/**
	 * Render the task list to the DOM
	 * @returns {void}
	 */
	renderTaskList() {
		if (this.userList.users.length === 0) {
			return;
		}
		const fragment = document.createDocumentFragment();
		this.userList.getAllUsers().forEach((user) => {
			const cardEl = createUserCard(user);
			const list = cardEl.querySelector("ol");
			user.tasks.forEach((task) => {
				const listItem = document.createElement("li");
				listItem.classList.add("task");
				listItem.dataset.taskId = `${task.id}`;
				listItem.innerText = task.description;
				if (task.isComplete()) {
					listItem.classList.add("done");
				}
				if (task.isFocused()) {
					listItem.classList.add("focus");
				}
				list.appendChild(listItem);
			});
			fragment.appendChild(cardEl);
		});
		const primaryClone = fragment.cloneNode(true);
		const primaryContainer = document.querySelector(
			".task-container.primary"
		);
		primaryContainer.innerHTML = "";
		primaryContainer.appendChild(primaryClone);

		const secondaryClone = fragment.cloneNode(true);
		const secondaryContainer = document.querySelector(
			".task-container.secondary"
		);
		secondaryContainer.innerHTML = "";
		secondaryContainer.appendChild(secondaryClone);

		animateScroll();
		this.userList.getAllUsers().forEach(user => {
			this.renderUserCount(user.username);
			this.addToRoster(user.username);
			fetchPronouns(user.username);
		});
	}

	/**
	 * Render the task header to the DOM
	 * @returns {void}
	 */
	renderTaskHeader() {
		this.renderTaskCount();
		this.renderCycleCount();
		this.renderClock();
		// Set title text — always shown when timer is not active
		const titleEl = document.querySelector(".header-title");
		if (titleEl) titleEl.textContent = this.#headerTitle;
	}

	/**
	 * Render the task count to the DOM
	 * @returns {void}
	 */
	renderTaskCount() {
		const doneEl = document.querySelector(".task-count-done");
		if (doneEl) doneEl.textContent = this.userList.sessionDone.toString();
		this.renderActiveBadge();
	}

	renderActiveBadge() {
		const badge = document.getElementById("active-badge");
		if (!badge) return;
		const count = this.userList.getAllUsers()
			.flatMap(u => u.getTasks())
			.filter(t => !t.isComplete())
			.length;
		badge.textContent = count.toString();
	}

	renderCycleCount() {
		const pill = document.querySelector(".focus-cycle-pill");
		if (!pill) return;
		if (!this.#showTimer) {
			pill.classList.add("hidden");
			return;
		}
		pill.classList.remove("hidden");
		pill.querySelector(".focus-cycle-count").textContent = this.#sessionCycles.toString();
	}

	/**
	 * Start a focus session timer with optional cycle count
	 * @param {number} FocusDuration - The duration of the focus session in minutes
	 * @param {number} breakDuration - The duration of the break in minutes
	 * @param {number} cycles - The number of focus/break cycles to run (default: 1)
	 * @return {void}
	 */
	startTimer(FocusDuration = 0, breakDuration = 10, cycles = 1) {
		this.#timerIntervalId && clearInterval(this.#timerIntervalId);
		this.#timerPaused = false;
		this.#timerResumeFn = null;
		const timerEl = document.querySelector(".timer");
		const titleEl = document.querySelector(".header-title");
		/** @type {HTMLElement} */
		const timerTitleEl = timerEl.querySelector(".timer-title");
		const timerElement = timerEl.querySelector(".timer-countdown");

		// Show timer, hide title
		timerEl.classList.remove("hidden");
		if (titleEl) titleEl.classList.add("hidden");

		let currentCycle = 1;
		let totalCycles = cycles;
		let isInFocus = true;
		let timer = FocusDuration * 60;

		const updateTitle = (phase) => {
			if (totalCycles > 1) {
				fadeInOutText(timerTitleEl, `${phase} ${currentCycle}/${totalCycles}`);
			} else {
				fadeInOutText(timerTitleEl, phase);
			}
		};

		const sendFocusEndMessageToChat = () => {
			if (_settings.focusSessionEndMessage && _settings.focusSessionEndMessage.trim() !== "") {
				const focusEndEvent = new CustomEvent('focusSessionEnd', {
					detail: { message: _settings.focusSessionEndMessage }
				});
				window.dispatchEvent(focusEndEvent);
			}
		};

		updateTitle("Focus");

		this.#timerResumeFn = () => {
			updateTitle(isInFocus ? "Focus" : "Break");
			this.#timerIntervalId = setInterval(updateTimer, 1000);
			this.#timerPaused = false;
		};

		const updateTimer = () => {
			const minutes = Math.floor(timer / 60).toString().padStart(2, "0");
			const seconds = (timer % 60).toString().padStart(2, "0");
			timerElement.textContent = `${minutes}:${seconds}`;

			if (timer === 0) {
				if (isInFocus) {
					this.#sessionCycles++;
					localStorage.setItem(this.#storeName + "_sessionCycles", String(this.#sessionCycles));
					this.renderCycleCount();
					updateTitle("Break");
					timerElement.textContent = "00:00";
					breakStartAudioEl.play();
					sendFocusEndMessageToChat();
					timer = breakDuration * 60;
					isInFocus = false;
				} else {
					currentCycle++;
					if (currentCycle <= totalCycles) {
						updateTitle("Focus");
						timerElement.textContent = "00:00";
						breakEndAudioEl.play();
						timer = FocusDuration * 60;
						isInFocus = true;
					} else {
						// All cycles complete — restore title
						clearInterval(this.#timerIntervalId);
						this.#timerPaused = false;
						this.#timerResumeFn = null;
						breakEndAudioEl.play();
						timerEl.classList.add("hidden");
						if (titleEl) titleEl.classList.remove("hidden");
					}
				}
			} else {
				timer--;
			}
		};

		this.#timerIntervalId = setInterval(updateTimer, 1000);
	}

	/**
	 * Pause a running timer. Returns false if no timer is running or already paused.
	 * @returns {boolean}
	 */
	pauseTimer() {
		const timerEl = document.querySelector(".timer");
		if (!timerEl || timerEl.classList.contains("hidden") || this.#timerPaused) return false;
		clearInterval(this.#timerIntervalId);
		this.#timerIntervalId = null;
		this.#timerPaused = true;
		const timerTitleEl = /** @type {HTMLElement|null} */ (timerEl.querySelector(".timer-title"));
		if (timerTitleEl) fadeInOutText(timerTitleEl, "⏸ Paused");
		return true;
	}

	/**
	 * Resume a paused timer. Returns false if timer is not paused.
	 * @returns {boolean}
	 */
	resumeTimer() {
		if (!this.#timerPaused || !this.#timerResumeFn) return false;
		this.#timerResumeFn();
		return true;
	}

	/**
	 * Render the always-on live clock in the header right zone.
	 * @returns {void}
	 */
	renderClock() {
		const timeEl = document.querySelector(".header-right .clock-time");
		if (!timeEl) return;
		const tz = _settings.clockTimezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
		const use12 = (_settings.clockFormat || "12") === "12";
		const fmt = new Intl.DateTimeFormat("en-US", {
			timeZone: tz,
			hour: "numeric",
			minute: "2-digit",
			hour12: use12,
		});
		const tick = () => { timeEl.textContent = fmt.format(new Date()); };
		tick();
		setInterval(tick, 1000);
	}

	/**
	 * Handle unfocusing all tasks for a user
	 * @param {string} username 
	 */
	unfocusAllTasks(username) {
		// Remove focus class from all user's tasks
		document.querySelectorAll(`[data-user="${username}"] .task`).forEach(task => {
			task.classList.remove("focus");
		});
	}

	/**
	 * Handles chat commands and responses
	 * @param {string} username
	 * @param {string} command
	 * @param {string} message
	 * @param {{broadcaster: boolean, mod: boolean}} flags
	 * @param {{userColor: string, messageId: string}} extra
	 * @returns {{error: boolean, message: string}} - Response message
	 */
	chatHandler(username, command, message, flags, extra) {
		command = `!${command.toLowerCase()}`;
		let template = "";
		let responseDetail = "";

		try {
			// ADMIN COMMANDS
			if (isMod(flags)) {
				if (
					this.#showTimer &&
					_adminConfig.commands.timer.includes(command)
				) {
					const lowerMessage = message.toLowerCase().trim();

					// Handle pause
					if (lowerMessage === "pause") {
						const paused = this.pauseTimer();
						template = paused
							? _adminConfig.responseTo[this.#languageCode].timerPause
							: _adminConfig.responseTo[this.#languageCode].timerNotRunning;
						try { localStorage.setItem("timerCommand", JSON.stringify({ action: "pause" })); } catch (e) { }
						return respondMessage(template, username, responseDetail);
					}

					// Handle continue/resume
					if (lowerMessage === "continue" || lowerMessage === "resume") {
						const resumed = this.resumeTimer();
						template = resumed
							? _adminConfig.responseTo[this.#languageCode].timerContinue
							: _adminConfig.responseTo[this.#languageCode].timerNotPaused;
						try { localStorage.setItem("timerCommand", JSON.stringify({ action: "continue" })); } catch (e) { }
						return respondMessage(template, username, responseDetail);
					}

					// Parse timer command: !timer 40/10 or !timer 40/10/5
					const parts = message.split("/");
					const focusTime = parts[0];
					const breakTime = parts[1];
					const cycleCount = parts[2]; // Optional third parameter

					const focusDuration = parseInt(focusTime, 10);
					const breakDuration = parseInt(breakTime, 10) || 10;
					const cycles = parseInt(cycleCount, 10) || 1; // Default to 1 cycle if not specified

					if (
						isNaN(focusDuration) ||
						focusDuration < 0 ||
						isNaN(breakDuration) ||
						breakDuration < 0 ||
						isNaN(cycles) ||
						cycles < 1
					) {
						throw new Error("Invalid timer duration or cycle count");
					}

					this.startTimer(focusDuration, breakDuration, cycles);

					// Send command to standalone timer overlay - new 10/13/25 - tnp
					try {
						localStorage.setItem('timerCommand', JSON.stringify({
							action: 'start',
							message: message // This will be the full "40/10/5" string
						}));
						console.log('Timer command sent to overlay:', message);
					} catch (error) {
						console.error('Error sending timer command to overlay:', error);
					}


					// Update response message to include cycle info if multiple cycles
					if (cycles > 1) {
						template = _adminConfig.responseTo[this.#languageCode].timer + ` (${cycles} cycles) ⏲️`;
						responseDetail = `${focusTime}/${breakTime}`;
					} else {
						template = _adminConfig.responseTo[this.#languageCode].timer + " ⏲️";
						responseDetail = focusTime;
					}

					return respondMessage(template, username, responseDetail);
				}
				else if (_adminConfig.commands.clearList.includes(command)) {
					this.userList.clearUserList();
					this.clearListFromDOM();
					template = _adminConfig.responseTo[this.#languageCode].clearList;
					return respondMessage(template, username, responseDetail);
				}
				else if (_adminConfig.commands.clearDone.includes(command)) {
					const tasks = this.userList.clearDoneTasks();
					tasks.forEach(({ id }) => {
						this.deleteTaskFromDOM(id);
					});
					template = _adminConfig.responseTo[this.#languageCode].clearDone;
					return respondMessage(template, username, responseDetail);
				}
				else if (_adminConfig.commands.clearUser.includes(command)) {
					// new 10/3/25 - tnp - allow @ or no @ for username
					try {
						// Strip @ symbol if present (Twitch mentions include @)
						const targetUsername = message.replace(/^@/, '');

						const user = this.userList.deleteUser(targetUsername);
						this.deleteUserFromDOM(user);
						responseDetail = user.username;
						template = _adminConfig.responseTo[this.#languageCode].clearUser;
						return respondMessage(template, username, responseDetail);
					} catch (error) {
						// Handle user not found error
						template = _userConfig.responseTo[this.#languageCode].invalidCommand;
						responseDetail = `User "${message}" not found`;
						return respondMessage(template, username, responseDetail, true);
					}
				}
				// New 9/11/2025 - tnp !clearold
				else if (_adminConfig.commands.clearOld.includes(command)) {
					// Default to 0 if no argument provided (clears tasks from previous day)
					const days = message.trim() === "" ? 0 : parseInt(message, 10);

					if (isNaN(days) || days < 0) {
						throw new Error("Invalid number of days. Please provide a positive number.");
					}

					const deletedTasks = this.userList.clearOldTasks(days);

					// Remove deleted tasks from DOM
					deletedTasks.forEach(({ id }) => {
						this.deleteTaskFromDOM(id);
					});
					responseDetail = deletedTasks.length.toString();
					template = _adminConfig.responseTo[this.#languageCode].clearOld;
					return respondMessage(template, username, responseDetail);
				}
			}
			// ADD: Handle when non-mods try to use admin commands
			if (
				!isMod(flags) && (
					_adminConfig.commands.timer.includes(command) ||
					_adminConfig.commands.clearList.includes(command) ||
					_adminConfig.commands.clearDone.includes(command) ||
					_adminConfig.commands.clearUser.includes(command) ||
					_adminConfig.commands.clearOld.includes(command) // New 9/11/2025 - tnp
				)
			) {
				template = _userConfig.responseTo[this.#languageCode].invalidCommand;
				responseDetail = "You don't have permission to use this command";
				return respondMessage(template, username, responseDetail, true);
			}

			// USER COMMANDS
			if (_userConfig.commands.addTask.includes(command)) {
				// ADD TASK
				if (message === "") {
					throw new Error("Task description is empty");
				}
				let user =
					this.userList.getUser(username) ||
					this.userList.createUser(username, {
						userColor: extra.userColor,
					});
				// Split tasks by comma or semicolon, trim whitespace, and filter out empty tasks - tnp 8/28/25
				const taskDescriptions = message.split(/[,;]\s*/).map(task => task.trim()).filter(task => task.length > 0);
				if (
					user.getTasks().length + taskDescriptions.length >
					parseInt(this.#maxTasksPerUser.toString(), 10)
				) {
					template =
						_userConfig.responseTo[this.#languageCode].maxTasksAdded;
				}
				else {
					const tasks = this.userList.addUserTasks(
						username,
						taskDescriptions
					);
					tasks.forEach((task) => {
						this.addTaskToDOM(user, task);
					});
					responseDetail = taskDescriptions
						.map((task) => `📝 "${task}"`)
						.join(", ")
						.replace(/,([^,]*)$/, " &$1");;
					template = _userConfig.responseTo[this.#languageCode].addTask;
				}
			}
			else if (_userConfig.commands.editTask.includes(command)) {
				// EDIT TASK
				const whiteSpaceIdx = message.search(/(?<=\d)\s/); // number followed by space
				if (whiteSpaceIdx === -1) {
					throw new Error(
						"Task number or description format is invalid"
					);
				}
				const taskNumber = message.slice(0, whiteSpaceIdx);
				const newDescription = message.slice(whiteSpaceIdx + 1);
				const task = this.userList.editUserTask(
					username,
					parseTaskIndex(taskNumber),
					newDescription
				);
				this.editTaskFromDOM(task);
				responseDetail = taskNumber;
				template = _userConfig.responseTo[this.#languageCode].editTask;
			}
			else if (_userConfig.commands.focusTask.includes(command)) {
				// FOCUS TASK
				const taskIndex = parseTaskIndex(message);
				const task = this.userList.focusUserTask(username, taskIndex);
				this.focusTaskFromDOM(username, task.id);
				responseDetail = (taskIndex + 1).toString();
				template = _userConfig.responseTo[this.#languageCode].focusTask;
			}
			else if (_userConfig.commands.unfocusTask.includes(command)) {
				// UNFOCUS TASK
				this.userList.unfocusUserTasks(username);
				this.unfocusAllTasks(username);
				template = _userConfig.responseTo[this.#languageCode].unfocusTask;
			}
			else if (_userConfig.commands.finishTask.includes(command)) {
				// COMPLETE/DONE TASK - can handle multiple tasks separated by comma or semicolon - tnp 8/28/25
				const indices = message.split(/[,;]\s*/).reduce((acc, i) => {
					if (parseTaskIndex(i) >= 0) acc.push(parseTaskIndex(i));
					return acc;
				}, []);
				const tasks = this.userList.completeUserTasks(
					username,
					indices
				);
				tasks.forEach(({ id }) => {
					this.completeTaskFromDOM(id);
				});
				if (tasks.length === 0) {
					template = _userConfig.responseTo[this.#languageCode].noTaskFound;
				}
				else {
					responseDetail = tasks
						.map((task) => `✅ "${task.description}"`)
						.join(", ")
						.replace(/,([^,]*)$/, " &$1");

					template = _userConfig.responseTo[this.#languageCode].finishTask;
				}
			}
			else if (_userConfig.commands.undoTask.includes(command)) {
				// UNDO TASK - mark a completed task as active again
				const indices = message.split(/[,;]\s*/).reduce((acc, i) => {
					if (parseTaskIndex(i) >= 0) acc.push(parseTaskIndex(i));
					return acc;
				}, []);
				const tasks = this.userList.uncompleteUserTasks(
					username,
					indices
				);
				tasks.forEach(({ id }) => {
					this.uncompleteTaskFromDOM(id);
				});
				if (tasks.length === 0) {
					template = _userConfig.responseTo[this.#languageCode].noTaskFound;
				}
				else {
					responseDetail = tasks
						.map((task) => `↩️ "${task.description}"`)
						.join(", ")
						.replace(/,([^,]*)$/, " &$1");
					template = _userConfig.responseTo[this.#languageCode].undoTask;
				}
			}
			else if (_userConfig.commands.doneAll.includes(command)) {
				// COMPLETE ALL TASKS
				const tasks = this.userList.completeAllUserTasks(username);
				if (tasks.length === 0) {
					template = _userConfig.responseTo[this.#languageCode].noTaskFound;
				}
				else {
					tasks.forEach(({ id }) => {
						document.querySelectorAll(`[data-task-id="${id}"]`).forEach(el => {
							el.classList.add("done");
							el.classList.remove("focus");
						});
					});
					this.renderTaskCount();
					this.renderUserCount(username);
					celebrateAll(username);
					tasks.forEach(() => this.rosterDone(username));
					responseDetail = tasks.length.toString();
					template = _userConfig.responseTo[this.#languageCode].doneAll;
				}
			}
			else if (_userConfig.commands.deleteTask.includes(command)) {
				// DELETE/REMOVE TASK
				responseDetail = message;
				if (message.toLowerCase() === "all") {
					const user = this.userList.deleteUser(username);
					this.deleteUserFromDOM(user);
					template = _userConfig.responseTo[this.#languageCode].deleteAll;
				}
				else {
					// can handle multiple tasks separated by comma or semicolon - tnp 8/28/25
					const indices = message.split(/[,;]\s*/).reduce((acc, i) => {
						if (parseTaskIndex(i) >= 0) acc.push(parseTaskIndex(i));
						return acc;
					}, []);
					const tasks = this.userList.deleteUserTasks(
						username,
						indices
					);
					tasks.forEach(({ id }) => {
						this.deleteTaskFromDOM(id);
					});
					if (tasks.length === 0) {
						template =
							_userConfig.responseTo[this.#languageCode].noTaskFound;
					}
					else {
						template =
							_userConfig.responseTo[this.#languageCode].deleteTask;
					}
				}
			}

			else if (_userConfig.commands.clearUserDone.includes(command)) {
				// USER CLEAR THEIR OWN DONE TASKS -- new 9/18/2025 - tnp
				const deletedTasks = this.userList.clearUserDoneTasks(username);

				// Remove deleted tasks from DOM
				deletedTasks.forEach(({ id }) => {
					this.deleteTaskFromDOM(id);
				});
				responseDetail = deletedTasks.length.toString();
				template = _userConfig.responseTo[this.#languageCode].clearUserDone;
				return respondMessage(template, username, responseDetail);
			}

			else if (_userConfig.commands.currentTask.includes(command)) {
				// CURRENT TASK SPOTLIGHT
				const user = this.userList.getUser(username);
				const activeTasks = user ? user.tasks.filter(t => !t.isComplete()) : [];
				if (activeTasks.length === 0) {
					template = _userConfig.responseTo[this.#languageCode].noTaskFound;
				} else {
					const task = activeTasks.find(t => t.isFocused()) ?? activeTasks[0];
					this.showCurrentTaskFromDOM(username);
					responseDetail = task.description;
					template = _userConfig.responseTo[this.#languageCode].currentTask;
				}
			}
			else if (_userConfig.commands.myTasks.includes(command)) {
				// ALL TASKS SPOTLIGHT
				this.showAllTasksFromDOM(username);
				const taskMap = this.userList.checkUserTasks(username);
				const list = [];
				for (let [taskNumber, task] of taskMap) {
					list.push(`${taskNumber + 1}. ${task.description}`);
				}
				responseDetail = list.join(" | ");
				if (responseDetail === "") {
					template = _userConfig.responseTo[this.#languageCode].noTaskFound;
				} else {
					template = _userConfig.responseTo[this.#languageCode].myTasks;
				}
			}
			else if (_userConfig.commands.help.includes(command)) {
				// HELP COMMAND
				template = _userConfig.responseTo[this.#languageCode].help;
			}
			else if (_userConfig.commands.additional.includes(command)) {
				// ADDITIONAL COMMANDS
				template = _userConfig.responseTo[this.#languageCode].additional;
			}
			else {
				// INVALID COMMAND
				throw new Error("command not found");
			}

			return respondMessage(template, username, responseDetail);
		} catch (error) {
			return respondMessage(
				_userConfig.responseTo[this.#languageCode].invalidCommand,
				username,
				error.message,
				true
			);
		}
	}

	clearListFromDOM() {
		const primaryContainer = document.querySelector(
			".task-container.primary"
		);
		const secondaryContainer = document.querySelector(
			".task-container.secondary"
		);
		primaryContainer.innerHTML = "";
		secondaryContainer.innerHTML = "";
		const shelfTags = document.getElementById("shelf-tags");
		if (shelfTags) shelfTags.innerHTML = "";
		this.#roster = {};
		this.#sessionCycles = 0;
		localStorage.removeItem(this.#storeName + "_sessionCycles");
		this.renderTaskCount();
		this.renderCycleCount();
	}

	/**
	 * Add the task to the DOM
	 * @param {User} user
	 * @param {{description: string, id: string}} task
	 * @returns {void}
	 */
	addTaskToDOM(user, task) {
		const primaryContainer = document.querySelector(
			".task-container.primary"
		);
		const secondaryContainer = document.querySelector(
			".task-container.secondary"
		);
		const userCardEls = document.querySelectorAll(
			`[data-user="${user.username}"]`
		);
		if (userCardEls.length === 0) {
			const userCard = createUserCard(user);
			const clonedUserCard = userCard.cloneNode(true);
			primaryContainer.appendChild(userCard);
			secondaryContainer.appendChild(clonedUserCard);
		}
		const taskElement = document.createElement("li");
		taskElement.classList.add("task");
		taskElement.dataset.taskId = `${task.id}`;
		taskElement.innerText = task.description;
		const cloneTaskElement = taskElement.cloneNode(true);

		primaryContainer
			.querySelector(`[data-user="${user.username}"] .tasks`)
			.appendChild(taskElement);
		secondaryContainer
			.querySelector(`[data-user="${user.username}"] .tasks`)
			.appendChild(cloneTaskElement);

		this.renderTaskCount();
		this.renderUserCount(user.username);
		fetchPronouns(user.username);
		animateScroll();
	}

	/**
	 * Edit the task description in the DOM
	 * @param {{description: string, id: string}} task
	 * @returns {void}
	 */
	editTaskFromDOM(task) {
		const taskElements = document.querySelectorAll(`[data-task-id="${task.id}"]`);
		for (const taskElement of taskElements) {
			/** @type {HTMLElement} */ (taskElement).innerText = task.description;
		}
	}

	/**
	 * Complete the task in the DOM
	 * @param {string} taskId
	 * @returns {void}
	 */
	completeTaskFromDOM(taskId) {
		const taskElements = document.querySelectorAll(
			`[data-task-id="${taskId}"]`
		);
		let username = null;
		for (const taskElement of taskElements) {
			taskElement.classList.add("done");
			taskElement.classList.remove("focus");
			username ??= /** @type {HTMLElement|null} */ (taskElement.closest("[data-user]"))?.dataset.user ?? null;
		}
		celebrate(username);
		this.rosterDone(username);
		this.renderTaskCount();
		if (username) this.renderUserCount(username);
	}

	/**
	 * Uncomplete (undo done) a task in the DOM
	 * @param {string} taskId
	 * @returns {void}
	 */
	uncompleteTaskFromDOM(taskId) {
		const taskElements = document.querySelectorAll(
			`[data-task-id="${taskId}"]`
		);
		let username = null;
		for (const taskElement of taskElements) {
			taskElement.classList.remove("done");
			username ??= /** @type {HTMLElement|null} */ (taskElement.closest("[data-user]"))?.dataset.user ?? null;
		}
		this.renderTaskCount();
		if (username) this.renderUserCount(username);
	}

	/**
	 * Mark task as focused in the DOM.
	 * @param {string} username
	 * @param {string} taskId
	 * @returns {void}
	 */
	focusTaskFromDOM(username, taskId) {
		document.querySelectorAll(`[data-user="${username}"] .task`).forEach(task => {
			task.classList.remove("focus");
		});

		document.querySelectorAll(`[data-task-id="${taskId}"]`).forEach(task => {
			task.classList.add("focus");
		});
	}

	/**
	 * Delete the task in the DOM
	 * @param {string} taskId
	 * @returns {void}
	 */

	deleteTaskFromDOM(taskId) {
		const taskElements = document.querySelectorAll(`[data-task-id="${taskId}"]`);
		let username = null;
		for (const taskElement of taskElements) {
			username ??= /** @type {HTMLElement|null} */ (taskElement.closest("[data-user]"))?.dataset.user ?? null;
			if (taskElement.parentElement.children.length === 1) {
				taskElement.parentElement.parentElement.remove();
			} else {
				taskElement.remove();
			}
		}
		this.renderTaskCount();
		if (username) this.renderUserCount(username);
		animateScroll();
	}

	/**
	 * Add a user pill to the roster shelf if not already present
	 * @param {string} username
	 * @returns {void}
	 */
	addToRoster(username) {
		if (this.#roster[username]) return;
		const shelfTags = document.getElementById("shelf-tags");
		if (!shelfTags) return;
		const tag = document.createElement("div");
		tag.className = "stag";
		const nm = document.createElement("span");
		nm.textContent = username;
		const ct = document.createElement("span");
		ct.className = "done-ct";
		tag.append(nm, ct);
		shelfTags.appendChild(tag);
		this.#roster[username] = { tag, countEl: ct, done: 0 };

		this.#updateShelfOverflow(shelfTags);
	}

	/**
 * Toggle horizontal-scroll mode on the roster shelf once pills
 * exceed two rows of height.
 * @param {HTMLElement} shelfTags
 */
	#updateShelfOverflow(shelfTags) {
		// Only measure in wrap mode
		shelfTags.classList.remove("overflow");
		// scrollHeight > clientHeight means the pills wrapped past the CSS max-height
		if (shelfTags.scrollHeight > shelfTags.clientHeight + 2) {
			shelfTags.classList.add("overflow");
		}
	}
	/**
	 * Increment a user's done count on the roster shelf
	 * @param {string | null} username
	 * @returns {void}
	 */
	rosterDone(username) {
		if (!username) return;
		this.addToRoster(username);
		this.#roster[username].done++;
		this.#roster[username].countEl.textContent = " " + this.#roster[username].done + "✓";
	}

	/**
	 * Update the per-user task count display (X/Y done) on both card copies.
	 * @param {string} username
	 * @returns {void}
	 */
	renderUserCount(username) {
		const user = this.userList.getUser(username);
		if (!user) return;
		const total = user.tasks.length;
		const done = user.tasks.filter(t => t.isComplete()).length;
		const text = total ? `${done}/${total} done` : "";
		document.querySelectorAll(`[data-user="${username}"] .group-count`).forEach(el => {
			el.textContent = text;
		});
	}

	/**
	 * Show the current/focused task popup for a user
	 * @param {string} username
	 * @returns {void}
	 */
	showCurrentTaskFromDOM(username) {
		const user = this.userList.getUser(username);
		if (!user) return;
		const activeTasks = user.tasks.filter(t => !t.isComplete());
		if (!activeTasks.length) return;
		const task = activeTasks.find(t => t.isFocused()) ?? activeTasks[0];
		this.spawnSpotlight(username, "current task", [task.description]);
	}

	/**
	 * Show all active tasks popup for a user
	 * @param {string} username
	 * @returns {void}
	 */
	showAllTasksFromDOM(username) {
		const user = this.userList.getUser(username);
		if (!user) return;
		const activeTasks = user.tasks
			.map((t, i) => ({ num: i + 1, task: t }))
			.filter(({ task }) => !task.isComplete());
		if (!activeTasks.length) return;
		this.spawnSpotlight(
			username, "tasks",
			activeTasks.map(({ task }) => task.description),
			activeTasks.map(({ num }) => num)
		);
	}

	/**
	 * Spawn the centered spotlight card overlay
	 * @param {string} username
	 * @param {string} label
	 * @param {string[]} tasks
	 * @returns {void}
	 */
	spawnSpotlight(username, label, tasks, numbers = /** @type {number[]|null} */ (null)) {
		clearTimeout(this.#ctTimer);
		const overlay = document.getElementById("ct-overlay");
		if (!overlay) return;
		const old = overlay.querySelector(".ct-card");
		if (old) old.remove();

		const card = document.createElement("div");
		card.className = "ct-card";

		const who = document.createElement("div");
		who.className = "ct-who";
		who.textContent = username + "'s " + label;

		const lbl = document.createElement("div");
		lbl.className = "ct-label";
		lbl.textContent = "working on";

		card.append(who, lbl);

		if (tasks.length === 1) {
			const taskEl = document.createElement("div");
			taskEl.className = "ct-task";
			taskEl.textContent = tasks[0];
			card.appendChild(taskEl);
		} else {
			const ul = document.createElement("ul");
			ul.className = "ct-tasks";
			tasks.forEach((t, i) => {
				const li = document.createElement("li");
				const num = document.createElement("span");
				num.className = "ct-n";
				num.textContent = `#${numbers ? numbers[i] : i + 1} `;
				const tx = document.createElement("span");
				tx.textContent = t;
				li.append(num, tx);
				ul.appendChild(li);
			});
			card.appendChild(ul);
		}

		const icon = document.createElement("div");
		icon.className = "ct-icon";
		icon.textContent = "✨";
		card.appendChild(icon);

		overlay.appendChild(card);

		this.#ctTimer = setTimeout(() => {
			card.classList.add("leaving");
			setTimeout(() => card.remove(), 450);
		}, 6000);
	}

	/**
	 * Delete the user in the DOM
	 * @param {User} user
	 * @returns {void}
	 */
	deleteUserFromDOM(user) {
		// remove user card and reduce total tasks count
		const { username } = user;
		const userCardEls = document.querySelectorAll(
			`[data-user="${username}"]`
		);
		for (let card of userCardEls) {
			card.remove();
		}
		this.renderTaskCount();
	}
}

/**
 * Responds with a formatted message
 * @param {string} template - The response template
 * @param {string} username - The username of the user
 * @param {string} message - The message to replace in the template
 * @param {boolean} error - If the response is an error
 * @returns {{message: string, error: boolean}}
 */
function respondMessage(template, username, message, error = false) {
	return {
		message: _settings.botResponsePrefix + template.replace("{user}", username).replace("{message}", message),
		error,
	};
}

/**
 * Check if the user is a mod or broadcaster
 * @param {{broadcaster: boolean, mod: boolean}} flags
 * @returns {boolean}
 */
function isMod(flags) {
	return flags.broadcaster || flags.mod;
}

/**
 * Parse the task index
 * @param {string} index
 * @returns {number}
 */
function parseTaskIndex(index) {
	return parseInt(index, 10) - 1;
}

/**
 * Create a user card element
 * @param {{username: string, userColor: string}} user
 * @returns {HTMLDivElement}
 */
function createUserCard({ username, userColor }) {
	const cardEl = document.createElement("div");
	cardEl.classList.add("card");
	cardEl.dataset.user = username;

	const header = document.createElement("div");
	header.classList.add("group-header");

	const userNameSpan = document.createElement("span");
	userNameSpan.classList.add("username");
	userNameSpan.innerText = username;
	userNameSpan.style.color = _settings.showUsernameColor ? userColor : "";

	const pronounEl = document.createElement("span");
	pronounEl.classList.add("pronouns-tag");
	pronounEl.style.display = "none";

	const countEl = document.createElement("span");
	countEl.classList.add("group-count");

	header.append(userNameSpan, pronounEl, countEl);
	cardEl.appendChild(header);

	const list = document.createElement("ol");
	list.classList.add("tasks");
	cardEl.appendChild(list);
	return cardEl;
}

/** @type {Record<string, string|null>} */
const _pronounCache = {};
const _PRONOUN_MAP = {
	"aeaer": "ae/aer", "eey": "e/ey", "faefaer": "fae/faer",
	"heher": "he/her", "hehim": "he/him", "heshe": "he/she",
	"hethem": "he/them", "itits": "it/its", "other": "other",
	"sheher": "she/her", "shethey": "she/they", "theythem": "they/them",
	"ziehir": "zie/hir", "any": "any", "ask": "ask", "avoid": "avoid/name",
};

/**
 * Fetch pronouns for a user from pronouns.alejo.io and update their card.
 * Results are cached; silently no-ops if the API is unavailable.
 * @param {string} username
 * @returns {Promise<void>}
 */
async function fetchPronouns(username) {
	if (_pronounCache[username] !== undefined) return;
	_pronounCache[username] = null;
	try {
		const r = await fetch(`https://pronouns.alejo.io/api/users/${username}`);
		const d = await r.json();
		if (d && d.length && d[0].pronoun_id) {
			const pronoun = _PRONOUN_MAP[d[0].pronoun_id] || d[0].pronoun_id;
			_pronounCache[username] = pronoun;
			document.querySelectorAll(`[data-user="${username}"] .pronouns-tag`).forEach(el => {
				/** @type {HTMLElement} */ (el).textContent = pronoun;
				/** @type {HTMLElement} */ (el).style.display = "";
			});
		}
	} catch (_) {
		// API down or user not found — skip silently
	}
}