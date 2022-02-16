//Handles adding the 'Switch Speed' button to the Token HUD.
class SpeedButton {
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
	static async buttonEventHandler(tokenId, html) {
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
		this.addTokenButton(tokenId, html);
	}

	//Returns a basic button based on the currently selected speed.
	static createButton(tokenId) {
		const tokenDocument = canvas.tokens.get(tokenId).document;
		let button = document.createElement('div');
		button.classList.add('control-icon');
		//The icon depends on the currently selected speed.
		button.innerHTML = '<i class="fas fa-arrows-alt-v fa-fw"></i>'

		const selectedSpeed = tokenDocument.getFlag('elevation-drag-ruler', 'selectedSpeed');
		if (selectedSpeed == 'walk') button.innerHTML = '<i class="fas fa-walking fa-fw"></i>';
		if (selectedSpeed == 'swim') button.innerHTML = '<i class="fas fa-swimmer fa-fw"></i>';
		if (selectedSpeed == 'fly') button.innerHTML = '<i class="fas fa-crow fa-fw"></i>';
		if (selectedSpeed == 'burrow') button.innerHTML = '<i class="fas fa-mountain fa-fw"></i>';
		if (selectedSpeed == 'climb') button.innerHTML = '<i class="fas fa-grip-lines fa-fw"></i>';
		button.title = 'Switch Speed';
		button.id = 'switch-speed';
		return button;
	}

	//Removes the old button.
	static removeTokenButton(html) {
		html.find('#switch-speed').remove();
	}

	//Creates a clickable button and adds it to the Token HUD.
	static addTokenButton(tokenId, html) {
		this.removeTokenButton(html);
		const speedButton = this.createButton(tokenId);

		$(speedButton)
			.click((event) =>
				this.buttonEventHandler(tokenId, html)
			)

		html.find('div.left').append(speedButton);
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
					hint: 'Flying tokens at 0 elevation will be treated as if they were at elevation 1 for the purpose of ignoring difficult terrain.',
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
			//pass the picked movementSpeed to the global variable, to be used in the getCostForStep function from Drag Ruler.
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
			if (movementSpeed == 'fly' && settingFlyingElevation && token.data.elevation == 0) options.elevation = 1;
			options.token = token;
			//Defines a custom calculate function to be used by Enhanced Terrain Layer.
			options.calculate = function calculate(cost, total, object) {
				//The movement cost from water can stack with difficult terrain. Due to limitations with the API these 2 different movement costs have to be encoded into one number. This will break in the unlikely event someone uses costs over 99.
				var terrainCost = Math.floor(total/100);
				var waterCost = total % 100;
				if (object?.environment?.id == 'water')
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
				if (movementSpeed == 'swim') waterCost = 1;
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
	SpeedButton.addTokenButton(data._id, html);
});
