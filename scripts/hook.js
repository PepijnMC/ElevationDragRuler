var EDR_selectedSpeed = {};

//Handles adding the 'Switch Speed' button to the Token HUD.
class SpeedButton {
	//Returns a list of the actor's available and relevant movement options.
	static getTokenSpeeds(actor) {
		const defaultSpeeds = actor.data.data.attributes.movement;
		var tokenSpeeds = ['auto'] 
		for (const [key, value] of Object.entries(defaultSpeeds)) {
			if (value > 0 && key != 'hover' && key != 'climb') tokenSpeeds.push(key);
		}
		return tokenSpeeds;
	}

	//Called when the 'Switch Speed' button is clicked.
	static buttonEventHandler(tokenId, app, html, data) {
		const speeds = this.getTokenSpeeds(game.actors.get(data.actorId));

		//Cycles through the available speeds.
		var indexSpeed = 0
		if (speeds.includes(EDR_selectedSpeed[tokenId])) {
			indexSpeed = speeds.indexOf(EDR_selectedSpeed[tokenId]) + 1;
			if (indexSpeed >= speeds.length) {
				indexSpeed = 0;
			}
		}
		EDR_selectedSpeed[tokenId] = speeds[indexSpeed]

		//Re-add the button to update its icon to the new selected speed.
		this.addTokenButton(app, html, data)
	}

	//Returns a basic button based on the currently selected speed.
	static createButton(tokenId) {
		let button = document.createElement('div');
		button.classList.add('control-icon');
		button.classList.add('switch-speed');
		//The icon depends on the currently selected speed.
		button.innerHTML = '<i class="fas fa-arrows-alt-v fa-fw"></i>'
		if (EDR_selectedSpeed[tokenId]) {
			if (EDR_selectedSpeed[tokenId] == 'walk') button.innerHTML = '<i class="fas fa-walking fa-fw"></i>';
			if (EDR_selectedSpeed[tokenId] == 'swim') button.innerHTML = '<i class="fas fa-swimmer fa-fw"></i>';
			if (EDR_selectedSpeed[tokenId] == 'fly') button.innerHTML = '<i class="fas fa-crow fa-fw"></i>';
			if (EDR_selectedSpeed[tokenId] == 'burrow') button.innerHTML = '<i class="fas fa-mountain fa-fw"></i>';
		}
		button.title = 'Switch Speed';

		return button;
	}

	//Removes the old button.
	static removeTokenButton(html) {
		html.find('.switch-speed').remove();
	}

	//Creates a clickable button and adds it to the Token HUD.
	static addTokenButton(app, html, data) {
		this.removeTokenButton(html);
		const tokenId = data._id;
		const speedButton = this.createButton(tokenId);

		$(speedButton)
			.click((event) =>
				this.buttonEventHandler(tokenId,app, html, data)
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
					id: 'forceFlying',
					name: 'Force Flying',
					hint: 'Force tokens at elevation 0 to use their flying speed if it is bigger than their walking speed.',
					scope: 'world',
					config: true,
					type: Boolean,
					default: true,
				},
				{
					id: 'forceSwimming',
					name: 'Force Swimming',
					hint: 'Force tokens at elevation 0 and in water terrain to use their swimming speed if it is bigger than their walking and flying speed.',
					scope: 'world',
					config: true,
					type: Boolean,
					default: true,
				},
				{
					id: 'forceBurrowing',
					name: 'Force Burrowing',
					hint: 'Force tokens at elevation 0 but not in water terrain to use their burrowing speed if it is bigger than their walking and flying speed.',
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
				{id: 'burrowDash', default: 0xFFFF00, 'name': 'dash burrowing'}
			]
		}
		
		getHighestSpeed(movementSpeeds) {
			var highestSpeed = 0;
			var highestMovement = 'walk';
			for (const [key, value] of Object.entries(movementSpeeds)) {
				if (value > highestSpeed && key != 'hover' && key != 'climb') {
					highestSpeed = value;
					highestMovement = key;
				}
			}
			return highestMovement;
		}

