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
			const walkSpeed = parseFloat(getProperty(token, "actor.data.data.attributes.movement.walk"));
			const flySpeed = parseFloat(getProperty(token, "actor.data.data.attributes.movement.fly"));
			var swimSpeed = parseFloat(getProperty(token, "actor.data.data.attributes.movement.swim"));
			if (swimSpeed == 0)
				swimSpeed = walkSpeed / 2;
			const burrowSpeed = parseFloat(getProperty(token, "actor.data.data.attributes.movement.burrow"));
			var tokenSpeed = walkSpeed;
			var speedColor = 'walk';
			var dashColor = 'walkDash'

			const elevation = token.data.elevation;
			const terrain = canvas.terrain.terrainFromPixels(token.x, token.y);
			var environment = 0;

			if (terrain[0])
				environment = terrain[0].data.environment;
			if (elevation > 0 && environment != 'urban') {
				console.log('in the air')
				tokenSpeed = flySpeed;
				speedColor = 'fly';
				dashColor = 'flyDash';}
			if (elevation < 0 && environment != 'urban' && environment != 'water') {
				console.log('underground')
				tokenSpeed = burrowSpeed;
				speedColor = 'burrow';
				dashColor = 'burrowDash';}
			if (elevation < 0 && environment == 'water') {
				console.log('underwater')
				tokenSpeed = swimSpeed;
				speedColor = 'swim';
				dashColor = 'swimDash';}
			if (environment == 'urban' && flySpeed >= walkSpeed) {
				console.log('ignore elevation, higher fly speed.')
				tokenSpeed = flySpeed;
				speedColor = 'fly';
				dashColor = 'flyDash';}
			console.log(speedColor);
			return [{range: tokenSpeed, color: speedColor}, {range: tokenSpeed * 2, color: dashColor}];
		}
	

		getCostForStep(token, area, options={}) {
			const walkSpeed = parseFloat(getProperty(token, "actor.data.data.attributes.movement.walk"));
			const flySpeed = parseFloat(getProperty(token, "actor.data.data.attributes.movement.fly"));
			const swimSpeed = parseFloat(getProperty(token, "actor.data.data.attributes.movement.swim"));
			options.token = token;
			const terrain = area.map(space => canvas.terrain.terrainFromGrid(space.x, space.y));
			var environment = 0;
			if (terrain[0][0])
				environment = terrain[0][0].data.environment;
			if (environment == 'urban')
				return 1;
			const costs = area.map(space => terrainRuler.getCost(space.x, space.y, options));
			return costs.reduce((max, current) => Math.max(max, current));
		}
	}

	dragRuler.registerModule("elevation-drag-ruler", ElevationSpeedProvider)
})