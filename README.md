![Latest Release Download Count](https://img.shields.io/github/downloads/PepijnMC/ElevationDragRuler/latest/module.zip?color=2b82fc&label=latest%20release%20downloads&style=for-the-badge)
![Foundry Core Compatible Version](https://img.shields.io/badge/dynamic/json.svg?url=https%3A%2F%2Fgithub.com%2FPepijnMC%2FElevationDragRuler%2Freleases%2Flatest%2Fdownload%2Fmodule.json&label=Foundry%20Version&query=$.compatibility.verified&colorB=orange&style=for-the-badge)
<a href='https://ko-fi.com/pepijn' target='_blank'><img src='https://img.shields.io/badge/Donate-Buy%20me%20a%20coffee-red?style=for-the-badge' alt='Buy Me a Coffee at ko-fi.com' />

# DnD5e Drag Ruler Integration
A Foundry VTT module that aims to enhance the Drag Ruler module for use with the DnD5e system. This includes tokens being able to easily and quickly change between their different types of movement speed (swimming, flying, burrowing, and climbing) and an 'automatic' movement setting to streamline your encounter setups. You will no longer have to struggle with Wisps only showing their 0 feet walking speed, or with Dragons and their multitude of different movement speeds.

![Creatures can more easily use their different movement speeds.](https://raw.githubusercontent.com/PepijnMC/ElevationDragRuler/main/media/switching_speeds.webp)
## Requirements
- <a href="https://foundryvtt.com/packages/dnd5e" target="_blank">DnD5e</a> system by Atropos
- <a href="https://github.com/manuelVo/foundryvtt-drag-ruler" target="_blank">Drag Ruler</a> module by Manuel Vögele

## Movement Options
A creature's movement speed can be picked by clicking a button in the Token HUD. By default this is set to automatic, which lets the module figure out what movement speed to use. There are also two keybindings (default `[` and `]`) to cycle through the movement modes of selected tokens.
  
<img src="https://raw.githubusercontent.com/PepijnMC/ElevationDragRuler/main/media/Token%20HUD%20Switch%20Speed.png" width="200">
  
### Elevation
When a creature's movement speed is set to automatic, the module uses the token's elevation to determine its movement speed. Above ground the creature will fly and below ground the creature will burrow, or swim if water terrain is present. The usage of elevation can be disabled in the speed controller settings, in which case a creature with its movement speed set to automatic will always use its highest movement speed, or water speed if water terrain is present.

### Bonus Dashes
In the resource tab of the token configuration a token can be set to have access to bonus dashes, which when enabled will include an additional range band. This setting is enabled by default for creatures with features that permanently grant a bonus action dash, like Cunning Action.

### Conditions
Various conditions in Dnd5e affect movement and this module handles all of them. Being either dead, grappled, incapacitated, paralysed, petrified, restrained, asleep, stunned, and/or unconscious will set a creature movement range to zero. Additionally, creatures that are hasted or slowed will have their movement speed doubled or halved respectively. Prone creatures will automatically crawl, spending extra movement.

## Issues and Requests
Please report issues and propose requests <a href="https://github.com/PepijnMC/ElevationDragRuler/issues" target="_blank">here</a>.

## Translations
You can help translate this module [here](https://weblate.foundryvtt-hub.com/engage/elevation-drag-ruler). There are a handful of languages setup to translate but please feel free to add any other language, it is quick and easy to do.

## API
This section is for those who might want to make their own module interact with this one.

### Flags
A lot of data the module uses is saved as flags on the token document under the `elevation-drag-ruler` namespace.

- `movementMode` (READ-ONLY)
  - This flag when set contains a string of the token's last used movement mode, either `walk`, `swim`, `fly`, `burrow`, `climb`, or `teleport`.
  - This flag is not continiously updated and is only set during the `onDragLeftStart` function. It's ill-advised to write to this flag as it will either be overwritten or cause issues in the pipeline. Use `selectedSpeed` instead.
- `selectedSpeed`
  - This flag when set contains a string of the token's currently selected movement speed, either `auto`, `walk`, `swim`, `fly`, `burrow`, `climb`, or `teleport`.
  - This flag is not set by default, in which case it can be safely assumed the token is in `auto` mode.
  - Although untested it should be safe to write to this flag.
- `hasBonusDash`
  - This flag when set (`true`/`false`) indicates whether or not a token should have a bonus dash range.
  - This flag is set in the token configuration menu.
  - This flag is not set by default, in which case the module will fall back to looking for the Cunning Action feature. This does not update the flag itself!
  - Although untested it should be safe to write to this flag.
- `teleportRange`
  - This flag contains a number related to the optional teleport movement option.
  - This flag is set in the token configuration menu (default `0`).
  - A token will be able to select the teleport movement option when this number is greater than zero.
  - Although untested it should be safe to write to this flag.
- `teleportCost`
  - This flag contains a number related to the optional teleport movement option.
  - This flag is controlled by the token configuration menu (default `0`).
  - Although untested it should be safe to write to this flag.
- `keybindForceTeleport` (READ-ONLY)
  - This flag returns true for controlled tokens when holding down the `Force Teleport` keybind (default `Q`).
  - This flag should not be written to manually, as it will likely be overwritten before it can be used. Use `forceTeleport` instead.
- `forceTeleport` (WRITE-ONLY)
  - This flag when true will force the token to use its teleport movement mode, regardless of its `selectedSpeed`.
  - This flag is not set at all by this module and is only meant to provide a means for macros and other modules to force a teleportation. Make sure to manually reset the flag too!
- `ignoredEnvironments`
  - This flag when set contains the data of the terrain configuration in the form of an object of objects. The object contains all terrain ids from Enhanced Terrain Layer and an `all`, each of which has its value set to another object of all movement speeds and an `any` which are set to `true`/`false` (`true` meaning to ignore this terrain for this movement speed).
  - The "Toggle Terrain" button added to the token HUD also uses this flag, specifically `ignoredEnvironments.all.any`.
  - The object can be navigated like normal, for example `ignoredEnvironments.desert.fly`.
  - This flag is not set by default, in which case the default array found in the `getConfiguredEnvironments()` function is used.
  - Although untested it should be safe to write to this flag.
  - I do not recommend changing the structure of this flag. The configuration menu will reflect any changes but any new terrains or movement speeds will not behave well.
  
### Functions
Various utility functions are exposed under `game.modules.get('elevation-drag-ruler').api`.
- getConfiguredEnvironments(tokenDocument)
  - Returns the `ignoredEnviroments` flag of a token, see above. If it does not exist it will instead return the default object.
- getHighestMovementSpeed(tokenDocument)
  - Returns the value of the highest movement speed of a token.
- getTokenSpeeds(tokenDocument)
  - Returns an array of available movement modes the token might have selected.
  - Always includes 'auto'.
- getMovementMode(token)
  - Returns the movement mode that the module will use if the token starts being dragged.
  - This does not update the `movementMode` flag of the token.

### Example Code

**Teleport Toggle**
```js
//Retrieve the controlled tokens.
const tokens = canvas.tokens.controlled;
//For each token, check if their forceTeleport flag is true.
//If so, set it to false otherwise set it to true.
tokens.forEach((token) => {
	const forceTeleport = token.document.getFlag('elevation-drag-ruler', 'forceTeleport');
	if (forceTeleport) token.document.setFlag('elevation-drag-ruler', 'forceTeleport', false);
	else token.document.setFlag('elevation-drag-ruler', 'forceTeleport', true);
});
```
**Difficult Terrain Toggle**
```js
//Retrieve the controlled tokens.
const tokens = canvas.tokens.controlled;
//Iterate over each token.
tokens.forEach((token) => {
        //Grab the current configured terrain settings, or if they don't exist provide a default configuration.
	const configuredEnvironments = token.document.getFlag('elevation-drag-ruler', 'ignoredEnvironments') || {'all': {'any': false, 'walk': false, 'swim': false, 'fly': false, 'burrow': false, 'climb': false}, 'arctic': {'any': false, 'walk': false, 'swim': false, 'fly': false, 'burrow': false, 'climb': false}, 'coast': {'any': false, 'walk': false, 'swim': false, 'fly': false, 'burrow': false, 'climb': false}, 'desert': {'any': false, 'walk': false, 'swim': false, 'fly': false, 'burrow': false, 'climb': false}, 'forest': {'any': false, 'walk': false, 'swim': false, 'fly': false, 'burrow': false, 'climb': false}, 'grassland': {'any': false, 'walk': false, 'swim': false, 'fly': false, 'burrow': false, 'climb': false}, 'jungle': {'any': false, 'walk': false, 'swim': false, 'fly': false, 'burrow': false, 'climb': false}, 'mountain': {'any': false, 'walk': false, 'swim': false, 'fly': false, 'burrow': true, 'climb': true}, 'swamp': {'any': false, 'walk': false, 'swim': false, 'fly': false, 'burrow': false, 'climb': false}, 'underdark': {'any': false, 'walk': false, 'swim': false, 'fly': false, 'burrow': false, 'climb': false}, 'urban': {'any': false, 'walk': false, 'swim': false, 'fly': false, 'burrow': false, 'climb': false}, 'water': {'any': false, 'walk': false, 'swim': true, 'fly': false, 'burrow': false, 'climb': false}};
	//Toggle the setting to ignore all terrain for any movemement speed.
	if (configuredEnvironments.all.any) configuredEnvironments.all.any = false;
	else configuredEnvironments.all.any = true;
	//Update the token flag.
	token.document.setFlag('elevation-drag-ruler', 'ignoredEnvironments', configuredEnvironments);
});
```
**Disable Difficult Terrain**
```js
//Retrieve the controlled tokens.
const tokens = canvas.tokens.controlled;
//Iterate over each token.
tokens.forEach((token) => {
        //Grab the current configured terrain settings, or if they don't exist provide a default configuration.
	const configuredEnvironments = token.document.getFlag('elevation-drag-ruler', 'ignoredEnvironments') || {'all': {'any': false, 'walk': false, 'swim': false, 'fly': false, 'burrow': false, 'climb': false}, 'arctic': {'any': false, 'walk': false, 'swim': false, 'fly': false, 'burrow': false, 'climb': false}, 'coast': {'any': false, 'walk': false, 'swim': false, 'fly': false, 'burrow': false, 'climb': false}, 'desert': {'any': false, 'walk': false, 'swim': false, 'fly': false, 'burrow': false, 'climb': false}, 'forest': {'any': false, 'walk': false, 'swim': false, 'fly': false, 'burrow': false, 'climb': false}, 'grassland': {'any': false, 'walk': false, 'swim': false, 'fly': false, 'burrow': false, 'climb': false}, 'jungle': {'any': false, 'walk': false, 'swim': false, 'fly': false, 'burrow': false, 'climb': false}, 'mountain': {'any': false, 'walk': false, 'swim': false, 'fly': false, 'burrow': true, 'climb': true}, 'swamp': {'any': false, 'walk': false, 'swim': false, 'fly': false, 'burrow': false, 'climb': false}, 'underdark': {'any': false, 'walk': false, 'swim': false, 'fly': false, 'burrow': false, 'climb': false}, 'urban': {'any': false, 'walk': false, 'swim': false, 'fly': false, 'burrow': false, 'climb': false}, 'water': {'any': false, 'walk': false, 'swim': true, 'fly': false, 'burrow': false, 'climb': false}};
	//Configure the setting to ignore extra movement costs for ALL terrain for ANY movement speed.
	configuredEnvironments.all.any = true;
	//Update the token flag.
	token.document.setFlag('elevation-drag-ruler', 'ignoredEnvironments', configuredEnvironments);
});
```
As the MIT license suggests, feel free (and encouraged) to copy and adapt my code to work with any other rpg system.