		//This is called by Drag Ruler once when a token starts being dragged. Does not get called again when setting a waypoint.
		getRanges(token) {
			//Gets the module settings.
			const settingElevationSwitching = this.getSetting('elevationSwitching');
			const settingForceFlying = this.getSetting('forceFlying');
			const settingForceSwimming = this.getSetting('forceSwimming');
			const settingForceBurrowing = this.getSetting('forceBurrowing');
			const terrainRulerAvailable = game.modules.get('terrain-ruler')?.active;
			
			//Gets the token's movement speeds from DnD5e. Also checks if the creature can hover or not.
			const walkSpeed = parseFloat(getProperty(token, 'actor.data.data.attributes.movement.walk'));
			const flySpeed = parseFloat(getProperty(token, 'actor.data.data.attributes.movement.fly'));
			const hovering = getProperty(token, 'actor.data.data.attributes.movement.hover');
			const burrowSpeed = parseFloat(getProperty(token, 'actor.data.data.attributes.movement.burrow'));
			const swimSpeed = parseFloat(getProperty(token, 'actor.data.data.attributes.movement.swim'));
			const movementSpeeds = {'walk': walkSpeed, 'fly': flySpeed, 'swim': swimSpeed,'burrow': burrowSpeed};

			const elevation = token.data.elevation;
			var terrains = [];
			var environments = [];
			if (terrainRulerAvailable) {
				terrains = canvas.terrain.terrainFromPixels(token.x, token.y);
				if (terrains.length > 0)
					terrains.forEach(terrain => environments.push(terrain.data.environment));
			}

			//Default movement option.
			var selectedSpeed = 'walk';
			//If a token has a speed selected use that.
			if (EDR_selectedSpeed[token.id] && EDR_selectedSpeed[token.id] != 'auto') {
				selectedSpeed = EDR_selectedSpeed[token.id];
			}
			//If the token has no speed selected and the 'Use Elevation' setting is off, use their swimming speed if they're in water or else their highest speed.
			else if (!settingElevationSwitching) {
				if (environments.includes('water') && swimSpeed > 0) {
					selectedSpeed = 'swim';
				}
				else {
					selectedSpeed = this.getHighestSpeed(movementSpeeds);
				}
			}
			//If the token has no speed selected and the 'Use Elevation' setting is on, base speed on elevation and terrain (if available)
			else if (terrainRulerAvailable) {
				if (elevation < 0 && !environments.includes('water'))
					selectedSpeed = 'burrow';
				if (elevation < 0 && environments.includes('water'))
					selectedSpeed = 'swim';
				if (elevation > 0)
					selectedSpeed = 'fly';
				if (elevation == 0 && settingForceFlying && (flySpeed > walkSpeed))
					selectedSpeed = 'fly';
				if (elevation == 0 && settingForceSwimming && environments.includes('water') && (swimSpeed > walkSpeed) && (swimSpeed > flySpeed))
					selectedSpeed = 'swim';
				if (elevation == 0 && settingForceBurrowing && !environments.includes('water') && (burrowSpeed > walkSpeed) && (burrowSpeed > flySpeed))
					selectedSpeed = 'burrow';
			}
			else {
				if (elevation < 0)
					selectedSpeed = 'burrow';
				if (elevation > 0)
					selectedSpeed = 'fly';
				if (elevation == 0 && settingForceBurrowing && (burrowSpeed > walkSpeed) && (burrowSpeed > flySpeed))
					selectedSpeed = 'burrow';
				if (elevation == 0 && settingForceFlying && (flySpeed > walkSpeed))
					selectedSpeed = 'fly';
			}
			//pass the picked movementSpeed to the global variable, to be used in the getCostForStep function from Drag Ruler.
			EDR_movementMode[token.id] = selectedSpeed;

			const tokenSpeed = selectedSpeed;
			const speedColor = selectedSpeed;
			const dashColor = selectedSpeed + 'Dash';
			return [{range: movementSpeeds[tokenSpeed], color: speedColor}, {range: movementSpeeds[tokenSpeed] * 2, color: dashColor}];
		}
		
		//Returns the movement cost of an area.
		getCostForStep(token, area, options={}) {
			//Gather a list of the terrain in the area.
			const terrains = area.map(space => canvas.terrain.terrainFromGrid(space.x, space.y))[0];
			var environments = [];
			if (terrains.length > 0)
				terrains.forEach(terrain => environments.push(terrain.data.environment));
			
			//When flying or burrowing, ignore all difficult terrain.
			if (EDR_movementMode[token.id] == 'fly' || (EDR_movementMode[token.id] == 'burrow' && !environments.includes('water'))) {
				return 1;
			}
			//Calculate the movement cost, cost from water terrain is handled separately and stacked on top of other movement costs unless the token is swimming.
			else {	
				const settingForceSwimming = this.getSetting('forceSwimming');
				const walkSpeed = parseFloat(getProperty(token, 'actor.data.data.attributes.movement.walk'));
				const flySpeed = parseFloat(getProperty(token, 'actor.data.data.attributes.movement.fly'));
				const swimSpeed = parseFloat(getProperty(token, 'actor.data.data.attributes.movement.swim'));
				var terrainCost = 1;
				var waterCost = 1;
				terrains.forEach(function(terrain) {
					if (terrain.data.environment == 'water') {
						waterCost = Math.max(waterCost, terrain.data.multiple);
					}
					else {
						terrainCost = Math.max(terrainCost, terrain.data.multiple);
					}
				});
				if (EDR_movementMode[token.id] == 'swim' || ((!EDR_selectedSpeed[token.id] || EDR_selectedSpeed[token.id] == 'auto') && settingForceSwimming && (swimSpeed > walkSpeed) && (swimSpeed > flySpeed)))
					waterCost = 1;
				const cost = terrainCost + waterCost - 1;
				return cost;
			}
		}
	}

	dragRuler.registerModule('elevation-drag-ruler', DnD5eSpeedProvider)
})

Hooks.on('renderTokenHUD', (app, html, data) => {
	const id = data._id
	if (!EDR_selectedSpeed[id]) EDR_selectedSpeed[id] = 'auto';
	SpeedButton.addTokenButton(app, html, data);
});
