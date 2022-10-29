export function registerSettings() {
	game.settings.register('elevation-drag-ruler', 'elevationSwitching', {
		name: 'Use Elevation',
		hint: 'Tokens with their movement speed set to automatic will take into account their elevation. When disabled it will use their highest movement speed instead.',
		scope: 'world',
		config: true,
		type: Boolean,
		default: true
	});
	
	game.settings.register('elevation-drag-ruler', 'flyingElevation', {
		name: 'Elevate Flying',
		hint: 'Flying tokens will ignore terrain they are at the upper edge of.',
		scope: 'world',
		config: true,
		type: Boolean,
		default: true
	});
	
	game.settings.register('elevation-drag-ruler', 'forceFlying', {
		name: 'Force Flying',
		hint: 'Tokens at elevation 0 will default to their flying speed if it is bigger than their walking speed',
		scope: 'world',
		config: true,
		type: Boolean,
		default: true
	});
	
	game.settings.register('elevation-drag-ruler', 'forceSwimming', {
		name: 'Force Swimming',
		hint: 'Tokens at elevation 0 and in water terrain will default to their swimming speed if it is bigger than their walking and flying speed.',
		scope: 'world',
		config: true,
		type: Boolean,
		default: true
	});
	
	game.settings.register('elevation-drag-ruler', 'forceBurrowing', {
		name: 'Force Burrowing',
		hint: 'Tokens at elevation 0 but not in water terrain will default to their burrowing speed if it is bigger than their walking and flying speed.',
		scope: 'world',
		config: true,
		type: Boolean,
		default: true
	});
	
	game.settings.register('elevation-drag-ruler', 'hideSpeedButton', {
		name: 'Hide "Switch Speed" Button',
		hint: 'Hides the "Switch Speed" button from the Token HUD for the current user.',
		scope: 'client',
		config: true,
		type: Boolean,
		default: false
	});
	
	game.settings.register('elevation-drag-ruler', 'restrictSpeedButton', {
		name: 'Restrict "Switch Speed" Button',
		hint: 'Restricts the "Switch Speed" button to a minimal permission level.',
		scope: "world",
		config: true,
		type: String,
		default: "1",
		choices: {1: "Player", 2: "Trusted", 3: "Assistant", 4: "Game Master"}
	});
	
	game.settings.register('elevation-drag-ruler', 'hideTerrainButton', {
		name: 'Hide "Toggle Terrain" Button',
		hint: 'Hides the "Toggle Terrain" button from the Token HUD for the current user.',
		scope: 'client',
		config: true,
		type: Boolean,
		default: false
	});
	
	game.settings.register('elevation-drag-ruler', 'restrictTerrainButton', {
		name: 'Restrict "Toggle Terrain" Button',
		hint: 'Restricts the "Toggle Terrain" button to a minimal permission level.',
		scope: "world",
		config: true,
		type: String,
		default: "1",
		choices: {1: "Player", 2: "Trusted", 3: "Assistant", 4: "Game Master"}
	});
}