import {getConfiguredEnvironments, getTokenSpeeds} from "./main.js"

//Called when the 'Switch Speed' button is clicked.
async function onSpeedButtonClick(tokenId, html) {
	const tokenDocument = canvas.tokens.get(tokenId).document;
	const speeds = getTokenSpeeds(tokenDocument);
	const oldSelectedSpeed = tokenDocument.getFlag('elevation-drag-ruler', 'selectedSpeed');
	//Cycles through the available speeds.
	var indexSpeed = 1;
	if (speeds.includes(oldSelectedSpeed)) {
		indexSpeed = speeds.indexOf(oldSelectedSpeed) + 1;
	}
	if (indexSpeed >= speeds.length) {
		indexSpeed = 0;
	}
	await tokenDocument.setFlag('elevation-drag-ruler', 'selectedSpeed', speeds[indexSpeed]);
	//Re-add the button to update its icon to the new selected speed.
	addSpeedButton(tokenId, html);
}

async function onTerrainButtonClick(tokenId, html) {
	const tokenDocument = canvas.tokens.get(tokenId).document;
	var terrainConfig = getConfiguredEnvironments(tokenDocument);
	if (terrainConfig.all.any) terrainConfig.all.any = false;
	else terrainConfig.all.any = true;
	await tokenDocument.setFlag('elevation-drag-ruler', 'ignoredEnvironments', terrainConfig);
	addTerrainButton(tokenId, html);
}

//Returns a button based on the currently selected speed.
function createSpeedButton(tokenId) {
	const tokenDocument = canvas.tokens.get(tokenId).document;

	let button = document.createElement('div');
	button.classList.add('control-icon');
	button.title = 'Switch Speed';
	button.id = 'switch-speed';

	//The icon depends on the currently selected speed.
	button.innerHTML = '<i class="fas fa-arrows-alt-v fa-fw"></i>';
	const selectedSpeed = tokenDocument.getFlag('elevation-drag-ruler', 'selectedSpeed');
	if (selectedSpeed == 'walk') button.innerHTML = '<i class="fas fa-walking fa-fw"></i>';
	if (selectedSpeed == 'swim') button.innerHTML = '<i class="fas fa-swimmer fa-fw"></i>';
	if (selectedSpeed == 'fly') button.innerHTML = '<i class="fas fa-crow fa-fw"></i>';
	if (selectedSpeed == 'burrow') button.innerHTML = '<i class="fas fa-mountain fa-fw"></i>';
	if (selectedSpeed == 'climb') button.innerHTML = '<i class="fas fa-grip-lines fa-fw"></i>';
	if (selectedSpeed == 'teleport') button.innerHTML = '<i class="fas fa-transporter-1 fa-fw"></i>';
	
	return button;
}

function createTerrainButton(tokenId) {
	const tokenDocument = canvas.tokens.get(tokenId).document;
	const terrainConfig = getConfiguredEnvironments(tokenDocument).all.any;
	const button = document.createElement('div');
	button.classList.add('control-icon');
	if (!terrainConfig) button.classList.add('active');
	button.title = 'Toggle Terrain';
	button.id = 'toggle-terrain';

	button.innerHTML = '<i class="fas fa-hiking fa-fw"></i>';
	
	return button;
}

//Removes the old button.
function removeSpeedButton(html) {
	html.find('#switch-speed').remove();
}

function removeTerrainButton(html) {
	html.find('#toggle-terrain').remove();
}

//Creates a clickable button and adds it to the Token HUD.
export function addSpeedButton(tokenId, html) {
	removeSpeedButton(html);
	const speedButton = createSpeedButton(tokenId);

	$(speedButton)
		.click((event) =>
			onSpeedButtonClick(tokenId, html)
		)

	html.find('div.left').append(speedButton);
}

export function addTerrainButton(tokenId, html) {
	removeTerrainButton(html);
	const terrainButton = createTerrainButton(tokenId);

	$(terrainButton)
		.click((event) =>
			onTerrainButtonClick(tokenId, html)
		)

	html.find('div.right').append(terrainButton);
}