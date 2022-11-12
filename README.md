![Latest Release Download Count](https://img.shields.io/github/downloads/PepijnMC/ElevationDragRuler/latest/module.zip?color=2b82fc&label=latest%20release%20downloads&style=for-the-badge)
![Foundry Core Compatible Version](https://img.shields.io/badge/dynamic/json.svg?url=https%3A%2F%2Fgithub.com%2FPepijnMC%2FElevationDragRuler%2Freleases%2Flatest%2Fdownload%2Fmodule.json&label=Foundry%20Version&query=$.compatibility.verified&colorB=orange&style=for-the-badge)
<a href='https://ko-fi.com/pepijn' target='_blank'><img src='https://img.shields.io/badge/Donate-Buy%20me%20a%20coffee-red?style=for-the-badge' alt='Buy Me a Coffee at ko-fi.com' />

# DnD5e Drag Ruler Integration
A Foundry VTT module that aims to enhance the Drag Ruler module for use with the DnD5e system. This includes tokens being able to easily and quickly change between their different types of movement speed (swimming, flying, burrowing, and climbing) and an 'automatic' movement setting to streamline your encounter setups. You will no longer have to struggle with Wisps only showing their 0 feet walking speed, or with Dragons and their multitude of different movement speeds.
  
In addition this module fully supports the use of the Enhanced Terrain Layer + Terrain Ruler modules, actors and tokens can be configured to ignore certain types of terrain based on the movement speed they are currently using. Swimming in water terrain or climbing in mountain terrain is no longer a problem for your characters and creatures, even your Ranger can be configured to ignore movement penalties in their favored terrain. 

![Creatures can more easily use their different movement speeds.](https://raw.githubusercontent.com/PepijnMC/ElevationDragRuler/main/media/switching_speeds.webp)
## Requirements
- <a href="https://foundryvtt.com/packages/dnd5e" target="_blank">DnD5e</a> system by Atropos
- <a href="https://github.com/manuelVo/foundryvtt-drag-ruler" target="_blank">Drag Ruler</a> module by Manuel Vögele
### Recommended
- <a href="https://github.com/manuelVo/foundryvtt-terrain-ruler" target="_blank">Terrain Ruler</a> module by Manuel Vögele
- <a href="https://github.com/ironmonk88/enhanced-terrain-layer" target="_blank">Enhanced Terrain Layer</a> module by IronMonk

## Movement Options
A creature's movement speed can be picked by clicking a button in the Token HUD. By default this is set to automatic, which lets the module figure out what movement speed to use. There are also two keybindings (default `[` and `]`) to cycle through the movement modes of selected tokens.
  
<img src="https://raw.githubusercontent.com/PepijnMC/ElevationDragRuler/main/media/Token%20HUD%20Switch%20Speed.png" width="200">
  
### Elevation
**Due to a bug with enhanced terrain layer, terrain currently does not dictate what movement speed is used in automatic mode!**

When a creature's movement speed is set to automatic, the module uses the token's elevation to determine its movement speed. Above ground the creature will fly and below ground the creature will burrow, or swim if water terrain is present. The usage of elevation can be disabled in the speed controller settings, in which case a creature with its movement speed set to automatic will always use its highest movement speed, or water speed if water terrain is present.

## Bonus Dashes
In the resource tab of the token configuration a token can be set to have access to bonus dashes, which when enabled will include an additional range band. This setting is enabled by default for creatures with features that permanently grant a bonus action dash, like Cunning Action.

## Difficult Terrain
When using Enhanced Terrain Layer and Terrain Ruler, movement costs are calculated according to DnD5e rules. This means movement costs only stack between water terrain and other terrain.
  
A token can be configured to ignore certain or all terrain for a certain or any movement speed. This works for individual tokens but also for prototype tokens from actors and for the default token configuration in the core settings. By default swimming will ignore water terrain and burrowing/climbing will ignore mountain terrain.

<img src="https://raw.githubusercontent.com/PepijnMC/ElevationDragRuler/main/media/Token%20Terrain%20Configuration.png" width="400">
  
The Token HUD also contains a button to quickly toggle all difficult terrain for any movement speed for that token. A keybinding (default `E`) is also provided to toggle difficult terrain for selected tokens.
  
<img src="https://raw.githubusercontent.com/PepijnMC/ElevationDragRuler/main/media/Token%20HUD%20Toggle%20Terrain.png" width="200">

To help streamline the use of flying creatures, flying tokens will be treated as if they were 1 elevation higher for the purpose of ignoring difficult terrain. This eliminates the cumbersome manual changing of a token's elevation to make it ignore ground based difficult terrain before landing back on the ground. This behavior can be disabled in the settings.

## Teleportation
In the resource tab of the token configuration menu a teleportation range and cost can be specified. If the teleportation range is set to a number greater than zero, cycling through that token's movement modes will include a teleportation option. When teleporting, a token will spent only the specified cost (`0` by default) regardless of the actual distance moved. This allows for more fluid integration of teleportation during combat with drag ruler's movement history turned on.

A keybinding (default `Q`) can be held down to force a token to teleport regardless of its selected speed. Make sure to have the token selected before pressing the hotkey but do not yet start dragging it yet.

## Conditions
Various conditions in Dnd5e affect movement and this module handles all of them. Being either dead, grappled, incapacitated, paralysed, petrified, restrained, asleep, stunned, and/or unconscious will set a creature movement range to zero. Additionally, creatures that are hasted or slowed will have their movement speed doubled or halved respectively. Prone creatures will automatically crawl, spending extra movement.

## Issues and Requests
Please report issues and propose requests <a href="https://github.com/PepijnMC/ElevationDragRuler/issues" target="_blank">here</a>.
  
## API Flags
This section is for those who might want to make their own module interact with this one. Calling this an API is too generous but most of the data this module uses is saved to flags on the Token Document under `elevation-drag-ruler` (the old module's name).

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
- `wasProne`
  - This flag when set (`true`/`false`) indicates whether or not a token was prone at the start of a combat turn.
  - This flag is reset and set every combat turn.
  - When true during a token's turn, removing the prone condition during said turn will spend the appropriate amount of movement to stand up.
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
	token.document.setFlag('elevation-drag-ruler', 'forceTeleport', true);
});
```
  
As the MIT license suggests, feel free (and encouraged) to copy and adapt my code to work with any other rpg system.
