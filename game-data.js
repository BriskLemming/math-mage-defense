(() => {
  "use strict";

  const BATTLEFIELD_THEME_DEFAULT = "default";
  const BATTLEFIELD_THEME_MYSTIC_FOREST = "mystic-forest";
  const BATTLEFIELD_THEME_CRYSTAL_HIGHLIGHT = "crystal-highlight";
  const BATTLEFIELD_THEME_VOLCANO = "volcano";
  const BATTLEFIELD_THEME_DARK_CASTLE = "dark-castle";

  const LEGACY_PROFILE_ID_ALIASES = {
    "kid-1": { id: "ruby-1", name: "Ruby" },
    "kid-2": { id: "ryan-2", name: "Ryan" },
  };

  function createGameData(config) {
    const enemyDefinitions = {
      goblin: {
        name: "Plent",
        hp: 1,
        speed: 72,
        color: "#7ed957",
        valueMin: 3,
        valueMax: 10,
        spriteFile: "Goblin.png",
        animations: {
          run: { path: "assets/sprites/Plent/Walk.png", frameCount: 9, fps: 14 },
          hurt: { path: "assets/sprites/Plent/Hurt.png", frameCount: 3, fps: 14 },
          dead: { path: "assets/sprites/Plent/Dead.png", frameCount: 2, fps: 10 },
        },
      },
      skeleton: {
        name: "Skeleton",
        hp: 2,
        speed: 54,
        color: "#d9dce3",
        valueMin: 5,
        valueMax: 14,
        spriteFile: "Skeleton.png",
        animations: {
          run: { path: "assets/sprites/Skeleton/Run.png", frameCount: 7, fps: 14 },
          hurt: { path: "assets/sprites/Skeleton/Hurt.png", frameCount: 3, fps: 14 },
          dead: { path: "assets/sprites/Skeleton/Dead.png", frameCount: 3, fps: 10 },
        },
      },
      slime: {
        name: "Slime",
        hp: 2,
        speed: 44,
        color: "#4fc7a3",
        valueMin: 7,
        valueMax: 16,
        rerollTargetOnHit: true,
        spriteFile: "Slime.png",
        animations: {
          run: { path: "assets/sprites/Green_Slime/Run.png", frameCount: 7, fps: 14 },
          hurt: { path: "assets/sprites/Green_Slime/Hurt.png", frameCount: 6, fps: 16 },
          dead: { path: "assets/sprites/Green_Slime/Dead.png", frameCount: 3, fps: 10 },
        },
      },
      orc: {
        name: "Skeleton Warrior",
        hp: 3,
        speed: 34,
        color: "#c88a42",
        valueMin: 11,
        valueMax: 18,
        spriteFile: "Skeleton.png",
        equationShield: true,
        animations: {
          run: { path: "assets/sprites/Skeleton_Warrior/Run.png", frameCount: 8, fps: 14 },
          hurt: { path: "assets/sprites/Skeleton_Warrior/Hurt.png", frameCount: 2, fps: 12 },
          dead: { path: "assets/sprites/Skeleton_Warrior/Dead.png", frameCount: 4, fps: 10 },
        },
      },
      zombie: {
        name: "Zombie Woman",
        hp: 2,
        speed: 32,
        color: "#9bbf6a",
        valueMin: 13,
        valueMax: 18,
        spriteFile: "Goblin.png",
        specialState: {
          animation: "scream",
          minIntervalSeconds: config.zombieScreamMinInterval,
          maxIntervalSeconds: config.zombieScreamMaxInterval,
        },
        animations: {
          run: { path: "assets/sprites/Zombie Woman/Walk.png", frameCount: 7, fps: 10 },
          hurt: { path: "assets/sprites/Zombie Woman/Hurt.png", frameCount: 3, fps: 12 },
          dead: { path: "assets/sprites/Zombie Woman/Dead.png", frameCount: 5, fps: 10 },
          scream: { path: "assets/sprites/Zombie Woman/Scream.png", frameCount: 5, fps: 10 },
        },
      },
      carnivorousPlant: {
        name: "Carnivorous Plant",
        hp: 7,
        speed: 22,
        color: "#7fb354",
        valueMin: 12,
        valueMax: 18,
        spriteFile: "CarnivorousPlant/Walk.png",
        sizeScale: 3.45,
        rerollTargetOnHit: true,
        equationShield: true,
        variants: {
          red: {
            color: "#c94b4b",
            drawFilter: "saturate(1.1) contrast(1.05)",
          },
          black: {
            color: "#383333",
            drawFilter: "brightness(0.65) contrast(1.2)",
          },
        },
        animations: {
          run: { path: "assets/sprites/CarnivorousPlant/Walk.png", frameCount: 6, fps: 11 },
          hurt: { path: "assets/sprites/CarnivorousPlant/Hurt.png", frameCount: 4, fps: 12 },
          dead: { path: "assets/sprites/CarnivorousPlant/Death.png", frameCount: 6, fps: 10 },
        },
      },
      minotaur: {
        name: "Minotaur",
        hp: 10,
        speed: 24,
        color: "#9a5a3f",
        valueMin: 13,
        valueMax: 19,
        spriteFile: "Minotaur_1/Walk.png",
        sizeScale: 2.6,
        rerollTargetOnHit: true,
        equationShield: true,
        animations: {
          run: { path: "assets/sprites/Minotaur_1/Walk.png", frameCount: 12, fps: 12 },
          hurt: { path: "assets/sprites/Minotaur_1/Hurt.png", frameCount: 3, fps: 12 },
          dead: { path: "assets/sprites/Minotaur_1/Dead.png", frameCount: 5, fps: 10 },
        },
      },
      medusa: {
        name: "Medusa",
        hp: 12,
        speed: 20,
        color: "#6f9a6e",
        valueMin: 14,
        valueMax: 20,
        spriteFile: "Gorgon_2/Walk.png",
        sizeScale: 2.5,
        rerollTargetOnHit: true,
        equationShield: true,
        specialState: {
          animation: "special",
          minIntervalSeconds: config.medusaSpecialMinInterval,
          maxIntervalSeconds: config.medusaSpecialMaxInterval,
        },
        animations: {
          run: { path: "assets/sprites/Gorgon_2/Walk.png", frameCount: 13, fps: 12 },
          hurt: { path: "assets/sprites/Gorgon_2/Hurt.png", frameCount: 3, fps: 12 },
          dead: { path: "assets/sprites/Gorgon_2/Dead.png", frameCount: 3, fps: 10 },
          special: { path: "assets/sprites/Gorgon_2/Special.png", frameCount: 5, fps: 10 },
        },
      },
    };

    const levels = [
      {
        key: "misty-atoll",
        name: "Misty Atoll",
        mapPos: { x: 0.20, y: 0.72 },
        battlefieldTheme: BATTLEFIELD_THEME_DEFAULT,
        baseSpeedMultiplier: 0.65,
        waves: [
          [{ type: "goblin", count: 3 }],
          [{ type: "goblin", count: 4 }],
        ],
      },
      {
        key: "sunspire-bay",
        name: "Sunspire Bay",
        mapPos: { x: 0.33, y: 0.60 },
        battlefieldTheme: BATTLEFIELD_THEME_DEFAULT,
        baseSpeedMultiplier: 0.75,
        waves: [
          [{ type: "goblin", count: 4 }],
          [
            { type: "goblin", count: 4 },
            { type: "slime", count: 2 },
          ],
          [{ type: "slime", count: 3 }],
        ],
      },
      {
        key: "patate-ratouille",
        name: "Patate Ratouille",
        mapPos: { x: 0.35, y: 0.51 },
        battlefieldTheme: BATTLEFIELD_THEME_MYSTIC_FOREST,
        baseSpeedMultiplier: 0.75,
        waves: [
          [{ type: "goblin", count: 4 }],
          [
            { type: "goblin", count: 4 },
            { type: "slime", count: 2 },
          ],
          [{ type: "slime", count: 3 }],
          [{ type: "skeleton", count: 3 }],
          [{ type: "orc", count: 3 }],
        ],
      },
      {
        key: "emerald-marsh",
        name: "Emerald Marsh",
        mapPos: { x: 0.44, y: 0.49 },
        battlefieldTheme: BATTLEFIELD_THEME_MYSTIC_FOREST,
        baseSpeedMultiplier: 0.85,
        waves: [
          [
            { type: "goblin", count: 5 },
            { type: "slime", count: 2 },
          ],
          [{ type: "zombie", count: 3 }],
          [
            { type: "slime", count: 3 },
            { type: "zombie", count: 2 },
          ],
          [{ type: "carnivorousPlant", count: 1 }],
        ],
      },
      {
        key: "crystal-isle",
        name: "Crystal Isle",
        mapPos: { x: 0.50, y: 0.25 },
        battlefieldTheme: BATTLEFIELD_THEME_CRYSTAL_HIGHLIGHT,
        baseSpeedMultiplier: 0.90,
        waves: [
          [{ type: "skeleton", count: 4 }],
          [
            { type: "skeleton", count: 4 },
            { type: "zombie", count: 2 },
          ],
          [{ type: "orc", count: 2 }],
          [
            { type: "orc", count: 2 },
            { type: "skeleton", count: 4 },
          ],
        ],
      },
      {
        key: "bonecliff-isle",
        name: "Bonecliff Isle",
        mapPos: { x: 0.57, y: 0.25 },
        battlefieldTheme: BATTLEFIELD_THEME_CRYSTAL_HIGHLIGHT,
        baseSpeedMultiplier: 0.95,
        waves: [
          [{ type: "skeleton", count: 5 }],
          [
            { type: "skeleton", count: 4 },
            { type: "zombie", count: 2 },
          ],
          [{ type: "orc", count: 3 }],
          [{ type: "minotaur", count: 1 }],
        ],
      },
      {
        key: "stormbreak-reach",
        name: "Stormbreak Reach",
        mapPos: { x: 0.70, y: 0.28 },
        battlefieldTheme: BATTLEFIELD_THEME_VOLCANO,
        baseSpeedMultiplier: 1.05,
        waves: [
          [
            { type: "skeleton", count: 5 },
            { type: "slime", count: 3 },
          ],
          [
            { type: "orc", count: 2 },
            { type: "zombie", count: 3 },
          ],
          [
            { type: "goblin", count: 4 },
            { type: "skeleton", count: 3 },
            { type: "orc", count: 1 },
          ],
        ],
      },
      {
        key: "ember-crown",
        name: "Ember Crown",
        mapPos: { x: 0.7, y: 0.19 },
        battlefieldTheme: BATTLEFIELD_THEME_VOLCANO,
        baseSpeedMultiplier: 1.20,
        waves: [
          [
            { type: "skeleton", count: 5 },
            { type: "orc", count: 2 },
          ],
          [
            { type: "zombie", count: 4 },
            { type: "orc", count: 2 },
          ],
          [
            { type: "goblin", count: 4 },
            { type: "slime", count: 4 },
            { type: "skeleton", count: 4 },
            { type: "orc", count: 2 },
            { type: "zombie", count: 3 },
            { type: "carnivorousPlant", count: 1, variant: "red" },
          ],
        ],
      },
      {
        key: "darkspire-citadel",
        name: "DarkSpire Citadel",
        mapPos: { x: 0.71, y: 0.48 },
        battlefieldTheme: BATTLEFIELD_THEME_DARK_CASTLE,
        baseSpeedMultiplier: 1.35,
        waves: [
          [
            { type: "skeleton", count: 5 },
            { type: "orc", count: 3 },
          ],
          [
            { type: "zombie", count: 4 },
            { type: "slime", count: 4 },
            { type: "orc", count: 2 },
          ],
          [
            { type: "minotaur", count: 1 },
            { type: "carnivorousPlant", count: 1, variant: "black" },
            { type: "orc", count: 1 },
          ],
          [{ type: "medusa", count: 1 }],
        ],
      },
    ];

    return {
      LEGACY_PROFILE_ID_ALIASES,
      BATTLEFIELD_THEME_DEFAULT,
      BATTLEFIELD_THEME_MYSTIC_FOREST,
      BATTLEFIELD_THEME_CRYSTAL_HIGHLIGHT,
      BATTLEFIELD_THEME_VOLCANO,
      BATTLEFIELD_THEME_DARK_CASTLE,
      ENEMY_DEFS: enemyDefinitions,
      LEVELS: levels,
    };
  }

  window.MathMageGameData = { createGameData };
})();