import {addConfig} from "./token_config.js";
import {addSpeedButton, addTerrainButton} from "./token_hud.js";

export function getTokenSpeeds(tokenDocument) {
	const defaultSpeeds = tokenDocument._actor.system.attributes.movement;
	var tokenSpeeds = ['auto'] ;
	for (const [key, value] of Object.entries(defaultSpeeds)) {
		if (value > 0 && key != 'hover') tokenSpeeds.push(key);
	}
	return tokenSpeeds;
}

export function getConfiguredEnvironments(tokenDocument) {
	const defaultConfiguredEnvironments = {'all': {"any": false, "walk": false, "swim": false, "fly": false, "burrow": false, "climb": false}, 'arctic': {"any": false, "walk": false, "swim": false, "fly": false, "burrow": false, "climb": false}, 'coast': {"any": false, "walk": false, "swim": false, "fly": false, "burrow": false, "climb": false}, 'desert': {"any": false, "walk": false, "swim": false, "fly": false, "burrow": false, "climb": false}, 'forest': {"any": false, "walk": false, "swim": false, "fly": false, "burrow": false, "climb": false}, 'grassland': {"any": false, "walk": false, "swim": false, "fly": false, "burrow": false, "climb": false}, 'jungle': {"any": false, "walk": false, "swim": false, "fly": false, "burrow": false, "climb": false}, 'mountain': {"any": false, "walk": false, "swim": false, "fly": false, "burrow": true, "climb": true}, 'swamp': {"any": false, "walk": false, "swim": false, "fly": false, "burrow": false, "climb": false}, 'underdark': {"any": false, "walk": false, "swim": false, "fly": false, "burrow": false, "climb": false}, 'urban': {"any": false, "walk": false, "swim": false, "fly": false, "burrow": false, "climb": false}, 'water': {"any": false, "walk": false, "swim": true, "fly": false, "burrow": false, "climb": false}}
	var configuredEnvironments = tokenDocument.getFlag('elevation-drag-ruler', 'ignoredEnvironments');
	return configuredEnvironments || defaultConfiguredEnvironments;
}

function getMovementMode(token) {
	const tokenDocument = token.document;

	const walkSpeed = parseFloat(getProperty(token, 'actor.system.attributes.movement.walk'));
	const flySpeed = parseFloat(getProperty(token, 'actor.system.attributes.movement.fly'));
	const burrowSpeed = parseFloat(getProperty(token, 'actor.system.attributes.movement.burrow'));
	const climbSpeed = parseFloat(getProperty(token, 'actor.system.attributes.movement.climb'));
	const swimSpeed = parseFloat(getProperty(token, 'actor.system.attributes.movement.swim'));
	const movementModes = {'walk': walkSpeed, 'fly': flySpeed, 'swim': swimSpeed,'burrow': burrowSpeed, 'climb': climbSpeed};

	const settingElevationSwitching = game.settings.get('drag-ruler', 'speedProviders.module.elevation-drag-ruler.setting.elevationSwitching');
	const settingForceFlying = game.settings.get('drag-ruler', 'speedProviders.module.elevation-drag-ruler.setting.forceFlying');
	const settingForceSwimming = game.settings.get('drag-ruler', 'speedProviders.module.elevation-drag-ruler.setting.forceSwimming');
	const settingForceBurrowing = game.settings.get('drag-ruler', 'speedProviders.module.elevation-drag-ruler.setting.forceBurrowing');

	const selectedSpeed = tokenDocument.getFlag('elevation-drag-ruler', 'selectedSpeed');
	const terrainRulerAvailable = game.modules.get('terrain-ruler')?.active;
	const elevation = tokenDocument.elevation;
	var environments = [];

	// if (terrainRulerAvailable) {
	// 	const terrains = canvas.terrain.terrainFromPixels(tokenDocument.x, tokenDocument.y);
	// 	if (terrains.length > 0)
	// 		terrains.forEach(terrain => environments.push(terrain.environment));
	// }

	//Default movement mode.
	var movementMode = 'walk';
	
	//If a token has a speed selected use that.
	if (selectedSpeed && selectedSpeed != 'auto') {
		movementMode = selectedSpeed;
	}
	//If the token has no speed selected and the 'Use Elevation' setting is off, use their swimming speed if they're in water or else their highest speed.
	else if (!settingElevationSwitching) {
		if (environments.includes('water') && movementModes.swim > 0) {
			movementMode = 'swim';
		}
		else {
			movementMode = this.getHighestSpeed(movementModes);
		}
	}
	//If the token has no speed selected and the 'Use Elevation' setting is on, base speed on elevation and terrain (if available)
	else {
		if (elevation < 0 && !environments.includes('water'))
			movementMode = 'burrow';
		if (elevation < 0 && environments.includes('water'))
			movementMode = 'swim';
		if (elevation > 0)
			movementMode = 'fly';
		if (elevation == 0 && settingForceFlying && (movementModes.fly > movementModes.walk))
			movementMode = 'fly';
		if (elevation == 0 && settingForceSwimming && environments.includes('water') && (movementModes.swim > 0))
			movementMode = 'swim';
		if (elevation == 0 && settingForceBurrowing && !environments.includes('water') && (movementModes.burrow > movementModes.walk) && (movementModes.burrow > movementModes.fly))
			movementMode = 'burrow';
	}
	return movementMode;
}

