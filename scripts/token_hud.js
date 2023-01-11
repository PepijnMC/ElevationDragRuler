import {getConfiguredEnvironments, getTokenSpeeds} from "./util.js"

//Cycles through the token's speeds when the 'Switch Speed' button is clicked.
async function onSpeedButtonClick(tokenDocument, html) {
	const speeds = getTokenSpeeds(tokenDocument);
	const oldSelectedSpeed = tokenDocument.getFlag('elevation-drag-ruler', 'selectedSpeed');
	var indexSpeed = 1;
	if (speeds.includes(oldSelectedSpeed)) indexSpeed = (speeds.indexOf(oldSelectedSpeed) + 1) % speeds.length;
	const selectedSpeed = speeds[indexSpeed];
	await tokenDocument.setFlag('elevation-drag-ruler', 'selectedSpeed', selectedSpeed);
	
	html.find('#switch-speed').remove();
	addSpeedButton(tokenDocument, html);
}

// Toggles terrain for the token when the 'Toggle Terrain' button is clicked.
async function onTerrainButtonClick(tokenDocument, html) {
	var terrainConfig = getConfiguredEnvironments(tokenDocument);
	terrainConfig.all.any = !terrainConfig.all.any
	await tokenDocument.setFlag('elevation-drag-ruler', 'ignoredEnvironments', terrainConfig);
	html.find('#toggle-terrain').remove();
	addTerrainButton(tokenDocument, html);
}

// Basic button factory.
function createButton(title, id, innerHTML, clickFunction) {
	const button = document.createElement('div');
	button.classList.add('control-icon');
	button.title = title;
	button.id = id;
	button.innerHTML = innerHTML;
	button.addEventListener('click', clickFunction);
	return button;
}

// Returns an icon name based on the selected speed.
function getSpeedButtonIcon(selectedSpeed) {
	var buttonIcon = 'arrows-up-down-left-right';

	switch (selectedSpeed) {
		case 'walk':
			buttonIcon = 'walking';
			break;
		case 'swim':
			buttonIcon = 'swimmer';
			break;
		case 'fly':
			buttonIcon = 'crow';
			break;
		case 'burrow':
			buttonIcon = 'mountain';
			break;
		case 'climb':
			buttonIcon = 'grip-lines';
			break;
		case 'teleport':
			if (game.modules.get('terrain-ruler')?.active && game.settings.get('elevation-drag-ruler', 'teleport')) buttonIcon = 'transporter-1';
			else tokenDocument.setFlag('elevation-drag-ruler', 'selectedSpeed', 'auto');
			break;
	};

	return buttonIcon;
}

//Creates clickable buttons and adds it to the Token HUD.
export function addSpeedButton(tokenDocument, html) {
	const selectedSpeed = tokenDocument.getFlag('elevation-drag-ruler', 'selectedSpeed');
	const buttonIcon = getSpeedButtonIcon(selectedSpeed);
	const speedButton = createButton('Switch Speed', 'switch-speed', `<i class="fas fa-${buttonIcon} fa-fw"></i>`, function() {onSpeedButtonClick(tokenDocument, html)});

	html.find('div.left').append(speedButton);
}
export function addTerrainButton(tokenDocument, html) {
	const terrainConfig = getConfiguredEnvironments(tokenDocument).all.any;

	const terrainButton = createButton('Toggle Terrain', 'toggle-terrain', '<i class="fas fa-hiking fa-fw"></i>', function() {onTerrainButtonClick(tokenDocument, html)});
	if (!terrainConfig) terrainButton.classList.add('active');

	html.find('div.right').append(terrainButton);
}