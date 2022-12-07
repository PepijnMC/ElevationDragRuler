import { registerSettings } from './settings.js';
import { registerKeybindings } from './keybindings.js';
import { registerAPI } from './api.js';
import { addConfig } from './token_config.js';
import { addSpeedButton, addTerrainButton } from './token_hud.js';
import { getDnd5eEnvironments } from './environments.js';
import { recalculate, updateCombatantDragRulerFlags } from './socket.js'

//Register this module's settings to Foundry
Hooks.once('init', () => {
	registerSettings();
	registerKeybindings();
	registerAPI();
});

Hooks.once('canvasInit', () => {
	if (game.modules.get('enhanced-terrain-layer')?.active)
		libWrapper.register('elevation-drag-ruler', 'canvas.terrain.getEnvironments', getDnd5eEnvironments, libWrapper.OVERRIDE);
});

Hooks.on('renderTokenHUD', (app, html, data) => {
	if (!game.settings.get('elevation-drag-ruler', 'hideSpeedButton') && !app.object.document.getFlag('elevation-drag-ruler', 'hideSpeedButton') && game.user.role >= game.settings.get('elevation-drag-ruler', 'restrictSpeedButton'))
		addSpeedButton(data._id, html);
	if (!game.settings.get('elevation-drag-ruler', 'hideTerrainButton') && !app.object.document.getFlag('elevation-drag-ruler', 'hideTerrainButton') && game.modules.get('terrain-ruler')?.active && game.user.role >= game.settings.get('elevation-drag-ruler', 'restrictTerrainButton'))
		addTerrainButton(data._id, html);
});

Hooks.on('renderTokenConfig', (config, html) => {
	addConfig(config, html);
});

Hooks.on('preUpdateCombatant', (combatant, data, update, id) => {
	console.log('Hi')
	const combat = combatant.parent;
	const dragRulerFlags = data.flags?.dragRuler;
	const waypoints = dragRulerFlags?.passedWaypoints;
	const tokenDocument = canvas.tokens.get(combatant.tokenId).document;
	const movementMode = tokenDocument.getFlag('elevation-drag-ruler', 'movementMode');
	if (movementMode != 'teleport' || !waypoints || waypoints.length == 0) return;
	console.warn('Updating Waypoints!')
	waypoints.forEach((waypoint) => {
		if (!waypoint.isPrevious) {
			waypoint.dragRulerVisitedSpaces.forEach((space) => {
				space.distance = 0;
			});
		};
	});
});