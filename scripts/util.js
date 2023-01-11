import { keybindForceTeleport } from "./keybindings.js";

//Returns the environment configuration of a token, which sets which environments a token should ignore. 
export function getConfiguredEnvironments(tokenDocument) {
	const defaultConfiguredEnvironments = {'all': {'any': false, 'walk': false, 'swim': false, 'fly': false, 'burrow': false, 'climb': false}, 'arctic': {'any': false, 'walk': false, 'swim': false, 'fly': false, 'burrow': false, 'climb': false}, 'coast': {'any': false, 'walk': false, 'swim': false, 'fly': false, 'burrow': false, 'climb': false}, 'desert': {'any': false, 'walk': false, 'swim': false, 'fly': false, 'burrow': false, 'climb': false}, 'forest': {'any': false, 'walk': false, 'swim': false, 'fly': false, 'burrow': false, 'climb': false}, 'grassland': {'any': false, 'walk': false, 'swim': false, 'fly': false, 'burrow': false, 'climb': false}, 'jungle': {'any': false, 'walk': false, 'swim': false, 'fly': false, 'burrow': false, 'climb': false}, 'mountain': {'any': false, 'walk': false, 'swim': false, 'fly': false, 'burrow': true, 'climb': true}, 'swamp': {'any': false, 'walk': false, 'swim': false, 'fly': false, 'burrow': false, 'climb': false}, 'underdark': {'any': false, 'walk': false, 'swim': false, 'fly': false, 'burrow': false, 'climb': false}, 'urban': {'any': false, 'walk': false, 'swim': false, 'fly': false, 'burrow': false, 'climb': false}, 'water': {'any': false, 'walk': false, 'swim': true, 'fly': false, 'burrow': false, 'climb': false}};
	var configuredEnvironments = tokenDocument.getFlag('elevation-drag-ruler', 'ignoredEnvironments');
	return configuredEnvironments || defaultConfiguredEnvironments;
};

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
};

//Returns the highest movement speed of a token.
export function getHighestMovementSpeed(tokenDocument) {
	const actor = tokenDocument._actor || tokenDocument.parent;
	const walkSpeed = actor.system.attributes.movement.walk;
	const flySpeed = actor.system.attributes.movement.fly
	const burrowSpeed = actor.system.attributes.movement.burrow
	const climbSpeed = actor.system.attributes.movement.climb
	const swimSpeed = actor.system.attributes.movement.swim
	return Math.max(walkSpeed, flySpeed, burrowSpeed, climbSpeed, swimSpeed);
};

//Returns the non-zero movement speeds of a token, including the module's automatic mode and an optional teleportation mode.
export function getTokenSpeeds(tokenDocument) {
	const actor = tokenDocument._actor || tokenDocument.parent;
	if (!actor) return false;
	const defaultSpeeds = actor.system.attributes.movement;
	var tokenSpeeds = ['auto'] ;
	for (var [key, value] of Object.entries(defaultSpeeds)) {
		if (value > 0 && key != 'hover') 
			switch (key) {
				case 'land':
					key = 'walk';
					break;
				case 'water':
					key = 'swim';
					break;
				case 'air':
					key = 'fly';
					break;
			};
			tokenSpeeds.push(key);
	}
	if (game.settings.get('elevation-drag-ruler', 'teleport') && game.modules.get('terrain-ruler')?.active && tokenDocument.getFlag('elevation-drag-ruler', 'teleportRange') > 0) tokenSpeeds.push('teleport');
	return tokenSpeeds;
};