function dnd5eCost(terrain, options={}) {
	const token = options.token;
	const movementMode = token.document.getFlag('elevation-drag-ruler', 'movementMode');
	console.log(movementMode)
	return 1
}

let onDragLeftStart = async function (wrapped, ...args) {
	wrapped(...args);
	if (canvas != null) {
		const token = args[0].data.clones[0];

		const movementMode = getMovementMode(token);
		token.document.setFlag('elevation-drag-ruler', 'movementMode', movementMode);
	}
}
//Hooking into Drag Ruler when it's ready.
Hooks.once('dragRuler.ready', (SpeedProvider) => {
	class DnD5eSpeedProvider extends SpeedProvider {
		//This function is called by Drag Ruler and implements these speedruler settings.
		get settings() {
			return [
				{
					id: 'elevationSwitching',
					name: 'Use Elevation',
					hint: 'Tokens with their movement speed set to automatic will take into account their elevation. When disabled it will use their highest movement speed instead.',
					scope: 'world',
					config: true,
					type: Boolean,
					default: true
				},
				{
					id: 'flyingElevation',
					name: 'Elevate Flying',
					hint: 'Flying tokens will be treated as if they were 1 elevation higher for the purpose of ignoring difficult terrain.',
					scope: 'world',
					config: true,
					type: Boolean,
					default: true
				},
				{
					id: 'forceFlying',
					name: 'Force Flying',
					hint: 'Tokens at elevation 0 will default to their flying speed if it is bigger than their walking speed',
					scope: 'world',
					config: true,
					type: Boolean,
					default: true
				},
				{
					id: 'forceSwimming',
					name: 'Force Swimming',
					hint: 'Tokens at elevation 0 and in water terrain will default to their swimming speed if it is bigger than their walking and flying speed.',
					scope: 'world',
					config: true,
					type: Boolean,
					default: true
				},
				{
					id: 'forceBurrowing',
					name: 'Force Burrowing',
					hint: 'Tokens at elevation 0 but not in water terrain will default to their burrowing speed if it is bigger than their walking and flying speed.',
					scope: 'world',
					config: true,
					type: Boolean,
					default: true
				},
				{
					id: 'hideSpeedButton',
					name: 'Hide "Switch Speed" Button',
					hint: 'Hides the "Switch Speed" button from the Token HUD for the current user.',
					scope: 'client',
					config: true,
					type: Boolean,
					default: false
				},
				{
					id: 'restrictSpeedButton',
					name: 'Restrict the "Switch Speed" Button',
					hint: 'Restricts the "Switch Speed" button to a minimal permission level.',
					scope: "world",
					config: true,
					default: "1",
					choices: {1: "Player", 2: "Trusted", 3: "Assistant", 4: "Game Master"},
					type: String
				},
				{
					id: 'hideTerrainButton',
					name: 'Hide "Toggle Terrain" Button',
					hint: 'Hides the "Toggle Terrain" button from the Token HUD for the current user.',
					scope: 'client',
					config: true,
					type: Boolean,
					default: false
				},
				{
					id: 'restrictTerrainButton',
					name: 'Restrict the "Toggle Terrain" Button',
					hint: 'Restricts the "Toggle Terrain" button to a minimal permission level.',
					scope: "world",
					config: true,
					default: "1",
					choices: {1: "Player", 2: "Trusted", 3: "Assistant", 4: "Game Master"},
					type: String
				}
			]
		}
		
		//An array of colors to be used by the movement ranges.
		get colors() {
			return [
				{id: 'walk', default: 0x00FF00, 'name': 'walking'},
				{id: 'walkDash', default: 0xFFFF00, 'name': 'dash walking'},
				{id: 'fly', default: 0x00FFFF, 'name': 'flying'},
				{id: 'flyDash', default: 0xFFFF00, 'name': 'dash flying'},
				{id: 'swim', default: 0x0000FF, 'name': 'swimming'},
				{id: 'swimDash', default: 0xFFFF00, 'name': 'dash swimming'},
				{id: 'burrow', default: 0xFFAA00, 'name': 'burrowing'},
				{id: 'burrowDash', default: 0xFFFF00, 'name': 'dash burrowing'},
				{id: 'climb', default: 0xAA6600, 'name': 'climbing'},
				{id: 'climbDash', default: 0xFFFF00, 'name': 'dash climbing'}
			]
		}
		
		getHighestSpeed(movementModes) {
			var highestSpeed = 0;
			var highestMovement = 'walk';
			for (const [key, value] of Object.entries(movementModes)) {
				if (value > highestSpeed && key != 'hover') {
					highestSpeed = value;
					highestMovement = key;
				}
			}
			return highestMovement;
		}

		//This is called by Drag Ruler once when a token starts being dragged. Does not get called again when setting a waypoint.
		getRanges(token) {
			const walkSpeed = parseFloat(getProperty(token, 'actor.system.attributes.movement.walk'));
			const flySpeed = parseFloat(getProperty(token, 'actor.system.attributes.movement.fly'));
			const burrowSpeed = parseFloat(getProperty(token, 'actor.system.attributes.movement.burrow'));
			const climbSpeed = parseFloat(getProperty(token, 'actor.system.attributes.movement.climb'));
			const swimSpeed = parseFloat(getProperty(token, 'actor.system.attributes.movement.swim'));

			const movementModes = {'walk': walkSpeed, 'fly': flySpeed, 'swim': swimSpeed,'burrow': burrowSpeed, 'climb': climbSpeed};
			const movementMode = token.document.getFlag('elevation-drag-ruler', 'movementMode');
			const speedColor = movementMode;
			const dashColor = movementMode + 'Dash';

			return [{range: movementModes[movementMode], color: speedColor}, {range: movementModes[movementMode] * 2, color: dashColor}];
		}
	}

	dragRuler.registerModule('elevation-drag-ruler', DnD5eSpeedProvider)
})

