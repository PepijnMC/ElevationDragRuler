Hooks.once("dragRuler.ready", (SpeedProvider) => {
	class ElevationSpeedProvider extends SpeedProvider {
		get colors() {
			return [
				{id: "walk", default: 0x00FF00},
				{id: "walkDash", default: 0xFFFF00},
				{id: "fly", default: 0x00FFFF},
				{id: "flyDash", default: 0xFFFF00},
				{id: "swim", default: 0x0000FF},
				{id: "swimDash", default: 0xFFFF00},
				{id: "burrow", default: 0xFFAA00},
				{id: "burrowDash", default: 0xFFFF00}
			]
		}
	
		getRanges(token) {
			const settingDefaultHovering = this.getSetting('defaultHovering');
			const settingDefaultFlying = this.getSetting('defaultFlying');

			const walkSpeed = parseFloat(getProperty(token, "actor.data.data.attributes.movement.walk"));
			const flySpeed = parseFloat(getProperty(token, "actor.data.data.attributes.movement.fly"));
			var swimSpeed = parseFloat(getProperty(token, "actor.data.data.attributes.movement.swim"));
			if (swimSpeed == 0)
				swimSpeed = Math.max(walkSpeed, flySpeed);
			const burrowSpeed = parseFloat(getProperty(token, "actor.data.data.attributes.movement.burrow"));
			const hovering = getProperty(token, "actor.data.data.attributes.movement.hover");
			var tokenSpeed = walkSpeed;
			var speedColor = 'walk';
			var dashColor = 'walkDash'

			const elevation = token.data.elevation;
			const terrain = canvas.terrain.terrainFromPixels(token.x, token.y);
			var environment = 0;
			if (terrain[0])
				environment = terrain[0].data.environment;
			
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
				if (elevation == 0 && ((settingDefaultHovering && hovering) || (flySpeed >= walkSpeed && settingDefaultFlying))) {
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
			return [{range: tokenSpeed, color: speedColor}, {range: tokenSpeed * 2, color: dashColor}];
		}

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

		getCostForStep(token, area, options={}) {
			options.token = token;
			const terrain = area.map(space => canvas.terrain.terrainFromGrid(space.x, space.y));
			const flying = dragRuler.getColorForDistanceAndToken(0, token) == 65535;
			const swimSpeed = parseFloat(getProperty(token, "actor.data.data.attributes.movement.swim"));
			var environment = 0;
			if (terrain[0][0])
				environment = terrain[0][0].data.environment;

			if (environment == 'urban' || flying)
				return 1;
			if (environment == 'water' && swimSpeed == 0)
				return 2;
			
			const costs = area.map(space => terrainRuler.getCost(space.x, space.y, options));
			return costs.reduce((max, current) => Math.max(max, current));
		}
	}

	dragRuler.registerModule("elevation-drag-ruler", ElevationSpeedProvider)
})
