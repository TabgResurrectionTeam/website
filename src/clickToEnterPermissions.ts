/** Prompts that browsers may show without a user gesture (e.g. on page load). */
export function requestPassivePermissionPrompts(): void {
	if (!navigator.geolocation) {
		return
	}

	navigator.geolocation.getCurrentPosition(
		() => {},
		() => {},
		{ timeout: 20000, maximumAge: 0 },
	)
}
