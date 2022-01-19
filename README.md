![Latest Release Download Count](https://img.shields.io/github/downloads/PepijnMC/ElevationDragRuler/latest/module.zip?color=2b82fc&label=DOWNLOADS&style=for-the-badge) ![Foundry Core Compatible Version](https://img.shields.io/badge/dynamic/json.svg?url=https%3A%2F%2Fgithub.com%2FPepijnMC%2FElevationDragRuler%2Freleases%2Flatest%2Fdownload%2Fmodule.json&label=Foundry%20Version&query=$.compatibleCoreVersion&colorB=orange&style=for-the-badge) <br><a href='https://ko-fi.com/pepijn' target='_blank'><img height='35' style='border:0px;height:45px;' src='https://az743702.vo.msecnd.net/cdn/kofi3.png?v=0' border='0' alt='Buy Me a Coffee at ko-fi.com' />

# ElevationDragRuler
A Foundry VTT module which adds a dnd5e speedprovider for Drag Ruler to pick between different movement options based on elevation and terrain from the Enhanced Terrain Layer module.
## Requirements
- Dnd5e System
- [Drag Ruler](https://github.com/manuelVo/foundryvtt-drag-ruler) module by Manuel Vögele
- [Terrain Ruler](https://github.com/manuelVo/foundryvtt-terrain-ruler) module by Manuel Vögele
- [Enhanced Terrain Layer](https://github.com/ironmonk88/enhanced-terrain-layer) module by IronMonk
## Movement Options
### Walking
A creature's default movement option is walking.
### Flying
Creatures will be set to fly, and thus use their flying speed, when the token's elevation is above 0. When flying, creatures will ignore all difficult terrain set by the Enhanced Terrain Layer module.

Additionally, this speedprovider includes two settings to streamline setting up flying creatures. These settings can be found within Drag Ruler's settings.
- **Force Hovering**: When enabled, changes the default movement option to flying instead of walking for creatures that can hover. The creature will still burrow or swim when its elevation is below 0. Enabled by default.
- **Force Flying**: When enabled, changes the default movement option to flying instead of walking for creatures with a greater flying than walking speed. The creature will still burrow or swim when its elevation is below 0. Disabled by default.

### Swimming
Creatures will be set to swim, and thus use their swimming speed, when the token's elevation is below 0 and is within "water" terrain from the Enhanced Terrain Layer module. If the creature has no swimming speed, it will use the greater of their walking or flying speed but water will count as difficult terrain.

### Burrowing
Creatures will be set to burrow, and thus use their burrowing speed, when the token's elevation is below 0 and is not within "water" terrain. While burrowing, creatures will ignore all difficult terrain set by the Enhanced Terrain Layer module.

### Urban Terrain
Because elevation is useful for more than just determining a creature's movement type, all elevation based movement switching can be disabled using the "urban" terrain environment. Instead, the creature will use its highest movement speed between walking and flying.
