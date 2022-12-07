import { getConfiguredEnvironments, getTokenSpeeds, hasFeature } from "./util.js"

function addConfigTerrainTab(config, html) {
	const tokenDocument = config.token;
	const configuredEnvironments = getConfiguredEnvironments(tokenDocument);
  
	//Expand the window's width
	config.position.width = 540;
	config.setPosition(config.position);

	const configTabs = html.find('nav.sheet-tabs.tabs[data-group="main"]');
	configTabs.append('<a class="item" data-tab="terrain"><i class="fas fa-mountain"></i>Terrain</a>');

	configTabs.parent().find('footer').before(`<div class="tab" data-group="main" data-tab="terrain"></div>`);
	const terrainTab = html.find('div.tab[data-tab="terrain"]');
	terrainTab.append('<div class="form-group" style="text-align:center;"><b>Terrain</b><b>Any</b><b>Walking</b><b>Swimming</b><b>Flying</b><b>Burrowing</b><b>Climbing</b></div>');
	for (const environment in configuredEnvironments) {
		terrainTab.append(`<div class="form-group" id="${environment}" style="text-align:center;"><label>${environment.charAt(0).toUpperCase() + environment.slice(1)}</label></div>`);
		const environmentRow = terrainTab.find(`div.form-group#${environment}`);
		for (const speed in configuredEnvironments[environment]) {
			environmentRow.append(`<label><input type="checkbox" title="Ignore ${environment} terrain for ${speed} speed" name="flags.elevation-drag-ruler.ignoredEnvironments.${environment}.${speed}" ${configuredEnvironments[environment][speed] ? 'checked=""' : '""'}></label>`);
		}
	};
}

function addConfigResourceField(config, html) {
	const tokenDocument = config.token;
	const tokenSpeeds = getTokenSpeeds(tokenDocument);
	const selectedSpeed = tokenDocument.getFlag('elevation-drag-ruler', 'selectedSpeed');
	const bonusDash = hasFeature(tokenDocument, 'hasBonusDash', ['Cunning Action', 'Escape', 'LightFooted', 'Rapid Movement']);
	const nimbleness = hasFeature(tokenDocument, 'hasNimbleness', ['Halfling Nimbleness', 'Halfling']);
	const elementalForm = hasFeature(tokenDocument, 'hasElementalForm', ['Air Form', "Fire Form", "Water Form"]);
	const incorporealMovement = hasFeature(tokenDocument, 'hasIncorporealMovement', ['Incorporeal Movement']);
	const freedomOfMovement = hasFeature(tokenDocument, 'hasFreedomOfMovement', ['Freedom of Movement']);
	const hideSpeedButton = tokenDocument.getFlag('elevation-drag-ruler', 'hideSpeedButton');
	const hideTerrainButton = tokenDocument.getFlag('elevation-drag-ruler', 'hideTerrainButton');
	const teleportRange = tokenDocument.getFlag('elevation-drag-ruler', 'teleportRange') || 0;
	const teleportCost = tokenDocument.getFlag('elevation-drag-ruler', 'teleportCost') || 0;
	const resourceTab = html.find('div.tab[data-tab="resources"]');

	if (tokenSpeeds) {
		resourceTab.append(`<div class='form-group'><label>Selected Movement Speed</label><div class='form-fields'><select name='flags.elevation-drag-ruler.selectedSpeed'></select></div></div>`);
		const speedField = html.find('select[name="flags.elevation-drag-ruler.selectedSpeed"]');
		for (const tokenSpeed of tokenSpeeds) {
			speedField.append(`<option value=${tokenSpeed} ${tokenSpeed == selectedSpeed ? "selected" : ""}>${tokenSpeed.charAt(0).toUpperCase() + tokenSpeed.slice(1)}</option>`);
		};
	};
  
	resourceTab.append(`<div class='form-group'><label>Has Bonus Dash</label><input type='checkbox' name='flags.elevation-drag-ruler.hasBonusDash' ${bonusDash ? 'checked=""' : '""'}></div>`);
	
	if (game.modules.get('terrain-ruler')?.active) {
		resourceTab.append(`<div class='form-group'><label>Has Nimbleness</label><input type='checkbox' name='flags.elevation-drag-ruler.hasNimbleness' ${nimbleness ? 'checked=""' : '""'}></div>`);
		resourceTab.append(`<div class='form-group'><label>Has Elemental Form</label><input type='checkbox' name='flags.elevation-drag-ruler.hasElementalForm' ${elementalForm ? 'checked=""' : '""'}></div>`);
		resourceTab.append(`<div class='form-group'><label>Has Freedom of Movement</label><input type='checkbox' name='flags.elevation-drag-ruler.hasFreedomOfMovement' ${freedomOfMovement ? 'checked=""' : '""'}></div>`);
		resourceTab.append(`<div class='form-group'><label>Has Incorporeal Movement</label><input type='checkbox' name='flags.elevation-drag-ruler.hasIncorporealMovement' ${incorporealMovement ? 'checked=""' : '""'}></div>`);

		resourceTab.append(`<div class='form-group'><label>Teleport Range</label><input type='number' name='flags.elevation-drag-ruler.teleportRange' value='${teleportRange}'></div>`);
		resourceTab.append(`<div class='form-group'><label>Teleport Cost</label><input type='number' name='flags.elevation-drag-ruler.teleportCost' value='${teleportCost}'></div>`);
	};

	resourceTab.append(`<div class='form-group'><label>Hide Speed Button</label><input type='checkbox' name='flags.elevation-drag-ruler.hideSpeedButton' ${hideSpeedButton ? 'checked=""' : '""'}></div>`);
	
	if (game.modules.get('terrain-ruler')?.active) {
		resourceTab.append(`<div class='form-group'><label>Hide Terrain Button</label><input type='checkbox' name='flags.elevation-drag-ruler.hideTerrainButton' ${hideTerrainButton ? 'checked=""' : '""'}></div>`);
	};
}

export function addConfig(config, html) {
	if (game.modules.get('terrain-ruler')?.active)
		addConfigTerrainTab(config, html);
	addConfigResourceField(config, html);
}