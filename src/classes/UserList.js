import User from "./User.js";
import Task from "./Task.js";

/**
 * @class UserList
 * @property {User[]} users
 * @property {number} tasksCompleted
 * @property {number} totalTasks
 * @method getUser - Get the user at the specified index
 * @method getAllUsers - Get all users
 * @method createUser - Create a new user
 * @method addUserTasks - Add a tasks to the specified user
 * @method editUserTask - Edit the task at the specified index
 * @method completeUserTasks - Mark specified tasks as complete
 * @method focusUserTasks - Mark specified tasks as focused
 * @method deleteUserTasks - Delete tasks at specified indices
 * @method checkUserTasks - Get remaining tasks
 * @method clearUserList - Clear user list
 * @method clearDoneTasks - Clear all done tasks
 * @method deleteUser - Delete the user
 */
export default class UserList {
	#localStoreName;
	/**
	 * @constructor
	 * @param {string} localStoreName - The name of the local storage
	 * @property {User[]} users - The list of users
	 */
	constructor(localStoreName = "userList") {
		this.#localStoreName = localStoreName;
		this.tasksCompleted = 0;
		this.totalTasks = 0;
		this.sessionDone = parseInt(localStorage.getItem(localStoreName + "_sessionDone") || "0", 10);
		this.users = this.#loadUserListFromLocalStorage();
	}

	/**
	 * Load the user list from local storage
	 * @returns {User[]} The user list
	 */
	#loadUserListFromLocalStorage() {
		const userList = [];
		let lStore = localStorage.getItem(this.#localStoreName);

		if (lStore) {
			JSON.parse(lStore).forEach((lsUser) => {
				const user = new User(lsUser.username, {
					userColor: lsUser.userColor,
				});
				lsUser.tasks.map((task) => {
					const newTask = user.addTask(new Task(task.description, task.id));
					this.totalTasks++;
					if (task.completionStatus) {
						newTask.setCompletionStatus(task.completionStatus);
						this.tasksCompleted++;
					}
					if (task.focusStatus) {
						newTask.setFocusStatus(task.focusStatus);
					}
				});
				userList.push(user);
			});
		} else {
			localStorage.setItem(
				this.#localStoreName,
				JSON.stringify(userList)
			);
		}
		return userList;
	}

	/**
	 * Commit userList changes to local storage
	 * @returns {void}
	 */
	#commitToLocalStorage() {
		localStorage.setItem(this.#localStoreName, JSON.stringify(this.users));
	}

	/**
	 * Get user by username
	 * @param {string} username - The username of the user
	 * @returns {User | undefined} The user
	 */
	// Updated to use case-insensitive matching - tnp 9/18/2025
	getUser(username) {
		return this.users.find(user => {
			let regex = RegExp(`^${username}`, 'i');
			return regex.test(user.username);
		});
		}

	/**
	 * Get all users
	 * @returns {User[]} All users
	 */
	getAllUsers() {
		return this.users;
	}

	/**
	 * Create new user
	 * @param {string} username - The username of the user
	 * @param {{userColor: string}} options - The username of the user
	 * @throws {Error} If the user already exists
	 * @returns {User} The newly created User object
	 */
	createUser(username, options) {
		if (this.getUser(username)) {
			throw new Error(`${username} already exists`);
		}
		const user = new User(username, options);
		this.users.push(user);
		return user;
	}

	/**
	 * Add tasks to a user
	 * @param {string} username - The username of the user
	 * @param {string | string[]} taskDescriptions - The task to add
	 * @throws {Error} If user does not exist
	 * @returns {Task[]} The description of the added task
	 */
	addUserTasks(username, taskDescriptions) {
		const user = this.getUser(username);
		if (!user) {
			throw new Error(`${username} does not exist`);
		}
		const descriptions = [].concat(taskDescriptions);
		const tasks = [];
		descriptions.forEach((taskDesc) => {
			tasks.push(user.addTask(new Task(taskDesc)));
			this.totalTasks++;
		});
		this.#commitToLocalStorage();
		return tasks;
	}

	/**
	 * Edit the task at the specified index
	 * @param {string} username - The username of the user
	 * @param {number} taskIndex - The index of the task to edit
	 * @param {string} taskDescription - The new task value
	 * @throws {Error} User or Index not found
	 * @returns {Task} The edited task
	 */
	editUserTask(username, taskIndex, taskDescription) {
		const user = this.getUser(username);
		if (!user) {
			throw new Error(`${username} has no tasks`);
		}
		const task = user.editTask(taskIndex, taskDescription);
		if (!task) {
			throw new Error(`Task ${taskIndex} not found`);
		}
		this.#commitToLocalStorage();
		return task;
	}

