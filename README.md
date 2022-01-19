![Latest Release Download Count](https://img.shields.io/github/downloads/PepijnMC/ElevationDragRuler/latest/module.zip?color=2b82fc&label=DOWNLOADS&style=for-the-badge) ![Foundry Core Compatible Version](https://img.shields.io/badge/dynamic/json.svg?url=https%3A%2F%2Fgithub.com%2FPepijnMC%2FElevationDragRuler%2Freleases%2Flatest%2Fdownload%2Fmodule.json&label=Foundry%20Version&query=$.compatibleCoreVersion&colorB=orange&style=for-the-badge) <br><a href='https://ko-fi.com/pepijn' target='_blank'><img height='35' style='border:0px;height:45px;' src='https://az743702.vo.msecnd.net/cdn/kofi3.png?v=0' border='0' alt='Buy Me a Coffee at ko-fi.com' />

# Elevation Drag Ruler
A Foundry VTT module which adds a dnd5e speedprovider for Drag Ruler to pick between different movement options based on elevation and terrain from the Enhanced Terrain Layer module.
  
## Requirements
- [DnD5e](https://foundryvtt.com/packages/dnd5e) system by Atropos
- [Drag Ruler](https://github.com/manuelVo/foundryvtt-drag-ruler) module by Manuel Vögele
- [Terrain Ruler](https://github.com/manuelVo/foundryvtt-terrain-ruler) module by Manuel Vögele
- [Enhanced Terrain Layer](https://github.com/ironmonk88/enhanced-terrain-layer) module by IronMonk
  
## Movement Options
A creature's movement option is picked when you first start dragging it. It can not change to a different movement option dynamically, as that goes beyond what a speedcontroller for Drag Ruler can do. This is most noticable with water, as entering it from land will not automatically switch to your swimming speed. So make sure to stop and start when entering or leaving water for the best experience.
  
### Walking
A creature's default movement option is walking.
  
### Flying
Creatures will be set to fly, and thus use their flying speed, when the token's elevation is above 0. When flying, creatures will ignore all difficult terrain set by the Enhanced Terrain Layer module.

Additionally, this speedprovider includes two settings to streamline setting up flying creatures. These settings can be found within Drag Ruler's settings.
- **Force Hovering**: When enabled, changes the default movement option to flying instead of walking for creatures that can hover. The creature will still burrow or swim when its elevation is below 0. Enabled by default.
- **Force Flying**: When enabled, changes the default movement option to flying instead of walking for creatures with a greater flying than walking speed. The creature will still burrow or swim when its elevation is below 0. Disabled by default.

### Swimming
Creatures will be set to swim, and thus use their swimming speed, when the token's elevation is below 0 and is within "water" terrain from the Enhanced Terrain Layer module. If the creature has no swimming speed, it will use the greater of their walking or flying speed but water will count as difficult terrain.
  
**Note**: The module does not automatically use your swimming speed when you are in water at elevation 0, it will keep using your walking speed and water will continue to count as difficult terrain! You have to set the elevation below 0. This is done because of creatures with a larger walking/flying/burrowing than swimming speed, the module has no access to how far they have already travelled and they might be unable to use their smaller swimming speed once they reach the water. Additionally, with only a small swimming speed a creature will still have other movement options left after using up their swimming speed which can then be utilized by bringing the token back to elevation 0. I might add a setting to force swimming even at elevation 0, for people who prefer a more streamlined swimming experience over handling this edge case.

### Burrowing
Creatures will be set to burrow, and thus use their burrowing speed, when the token's elevation is below 0 and is not within "water" terrain. While burrowing, creatures will ignore all difficult terrain set by the Enhanced Terrain Layer module.

### Urban Terrain
Because elevation is useful for more than just determining a creature's movement type, all elevation based movement switching can be disabled using the "urban" terrain environment. Instead, the creature will use its highest movement speed between walking and flying.
  
## Future Plans
These are features currently in the work, vague ideas, and anything in between.
- **Force Swimming**: Add a setting to force creatures to swim in water terrain even at elevation 0. It will still use walking/flying speed if the creature has no swimming speed but if you are using any creatures whose walking speed is higher than their swimming speed you will not be able to switch to their walking speed anymore while in water. 
