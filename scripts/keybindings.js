import { getConfiguredEnvironments, getTokenSpeeds } from './util.js';

export function registerKeybindings() {
	game.keybindings.register('elevation-drag-ruler', 'cycleMovement', {
		name: 'Cycle Movement Modes',
		hint: 'Cycles through the selected tokens\' movement modes.',
		onDown: handleCycleMovement,
		editable: [
			{
				key: 'BracketRight',
			},
		],
		precedence: -1,
	});

	game.keybindings.register('elevation-drag-ruler', 'cycleMovementReverse', {
		name: 'Cycle Movement Modes (Reverse)',
		hint: 'Cycles backward through the selected tokens\' movement modes.',
		onDown: handleCycleMovementReverse,
		editable: [
			{
				key: 'BracketLeft',
			},
		],
		precedence: -1,
	});

	game.keybindings.register('elevation-drag-ruler', 'toggleTerrain', {
		name: 'Toggle Terrain',
		hint: 'Toggles all movement costs for the selected tokens.',
		onDown: handletoggleTerrain,
		editable: [
			{
				key: 'KeyE',
			},
		],
		precedence: -1,
	});

	game.keybindings.register('elevation-drag-ruler', 'forceTeleport', {
		name: 'Force Teleport',
		hint: 'Makes selected tokens teleport when held regardless of their selected movement mode.',
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

function handletoggleTerrain(event) {
	const tokens = canvas.tokens.controlled;
	tokens.forEach(token => {
		var configuredEnvironments = getConfiguredEnvironments(token.document);
		if (configuredEnvironments['all']['any']) configuredEnvironments['all']['any'] = false;
		else configuredEnvironments['all']['any'] = true;
		token.document.setFlag('elevation-drag-ruler', 'ignoredEnvironments', configuredEnvironments);
	})
}

function handleForceTeleport(event) {
	const tokens = canvas.tokens.controlled;
	tokens.forEach(token => {
		token.document.setFlag('elevation-drag-ruler', 'keybindForceTeleport', true);
	});
}

function unhandleForceTeleport(event) {
	const tokenDocuments = canvas.tokens.documentCollection;
	tokenDocuments.forEach(tokenDocument => {
		tokenDocument.setFlag('elevation-drag-ruler', 'keybindForceTeleport', false);
	});
}