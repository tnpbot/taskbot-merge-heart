const CONFETTI_COLORS = ["#9db4cc", "#b8ccb0", "#c9a96e", "#d4bdb0", "#ffffff", "#e8e2d8", "#aac4a8"];
const BLOOMS = ["✨", "🌟", "⭐", "💫", "🎊", "🎉", "💥", "🌸", "🌼", "🍃", "💚", "🌺"];
const TOASTS_ALL = [
	u => u ? `🔥 ${u} crushed it!`          : "🔥 all done!",
	u => u ? `💥 all done, ${u}!`            : "💥 all done!",
	u => u ? `🎉 ${u} cleared the list!`     : "🎉 list cleared!",
	()  => "🔥 all tasks complete!",
	u => u ? `⭐ let's go ${u}! all done!`   : "⭐ all done!",
	u => u ? `✨ ${u} is on fire!`            : "✨ list cleared!",
];

const TOASTS = [
	u => u ? `✓ nice work, ${u}!`     : "✓ task complete ✨",
	u => u ? `✓ you did that, ${u}!`  : "✓ you did that!",
	()  => "✓ task complete ✨",
	u => u ? `✓ let's go, ${u}!`      : "✓ let's go!",
	()  => "✓ one down!",
	u => u ? `✓ great job ${u}! 💫`   : "✓ great job! 💫",
];

function el(tag, cls) {
	const e = document.createElement(tag);
	if (cls) e.className = cls;
	return e;
}

/**
 * Fire confetti, emoji blooms, and a toast for task completion.
 * @param {string | null} username
 * @returns {void}
 */
export function celebrate(username) {
	const cel = document.getElementById("cel");
	if (!cel) return;
	cel.innerHTML = "";

	// toast
	const toast = el("div", "celebration-toast");
	toast.textContent = TOASTS[Math.floor(Math.random() * TOASTS.length)](username);
	cel.appendChild(toast);
	setTimeout(() => toast.remove(), 3700);

	// confetti particles — positions as % so they work at any browser source size
	for (let i = 0; i < 75; i++) {
		const p = el("div", "cp");
		const sz = 7 + Math.random() * 13;
		p.style.cssText =
			"left:"       + (2  + Math.random() * 96) + "%;" +
			"top:"        + (5  + Math.random() * 75) + "%;" +
			"width:"      + sz + "px;" +
			"height:"     + (sz * (Math.random() < 0.3 ? 0.3 : 1)) + "px;" +
			"background:" + CONFETTI_COLORS[i % CONFETTI_COLORS.length] + ";" +
			"border-radius:3px;" +
			"--tx:"       + ((Math.random() - 0.5) * 190) + "px;" +
			"--ty:"       + (-(45 + Math.random() * 260))  + "px;" +
			"--r:"        + (Math.random() * 680)           + "deg;" +
			"--d:"        + (1.5 + Math.random() * 2.0)     + "s;";
		cel.appendChild(p);
		setTimeout(() => p.remove(), 3700);
	}

	// emoji blooms — spread across the upper portion of the viewport
	for (let j = 0; j < 10; j++) {
		const b = el("div", "bl");
		b.textContent = BLOOMS[j % BLOOMS.length];
		b.style.cssText =
			"left:"            + (5 + j * 9)         + "%;" +
			"top:"             + (5 + (j % 4) * 8)   + "%;" +
			"animation-delay:" + (j * 0.065)          + "s;" +
			"font-size:"       + (26 + Math.random() * 14) + "px;";
		cel.appendChild(b);
		setTimeout(() => b.remove(), 2200);
	}
}

/**
 * Fire a bigger celebration for completing all tasks at once.
 * @param {string | null} username
 * @returns {void}
 */
export function celebrateAll(username) {
	const cel = document.getElementById("cel");
	if (!cel) return;
	cel.innerHTML = "";

	// toast
	const toast = el("div", "celebration-toast");
	toast.textContent = TOASTS_ALL[Math.floor(Math.random() * TOASTS_ALL.length)](username);
	cel.appendChild(toast);
	setTimeout(() => toast.remove(), 3700);

	// double confetti
	for (let i = 0; i < 150; i++) {
		const p = el("div", "cp");
		const sz = 7 + Math.random() * 13;
		p.style.cssText =
			"left:"       + (2  + Math.random() * 96) + "%;" +
			"top:"        + (5  + Math.random() * 75) + "%;" +
			"width:"      + sz + "px;" +
			"height:"     + (sz * (Math.random() < 0.3 ? 0.3 : 1)) + "px;" +
			"background:" + CONFETTI_COLORS[i % CONFETTI_COLORS.length] + ";" +
			"border-radius:3px;" +
			"--tx:"       + ((Math.random() - 0.5) * 260) + "px;" +
			"--ty:"       + (-(45 + Math.random() * 320))  + "px;" +
			"--r:"        + (Math.random() * 720)           + "deg;" +
			"--d:"        + (1.5 + Math.random() * 2.0)     + "s;";
		cel.appendChild(p);
		setTimeout(() => p.remove(), 3700);
	}

	// more blooms, denser spread
	for (let j = 0; j < 16; j++) {
		const b = el("div", "bl");
		b.textContent = BLOOMS[j % BLOOMS.length];
		b.style.cssText =
			"left:"            + (2 + j * 6)          + "%;" +
			"top:"             + (5 + (j % 5) * 7)    + "%;" +
			"animation-delay:" + (j * 0.05)            + "s;" +
			"font-size:"       + (28 + Math.random() * 18) + "px;";
		cel.appendChild(b);
		setTimeout(() => b.remove(), 2200);
	}
}
