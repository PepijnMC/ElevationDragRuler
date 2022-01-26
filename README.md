![Latest Release Download Count](https://img.shields.io/github/downloads/PepijnMC/ElevationDragRuler/latest/module.zip?color=2b82fc&label=latest%20downloads&style=for-the-badge)
![Foundry Core Compatible Version](https://img.shields.io/badge/dynamic/json.svg?url=https%3A%2F%2Fgithub.com%2FPepijnMC%2FElevationDragRuler%2Freleases%2Flatest%2Fdownload%2Fmodule.json&label=Foundry%20Version&query=$.compatibleCoreVersion&colorB=orange&style=for-the-badge) <br><a href='https://ko-fi.com/pepijn' target='_blank'><img height='35' style='border:0px;height:45px;' src='https://az743702.vo.msecnd.net/cdn/kofi3.png?v=0' border='0' alt='Buy Me a Coffee at ko-fi.com' />

# Elevation Drag Ruler
A Foundry VTT module which adds a dnd5e speedprovider for Drag Ruler to pick between different movement options based on elevation and terrain from the Enhanced Terrain Layer module.

[![Showcase Video](http://img.youtube.com/vi/QRoWH8K9td4/0.jpg)](http://www.youtube.com/watch?v=QRoWH8K9td4 "[Foundry VTT] Elevation Drag Ruler v1.1.1 Module Showcase")
## Requirements
- <a href="https://foundryvtt.com/packages/dnd5e" target="_blank">DnD5e</a> system by Atropos
- <a href="https://github.com/manuelVo/foundryvtt-drag-ruler" target="_blank">Drag Ruler</a> module by Manuel Vögele
- <a href="https://github.com/manuelVo/foundryvtt-terrain-ruler" target="_blank">Terrain Ruler</a> module by Manuel Vögele
- <a href="https://github.com/ironmonk88/enhanced-terrain-layer" target="_blank">Enhanced Terrain Layer</a> module by IronMonk
  
## Movement Options
A creature's movement option is picked when you first start dragging it. It can not change to a different movement option dynamically, as that goes beyond what a speedcontroller for Drag Ruler can do. This is most noticeable with water, as entering it from land will not automatically switch to your swimming speed. So make sure to stop and start when entering or leaving water for the best experience.
  
### Walking
A creature's default movement option is walking.
  
### Flying
Creatures will be set to fly, and thus use their flying speed, when the token's elevation is above 0. When flying, creatures will ignore all difficult terrain set by the Enhanced Terrain Layer module.

Additionally, this speedprovider includes two settings to streamline setting up flying creatures. These settings can be found within Drag Ruler's settings.
- **Force Hovering**: When enabled, changes the default movement option to flying instead of walking for creatures that can hover. The creature will still burrow or swim when its elevation is below 0. Enabled by default.
- **Force Flying**: When enabled, changes the default movement option to flying instead of walking for creatures with a greater flying than walking speed. The creature will still burrow or swim when its elevation is below 0. Disabled by default.

### Swimming
Creatures will be set to swim, and thus use their swimming speed, when the token's elevation is below or at 0 and is within "water" terrain from the Enhanced Terrain Layer module. If the creature has no swimming speed, it will use the greater of their walking or flying speed but water will count as difficult terrain.

**Note**: When a creature's swimming speed is smaller than both their walking and flying speed, the token's elevation needs to be below 0 for it to start swimming. Once their small swimming speed has been used up they can then be moved to elevation 0 to use what is left of their greater walking or flying speed, but in difficult terrain.

### Burrowing
Creatures will be set to burrow, and thus use their burrowing speed, when the token's elevation is below 0 and is not within "water" terrain. While burrowing, creatures will ignore all difficult terrain set by the Enhanced Terrain Layer module.

### Urban Terrain
Because elevation is useful for more than just determining a creature's movement type, all elevation based movement switching can be disabled using the "urban" terrain environment. Instead, the creature will use its highest movement speed between walking and flying.

## Known Bugs
These are known issues. I am just starting with JavaScript so although I will try to fix and streamline this module, it might take some time as I figure things out. This is a hobby project, but please feel free to contribute, it will only help me learn!
- When you have a swimming speed but it's smaller than your walking/flying speed, entering water will not negate difficult terrain. The module does not know how far you have already moved during your combat turn and thus can't know if you still have swimming speed left to use.
- Overlapping terrain might cause issues.

## Future Plans
These are features currently in the work, vague ideas, and anything in between.
- Keep track of spent movement during a combat turn.
- Handle multiple overlapping terrains better.
