import { registerSettings } from './settings.js';
import { registerKeybindings } from './keybindings.js';
import { isTokenInCombat, hasBonusDash, getConfiguredEnvironments, getHighestMovementSpeed, getMovementMode, getMovementTotal, setProneStatus } from './util.js';
import { addConfig } from './token_config.js';
import { addSpeedButton, addTerrainButton } from './token_hud.js';
import { dnd5eCost } from './cost_function.js';
import { getDnd5eEnvironments } from './environments.js';
import { modifyPreviousMovementCost } from './movement_tracking.js';

//This function wraps Foundry's onDragLeftStart function.
//This function saves the appropriate movement mode to the token to be used later by the getRanges function.
//This function also tracks if the last used movement option was teleportation to modify the movement history to the appropriate values.
let onDragLeftStart = async function (wrapped, ...args) {
	wrapped(...args);
	if (canvas != null) {
		const token = args[0].data.clones[0];
		const previousMovementMode = token.document.getFlag('elevation-drag-ruler', 'movementMode');
		if (previousMovementMode == 'teleport' && isTokenInCombat(token.document) && game.settings.get('drag-ruler', 'enableMovementHistory')) {
			const teleportCost = token.document.getFlag('elevation-drag-ruler', 'teleportCost') || 0;
			modifyPreviousMovementCost(token, teleportCost);
		};
		const movementMode = getMovementMode(token);
		token.document.setFlag('elevation-drag-ruler', 'movementMode', movementMode);
	}
}

//Register this module's settings to Foundry
Hooks.once('init', () => {
	registerSettings();
	registerKeybindings();
});

