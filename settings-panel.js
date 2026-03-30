/**
 * Step 9 — OBS Interact Settings Panel
 *
 * A hidden trigger dot opens a runtime style panel that maps directly to
 * the CSS variables loaded by styleLoader.js. All changes are live;
 * nothing is persisted (refresh restores _styles defaults).
 */
(function () {
	// ── helpers ──────────────────────────────────────────────────────────
	const root = document.documentElement;

	function getVar(cssVar) {
		return root.style.getPropertyValue(cssVar).trim();
	}
	function setVar(cssVar, value) {
		root.style.setProperty(cssVar, value);
	}

	// Return the raw CSS var value as a display string for the hex text input.
	// Keeps rgba/rgb values as-is so the user sees exactly what's set.
	function toDisplayColor(raw) {
		return (raw || "").trim() || "#888888";
	}

	// True if the string is a valid CSS color we can apply directly.
	function isValidColor(str) {
		const s = new Option().style;
		s.color = str;
		return s.color !== "";
	}

	function toPx(raw) { return parseFloat(raw) || 0; }

	// ── field definitions ─────────────────────────────────────────────────
	const FIELDS = [
		{ group: "App",      label: "Background",         var: "--app-background-color",           type: "color" },
		{ group: "Header",   label: "Background",         var: "--header-background-color",         type: "color" },
		{ group: "Header",   label: "Font color",         var: "--header-font-color",               type: "color" },
		{ group: "Header",   label: "Font size (px)",     var: "--header-font-size",                type: "px", min: 8,  max: 40 },
		{ group: "Cards",    label: "Background",         var: "--card-background-color",           type: "color" },
		{ group: "Cards",    label: "Gap between (px)",   var: "--card-gap-between",                type: "px", min: 0,  max: 30 },
		{ group: "Cards",    label: "Padding (px)",       var: "--card-padding",                    type: "px", min: 4,  max: 40 },
		{ group: "Username", label: "Color",              var: "--username-color",                  type: "color" },
		{ group: "Username", label: "Font size (px)",     var: "--username-font-size",              type: "px", min: 8,  max: 40 },
		{ group: "Tasks",    label: "Font color",         var: "--task-font-color",                 type: "color" },
		{ group: "Tasks",    label: "Font size (px)",     var: "--task-font-size",                  type: "px", min: 8,  max: 36 },
		{ group: "Tasks",    label: "Done color",         var: "--task-done-font-color",            type: "color" },
		{ group: "Tasks",    label: "Focus background",   var: "--task-focus-background-color",     type: "color" },
		{ group: "Tasks",    label: "Focus font color",   var: "--task-focus-font-color",           type: "color" },
	];

	// ── build ─────────────────────────────────────────────────────────────
	function buildPanel() {
		// Trigger dot
		const trigger = document.createElement("div");
		trigger.id = "sp-trigger";
		trigger.title = "Open style settings";
		document.body.appendChild(trigger);

		// Panel
		const panel = document.createElement("div");
		panel.id = "sp-panel";
		panel.setAttribute("aria-hidden", "true");

		// Header row
		const hdr = document.createElement("div");
		hdr.id = "sp-header";
		const title = document.createElement("span");
		title.textContent = "Style settings";
		const closeBtn = document.createElement("button");
		closeBtn.id = "sp-close";
		closeBtn.textContent = "✕";
		closeBtn.addEventListener("click", () => closePanel(panel));
		hdr.append(title, closeBtn);
		panel.appendChild(hdr);

		// Fields
		let currentGroup = null;
		let section = null;

		FIELDS.forEach(field => {
			if (field.group !== currentGroup) {
				currentGroup = field.group;
				const heading = document.createElement("div");
				heading.className = "sp-group";
				heading.textContent = field.group;
				panel.appendChild(heading);
				section = document.createElement("div");
				section.className = "sp-section";
				panel.appendChild(section);
			}

			const row = document.createElement("div");
			row.className = "sp-row";

			const lbl = document.createElement("label");
			lbl.className = "sp-label";
			lbl.textContent = field.label;

			let control;

			if (field.type === "color") {
				const wrap = document.createElement("div");
				wrap.className = "sp-color-wrap";

				const dot = document.createElement("span");
				dot.className = "sp-color-dot";
				const currentVal = getVar(field.var);
				dot.style.background = currentVal || "#888888";

				const inp = document.createElement("input");
				inp.type = "text";
				inp.className = "sp-color";
				inp.dataset.var = field.var;
				inp.value = toDisplayColor(currentVal);
				inp.spellcheck = false;

				const apply = () => {
					const v = inp.value.trim();
					if (isValidColor(v)) {
						setVar(field.var, v);
						dot.style.background = v;
						inp.style.borderColor = "";
					} else {
						inp.style.borderColor = "#e07070";
					}
				};
				inp.addEventListener("change", apply);
				inp.addEventListener("keydown", e => { if (e.key === "Enter") apply(); });

				wrap.append(dot, inp);
				control = wrap;
			} else {
				// px slider
				const wrap = document.createElement("div");
				wrap.className = "sp-px-wrap";
				const slider = document.createElement("input");
				slider.type = "range";
				slider.className = "sp-slider";
				slider.dataset.var = field.var;
				slider.min = String(field.min ?? 0);
				slider.max = String(field.max ?? 100);
				slider.value = String(toPx(getVar(field.var)));
				const num = document.createElement("span");
				num.className = "sp-num";
				num.textContent = slider.value;
				slider.addEventListener("input", () => {
					num.textContent = slider.value;
					setVar(field.var, slider.value + "px");
				});
				wrap.append(slider, num);
				control = wrap;
			}

			row.append(lbl, control);
			section.appendChild(row);
		});

		// Footer / reset
		const footer = document.createElement("div");
		footer.id = "sp-footer";
		const resetBtn = document.createElement("button");
		resetBtn.id = "sp-reset";
		resetBtn.textContent = "↺ Reset defaults";
		resetBtn.addEventListener("click", () => resetDefaults(panel));
		footer.appendChild(resetBtn);
		panel.appendChild(footer);

		document.body.appendChild(panel);

		trigger.addEventListener("click", () => {
			const open = panel.classList.toggle("open");
			panel.setAttribute("aria-hidden", String(!open));
			if (open) syncInputs(panel);
		});
	}

	function closePanel(panel) {
		panel.classList.remove("open");
		panel.setAttribute("aria-hidden", "true");
	}

	// Sync all inputs to current CSS var values
	function syncInputs(panel) {
		panel.querySelectorAll("input[type=text][data-var]").forEach(inp => {
			const val = getVar(inp.dataset.var);
			inp.value = toDisplayColor(val);
			inp.style.borderColor = "";
			const dot = inp.previousElementSibling;
			if (dot) dot.style.background = val || "#888888";
		});
		panel.querySelectorAll("input[type=range][data-var]").forEach(slider => {
			slider.value = String(toPx(getVar(slider.dataset.var)));
			const num = slider.nextElementSibling;
			if (num) num.textContent = slider.value;
		});
	}

	// Restore the values that _styles.js originally applied via styleLoader
	function resetDefaults(panel) {
		if (typeof _styles === "undefined") return;
		function toCSSVar(key) {
			return "--" + key.replace(/([A-Z])/g, "-$1").toLowerCase();
		}
		for (const [key, val] of Object.entries(_styles)) {
			root.style.setProperty(toCSSVar(key), val);
		}
		syncInputs(panel);
	}

	// ── init ──────────────────────────────────────────────────────────────
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", buildPanel);
	} else {
		buildPanel();
	}
})();
