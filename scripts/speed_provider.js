import { isTokenInCombat, hasBonusDash, getMovementTotal } from './util.js';

//Hooking into Drag Ruler.
Hooks.once('dragRuler.ready', (SpeedProvider) => {
	class DnD5eSpeedProvider extends SpeedProvider {
		//An array of colors to be used by the movement ranges.
		get colors() {
			return [
				{id: 'walk', default: 0x00FF00, 'name': 'Walking'},
				{id: 'fly', default: 0x00FFFF, 'name': 'Flying'},
				{id: 'swim', default: 0x0000FF, 'name': 'Swimming'},
				{id: 'burrow', default: 0xFFAA00, 'name': 'Burrowing'},
				{id: 'climb', default: 0xAA6600, 'name': 'Climbing'},
				{id: 'teleport', default: 0xAA00AA, 'name': 'Teleporting'},
				{id: 'dash', default: 0xFFFF00, 'name': 'Dashing'},
				{id: 'bonusDash', default: 0xFF6600, 'name': 'Bonus Dashing'}
			]
		}

		//This is called by Drag Ruler once when a token starts being dragged. Does not get called again when setting a waypoint.
		getRanges(token) {
			//Retrieves the total movement in the token's movement history to be used by the teleportation range.
			var movementTotal = 0;
			if (isTokenInCombat(token.document) && game.settings.get('drag-ruler', 'enableMovementHistory')) movementTotal = getMovementTotal(token) || 0;

			//Retrieves and compiles relevant movement data of the token.
			const walkSpeed = parseFloat(getProperty(token, 'actor.system.attributes.movement.walk'));
			const flySpeed = parseFloat(getProperty(token, 'actor.system.attributes.movement.fly'));
			const burrowSpeed = parseFloat(getProperty(token, 'actor.system.attributes.movement.burrow'));
			const climbSpeed = parseFloat(getProperty(token, 'actor.system.attributes.movement.climb'));
			const swimSpeed = parseFloat(getProperty(token, 'actor.system.attributes.movement.swim'));
			const teleportRange = token.document.getFlag('elevation-drag-ruler', 'teleportRange');
			const movementModes = {'walk': walkSpeed, 'fly': flySpeed, 'swim': swimSpeed, 'burrow': burrowSpeed, 'climb': climbSpeed, 'teleport': movementTotal + teleportRange};
			const movementMode = token.document.getFlag('elevation-drag-ruler', 'movementMode') || 'walk';
			
			//Teleportation does not require speed modifiers or dash ranges.
			if (movementMode == 'teleport') {
				return [{range: movementModes['teleport'], color: 'teleport'}]
			}
			//Applies various modifiers to the movement speeds of the token depending on its conditions and features.
			else {
				//Any of these conditions set a creature's speed to 0.
				var movementRestricted = false;
				const movementRestrictions = ['dead', 'grappled', 'incapacitated', 'paralysis', 'petrified', 'restrain', 'sleep', 'stun', 'unconscious'];
				movementRestrictions.forEach(condition => {
					if (token.document.hasStatusEffect(condition)) movementRestricted = true;
				});

				//Creatures can be slowed or hasted to half or double their available movement speeds respectively.
				const movementMultiplier = (token.document.hasStatusEffect('slowed') ? 0.5 : 1) * (token.document.hasStatusEffect('hasted') ? 2 : 1);

				//Retrieves if the token has a bonus action dash available.
				const bonusDashMultiplier = hasBonusDash(token.document) ? 3 : 2;

				const movementRange = movementRestricted ? 0 : (movementModes[movementMode] * movementMultiplier);
				return [{range: movementRange, color: movementMode}, {range: movementRange * 2, color: 'dash'}, {range: movementRange * bonusDashMultiplier, color: 'bonusDash'}];
			}
		}
	}
	//Registers the speed provider to be used by Drag Ruler's API.
	dragRuler.registerModule('elevation-drag-ruler', DnD5eSpeedProvider)
});