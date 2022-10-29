//Returns the environment configuration of a token, which sets which environments a token should ignore. 
export function getConfiguredEnvironments(tokenDocument) {
	const defaultConfiguredEnvironments = {'all': {'any': false, 'walk': false, 'swim': false, 'fly': false, 'burrow': false, 'climb': false}, 'arctic': {'any': false, 'walk': false, 'swim': false, 'fly': false, 'burrow': false, 'climb': false}, 'coast': {'any': false, 'walk': false, 'swim': false, 'fly': false, 'burrow': false, 'climb': false}, 'desert': {'any': false, 'walk': false, 'swim': false, 'fly': false, 'burrow': false, 'climb': false}, 'forest': {'any': false, 'walk': false, 'swim': false, 'fly': false, 'burrow': false, 'climb': false}, 'grassland': {'any': false, 'walk': false, 'swim': false, 'fly': false, 'burrow': false, 'climb': false}, 'jungle': {'any': false, 'walk': false, 'swim': false, 'fly': false, 'burrow': false, 'climb': false}, 'mountain': {'any': false, 'walk': false, 'swim': false, 'fly': false, 'burrow': true, 'climb': true}, 'swamp': {'any': false, 'walk': false, 'swim': false, 'fly': false, 'burrow': false, 'climb': false}, 'underdark': {'any': false, 'walk': false, 'swim': false, 'fly': false, 'burrow': false, 'climb': false}, 'urban': {'any': false, 'walk': false, 'swim': false, 'fly': false, 'burrow': false, 'climb': false}, 'water': {'any': false, 'walk': false, 'swim': true, 'fly': false, 'burrow': false, 'climb': false}};
	var configuredEnvironments = tokenDocument.getFlag('elevation-drag-ruler', 'ignoredEnvironments');
	return configuredEnvironments || defaultConfiguredEnvironments;
}

//Returns the highest movement mode of a given object of movement modes.
export function getHighestMovementMode(movementModes) {
	var highestSpeed = 0;
	var highestMovement = 'walk';
	for (const [key, value] of Object.entries(movementModes)) {
		if (value > highestSpeed && key != 'teleport') {
			highestSpeed = value;
			highestMovement = key;
		}
	}
	return highestMovement;
}

//Returns the highest movement speed of a token.
export function getHighestMovementSpeed(tokenDocument) {
	const actor = tokenDocument._actor
	const walkSpeed = actor.system.attributes.movement.walk;
	const flySpeed = actor.system.attributes.movement.fly
	const burrowSpeed = actor.system.attributes.movement.burrow
	const climbSpeed = actor.system.attributes.movement.climb
	const swimSpeed = actor.system.attributes.movement.swim
	return Math.max(walkSpeed, flySpeed, burrowSpeed, climbSpeed, swimSpeed);
}

//Returns the non-zero movement speeds of a token, including the module's automatic mode and an optional teleportation mode.
export function getTokenSpeeds(tokenDocument) {
	const defaultSpeeds = tokenDocument._actor.system.attributes.movement;
	var tokenSpeeds = ['auto'] ;
	for (const [key, value] of Object.entries(defaultSpeeds)) if (value > 0 && key != 'hover') tokenSpeeds.push(key);
	if (tokenDocument.getFlag('elevation-drag-ruler', 'teleportRange') > 0) tokenSpeeds.push('teleport');
	return tokenSpeeds;
}

