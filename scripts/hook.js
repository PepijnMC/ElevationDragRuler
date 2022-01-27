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
			const settingDefaultSwimming = this.getSetting('defaultSwimming');
			
			//Gets the token's movement speeds from DnD5e. Also checks if the creature can hover or not.
			const walkSpeed = parseFloat(getProperty(token, "actor.data.data.attributes.movement.walk"));
			const flySpeed = parseFloat(getProperty(token, "actor.data.data.attributes.movement.fly"));
			const hovering = getProperty(token, "actor.data.data.attributes.movement.hover");
			const burrowSpeed = parseFloat(getProperty(token, "actor.data.data.attributes.movement.burrow"));
			var swimSpeed = parseFloat(getProperty(token, "actor.data.data.attributes.movement.swim"));
			//Checks if the token doesn't have other useful movement for traversing water terrain. If true the token will swim even at elevation 0.
			const shouldSwim = (((swimSpeed >= walkSpeed) && (swimSpeed >= flySpeed)) || swimSpeed == 0) && settingDefaultSwimming;
			//If the token's swimSpeed is 0, set it to the highest between their walkSpeed and flySpeed.
			if (swimSpeed == 0)
				swimSpeed = Math.max(walkSpeed, flySpeed);
			
			//Default movement option.
			var tokenSpeed = walkSpeed;
			var speedColor = 'walk';
			var dashColor = 'walkDash'
			
			//Gets the token's elevation and the terrain below it
			const elevation = token.data.elevation;
			const terrains = canvas.terrain.terrainFromPixels(token.x, token.y);
			var environments = [];
			if (terrains.length > 0)
				terrains.forEach(terrain => environments.push(terrain.data.environment));
			if (!environments.includes('urban')) {
				if (elevation < 0 && !environments.includes('water')) {
					tokenSpeed = burrowSpeed;
					speedColor = 'burrow';
					dashColor = 'burrowDash';
				}
				if (elevation < 0 && environments.includes('water')) {
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
				if (elevation == 0 && environments.includes('water') && shouldSwim) {
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
			//If the terrain is urban, disable any elevation checks and instead use the token's walkSpeed or flySpeed, whichever is larger.
			if (environments.includes('urban') && (flySpeed >= walkSpeed || (settingDefaultHovering && hovering))) {
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
					default: true,
				},
				{
					id: "defaultSwimming",
					name: "Force Swimming",
					hint: "Forces creatures with a greater swimming than walking or flying speed to use their swimming speed in water at elevation 0.",
					scope: "world",
					config: true,
					type: Boolean,
					default: true,
				}
			]
		}
		//Called by Drag Ruler when a token is moved around. Does not take the grid into account, it is called for every tiny movement.
		getCostForStep(token, area, options={}) {
			const settingDefaultSwimming = this.getSetting('defaultSwimming');
			options.token = token;

			const terrains = area.map(space => canvas.terrain.terrainFromGrid(space.x, space.y))[0];
			var environments = [];
			if (terrains.length > 0)
				terrains.forEach(terrain => environments.push(terrain.data.environment));

			const walkSpeed = parseFloat(getProperty(token, "actor.data.data.attributes.movement.walk"));
			const flySpeed = parseFloat(getProperty(token, "actor.data.data.attributes.movement.fly"));
			const swimSpeed = parseFloat(getProperty(token, "actor.data.data.attributes.movement.swim"));
			const shouldSwim = ((swimSpeed >= walkSpeed) && (swimSpeed >= flySpeed) && settingDefaultSwimming) || (EDR_movementMode[token.id] == 'swim' && swimSpeed > 0);
			
			//Ignore all difficult terrain in urban terrain or if the token is flying.
			if ((environments.includes('urban')) || 
				(EDR_movementMode[token.id] == 'fly')) 
			{
				return 1;
			}
			if (environments.includes('water')) {
				//If the terrain is water and the creature is able to swim it will look for any non-water difficult terrain.
				if (shouldSwim) {
					var terrainCost = 1;
					terrains.forEach(function(terrain) {
						if (terrain.data.environment != 'water') {
							terrainCost = Math.max(terrainCost, terrain.data.multiple);
						}
					});
					return terrainCost;
				}
				//If the terrain is water and the creature is unable to swim, it will increase the movement cost based on other difficult terrain according to dnd5e rules.
				else {
					var terrainCost = 1;
					var waterCost = 1;
					terrains.forEach(function(terrain) {
						if (terrain.data.environment != 'water') {
							terrainCost = Math.max(terrainCost, terrain.data.multiple);
						}
						else {
							waterCost = Math.max(waterCost, terrain.data.multiple);
						}
					});
					const cost = terrainCost + waterCost - 1;
					return cost;
				}
			}
			
			const costs = area.map(space => terrainRuler.getCost(space.x, space.y, options));
			return costs.reduce((max, current) => Math.max(max, current));
		}
	}

	dragRuler.registerModule("elevation-drag-ruler", ElevationSpeedProvider)
})
