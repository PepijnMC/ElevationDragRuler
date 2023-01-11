import { getConfiguredEnvironments, hasCondition, hasFeature } from "./util.js";

Hooks.once("enhancedTerrainLayer.ready", (RuleProvider) => {
	class DnD5eRuleProvider extends RuleProvider {
		calculateCombinedCost(terrain, options) {
			const token = options.token || canvas.tokens.controlled[0];
	
			const tokenSizes = {'tiny': 0, 'sm': 1, 'med': 2, 'lg': 3, 'huge': 4, 'grg': 5};
			const incapacitatedConditions = ['dead', 'incapacitated', 'paralysis', 'petrified', 'sleep', 'stun', 'unconscious'];
			const settingTokenTerrain = game.settings.get('elevation-drag-ruler', 'tokenTerrain');
			const settingFlyingElevation = game.settings.get('elevation-drag-ruler', 'flyingElevation');
			const settingOneDnd = game.settings.get('elevation-drag-ruler', 'oneDnd');
			const waterTerrain = ['water'];
			const spellTerrain = ['controlWinds', 'gustOfWind', 'plantGrowth', 'wallOfSand', 'wallOfThorns'];
			
			//Set default parameters in case the ruler is not attached to a token.
			var movementMode = 'walk';
			var tokenElevation = 0;
			var tokenSize = 'medium';
			var tokenDisposition = 1;
			var movementSizeOffset = {smaller: -1, bigger: 1};
			var canMoveThroughTokens = false;
			var hasFreedomofMovement = false;

			var baseCost = 1;
			var difficultTerrainCost = 1;
			var tokenCost = 1;
			var waterCost = 1;
			var crawlingCost = 1;
			var configuredEnvironments = {'all': {'any': false, 'walk': false, 'swim': false, 'fly': false, 'burrow': false, 'climb': false}, 'arctic': {'any': false, 'walk': false, 'swim': false, 'fly': false, 'burrow': false, 'climb': false}, 'coast': {'any': false, 'walk': false, 'swim': false, 'fly': false, 'burrow': false, 'climb': false}, 'desert': {'any': false, 'walk': false, 'swim': false, 'fly': false, 'burrow': false, 'climb': false}, 'forest': {'any': false, 'walk': false, 'swim': false, 'fly': false, 'burrow': false, 'climb': false}, 'grassland': {'any': false, 'walk': false, 'swim': false, 'fly': false, 'burrow': false, 'climb': false}, 'jungle': {'any': false, 'walk': false, 'swim': false, 'fly': false, 'burrow': false, 'climb': false}, 'mountain': {'any': false, 'walk': false, 'swim': false, 'fly': false, 'burrow': true, 'climb': true}, 'swamp': {'any': false, 'walk': false, 'swim': false, 'fly': false, 'burrow': false, 'climb': false}, 'underdark': {'any': false, 'walk': false, 'swim': false, 'fly': false, 'burrow': false, 'climb': false}, 'urban': {'any': false, 'walk': false, 'swim': false, 'fly': false, 'burrow': false, 'climb': false}, 'water': {'any': false, 'walk': false, 'swim': true, 'fly': false, 'burrow': false, 'climb': false}};
			
			//If the ruler is attached to a token, overwrite the default parameters.
			if (token) {
				const tokenDocument = token.document;
				movementMode = tokenDocument.getFlag('elevation-drag-ruler', 'movementMode');
				tokenElevation = tokenDocument.elevation;
				tokenSize = getProperty(token, 'actor.system.traits.size');
				tokenDisposition = tokenDocument.disposition;
				movementSizeOffset = {smaller: -1, bigger: hasFeature(tokenDocument, 'hasNimbleness', ['Halfling', 'Halfling Nimbleness']) ? 0 : 1};
				canMoveThroughTokens = hasFeature(tokenDocument, 'canMoveThroughTokens', ['Air Form', 'Fire Form', 'Water Form', 'Incorporeal Movement', 'Swarm']);
				hasFreedomofMovement = hasFeature(tokenDocument, 'hasFreedomofMovement', ['Freedom of Movement']);

				crawlingCost = hasCondition(tokenDocument, ['prone']) ? 2 : 1;		
				configuredEnvironments = getConfiguredEnvironments(tokenDocument);	
			}
		
			var terrainList = [];
			if (movementMode != 'teleport' && !configuredEnvironments['all']['any'] && !configuredEnvironments['all'][movementMode]) {
				terrain.forEach(x => {
					var terrainInfo = {};
					if ('terrain' in x) {
						terrainInfo = x.terrain.document;
					}
					else if ('template' in x) {
						terrainInfo = x.template.document.flags['enhanced-terrain-layer'];
					}
					if (Object.keys(terrainInfo).length > 0) {
						const terrainEnvironment = terrainInfo.environment;
		
						var ignoreTerrain = (tokenElevation < terrainInfo.elevation && tokenElevation > terrainInfo.elevation + terrainInfo.depth) || (settingFlyingElevation && movementMode == 'fly' && tokenElevation == terrainInfo.elevation + terrainInfo.depth);
						if (!ignoreTerrain && terrainEnvironment != '') ignoreTerrain = (configuredEnvironments[terrainEnvironment][movementMode] || configuredEnvironments[terrainEnvironment]['any']);
						
						if (!ignoreTerrain) terrainList.push(terrainInfo);
					}
					else if (settingTokenTerrain && 'token' in x && tokenCost != Infinity) {
						const terrainToken = x.token;
						const terrainTokenDocument = terrainToken.document;
						const terrainTokenDisposition = terrainTokenDocument.disposition;
						const terrainTokenSize = getProperty(terrainToken, 'actor.system.traits.size');
						const terrainTokenElevation = terrainTokenDocument.elevation;
						const terrainTokenIncapacitated = (settingOneDnd && hasCondition(terrainTokenDocument, incapacitatedConditions));
						if (tokenElevation == terrainTokenElevation) {
							if (tokenDisposition + terrainTokenDisposition == 0 && !canMoveThroughTokens && !terrainTokenIncapacitated && (tokenSizes[tokenSize] + movementSizeOffset['smaller'] <= tokenSizes[terrainTokenSize] && tokenSizes[terrainTokenSize] <= tokenSizes[tokenSize] + movementSizeOffset['bigger']))
								tokenCost = Infinity;
							else if (!settingOneDnd || terrainTokenSize != 'tiny')
								tokenCost = 2;
						}
					}
				});
				terrainList.forEach(terrainInfo => {
					const terrainEnvironment = terrainInfo.environment;
					const terrainObstacle = terrainInfo.obstacle;
					const terrainCost = terrainInfo.multiple;
					if (waterTerrain.includes(terrainEnvironment)) waterCost = Math.max(waterCost, terrainCost);
					else if (spellTerrain.includes(terrainEnvironment) || spellTerrain.includes(terrainObstacle)) baseCost = Math.max(baseCost, terrainCost);
					else difficultTerrainCost = Math.max(difficultTerrainCost, terrainCost);
				});
			}
			difficultTerrainCost = Math.max(difficultTerrainCost, tokenCost);
			if (hasFreedomofMovement && difficultTerrainCost != Infinity) difficultTerrainCost = 1;
		
			const movementCost = baseCost + (difficultTerrainCost - 1) + (waterCost - 1) + (crawlingCost - 1);
			return movementCost;
		}
	}
	enhancedTerrainLayer.registerModule("elevation-drag-ruler", DnD5eRuleProvider);
});