import { getConfiguredEnvironments, getHighestMovementSpeed, getTokenSpeeds, getMovementMode } from './util.js';

export function registerAPI() {
	game.modules.get('elevation-drag-ruler').api = {
		getConfiguredEnvironments,
		getHighestMovementSpeed,
		getTokenSpeeds,
		getMovementMode
	};
}