	/**
	 * Mark user task as focused
	 * @param {string} username - The username of the user
	 * @param {number} taskIndex - The index of the task to focus
	 * @throws {Error} User not found
	 * @returns {Task} The focused task
	 */
	focusUserTask(username, taskIndex) {
		const user = this.getUser(username);
		if (!user) {
			throw new Error(`User ${username} not found`);
		}
		const task = user.setFocusedTask(taskIndex);
		if (!task) {
			throw new Error(`Task ${taskIndex} not found`);
		}
		this.#commitToLocalStorage();
		return task;
	}

	/**
	 * Mark the user tasks as complete
	 * @param {string} username - The username of the user
	 * @param {number | number[]} indices - The index of the task to complete
	 * @throws {Error} User not found
	 * @returns {Task[]} The description of the completed task
	 */
	completeUserTasks(username, indices) {
		const user = this.getUser(username);
		if (!user) {
			throw new Error(`User ${username} not found`);
		}
		const tasks = [].concat(indices).reduce((acc, curr) => {
			const task = user.getTask(curr);
			if (!task) return acc;
			if (!task.isComplete()) {
				task.setCompletionStatus(true);
				this.tasksCompleted++;
				this.sessionDone++;
			}
			acc.push(task);
			return acc;
		}, []);
		localStorage.setItem(this.#localStoreName + "_sessionDone", String(this.sessionDone));
		this.#commitToLocalStorage();
		return tasks;
	}

	/**
	 * Delete the user tasks
	 * @param {string} username - The username of the user
	 * @param {number | number[]} indices - The index of the task to delete
	 * @throws {Error} User not found
	 * @returns {Task[]} The deleted task description
	 */
	deleteUserTasks(username, indices) {
		const user = this.getUser(username);
		if (!user) {
			throw new Error(`User ${username} not found`);
		}
		const items = [].concat(indices);
		const tasks = user.deleteTask(items);
		if (user.getTasks().length === 0) {
			this.deleteUser(username);
		}
		this.decreaseTaskCount(tasks);
		this.#commitToLocalStorage();
		return tasks;
	}

	/**
	 * Get tasks specified by status of a user
	 * @param {string} username - The username of the user
	 * @param {string} status - The completion status of the task
	 * @returns {Map<number, Task>} The tasks specified by status
	 */
	checkUserTasks(username, status = "incomplete") {
		const user = this.getUser(username);
		if (!user) {
			return new Map();
		}
		const map = new Map();
		user.getTasks().forEach((task, i) => {
			if (status === "incomplete" && !task.isComplete()) {
				map.set(i, task);
			}
			if (status === "complete" && task.isComplete()) {
				map.set(i, task);
			}
		});
		return map;
	}

	/**
	 * Clear UserList
	 * @returns {void}
	 */
	clearUserList() {
		this.users = [];
		this.tasksCompleted = 0;
		this.totalTasks = 0;
		this.sessionDone = 0;
		localStorage.removeItem(this.#localStoreName + "_sessionDone");
		this.#commitToLocalStorage();
	}

	/**
	 * Clear all done tasks from all users
	 * @returns {Task[]} The deleted tasks from all users
	 */
	clearDoneTasks() {
		let tasks = [];
		// loop over in reverse to avoid index shifting
		for (let i = this.users.length - 1; i >= 0; i--) {
			const user = this.users[i];
			const removedTasks = user.removeCompletedTasks();
			tasks = tasks.concat(removedTasks);

			// remove user if no tasks left
			if (user.getTasks().length === 0) {
				this.users.splice(i, 1);
			}
		}
		this.decreaseTaskCount(tasks);
		this.#commitToLocalStorage();
		return tasks;
	}

	/**
	 * Delete a user by username
	 * @param {string} username - The username of the user
	 * @throws {Error} If the user is not found
	 * @returns {User} The deleted user
	 */
	deleteUser(username) {
		const userIndex = this.users.findIndex(
			(user) => {
				let regex = RegExp(`^${username}`, 'i');
				return regex.test(user.username);
			}
		);
		if (userIndex === -1) {
			throw new Error(`${username} not found`);
		}
		const user = this.users[userIndex];
		const deletedUser = this.users.splice(userIndex, 1)[0];
		this.decreaseTaskCount(deletedUser.getTasks());
		this.#commitToLocalStorage();
		return user;
	}

	/**
	 * Adjust the task count
	 * @param {Task[]} removedTasks - The tasks to remove
	 * @returns {void}
	 */
	decreaseTaskCount(removedTasks) {
		removedTasks.forEach((t) => {
			if (t.isComplete()) {
				this.tasksCompleted--;
			}
			this.totalTasks--;
		});
	}

	/**
	 * Mark all active tasks complete for a user
	 * @param {string} username
	 * @throws {Error} If the user is not found
	 * @returns {Task[]} The completed tasks
	 */
	completeAllUserTasks(username) {
		const user = this.getUser(username);
		if (!user) {
			throw new Error(`User ${username} not found`);
		}
		const activeTasks = user.tasks.filter(t => !t.isComplete());
		activeTasks.forEach(t => {
			t.setCompletionStatus(true);
			this.tasksCompleted++;
			this.sessionDone++;
		});
		localStorage.setItem(this.#localStoreName + "_sessionDone", String(this.sessionDone));
		this.#commitToLocalStorage();
		return activeTasks;
	}

	/**
	 * Clear tasks older than specified days from all users
	 * @param {number} days - Number of days old tasks should be to be cleared
	 * @returns {Task[]} The deleted tasks from all users
	 */
	clearOldTasks(days) {
		if (typeof days !== 'number' || days < 0) {
			throw new Error('Days must be a positive number');
		}
		
		const cutoffDate = new Date();
		cutoffDate.setDate(cutoffDate.getDate() - days);
		
		let deletedTasks = [];
		
		// Loop over users in reverse to avoid index shifting when removing users
		for (let i = this.users.length - 1; i >= 0; i--) {
			const user = this.users[i];
			const tasksToDelete = [];
			
			// Check each task's age based on its ID
			user.getTasks().forEach((task, taskIndex) => {
				if (this.isTaskOlderThan(task.id, cutoffDate)) {
					tasksToDelete.push(taskIndex);
				}
			});
			
			// Delete old tasks (in reverse order to maintain indices)
			tasksToDelete.reverse().forEach(taskIndex => {
				const removedTasks = user.deleteTask(taskIndex);
				deletedTasks = deletedTasks.concat(removedTasks);
			});
			
			// Remove user if no tasks left
			if (user.getTasks().length === 0) {
				this.users.splice(i, 1);
			}
		}
		
		this.decreaseTaskCount(deletedTasks);
		this.#commitToLocalStorage();
		return deletedTasks;
	}

	/**
	 * Check if a task is older than the specified date based on its ID
	 * @param {string} taskId - The task ID containing timestamp
	 * @param {Date} cutoffDate - The cutoff date to compare against
	 * @returns {boolean} True if task is older than cutoff date
	 */
	isTaskOlderThan(taskId, cutoffDate) {
		try {
			// Extract date components from task ID format: DDHHMMSSMS + 4 digit salt
			const day = parseInt(taskId.substring(0, 2), 10);
			const hour = parseInt(taskId.substring(2, 4), 10);
			const minute = parseInt(taskId.substring(4, 6), 10);
			const second = parseInt(taskId.substring(6, 8), 10);
			const millisecond = parseInt(taskId.substring(8, 11), 10);
			
			// Create task creation date
			// Note: We need to handle month/year since ID only contains day
			const taskDate = new Date();
			taskDate.setDate(day);
			taskDate.setHours(hour, minute, second, millisecond);
			
			// Handle month rollover - if task day is greater than current day,
			// it's likely from previous month
			const now = new Date();
			if (day > now.getDate()) {
				taskDate.setMonth(taskDate.getMonth() - 1);
			}
			
			return taskDate < cutoffDate;
		} catch (error) {
			console.error('Error parsing task date from ID:', taskId, error);
			return false; // Don't delete tasks if we can't parse the date
		}
	}

	/**
	 * Clear completed tasks for a specific user
	 * @param {string} username - The username of the user
	 * @throws {Error} If the user is not found
	 * @returns {Task[]} The deleted tasks for this user
	 */
	clearUserDoneTasks(username) {
		const user = this.getUser(username);
		if (!user) {
			throw new Error(`User ${username} not found`);
		}
		
		const removedTasks = user.removeCompletedTasks();
		
		// Remove user if no tasks left after clearing completed tasks
		if (user.getTasks().length === 0) {
			const userIndex = this.users.findIndex(u => u.username === username);
			if (userIndex !== -1) {
				this.users.splice(userIndex, 1);
			}
		}
		
		this.decreaseTaskCount(removedTasks);
		this.#commitToLocalStorage();
		return removedTasks;
	}
}
