import { registerSettings } from './settings.js';
import { registerKeybindings } from './keybindings.js';
import { isTokenInCombat, getMovementMode } from './util.js';
import { addConfig } from './token_config.js';
import { addSpeedButton, addTerrainButton } from './token_hud.js';
import { getDnd5eEnvironments } from './environments.js';
import { modifyPreviousMovementCost } from './movement_tracking.js';

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
});

Hooks.once('canvasInit', () => {
	if (game.modules.get('enhanced-terrain-layer')?.active) {
		libWrapper.register('elevation-drag-ruler', 'canvas.terrain.getEnvironments', getDnd5eEnvironments, libWrapper.OVERRIDE);
	};
	libWrapper.register('elevation-drag-ruler', 'Token.prototype._onDragLeftStart', onDragLeftStart, 'WRAPPER');
});


Hooks.on('canvasReady', () => {
	const tokenDocuments = canvas.tokens.documentCollection;
	tokenDocuments.forEach((tokenDocument) => tokenDocument.setFlag('elevation-drag-ruler', 'keybindForceTeleport', false));
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