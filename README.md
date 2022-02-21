![Latest Release Download Count](https://img.shields.io/github/downloads/PepijnMC/ElevationDragRuler/latest/module.zip?color=2b82fc&label=latest%20release%20downloads&style=for-the-badge)
![Foundry Core Compatible Version](https://img.shields.io/badge/dynamic/json.svg?url=https%3A%2F%2Fgithub.com%2FPepijnMC%2FElevationDragRuler%2Freleases%2Flatest%2Fdownload%2Fmodule.json&label=Foundry%20Version&query=$.compatibleCoreVersion&colorB=orange&style=for-the-badge) <br><a href='https://ko-fi.com/pepijn' target='_blank'><img height='35' style='border:0px;height:45px;' src='https://az743702.vo.msecnd.net/cdn/kofi3.png?v=0' border='0' alt='Buy Me a Coffee at ko-fi.com' />

# DnD5e Drag Ruler Integration
A Foundry VTT module that adds a DnD5e speedprovider for Drag Ruler to manually or automatically pick between different movement speeds based on elevation and/or terrain from Enhanced Terrain Layer.

![Creatures can more easily use their different movement speeds.](https://raw.githubusercontent.com/PepijnMC/ElevationDragRuler/main/media/switching_speeds.webp)
## Requirements
- <a href="https://foundryvtt.com/packages/dnd5e" target="_blank">DnD5e</a> system by Atropos
- <a href="https://github.com/manuelVo/foundryvtt-drag-ruler" target="_blank">Drag Ruler</a> module by Manuel Vögele
### Recommended
- <a href="https://github.com/manuelVo/foundryvtt-terrain-ruler" target="_blank">Terrain Ruler</a> module by Manuel Vögele
- <a href="https://github.com/ironmonk88/enhanced-terrain-layer" target="_blank">Enhanced Terrain Layer</a> module by IronMonk

## Movement Options
A creature's movement speed can be picked by clicking a button in the Token HUD. By default this is set to automatic, which lets the module figure out what movement speed to use.
  
### Elevation
When a creature's movement speed is set to automatic, the module uses the token's elevation to determine its movement speed. Above ground the creature will fly and below ground the creature will burrow, or swim if water terrain is present. The usage of elevation can be disabled in the speed controller settings, in which case a creature with its movement speed set to automatic will always use its highest movement speed, or water speed if water terrain is present.
 
### Difficult Terrain
When using Enhanced Terrain Layer and Terrain Ruler, movement costs are calculated according to DnD5e rules. This means movement costs only stack between water terrain and other terrain. Swimming tokens will automatically ignore movement costs from water terrain.

To streamline the use of flying creatures, flying tokens at elevation 0 will be treated as if they were at elevation 1 for the purpose of ignoring difficult terrain. This eliminates the cumbersome manual changing of a token's elevation to make it ignore ground based difficult terrain before landing back on the ground. This behavior can be disabled in the settings.

## Issues and Requests
Please report issues and propose requests <a href="https://github.com/PepijnMC/ElevationDragRuler/issues" target="_blank">here</a>.
