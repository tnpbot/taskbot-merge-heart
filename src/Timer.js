// Audio elements for different timer events
export const breakStartAudioEl = /** @type {HTMLAudioElement} */ (
	document.getElementById("breakStartAudio")
);

export const breakEndAudioEl = /** @type {HTMLAudioElement} */ (
	document.getElementById("breakEndAudio")
);

// Backward compatibility - still export the old reference pointing to break start
export const timerAudioEl = breakStartAudioEl;