//Returns the movement a token should used based on settings, terrain, and/or elevation.
export function getMovementMode(token) {
	const tokenDocument = token.document;

	const walkSpeed = parseFloat(getProperty(token, 'actor.system.attributes.movement.walk'));
	const flySpeed = parseFloat(getProperty(token, 'actor.system.attributes.movement.fly'));
	const burrowSpeed = parseFloat(getProperty(token, 'actor.system.attributes.movement.burrow'));
	const climbSpeed = parseFloat(getProperty(token, 'actor.system.attributes.movement.climb'));
	const swimSpeed = parseFloat(getProperty(token, 'actor.system.attributes.movement.swim'));
	const movementModes = {'walk': walkSpeed, 'fly': flySpeed, 'swim': swimSpeed,'burrow': burrowSpeed, 'climb': climbSpeed, 'teleport': 30};

	const settingElevationSwitching = game.settings.get('elevation-drag-ruler', 'elevationSwitching');
	const settingForceFlying = game.settings.get('elevation-drag-ruler', 'forceFlying');
	const settingForceSwimming = game.settings.get('elevation-drag-ruler', 'forceSwimming');
	const settingForceBurrowing = game.settings.get('elevation-drag-ruler', 'forceBurrowing');
	const forceTeleport = tokenDocument.getFlag('elevation-drag-ruler', 'forceTeleport');
	const keybindForceTeleport = tokenDocument.getFlag('elevation-drag-ruler', 'keybindForceTeleport');

	const selectedSpeed = tokenDocument.getFlag('elevation-drag-ruler', 'selectedSpeed');
	// const terrainRulerAvailable = game.modules.get('terrain-ruler')?.active;
	const elevation = tokenDocument.elevation;
	var environments = [];

	// Currently broken, see https://github.com/ironmonk88/enhanced-terrain-layer/issues/111
	// Module will no longer automatically select movement based on terrain.
	// if (terrainRulerAvailable) {
	// 	const terrains = canvas.terrain.terrainFromPixels(tokenDocument.x, tokenDocument.y);
	// 	if (terrains.length > 0)
	// 		terrains.forEach(terrain => environments.push(terrain.environment));
	// }

	//Default movement mode.
	const defaultMovementMode = 'walk';
	
	//
	if (forceTeleport || keybindForceTeleport)
		return 'teleport';
	//If a token has a speed selected use that.
	if (selectedSpeed && selectedSpeed != 'auto')
		return selectedSpeed;
	//If the token has no speed selected and the 'Use Elevation' setting is off, use their swimming speed if they're in water or else their highest speed.
	if (!settingElevationSwitching) {
		if (environments.includes('water') && movementModes.swim > 0)
			return 'swim';
		return getHighestMovementMode(movementModes);
	}
	//If the token has no speed selected and the 'Use Elevation' setting is on, base speed on elevation and terrain (if available).
	if (elevation < 0 && !environments.includes('water'))
	return 'burrow';
	if (elevation < 0 && environments.includes('water'))
	return 'swim';
	if (elevation > 0)
	return 'fly';
	if (elevation == 0 && settingForceFlying && (movementModes.fly > movementModes.walk))
	return 'fly';
	if (elevation == 0 && settingForceSwimming && environments.includes('water') && (movementModes.swim > 0))
	return 'swim';
	if (elevation == 0 && settingForceBurrowing && !environments.includes('water') && (movementModes.burrow > movementModes.walk) && (movementModes.burrow > movementModes.fly))
	return 'burrow';

	return defaultMovementMode;
}

//Returns the total movement already spent from Drag Ruler's movement history.
export function getMovementTotal(token) {
	const combatant = game.combat.getCombatantByToken(token.id);
	const dragRulerFlags = combatant.flags.dragRuler;
	if (!dragRulerFlags) return;
	if (!dragRulerFlags.passedWaypoints) return;
	if (dragRulerFlags.passedWaypoints.length === 0) return;

	var movementTotal = 0;
	dragRulerFlags.passedWaypoints.forEach(waypoint => {
		const visitedSpaces = waypoint.dragRulerVisitedSpaces;
		movementTotal += visitedSpaces[visitedSpaces.length - 1].distance;
	})
	return movementTotal;
}

//Returns true if the token should have a bonus dash.
//This first checks the hasBonusDash flag but if undefined it will look for relevant features that permanently grant bonus dashes.
export function hasBonusDash(token) {
	const hasBonusDash = token.document.getFlag('elevation-drag-ruler', 'hasBonusDash')
	if (hasBonusDash === undefined) {
		const dashFeatures = ['Cunning Action', 'Escape', 'LightFooted', 'Rapid Movement']
		var hasDashFeature = false;
		const items = getProperty(token, 'actor.items');
		items.forEach((value) => {
			if (dashFeatures.includes(value.name)) hasDashFeature = true;
		});
	};
	return hasBonusDash || hasDashFeature;
}

//Returns true if the token is in combat.
export function isTokenInCombat(tokenDocument) {
	return (game.combat && game.combat.getCombatantByToken(tokenDocument._id))
}

//Resets and sets the 'wasProne' flag for all tokens on the canvas.
export function setProneStatus() {
	const tokenDocuments = canvas.tokens.documentCollection
	tokenDocuments.forEach((tokenDocument) => {
		tokenDocument.setFlag('elevation-drag-ruler', 'wasProne', false);
		if (tokenDocument.hasStatusEffect('prone')) tokenDocument.setFlag('elevation-drag-ruler', 'wasProne', true);
	});
}