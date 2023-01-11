import { getConfiguredEnvironments, getTokenSpeeds } from './util.js';

export var keybindForceTeleport;

export function registerKeybindings() {
	game.keybindings.register('elevation-drag-ruler', 'cycleMovement', {
		name: game.i18n.localize('Dnd5eDragRulerIntegration.keybindings.cycleMovement.name'),
		hint: game.i18n.localize('Dnd5eDragRulerIntegration.keybindings.cycleMovement.hint'),
		onDown: handleCycleMovement,
		editable: [
			{
				key: 'BracketRight',
			},
		],
		precedence: -1,
	});

	game.keybindings.register('elevation-drag-ruler', 'cycleMovementReverse', {
		name: game.i18n.localize('Dnd5eDragRulerIntegration.keybindings.cycleMovementReverse.name'),
		hint: game.i18n.localize('Dnd5eDragRulerIntegration.keybindings.cycleMovementReverse.hint'),
		onDown: handleCycleMovementReverse,
		editable: [
			{
				key: 'BracketLeft',
			},
		],
		precedence: -1,
	});

	game.keybindings.register('elevation-drag-ruler', 'toggleTerrain', {
		name: game.i18n.localize('Dnd5eDragRulerIntegration.keybindings.toggleTerrain.name'),
		hint: game.i18n.localize('Dnd5eDragRulerIntegration.keybindings.toggleTerrain.hint'),
		onDown: handleToggleTerrain,
		editable: [
			{
				key: 'KeyE',
			},
		],
		precedence: -1,
	});

	game.keybindings.register('elevation-drag-ruler', 'forceTeleport', {
		name: game.i18n.localize('Dnd5eDragRulerIntegration.keybindings.forceTeleport.name'),
		hint: game.i18n.localize('Dnd5eDragRulerIntegration.keybindings.forceTeleport.hint'),
		onDown: handleForceTeleport,
		onUp: unhandleForceTeleport,
		editable: [
			{
				key: 'KeyQ'
			},
		],
		precedence: -1,
	});
};

function handleCycleMovement(event) {
	const tokens = canvas.tokens.controlled;
	tokens.forEach(token => {
		const tokenSpeeds = getTokenSpeeds(token.document);
		const selectedMovementMode = token.document.getFlag('elevation-drag-ruler', 'selectedSpeed');
		var indexSpeed = 1;
		if (tokenSpeeds.includes(selectedMovementMode)) {
			indexSpeed = tokenSpeeds.indexOf(selectedMovementMode) + 1;
		};
		if (indexSpeed >= tokenSpeeds.length) {
			indexSpeed = 0;
		};
		const movementMode = tokenSpeeds[indexSpeed];
		token.document.setFlag('elevation-drag-ruler', 'selectedSpeed', movementMode);
	});
};

function handleCycleMovementReverse(event) {
	const tokens = canvas.tokens.controlled;
	tokens.forEach(token => {
		const tokenSpeeds = getTokenSpeeds(token.document);
		const selectedMovementMode = token.document.getFlag('elevation-drag-ruler', 'selectedSpeed');
		var indexSpeed = 1;
		if (tokenSpeeds.includes(selectedMovementMode)) {
			indexSpeed = tokenSpeeds.indexOf(selectedMovementMode) - 1;
		};
		if (indexSpeed < 0) {
			indexSpeed = tokenSpeeds.length - 1;
		};
		const movementMode = tokenSpeeds[indexSpeed];
		token.document.setFlag('elevation-drag-ruler', 'selectedSpeed', movementMode);
	});
};

function handleToggleTerrain(event) {
	const tokens = canvas.tokens.controlled;
	tokens.forEach(token => {
		var configuredEnvironments = getConfiguredEnvironments(token.document);
		if (configuredEnvironments['all']['any']) configuredEnvironments['all']['any'] = false;
		else configuredEnvironments['all']['any'] = true;
		token.document.setFlag('elevation-drag-ruler', 'ignoredEnvironments', configuredEnvironments);
	})
}

function handleForceTeleport(event) {
	keybindForceTeleport = true;
}

function unhandleForceTeleport(event) {
	keybindForceTeleport = false;
}