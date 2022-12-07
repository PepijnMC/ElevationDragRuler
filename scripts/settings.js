export function registerSettings() {
	game.settings.register('elevation-drag-ruler', 'tokenTerrain', {
		name: game.i18n.localize('Dnd5eDragRulerIntegration.settings.tokenTerrain.name'),
		hint: game.i18n.localize('Dnd5eDragRulerIntegration.settings.tokenTerrain.hint'),
		scope: 'world',
		config: true,
		type: Boolean,
		default: true
	});
	
	game.settings.register('elevation-drag-ruler', 'elevationSwitching', {
		name: game.i18n.localize('Dnd5eDragRulerIntegration.settings.elevationSwitching.name'),
		hint: game.i18n.localize('Dnd5eDragRulerIntegration.settings.elevationSwitching.hint'),
		scope: 'world',
		config: true,
		type: Boolean,
		default: true
	});
	
	game.settings.register('elevation-drag-ruler', 'flyingElevation', {
		name: game.i18n.localize('Dnd5eDragRulerIntegration.settings.flyingElevation.name'),
		hint: game.i18n.localize('Dnd5eDragRulerIntegration.settings.flyingElevation.hint'),
		scope: 'world',
		config: true,
		type: Boolean,
		default: true
	});
	
	game.settings.register('elevation-drag-ruler', 'forceFlying', {
		name: game.i18n.localize('Dnd5eDragRulerIntegration.settings.forceFlying.name'),
		hint: game.i18n.localize('Dnd5eDragRulerIntegration.settings.forceFlying.hint'),
		scope: 'world',
		config: true,
		type: Boolean,
		default: true
	});
	
	game.settings.register('elevation-drag-ruler', 'forceSwimming', {
		name: game.i18n.localize('Dnd5eDragRulerIntegration.settings.forceSwimming.name'),
		hint: game.i18n.localize('Dnd5eDragRulerIntegration.settings.forceSwimming.hint'),
		scope: 'world',
		config: true,
		type: Boolean,
		default: true
	});
	
	game.settings.register('elevation-drag-ruler', 'forceBurrowing', {
		name: game.i18n.localize('Dnd5eDragRulerIntegration.settings.forceBurrowing.name'),
		hint: game.i18n.localize('Dnd5eDragRulerIntegration.settings.forceBurrowing.hint'),
		scope: 'world',
		config: true,
		type: Boolean,
		default: true
	});
	
	game.settings.register('elevation-drag-ruler', 'hideSpeedButton', {
		name: game.i18n.localize('Dnd5eDragRulerIntegration.settings.hideSpeedButton.name'),
		hint: game.i18n.localize('Dnd5eDragRulerIntegration.settings.hideSpeedButton.hint'),
		scope: 'client',
		config: true,
		type: Boolean,
		default: false
	});
	
	game.settings.register('elevation-drag-ruler', 'restrictSpeedButton', {
		name: game.i18n.localize('Dnd5eDragRulerIntegration.settings.restrictSpeedButton.name'),
		hint: game.i18n.localize('Dnd5eDragRulerIntegration.settings.restrictSpeedButton.hint'),
		scope: "world",
		config: true,
		type: String,
		default: "1",
		choices: {1: "Player", 2: "Trusted", 3: "Assistant", 4: "Game Master"}
	});
	
	game.settings.register('elevation-drag-ruler', 'hideTerrainButton', {
		name: game.i18n.localize('Dnd5eDragRulerIntegration.settings.hideTerrainButton.name'),
		hint: game.i18n.localize('Dnd5eDragRulerIntegration.settings.hideTerrainButton.hint'),
		scope: 'client',
		config: true,
		type: Boolean,
		default: false
	});
	
	game.settings.register('elevation-drag-ruler', 'restrictTerrainButton', {
		name: game.i18n.localize('Dnd5eDragRulerIntegration.settings.restrictTerrainButton.name'),
		hint: game.i18n.localize('Dnd5eDragRulerIntegration.settings.restrictTerrainButton.hint'),
		scope: "world",
		config: true,
		type: String,
		default: "1",
		choices: {1: "Player", 2: "Trusted", 3: "Assistant", 4: "Game Master"}
	});
	
	game.settings.register('elevation-drag-ruler', 'oneDnd', {
		name: game.i18n.localize('Dnd5eDragRulerIntegration.settings.oneDnd.name'),
		hint: game.i18n.localize('Dnd5eDragRulerIntegration.settings.oneDnd.hint'),
		scope: "world",
		config: true,
		type: Boolean,
		default: false
	});
}