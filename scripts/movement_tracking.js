let socket;

Hooks.once("socketlib.ready", () => {
	socket = socketlib.registerModule("elevation-drag-ruler");
	socket.register("updateCombatantDragRulerFlags", _socketUpdateCombatantDragRulerFlags);
	socket.register("recalculate", _socketRecalculate);
});

function updateCombatantDragRulerFlags(combat, updates) {
	const combatId = combat.id;
	return socket.executeAsGM(_socketUpdateCombatantDragRulerFlags, combatId, updates);
}

async function _socketUpdateCombatantDragRulerFlags(combatId, updates) {
	const user = game.users.get(this.socketdata.userId);
	const combat = game.combats.get(combatId);
	const requestedUpdates = updates.length;
	updates = updates.filter(update => {
		const actor = combat.combatants.get(update._id).actor;
		if (!actor) return false;
		return actor.testUserPermission(user, "OWNER");
	});
	if (updates.length !== requestedUpdates) {
		console.warn(
			`Some of the movement history updates requested by user '${
				game.users.get(this.socketdata.userId).name
			}' were not performed because the user lacks owner permissions for those tokens`,
		);
	}
	updates = updates.map(update => {
		return {_id: update._id, flags: {dragRuler: update.dragRulerFlags}};
	});
	await combat.updateEmbeddedDocuments("Combatant", updates, {diff: false});
}

function recalculate(tokens) {
	socket.executeForEveryone(_socketRecalculate, tokens ? tokens.map(token => token.id) : undefined);
}

function _socketRecalculate(tokenIds) {
	const ruler = canvas.controls.ruler;
	if (ruler.isDragRuler) ruler.dragRulerRecalculate(tokenIds);
}

export function getMovementTotal(token) {
	const combatant = game.combat.getCombatantByToken(token.id);
	const dragRulerFlags = combatant.flags.dragRuler;
	if (!dragRulerFlags) return;
	if (!dragRulerFlags.passedWaypoints) return;
	if (dragRulerFlags.passedWaypoints.length === 0) return;

	var movementTotal = 0;
	dragRulerFlags.passedWaypoints.forEach(waypoint => {
		const visitedSpaces = waypoint.dragRulerVisitedSpaces;
		movementTotal += visitedSpaces[visitedSpaces.length - 1].distance;
	})
	return movementTotal;
}

export async function addMovementCost(token, cost) {
	const combatant = game.combat.getCombatantByToken(token.id);
	const dragRulerFlags = combatant.flags.dragRuler;
	if (!dragRulerFlags) return;
	dragRulerFlags.passedWaypoints.push({x: token.document.x, y: token.document.y, dragRulerFinalState: {noDiagonals: 0}, dragRulerVisitedSpaces: [{x: token.document.x, y: token.document.y, distance: 0}, {x: token.document.x, y: token.document.y, distance: cost}]});
	await updateCombatantDragRulerFlags(ui.combat.viewed, [{_id: combatant.id, dragRulerFlags}]);
	recalculate();
}

export async function modifyPreviousMovementCost(token, cost) {
	const combatant = game.combat.getCombatantByToken(token.id);
	const dragRulerFlags = combatant.flags.dragRuler;
	if (!dragRulerFlags) return;
	if (!dragRulerFlags.passedWaypoints) return;
	if (dragRulerFlags.passedWaypoints.length === 0) return;
	var visitedSpaces = dragRulerFlags.passedWaypoints[dragRulerFlags.passedWaypoints.length - 1].dragRulerVisitedSpaces;
	for (var i = 0; i < visitedSpaces.length; i++) {
		visitedSpaces[i].distance = (i == visitedSpaces.length - 1) ? cost : 0;
	}
	dragRulerFlags.passedWaypoints[dragRulerFlags.passedWaypoints.length - 1].dragRulerVisitedSpaces = visitedSpaces;
	await updateCombatantDragRulerFlags(ui.combat.viewed, [{_id: combatant.id, dragRulerFlags}]);
	recalculate();
}