//Returns the movement a token should used based on settings, terrain, and/or elevation.
export function getMovementMode(token) {
	const tokenDocument = token.document;
	const tokenType = tokenDocument.actor.type;
	var tokenMovement = {};
	var walkSpeed = 0;
	var swimSpeed = 0;
	var flySpeed = 0;
	var burrowSpeed = 0;
	var climbSpeed = 0;

	if (tokenType == 'group') {
		tokenMovement = tokenDocument.actorData.system.attributes.movement;
		walkSpeed = tokenMovement.land;
		swimSpeed = tokenMovement.water;
		flySpeed = tokenMovement.air;
	}
	else {
		tokenMovement = tokenDocument.actor.system.attributes.movement;
		walkSpeed = tokenMovement.walk;
		swimSpeed = tokenMovement.swim;
		flySpeed = tokenMovement.fly;
		burrowSpeed = tokenMovement.burrow;
		climbSpeed = tokenMovement.climb;
	}
	const movementModes = {'walk': walkSpeed, 'fly': flySpeed, 'swim': swimSpeed,'burrow': burrowSpeed, 'climb': climbSpeed};

	const settingElevationSwitching = game.settings.get('elevation-drag-ruler', 'elevationSwitching');
	const settingForceFlying = game.settings.get('elevation-drag-ruler', 'forceFlying');
	const settingForceSwimming = game.settings.get('elevation-drag-ruler', 'forceSwimming');
	const settingForceBurrowing = game.settings.get('elevation-drag-ruler', 'forceBurrowing');
	const forceTeleport = tokenDocument.getFlag('elevation-drag-ruler', 'forceTeleport');
	const selectedSpeed = tokenDocument.getFlag('elevation-drag-ruler', 'selectedSpeed');
	const elevation = tokenDocument.elevation;
	var environments = [];

	const terrainRulerAvailable = game.modules.get('terrain-ruler')?.active;
	if (terrainRulerAvailable) {
		const options = {};
		options.token = token;
		const terrains = canvas.terrain.terrainFromPixels(tokenDocument.x, tokenDocument.y, options);
		if (terrains.length > 0)
			terrains.forEach(terrain => environments.push(terrain.document.environment));
	}

	//Default movement mode.
	const defaultMovementMode = 'walk';
	
	if (game.settings.get('elevation-drag-ruler', 'teleport') && terrainRulerAvailable && (forceTeleport || keybindForceTeleport || selectedSpeed == 'teleport'))
		return 'teleport';
	//If a token has a speed selected use that.
	if (selectedSpeed && selectedSpeed != 'auto' && selectedSpeed != 'teleport')
		return selectedSpeed;
	//If the token has no speed selected and the 'Use Elevation' setting is off, use their swimming speed if they're in water or else their highest speed.
	if (!settingElevationSwitching) {
		if (environments.includes('water') && movementModes.swim > 0)
			return 'swim';
		return getHighestMovementMode(movementModes);
	}
	//If the token has no speed selected and the 'Use Elevation' setting is on, base speed on elevation and terrain (if available).
	if (elevation < 0 && !environments.includes('water') && movementModes.burrow > 0)
		return 'burrow';
	if (elevation < 0 && environments.includes('water') && movementModes.swim > 0)
		return 'swim';
	if (elevation > 0 && movementModes.fly > 0)
		return 'fly';
	
	if (elevation == 0 && settingForceSwimming && environments.includes('water') && (movementModes.swim > 0))
		return 'swim';
	if (elevation == 0 && settingForceFlying && (movementModes.fly > movementModes.walk))
		return 'fly';
	if (elevation == 0 && settingForceBurrowing && !environments.includes('water') && (movementModes.burrow > movementModes.walk) && (movementModes.burrow > movementModes.fly))
		return 'burrow';

	return defaultMovementMode;
};

//Returns the total movement already spent from Drag Ruler's movement history.
export function getMovementTotal(token) {
	const combatant = game.combat.getCombatantByToken(token.id);
	const dragRulerFlags = combatant.flags.dragRuler;
	if (!dragRulerFlags) return;
	if (!dragRulerFlags.passedWaypoints) return;
	if (dragRulerFlags.passedWaypoints.length === 0) return;

	var movementTotal = 0;
	var incompatible = false;
	dragRulerFlags.passedWaypoints.forEach(waypoint => {
		const visitedSpaces = waypoint.dragRulerVisitedSpaces;
		if (visitedSpaces) movementTotal += visitedSpaces[visitedSpaces.length - 1].distance;
		else incompatible = true;
	});
	if (incompatible) return dragRuler.getMovedDistanceFromToken(token);
	return movementTotal;
};

export function hasCondition(tokenDocument, searchList) {
	const conditionFound = searchList.find(condition => tokenDocument.hasStatusEffect(condition))
	return conditionFound !== undefined;
}

export function hasFeature(tokenDocument, flag, searchList) {
	const hasFlag = tokenDocument.getFlag('elevation-drag-ruler', flag);
	if (hasFlag !== undefined) return hasFlag;
	
	const actor = tokenDocument._actor || tokenDocument.parent;
	if (!actor) return false;

	const actorFeatures = actor.items.filter(feature => feature.type == 'feat').map(feature => feature.name);
	const featureFound = searchList.find(searchFeature => actorFeatures.includes(searchFeature));
	return featureFound !== undefined;
};

//Returns true if the token is in combat.
export function isTokenInCombat(tokenDocument) {
	return (game.combat && game.combat.getCombatantByToken(tokenDocument._id))
};