Hooks.on('renderTokenHUD', (app, html, data) => {
	if (!game.settings.get('drag-ruler', 'speedProviders.module.elevation-drag-ruler.setting.hideSpeedButton') && !app.object.document.getFlag('elevation-drag-ruler', 'hideSpeedButton') && game.user.role >= game.settings.get('drag-ruler', 'speedProviders.module.elevation-drag-ruler.setting.restrictSpeedButton'))
		addSpeedButton(data._id, html);
	if (!game.settings.get('drag-ruler', 'speedProviders.module.elevation-drag-ruler.setting.hideTerrainButton') && !app.object.document.getFlag('elevation-drag-ruler', 'hideTerrainButton') && game.modules.get('terrain-ruler')?.active && game.user.role >= game.settings.get('drag-ruler', 'speedProviders.module.elevation-drag-ruler.setting.restrictTerrainButton'))
		addTerrainButton(data._id, html);
});

Hooks.on('renderTokenConfig', addConfig)

Hooks.once("canvasInit", () => {
    libWrapper.register("elevation-drag-ruler", "canvas.terrain.__proto__.calculateCombinedCost", dnd5eCost, libWrapper.OVERRIDE); 
	libWrapper.register("elevation-drag-ruler", "Token.prototype._onDragLeftStart", onDragLeftStart, "WRAPPER");
});