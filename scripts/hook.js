class TerrainConfig {
	static getConfiguredEnvironments(tokenDocument) {
		const defaultConfiguredEnvironments = {'all': {"any": false, "walk": false, "swim": false, "fly": false, "burrow": false, "climb": false}, 'arctic': {"any": false, "walk": false, "swim": false, "fly": false, "burrow": false, "climb": false}, 'coast': {"any": false, "walk": false, "swim": false, "fly": false, "burrow": false, "climb": false}, 'desert': {"any": false, "walk": false, "swim": false, "fly": false, "burrow": false, "climb": false}, 'forest': {"any": false, "walk": false, "swim": false, "fly": false, "burrow": false, "climb": false}, 'grassland': {"any": false, "walk": false, "swim": false, "fly": false, "burrow": false, "climb": false}, 'jungle': {"any": false, "walk": false, "swim": false, "fly": false, "burrow": false, "climb": false}, 'mountain': {"any": false, "walk": false, "swim": false, "fly": false, "burrow": true, "climb": true}, 'swamp': {"any": false, "walk": false, "swim": false, "fly": false, "burrow": false, "climb": false}, 'underdark': {"any": false, "walk": false, "swim": false, "fly": false, "burrow": false, "climb": false}, 'urban': {"any": false, "walk": false, "swim": false, "fly": false, "burrow": false, "climb": false}, 'water': {"any": false, "walk": false, "swim": true, "fly": false, "burrow": false, "climb": false}}
		var configuredEnvironments = tokenDocument.getFlag('elevation-drag-ruler', 'ignoredEnvironments');
		return configuredEnvironments || defaultConfiguredEnvironments;
	}

	static addConfigTab(config, html) {
		const configuredEnvironments = TerrainConfig.getConfiguredEnvironments(config.token);
		//Expand the window's width
		config.position.width = 540;
		config.setPosition(config.position);

		const configTabs = html.find('nav.sheet-tabs.tabs[data-group="main"]');
		configTabs.append('<a class="item" data-tab="terrain"><i class="fas fa-mountain"></i>Terrain</a>');

		configTabs.parent().find('footer').before(`<div class="tab" data-group="main" data-tab="terrain"></div>`);
		const terrainTab = html.find('div.tab[data-tab="terrain"]');
		terrainTab.append('<div class="form-group" style="text-align:center;"><b>Terrain</b><b>Any</b><b>Walking</b><b>Swimming</b><b>Flying</b><b>Burrowing</b><b>Climbing</b></div>');
		//terrainTab.append('<div style="text-align:right;"><i class="fas fa-hiking" style="text-align:right;"></i></div>');
		for (const environment in configuredEnvironments) {
			terrainTab.append(`<div class="form-group" id="${environment}" style="text-align:center;"><label>${environment.charAt(0).toUpperCase() + environment.slice(1)}</label></div>`);
			const environmentRow = terrainTab.find(`div.form-group#${environment}`);
			for (const speed in configuredEnvironments[environment]) {
				environmentRow.append(`<label><input type="checkbox" title="Ignore ${environment} terrain for ${speed} speed" name="flags.elevation-drag-ruler.ignoredEnvironments.${environment}.${speed}" ${configuredEnvironments[environment][speed] ? 'checked=""' : '""'}></label>`);
			}
		};
	}
}

//Handles adding the button to the Token HUD.
class TokenHudButtons {
	//Returns a list of the actor's available and relevant movement options.
	static getTokenSpeeds(tokenDocument) {
		const defaultSpeeds = tokenDocument._actor.data.data.attributes.movement;
		var tokenSpeeds = ['auto'] ;
		for (const [key, value] of Object.entries(defaultSpeeds)) {
			if (value > 0 && key != 'hover') tokenSpeeds.push(key);
		}
		return tokenSpeeds;
	}

	//Called when the 'Switch Speed' button is clicked.
	static async onSpeedButtonClick(tokenId, html) {
		const tokenDocument = canvas.tokens.get(tokenId).document;
		const speeds = this.getTokenSpeeds(tokenDocument);
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
		this.addSpeedButton(tokenId, html);
	}

