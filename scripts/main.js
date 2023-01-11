import { registerSettings } from './settings.js';
import { registerKeybindings } from './keybindings.js';
import { registerAPI } from './api.js';
import { addConfig } from './token_config.js';
import { addSpeedButton, addTerrainButton } from './token_hud.js';
import { getDnd5eEnvironments } from './environments.js';
import { isTokenInCombat } from './util.js';
import { modifyPreviousMovementCost } from './movement_history.js';

//This function wraps Foundry's onDragLeftStart function.
//This function tracks if the last used movement option was teleportation to modify the movement history to the appropriate values.
let onDragLeftStart = async function (wrapped, ...args) {
	wrapped(...args);
	if (canvas != null) {
		const token = args[0].data.clones[0];
		const previousMovementMode = token.document.getFlag('elevation-drag-ruler', 'movementMode');
		if (previousMovementMode == 'teleport' && isTokenInCombat(token.document) && game.settings.get('drag-ruler', 'enableMovementHistory') && game.modules.get('terrain-ruler')?.active) {
			const teleportCost = token.document.getFlag('elevation-drag-ruler', 'teleportCost') || 0;
			modifyPreviousMovementCost(token, teleportCost);
		};
	}
}

//Register this module's settings to Foundry
Hooks.once('init', () => {
	registerSettings();
	registerKeybindings();
	registerAPI();
});

Hooks.once('canvasInit', () => {
	if (game.modules.get('enhanced-terrain-layer')?.active)
		libWrapper.register('elevation-drag-ruler', 'canvas.terrain.getEnvironments', getDnd5eEnvironments, libWrapper.OVERRIDE);
	if (game.settings.get('elevation-drag-ruler', 'teleport'))
		libWrapper.register('elevation-drag-ruler', 'Token.prototype._onDragLeftStart', onDragLeftStart, 'WRAPPER');
});

Hooks.on('renderTokenHUD', (app, html, data) => {
	const tokenDocument = canvas.tokens.get(data._id).document
	if (!game.settings.get('elevation-drag-ruler', 'hideSpeedButton') && !app.object.document.getFlag('elevation-drag-ruler', 'hideSpeedButton') && game.user.role >= game.settings.get('elevation-drag-ruler', 'restrictSpeedButton'))
		addSpeedButton(tokenDocument, html);
	if (!game.settings.get('elevation-drag-ruler', 'hideTerrainButton') && !app.object.document.getFlag('elevation-drag-ruler', 'hideTerrainButton') && game.modules.get('terrain-ruler')?.active && game.user.role >= game.settings.get('elevation-drag-ruler', 'restrictTerrainButton'))
		addTerrainButton(tokenDocument, html);
});

Hooks.on('renderTokenConfig', (config, html) => {
	addConfig(config, html);
});