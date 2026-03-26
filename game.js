(() => {
  "use strict";

  const LANE_COUNT = 3;
  const CASTLE_PANEL_WIDTH = 360;
  const CASTLE_AREA_WIDTH = 170;
  const BATTLEFIELD_START_X = CASTLE_PANEL_WIDTH;
  const LANE_START_X = CASTLE_PANEL_WIDTH + CASTLE_AREA_WIDTH;
  const CASTLE_X = CASTLE_PANEL_WIDTH + 82;
  const ENEMY_RADIUS = 22;
  const TOKEN_RADIUS = 19;
  const CASTLE_MAX_HP = 10;
  const BASE_GAME_HEIGHT = 620;
  const FIREBALL_SHEET_COLUMNS = 4;
  const FIREBALL_SHEET_ROWS = 4;
  const FIREBALL_FRAME_COUNT = FIREBALL_SHEET_COLUMNS * FIREBALL_SHEET_ROWS;
  const FIREBALL_DURATION_SECONDS = 0.45;
  const EXPLOSION_SHEET_COLUMNS = 5;
  const EXPLOSION_SHEET_ROWS = 4;
  const EXPLOSION_FRAME_COUNT = EXPLOSION_SHEET_COLUMNS * EXPLOSION_SHEET_ROWS;
  const EXPLOSION_DURATION_SECONDS = 0.56;
  const LIGHTNING_FRAME_COUNT = 10;
  const LIGHTNING_DURATION_SECONDS = 0.35;
  const PROJECTILE_TRAVEL_SECONDS = 0.32;
  const SHIELD_FLASH_DURATION_SECONDS = 0.45;
  const PETRIFIED_TOKEN_DURATION_SECONDS = 2.6;
  const CHAIN_LIGHTNING_EFFECT_DURATION_SECONDS = 0.45;
  const LEVEL_UP_EFFECT_DURATION_SECONDS = 1.6;
  const LEVEL_COMPLETE_RETURN_SECONDS = 1.6;
  const XP_PER_LEVEL = 14;
  const CHAIN_LIGHTNING_UNLOCK_LEVEL = 4;
  const MAGE_TOWER_UNLOCK_LEVEL = 10;
  const CHAIN_LIGHTNING_TARGET_COUNT = 3;
  const MAX_SECOND_OPERAND_DIGITS = 2;
  const MAX_THIRD_OPERAND_DIGITS = 1;
  const MAX_TOWER_ANSWER_DIGITS = 3;
  const CHAIN_LIGHTNING_ADD_SUB_FIRST_OPERAND_THRESHOLD = 10;
  const CHAIN_LIGHTNING_MULTIPLY_RESULT_THRESHOLD = 30;
  const CHAIN_LIGHTNING_DIVIDE_SECOND_OPERAND_THRESHOLD = 4;
  const CHAIN_LIGHTNING_TARGET_BIAS_CHANCE = 0.65;
  const SPELL_UNLOCK_OVERLAY_DURATION_SECONDS = 6.4;
  const SPELL_UNLOCK_EFFECT_FRAME_COUNT = 5;
  const SPELL_UNLOCK_EFFECT_FPS = 12;
  const SPELL_CHAIN_LIGHTNING = "chain-lightning";
  const SPELL_MAGE_TOWER = "mage-tower";
  const TOWER_ATTACK_DAMAGE = 5;
  const TOWER_GLOW_DURATION_SECONDS = 0.9;
  const TOWER_PROJECTILE_SPEED = 920;
  const TOWER_PROJECTILE_GROUND_SPACING = 84;
  const TOWER_GROUND_DURATION_SECONDS = 4.4;
  const TOWER_FIRE_FRAME_COUNT = 41;
  const TOWER_GROUND_FRAME_COUNT = 84;
  const TOWER_FIRE_FPS = 18;
  const TOWER_GROUND_FPS = 18;
  const TOWER_FIRE_LAUNCH_FRAME_COUNT = 8;
  const TOWER_FIRE_FINISH_FRAME_COUNT = 8;
  const TOWER_FIRE_LOOP_START_FRAME = TOWER_FIRE_LAUNCH_FRAME_COUNT;
  const TOWER_FIRE_LOOP_END_FRAME = TOWER_FIRE_FRAME_COUNT - TOWER_FIRE_FINISH_FRAME_COUNT - 1;
  const ZOMBIE_SCREAM_MIN_INTERVAL = 2.8;
  const ZOMBIE_SCREAM_MAX_INTERVAL = 5.2;
  const MEDUSA_SPECIAL_MIN_INTERVAL = 3.2;
  const MEDUSA_SPECIAL_MAX_INTERVAL = 5.8;
  const MULTIPLY_TIME_SCALE = 0.5;
  const MAX_FIRST_OPERAND_DIGITS = 2;
  const SAVE_STORAGE_KEY = "math-mage-defense-save-v1";
  const SAVE_DATA_VERSION = 1;
  const LEGACY_PROFILE_ID_ALIASES = {
    "kid-1": { id: "ruby-1", name: "Ruby" },
    "kid-2": { id: "ryan-2", name: "Ryan" },
  };
  const BATTLEFIELD_THEME_DEFAULT = "default";
  const BATTLEFIELD_THEME_MYSTIC_FOREST = "mystic-forest";
  const BATTLEFIELD_THEME_CRYSTAL_HIGHLIGHT = "crystal-highlight";
  const BATTLEFIELD_THEME_VOLCANO = "volcano";
  const BATTLEFIELD_THEME_DARK_CASTLE = "dark-castle";

  const ENEMY_DEFS = {
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
        minIntervalSeconds: ZOMBIE_SCREAM_MIN_INTERVAL,
        maxIntervalSeconds: ZOMBIE_SCREAM_MAX_INTERVAL,
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
        minIntervalSeconds: MEDUSA_SPECIAL_MIN_INTERVAL,
        maxIntervalSeconds: MEDUSA_SPECIAL_MAX_INTERVAL,
      },
      animations: {
        run: { path: "assets/sprites/Gorgon_2/Walk.png", frameCount: 13, fps: 12 },
        hurt: { path: "assets/sprites/Gorgon_2/Hurt.png", frameCount: 3, fps: 12 },
        dead: { path: "assets/sprites/Gorgon_2/Dead.png", frameCount: 3, fps: 10 },
        special: { path: "assets/sprites/Gorgon_2/Special.png", frameCount: 5, fps: 10 },
      },
    },
  };

  const LEVELS = [
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
        [
          { type: "carnivorousPlant", count: 1 },
        ],
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
        [{ type: "orc", count: 2 },
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

  const canvas = document.getElementById("gameCanvas");
  const context2d = canvas.getContext("2d");

  const castleHpElement = document.getElementById("castleHp");
  const waveLabelElement = document.getElementById("waveLabel");
  const statusLabelElement = document.getElementById("statusLabel");
  const appTitleElement = document.getElementById("appTitle");
  const playerLevelElement = document.getElementById("playerLevel");
  const xpBarFillElement = document.getElementById("xpBarFill");
  const xpTextElement = document.getElementById("xpText");
  const spellStatusElement = document.getElementById("spellStatus");
  const equationTextElement = document.getElementById("equationText");
  const castResultElement = document.getElementById("castResult");
  const operationModeElement = document.getElementById("operationMode");
  const speedSliderElement = document.getElementById("speedSlider");
  const speedValueElement = document.getElementById("speedValue");
  const unlockLevelsButtonElement = document.getElementById("unlockLevelsButton");
  const debugGrantXpButtonElement = document.getElementById("debugGrantXpButton");
  const debugResetProgressButtonElement = document.getElementById("debugResetProgressButton");
  const debugMenuElement = document.getElementById("debugMenu");
  const closeDebugMenuButtonElement = document.getElementById("closeDebugMenuButton");
  const backToMapButtonElement = document.getElementById("backToMapButton");
  const pauseButtonElement = document.getElementById("pauseButton");
  const profileSelectElement = document.getElementById("profileSelect");
  const newProfileButtonElement = document.getElementById("newProfileButton");
  const castSpellButtonElement = document.getElementById("castSpellButton");
  const spellUnlockOverlayElement = document.getElementById("spellUnlockOverlay");
  const spellUnlockEffectCanvasElement = document.getElementById("spellUnlockEffectCanvas");
  const spellUnlockTitleElement = document.getElementById("spellUnlockTitle");
  const spellUnlockNameElement = document.getElementById("spellUnlockName");
  const spellUnlockDescriptionElement = document.getElementById("spellUnlockDescription");

  const resetButtonElement = document.getElementById("resetButton");
  const clearEquationButtonElement = document.getElementById("clearEquationButton");

  /** @type {{y:number}[]} */
  let lanes = [];
  /** @type {{id:string, symbol:string, kind:'number'|'operator', x:number, y:number, width?:number, height?:number}[]} */
  let tokens = [];
  /** @type {{id:number, lane:number, type:string, x:number, hp:number, target:number, speed:number, color:string, tintColor:string|null, name:string, spriteFile:string, state:'run'|'hurt'|'dead'|'scream'|'special', stateTimer:number, animationTimer:number, animationFrame:number, removeOnDeadEnd:boolean, specialCooldown:number, sizeScale:number, rerollTargetOnHit:boolean, drawFilter:string, equationShield:boolean, lastUsedEquationText:string|null, lastUsedEquationKey:string|null, reservedEquationKey:string|null, shieldFlashTimer:number}[]} */
  let enemies = [];
  /** @type {{x:number, y:number, ttl:number, duration:number, color:string}[]} */
  let hitEffects = [];
  /** @type {{x:number, y:number, ttl:number, duration:number, text:string}[]} */
  let levelUpEffects = [];
  /** @type {{targetEnemyId:number, fromX:number, fromY:number, toX:number, toY:number, ttl:number, duration:number, equationText:string, equationKey:string}[]} */
  let activeProjectiles = [];
  /** @type {{x:number, y:number, ttl:number, duration:number}[]} */
  let lightningEffects = [];
  /** @type {{points:{x:number,y:number}[], ttl:number, duration:number}[]} */
  let chainLightningEffects = [];
  /** @type {{lane:number, x:number, endX:number, drawWidth:number, drawHeight:number, phase:'launch'|'loop'|'finish', frame:number, frameTimer:number, lastGroundX:number}[]} */
  let towerProjectiles = [];
  /** @type {{lane:number, x:number, ttl:number, duration:number, frame:number, frameTimer:number, drawWidth:number, drawHeight:number}[]} */
  let towerGroundFlames = [];

  const selection = {
    firstNumber: null,
    operator: null,
    secondNumber: null,
    secondOperator: null,
    thirdNumber: null,
  };

  const wizardAnimation = {
    state: "idle",
    frame: 0,
    frameTimer: 0,
  };

  const spriteAssets = {
    worldMap: new Image(),
    laneBackground: new Image(),
    tower: new Image(),
    fireballSheet: new Image(),
    explosionSheet: new Image(),
    lightningSheet: new Image(),
    gemToken: new Image(),
    castle: new Image(),
    wizard: new Image(),
    shieldFlash: new Image(),
    spellUnlockLightningSheet: new Image(),
    forestFlat: new Image(),
    bambooFlat: new Image(),
    volcanoFlat: new Image(),
    darkCastleFlat: new Image(),
    wizardAnimations: {},
    enemyImages: {},
    enemyAnimations: {},
    towerFireFrames: [],
    towerGroundFrames: [],
    laneBackgroundLoaded: false,
    worldMapLoaded: false,
    towerLoaded: false,
    fireballLoaded: false,
    explosionLoaded: false,
    lightningLoaded: false,
    gemTokenLoaded: false,
    castleLoaded: false,
    wizardLoaded: false,
    shieldFlashLoaded: false,
    spellUnlockLightningLoaded: false,
    forestFlatLoaded: false,
    bambooFlatLoaded: false,
    volcanoFlatLoaded: false,
    darkCastleFlatLoaded: false,
  };

  const enemyTintCanvas = document.createElement("canvas");
  const enemyTintContext = enemyTintCanvas.getContext("2d");
  const spellUnlockEffectContext = spellUnlockEffectCanvasElement
    ? spellUnlockEffectCanvasElement.getContext("2d")
    : null;

  /** @type {'running'|'victory'|'defeat'} */
  let gameResult = "running";
  let castleHp = CASTLE_MAX_HP;
  let nextEnemyId = 1;
  let speedMultiplier = 1;
  let operationMode = "add-sub";
  let sceneMode = "map";
  let currentLevelIndex = 0;
  let highestUnlockedLevel = 0;
  /** @type {Set<number>} */
  let completedLevelIndices = new Set();
  let currentLevelWavePlan = LEVELS[0].waves;
  let levelBaseSpeedMultiplier = LEVELS[0].baseSpeedMultiplier;

  let currentWaveIndex = 0;
  let currentWaveQueue = [];
  let spawnTimerSeconds = 0;
  let waveDelayTimerSeconds = 0;
  let levelCompleteTimerSeconds = 0;
  let petrifiedTokenId = null;
  let petrifiedTokenTimer = 0;
  let playerXp = 0;
  let playerLevel = 1;
  let unlockedSpells = [];
  let debugSequenceBuffer = "";
  let lastDebugSequenceTimestampMs = 0;
  let titleDebugPressTimer = null;
  let spellUnlockWasPausedBefore = false;
  let towerGlowTimer = 0;
  let isPaused = false;
  let saveData = null;
  let currentProfileId = null;

  const spellUnlockAnimation = {
    active: false,
    timer: 0,
    duration: SPELL_UNLOCK_OVERLAY_DURATION_SECONDS,
    frameTimer: 0,
    frame: 0,
  };

  const towerPuzzle = {
    expressionText: "",
    expectedResult: null,
    answerText: "",
    isFocused: false,
  };

  const DEBUG_SEQUENCE = "arcane";
  const DEBUG_SEQUENCE_TIMEOUT_MS = 2200;
  const TITLE_DEBUG_HOLD_MS = 1200;

  function setPauseState(nextPaused) {
    isPaused = Boolean(nextPaused);
    pauseButtonElement.textContent = isPaused ? "Resume" : "Pause";

    if (sceneMode !== "game") {
      return;
    }
    if (gameResult === "running") {
      statusLabelElement.textContent = isPaused ? "Paused" : "Running";
    }
  }

  function isValidOperationMode(modeValue) {
    return modeValue === "add-sub" || modeValue === "multiply" || modeValue === "divide";
  }

  function createDefaultProfile(profileId, profileName) {
    return {
      id: profileId,
      name: profileName,
      completedLevelKeys: [],
      selectedOperationMode: "add-sub",
      playerXp: 0,
      playerLevel: 1,
      unlockedSpells: [],
    };
  }

  function createDefaultSaveData() {
    return {
      version: SAVE_DATA_VERSION,
      selectedProfileId: "ruby-1",
      profiles: [
        createDefaultProfile("ruby-1", "Ruby"),
        createDefaultProfile("ryan-2", "Ryan"),
      ],
    };
  }

  function normalizeProfile(rawProfile, fallbackIndex) {
    const rawProfileId = typeof rawProfile?.id === "string" && rawProfile.id.trim().length > 0
      ? rawProfile.id.trim()
      : `profile-${fallbackIndex + 1}`;
    const aliasedProfile = LEGACY_PROFILE_ID_ALIASES[rawProfileId] || null;
    const profileId = aliasedProfile ? aliasedProfile.id : rawProfileId;
    const profileName = typeof rawProfile?.name === "string" && rawProfile.name.trim().length > 0
      ? rawProfile.name.trim()
      : `Profile ${fallbackIndex + 1}`;
    const completedLevelKeys = Array.isArray(rawProfile?.completedLevelKeys)
      ? rawProfile.completedLevelKeys.filter((levelKey) => typeof levelKey === "string")
      : [];
    const selectedOperationMode = isValidOperationMode(rawProfile?.selectedOperationMode)
      ? rawProfile.selectedOperationMode
      : "add-sub";
    const normalizedPlayerXp = Number.isFinite(rawProfile?.playerXp)
      ? Math.max(0, Math.floor(rawProfile.playerXp))
      : 0;
    const normalizedPlayerLevel = Number.isFinite(rawProfile?.playerLevel)
      ? Math.max(1, Math.floor(rawProfile.playerLevel))
      : 1;
    const unlockedSpells = Array.isArray(rawProfile?.unlockedSpells)
      ? [...new Set(rawProfile.unlockedSpells.filter((spellId) => typeof spellId === "string"))]
      : [];

    return {
      id: profileId,
      name: aliasedProfile ? aliasedProfile.name : profileName,
      completedLevelKeys,
      selectedOperationMode,
      playerXp: normalizedPlayerXp,
      playerLevel: normalizedPlayerLevel,
      unlockedSpells,
    };
  }

  function normalizeSaveData(rawSaveData) {
    const defaultSaveData = createDefaultSaveData();
    const normalizedProfiles = Array.isArray(rawSaveData?.profiles)
      ? rawSaveData.profiles.map((profile, profileIndex) => normalizeProfile(profile, profileIndex))
      : defaultSaveData.profiles;
    const profiles = normalizedProfiles.length > 0 ? normalizedProfiles : defaultSaveData.profiles;
    const rawSelectedProfileId = typeof rawSaveData?.selectedProfileId === "string"
      ? rawSaveData.selectedProfileId
      : null;
    const selectedProfileIdCandidate = rawSelectedProfileId && LEGACY_PROFILE_ID_ALIASES[rawSelectedProfileId]
      ? LEGACY_PROFILE_ID_ALIASES[rawSelectedProfileId].id
      : rawSelectedProfileId;
    const selectedProfileId = profiles.some((profile) => profile.id === selectedProfileIdCandidate)
      ? selectedProfileIdCandidate
      : profiles[0].id;

    return {
      version: SAVE_DATA_VERSION,
      selectedProfileId,
      profiles,
    };
  }

  function persistSaveData() {
    if (!saveData) {
      return;
    }

    try {
      window.localStorage.setItem(SAVE_STORAGE_KEY, JSON.stringify(saveData));
    } catch (error) {
      console.warn("Failed to persist save data.", error);
    }
  }

  function loadSaveData() {
    try {
      const rawSaveText = window.localStorage.getItem(SAVE_STORAGE_KEY);
      if (!rawSaveText) {
        return createDefaultSaveData();
      }

      return normalizeSaveData(JSON.parse(rawSaveText));
    } catch (error) {
      console.warn("Failed to load save data, using defaults.", error);
      return createDefaultSaveData();
    }
  }

  function getCurrentProfile() {
    if (!saveData) {
      return null;
    }
    return saveData.profiles.find((profile) => profile.id === currentProfileId) || null;
  }

  function rebuildProgressFromProfile(profile) {
    const existingLevelKeys = new Set(LEVELS.map((level) => level.key));
    const completedLevelKeys = new Set(
      profile.completedLevelKeys.filter((levelKey) => existingLevelKeys.has(levelKey)),
    );

    completedLevelIndices = new Set();
    LEVELS.forEach((level, levelIndex) => {
      if (completedLevelKeys.has(level.key)) {
        completedLevelIndices.add(levelIndex);
      }
    });

    highestUnlockedLevel = 0;
    for (let levelIndex = 0; levelIndex < LEVELS.length - 1; levelIndex += 1) {
      if (!completedLevelKeys.has(LEVELS[levelIndex].key)) {
        break;
      }
      highestUnlockedLevel = levelIndex + 1;
    }
    currentLevelIndex = Math.min(currentLevelIndex, highestUnlockedLevel);
  }

  function syncCurrentProfileSave() {
    const currentProfile = getCurrentProfile();
    if (!currentProfile) {
      return;
    }

    currentProfile.completedLevelKeys = LEVELS
      .filter((level, levelIndex) => completedLevelIndices.has(levelIndex))
      .map((level) => level.key);
    currentProfile.selectedOperationMode = isValidOperationMode(operationMode)
      ? operationMode
      : "add-sub";
    currentProfile.playerXp = playerXp;
    currentProfile.playerLevel = playerLevel;
    currentProfile.unlockedSpells = [...unlockedSpells];
    saveData.selectedProfileId = currentProfile.id;
    persistSaveData();
  }

  function renderProfileOptions() {
    profileSelectElement.innerHTML = "";
    for (const profile of saveData.profiles) {
      const optionElement = document.createElement("option");
      optionElement.value = profile.id;
      optionElement.textContent = profile.name;
      profileSelectElement.appendChild(optionElement);
    }
    profileSelectElement.value = currentProfileId;
  }

  function applyProfile(profile, messageText = null) {
    currentProfileId = profile.id;
    saveData.selectedProfileId = profile.id;
    rebuildProgressFromProfile(profile);
    playerXp = Number.isFinite(profile.playerXp) ? profile.playerXp : 0;
    playerLevel = Number.isFinite(profile.playerLevel) ? profile.playerLevel : 1;
    unlockedSpells = Array.isArray(profile.unlockedSpells) ? [...profile.unlockedSpells] : [];

    operationMode = isValidOperationMode(profile.selectedOperationMode)
      ? profile.selectedOperationMode
      : "add-sub";
    operationModeElement.value = operationMode;
    createSelectionTokens();
    returnToWorldMap();
    hideSpellUnlockOverlay();
    updateProgressionHud();
    updateSpeedDisplay();
    renderProfileOptions();
    persistSaveData();

    if (messageText) {
      castResultElement.textContent = messageText;
      castResultElement.classList.remove("bad");
      castResultElement.classList.add("ok");
    }
  }

  function resetCurrentProfileProgress() {
    const currentProfile = getCurrentProfile();
    if (!currentProfile) {
      return;
    }

    playerXp = 0;
    playerLevel = 1;
    unlockedSpells = [];
    completedLevelIndices = new Set();
    highestUnlockedLevel = 0;
    currentLevelIndex = 0;
    hideSpellUnlockOverlay();
    clearPetrifiedToken();
    updateProgressionHud();
    returnToWorldMap();
    syncCurrentProfileSave();
  }

  function createProfile() {
    const enteredName = window.prompt("Enter a profile name:", `Player ${saveData.profiles.length + 1}`);
    if (enteredName === null) {
      return;
    }

    const profileName = enteredName.trim();
    if (!profileName) {
      castResultElement.textContent = "Profile name cannot be empty.";
      castResultElement.classList.remove("ok");
      castResultElement.classList.add("bad");
      return;
    }

    const profileId = `profile-${Date.now()}`;
    const newProfile = createDefaultProfile(profileId, profileName);
    saveData.profiles.push(newProfile);
    applyProfile(newProfile, `Profile ${profileName} created.`);
  }

  function initializeSaveSystem() {
    saveData = loadSaveData();
    const initialProfile = saveData.profiles.find((profile) => profile.id === saveData.selectedProfileId)
      || saveData.profiles[0];
    applyProfile(initialProfile);
  }

  function hasUnlockedSpell(spellId) {
    return unlockedSpells.includes(spellId);
  }

  function setDebugMenuOpen(nextOpen) {
    if (!debugMenuElement) {
      return;
    }
    debugMenuElement.classList.toggle("hidden", !nextOpen);
  }

  function isDebugMenuOpen() {
    return Boolean(debugMenuElement && !debugMenuElement.classList.contains("hidden"));
  }

  function toggleDebugMenu() {
    setDebugMenuOpen(!isDebugMenuOpen());
  }

  function startTitleDebugPress() {
    if (!appTitleElement || titleDebugPressTimer !== null) {
      return;
    }

    titleDebugPressTimer = window.setTimeout(() => {
      titleDebugPressTimer = null;
      toggleDebugMenu();
    }, TITLE_DEBUG_HOLD_MS);
  }

  function cancelTitleDebugPress() {
    if (titleDebugPressTimer === null) {
      return;
    }
    window.clearTimeout(titleDebugPressTimer);
    titleDebugPressTimer = null;
  }

  function updateDebugButtonText() {
    if (debugGrantXpButtonElement) {
      debugGrantXpButtonElement.textContent = `Gain ${XP_PER_LEVEL} XP`;
    }
  }

  function handleDebugSequenceKey(keyboardEvent) {
    if (keyboardEvent.ctrlKey || keyboardEvent.altKey || keyboardEvent.metaKey) {
      return false;
    }

    if (keyboardEvent.key === "Escape" && isDebugMenuOpen()) {
      setDebugMenuOpen(false);
      return true;
    }

    if (keyboardEvent.key.length !== 1 || !/^[a-z]$/i.test(keyboardEvent.key)) {
      return false;
    }

    const nowMs = performance.now();
    if (nowMs - lastDebugSequenceTimestampMs > DEBUG_SEQUENCE_TIMEOUT_MS) {
      debugSequenceBuffer = "";
    }
    lastDebugSequenceTimestampMs = nowMs;

    debugSequenceBuffer = (debugSequenceBuffer + keyboardEvent.key.toLowerCase())
      .slice(-DEBUG_SEQUENCE.length);

    if (debugSequenceBuffer === DEBUG_SEQUENCE) {
      debugSequenceBuffer = "";
      toggleDebugMenu();
      return true;
    }

    return false;
  }

  function isChainLightningUnlocked() {
    return hasUnlockedSpell(SPELL_CHAIN_LIGHTNING);
  }

  function isMageTowerUnlocked() {
    return hasUnlockedSpell(SPELL_MAGE_TOWER);
  }

  function getSpellStatusText() {
    const spellStatuses = [
      isChainLightningUnlocked()
        ? "Chain Lightning ready"
        : `Chain Lightning L${CHAIN_LIGHTNING_UNLOCK_LEVEL}`,
      isMageTowerUnlocked()
        ? "Mage Tower ready"
        : `Mage Tower L${MAGE_TOWER_UNLOCK_LEVEL}`,
    ];
    return spellStatuses.join(" • ");
  }

  function updateProgressionHud() {
    if (playerLevelElement) {
      playerLevelElement.textContent = String(playerLevel);
    }
    if (xpBarFillElement) {
      xpBarFillElement.style.width = `${Math.max(0, Math.min(100, (playerXp / XP_PER_LEVEL) * 100))}%`;
    }
    if (xpTextElement) {
      xpTextElement.textContent = `${playerXp} / ${XP_PER_LEVEL} XP`;
    }
    if (spellStatusElement) {
      spellStatusElement.textContent = getSpellStatusText();
    }
  }

  function getChainLightningDescription() {
    return "Add/Sub: use a first number above 10, then press Enter or Cast Spell. Multiply: any result above 30 triggers it. Divide: use a divisor of 4 or more. Chain Lightning jumps across up to 3 enemies.";
  }

  function getMageTowerDescription() {
    return "Solve a 3-number equation to awaken the tower. If the result matches an enemy target, the tower sends a burning wave across that lane for 5 damage to every enemy there.";
  }

  function hideSpellUnlockOverlay() {
    spellUnlockAnimation.active = false;
    spellUnlockAnimation.timer = 0;
    spellUnlockAnimation.frameTimer = 0;
    spellUnlockAnimation.frame = 0;
    if (spellUnlockOverlayElement) {
      spellUnlockOverlayElement.classList.add("hidden");
    }
    if (spellUnlockEffectContext && spellUnlockEffectCanvasElement) {
      spellUnlockEffectContext.clearRect(
        0,
        0,
        spellUnlockEffectCanvasElement.width,
        spellUnlockEffectCanvasElement.height,
      );
    }
    if (sceneMode === "game" && gameResult === "running" && !spellUnlockWasPausedBefore) {
      setPauseState(false);
    }
    spellUnlockWasPausedBefore = false;
  }

  function showSpellUnlockOverlay(spellId) {
    if (!spellUnlockOverlayElement) {
      return;
    }

    spellUnlockTitleElement.textContent = "New Spell Unlocked";
    if (spellId === SPELL_CHAIN_LIGHTNING) {
      spellUnlockNameElement.textContent = "Chain Lightning";
      spellUnlockDescriptionElement.textContent = getChainLightningDescription();
    } else if (spellId === SPELL_MAGE_TOWER) {
      spellUnlockNameElement.textContent = "Mage Tower";
      spellUnlockDescriptionElement.textContent = getMageTowerDescription();
    } else {
      spellUnlockNameElement.textContent = "New Spell";
      spellUnlockDescriptionElement.textContent = "A new spell has been added to your grimoire.";
    }

    spellUnlockAnimation.active = true;
    spellUnlockAnimation.timer = SPELL_UNLOCK_OVERLAY_DURATION_SECONDS;
    spellUnlockAnimation.duration = SPELL_UNLOCK_OVERLAY_DURATION_SECONDS;
    spellUnlockAnimation.frameTimer = 0;
    spellUnlockAnimation.frame = 0;
    spellUnlockWasPausedBefore = isPaused;
    if (sceneMode === "game" && gameResult === "running") {
      setPauseState(true);
    }
    spellUnlockOverlayElement.classList.remove("hidden");
  }

  function unlockSpell(spellId) {
    if (hasUnlockedSpell(spellId)) {
      return false;
    }
    unlockedSpells.push(spellId);
    updateProgressionHud();
    syncCurrentProfileSave();
    showSpellUnlockOverlay(spellId);
    return true;
  }

  function awardXp(amount) {
    if (!Number.isFinite(amount) || amount <= 0) {
      return;
    }

    playerXp += Math.floor(amount);
    let leveledUp = false;
    while (playerXp >= XP_PER_LEVEL) {
      playerXp -= XP_PER_LEVEL;
      playerLevel += 1;
      leveledUp = true;
      const wizardOrigin = getWizardCastOrigin();
      levelUpEffects.push({
        x: wizardOrigin.x,
        y: wizardOrigin.y - 58,
        ttl: LEVEL_UP_EFFECT_DURATION_SECONDS,
        duration: LEVEL_UP_EFFECT_DURATION_SECONDS,
        text: `Level ${playerLevel}!`,
      });
    }

    if (leveledUp && playerLevel >= CHAIN_LIGHTNING_UNLOCK_LEVEL) {
      unlockSpell(SPELL_CHAIN_LIGHTNING);
    }
    if (leveledUp && playerLevel >= MAGE_TOWER_UNLOCK_LEVEL) {
      unlockSpell(SPELL_MAGE_TOWER);
    }

    updateProgressionHud();
    syncCurrentProfileSave();
  }

  function updateSpellUnlockAnimation(deltaSeconds) {
    if (!spellUnlockAnimation.active) {
      return;
    }

    spellUnlockAnimation.timer -= deltaSeconds;
    spellUnlockAnimation.frameTimer += deltaSeconds;
    const frameDuration = 1 / SPELL_UNLOCK_EFFECT_FPS;
    while (spellUnlockAnimation.frameTimer >= frameDuration) {
      spellUnlockAnimation.frameTimer -= frameDuration;
      spellUnlockAnimation.frame = (spellUnlockAnimation.frame + 1) % SPELL_UNLOCK_EFFECT_FRAME_COUNT;
    }

    if (spellUnlockAnimation.timer <= 0) {
      hideSpellUnlockOverlay();
    }
  }

  function renderSpellUnlockOverlay() {
    if (
      !spellUnlockAnimation.active
      || !spellUnlockEffectContext
      || !spellUnlockEffectCanvasElement
    ) {
      return;
    }

    spellUnlockEffectContext.clearRect(
      0,
      0,
      spellUnlockEffectCanvasElement.width,
      spellUnlockEffectCanvasElement.height,
    );

    if (
      spriteAssets.spellUnlockLightningLoaded
      && spriteAssets.spellUnlockLightningSheet.complete
      && spriteAssets.spellUnlockLightningSheet.naturalWidth > 0
    ) {
      const frameWidth = Math.floor(
        spriteAssets.spellUnlockLightningSheet.width / SPELL_UNLOCK_EFFECT_FRAME_COUNT,
      );
      const frameHeight = spriteAssets.spellUnlockLightningSheet.height;
      const frameIndex = Math.min(SPELL_UNLOCK_EFFECT_FRAME_COUNT - 1, spellUnlockAnimation.frame);
      const alpha = Math.max(0.35, spellUnlockAnimation.timer / spellUnlockAnimation.duration);
      spellUnlockEffectContext.save();
      spellUnlockEffectContext.globalAlpha = alpha;
      spellUnlockEffectContext.drawImage(
        spriteAssets.spellUnlockLightningSheet,
        frameIndex * frameWidth,
        0,
        frameWidth,
        frameHeight,
        0,
        0,
        spellUnlockEffectCanvasElement.width,
        spellUnlockEffectCanvasElement.height,
      );
      spellUnlockEffectContext.restore();
    }
  }

  function randomInteger(minimumValue, maximumValue) {
    return Math.floor(Math.random() * (maximumValue - minimumValue + 1)) + minimumValue;
  }

  function getEnemySpecialStateDef(enemyType) {
    return ENEMY_DEFS[enemyType]?.specialState || null;
  }

  function createEnemySpecialCooldown(enemyType) {
    const specialStateDefinition = getEnemySpecialStateDef(enemyType);
    if (!specialStateDefinition) {
      return 0;
    }

    return randomInteger(
      Math.floor(specialStateDefinition.minIntervalSeconds * 1000),
      Math.floor(specialStateDefinition.maxIntervalSeconds * 1000),
    ) / 1000;
  }

  function clearPetrifiedToken() {
    petrifiedTokenId = null;
    petrifiedTokenTimer = 0;
  }

  function getPetrifiedToken() {
    if (!petrifiedTokenId || petrifiedTokenTimer <= 0) {
      return null;
    }

    return tokens.find((token) => token.id === petrifiedTokenId) || null;
  }

  function isTokenPetrified(token) {
    return Boolean(token && petrifiedTokenTimer > 0 && token.id === petrifiedTokenId);
  }

  function petrifyRandomToken() {
    const eligibleTokens = tokens.filter((token) => token.kind === "number");
    if (eligibleTokens.length === 0) {
      return;
    }

    const targetToken = eligibleTokens[randomInteger(0, eligibleTokens.length - 1)];
    petrifiedTokenId = targetToken.id;
    petrifiedTokenTimer = PETRIFIED_TOKEN_DURATION_SECONDS;
    clearEquationSelection();
    castResultElement.classList.remove("ok");
    castResultElement.classList.add("bad");
    castResultElement.textContent = `Medusa petrified token ${formatOperator(targetToken.symbol)}!`;
  }

  function getMultiplyTargetValue() {
    const defaultResult = randomInteger(1, 10) * randomInteger(1, 10);
    if (!isChainLightningUnlocked() || Math.random() > CHAIN_LIGHTNING_TARGET_BIAS_CHANCE) {
      return defaultResult;
    }

    const chainReadyProducts = [];
    for (let leftFactor = 1; leftFactor <= 10; leftFactor += 1) {
      for (let rightFactor = 1; rightFactor <= 10; rightFactor += 1) {
        const product = leftFactor * rightFactor;
        if (product > CHAIN_LIGHTNING_MULTIPLY_RESULT_THRESHOLD) {
          chainReadyProducts.push(product);
        }
      }
    }

    if (chainReadyProducts.length === 0) {
      return defaultResult;
    }

    return chainReadyProducts[randomInteger(0, chainReadyProducts.length - 1)];
  }

  function hasChainReadyDivideEquation(targetValue) {
    for (
      let divisor = CHAIN_LIGHTNING_DIVIDE_SECOND_OPERAND_THRESHOLD;
      divisor <= 9;
      divisor += 1
    ) {
      const dividend = targetValue * divisor;
      if (dividend >= 10 && dividend <= 99) {
        return true;
      }
    }

    return false;
  }

  function getDivideTargetValue() {
    const defaultResult = randomInteger(1, 9);
    if (!isChainLightningUnlocked() || Math.random() > CHAIN_LIGHTNING_TARGET_BIAS_CHANCE) {
      return defaultResult;
    }

    const preferredResults = [];
    for (let targetValue = 1; targetValue <= 9; targetValue += 1) {
      if (hasChainReadyDivideEquation(targetValue)) {
        preferredResults.push(targetValue);
      }
    }

    if (preferredResults.length === 0) {
      return defaultResult;
    }

    return preferredResults[randomInteger(0, preferredResults.length - 1)];
  }

  function getEnemyTargetValue(enemyType) {
    const definition = ENEMY_DEFS[enemyType];
    if (operationMode === "multiply") {
      return getMultiplyTargetValue();
    }
    if (operationMode === "divide") {
      return getDivideTargetValue();
    }
    return randomInteger(definition.valueMin, definition.valueMax);
  }

  function canUseExpandedSecondOperand() {
    if (!selection.firstNumber || !isChainLightningUnlocked()) {
      return false;
    }

    if (operationMode === "add-sub") {
      return Number(selection.firstNumber) > CHAIN_LIGHTNING_ADD_SUB_FIRST_OPERAND_THRESHOLD;
    }

    return operationMode === "multiply" || operationMode === "divide";
  }

  function canUseTowerEquation() {
    return isMageTowerUnlocked();
  }

  function getMaxSecondOperandDigits() {
    return canUseExpandedSecondOperand() ? MAX_SECOND_OPERAND_DIGITS : 1;
  }

  function requiresManualCastConfirmation() {
    return canUseExpandedSecondOperand();
  }

  function getDifferentEnemyTargetValue(enemyType, previousValue) {
    for (let attemptIndex = 0; attemptIndex < 16; attemptIndex += 1) {
      const candidateValue = getEnemyTargetValue(enemyType);
      if (candidateValue !== previousValue) {
        return candidateValue;
      }
    }

    const definition = ENEMY_DEFS[enemyType];
    if (operationMode === "divide") {
      return previousValue >= 9 ? 8 : previousValue + 1;
    }
    if (definition && previousValue < definition.valueMax) {
      return previousValue + 1;
    }
    if (definition) {
      return definition.valueMin;
    }
    return previousValue + 1;
  }

  function rerollEnemyTargetsForCurrentMode() {
    for (const enemy of enemies) {
      if (enemy.state === "dead") {
        continue;
      }
      enemy.target = getEnemyTargetValue(enemy.type);
    }
  }

  function buildEquationKey(firstNumber, operatorSymbol, secondNumber) {
    return `${Number(firstNumber)}${operatorSymbol}${Number(secondNumber)}`;
  }

  function canUseEquationOnEnemy(enemy, equationKey) {
    if (!enemy.equationShield) {
      return true;
    }
    return enemy.lastUsedEquationKey !== equationKey
      && enemy.reservedEquationKey !== equationKey;
  }

  function reserveEquationForEnemy(enemy, equationKey) {
    if (!enemy.equationShield) {
      return;
    }
    enemy.reservedEquationKey = equationKey;
  }

  function releaseEquationReservation(enemy, equationKey) {
    if (!enemy || !enemy.equationShield) {
      return;
    }
    if (enemy.reservedEquationKey === equationKey) {
      enemy.reservedEquationKey = null;
    }
  }

  function finalizeEquationOnEnemy(enemy, equationText, equationKey) {
    if (!enemy || !enemy.equationShield) {
      return;
    }
    enemy.lastUsedEquationText = equationText;
    enemy.lastUsedEquationKey = equationKey;
    enemy.reservedEquationKey = null;
  }

  function triggerEquationShieldFlash(enemy) {
    if (!enemy || !enemy.equationShield) {
      return;
    }
    enemy.shieldFlashTimer = SHIELD_FLASH_DURATION_SECONDS;
  }

  function getGameScale() {
    return canvas.height / BASE_GAME_HEIGHT;
  }

  function getEnemySpawnX() {
    const offscreenMargin = Math.max(12, 26 * getGameScale());
    return canvas.width + offscreenMargin;
  }

  function getMageTowerLayout() {
    const gameScale = getGameScale();
    const towerWidth = 104 * gameScale;
    const towerHeight = 178 * gameScale;
    const topLaneY = lanes.length > 0 ? lanes[0].y : (250 * gameScale);
    const towerX = LANE_START_X + 6 * gameScale;
    const towerY = topLaneY - towerHeight;

    return {
      x: towerX,
      y: towerY,
      width: towerWidth,
      height: towerHeight,
      glowX: towerX + towerWidth * 0.58,
      glowY: towerY + towerHeight * 0.25,
      muzzleX: towerX + towerWidth * 0.74,
      muzzleY: towerY + towerHeight * 0.66,
    };
  }

  function getMageTowerPuzzleLayout() {
    const gameScale = getGameScale();
    const towerLayout = getMageTowerLayout();
    const panelWidth = 112 * gameScale;
    const panelHeight = 32 * gameScale;
    const panelX = towerLayout.x + towerLayout.width + (10 * gameScale);
    const panelY = towerLayout.y + towerLayout.height - panelHeight;
    const answerWidth = 24 * gameScale;
    const answerHeight = 16 * gameScale;
    const answerX = panelX + panelWidth - answerWidth - (6 * gameScale);
    const answerY = panelY + panelHeight - answerHeight - (6 * gameScale);

    return {
      panelX,
      panelY,
      panelWidth,
      panelHeight,
      answerX,
      answerY,
      answerWidth,
      answerHeight,
    };
  }

  function getRandomTowerOperator() {
    if (operationMode === "multiply") {
      return "*";
    }
    if (operationMode === "divide") {
      return "/";
    }
    return Math.random() < 0.5 ? "+" : "-";
  }

  function buildMageTowerPuzzle() {
    let firstValue = 0;
    let secondValue = 0;
    let thirdValue = 0;
    let firstOperator = getRandomTowerOperator();
    let secondOperator = getRandomTowerOperator();
    let resultValue = 0;

    if (operationMode === "multiply") {
      firstValue = randomInteger(2, 5);
      secondValue = randomInteger(2, 5);
      thirdValue = randomInteger(2, 4);
      resultValue = firstValue * secondValue * thirdValue;
    } else if (operationMode === "divide") {
      resultValue = randomInteger(2, 8);
      secondValue = randomInteger(2, 4);
      thirdValue = randomInteger(2, 4);
      firstValue = resultValue * secondValue * thirdValue;
      firstOperator = "/";
      secondOperator = "/";
    } else {
      let isValidResult = false;
      while (!isValidResult) {
        firstValue = randomInteger(8, 18);
        secondValue = randomInteger(1, 9);
        thirdValue = randomInteger(1, 9);
        firstOperator = getRandomTowerOperator();
        secondOperator = getRandomTowerOperator();
        resultValue = firstValue;
        resultValue = firstOperator === "+" ? resultValue + secondValue : resultValue - secondValue;
        resultValue = secondOperator === "+" ? resultValue + thirdValue : resultValue - thirdValue;
        isValidResult = resultValue >= 0 && resultValue <= 30;
      }
    }

    towerPuzzle.expressionText = `${firstValue} ${formatOperator(firstOperator)} ${secondValue} ${formatOperator(secondOperator)} ${thirdValue}`;
    towerPuzzle.expectedResult = resultValue;
    towerPuzzle.answerText = "";
    towerPuzzle.isFocused = false;
  }

  function resetMageTowerPuzzle() {
    towerPuzzle.expressionText = "";
    towerPuzzle.expectedResult = null;
    towerPuzzle.answerText = "";
    towerPuzzle.isFocused = false;
  }

  function ensureMageTowerPuzzle() {
    if (isMageTowerUnlocked() && towerPuzzle.expectedResult === null) {
      buildMageTowerPuzzle();
    }
  }

  function getMageTowerTargetLane() {
    const aliveEnemies = enemies.filter((enemy) => enemy.state !== "dead");
    if (aliveEnemies.length === 0) {
      return 1;
    }

    aliveEnemies.sort((enemyA, enemyB) => enemyA.x - enemyB.x);
    return aliveEnemies[0].lane;
  }

  function addTowerGroundFlame(laneIndex, flameX) {
    const gameScale = getGameScale();
    towerGroundFlames.push({
      lane: laneIndex,
      x: flameX,
      ttl: TOWER_GROUND_DURATION_SECONDS,
      duration: TOWER_GROUND_DURATION_SECONDS,
      frame: randomInteger(0, TOWER_GROUND_FRAME_COUNT - 1),
      frameTimer: 0,
      drawWidth: 86 * gameScale,
      drawHeight: 66 * gameScale,
    });
  }

  function launchMageTowerAttack(laneIndex) {
    const towerLayout = getMageTowerLayout();
    const gameScale = getGameScale();
    const drawWidth = 200 * gameScale;
    const drawHeight = drawWidth * (1070 / 1666);
    const startX = towerLayout.muzzleX - drawWidth * 0.18;

    towerGlowTimer = TOWER_GLOW_DURATION_SECONDS;
    towerProjectiles.push({
      lane: laneIndex,
      x: startX,
      endX: canvas.width + drawWidth * 0.35,
      drawWidth,
      drawHeight,
      phase: "launch",
      frame: 0,
      frameTimer: 0,
      lastGroundX: startX,
    });
    addTowerGroundFlame(laneIndex, startX + drawWidth * 0.22);
  }

  function advanceTowerProjectileFrame(projectile, deltaSeconds) {
    const frameDuration = 1 / TOWER_FIRE_FPS;
    projectile.frameTimer += deltaSeconds;

    while (projectile.frameTimer >= frameDuration) {
      projectile.frameTimer -= frameDuration;

      if (projectile.phase === "launch") {
        if (projectile.frame < TOWER_FIRE_LOOP_START_FRAME - 1) {
          projectile.frame += 1;
        } else {
          projectile.phase = "loop";
          projectile.frame = TOWER_FIRE_LOOP_START_FRAME;
        }
      } else if (projectile.phase === "loop") {
        projectile.frame += 1;
        if (projectile.frame > TOWER_FIRE_LOOP_END_FRAME) {
          projectile.frame = TOWER_FIRE_LOOP_START_FRAME;
        }
      } else if (projectile.frame < TOWER_FIRE_FRAME_COUNT - 1) {
        projectile.frame += 1;
      }
    }
  }

  function updateTowerEffects(deltaSeconds) {
    towerGlowTimer = Math.max(0, towerGlowTimer - deltaSeconds);

    for (const projectile of towerProjectiles) {
      projectile.x += TOWER_PROJECTILE_SPEED * deltaSeconds;
      while (projectile.x - projectile.lastGroundX >= TOWER_PROJECTILE_GROUND_SPACING) {
        projectile.lastGroundX += TOWER_PROJECTILE_GROUND_SPACING;
        addTowerGroundFlame(projectile.lane, projectile.lastGroundX + projectile.drawWidth * 0.12);
      }

      if (
        projectile.phase !== "finish"
        && projectile.x >= projectile.endX - projectile.drawWidth * 0.82
      ) {
        projectile.phase = "finish";
        projectile.frame = TOWER_FIRE_LOOP_END_FRAME + 1;
        projectile.frameTimer = 0;
      }

      advanceTowerProjectileFrame(projectile, deltaSeconds);
    }

    towerProjectiles = towerProjectiles.filter(
      (projectile) => !(projectile.phase === "finish" && projectile.frame >= TOWER_FIRE_FRAME_COUNT - 1),
    );

    const groundFrameDuration = 1 / TOWER_GROUND_FPS;
    for (const groundFlame of towerGroundFlames) {
      groundFlame.ttl -= deltaSeconds;
      groundFlame.frameTimer += deltaSeconds;
      while (groundFlame.frameTimer >= groundFrameDuration) {
        groundFlame.frameTimer -= groundFrameDuration;
        groundFlame.frame = (groundFlame.frame + 1) % TOWER_GROUND_FRAME_COUNT;
      }
    }

    towerGroundFlames = towerGroundFlames.filter((groundFlame) => groundFlame.ttl > 0);
  }

  function getTowerProjectileFrame(frameIndex) {
    return spriteAssets.towerFireFrames[frameIndex] || null;
  }

  function getTowerGroundFrame(frameIndex) {
    return spriteAssets.towerGroundFrames[frameIndex] || null;
  }

  function submitMageTowerAnswer() {
    if (!isMageTowerUnlocked() || towerPuzzle.expectedResult === null) {
      return false;
    }

    const submittedValue = Number(towerPuzzle.answerText);
    if (!Number.isFinite(submittedValue)) {
      castResultElement.classList.remove("ok");
      castResultElement.classList.add("bad");
      castResultElement.textContent = "Mage Tower: enter a result first.";
      return true;
    }

    if (submittedValue !== towerPuzzle.expectedResult) {
      castResultElement.classList.remove("ok");
      castResultElement.classList.add("bad");
      castResultElement.textContent = "Mage Tower answer is incorrect.";
      towerPuzzle.answerText = "";
      towerPuzzle.isFocused = true;
      return true;
    }

    const targetLane = getMageTowerTargetLane();
    const laneTargets = enemies.filter(
      (enemy) => enemy.state !== "dead" && enemy.lane === targetLane,
    );

    launchMageTowerAttack(targetLane);
    for (const laneTarget of laneTargets) {
      applyEnemyDamage(laneTarget, {
        damage: TOWER_ATTACK_DAMAGE,
        spawnExplosion: false,
        suppressMessage: true,
      });
    }

    castResultElement.classList.remove("bad");
    castResultElement.classList.add("ok");
    castResultElement.textContent = `Mage Tower engulfs lane ${targetLane + 1} for ${TOWER_ATTACK_DAMAGE} damage.`;
    buildMageTowerPuzzle();
    return true;
  }

  function buildTintedSpriteSource(image, sourceX, sourceY, sourceWidth, sourceHeight, tintColor) {
    if (!enemyTintContext || !tintColor) {
      return {
        image,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
      };
    }

    if (enemyTintCanvas.width !== sourceWidth || enemyTintCanvas.height !== sourceHeight) {
      enemyTintCanvas.width = sourceWidth;
      enemyTintCanvas.height = sourceHeight;
    }

    enemyTintContext.save();
    enemyTintContext.clearRect(0, 0, sourceWidth, sourceHeight);
    enemyTintContext.globalCompositeOperation = "source-over";
    enemyTintContext.drawImage(
      image,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      sourceWidth,
      sourceHeight,
    );
    enemyTintContext.globalCompositeOperation = "multiply";
    enemyTintContext.fillStyle = tintColor;
    enemyTintContext.fillRect(0, 0, sourceWidth, sourceHeight);
    enemyTintContext.globalCompositeOperation = "destination-in";
    enemyTintContext.drawImage(
      image,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      sourceWidth,
      sourceHeight,
    );
    enemyTintContext.restore();

    return {
      image: enemyTintCanvas,
      sourceX: 0,
      sourceY: 0,
      sourceWidth,
      sourceHeight,
    };
  }

  function drawEnemySprite(options) {
    const {
      image,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      destinationX,
      destinationY,
      destinationWidth,
      destinationHeight,
      flipHorizontally,
      tintColor,
      drawFilter,
    } = options;

    const spriteSource = tintColor
      ? buildTintedSpriteSource(image, sourceX, sourceY, sourceWidth, sourceHeight, tintColor)
      : {
        image,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
      };

    context2d.save();
    if (flipHorizontally) {
      context2d.translate(destinationX + destinationWidth / 2, 0);
      context2d.scale(-1, 1);
      context2d.translate(-(destinationX + destinationWidth / 2), 0);
    }
    context2d.filter = drawFilter || "none";
    context2d.drawImage(
      spriteSource.image,
      spriteSource.sourceX,
      spriteSource.sourceY,
      spriteSource.sourceWidth,
      spriteSource.sourceHeight,
      destinationX,
      destinationY,
      destinationWidth,
      destinationHeight,
    );
    context2d.restore();
  }

  function getTokenUiLayout() {
    const isTouchDevice = window.matchMedia
      && window.matchMedia("(pointer: coarse)").matches;
    if (isTouchDevice || window.innerWidth <= 900) {
      const panelX = 12;
      const panelY = 16;
      const panelWidth = CASTLE_PANEL_WIDTH - 24;
      const panelHeight = canvas.height - 32;
      const equationPanelHeight = 220;
      const equationPanelX = panelX + 10;
      const equationPanelY = panelY + panelHeight - equationPanelHeight - 10;
      const equationPanelWidth = panelWidth - 20;
      const topStartY = panelY + 114;
      const tokenBottomLimit = equationPanelY - 32;
      const verticalSpacing = (tokenBottomLimit - topStartY) / 4;
      const tokenRadius = Math.min(36, Math.max(28, Math.round(verticalSpacing * 0.46)));
      const firstColumnX = panelX + 94;
      const secondColumnX = panelX + 190;
      const operatorX = panelX + 282;
      const minimumColumnSpacing = Math.min(
        secondColumnX - firstColumnX,
        operatorX - secondColumnX,
      );
      const minimumTokenSpacing = Math.min(verticalSpacing, minimumColumnSpacing);
      const maximumNonOverlappingHitRadius = Math.floor(minimumTokenSpacing * 0.5) - 2;
      const tokenHitRadius = Math.max(
        tokenRadius + 6,
        Math.min(tokenRadius + 14, maximumNonOverlappingHitRadius),
      );
      const slotWidth = 88;
      const slotGap = 12;
      const slotTotalWidth = slotWidth * 3 + slotGap * 2;
      const slotStartX = equationPanelX + (equationPanelWidth - slotTotalWidth) / 2;
      return {
        isTouchLayout: true,
        tokenRadius,
        tokenHitRadius,
        panelX,
        panelY,
        panelWidth,
        panelHeight,
        equationPanelX,
        equationPanelY,
        equationPanelWidth,
        equationPanelHeight,
        firstColumnX,
        secondColumnX,
        topStartY,
        verticalSpacing,
        operatorX,
        plusY: topStartY + verticalSpacing * 1.35,
        minusY: topStartY + verticalSpacing * 2.65,
        multiplyY: topStartY + verticalSpacing * 2.0,
        slotStartX,
        slotY: equationPanelY + 68,
        slotWidth,
        slotHeight: 66,
        slotGap,
      };
    }

    return {
      isTouchLayout: false,
      tokenRadius: TOKEN_RADIUS,
      tokenHitRadius: TOKEN_RADIUS + 3,
      panelX: 18,
      panelY: 32,
      panelWidth: 304,
      panelHeight: 254,
      equationPanelX: 18,
      equationPanelY: 298,
      equationPanelWidth: 304,
      equationPanelHeight: 118,
      firstColumnX: 82,
      secondColumnX: 160,
      topStartY: 104,
      verticalSpacing: 40,
      operatorX: 250,
      plusY: 138,
      minusY: 206,
      multiplyY: 172,
      slotStartX: 24,
      slotY: 364,
      slotWidth: 78,
      slotHeight: 44,
      slotGap: 16,
    };
  }

  function computeLaneYPositions() {
    const gameScale = getGameScale();
    const topMargin = 250 * gameScale;
    const laneGap = 105 * gameScale;
    lanes = Array.from({ length: LANE_COUNT }, (_, laneIndex) => ({
      y: topMargin + laneIndex * laneGap,
    }));
  }

  function createSelectionTokens() {
    tokens = [];

    const layout = getTokenUiLayout();

    const numberTokenRows = [
      [1, 2],
      [3, 4],
      [5, 6],
      [7, 8],
      [9, 0],
    ];

    numberTokenRows.forEach((rowValues, rowIndex) => {
      rowValues.forEach((numberValue, columnIndex) => {
        const columnX = columnIndex === 0 ? layout.firstColumnX : layout.secondColumnX;
        tokens.push({
          id: `num-${numberValue}`,
          symbol: String(numberValue),
          kind: "number",
          x: columnX,
          y: layout.topStartY + rowIndex * layout.verticalSpacing,
          radius: layout.tokenRadius,
          hitRadius: layout.tokenHitRadius,
        });
      });
    });

    if (operationMode === "multiply" || operationMode === "divide") {
      tokens.push({
        id: operationMode === "multiply" ? "op-multiply" : "op-divide",
        symbol: operationMode === "multiply" ? "*" : "/",
        kind: "operator",
        x: layout.operatorX,
        y: layout.multiplyY,
        radius: layout.tokenRadius,
        hitRadius: layout.tokenHitRadius,
      });
    } else {
      tokens.push({
        id: "op-plus",
        symbol: "+",
        kind: "operator",
        x: layout.operatorX,
        y: layout.plusY,
        radius: layout.tokenRadius,
        hitRadius: layout.tokenHitRadius,
      });

      tokens.push({
        id: "op-minus",
        symbol: "-",
        kind: "operator",
        x: layout.operatorX,
        y: layout.minusY,
        radius: layout.tokenRadius,
        hitRadius: layout.tokenHitRadius,
      });
    }

    if (petrifiedTokenId && !tokens.some((token) => token.id === petrifiedTokenId)) {
      clearPetrifiedToken();
    }
  }

  function getOperationHintText() {
    if (operationMode === "multiply") {
      return isChainLightningUnlocked()
        ? "Select tokens: Number(s) → (×) → Number(s). Results above 30 trigger Chain Lightning."
        : "Select tokens: Number(s) → (×) → Number";
    }
    if (operationMode === "divide") {
      return isChainLightningUnlocked()
        ? "Select tokens: Number(s) → (÷) → Number(s). Divisors of 4 or more trigger Chain Lightning."
        : "Select tokens: Number(s) → (÷) → Number";
    }
    if (isChainLightningUnlocked()) {
      return "Select tokens: Number(s) → (+/-) → Number. First number above 10 enables Chain Lightning and Enter/Cast confirmation.";
    }
    return "Select tokens: Number(s) → (+/-) → Number";
  }

  function formatOperator(operatorSymbol) {
    if (operatorSymbol === "*") {
      return "×";
    }
    if (operatorSymbol === "/") {
      return "÷";
    }
    return operatorSymbol;
  }

  function buildIndexedImageSequence(basePath, frameCount, fileNameBuilder) {
    const frames = [];
    for (let frameIndex = 0; frameIndex < frameCount; frameIndex += 1) {
      const frameImage = new Image();
      frameImage.src = `${basePath}/${fileNameBuilder(frameIndex)}`;
      frames.push(frameImage);
    }
    return frames;
  }

  function loadSprites() {
    spriteAssets.worldMapLoaded = false;
    spriteAssets.worldMap.src = "assets/sprites/WorldMap.png";
    spriteAssets.worldMap.onload = () => {
      spriteAssets.worldMapLoaded = true;
    };

    spriteAssets.laneBackgroundLoaded = false;
    spriteAssets.laneBackground.src = "assets/sprites/Lanes2.png";
    spriteAssets.laneBackground.onload = () => {
      spriteAssets.laneBackgroundLoaded = true;
    };

    spriteAssets.towerLoaded = false;
    spriteAssets.tower.src = "assets/sprites/Background/CastleTower.png";
    spriteAssets.tower.onload = () => {
      spriteAssets.towerLoaded = true;
    };

    spriteAssets.forestFlatLoaded = false;
    spriteAssets.forestFlat.src = "assets/sprites/Background/Forest/forest bridge.png";
    spriteAssets.forestFlat.onload = () => {
      spriteAssets.forestFlatLoaded = true;
    };

    spriteAssets.bambooFlatLoaded = false;
    spriteAssets.bambooFlat.src = "assets/sprites/Background/Bamboo/bamboo bridge.png";
    spriteAssets.bambooFlat.onload = () => {
      spriteAssets.bambooFlatLoaded = true;
    };

    spriteAssets.volcanoFlatLoaded = false;
    spriteAssets.volcanoFlat.src = "assets/sprites/Background/Volcano.png";
    spriteAssets.volcanoFlat.onload = () => {
      spriteAssets.volcanoFlatLoaded = true;
    };

    spriteAssets.darkCastleFlatLoaded = false;
    spriteAssets.darkCastleFlat.src = "assets/sprites/Background/Castle/dark castle bridge.png";
    spriteAssets.darkCastleFlat.onload = () => {
      spriteAssets.darkCastleFlatLoaded = true;
    };

    spriteAssets.fireballLoaded = false;
    spriteAssets.fireballSheet.src = "assets/sprites/FireballSheet.png";
    spriteAssets.fireballSheet.onload = () => {
      spriteAssets.fireballLoaded = true;
    };

    spriteAssets.explosionLoaded = false;
    spriteAssets.explosionSheet.src = "assets/sprites/Explosion.png";
    spriteAssets.explosionSheet.onload = () => {
      spriteAssets.explosionLoaded = true;
    };

    spriteAssets.lightningLoaded = false;
    spriteAssets.lightningSheet.src = "assets/sprites/Lightning/4.png";
    spriteAssets.lightningSheet.onload = () => {
      spriteAssets.lightningLoaded = true;
    };

    spriteAssets.gemTokenLoaded = false;
    spriteAssets.gemToken.src = "assets/sprites/Gem.png";
    spriteAssets.gemToken.onload = () => {
      spriteAssets.gemTokenLoaded = true;
    };

    spriteAssets.castleLoaded = false;
    spriteAssets.castle.src = "assets/sprites/Castle.png";
    spriteAssets.castle.onload = () => {
      spriteAssets.castleLoaded = true;
    };

    spriteAssets.wizardLoaded = false;
    spriteAssets.wizard.src = "assets/sprites/Wizard.png";
    spriteAssets.wizard.onload = () => {
      spriteAssets.wizardLoaded = true;
    };

    spriteAssets.shieldFlashLoaded = false;
    spriteAssets.shieldFlash.src = "assets/sprites/Shield/Shield_6/3.png";
    spriteAssets.shieldFlash.onload = () => {
      spriteAssets.shieldFlashLoaded = true;
    };

    spriteAssets.spellUnlockLightningLoaded = false;
    spriteAssets.spellUnlockLightningSheet.src = "assets/sprites/Effects/Lightning/lightning_sprite_sheet_5x760.png";
    spriteAssets.spellUnlockLightningSheet.onload = () => {
      spriteAssets.spellUnlockLightningLoaded = true;
    };

    spriteAssets.towerFireFrames = buildIndexedImageSequence(
      "assets/sprites/Effects/Flames/flame10/PNG",
      TOWER_FIRE_FRAME_COUNT,
      (frameIndex) => `${String(frameIndex).padStart(2, "0")}.png`,
    );
    spriteAssets.towerGroundFrames = buildIndexedImageSequence(
      "assets/sprites/Effects/Flames/flame5/png",
      TOWER_GROUND_FRAME_COUNT,
      (frameIndex) => `png_${String(frameIndex).padStart(2, "0")}.png`,
    );

    spriteAssets.wizardAnimations = {
      idle: new Image(),
      fireball: new Image(),
      lightning: new Image(),
      dead: new Image(),
    };
    spriteAssets.wizardAnimations.idle.src = "assets/sprites/Fire Wizard/Idle.png";
    spriteAssets.wizardAnimations.fireball.src = "assets/sprites/Fire Wizard/Fireball.png";
    spriteAssets.wizardAnimations.lightning.src = "assets/sprites/Fire Wizard/Attack_1.png";
    spriteAssets.wizardAnimations.dead.src = "assets/sprites/Fire Wizard/Dead.png";

    for (const enemyType of Object.keys(ENEMY_DEFS)) {
      const image = new Image();
      const fileName = ENEMY_DEFS[enemyType].spriteFile;
      image.src = `assets/sprites/${fileName}`;
      spriteAssets.enemyImages[enemyType] = image;

      if (ENEMY_DEFS[enemyType].animations) {
        spriteAssets.enemyAnimations[enemyType] = {};
        for (const animationState of Object.keys(ENEMY_DEFS[enemyType].animations)) {
          const animationImage = new Image();
          animationImage.src = ENEMY_DEFS[enemyType].animations[animationState].path;
          spriteAssets.enemyAnimations[enemyType][animationState] = animationImage;
        }
      }
    }
  }

  function updateSpeedDisplay() {
    const modeTimeScale = operationMode === "multiply" ? MULTIPLY_TIME_SCALE : 1;
    const effectiveSpeed = speedMultiplier * levelBaseSpeedMultiplier * modeTimeScale;
    speedValueElement.textContent = `${effectiveSpeed.toFixed(2)}x`;
  }

  function setupSpeedSlider() {
    const sliderValue = Number(speedSliderElement.value);
    speedMultiplier = Number.isFinite(sliderValue) ? sliderValue : 1;
    updateSpeedDisplay();

    speedSliderElement.addEventListener("input", () => {
      const updatedValue = Number(speedSliderElement.value);
      speedMultiplier = Number.isFinite(updatedValue) ? updatedValue : 1;
      updateSpeedDisplay();
    });
  }

  function startLevel(levelIndex) {
    currentLevelIndex = Math.max(0, Math.min(LEVELS.length - 1, levelIndex));
    const selectedLevel = LEVELS[currentLevelIndex];
    currentLevelWavePlan = selectedLevel.waves;
    levelBaseSpeedMultiplier = selectedLevel.baseSpeedMultiplier;
    setPauseState(false);
    sceneMode = "game";
    resetGame();
    castResultElement.textContent = `Entering ${selectedLevel.name}.`;
    updateSpeedDisplay();
  }

  function returnToWorldMap() {
    sceneMode = "map";
    setPauseState(false);
    clearPetrifiedToken();
    towerProjectiles = [];
    towerGroundFlames = [];
    towerGlowTimer = 0;
    resetMageTowerPuzzle();
    gameResult = "running";
    statusLabelElement.textContent = "Map";
    waveLabelElement.textContent = "-";
    equationTextElement.textContent = "World Map: select an island level";
    castResultElement.textContent = "Choose an unlocked island to begin.";
    castResultElement.classList.remove("ok", "bad");
  }

  function getIslandScreenPoint(level) {
    return {
      x: level.mapPos.x * canvas.width,
      y: level.mapPos.y * canvas.height,
    };
  }

  function handleWorldMapClick(point) {
    const selectRadius = 26;
    for (let levelIndex = 0; levelIndex < LEVELS.length; levelIndex += 1) {
      const level = LEVELS[levelIndex];
      const islandPoint = getIslandScreenPoint(level);
      const distanceX = point.x - islandPoint.x;
      const distanceY = point.y - islandPoint.y;
      if (Math.sqrt(distanceX * distanceX + distanceY * distanceY) <= selectRadius) {
        if (levelIndex > highestUnlockedLevel) {
          castResultElement.textContent = `Level locked: clear ${LEVELS[levelIndex - 1].name} first.`;
          castResultElement.classList.remove("ok");
          castResultElement.classList.add("bad");
          return;
        }
        startLevel(levelIndex);
        return;
      }
    }
  }

  function buildWaveQueue(waveIndex) {
    if (waveIndex >= currentLevelWavePlan.length) {
      return [];
    }

    const queue = [];
    for (const pack of currentLevelWavePlan[waveIndex]) {
      for (let countIndex = 0; countIndex < pack.count; countIndex += 1) {
        queue.push({
          type: pack.type,
          variant: pack.variant || null,
        });
      }
    }

    for (let shuffleIndex = queue.length - 1; shuffleIndex > 0; shuffleIndex -= 1) {
      const randomIndex = randomInteger(0, shuffleIndex);
      const tempValue = queue[shuffleIndex];
      queue[shuffleIndex] = queue[randomIndex];
      queue[randomIndex] = tempValue;
    }

    return queue;
  }

  function spawnEnemy(spawnEntry) {
    const enemyType = spawnEntry.type;
    const definition = ENEMY_DEFS[enemyType];
    const variantDefinition = spawnEntry.variant
      && definition.variants
      ? definition.variants[spawnEntry.variant]
      : null;
    const laneIndex = randomInteger(0, LANE_COUNT - 1);

    enemies.push({
      id: nextEnemyId,
      lane: laneIndex,
      type: enemyType,
      x: getEnemySpawnX(),
      hp: definition.hp,
      target: getEnemyTargetValue(enemyType),
      speed: definition.speed,
      color: variantDefinition && variantDefinition.color
        ? variantDefinition.color
        : definition.color,
      tintColor: variantDefinition && variantDefinition.color
        ? variantDefinition.color
        : null,
      name: definition.name,
      spriteFile: definition.spriteFile,
      state: "run",
      stateTimer: 0,
      animationTimer: 0,
      animationFrame: 0,
      removeOnDeadEnd: false,
      sizeScale: definition.sizeScale || 1,
      rerollTargetOnHit: Boolean(definition.rerollTargetOnHit),
      drawFilter: variantDefinition && variantDefinition.drawFilter
        ? variantDefinition.drawFilter
        : "none",
      equationShield: Boolean(definition.equationShield),
      lastUsedEquationText: null,
      lastUsedEquationKey: null,
      reservedEquationKey: null,
      shieldFlashTimer: 0,
      specialCooldown: createEnemySpecialCooldown(enemyType),
    });

    nextEnemyId += 1;
  }

  function setEnemyState(enemy, nextState) {
    if (enemy.state === nextState) {
      return;
    }

    enemy.state = nextState;
    enemy.stateTimer = 0;
    enemy.animationTimer = 0;
    enemy.animationFrame = 0;

    if (enemy.type === "medusa" && nextState === "special") {
      petrifyRandomToken();
    }

    if (nextState === "run") {
      enemy.specialCooldown = createEnemySpecialCooldown(enemy.type);
    }
  }

  function getEnemyAnimationDef(enemy) {
    const enemyDefinition = ENEMY_DEFS[enemy.type];
    if (!enemyDefinition || !enemyDefinition.animations) {
      return null;
    }

    return enemyDefinition.animations[enemy.state] || null;
  }

  function getWizardAnimationDef() {
    if (wizardAnimation.state === "fireball") {
      return { key: "fireball", frameCount: 8, fps: 16, loop: false };
    }
    if (wizardAnimation.state === "lightning") {
      return { key: "lightning", frameCount: 4, fps: 14, loop: false };
    }
    if (wizardAnimation.state === "dead") {
      return { key: "dead", frameCount: 6, fps: 10, loop: false };
    }
    return { key: "idle", frameCount: 7, fps: 10, loop: true };
  }

  function setWizardAnimation(nextState) {
    if (wizardAnimation.state === "dead") {
      return;
    }
    if (wizardAnimation.state === nextState) {
      return;
    }

    wizardAnimation.state = nextState;
    wizardAnimation.frame = 0;
    wizardAnimation.frameTimer = 0;
  }

  function getCanvasPoint(mouseEvent) {
    const canvasRect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / canvasRect.width;
    const scaleY = canvas.height / canvasRect.height;
    return {
      x: (mouseEvent.clientX - canvasRect.left) * scaleX,
      y: (mouseEvent.clientY - canvasRect.top) * scaleY,
    };
  }

  function getTokenAt(pointX, pointY) {
    for (const token of tokens) {
      const distanceX = pointX - token.x;
      const distanceY = pointY - token.y;
      const tokenHitRadius = token.hitRadius || TOKEN_RADIUS;
      const isInside = Math.sqrt(distanceX * distanceX + distanceY * distanceY) <= tokenHitRadius;
      if (isInside) {
        return token;
      }
    }
    return null;
  }

  function clearEquationSelection() {
    selection.firstNumber = null;
    selection.operator = null;
    selection.secondNumber = null;
    selection.secondOperator = null;
    selection.thirdNumber = null;
    equationTextElement.textContent = getOperationHintText();
  }

  function updateEquationPreview() {
    const hasFirstNumber = selection.firstNumber !== null;
    const hasOperator = selection.operator !== null;
    const hasSecondNumber = selection.secondNumber !== null;

    if (!hasFirstNumber && !hasOperator && !hasSecondNumber) {
      equationTextElement.textContent = getOperationHintText();
      return null;
    }

    if (hasFirstNumber && !hasOperator) {
      equationTextElement.textContent = `${selection.firstNumber} _ _`;
      return null;
    }
    if (hasFirstNumber && hasOperator && !hasSecondNumber) {
      equationTextElement.textContent = `${selection.firstNumber} ${formatOperator(selection.operator)} _`;
      return null;
    }

    const firstNumber = Number(selection.firstNumber);
    const secondNumber = Number(selection.secondNumber);
    if (!Number.isFinite(firstNumber) || !Number.isFinite(secondNumber)) {
      return null;
    }
    if (!(selection.operator === "+" || selection.operator === "-" || selection.operator === "*" || selection.operator === "/")) {
      return null;
    }

    let resultValue = 0;
    if (selection.operator === "+") {
      resultValue = firstNumber + secondNumber;
    } else if (selection.operator === "-") {
      resultValue = firstNumber - secondNumber;
    } else if (selection.operator === "*") {
      resultValue = firstNumber * secondNumber;
    } else {
      if (secondNumber === 0) {
        equationTextElement.textContent = `${firstNumber} ${formatOperator(selection.operator)} ${secondNumber} = invalid`;
        castResultElement.classList.remove("ok", "bad");
        castResultElement.classList.add("bad");
        castResultElement.textContent = "Division by zero is not allowed.";
        return null;
      }
      if (firstNumber % secondNumber !== 0) {
        equationTextElement.textContent = `${firstNumber} ${formatOperator(selection.operator)} ${secondNumber} = invalid`;
        castResultElement.classList.remove("ok", "bad");
        castResultElement.classList.add("bad");
        castResultElement.textContent = "Division must produce a whole number.";
        return null;
      }
      resultValue = firstNumber / secondNumber;
    }

    equationTextElement.textContent = `${firstNumber} ${formatOperator(selection.operator)} ${secondNumber} = ${resultValue}`;

    return {
      firstNumber,
      secondNumber,
      operator: selection.operator,
      operandCount: 2,
      equationText: `${firstNumber} ${formatOperator(selection.operator)} ${secondNumber}`,
      equationKey: buildEquationKey(firstNumber, selection.operator, secondNumber),
      result: resultValue,
    };
  }

  function getTokenBySymbol(symbolValue, kindValue) {
    return tokens.find((token) => token.symbol === symbolValue && token.kind === kindValue);
  }

  function getWizardCastOrigin() {
    return {
      x: BATTLEFIELD_START_X + CASTLE_AREA_WIDTH * 0.5,
      y: canvas.height * 0.5-30,
    };
  }

  function shouldUseChainLightningSpell(equationResult) {
    if (!isChainLightningUnlocked()) {
      return false;
    }
    if (equationResult.operandCount > 2) {
      return false;
    }
    if (operationMode === "add-sub") {
      return equationResult.firstNumber > CHAIN_LIGHTNING_ADD_SUB_FIRST_OPERAND_THRESHOLD;
    }
    if (operationMode === "multiply") {
      return equationResult.result > CHAIN_LIGHTNING_MULTIPLY_RESULT_THRESHOLD;
    }
    if (operationMode === "divide") {
      return equationResult.secondNumber >= CHAIN_LIGHTNING_DIVIDE_SECOND_OPERAND_THRESHOLD;
    }
    return false;
  }

  function getDistanceBetweenPoints(pointA, pointB) {
    const deltaX = pointA.x - pointB.x;
    const deltaY = pointA.y - pointB.y;
    return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  }

  function getDistanceBetweenEnemies(enemyA, enemyB) {
    return getDistanceBetweenPoints(
      { x: enemyA.x, y: lanes[enemyA.lane].y },
      { x: enemyB.x, y: lanes[enemyB.lane].y },
    );
  }

  function getDistanceFromWizard(enemy) {
    const wizardOrigin = getWizardCastOrigin();
    return getDistanceBetweenPoints(
      wizardOrigin,
      { x: enemy.x, y: lanes[enemy.lane].y },
    );
  }

  function getChainLightningTargets(primaryEnemy, maxTargetCount) {
    const chainTargets = [primaryEnemy];
    const remainingEnemies = enemies.filter(
      (enemy) => enemy.state !== "dead" && enemy.id !== primaryEnemy.id,
    );

    remainingEnemies.sort(
      (enemyA, enemyB) => getDistanceFromWizard(enemyA) - getDistanceFromWizard(enemyB),
    );

    while (chainTargets.length < maxTargetCount && remainingEnemies.length > 0) {
      chainTargets.push(remainingEnemies.shift());
    }

    return chainTargets;
  }

  function addChainLightningEffect(targetEnemies) {
    chainLightningEffects.push({
      points: targetEnemies.map((enemy) => ({
        x: enemy.x,
        y: lanes[enemy.lane].y - 12,
      })),
      ttl: CHAIN_LIGHTNING_EFFECT_DURATION_SECONDS,
      duration: CHAIN_LIGHTNING_EFFECT_DURATION_SECONDS,
    });
  }

  function tryCastCurrentEquation() {
    const equationResult = updateEquationPreview();
    if (!equationResult) {
      return;
    }

    castSpellFromResult(equationResult);
    clearEquationSelection();
  }

  function registerTokenSelection(token) {
    if (isTokenPetrified(token)) {
      castResultElement.classList.remove("ok");
      castResultElement.classList.add("bad");
      castResultElement.textContent = `Token ${formatOperator(token.symbol)} is petrified.`;
      return;
    }

    if (token.kind === "number") {
      if (selection.operator === null) {
        if (selection.firstNumber === null) {
          selection.firstNumber = token.symbol;
        } else if (selection.firstNumber.length < MAX_FIRST_OPERAND_DIGITS) {
          selection.firstNumber += token.symbol;
        } else {
          castResultElement.classList.remove("ok", "bad");
          castResultElement.classList.add("bad");
          castResultElement.textContent = "First number is limited to 2 digits.";
          return;
        }
      } else {
        if (selection.secondNumber === null) {
          selection.secondNumber = token.symbol;
        } else if (selection.secondNumber.length < getMaxSecondOperandDigits()) {
          selection.secondNumber += token.symbol;
        } else {
          castResultElement.classList.remove("ok", "bad");
          castResultElement.classList.add("bad");
          castResultElement.textContent = `Second number is limited to ${getMaxSecondOperandDigits()} digits.`;
          return;
        }
      }
    } else if (token.kind === "operator") {
      if (selection.firstNumber === null) {
        castResultElement.classList.remove("ok", "bad");
        castResultElement.classList.add("bad");
        castResultElement.textContent = "Pick a number first.";
        return;
      }
      selection.operator = token.symbol;
    }

    const equationResult = updateEquationPreview();
    if (equationResult) {
      if (requiresManualCastConfirmation()) {
        castResultElement.classList.remove("bad");
        castResultElement.classList.add("ok");
        castResultElement.textContent = "Large spell ready. Press Enter or Cast Spell.";
      } else {
        castSpellFromResult(equationResult);
        clearEquationSelection();
      }
    }
  }

  function castSpellFromResult(equationResult) {
    if (gameResult !== "running") {
      return;
    }

    const targetValue = equationResult.result;
    equationTextElement.textContent = `${equationResult.equationText} = ${targetValue}`;

    const matchingEnemies = enemies
      .filter((enemy) => enemy.target === targetValue && enemy.state !== "dead")
      .sort((enemyA, enemyB) => enemyA.x - enemyB.x);

    castResultElement.classList.remove("ok", "bad");

    if (matchingEnemies.length === 0) {
      castResultElement.textContent = `No enemy matches result ${targetValue}.`;
      castResultElement.classList.add("bad");
      return;
    }

    const frontEnemy = matchingEnemies.find((enemy) => canUseEquationOnEnemy(enemy, equationResult.equationKey));
    if (!frontEnemy) {
      matchingEnemies.forEach((enemy) => {
        if (enemy.equationShield) {
          triggerEquationShieldFlash(enemy);
        }
      });
      castResultElement.textContent = "Shielded enemy rejects repeated equations. Try a different formula.";
      castResultElement.classList.add("bad");
      return;
    }

    if (shouldUseChainLightningSpell(equationResult)) {
      const chainTargets = getChainLightningTargets(frontEnemy, CHAIN_LIGHTNING_TARGET_COUNT);
      setWizardAnimation("lightning");
      finalizeEquationOnEnemy(frontEnemy, equationResult.equationText, equationResult.equationKey);
      addChainLightningEffect(chainTargets);
      for (const chainTarget of chainTargets) {
        lightningEffects.push({
          x: chainTarget.x,
          y: lanes[chainTarget.lane].y - 52,
          ttl: LIGHTNING_DURATION_SECONDS,
          duration: LIGHTNING_DURATION_SECONDS,
        });
        applyEnemyDamage(chainTarget, { spawnExplosion: false, suppressMessage: true });
      }
      castResultElement.textContent = `Cast! Chain Lightning arcs through ${chainTargets.length} enemies.`;
      castResultElement.classList.add("ok");
      return;
    }

    const chosenSpell = Math.random() < 0.5 ? "fireball" : "lightning";
    if (chosenSpell === "fireball") {
      setWizardAnimation("fireball");
      const wizardOrigin = getWizardCastOrigin();
      reserveEquationForEnemy(frontEnemy, equationResult.equationKey);
      activeProjectiles.push({
        targetEnemyId: frontEnemy.id,
        fromX: wizardOrigin.x,
        fromY: wizardOrigin.y,
        toX: frontEnemy.x,
        toY: lanes[frontEnemy.lane].y,
        ttl: PROJECTILE_TRAVEL_SECONDS,
        duration: PROJECTILE_TRAVEL_SECONDS,
        equationText: equationResult.equationText,
        equationKey: equationResult.equationKey,
      });
      castResultElement.textContent = `Cast! Fireball launched at ${frontEnemy.name}.`;
    } else {
      setWizardAnimation("lightning");
      finalizeEquationOnEnemy(frontEnemy, equationResult.equationText, equationResult.equationKey);
      lightningEffects.push({
        x: frontEnemy.x,
        y: lanes[frontEnemy.lane].y - 52,
        ttl: LIGHTNING_DURATION_SECONDS,
        duration: LIGHTNING_DURATION_SECONDS,
      });
      applyEnemyDamage(frontEnemy, false);
      castResultElement.textContent = `Cast! Lightning strikes ${frontEnemy.name}.`;
    }

    castResultElement.classList.add("ok");
  }

  function applyEnemyDamage(targetEnemy, damageOptions = false) {
    if (!targetEnemy || targetEnemy.state === "dead") {
      return;
    }

    const resolvedOptions = typeof damageOptions === "boolean"
      ? { spawnExplosion: damageOptions }
      : (damageOptions || {});
    const spawnExplosion = Boolean(resolvedOptions.spawnExplosion);
    const suppressMessage = Boolean(resolvedOptions.suppressMessage);
    const damageAmount = Number.isFinite(resolvedOptions.damage)
      ? Math.max(1, Math.floor(resolvedOptions.damage))
      : 1;

    targetEnemy.hp -= damageAmount;
    if (spawnExplosion) {
      hitEffects.push({
        x: targetEnemy.x,
        y: lanes[targetEnemy.lane].y,
        ttl: EXPLOSION_DURATION_SECONDS,
        duration: EXPLOSION_DURATION_SECONDS,
        color: "#78d6ff",
      });
    }

    if (!suppressMessage) {
      castResultElement.textContent = `Hit! ${targetEnemy.name} in lane ${targetEnemy.lane + 1}.`;
      castResultElement.classList.add("ok");
    }

    if (targetEnemy.hp <= 0) {
      setEnemyState(targetEnemy, "dead");
      targetEnemy.removeOnDeadEnd = true;
      awardXp(1);
      if (!suppressMessage) {
        castResultElement.textContent = `Eliminated ${targetEnemy.name} (target ${targetEnemy.target}).`;
      }
    } else {
      if (targetEnemy.rerollTargetOnHit) {
        const previousTarget = targetEnemy.target;
        targetEnemy.target = getDifferentEnemyTargetValue(targetEnemy.type, previousTarget);
        if (!suppressMessage) {
          castResultElement.textContent = `Hit! ${targetEnemy.name} rerolled ${previousTarget} to ${targetEnemy.target}.`;
        }
      }
      setEnemyState(targetEnemy, "hurt");
    }
  }

  function applyProjectileImpact(projectile) {
    const targetEnemy = enemies.find((enemy) => enemy.id === projectile.targetEnemyId);
    if (!targetEnemy || targetEnemy.state === "dead") {
      releaseEquationReservation(targetEnemy, projectile.equationKey);
      return;
    }
    finalizeEquationOnEnemy(targetEnemy, projectile.equationText, projectile.equationKey);
    applyEnemyDamage(targetEnemy, true);
  }

  function onCanvasClick(mouseEvent) {
    if (spellUnlockAnimation.active) {
      hideSpellUnlockOverlay();
      return;
    }

    const point = getCanvasPoint(mouseEvent);

    if (sceneMode === "map") {
      handleWorldMapClick(point);
      return;
    }

    if (gameResult === "victory") {
      returnToWorldMap();
      return;
    }

    const token = getTokenAt(point.x, point.y);

    if (isMageTowerUnlocked()) {
      const puzzleLayout = getMageTowerPuzzleLayout();
      const isInsideTowerPanel = point.x >= puzzleLayout.panelX
        && point.x <= puzzleLayout.panelX + puzzleLayout.panelWidth
        && point.y >= puzzleLayout.panelY
        && point.y <= puzzleLayout.panelY + puzzleLayout.panelHeight;
      if (isInsideTowerPanel) {
        towerPuzzle.isFocused = true;
        if (!token) {
          return;
        }
      }
      if (towerPuzzle.isFocused && token && token.kind === "number") {
        if (towerPuzzle.answerText.length < MAX_TOWER_ANSWER_DIGITS) {
          towerPuzzle.answerText += token.symbol;
        }
        return;
      }
      towerPuzzle.isFocused = false;
    }

    if (!token) {
      return;
    }
    registerTokenSelection(token);
  }

  function onKeyboardInput(keyboardEvent) {
    const handledDebugSequence = handleDebugSequenceKey(keyboardEvent);
    if (handledDebugSequence) {
      keyboardEvent.preventDefault();
      return;
    }

    if (spellUnlockAnimation.active) {
      if (keyboardEvent.key === "Escape" || keyboardEvent.key === "Enter" || keyboardEvent.key === " ") {
        keyboardEvent.preventDefault();
        hideSpellUnlockOverlay();
      }
      return;
    }

    if (sceneMode !== "game") {
      return;
    }

    if (gameResult !== "running") {
      return;
    }

    const pressedKey = keyboardEvent.key;
    let matchedToken = null;

    if (towerPuzzle.isFocused && /^\d$/.test(pressedKey)) {
      keyboardEvent.preventDefault();
      if (towerPuzzle.answerText.length < MAX_TOWER_ANSWER_DIGITS) {
        towerPuzzle.answerText += pressedKey;
      }
      return;
    }

    if (towerPuzzle.isFocused && (pressedKey === "Backspace" || pressedKey === "Delete")) {
      keyboardEvent.preventDefault();
      towerPuzzle.answerText = towerPuzzle.answerText.slice(0, -1);
      return;
    }

    if (towerPuzzle.isFocused && (pressedKey === "Enter" || keyboardEvent.code === "NumpadEnter")) {
      keyboardEvent.preventDefault();
      submitMageTowerAnswer();
      return;
    }

    if (/^\d$/.test(pressedKey)) {
      matchedToken = getTokenBySymbol(pressedKey, "number");
    } else if (pressedKey === "+" || keyboardEvent.code === "NumpadAdd") {
      matchedToken = getTokenBySymbol("+", "operator");
    } else if (pressedKey === "-" || keyboardEvent.code === "NumpadSubtract") {
      matchedToken = getTokenBySymbol("-", "operator");
    } else if (
      pressedKey === "*"
      || pressedKey === "x"
      || pressedKey === "X"
      || keyboardEvent.code === "NumpadMultiply"
    ) {
      matchedToken = getTokenBySymbol("*", "operator");
    } else if (pressedKey === "/" || keyboardEvent.code === "NumpadDivide") {
      matchedToken = getTokenBySymbol("/", "operator");
    } else if (pressedKey === "Escape" || pressedKey === "Backspace") {
      if (towerPuzzle.isFocused) {
        towerPuzzle.isFocused = false;
      }
      clearEquationSelection();
      return;
    }

    if (!matchedToken) {
      if (pressedKey === "Enter" || pressedKey === "=" || keyboardEvent.code === "NumpadEnter") {
        keyboardEvent.preventDefault();
        tryCastCurrentEquation();
      }
      return;
    }

    keyboardEvent.preventDefault();
    registerTokenSelection(matchedToken);
  }

  function startWave(waveIndex) {
    currentWaveQueue = buildWaveQueue(waveIndex);
    spawnTimerSeconds = 0.25;
    waveLabelElement.textContent = String(waveIndex + 1);
  }

  function resetGame() {
    operationMode = operationModeElement.value;
    setPauseState(false);
    clearPetrifiedToken();
    resetMageTowerPuzzle();
    computeLaneYPositions();
    createSelectionTokens();
    clearEquationSelection();
    enemies = [];
    hitEffects = [];
    levelUpEffects = [];
    activeProjectiles = [];
    lightningEffects = [];
    chainLightningEffects = [];
    towerProjectiles = [];
    towerGroundFlames = [];
    towerGlowTimer = 0;
    wizardAnimation.state = "idle";
    wizardAnimation.frame = 0;
    wizardAnimation.frameTimer = 0;

    gameResult = "running";
    castleHp = CASTLE_MAX_HP;
    nextEnemyId = 1;

    currentWaveIndex = 0;
    waveDelayTimerSeconds = 0;
    levelCompleteTimerSeconds = 0;
    startWave(currentWaveIndex);

    statusLabelElement.textContent = "Running";
    castleHpElement.textContent = String(castleHp);
    castResultElement.textContent = "No casts yet.";
    castResultElement.classList.remove("ok", "bad");
    ensureMageTowerPuzzle();
    updateSpeedDisplay();
  }

  function updateGameState(deltaSeconds) {
    if (sceneMode !== "game") {
      return;
    }

    if (isPaused) {
      return;
    }

    if (gameResult === "defeat") {
      return;
    }

    if (gameResult === "victory") {
      levelCompleteTimerSeconds -= deltaSeconds;
      if (levelCompleteTimerSeconds <= 0) {
        returnToWorldMap();
      }
      return;
    }

    const modeTimeScale = operationMode === "multiply" ? MULTIPLY_TIME_SCALE : 1;
    const gameplayDeltaSeconds = deltaSeconds * modeTimeScale;
    updateTowerEffects(gameplayDeltaSeconds);
    petrifiedTokenTimer = Math.max(0, petrifiedTokenTimer - deltaSeconds);
    if (petrifiedTokenTimer <= 0 && petrifiedTokenId) {
      clearPetrifiedToken();
    }

    spawnTimerSeconds -= gameplayDeltaSeconds;
    if (currentWaveQueue.length > 0 && spawnTimerSeconds <= 0) {
      const nextSpawn = currentWaveQueue.shift();
      spawnEnemy(nextSpawn);
      spawnTimerSeconds = 1.1;
    }

    if (currentWaveQueue.length === 0 && enemies.length === 0) {
      if (currentWaveIndex < currentLevelWavePlan.length - 1) {
        waveDelayTimerSeconds += gameplayDeltaSeconds;
        if (waveDelayTimerSeconds >= 2.0) {
          waveDelayTimerSeconds = 0;
          currentWaveIndex += 1;
          startWave(currentWaveIndex);
        }
      } else if (castleHp > 0) {
        gameResult = "victory";
        levelCompleteTimerSeconds = LEVEL_COMPLETE_RETURN_SECONDS;
        statusLabelElement.textContent = "Victory";
        completedLevelIndices.add(currentLevelIndex);
        highestUnlockedLevel = Math.max(
          highestUnlockedLevel,
          Math.min(LEVELS.length - 1, currentLevelIndex + 1),
        );
        syncCurrentProfileSave();
        castResultElement.textContent = "Level complete. Returning to World Map...";
        castResultElement.classList.remove("bad");
        castResultElement.classList.add("ok");
      }
    }

    for (const enemy of enemies) {
      enemy.shieldFlashTimer = Math.max(0, enemy.shieldFlashTimer - deltaSeconds);
      enemy.stateTimer += deltaSeconds;
      const specialStateDefinition = getEnemySpecialStateDef(enemy.type);
      const isUsingSpecialState = Boolean(
        specialStateDefinition && enemy.state === specialStateDefinition.animation,
      );

      const animationDefinition = getEnemyAnimationDef(enemy);
      if (animationDefinition) {
        const frameDuration = 1 / animationDefinition.fps;
        enemy.animationTimer += deltaSeconds;
        while (enemy.animationTimer >= frameDuration) {
          enemy.animationTimer -= frameDuration;
          enemy.animationFrame += 1;
          if (enemy.state === "dead") {
            if (enemy.animationFrame >= animationDefinition.frameCount) {
              enemy.animationFrame = animationDefinition.frameCount - 1;
            }
          } else {
            enemy.animationFrame %= animationDefinition.frameCount;
          }
        }
      }

      if (enemy.state === "hurt" && enemy.stateTimer >= 0.20) {
        setEnemyState(enemy, "run");
      }

      if (specialStateDefinition && enemy.state === "run") {
        enemy.specialCooldown -= deltaSeconds;
        if (enemy.specialCooldown <= 0) {
          setEnemyState(enemy, specialStateDefinition.animation);
        }
      }

      if (specialStateDefinition && isUsingSpecialState) {
        const specialAnimation = ENEMY_DEFS[enemy.type].animations[specialStateDefinition.animation];
        const specialDuration = specialAnimation.frameCount / specialAnimation.fps;
        if (enemy.stateTimer >= specialDuration) {
          setEnemyState(enemy, "run");
        }
      }

      if (enemy.state !== "dead" && !isUsingSpecialState) {
        enemy.x -= enemy.speed * speedMultiplier * levelBaseSpeedMultiplier * gameplayDeltaSeconds;
      }
    }

    const wizardAnimationDef = getWizardAnimationDef();
    const wizardFrameDuration = 1 / wizardAnimationDef.fps;
    wizardAnimation.frameTimer += deltaSeconds;
    while (wizardAnimation.frameTimer >= wizardFrameDuration) {
      wizardAnimation.frameTimer -= wizardFrameDuration;
      wizardAnimation.frame += 1;
      if (wizardAnimationDef.loop) {
        wizardAnimation.frame %= wizardAnimationDef.frameCount;
      } else if (wizardAnimation.frame >= wizardAnimationDef.frameCount) {
        wizardAnimation.frame = wizardAnimationDef.frameCount - 1;
      }
    }

    if (
      !wizardAnimationDef.loop
      && wizardAnimation.frame >= wizardAnimationDef.frameCount - 1
      && wizardAnimation.state !== "dead"
    ) {
      wizardAnimation.state = "idle";
      wizardAnimation.frame = 0;
      wizardAnimation.frameTimer = 0;
    }

    enemies = enemies.filter((enemy) => {
      if (enemy.state !== "dead" || !enemy.removeOnDeadEnd) {
        return true;
      }

      const animationDefinition = getEnemyAnimationDef(enemy);
      if (!animationDefinition) {
        return false;
      }

      return enemy.animationFrame < animationDefinition.frameCount - 1;
    });

    for (const projectile of activeProjectiles) {
      projectile.ttl -= deltaSeconds;
    }
    const impactedProjectiles = activeProjectiles.filter((projectile) => projectile.ttl <= 0);
    for (const projectile of impactedProjectiles) {
      applyProjectileImpact(projectile);
    }
    activeProjectiles = activeProjectiles.filter((projectile) => projectile.ttl > 0);

    lightningEffects = lightningEffects
      .map((effect) => ({ ...effect, ttl: effect.ttl - deltaSeconds }))
      .filter((effect) => effect.ttl > 0);

    chainLightningEffects = chainLightningEffects
      .map((effect) => ({ ...effect, ttl: effect.ttl - deltaSeconds }))
      .filter((effect) => effect.ttl > 0);

    const escapedEnemyIds = new Set();
    for (const enemy of enemies) {
      if (enemy.state !== "dead" && enemy.x <= LANE_START_X - 14) {
        escapedEnemyIds.add(enemy.id);
      }
    }

    if (escapedEnemyIds.size > 0) {
      castleHp -= escapedEnemyIds.size;
      castleHpElement.textContent = String(Math.max(0, castleHp));
      enemies = enemies.filter((enemy) => !escapedEnemyIds.has(enemy.id));
      castResultElement.textContent = `Enemy breach! Castle HP -${escapedEnemyIds.size}.`;
      castResultElement.classList.remove("ok");
      castResultElement.classList.add("bad");
    }

    if (castleHp <= 0) {
      castleHp = 0;
      gameResult = "defeat";
      levelCompleteTimerSeconds = 0;
      statusLabelElement.textContent = "Defeat";
      castleHpElement.textContent = "0";
      wizardAnimation.state = "dead";
      wizardAnimation.frame = 0;
      wizardAnimation.frameTimer = 0;
    }

    hitEffects = hitEffects
      .map((effect) => ({ ...effect, ttl: effect.ttl - deltaSeconds }))
      .filter((effect) => effect.ttl > 0);

    levelUpEffects = levelUpEffects
      .map((effect) => ({ ...effect, ttl: effect.ttl - deltaSeconds, y: effect.y - (32 * deltaSeconds) }))
      .filter((effect) => effect.ttl > 0);
  }

  function drawBackground() {
    context2d.clearRect(0, 0, canvas.width, canvas.height);

    context2d.fillStyle = "#0f1530";
    context2d.fillRect(0, 0, canvas.width, canvas.height);

    const battlefieldX = BATTLEFIELD_START_X;
    const battlefieldY = 0;
    const battlefieldWidth = canvas.width - BATTLEFIELD_START_X;
    const battlefieldHeight = canvas.height;

    const activeTheme = LEVELS[currentLevelIndex].battlefieldTheme || BATTLEFIELD_THEME_DEFAULT;
    function drawImageCover(image, destinationX, destinationY, destinationWidth, destinationHeight, offsetX = 0, offsetY = 0) {
      if (!image || !image.complete || image.naturalWidth <= 0) {
        return;
      }
      const scale = Math.max(
        destinationWidth / image.naturalWidth,
        destinationHeight / image.naturalHeight,
      );
      const drawWidth = image.naturalWidth * scale;
      const drawHeight = image.naturalHeight * scale;
      const drawX = destinationX + (destinationWidth - drawWidth) * 0.5 + offsetX;
      const drawY = destinationY + (destinationHeight - drawHeight) * 0.5 + offsetY;

      context2d.save();
      context2d.beginPath();
      context2d.rect(destinationX, destinationY, destinationWidth, destinationHeight);
      context2d.clip();
      context2d.drawImage(image, drawX, drawY, drawWidth, drawHeight);
      context2d.restore();
    }

    let themedBackgroundDrawn = false;

    if (activeTheme === BATTLEFIELD_THEME_MYSTIC_FOREST) {
      if (spriteAssets.forestFlatLoaded) {
        themedBackgroundDrawn = true;
        drawImageCover(
          spriteAssets.forestFlat,
          battlefieldX,
          battlefieldY,
          battlefieldWidth,
          battlefieldHeight,
        );
      }
    }

    if (activeTheme === BATTLEFIELD_THEME_CRYSTAL_HIGHLIGHT) {
      if (spriteAssets.bambooFlatLoaded) {
        themedBackgroundDrawn = true;
        drawImageCover(
          spriteAssets.bambooFlat,
          battlefieldX,
          battlefieldY,
          battlefieldWidth,
          battlefieldHeight,
        );
      }
    }

    if (activeTheme === BATTLEFIELD_THEME_VOLCANO) {
      if (spriteAssets.volcanoFlatLoaded) {
        themedBackgroundDrawn = true;
        context2d.drawImage(
          spriteAssets.volcanoFlat,
          battlefieldX,
          battlefieldY,
          battlefieldWidth,
          battlefieldHeight,
        );
      }
    }

    if (activeTheme === BATTLEFIELD_THEME_DARK_CASTLE) {
      if (spriteAssets.darkCastleFlatLoaded) {
        themedBackgroundDrawn = true;
        drawImageCover(
          spriteAssets.darkCastleFlat,
          battlefieldX,
          battlefieldY,
          battlefieldWidth,
          battlefieldHeight,
        );
      }
    }

    if (!themedBackgroundDrawn && spriteAssets.laneBackgroundLoaded) {
      context2d.drawImage(
        spriteAssets.laneBackground,
        BATTLEFIELD_START_X,
        0,
        canvas.width - BATTLEFIELD_START_X,
        canvas.height,
      );
    } else if (!themedBackgroundDrawn) {
      context2d.fillStyle = "#121b3a";
      context2d.fillRect(BATTLEFIELD_START_X, 0, canvas.width - BATTLEFIELD_START_X, canvas.height);
      context2d.strokeStyle = "#33407d";
      context2d.lineWidth = 1;
      for (const lane of lanes) {
        context2d.beginPath();
        context2d.moveTo(BATTLEFIELD_START_X, lane.y + 35);
        context2d.lineTo(canvas.width, lane.y + 35);
        context2d.stroke();

        context2d.beginPath();
        context2d.moveTo(BATTLEFIELD_START_X, lane.y - 35);
        context2d.lineTo(canvas.width, lane.y - 35);
        context2d.stroke();
      }
    }

    context2d.fillStyle = "#1e264f";
    context2d.fillRect(0, 0, CASTLE_PANEL_WIDTH, canvas.height);
    context2d.strokeStyle = "#4659a3";
    context2d.lineWidth = 2;
    context2d.strokeRect(0, 0, CASTLE_PANEL_WIDTH, canvas.height);

    context2d.fillStyle = "#7d8bca";
    context2d.font = "16px Segoe UI";
    lanes.forEach((lane, laneIndex) => {
      context2d.fillText(`Lane ${laneIndex + 1}`, LANE_START_X + 132, lane.y + 5);
    });

    const castleAreaX = BATTLEFIELD_START_X;
    const castleAreaY = 0;
    const castleAreaWidth = CASTLE_AREA_WIDTH;
    const castleAreaHeight = canvas.height;

    if (isMageTowerUnlocked()) {
      const towerLayout = getMageTowerLayout();
      if (spriteAssets.towerLoaded) {
        drawImageCover(
          spriteAssets.tower,
          towerLayout.x,
          towerLayout.y,
          towerLayout.width,
          towerLayout.height,
        );
      }
    }

    if (spriteAssets.castleLoaded) {
      const imageWidth = spriteAssets.castle.width;
      const imageHeight = spriteAssets.castle.height;
      const areaAspect = castleAreaWidth / castleAreaHeight;
      const imageAspect = imageWidth / imageHeight;

      let sourceX = 0;
      let sourceY = 0;
      let sourceWidth = imageWidth;
      let sourceHeight = imageHeight;

      if (imageAspect > areaAspect) {
        sourceWidth = imageHeight * areaAspect;
        sourceX = (imageWidth - sourceWidth) * 0.5;
      } else {
        sourceHeight = imageWidth / areaAspect;
        sourceY = (imageHeight - sourceHeight) * 0.5;
      }

      context2d.drawImage(
        spriteAssets.castle,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        castleAreaX,
        castleAreaY,
        castleAreaWidth,
        castleAreaHeight,
      );
    } else {
      context2d.fillStyle = "#4f5d9f";
      context2d.fillRect(castleAreaX, castleAreaY, castleAreaWidth, castleAreaHeight);
      context2d.fillStyle = "#5d6cad";
      context2d.fillRect(castleAreaX + 56, castleAreaY + 40, 58, 58);
    }

    if (isMageTowerUnlocked()) {
      const towerLayout = getMageTowerLayout();
      if (towerGlowTimer > 0) {
        const glowAlpha = towerGlowTimer / TOWER_GLOW_DURATION_SECONDS;
        context2d.save();
        context2d.globalAlpha = Math.max(0.25, glowAlpha * 0.75);
        context2d.fillStyle = "#ffb85b";
        context2d.shadowColor = "#ffd37a";
        context2d.shadowBlur = 36 * getGameScale();
        context2d.beginPath();
        context2d.arc(
          towerLayout.glowX,
          towerLayout.glowY,
          18 * getGameScale(),
          0,
          Math.PI * 2,
        );
        context2d.fill();
        context2d.restore();
      }
    }

    drawMageTowerPuzzle();

    const wizardOrigin = getWizardCastOrigin();
    const gameScale = getGameScale();
    const wizardAnimationDef = getWizardAnimationDef();
    const wizardSheet = spriteAssets.wizardAnimations[wizardAnimationDef.key];
    if (wizardSheet && wizardSheet.complete && wizardSheet.naturalWidth > 0) {
      const frameWidth = Math.floor(wizardSheet.width / wizardAnimationDef.frameCount);
      const frameHeight = wizardSheet.height;
      const sourceFrame = Math.min(wizardAnimationDef.frameCount - 1, wizardAnimation.frame);
      const wizardSize = 102 * gameScale;
      context2d.drawImage(
        wizardSheet,
        sourceFrame * frameWidth,
        0,
        frameWidth,
        frameHeight,
        wizardOrigin.x - wizardSize / 2,
        wizardOrigin.y - wizardSize / 2,
        wizardSize,
        wizardSize,
      );
    } else if (spriteAssets.wizardLoaded) {
      const wizardSize = 86 * gameScale;
      context2d.drawImage(
        spriteAssets.wizard,
        wizardOrigin.x - wizardSize / 2,
        wizardOrigin.y - wizardSize / 2,
        wizardSize,
        wizardSize,
      );
    } else {
      context2d.fillStyle = "#a58cff";
      context2d.beginPath();
      context2d.arc(wizardOrigin.x, wizardOrigin.y, 22, 0, Math.PI * 2);
      context2d.fill();
    }

    const tokenLayout = getTokenUiLayout();

    context2d.fillStyle = "#2b3568";
    context2d.fillRect(
      tokenLayout.panelX,
      tokenLayout.panelY,
      tokenLayout.panelWidth,
      tokenLayout.panelHeight,
    );
    context2d.strokeStyle = "#6077cb";
    context2d.lineWidth = 2;
    context2d.strokeRect(
      tokenLayout.panelX,
      tokenLayout.panelY,
      tokenLayout.panelWidth,
      tokenLayout.panelHeight,
    );

    context2d.fillStyle = "#2b3568";
    context2d.fillRect(
      tokenLayout.equationPanelX,
      tokenLayout.equationPanelY,
      tokenLayout.equationPanelWidth,
      tokenLayout.equationPanelHeight,
    );
    context2d.strokeStyle = "#6077cb";
    context2d.strokeRect(
      tokenLayout.equationPanelX,
      tokenLayout.equationPanelY,
      tokenLayout.equationPanelWidth,
      tokenLayout.equationPanelHeight,
    );

    context2d.fillStyle = "#cdd7ff";
    context2d.font = tokenLayout.isTouchLayout ? "bold 29px Segoe UI" : "14px Segoe UI";
    context2d.fillText(
      tokenLayout.isTouchLayout ? "Touch Token Panel" : "Token Panel",
      tokenLayout.panelX + 16,
      tokenLayout.panelY + (tokenLayout.isTouchLayout ? 42 : 24),
    );

    context2d.font = tokenLayout.isTouchLayout ? "23px Segoe UI" : "14px Segoe UI";
    if (tokenLayout.isTouchLayout) {
      context2d.fillText(
        operationMode === "multiply"
          ? "Operator: ×"
          : operationMode === "divide"
            ? "Operator: ÷"
            : "Operators: + and -",
        tokenLayout.panelX + 170,
        tokenLayout.topStartY - 42,
      );
    } else {
      context2d.fillText(
        operationMode === "multiply"
          ? "×"
          : operationMode === "divide"
            ? "÷"
            : "+ / -",
        224,
        80,
      );
    }

    context2d.fillStyle = "#cdd7ff";
    context2d.font = tokenLayout.isTouchLayout ? "bold 22px Segoe UI" : "14px Segoe UI";
    context2d.fillText(
      "Equation",
      tokenLayout.equationPanelX + 16,
      tokenLayout.equationPanelY + (tokenLayout.isTouchLayout ? 42 : 24),
    );
    context2d.font = tokenLayout.isTouchLayout ? "16px Segoe UI" : "12px Segoe UI";
    context2d.fillText(
      "Mouse/touch or numpad keys",
      tokenLayout.equationPanelX + 16,
      tokenLayout.equationPanelY + (tokenLayout.isTouchLayout ? 80 : 46),
    );
    context2d.fillText(
      "Esc clears selection",
      tokenLayout.equationPanelX + 16,
      tokenLayout.equationPanelY + (tokenLayout.isTouchLayout ? 100 : 64),
    );
  }

  function drawWorldMapScene() {
    context2d.clearRect(0, 0, canvas.width, canvas.height);

    context2d.fillStyle = "#0b122b";
    context2d.fillRect(0, 0, canvas.width, canvas.height);

    if (spriteAssets.worldMapLoaded) {
      const mapWidth = spriteAssets.worldMap.width;
      const mapHeight = spriteAssets.worldMap.height;
      const scale = Math.min(canvas.width / mapWidth, canvas.height / mapHeight);
      const drawWidth = mapWidth * scale;
      const drawHeight = mapHeight * scale;
      const drawX = (canvas.width - drawWidth) * 0.5;
      const drawY = (canvas.height - drawHeight) * 0.5;
      context2d.drawImage(spriteAssets.worldMap, drawX, drawY, drawWidth, drawHeight);
    }

    context2d.fillStyle = "rgba(10, 18, 44, 0.55)";
    context2d.fillRect(20, 20, 520, 110);
    context2d.strokeStyle = "rgba(155, 182, 255, 0.8)";
    context2d.lineWidth = 2;
    context2d.strokeRect(20, 20, 520, 110);

    context2d.fillStyle = "#e7edff";
    context2d.font = "bold 28px Segoe UI";
    context2d.fillText("World Map", 40, 62);
    context2d.font = "16px Segoe UI";
    context2d.fillText("Select an island level. Higher islands are tougher and faster.", 40, 95);

    for (let levelIndex = 0; levelIndex < LEVELS.length; levelIndex += 1) {
      const level = LEVELS[levelIndex];
      const point = getIslandScreenPoint(level);
      const isUnlocked = levelIndex <= highestUnlockedLevel;
      const isCompleted = completedLevelIndices.has(levelIndex);

      context2d.beginPath();
      context2d.arc(point.x, point.y, 18, 0, Math.PI * 2);
      if (!isUnlocked) {
        context2d.fillStyle = "rgba(120, 125, 140, 0.9)";
      } else if (isCompleted) {
        context2d.fillStyle = "rgba(96, 218, 147, 0.95)";
      } else {
        context2d.fillStyle = "rgba(255, 200, 104, 0.95)";
      }
      context2d.fill();
      context2d.strokeStyle = "#ffffff";
      context2d.lineWidth = 2;
      context2d.stroke();

      context2d.fillStyle = "#111a35";
      context2d.font = "bold 14px Segoe UI";
      context2d.textAlign = "center";
      context2d.fillText(String(levelIndex + 1), point.x, point.y + 1);

      context2d.textAlign = "left";
      context2d.strokeStyle = "rgba(236, 244, 255, 0.95)";
      context2d.lineWidth = 3;
      context2d.fillStyle = "#0b1020";
      context2d.font = "bold 15px Segoe UI";
      context2d.strokeText(level.name, point.x + 24, point.y - 4);
      context2d.fillText(level.name, point.x + 24, point.y - 4);
      context2d.font = "12px Segoe UI";
      context2d.strokeText(`Speed ${level.baseSpeedMultiplier.toFixed(2)}x`, point.x + 24, point.y + 14);
      context2d.fillText(`Speed ${level.baseSpeedMultiplier.toFixed(2)}x`, point.x + 24, point.y + 14);
    }

    context2d.textAlign = "left";
  }

  function drawTokens() {
    context2d.textAlign = "center";
    context2d.textBaseline = "middle";

    for (const token of tokens) {
      const tokenRadius = token.radius || TOKEN_RADIUS;
      const isPetrified = isTokenPetrified(token);
      const isSelected = selection.firstNumber === token.symbol
        || selection.operator === token.symbol
        || selection.secondNumber === token.symbol;
      if (token.kind === "number" && spriteAssets.gemTokenLoaded) {
        const drawSize = tokenRadius * 2.42;
        context2d.drawImage(
          spriteAssets.gemToken,
          token.x - drawSize / 2,
          token.y - drawSize / 2,
          drawSize,
          drawSize,
        );
      } else {
        context2d.fillStyle = token.kind === "number" ? "#3a7dff" : "#ffaf4d";
        context2d.beginPath();
        context2d.arc(token.x, token.y, tokenRadius, 0, Math.PI * 2);
        context2d.fill();
      }

      if (token.kind === "operator") {
        context2d.strokeStyle = isSelected ? "#ffffff" : "#0f1433";
        context2d.lineWidth = isSelected ? 4 : 2.5;
        context2d.beginPath();
        context2d.arc(token.x, token.y, tokenRadius, 0, Math.PI * 2);
        context2d.stroke();
      } else if (isSelected) {
        context2d.strokeStyle = "#ffffff";
        context2d.lineWidth = 4;
        context2d.beginPath();
        context2d.arc(token.x, token.y, tokenRadius + 2, 0, Math.PI * 2);
        context2d.stroke();
      }

      if (isPetrified) {
        context2d.save();
        context2d.globalAlpha = 0.84;
        context2d.fillStyle = "#8b93a6";
        context2d.beginPath();
        context2d.arc(token.x, token.y, tokenRadius + 1, 0, Math.PI * 2);
        context2d.fill();
        context2d.strokeStyle = "#dde4f0";
        context2d.lineWidth = 2.5;
        context2d.beginPath();
        context2d.arc(token.x, token.y, tokenRadius + 1, 0, Math.PI * 2);
        context2d.stroke();
        context2d.strokeStyle = "#5f6778";
        context2d.lineWidth = 2;
        context2d.beginPath();
        context2d.moveTo(token.x - tokenRadius * 0.45, token.y - tokenRadius * 0.25);
        context2d.lineTo(token.x - tokenRadius * 0.1, token.y + tokenRadius * 0.05);
        context2d.lineTo(token.x - tokenRadius * 0.25, token.y + tokenRadius * 0.42);
        context2d.moveTo(token.x + tokenRadius * 0.15, token.y - tokenRadius * 0.48);
        context2d.lineTo(token.x + tokenRadius * 0.05, token.y - tokenRadius * 0.05);
        context2d.lineTo(token.x + tokenRadius * 0.32, token.y + tokenRadius * 0.28);
        context2d.stroke();
        context2d.restore();
      }

      const displaySymbol = formatOperator(token.symbol);
      const symbolFontSize = Math.max(16, Math.round(tokenRadius * 0.58));
      context2d.font = `bold ${symbolFontSize}px Segoe UI`;
      context2d.strokeStyle = isPetrified ? "#edf2fa" : "#dce7ff";
      context2d.lineWidth = 3;
      context2d.strokeText(displaySymbol, token.x, token.y + 1);
      context2d.fillStyle = isPetrified ? "#5b6271" : "#0a1538";
      context2d.fillText(displaySymbol, token.x, token.y + 1);

      if (isPetrified) {
        context2d.fillStyle = "#eef2f8";
        context2d.font = `bold ${Math.max(8, Math.round(tokenRadius * 0.3))}px Segoe UI`;
        context2d.fillText("STONE", token.x, token.y + tokenRadius * 1.15);
      }
    }

    context2d.textAlign = "start";
    context2d.textBaseline = "alphabetic";
  }

  function drawSelectionSlots() {
    context2d.textAlign = "center";
    context2d.textBaseline = "middle";

    const tokenLayout = getTokenUiLayout();
    const slotY = tokenLayout.slotY;
    const slotWidth = tokenLayout.slotWidth;
    const slotHeight = tokenLayout.slotHeight;
    const slotGap = tokenLayout.slotGap;
    const slotStartX = tokenLayout.slotStartX;
    const slotValues = [selection.firstNumber, selection.operator, selection.secondNumber];
    const slotLabels = ["A", "Op", "B"];

    for (let slotIndex = 0; slotIndex < 3; slotIndex += 1) {
      const currentX = slotStartX + slotIndex * (slotWidth + slotGap);
      context2d.fillStyle = "#2c3567";
      context2d.fillRect(currentX, slotY, slotWidth, slotHeight);
      context2d.strokeStyle = "#6f82d8";
      context2d.lineWidth = 2;
      context2d.strokeRect(currentX, slotY, slotWidth, slotHeight);

      context2d.fillStyle = "#9fb0f7";
      context2d.font = tokenLayout.isTouchLayout ? "15px Segoe UI" : "12px Segoe UI";
      context2d.fillText(slotLabels[slotIndex], currentX + slotWidth / 2, slotY + 10);

      context2d.fillStyle = "#ffffff";
      context2d.font = tokenLayout.isTouchLayout ? "bold 40px Segoe UI" : "bold 24px Segoe UI";
      context2d.fillText(
        slotValues[slotIndex] ?? "?",
        currentX + slotWidth / 2,
        slotY + (tokenLayout.isTouchLayout ? 44 : 30),
      );
    }

    context2d.fillStyle = "#cdd7ff";
    context2d.font = tokenLayout.isTouchLayout ? "18px Segoe UI" : "13px Segoe UI";
    context2d.fillText(
      operationMode === "multiply"
        ? (isChainLightningUnlocked()
          ? "Number(s) → × → Number(s) (results above 30 chain)"
          : "Number(s) → × → Number")
        : operationMode === "divide"
          ? (isChainLightningUnlocked()
            ? "Number(s) → ÷ → Number(s) (divisor 4+ chains, whole results only)"
            : "Number(s) → ÷ → Number (whole results only)")
          : canUseExpandedSecondOperand()
            ? "Large spell: first number > 10, second number can use 2 digits, press Enter/Cast"
            : "Number(s) → Operator → Number",
      tokenLayout.equationPanelX + 16,
      tokenLayout.equationPanelY + (tokenLayout.isTouchLayout
        ? tokenLayout.equationPanelHeight - 18
        : 132),
    );

    context2d.textAlign = "start";
    context2d.textBaseline = "alphabetic";
  }

  function drawMageTowerPuzzle() {
    if (!isMageTowerUnlocked() || sceneMode !== "game") {
      return;
    }

    ensureMageTowerPuzzle();
    const puzzleLayout = getMageTowerPuzzleLayout();

    context2d.save();
    context2d.fillStyle = "rgba(15, 24, 56, 0.78)";
    context2d.strokeStyle = towerPuzzle.isFocused ? "#ffd57a" : "rgba(145, 194, 255, 0.85)";
    context2d.lineWidth = 1.5;
    context2d.fillRect(
      puzzleLayout.panelX,
      puzzleLayout.panelY,
      puzzleLayout.panelWidth,
      puzzleLayout.panelHeight,
    );
    context2d.strokeRect(
      puzzleLayout.panelX,
      puzzleLayout.panelY,
      puzzleLayout.panelWidth,
      puzzleLayout.panelHeight,
    );

    context2d.fillStyle = "#e9f2ff";
    context2d.font = `${Math.max(6, Math.round(7 * getGameScale()))}px Segoe UI`;
    context2d.textAlign = "left";
    context2d.fillText(
      "Mage Tower",
      puzzleLayout.panelX + 8 * getGameScale(),
      puzzleLayout.panelY + 8 * getGameScale(),
    );

    context2d.font = `bold ${Math.max(8, Math.round(9 * getGameScale()))}px Segoe UI`;
    context2d.fillText(
      towerPuzzle.expressionText,
      puzzleLayout.panelX + 8 * getGameScale(),
      puzzleLayout.panelY + 20 * getGameScale(),
    );

    context2d.strokeStyle = towerPuzzle.isFocused ? "#ffd57a" : "#7fc2ff";
    context2d.lineWidth = 1.5;
    context2d.strokeRect(
      puzzleLayout.answerX,
      puzzleLayout.answerY,
      puzzleLayout.answerWidth,
      puzzleLayout.answerHeight,
    );

    context2d.textAlign = "center";
    context2d.font = `bold ${Math.max(8, Math.round(9 * getGameScale()))}px Segoe UI`;
    context2d.fillStyle = towerPuzzle.answerText ? "#ffffff" : "#b1c1e6";
    context2d.fillText(
      towerPuzzle.answerText || (towerPuzzle.isFocused ? "_" : "?"),
      puzzleLayout.answerX + puzzleLayout.answerWidth / 2,
      puzzleLayout.answerY + puzzleLayout.answerHeight / 2 + 1,
    );

    context2d.restore();
  }

  function drawEnemies() {
    context2d.textAlign = "center";
    context2d.textBaseline = "middle";
    const gameScale = getGameScale();

    for (const enemy of enemies) {
      const laneY = lanes[enemy.lane].y;

      const animationDefinition = getEnemyAnimationDef(enemy);
      const animatedImage = spriteAssets.enemyAnimations[enemy.type]
        ? spriteAssets.enemyAnimations[enemy.type][enemy.state]
        : null;
      const shouldFlipSprite = enemy.type === "orc"
        || enemy.type === "zombie"
        || enemy.type === "minotaur"
        || enemy.type === "medusa"
        || enemy.type === "skeleton";
      const drawFilter = enemy.drawFilter || "none";

      if (
        animationDefinition
        && animatedImage
        && animatedImage.complete
        && animatedImage.naturalWidth > 0
      ) {
        const frameWidth = Math.floor(animatedImage.width / animationDefinition.frameCount);
        const frameHeight = animatedImage.height;
        const sourceFrame = Math.min(
          animationDefinition.frameCount - 1,
          enemy.animationFrame,
        );
        const drawSize = 74 * gameScale * (enemy.sizeScale || 1);

        drawEnemySprite({
          image: animatedImage,
          sourceX: sourceFrame * frameWidth,
          sourceY: 0,
          sourceWidth: frameWidth,
          sourceHeight: frameHeight,
          destinationX: enemy.x - drawSize / 2,
          destinationY: laneY - drawSize / 2,
          destinationWidth: drawSize,
          destinationHeight: drawSize,
          flipHorizontally: shouldFlipSprite,
          tintColor: enemy.tintColor,
          drawFilter,
        });
      } else {
        const enemyImage = spriteAssets.enemyImages[enemy.type];
        if (enemyImage && enemyImage.complete && enemyImage.naturalWidth > 0) {
          const drawSize = 64 * gameScale * (enemy.sizeScale || 1);
          drawEnemySprite({
            image: enemyImage,
            sourceX: 0,
            sourceY: 0,
            sourceWidth: enemyImage.naturalWidth,
            sourceHeight: enemyImage.naturalHeight,
            destinationX: enemy.x - drawSize / 2,
            destinationY: laneY - drawSize / 2,
            destinationWidth: drawSize,
            destinationHeight: drawSize,
            flipHorizontally: shouldFlipSprite,
            tintColor: enemy.tintColor,
            drawFilter,
          });
        } else {
          context2d.fillStyle = enemy.color;
          context2d.beginPath();
          context2d.arc(enemy.x, laneY, ENEMY_RADIUS, 0, Math.PI * 2);
          context2d.fill();

          context2d.strokeStyle = "#0d1022";
          context2d.lineWidth = 2;
          context2d.stroke();
        }
      }

      if (enemy.state === "dead") {
        continue;
      }

      const badgeOffsetX = 30 * gameScale;
      const badgeOffsetY = 16 * gameScale;
      const badgeRadius = 16 * gameScale;
      context2d.beginPath();
      context2d.arc(enemy.x + badgeOffsetX, laneY - badgeOffsetY, badgeRadius, 0, Math.PI * 2);
      context2d.fillStyle = "rgba(20, 24, 44, 0.75)";
      context2d.fill();
      context2d.strokeStyle = "#ffffff";
      context2d.lineWidth = 2 * gameScale;
      context2d.stroke();

      context2d.fillStyle = "#ffffff";
      context2d.font = `bold ${Math.max(12, Math.round(17 * gameScale))}px Segoe UI`;
      context2d.fillText(String(enemy.target), enemy.x + badgeOffsetX, laneY - badgeOffsetY);

      context2d.fillStyle = "#ffffff";
      context2d.font = `${Math.max(10, Math.round(12 * gameScale))}px Segoe UI`;
      context2d.fillText(`${enemy.name} HP:${enemy.hp}`, enemy.x, laneY - 34 * gameScale);

      if (enemy.shieldFlashTimer > 0) {
        const flashAlpha = enemy.shieldFlashTimer / SHIELD_FLASH_DURATION_SECONDS;
        const shieldSize = 70 * gameScale * Math.max(1, enemy.sizeScale || 1);
        const shieldY = laneY - shieldSize * 0.55;
        if (spriteAssets.shieldFlashLoaded) {
          context2d.save();
          context2d.globalAlpha = Math.max(0.35, flashAlpha);
          context2d.drawImage(
            spriteAssets.shieldFlash,
            enemy.x - shieldSize / 2,
            shieldY - shieldSize / 2,
            shieldSize,
            shieldSize,
          );
          context2d.restore();
        } else {
          context2d.save();
          context2d.globalAlpha = Math.max(0.35, flashAlpha);
          context2d.strokeStyle = "#9bd4ff";
          context2d.lineWidth = 4 * gameScale;
          context2d.beginPath();
          context2d.arc(enemy.x, shieldY, shieldSize * 0.36, 0, Math.PI * 2);
          context2d.stroke();
          context2d.restore();
        }
      }

      if (enemy.equationShield && enemy.lastUsedEquationText) {
        context2d.fillStyle = "#ffe7a8";
        context2d.font = `${Math.max(10, Math.round(11 * gameScale))}px Segoe UI`;
        context2d.fillText(enemy.lastUsedEquationText, enemy.x, laneY + 44 * gameScale);
      }
    }

    context2d.textAlign = "start";
    context2d.textBaseline = "alphabetic";
  }

  function drawTowerGroundFlames() {
    for (const groundFlame of towerGroundFlames) {
      const frameImage = getTowerGroundFrame(groundFlame.frame);
      const laneY = lanes[groundFlame.lane].y;
      const alpha = Math.max(0, groundFlame.ttl / groundFlame.duration);

      if (frameImage && frameImage.complete && frameImage.naturalWidth > 0) {
        context2d.save();
        context2d.globalAlpha = alpha;
        context2d.drawImage(
          frameImage,
          groundFlame.x - groundFlame.drawWidth / 2,
          laneY + 14,
          groundFlame.drawWidth,
          groundFlame.drawHeight,
        );
        context2d.restore();
      }
    }
  }

  function drawTowerProjectiles() {
    for (const projectile of towerProjectiles) {
      const frameImage = getTowerProjectileFrame(projectile.frame);
      if (!frameImage || !frameImage.complete || frameImage.naturalWidth <= 0) {
        continue;
      }

      const laneY = lanes[projectile.lane].y;
      context2d.drawImage(
        frameImage,
        projectile.x,
        laneY - projectile.drawHeight * 0.58,
        projectile.drawWidth,
        projectile.drawHeight,
      );
    }
  }

  function drawEffects() {
    for (const effect of hitEffects) {
      const progressRatio = 1 - Math.max(0, effect.ttl) / effect.duration;
      const clampedProgress = Math.max(0, Math.min(1, progressRatio));

      if (spriteAssets.explosionLoaded) {
        const frameIndex = Math.min(
          EXPLOSION_FRAME_COUNT - 1,
          Math.floor(clampedProgress * EXPLOSION_FRAME_COUNT),
        );

        const frameWidth = Math.floor(
          spriteAssets.explosionSheet.width / EXPLOSION_SHEET_COLUMNS,
        );
        const frameHeight = Math.floor(
          spriteAssets.explosionSheet.height / EXPLOSION_SHEET_ROWS,
        );
        const sourceColumn = frameIndex % EXPLOSION_SHEET_COLUMNS;
        const sourceRow = Math.floor(frameIndex / EXPLOSION_SHEET_COLUMNS);
        const drawSize = 86;

        context2d.drawImage(
          spriteAssets.explosionSheet,
          sourceColumn * frameWidth,
          sourceRow * frameHeight,
          frameWidth,
          frameHeight,
          effect.x - drawSize / 2,
          effect.y - drawSize / 2,
          drawSize,
          drawSize,
        );
      } else {
        const alpha = Math.max(0, effect.ttl / effect.duration);
        context2d.strokeStyle = `rgba(255, 170, 80, ${alpha})`;
        context2d.lineWidth = 4;
        context2d.beginPath();
        context2d.arc(effect.x, effect.y, 30 * (1 - alpha) + 10, 0, Math.PI * 2);
        context2d.stroke();
      }
    }

    context2d.save();
    context2d.textAlign = "center";
    context2d.textBaseline = "middle";
    for (const effect of levelUpEffects) {
      const alpha = Math.max(0, effect.ttl / effect.duration);
      context2d.globalAlpha = alpha;
      context2d.font = "bold 34px Segoe UI";
      context2d.lineWidth = 5;
      context2d.strokeStyle = "rgba(12, 22, 56, 0.9)";
      context2d.strokeText("Level Up!", effect.x, effect.y - 18);
      context2d.fillStyle = "#f8f6a0";
      context2d.fillText("Level Up!", effect.x, effect.y - 18);
      context2d.font = "bold 26px Segoe UI";
      context2d.strokeText(effect.text, effect.x, effect.y + 16);
      context2d.fillStyle = "#78d6ff";
      context2d.fillText(effect.text, effect.x, effect.y + 16);
    }
    context2d.restore();
  }

  function drawProjectiles() {
    for (const projectile of activeProjectiles) {
      const progressRatio = 1 - Math.max(0, projectile.ttl) / projectile.duration;
      const clampedProgress = Math.max(0, Math.min(1, progressRatio));
      const drawX = projectile.fromX + (projectile.toX - projectile.fromX) * clampedProgress;
      const drawY = projectile.fromY + (projectile.toY - projectile.fromY) * clampedProgress;

      if (spriteAssets.fireballLoaded) {
        const frameIndex = Math.min(
          FIREBALL_FRAME_COUNT - 1,
          Math.floor(clampedProgress * FIREBALL_FRAME_COUNT),
        );
        const frameWidth = Math.floor(
          spriteAssets.fireballSheet.width / FIREBALL_SHEET_COLUMNS,
        );
        const frameHeight = Math.floor(
          spriteAssets.fireballSheet.height / FIREBALL_SHEET_ROWS,
        );
        const sourceColumn = frameIndex % FIREBALL_SHEET_COLUMNS;
        const sourceRow = Math.floor(frameIndex / FIREBALL_SHEET_COLUMNS);
        const drawSize = 56;

        context2d.drawImage(
          spriteAssets.fireballSheet,
          sourceColumn * frameWidth,
          sourceRow * frameHeight,
          frameWidth,
          frameHeight,
          drawX - drawSize / 2,
          drawY - drawSize / 2,
          drawSize,
          drawSize,
        );
      } else {
        context2d.fillStyle = "#ff9f43";
        context2d.beginPath();
        context2d.arc(drawX, drawY, 10, 0, Math.PI * 2);
        context2d.fill();
      }
    }
  }

  function drawLightningEffects() {
    for (const effect of lightningEffects) {
      const progressRatio = 1 - Math.max(0, effect.ttl) / effect.duration;
      const clampedProgress = Math.max(0, Math.min(1, progressRatio));

      if (spriteAssets.lightningLoaded) {
        const frameIndex = Math.min(
          LIGHTNING_FRAME_COUNT - 1,
          Math.floor(clampedProgress * LIGHTNING_FRAME_COUNT),
        );
        const frameWidth = Math.floor(spriteAssets.lightningSheet.width / LIGHTNING_FRAME_COUNT);
        const frameHeight = spriteAssets.lightningSheet.height;
        const drawWidth = 86;
        const drawHeight = 120;

        context2d.drawImage(
          spriteAssets.lightningSheet,
          frameIndex * frameWidth,
          0,
          frameWidth,
          frameHeight,
          effect.x - drawWidth / 2,
          effect.y - drawHeight / 2,
          drawWidth,
          drawHeight,
        );
      } else {
        context2d.strokeStyle = "rgba(180, 220, 255, 0.9)";
        context2d.lineWidth = 5;
        context2d.beginPath();
        context2d.moveTo(effect.x, effect.y - 40);
        context2d.lineTo(effect.x - 10, effect.y);
        context2d.lineTo(effect.x + 8, effect.y + 30);
        context2d.stroke();
      }
    }
  }

  function drawChainLightningEffects() {
    for (const effect of chainLightningEffects) {
      const alpha = Math.max(0, effect.ttl / effect.duration);
      const wavePhase = 1 - alpha;

      for (let segmentIndex = 0; segmentIndex < effect.points.length - 1; segmentIndex += 1) {
        const startPoint = effect.points[segmentIndex];
        const endPoint = effect.points[segmentIndex + 1];
        const deltaX = endPoint.x - startPoint.x;
        const deltaY = endPoint.y - startPoint.y;

        context2d.save();
        context2d.strokeStyle = `rgba(116, 220, 255, ${alpha * 0.45})`;
        context2d.lineWidth = 8;
        context2d.beginPath();
        context2d.moveTo(startPoint.x, startPoint.y);
        for (let pointIndex = 1; pointIndex <= 6; pointIndex += 1) {
          const t = pointIndex / 6;
          const waveOffset = Math.sin((t * 10) + (wavePhase * 14) + segmentIndex) * 12;
          const x = startPoint.x + deltaX * t;
          const y = startPoint.y + deltaY * t + waveOffset;
          context2d.lineTo(x, y);
        }
        context2d.stroke();

        context2d.strokeStyle = `rgba(238, 248, 255, ${alpha * 0.95})`;
        context2d.lineWidth = 3;
        context2d.stroke();
        context2d.restore();
      }
    }
  }

  function drawEndOverlay() {
    if (gameResult === "running") {
      return;
    }

    context2d.fillStyle = "rgba(0, 0, 0, 0.55)";
    context2d.fillRect(0, 0, canvas.width, canvas.height);

    context2d.textAlign = "center";
    context2d.fillStyle = gameResult === "victory" ? "#90f4a3" : "#ff7a7a";
    context2d.font = "bold 54px Segoe UI";
    context2d.fillText(gameResult === "victory" ? "VICTORY" : "DEFEAT", canvas.width / 2, canvas.height / 2 - 12);

    context2d.fillStyle = "#f0f3ff";
    context2d.font = "22px Segoe UI";
    context2d.fillText("Press Reset to play again", canvas.width / 2, canvas.height / 2 + 34);

    context2d.textAlign = "start";
  }

  function render() {
    if (sceneMode === "map") {
      drawWorldMapScene();
      return;
    }

    drawBackground();
    drawSelectionSlots();
    drawTokens();
    drawTowerGroundFlames();
    drawEnemies();
    drawTowerProjectiles();
    drawProjectiles();
    drawLightningEffects();
    drawChainLightningEffects();
    drawEffects();
    drawEndOverlay();
  }

  let previousTimestampMs = performance.now();

  function frameLoop(currentTimestampMs) {
    const elapsedMs = currentTimestampMs - previousTimestampMs;
    previousTimestampMs = currentTimestampMs;

    const deltaSeconds = Math.min(0.05, elapsedMs / 1000);

    updateSpellUnlockAnimation(deltaSeconds);
    updateGameState(deltaSeconds);
    render();
    renderSpellUnlockOverlay();

    requestAnimationFrame(frameLoop);
  }

  canvas.addEventListener("click", onCanvasClick);
  window.addEventListener("keydown", onKeyboardInput);

  canvas.addEventListener("touchstart", (event) => {
    event.preventDefault();
    if (event.touches.length > 0) {
      onCanvasClick(event.touches[0]);
    }
  }, { passive: false });

  resetButtonElement.addEventListener("click", () => {
    if (sceneMode === "map") {
      startLevel(currentLevelIndex);
      return;
    }
    resetGame();
  });

  backToMapButtonElement.addEventListener("click", () => {
    if (sceneMode !== "game") {
      return;
    }
    returnToWorldMap();
  });

  pauseButtonElement.addEventListener("click", () => {
    if (sceneMode !== "game") {
      return;
    }
    if (gameResult !== "running") {
      return;
    }
    setPauseState(!isPaused);
  });

  clearEquationButtonElement.addEventListener("click", () => {
    if (sceneMode !== "game") {
      return;
    }
    clearEquationSelection();
  });

  castSpellButtonElement.addEventListener("click", () => {
    if (sceneMode !== "game" || gameResult !== "running") {
      return;
    }
    if (towerPuzzle.isFocused) {
      submitMageTowerAnswer();
      return;
    }
    tryCastCurrentEquation();
  });

  unlockLevelsButtonElement.addEventListener("click", () => {
    highestUnlockedLevel = LEVELS.length - 1;
    castResultElement.textContent = "Debug: all levels unlocked.";
    castResultElement.classList.remove("bad");
    castResultElement.classList.add("ok");
  });

  debugGrantXpButtonElement.addEventListener("click", () => {
    awardXp(XP_PER_LEVEL);
    castResultElement.textContent = `Debug: gained ${XP_PER_LEVEL} XP.`;
    castResultElement.classList.remove("bad");
    castResultElement.classList.add("ok");
  });

  debugResetProgressButtonElement.addEventListener("click", () => {
    resetCurrentProfileProgress();
    castResultElement.textContent = "Debug: progression reset for this profile.";
    castResultElement.classList.remove("bad");
    castResultElement.classList.add("ok");
  });

  closeDebugMenuButtonElement.addEventListener("click", () => {
    setDebugMenuOpen(false);
  });

  appTitleElement.addEventListener("pointerdown", startTitleDebugPress);
  appTitleElement.addEventListener("pointerup", cancelTitleDebugPress);
  appTitleElement.addEventListener("pointerleave", cancelTitleDebugPress);
  appTitleElement.addEventListener("pointercancel", cancelTitleDebugPress);

  profileSelectElement.addEventListener("change", () => {
    const selectedProfile = saveData.profiles.find((profile) => profile.id === profileSelectElement.value);
    if (!selectedProfile) {
      return;
    }
    applyProfile(selectedProfile, `Loaded profile ${selectedProfile.name}.`);
  });

  newProfileButtonElement.addEventListener("click", () => {
    createProfile();
  });

  operationModeElement.addEventListener("change", () => {
    operationMode = operationModeElement.value;
    resetMageTowerPuzzle();
    createSelectionTokens();
    clearEquationSelection();
    rerollEnemyTargetsForCurrentMode();
    ensureMageTowerPuzzle();
    updateSpeedDisplay();
    syncCurrentProfileSave();
  });

  loadSprites();
  setupSpeedSlider();
  initializeSaveSystem();
  updateDebugButtonText();
  setDebugMenuOpen(false);
  updateProgressionHud();
  requestAnimationFrame(frameLoop);
})();