	static async onTerrainButtonClick(tokenId, html) {
		const tokenDocument = canvas.tokens.get(tokenId).document;
		const oldTerrainConfig = TerrainConfig.getConfiguredEnvironments(tokenDocument).all.any;

		var terrainConfig = false;
		if (!oldTerrainConfig) terrainConfig = true;
		await tokenDocument.setFlag('elevation-drag-ruler', 'ignoredEnvironments.all.any', terrainConfig);
		this.addTerrainButton(tokenId, html);
	}

	//Returns a button based on the currently selected speed.
	static createSpeedButton(tokenId) {
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
		
		return button;
	}

	static createTerrainButton(tokenId) {
		const tokenDocument = canvas.tokens.get(tokenId).document;
		const terrainConfig = TerrainConfig.getConfiguredEnvironments(tokenDocument).all.any;
		const button = document.createElement('div');
		button.classList.add('control-icon');
		if (!terrainConfig) button.classList.add('active');
		button.title = 'Toggle Terrain';
		button.id = 'toggle-terrain';

		button.innerHTML = '<i class="fas fa-hiking fa-fw"></i>';
		
		return button;
	}

	//Removes the old button.
	static removeSpeedButton(html) {
		html.find('#switch-speed').remove();
	}

	static removeTerrainButton(html) {
		html.find('#toggle-terrain').remove();
	}

	//Creates a clickable button and adds it to the Token HUD.
	static addSpeedButton(tokenId, html) {
		this.removeSpeedButton(html);
		const speedButton = this.createSpeedButton(tokenId);

		$(speedButton)
			.click((event) =>
				this.onSpeedButtonClick(tokenId, html)
			)

		html.find('div.left').append(speedButton);
	}

	static addTerrainButton(tokenId, html) {
		this.removeTerrainButton(html);
		const terrainButton = this.createTerrainButton(tokenId);

		$(terrainButton)
			.click((event) =>
				this.onTerrainButtonClick(tokenId, html)
			)

		html.find('div.right').append(terrainButton);
	}
}

