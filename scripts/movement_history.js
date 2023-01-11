import { updateCombatantDragRulerFlags, recalculate } from "./socket.js";

export async function modifyPreviousMovementCost(token, cost) {
	const combatant = game.combat.getCombatantByToken(token.id);
	const dragRulerFlags = combatant.flags.dragRuler;
	if (!dragRulerFlags) return;
	if (!dragRulerFlags.passedWaypoints) return;
	if (dragRulerFlags.passedWaypoints.length === 0) return;
  
	var visitedSpaces = dragRulerFlags.passedWaypoints[dragRulerFlags.passedWaypoints.length - 1].dragRulerVisitedSpaces;
	if (!visitedSpaces) return;
	for (var i = 0; i < visitedSpaces.length; i++) {
		visitedSpaces[i].distance = (i == visitedSpaces.length - 1) ? cost : 0;
	}
	dragRulerFlags.passedWaypoints[dragRulerFlags.passedWaypoints.length - 1].dragRulerVisitedSpaces = visitedSpaces;
	await updateCombatantDragRulerFlags(ui.combat.viewed, [{_id: combatant.id, dragRulerFlags}]);
	recalculate();
}