Hooks.once('canvasInit', () => {
	if (game.modules.get('enhanced-terrain-layer')?.active) {
    	libWrapper.register('elevation-drag-ruler', 'canvas.terrain.__proto__.calculateCombinedCost', dnd5eCost, libWrapper.OVERRIDE); 
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

Hooks.on('combatStart', (combat, updateData) => {
	setProneStatus();
});

Hooks.on('combatRound', (combat, updateData, updateOptions) => {
	setProneStatus();
});

Hooks.on('combatTurn', (combat, updateData, updateOptions) => {
	setProneStatus();
});

//Hooking into Drag Ruler.
Hooks.once('dragRuler.ready', (SpeedProvider) => {
	class DnD5eSpeedProvider extends SpeedProvider {
		//An array of colors to be used by the movement ranges.
		get colors() {
			return [
				{id: 'walk', default: 0x00FF00, 'name': 'Walking'},
				{id: 'fly', default: 0x00FFFF, 'name': 'Flying'},
				{id: 'swim', default: 0x0000FF, 'name': 'Swimming'},
				{id: 'burrow', default: 0xFFAA00, 'name': 'Burrowing'},
				{id: 'climb', default: 0xAA6600, 'name': 'Climbing'},
				{id: 'teleport', default: 0xAA00AA, 'name': 'Teleporting'},
				{id: 'dash', default: 0xFFFF00, 'name': 'Dashing'},
				{id: 'bonusDash', default: 0xFF6600, 'name': 'Bonus Dashing'},
			]
		}

		//This is called by Drag Ruler once when a token starts being dragged. Does not get called again when setting a waypoint.
		getRanges(token) {
			//Retrieves the total movement in the token's movement history to be used by the teleportation range.
			var movementTotal = 0;
			if (isTokenInCombat(token.document) && game.settings.get('drag-ruler', 'enableMovementHistory')) movementTotal = getMovementTotal(token) || 0;

			//Retrieves and compiles relevant movement data of the token.
			const walkSpeed = parseFloat(getProperty(token, 'actor.system.attributes.movement.walk'));
			const flySpeed = parseFloat(getProperty(token, 'actor.system.attributes.movement.fly'));
			const burrowSpeed = parseFloat(getProperty(token, 'actor.system.attributes.movement.burrow'));
			const climbSpeed = parseFloat(getProperty(token, 'actor.system.attributes.movement.climb'));
			const swimSpeed = parseFloat(getProperty(token, 'actor.system.attributes.movement.swim'));
			const teleportRange = token.document.getFlag('elevation-drag-ruler', 'teleportRange');
			const movementModes = {'walk': walkSpeed, 'fly': flySpeed, 'swim': swimSpeed,'burrow': burrowSpeed, 'climb': climbSpeed, 'teleport': movementTotal + teleportRange};
			const movementMode = token.document.getFlag('elevation-drag-ruler', 'movementMode');
			
			//Teleportation does not require speed modifiers or dash ranges.
			if (movementMode == 'teleport') {
				return [{range: movementModes['teleport'], color: 'teleport'}]
			}
			//Applies various modifiers to the movement speeds of the token depending on its conditions and features.
			else {
				//Any of these conditions set a creature's speed to 0.
				var movementRestricted = false;
				const movementRestrictions = ['dead', 'grappled', 'incapacitated', 'paralysis', 'petrified', 'restrain', 'sleep', 'stun', 'unconscious'];
				movementRestrictions.forEach(condition => {
					if (token.document.hasStatusEffect(condition)) movementRestricted = true;
				});
				//Creatures can be slowed or hasted to half or double their available movement speeds respectively.
				const movementMultiplier = (token.document.hasStatusEffect('slowed') ? 0.5 : 1) * (token.document.hasStatusEffect('hasted') ? 2 : 1);
				//
				const wasProne = token.document.getFlag('elevation-drag-ruler', 'wasProne');
				var movementModifier = 0;
				if (wasProne && !token.document.hasStatusEffect('prone') && isTokenInCombat(token.document)) {
					movementModifier = token.document.getFlag('elevation-drag-ruler', 'proneCost') || getHighestMovementSpeed(token.document) / 2;
				}
				
				//Retrieves if the token has a bonus action dash available.
				const bonusDashMultiplier = hasBonusDash(token) ? 2 : 1;

				const movementRange = movementRestricted ? 0 : (movementModes[movementMode] * movementMultiplier);
				const modifiedMovementRange = movementRestricted ? 0 : (movementRange - movementModifier);
				return [{range: modifiedMovementRange, color: movementMode}, {range: modifiedMovementRange + movementRange, color: 'dash'}, {range: modifiedMovementRange + (movementRange * bonusDashMultiplier), color: 'bonusDash'}];
			}
		}
	}
	//Registers the speed provider to be used by Drag Ruler's API.
	dragRuler.registerModule('elevation-drag-ruler', DnD5eSpeedProvider)
});

// Hooks.once("enhancedTerrainLayer.ready", (RuleProvider) => {
// 	class DnD5eRuleProvider extends RuleProvider {
// 		calculateCombinedCost(terrain, options) {
// 			const token = options.token;
// 			const waterTerrain = ['water'];
// 			const spellTerrain = ['controlWinds', 'gustOfWind', 'plantGrowth', 'wallOfSand', 'wallOfThorns'];
// 			const settingFlyingElevation = game.settings.get('elevation-drag-ruler', 'flyingElevation');		
// 			//Set default parameters in case the ruler is not attached to a token.
// 			var movementMode = 'walk';
// 			var tokenElevation = 0;
// 			var difficultTerrainCost = 1;
// 			var waterCost = 1;
// 			var otherCost = 1;
// 			var crawlingCost = 1;
// 			var configuredEnvironments = {'all': {'any': false, 'walk': false, 'swim': false, 'fly': false, 'burrow': false, 'climb': false}, 'arctic': {'any': false, 'walk': false, 'swim': false, 'fly': false, 'burrow': false, 'climb': false}, 'coast': {'any': false, 'walk': false, 'swim': false, 'fly': false, 'burrow': false, 'climb': false}, 'desert': {'any': false, 'walk': false, 'swim': false, 'fly': false, 'burrow': false, 'climb': false}, 'forest': {'any': false, 'walk': false, 'swim': false, 'fly': false, 'burrow': false, 'climb': false}, 'grassland': {'any': false, 'walk': false, 'swim': false, 'fly': false, 'burrow': false, 'climb': false}, 'jungle': {'any': false, 'walk': false, 'swim': false, 'fly': false, 'burrow': false, 'climb': false}, 'mountain': {'any': false, 'walk': false, 'swim': false, 'fly': false, 'burrow': true, 'climb': true}, 'swamp': {'any': false, 'walk': false, 'swim': false, 'fly': false, 'burrow': false, 'climb': false}, 'underdark': {'any': false, 'walk': false, 'swim': false, 'fly': false, 'burrow': false, 'climb': false}, 'urban': {'any': false, 'walk': false, 'swim': false, 'fly': false, 'burrow': false, 'climb': false}, 'water': {'any': false, 'walk': false, 'swim': true, 'fly': false, 'burrow': false, 'climb': false}};	
// 			//If the ruler is attached to a token, overwrite the default parameters.
// 			if (token) {
// 				const tokenDocument = token.document;
// 				movementMode = tokenDocument.getFlag('elevation-drag-ruler', 'movementMode');
// 				tokenElevation = tokenDocument.elevation;
// 				crawlingCost = tokenDocument.hasStatusEffect("prone") ? 2 : 1;		
// 				configuredEnvironments = getConfiguredEnvironments(tokenDocument);	
// 			}
// 			var terrainDocuments = [];
// 			if (!configuredEnvironments['all'][movementMode] && !configuredEnvironments['all']['any'] && movementMode != 'teleport') {
// 				terrain.forEach(x => {
// 					if ('terrain' in x) {
// 						const terrainDocument = x.terrain.document;
// 						const terrainEnvironment = terrainDocument.environment;
// 						var ignoreTerrain = (settingFlyingElevation && movementMode == 'fly' && tokenElevation == terrainDocument.elevation + terrainDocument.depth);
// 						if (!ignoreTerrain && terrainEnvironment != '') ignoreTerrain = (configuredEnvironments[terrainEnvironment][movementMode] || configuredEnvironments[terrainEnvironment]['any']);
// 						if (!ignoreTerrain) terrainDocuments.push(terrainDocument);
// 					}
// 					else difficultTerrainCost = 2;
// 				});
// 				terrainDocuments.forEach(terrainDocument => {
// 					const terrainEnvironment = terrainDocument.environment;
// 					const terrainObstacle = terrainDocument.obstacle;
// 					const terrainCost = terrainDocument.multiple;
// 					if (waterTerrain.includes(terrainEnvironment)) waterCost = Math.max(waterCost, terrainCost);
// 					else if (spellTerrain.includes(terrainEnvironment) || spellTerrain.includes(terrainObstacle)) otherCost = Math.max(otherCost, terrainCost);
// 					else difficultTerrainCost = Math.max(difficultTerrainCost, terrainCost);
// 				});
// 			}
		
// 			const movementCost = Math.max(1 + (waterCost - 1) + (difficultTerrainCost - 1) + (crawlingCost - 1), otherCost);
// 			return movementCost;
// 		}
// 	}
// 	enhancedTerrainLayer.registerModule("elevation-drag-ruler", DnD5eRuleProvider);
// });