//Hooking into Drag Ruler when it's ready.
Hooks.once('dragRuler.ready', (SpeedProvider) => {
	
	var EDR_movementMode = {};
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
					default: true,
				},
				{
					id: 'flyingElevation',
					name: 'Elevate Flying',
					hint: 'Flying tokens will be treated as if they were 1 elevation higher for the purpose of ignoring difficult terrain.',
					scope: 'world',
					config: true,
					type: Boolean,
					default: true,
				},
				{
					id: 'forceFlying',
					name: 'Force Flying',
					hint: 'Tokens at elevation 0 will default to their flying speed if it is bigger than their walking speed',
					scope: 'world',
					config: true,
					type: Boolean,
					default: true,
				},
				{
					id: 'forceSwimming',
					name: 'Force Swimming',
					hint: 'Tokens at elevation 0 and in water terrain will default to their swimming speed if it is bigger than their walking and flying speed.',
					scope: 'world',
					config: true,
					type: Boolean,
					default: true,
				},
				{
					id: 'forceBurrowing',
					name: 'Force Burrowing',
					hint: 'Tokens at elevation 0 but not in water terrain will default to their burrowing speed if it is bigger than their walking and flying speed.',
					scope: 'world',
					config: true,
					type: Boolean,
					default: true,
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
		
		getHighestSpeed(movementSpeeds) {
			var highestSpeed = 0;
			var highestMovement = 'walk';
			for (const [key, value] of Object.entries(movementSpeeds)) {
				if (value > highestSpeed && key != 'hover') {
					highestSpeed = value;
					highestMovement = key;
				}
			}
			return highestMovement;
		}

		//This is called by Drag Ruler once when a token starts being dragged. Does not get called again when setting a waypoint.
		getRanges(token) {
			//Gets the module settings.
			const tokenDocument = token.document;
			const settingElevationSwitching = this.getSetting('elevationSwitching');
			const settingForceFlying = this.getSetting('forceFlying');
			const settingForceSwimming = this.getSetting('forceSwimming');
			const settingForceBurrowing = this.getSetting('forceBurrowing');
			const terrainRulerAvailable = game.modules.get('terrain-ruler')?.active;
			
			//Gets the token's movement speeds from DnD5e. Also checks if the creature can hover or not.
			const walkSpeed = parseFloat(getProperty(token, 'actor.data.data.attributes.movement.walk'));
			const flySpeed = parseFloat(getProperty(token, 'actor.data.data.attributes.movement.fly'));
			const burrowSpeed = parseFloat(getProperty(token, 'actor.data.data.attributes.movement.burrow'));
			const climbSpeed = parseFloat(getProperty(token, 'actor.data.data.attributes.movement.climb'));
			const swimSpeed = parseFloat(getProperty(token, 'actor.data.data.attributes.movement.swim'));
			const movementSpeeds = {'walk': walkSpeed, 'fly': flySpeed, 'swim': swimSpeed,'burrow': burrowSpeed, 'climb': climbSpeed};

			const elevation = token.data.elevation;
			var terrains = [];
			var environments = [];
			if (terrainRulerAvailable) {
				terrains = canvas.terrain.terrainFromPixels(token.x, token.y);
				if (terrains.length > 0)
					terrains.forEach(terrain => environments.push(terrain.data.environment));
			}

			//Default movement option.
			var movementSpeed = 'walk';
			
			const selectedSpeed = tokenDocument.getFlag('elevation-drag-ruler', 'selectedSpeed');
			//If a token has a speed selected use that.
			if (selectedSpeed && selectedSpeed != 'auto') {
				movementSpeed = selectedSpeed;
			}
			//If the token has no speed selected and the 'Use Elevation' setting is off, use their swimming speed if they're in water or else their highest speed.
			else if (!settingElevationSwitching) {
				if (environments.includes('water') && swimSpeed > 0) {
					movementSpeed = 'swim';
				}
				else {
					movementSpeed = this.getHighestSpeed(movementSpeeds);
				}
			}
			//If the token has no speed selected and the 'Use Elevation' setting is on, base speed on elevation and terrain (if available)
			else {
				if (elevation < 0 && !environments.includes('water'))
					movementSpeed = 'burrow';
				if (elevation < 0 && environments.includes('water'))
					movementSpeed = 'swim';
				if (elevation > 0)
					movementSpeed = 'fly';
				if (elevation == 0 && settingForceFlying && (flySpeed > walkSpeed))
					movementSpeed = 'fly';
				if (elevation == 0 && settingForceSwimming && environments.includes('water') && (swimSpeed > walkSpeed) && (swimSpeed > flySpeed))
					movementSpeed = 'swim';
				if (elevation == 0 && settingForceBurrowing && !environments.includes('water') && (burrowSpeed > walkSpeed) && (burrowSpeed > flySpeed))
					movementSpeed = 'burrow';
			}
			//Pass the picked movementSpeed to the global variable, to be used in the getCostForStep function from Drag Ruler.
			EDR_movementMode[token.id] = movementSpeed;

			const tokenSpeed = movementSpeed;
			const speedColor = movementSpeed;
			const dashColor = movementSpeed + 'Dash';
			return [{range: movementSpeeds[tokenSpeed], color: speedColor}, {range: movementSpeeds[tokenSpeed] * 2, color: dashColor}];
		}
		
		//Returns the movement cost of an area.
		getCostForStep(token, area, options={}) {
			const movementSpeed = EDR_movementMode[token.id];
			const settingFlyingElevation = this.getSetting('flyingElevation');
			const tokenDocument = token.data.document;

			//Grabs a token's configured options for ignoring difficult terrain.
			const configuredEnvironments = TerrainConfig.getConfiguredEnvironments(tokenDocument)
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

			if (movementSpeed == 'fly' && settingFlyingElevation) options.elevation = token.data.elevation + 1;
			options.token = token;
			//Defines a custom calculate function to be used by Enhanced Terrain Layer.
			options.calculate = function calculate(cost, total, object) {
				//The movement cost from water can stack with difficult terrain. Due to limitations with the API these 2 different movement costs have to be encoded into one number. This will break in the unlikely event someone uses costs over 99.
				var terrainCost = Math.floor(total/100);
				var waterCost = total % 100;
				const environment = object?.environment?.id;
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
	}

	dragRuler.registerModule('elevation-drag-ruler', DnD5eSpeedProvider)
})

Hooks.on('renderTokenHUD', (app, html, data) => {
	TokenHudButtons.addSpeedButton(data._id, html);
	TokenHudButtons.addTerrainButton(data._id, html);
});

Hooks.on('renderTokenConfig', TerrainConfig.addConfigTab)
