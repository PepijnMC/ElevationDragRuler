import {getConfiguredEnvironments} from "./main.js";

export function dnd5eCost(terrain, options={}) {
	const token = options.token;
	const tokenDocument = token.document;
	const movementMode = token.document.getFlag('elevation-drag-ruler', 'movementMode');
	const settingFlyingElevation = game.settings.get('drag-ruler', 'speedProviders.module.elevation-drag-ruler.setting.flyingElevation');
	const waterTerrain = ['water'];
	const spellTerrain = ['controlWinds', 'gustOfWind', 'plantGrowth', 'wallOfSand', 'wallOfThorns'];

	//Grabs a token's configured options for ignoring difficult terrain.
	const configuredEnvironments = getConfiguredEnvironments(tokenDocument);
	var difficultTerrainCost = 1;
	var waterCost = 1;
	var crawlingCost = tokenDocument.hasStatusEffect("prone") ? 2 : 1;
	var otherCost = 1;

	var terrainDocuments = [];
	if (!configuredEnvironments['all'][movementMode] && !configuredEnvironments['all']['any']) {
		terrain.forEach(x => {
			if ('terrain' in x) {
				const terrainDocument = x.terrain.document;
				const terrainEnvironment = terrainDocument.environment;
				const ignoreTerrain = (configuredEnvironments[terrainEnvironment][movementMode] || configuredEnvironments[terrainEnvironment]['any']);
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

function old(token, area, options={}) {
	const movementSpeed = EDR_movementMode[token.id];
	const settingFlyingElevation = game.settings.get('drag-ruler', 'speedProviders.module.elevation-drag-ruler.setting.flyingElevation');
	const tokenDocument = token.document;

	//Grabs a token's configured options for ignoring difficult terrain.
	const configuredEnvironments = getConfiguredEnvironments(tokenDocument)
	var ignoredEnvironments = {};
	for (const [configuredEnvironment, speeds] of Object.entries(configuredEnvironments)) {
		var ignoredEnvironment = [];
		for (const [speed, state] of Object.entries(speeds)) {
			if (state) ignoredEnvironment.push(speed);
		}
		ignoredEnvironments[configuredEnvironment] = ignoredEnvironment;
	}
	//If a token is set to ignore all difficult terrain simply return 1 as the cost.
	if (ignoredEnvironments['all']['any']) return 1;
	if (movementSpeed == 'fly' && settingFlyingElevation) options.elevation = tokenDocument.elevation + 1;
	options.token = token;
	//Defines a custom calculate function to be used by Enhanced Terrain Layer.
	options.calculate = function calculate(cost, total, object) {
		//The movement cost from water can stack with difficult terrain. Due to limitations with the API these 2 different movement costs have to be encoded into one number. This will break in the unlikely event someone uses costs over 99.
		var terrainCost = Math.floor(total/100);
		var waterCost = total % 100;
		const environment = object.document.environment;
		//Check the configured token settings for any terrain that should be ignored.
		if (ignoredEnvironments['all']) {
			if ((ignoredEnvironments['all'].includes('any') || ignoredEnvironments['all'].includes(movementSpeed)))
				return total;
		}
		if (ignoredEnvironments[environment]) {
			if (ignoredEnvironments[environment].includes('any') || ignoredEnvironments[environment].includes(movementSpeed))
				return total;
		}
		if (environment == 'water')
			waterCost = Math.max(waterCost, cost);
		else
			terrainCost = Math.max(terrainCost, cost);
		
		total = terrainCost*100+waterCost;
		return total;
	}
	//Returns an array of costs for each tile the token covers.
	const rawCosts = area.map(space => terrainRuler.getCost(space.x, space.y, options));
	//Because each cost encodes both difficult terrain cost and water cost, it has to be decoded and properly added together.
	var costs = [];
	rawCosts.forEach(cost => {
		const terrainCost = Math.max(Math.floor(cost/100), 1);
		var waterCost = Math.max(cost % 100, 1);
		const totalCost = terrainCost + waterCost - 1;
		costs.push(totalCost);
	})
	//Return the maximum of the decoded costs.
	return costs.reduce((max, current) => Math.max(max, current))
}