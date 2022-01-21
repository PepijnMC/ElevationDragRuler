//Hooking into Drag Ruler when it's ready.
Hooks.once("dragRuler.ready", (SpeedProvider) => {
	var EDR_movementMode = {};
	class ElevationSpeedProvider extends SpeedProvider {
		//An array of colors to be used by the movement ranges.
		get colors() {
			return [
				{id: "walk", default: 0x00FF00, "name": "walking"},
				{id: "walkDash", default: 0xFFFF00, "name": "dash walking"},
				{id: "fly", default: 0x00FFFF, "name": "flying"},
				{id: "flyDash", default: 0xFFFF00, "name": "dash flying"},
				{id: "swim", default: 0x0000FF, "name": "swimming"},
				{id: "swimDash", default: 0xFFFF00, "name": "dash swimming"},
				{id: "burrow", default: 0xFFAA00, "name": "burrowing"},
				{id: "burrowDash", default: 0xFFFF00, "name": "dash burrowing"}
			]
		}
		//This is called by Drag Ruler once when a token starts being dragged. Does not get called again when setting a waypoint.
		getRanges(token) {
			//Gets the module settings.
			const settingDefaultHovering = this.getSetting('defaultHovering');
			const settingDefaultFlying = this.getSetting('defaultFlying');
			
			//Gets the token's movement speeds from DnD5e. Also checks if the creature can hover or not.
			const walkSpeed = parseFloat(getProperty(token, "actor.data.data.attributes.movement.walk"));
			const flySpeed = parseFloat(getProperty(token, "actor.data.data.attributes.movement.fly"));
			const hovering = getProperty(token, "actor.data.data.attributes.movement.hover");
			const burrowSpeed = parseFloat(getProperty(token, "actor.data.data.attributes.movement.burrow"));
			var swimSpeed = parseFloat(getProperty(token, "actor.data.data.attributes.movement.swim"));
			//Checks if the token doesn't have other useful movement for traversing water terrain. If true the token will swim even at elevation 0.
			const shouldSwim = ((swimSpeed >= walkSpeed) && (swimSpeed >= flySpeed)) || swimSpeed == 0;
			//If the token's swimSpeed is 0, set it to the highest between their walkSpeed and flySpeed.
			if (swimSpeed == 0)
				swimSpeed = Math.max(walkSpeed, flySpeed);
			
			//Default movement option.
			var tokenSpeed = walkSpeed;
			var speedColor = 'walk';
			var dashColor = 'walkDash'
			
			//Gets the token's elevation and the terrain below it
			const elevation = token.data.elevation;
			const terrain = canvas.terrain.terrainFromPixels(token.x, token.y);
			var environment = 0;
			if (terrain[0])
				environment = terrain[0].data.environment;
			
			//If the terrain is urban, disable any elevation checks and instead use the token's walkSpeed or flySpeed, whichever is larger.
			if (environment != 'urban') {
				if (elevation < 0 && environment != 'water') {
					tokenSpeed = burrowSpeed;
					speedColor = 'burrow';
					dashColor = 'burrowDash';
				}
				if (elevation < 0 && environment == 'water') {
					tokenSpeed = swimSpeed;
					speedColor = 'swim';
					dashColor = 'swimDash';
				}
				if (elevation > 0) {
					tokenSpeed = flySpeed;
					speedColor = 'fly';
					dashColor = 'flyDash';
				}
				//is shouldSwim is true, the token will use its swimSpeed in water even at elevation 0.
				if (elevation == 0 && environment == 'water' && shouldSwim) {
					tokenSpeed = swimSpeed;
					speedColor = 'swim';
					dashColor = 'swimDash';
				}
				//Depending on module settings, make the token use its flySpeed.
				if (elevation == 0 && ((settingDefaultHovering && hovering) || (settingDefaultFlying && flySpeed >= walkSpeed))) {
					tokenSpeed = flySpeed;
					speedColor = 'fly';
					dashColor = 'flyDash';
				}
			}
			if (environment == 'urban' && (flySpeed >= walkSpeed || (settingDefaultHovering && hovering))) {
				tokenSpeed = flySpeed;
				speedColor = 'fly';
				dashColor = 'flyDash';
			}
			//pass the picked movementSpeed to the global variable, to be used in the getCostForStep function from Drag Ruler.
			EDR_movementMode[token.id] = speedColor;
			return [{range: tokenSpeed, color: speedColor}, {range: tokenSpeed * 2, color: dashColor}];
		}
		
		//This function is called by Drag Ruler and implements these speedruler settings.
		get settings() {
			return [
				{
					id: "defaultHovering",
					name: "Force Hovering",
					hint: "Forces hovering creatures to use their flying speed instead of their walking speed at elevation 0.",
					scope: "world",
					config: true,
					type: Boolean,
					default: true,
				},
				{
					id: "defaultFlying",
					name: "Force Flying",
					hint: "Forces creatures with a greater flying than walking speed to use their flying speed at elevation 0.",
					scope: "world",
					config: true,
					type: Boolean,
					default: false,
				}
			]
		}
		//Called by Drag Ruler when a token is moved around. Does not take the grid into account, it is called for every tiny movement.
		getCostForStep(token, area, options={}) {
			options.token = token;
			const terrain = area.map(space => canvas.terrain.terrainFromGrid(space.x, space.y));
      
			//Checks if the token will swim in water at elevation 0 with a proper swimSpeed.
			const walkSpeed = parseFloat(getProperty(token, "actor.data.data.attributes.movement.walk"));
			const flySpeed = parseFloat(getProperty(token, "actor.data.data.attributes.movement.fly"));
			const swimSpeed = parseFloat(getProperty(token, "actor.data.data.attributes.movement.swim"));
			const shouldSwim = ((swimSpeed >= walkSpeed) && (swimSpeed >= flySpeed));

			//Gets the environment from under the token.
			var environment = 0;
			if (terrain[0][0])
				environment = terrain[0][0].data.environment;
			//Skips the cost calculations provided by Terrain Ruler and instead returns 1 (no difficult terrain) or 2 (standard difficult terrain) depending on the token's current movement speed and the environment.
			if (environment == 'urban' || EDR_movementMode[token.id] == 'fly' || (environment == 'water' && (EDR_movementMode[token.id] == 'swim' || shouldSwim)))
				return 1;
			if (environment == 'water' && swimSpeed == 0)
				return 2;
			
			const costs = area.map(space => terrainRuler.getCost(space.x, space.y, options));
			return costs.reduce((max, current) => Math.max(max, current));
		}
	}

	dragRuler.registerModule("elevation-drag-ruler", ElevationSpeedProvider)
})
