import {getConfiguredEnvironments} from "./util.js";

//Returns a movement cost depending on conditions, terrain, movement mode, settings, and configurations.
export function dnd5eCost(terrain, options={}) {
	const token = options.token;
	
	const waterTerrain = ['water'];
	const spellTerrain = ['controlWinds', 'gustOfWind', 'plantGrowth', 'wallOfSand', 'wallOfThorns'];
	const settingFlyingElevation = game.settings.get('elevation-drag-ruler', 'flyingElevation');
	
	//Set default parameters in case the ruler is not attached to a token.
	var movementMode = 'walk';
	var tokenElevation = 0;
	var difficultTerrainCost = 1;
	var waterCost = 1;
	var otherCost = 1;
	var crawlingCost = 1;
	var configuredEnvironments = {'all': {'any': false, 'walk': false, 'swim': false, 'fly': false, 'burrow': false, 'climb': false}, 'arctic': {'any': false, 'walk': false, 'swim': false, 'fly': false, 'burrow': false, 'climb': false}, 'coast': {'any': false, 'walk': false, 'swim': false, 'fly': false, 'burrow': false, 'climb': false}, 'desert': {'any': false, 'walk': false, 'swim': false, 'fly': false, 'burrow': false, 'climb': false}, 'forest': {'any': false, 'walk': false, 'swim': false, 'fly': false, 'burrow': false, 'climb': false}, 'grassland': {'any': false, 'walk': false, 'swim': false, 'fly': false, 'burrow': false, 'climb': false}, 'jungle': {'any': false, 'walk': false, 'swim': false, 'fly': false, 'burrow': false, 'climb': false}, 'mountain': {'any': false, 'walk': false, 'swim': false, 'fly': false, 'burrow': true, 'climb': true}, 'swamp': {'any': false, 'walk': false, 'swim': false, 'fly': false, 'burrow': false, 'climb': false}, 'underdark': {'any': false, 'walk': false, 'swim': false, 'fly': false, 'burrow': false, 'climb': false}, 'urban': {'any': false, 'walk': false, 'swim': false, 'fly': false, 'burrow': false, 'climb': false}, 'water': {'any': false, 'walk': false, 'swim': true, 'fly': false, 'burrow': false, 'climb': false}};
	
	//If the ruler is attached to a token, overwrite the default parameters.
	if (token) {
		const tokenDocument = token.document;
		movementMode = tokenDocument.getFlag('elevation-drag-ruler', 'movementMode');
		tokenElevation = tokenDocument.elevation;
		crawlingCost = tokenDocument.hasStatusEffect("prone") ? 2 : 1;		
		configuredEnvironments = getConfiguredEnvironments(tokenDocument);	
	}

	var terrainDocuments = [];
	if (!configuredEnvironments['all'][movementMode] && !configuredEnvironments['all']['any'] && movementMode != 'teleport') {
		terrain.forEach(x => {
			if ('terrain' in x) {
				const terrainDocument = x.terrain.document;
				const terrainEnvironment = terrainDocument.environment;

				var ignoreTerrain = (settingFlyingElevation && movementMode == 'fly' && tokenElevation == terrainDocument.elevation + terrainDocument.depth);
				if (!ignoreTerrain && terrainEnvironment != '') ignoreTerrain = (configuredEnvironments[terrainEnvironment][movementMode] || configuredEnvironments[terrainEnvironment]['any']);
				
				if (!ignoreTerrain) terrainDocuments.push(terrainDocument);
			}
			else difficultTerrainCost = 2;
		});
		terrainDocuments.forEach(terrainDocument => {
			const terrainEnvironment = terrainDocument.environment;
			const terrainObstacle = terrainDocument.obstacle;
			const terrainCost = terrainDocument.multiple;
			if (waterTerrain.includes(terrainEnvironment)) waterCost = Math.max(waterCost, terrainCost);
			else if (spellTerrain.includes(terrainEnvironment) || spellTerrain.includes(terrainObstacle)) otherCost = Math.max(otherCost, terrainCost);
			else difficultTerrainCost = Math.max(difficultTerrainCost, terrainCost);
		});
	}

	const movementCost = Math.max(1 + (waterCost - 1) + (difficultTerrainCost - 1) + (crawlingCost - 1), otherCost);
	return movementCost;
}