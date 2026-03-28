import { animateScroll } from "./animations/animateScroll.js";
import { fadeInOutText } from "./animations/fadeCommands.js";
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
	#languageCode;
	#maxTasksPerUser;
	#headerFeature;
	#headerCustomText;
	#streamerDisplayName;

	/**
	 * @constructor
	 * @param {string} storeName - The store name
	 */
	constructor(storeName) {
		this.userList = new UserList(storeName);
		loadStyles(_styles);
		this.#languageCode = _settings.languageCode;
		this.#maxTasksPerUser = _settings.maxTasksPerUser;
		this.#headerFeature = _settings.headerFeature;
		this.#headerCustomText = _settings.headerCustomText;
		this.#streamerDisplayName = _settings.streamerDisplayName || "Streamer";
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
	}

	/**
	 * Render the task header to the DOM
	 * @returns {void}
	 */
	renderTaskHeader() {
		this.renderTaskCount();
		if (this.#headerFeature.toLowerCase() === "timer") {
			this.renderTimer();
		}
		else if (this.#headerFeature.toLowerCase() === "commands") {
			this.renderCommandTips();
		}
		else if (this.#headerFeature.toLowerCase() === "text") {
			this.renderCustomText(this.#headerCustomText);
		}
	}

	/**
	 * Render the task count to the DOM
	 * @returns {void}
	 */
	renderTaskCount() {
		let completedTasksCount = this.userList.tasksCompleted;
		let totalTasksCount = this.userList.totalTasks;
		/** @type {HTMLElement} */
		const totalTasksElement = document.querySelector(".task-count");
		totalTasksElement.innerText = `${completedTasksCount}/${totalTasksCount}`;
	}

	/**
	 * Render Pomodoro timer to the DOM
	 * @returns {void}
	 */
	renderTimer() {
		const timerEl = document.querySelector(".timer");
		timerEl.classList.remove("hidden");
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
		const timerEl = document.querySelector(".timer");
		/** @type {HTMLElement} */
		const timerTitleEl = timerEl.querySelector(".timer-title");
		const timerElement = timerEl.querySelector(".timer-countdown");
		
		// Initialize cycle tracking
		let currentCycle = 1;
		let totalCycles = cycles;
		let isInFocus = true;
		let timer = FocusDuration * 60;
		
		// Update the title to show cycle information if multiple cycles
		const updateTitle = (phase) => {
			if (totalCycles > 1) {
				fadeInOutText(timerTitleEl, `${phase} ${currentCycle}/${totalCycles}`);
			} else {
				fadeInOutText(timerTitleEl, phase);
			}
		};
		
		// NEW: Function to send focus session end message to chat
		const sendFocusEndMessageToChat = () => {
			if (_settings.focusSessionEndMessage && _settings.focusSessionEndMessage.trim() !== "") {
				// The message will be sent to chat via the global client instance
				// We'll dispatch a custom event that the main app can listen for
				const focusEndEvent = new CustomEvent('focusSessionEnd', {
					detail: { message: _settings.focusSessionEndMessage }
				});
				window.dispatchEvent(focusEndEvent);
			}
		};
		
		updateTitle("Focus");
		
		const updateTimer = () => {
			const minutes = Math.floor(timer / 60)
				.toString()
				.padStart(2, "0");
			const seconds = (timer % 60).toString().padStart(2, "0");
			timerElement.textContent = `${minutes}:${seconds}`;
			
			if (timer === 0) {
				if (isInFocus) {
					// Focus session ended, start break
					updateTitle("Break");
					timerElement.textContent = "00:00";
					breakStartAudioEl.play();
					
					// NEW: Send the customizable focus session end message to chat
					sendFocusEndMessageToChat();
					
					timer = breakDuration * 60;
					isInFocus = false;
				} else {
					// Break ended
					currentCycle++;
					if (currentCycle <= totalCycles) {
						// Start next focus cycle
						updateTitle("Focus");
						timerElement.textContent = "00:00";
						breakEndAudioEl.play(); // Break End Sound - tnp - 9/3/25
						timer = FocusDuration * 60;
						isInFocus = true;
					} else {
						// All cycles completed
						clearInterval(this.#timerIntervalId);
						fadeInOutText(timerTitleEl, "Complete!");
						timerElement.textContent = "00:00";
						breakEndAudioEl.play(); // Break End Sound - tnp - 9/3/25
						return;
					}
				}
			} else {
				timer--;
			}
		};
		
		this.#timerIntervalId = setInterval(updateTimer, 1000);
	}

	/**
	 * Render command tips to the DOM
	 * @returns {void}
	 */
	renderCommandTips() {
		const tips = ["!task", "!edit #", "!done #", "!delete #","!focus #","!unfocus", "!check", "!help"];
		const commandTipEl = document.querySelector(".command-tips");
		commandTipEl.classList.remove("hidden");

		// Check if interval is already running
		if (commandTipEl.dataset.intervalRunning === "true") {
			return; // Exit if already running
		}

		let tipIdx = 0;

		// Set initial command
		const commandCodeEl = commandTipEl.querySelector(".command-code");
		fadeInOutText(commandCodeEl, tips[tipIdx]);

		// Mark as running
		commandTipEl.dataset.intervalRunning = "true";

		setInterval(() => {
			tipIdx = (tipIdx + 1) % tips.length;
			const commandCodeEl = commandTipEl.querySelector(".command-code");
			fadeInOutText(commandCodeEl, tips[tipIdx]);
		}, 6000);
	}

	/**
	 * Render custom text to the DOM
	 * @param {string} text - The custom text to display
	 * @returns {void}
	 */
	renderCustomText(text) {
		document.querySelector(".custom-header").classList.remove("hidden");
		document.querySelector(".custom-text").textContent = text;
	}

	/**
	 * Handle broadcaster focus task display in separate overlay
	 * @param {string} username 
	 * @param {string} taskId 
	 * @param {string} taskDescription 
	 * @param {boolean} isBroadcaster 
	 */
	handleBroadcasterFocus(username, taskId, taskDescription, isBroadcaster) {
		// Only show in overlay if it's the broadcaster
		if (isBroadcaster) {
			// Send command via localStorage for separate browser source
			const command = {
				action: 'show',
				taskDescription: taskDescription,
				taskId: taskId,
				streamerName: this.#streamerDisplayName, // Use custom display name from settings
				timestamp: Date.now()
			};
			
			try {
				localStorage.setItem('broadcasterFocusCommand', JSON.stringify(command));
				console.log('Sent broadcaster focus command:', command);
			} catch (error) {
				console.error('Error sending broadcaster focus command:', error);
			}
			
			// Also try direct window communication as fallback
			if (window.broadcasterFocusOverlay) {
				window.broadcasterFocusOverlay.showFocusedTask(
					taskDescription, 
					taskId, 
					this.#streamerDisplayName
				);
			}
		}
	}

	/**
	 * Handle hiding broadcaster focus overlay
	 * @param {string} taskId 
	 * @param {boolean} isBroadcaster 
	 */
	handleBroadcasterUnfocus(taskId, isBroadcaster) {
		if (isBroadcaster) {
			// Send command via localStorage for separate browser source
			const command = {
				action: 'hide',
				taskId: taskId,
				timestamp: Date.now()
			};
			
			try {
				localStorage.setItem('broadcasterFocusCommand', JSON.stringify(command));
				console.log('Sent broadcaster unfocus command:', command);
			} catch (error) {
				console.error('Error sending broadcaster unfocus command:', error);
			}
			
			// Also try direct window communication as fallback
			if (window.broadcasterFocusOverlay) {
				window.broadcasterFocusOverlay.hideFocusedTask(taskId);
			}
		}
	}

	/**
	 * Handle unfocusing all tasks for a user
	 * @param {string} username 
	 * @param {boolean} isBroadcaster 
	 */
	unfocusAllTasks(username, isBroadcaster = false) {
		// Remove focus class from all user's tasks
		document.querySelectorAll(`[data-user="${username}"] .task`).forEach(task => {
			task.classList.remove("focus");
		});

		// Hide broadcaster overlay if broadcaster is unfocusing
		if (isBroadcaster) {
			const command = {
				action: 'hide',
				taskId: null,
				timestamp: Date.now()
			};
			
			try {
				localStorage.setItem('broadcasterFocusCommand', JSON.stringify(command));
				console.log('Sent broadcaster unfocus all command:', command);
			} catch (error) {
				console.error('Error sending broadcaster unfocus all command:', error);
			}
			
			// Also try direct window communication as fallback
			if (window.broadcasterFocusOverlay) {
				window.broadcasterFocusOverlay.hideFocusedTask();
			}
		}
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
					this.#headerFeature.toLowerCase() === "timer" &&
					_adminConfig.commands.timer.includes(command)
				) {
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
					
					// NEW: Hide broadcaster focus overlay when clearing all tasks
					const command_clear = {
						action: 'hide',
						taskId: null,
						timestamp: Date.now()
					};
					
					try {
						localStorage.setItem('broadcasterFocusCommand', JSON.stringify(command_clear));
						console.log('Sent broadcaster clear focus command:', command_clear);
					} catch (error) {
						console.error('Error sending broadcaster clear focus command:', error);
					}
					
					// Also try direct window communication as fallback
					if (window.broadcasterFocusOverlay) {
						window.broadcasterFocusOverlay.hideFocusedTask();
					}
					
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
						
						// Check if the user being cleared has any focused tasks
						const userTasks = document.querySelectorAll(`[data-user="${targetUsername}"] .task.focus`);
						const hadFocusedTask = userTasks.length > 0;
						
						const user = this.userList.deleteUser(targetUsername);
						this.deleteUserFromDOM(user);
						
						// Hide broadcaster overlay if deleted user had focused task
						if (hadFocusedTask && flags.broadcaster) {
							const command = {
								action: 'hide',
								taskId: null,
								timestamp: Date.now()
							};
							
							try {
								localStorage.setItem('broadcasterFocusCommand', JSON.stringify(command));
								console.log('Sent broadcaster clearuser unfocus command:', command);
							} catch (error) {
								console.error('Error sending broadcaster clearuser unfocus command:', error);
							}
							
							if (window.broadcasterFocusOverlay) {
								window.broadcasterFocusOverlay.hideFocusedTask();
							}
						}
						
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
					
					// Hide broadcaster overlay if any focused tasks were deleted
					const hadFocusedTasks = deletedTasks.some(task => 
						document.querySelector(`[data-task-id="${task.id}"].focus`)
					);
					
					if (hadFocusedTasks && flags.broadcaster) {
						const command_clear = {
							action: 'hide',
							taskId: null,
							timestamp: Date.now()
						};
						
						try {
							localStorage.setItem('broadcasterFocusCommand', JSON.stringify(command_clear));
							console.log('Sent broadcaster clearold unfocus command:', command_clear);
						} catch (error) {
							console.error('Error sending broadcaster clearold unfocus command:', error);
						}
						
						if (window.broadcasterFocusOverlay) {
							window.broadcasterFocusOverlay.hideFocusedTask();
						}
					}
					
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
				
				// NEW: Handle broadcaster focus overlay
				if (flags.broadcaster) {
					this.handleBroadcasterFocus(username, task.id, task.description, true);
				}
				
				responseDetail = (taskIndex + 1).toString();
				template = _userConfig.responseTo[this.#languageCode].focusTask;
			}
			else if (_userConfig.commands.unfocusTask.includes(command)) {
				// NEW: UNFOCUS TASK
				this.unfocusAllTasks(username, flags.broadcaster);
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
				tasks.forEach(({ id, description }) => {
					this.completeTaskFromDOM(id);
					// NEW: Hide broadcaster overlay when task completed
					if (flags.broadcaster) {
						this.handleBroadcasterUnfocus(id, true);
					}
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
			else if (_userConfig.commands.deleteTask.includes(command)) {
				// DELETE/REMOVE TASK
				responseDetail = message;
				if (message.toLowerCase() === "all") {
					const user = this.userList.deleteUser(username);
					this.deleteUserFromDOM(user);
					// NEW: Hide broadcaster overlay if broadcaster deleted all tasks
					if (flags.broadcaster) {
						this.handleBroadcasterUnfocus(null, true);
					}
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
					tasks.forEach(({ id, description }) => {
						this.deleteTaskFromDOM(id);
						// NEW: Hide broadcaster overlay when task deleted
						if (flags.broadcaster) {
							this.handleBroadcasterUnfocus(id, true);
						}
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
				
				// Hide broadcaster overlay if user cleared their own focused completed task
				const hadFocusedTasks = deletedTasks.some(task => 
					document.querySelector(`[data-task-id="${task.id}"].focus`)
				);
				
				if (hadFocusedTasks && flags.broadcaster) {
					const command_clear = {
						action: 'hide',
						taskId: null,
						timestamp: Date.now()
					};
					
					try {
						localStorage.setItem('broadcasterFocusCommand', JSON.stringify(command_clear));
						console.log('Sent broadcaster user cleardone unfocus command:', command_clear);
					} catch (error) {
						console.error('Error sending broadcaster user cleardone unfocus command:', error);
					}
					
					if (window.broadcasterFocusOverlay) {
						window.broadcasterFocusOverlay.hideFocusedTask();
					}
				}
				
				responseDetail = deletedTasks.length.toString();
				template = _userConfig.responseTo[this.#languageCode].clearUserDone;
				return respondMessage(template, username, responseDetail);
			}

			else if (_userConfig.commands.check.includes(command)) {
				// CHECK TASKS
				const taskMap = this.userList.checkUserTasks(username);
				const list = [];
				for (let [taskNumber, task] of taskMap) {
					list.push(`📝 ${taskNumber + 1}. ${task.description}`);
				}
				responseDetail = list.join(" ");
				if (responseDetail === "") {
					template = _userConfig.responseTo[this.#languageCode].noTaskFound;
				}
				else {
					template = _userConfig.responseTo[this.#languageCode].check;
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
		this.renderTaskCount();
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
			taskElement.innerText = task.description;
		}
		
		// NEW: Update broadcaster overlay if this task is currently focused
		if (document.querySelector(`[data-task-id="${task.id}"].focus`)) {
			const command = {
				action: 'update', // New action type for overlay updates
				taskDescription: task.description,
				taskId: task.id,
				timestamp: Date.now()
			};
			
			try {
				localStorage.setItem('broadcasterFocusCommand', JSON.stringify(command));
				console.log('Sent broadcaster edit update command:', command);
			} catch (error) {
				console.error('Error sending broadcaster edit update command:', error);
			}
			
			// Also try direct window communication as fallback
			if (window.broadcasterFocusOverlay) {
				window.broadcasterFocusOverlay.updateFocusedTask(task.description, task.id);
			}
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
		for (const taskElement of taskElements) {
			taskElement.classList.add("done");
			taskElement.classList.remove("focus");
		}
		this.renderTaskCount();
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
		let wasFocused = false;
		
		for (const taskElement of taskElements) {
			// Check if this task was focused before deletion
			if (taskElement.classList.contains('focus')) {
				wasFocused = true;
			}
			
			if (taskElement.parentElement.children.length === 1) {
				taskElement.parentElement.parentElement.remove();
			} else {
				taskElement.remove();
			}
		}
		
		// NEW: Hide broadcaster overlay if focused task was deleted
		if (wasFocused) {
			const command = {
				action: 'hide',
				taskId: taskId,
				timestamp: Date.now()
			};
			
			try {
				localStorage.setItem('broadcasterFocusCommand', JSON.stringify(command));
				console.log('Sent broadcaster delete unfocus command:', command);
			} catch (error) {
				console.error('Error sending broadcaster delete unfocus command:', error);
			}
			
			if (window.broadcasterFocusOverlay) {
				window.broadcasterFocusOverlay.hideFocusedTask(taskId);
			}
		}
		this.renderTaskCount();
		animateScroll();
	}

	/**
	 * Delete the user in the DOM
	 * @param {User} user
	 * @returns {void}
	 */
	deleteUserFromDOM(user) {
		// remove user card and reduce total tasks count
		const { username, tasks } = user;
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
	const userNameDiv = document.createElement("div");
	userNameDiv.classList.add("username");
	userNameDiv.innerText = username;
	userNameDiv.style.color = _settings.showUsernameColor
		? userColor
		: "";
	cardEl.appendChild(userNameDiv);
	const list = document.createElement("ol");
	list.classList.add("tasks");
	cardEl.appendChild(list);
	return cardEl;
}