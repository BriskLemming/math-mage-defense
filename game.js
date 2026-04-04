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
  const MAP_GUIDE_PULSE_SECONDS = 1.4;
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

  const localizationFactory = window.MathMageLocalization;
  if (!localizationFactory || typeof localizationFactory.createLocalization !== "function") {
    throw new Error("MathMageLocalization failed to load.");
  }

  const {
    activeLocale,
    t,
    getLevelDisplayName,
    getEnemyDisplayName,
  } = localizationFactory.createLocalization();
  const gameDataFactory = window.MathMageGameData;
  if (!gameDataFactory || typeof gameDataFactory.createGameData !== "function") {
    throw new Error("MathMageGameData failed to load.");
  }

  const {
    LEGACY_PROFILE_ID_ALIASES,
    BATTLEFIELD_THEME_DEFAULT,
    BATTLEFIELD_THEME_MYSTIC_FOREST,
    BATTLEFIELD_THEME_CRYSTAL_HIGHLIGHT,
    BATTLEFIELD_THEME_VOLCANO,
    BATTLEFIELD_THEME_DARK_CASTLE,
    ENEMY_DEFS,
    LEVELS,
  } = gameDataFactory.createGameData({
    zombieScreamMinInterval: ZOMBIE_SCREAM_MIN_INTERVAL,
    zombieScreamMaxInterval: ZOMBIE_SCREAM_MAX_INTERVAL,
    medusaSpecialMinInterval: MEDUSA_SPECIAL_MIN_INTERVAL,
    medusaSpecialMaxInterval: MEDUSA_SPECIAL_MAX_INTERVAL,
  });

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

  function applyLocalizedStaticText() {
    const topBarElement = document.querySelector(".game-top-bar");
    const bottomBarElement = document.querySelector(".game-bottom-bar");
    const xpBarElement = document.querySelector(".xp-bar");
    const profileLabelElement = document.querySelector('label[for="profileSelect"] strong');
    const modeLabelElement = document.querySelector('label[for="operationMode"] strong');
    const speedLabelElement = document.querySelector('label[for="speedSlider"] strong');
    const debugTitleElement = document.querySelector(".debug-menu-header h2");
    const debugCopyElement = document.querySelector(".debug-menu-copy");
    const hpLabelElement = castleHpElement?.parentElement?.querySelector("strong");
    const waveHudLabelElement = waveLabelElement?.parentElement?.querySelector("strong");
    const statusHudLabelElement = statusLabelElement?.parentElement?.querySelector("strong");
    const levelHudLabelElement = playerLevelElement?.parentElement?.querySelector("strong");
    const spellHudLabelElement = spellStatusElement?.parentElement?.querySelector("strong");
    const equationHudLabelElement = equationTextElement?.parentElement?.querySelector("strong");
    const castHudLabelElement = castResultElement?.parentElement?.querySelector("strong");

    document.documentElement.lang = activeLocale;
    document.title = t("pageTitle");
    canvas.setAttribute("aria-label", t("canvasAria"));
    topBarElement?.setAttribute("aria-label", t("topBarAria"));
    bottomBarElement?.setAttribute("aria-label", t("bottomBarAria"));
    xpBarElement?.setAttribute("aria-label", t("xpAria"));
    appTitleElement.textContent = t("appTitle");

    if (hpLabelElement) {
      hpLabelElement.textContent = t("hudHp");
    }
    if (waveHudLabelElement) {
      waveHudLabelElement.textContent = t("hudWave");
    }
    if (statusHudLabelElement) {
      statusHudLabelElement.textContent = t("hudStatus");
    }
    if (levelHudLabelElement) {
      levelHudLabelElement.textContent = t("hudLevelShort");
    }
    if (spellHudLabelElement) {
      spellHudLabelElement.textContent = t("hudSpell");
    }
    if (equationHudLabelElement) {
      equationHudLabelElement.textContent = t("equationLabel");
    }
    if (castHudLabelElement) {
      castHudLabelElement.textContent = t("lastCastLabel");
    }
    if (profileLabelElement) {
      profileLabelElement.textContent = t("profileLabel");
    }
    if (modeLabelElement) {
      modeLabelElement.textContent = t("modeLabel");
    }
    if (speedLabelElement) {
      speedLabelElement.textContent = t("speedLabel");
    }
    if (debugTitleElement) {
      debugTitleElement.textContent = t("debugMenuTitle");
    }
    if (debugCopyElement) {
      debugCopyElement.textContent = t("debugCopy");
    }

    resetButtonElement.textContent = t("resetButton");
    backToMapButtonElement.textContent = t("mapButton");
    pauseButtonElement.textContent = t("pauseButton");
    clearEquationButtonElement.textContent = t("clearButton");
    castSpellButtonElement.textContent = t("castButton");
    newProfileButtonElement.textContent = t("newButton");
    closeDebugMenuButtonElement.textContent = t("debugClose");
    unlockLevelsButtonElement.textContent = t("debugUnlockLevels");
    debugResetProgressButtonElement.textContent = t("debugResetProgress");

    operationModeElement.querySelector('option[value="add-sub"]').textContent = t("modeAddSub");
    operationModeElement.querySelector('option[value="multiply"]').textContent = t("modeMultiply");
    operationModeElement.querySelector('option[value="divide"]').textContent = t("modeDivide");
  }

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

  const runtime = {
    window,
    document,
    t,
    LEVELS,
    ENEMY_DEFS,
    LEGACY_PROFILE_ID_ALIASES,
    SAVE_STORAGE_KEY,
    SAVE_DATA_VERSION,
    XP_PER_LEVEL,
    CHAIN_LIGHTNING_UNLOCK_LEVEL,
    MAGE_TOWER_UNLOCK_LEVEL,
    SPELL_CHAIN_LIGHTNING,
    SPELL_MAGE_TOWER,
    SPELL_UNLOCK_OVERLAY_DURATION_SECONDS,
    SPELL_UNLOCK_EFFECT_FRAME_COUNT,
    SPELL_UNLOCK_EFFECT_FPS,
    TITLE_DEBUG_HOLD_MS,
    DEBUG_SEQUENCE,
    DEBUG_SEQUENCE_TIMEOUT_MS,
    LEVEL_UP_EFFECT_DURATION_SECONDS,
    PETRIFIED_TOKEN_DURATION_SECONDS,
    CHAIN_LIGHTNING_TARGET_BIAS_CHANCE,
    CHAIN_LIGHTNING_MULTIPLY_RESULT_THRESHOLD,
    CHAIN_LIGHTNING_DIVIDE_SECOND_OPERAND_THRESHOLD,
    CHAIN_LIGHTNING_ADD_SUB_FIRST_OPERAND_THRESHOLD,
    SHIELD_FLASH_DURATION_SECONDS,
    BASE_GAME_HEIGHT,
    CASTLE_PANEL_WIDTH,
    CASTLE_AREA_WIDTH,
    BATTLEFIELD_START_X,
    LANE_START_X,
    LANE_COUNT,
    TOKEN_RADIUS,
    MAX_FIRST_OPERAND_DIGITS,
    MAX_SECOND_OPERAND_DIGITS,
    MAX_TOWER_ANSWER_DIGITS,
    TOWER_ATTACK_DAMAGE,
    TOWER_GLOW_DURATION_SECONDS,
    TOWER_PROJECTILE_SPEED,
    TOWER_PROJECTILE_GROUND_SPACING,
    TOWER_GROUND_DURATION_SECONDS,
    TOWER_FIRE_FRAME_COUNT,
    TOWER_GROUND_FRAME_COUNT,
    TOWER_FIRE_FPS,
    TOWER_GROUND_FPS,
    TOWER_FIRE_LOOP_START_FRAME,
    TOWER_FIRE_LOOP_END_FRAME,
    PROJECTILE_TRAVEL_SECONDS,
    LIGHTNING_DURATION_SECONDS,
    CHAIN_LIGHTNING_EFFECT_DURATION_SECONDS,
    EXPLOSION_DURATION_SECONDS,
    canvas,
    context2d,
    spriteAssets,
    enemyTintCanvas,
    enemyTintContext,
    spellUnlockEffectContext,
    spellUnlockEffectCanvasElement,
    castleHpElement,
    waveLabelElement,
    statusLabelElement,
    appTitleElement,
    playerLevelElement,
    xpBarFillElement,
    xpTextElement,
    spellStatusElement,
    equationTextElement,
    castResultElement,
    operationModeElement,
    profileSelectElement,
    debugMenuElement,
    debugGrantXpButtonElement,
    spellUnlockOverlayElement,
    spellUnlockTitleElement,
    spellUnlockNameElement,
    spellUnlockDescriptionElement,
    get lanes() { return lanes; },
    set lanes(value) { lanes = value; },
    get tokens() { return tokens; },
    set tokens(value) { tokens = value; },
    get enemies() { return enemies; },
    set enemies(value) { enemies = value; },
    get hitEffects() { return hitEffects; },
    set hitEffects(value) { hitEffects = value; },
    get levelUpEffects() { return levelUpEffects; },
    set levelUpEffects(value) { levelUpEffects = value; },
    get activeProjectiles() { return activeProjectiles; },
    set activeProjectiles(value) { activeProjectiles = value; },
    get lightningEffects() { return lightningEffects; },
    set lightningEffects(value) { lightningEffects = value; },
    get chainLightningEffects() { return chainLightningEffects; },
    set chainLightningEffects(value) { chainLightningEffects = value; },
    get towerProjectiles() { return towerProjectiles; },
    set towerProjectiles(value) { towerProjectiles = value; },
    get towerGroundFlames() { return towerGroundFlames; },
    set towerGroundFlames(value) { towerGroundFlames = value; },
    get gameResult() { return gameResult; },
    set gameResult(value) { gameResult = value; },
    get speedMultiplier() { return speedMultiplier; },
    set speedMultiplier(value) { speedMultiplier = value; },
    get operationMode() { return operationMode; },
    set operationMode(value) { operationMode = value; },
    get sceneMode() { return sceneMode; },
    set sceneMode(value) { sceneMode = value; },
    get currentLevelIndex() { return currentLevelIndex; },
    set currentLevelIndex(value) { currentLevelIndex = value; },
    get highestUnlockedLevel() { return highestUnlockedLevel; },
    set highestUnlockedLevel(value) { highestUnlockedLevel = value; },
    get completedLevelIndices() { return completedLevelIndices; },
    set completedLevelIndices(value) { completedLevelIndices = value; },
    get currentLevelWavePlan() { return currentLevelWavePlan; },
    set currentLevelWavePlan(value) { currentLevelWavePlan = value; },
    get levelBaseSpeedMultiplier() { return levelBaseSpeedMultiplier; },
    set levelBaseSpeedMultiplier(value) { levelBaseSpeedMultiplier = value; },
    get petrifiedTokenId() { return petrifiedTokenId; },
    set petrifiedTokenId(value) { petrifiedTokenId = value; },
    get petrifiedTokenTimer() { return petrifiedTokenTimer; },
    set petrifiedTokenTimer(value) { petrifiedTokenTimer = value; },
    get playerXp() { return playerXp; },
    set playerXp(value) { playerXp = value; },
    get playerLevel() { return playerLevel; },
    set playerLevel(value) { playerLevel = value; },
    get unlockedSpells() { return unlockedSpells; },
    set unlockedSpells(value) { unlockedSpells = value; },
    get debugSequenceBuffer() { return debugSequenceBuffer; },
    set debugSequenceBuffer(value) { debugSequenceBuffer = value; },
    get lastDebugSequenceTimestampMs() { return lastDebugSequenceTimestampMs; },
    set lastDebugSequenceTimestampMs(value) { lastDebugSequenceTimestampMs = value; },
    get titleDebugPressTimer() { return titleDebugPressTimer; },
    set titleDebugPressTimer(value) { titleDebugPressTimer = value; },
    get spellUnlockWasPausedBefore() { return spellUnlockWasPausedBefore; },
    set spellUnlockWasPausedBefore(value) { spellUnlockWasPausedBefore = value; },
    get towerGlowTimer() { return towerGlowTimer; },
    set towerGlowTimer(value) { towerGlowTimer = value; },
    get isPaused() { return isPaused; },
    set isPaused(value) { isPaused = value; },
    get saveData() { return saveData; },
    set saveData(value) { saveData = value; },
    get currentProfileId() { return currentProfileId; },
    set currentProfileId(value) { currentProfileId = value; },
    selection,
    wizardAnimation,
    spellUnlockAnimation,
    towerPuzzle,
    isValidOperationMode,
    setPauseState(nextPaused) { return setPauseState(nextPaused); },
    clearEquationSelection() { return clearEquationSelection(); },
    returnToWorldMap() { return returnToWorldMap(); },
    updateSpeedDisplay() { return updateSpeedDisplay(); },
    getWizardCastOrigin() { return getWizardCastOrigin(); },
    setWizardAnimation(nextState) { return setWizardAnimation(nextState); },
    setEnemyState(enemy, nextState) { return setEnemyState(enemy, nextState); },
    clearPetrifiedToken() { return clearPetrifiedToken(); },
    createSelectionTokens() { return createSelectionTokens(); },
    isChainLightningUnlocked() { return isChainLightningUnlocked(); },
    isMageTowerUnlocked() { return isMageTowerUnlocked(); },
    awardXp(amount) { return awardXp(amount); },
  };

  function setPauseState(nextPaused) {
    isPaused = Boolean(nextPaused);
    pauseButtonElement.textContent = isPaused ? t("resumeButton") : t("pauseButton");

    if (sceneMode !== "game") {
      return;
    }
    if (gameResult === "running") {
      statusLabelElement.textContent = isPaused ? t("statusPaused") : t("statusRunning");
    }
  }

  function isValidOperationMode(modeValue) {
    return modeValue === "add-sub" || modeValue === "multiply" || modeValue === "divide";
  }

  const stateFactory = window.MathMageState;
  if (!stateFactory || typeof stateFactory.createStateHelpers !== "function") {
    throw new Error("MathMageState failed to load.");
  }
  const combatFactory = window.MathMageCombat;
  if (!combatFactory || typeof combatFactory.createCombatHelpers !== "function") {
    throw new Error("MathMageCombat failed to load.");
  }
  const renderFactory = window.MathMageRender;
  if (!renderFactory || typeof renderFactory.createRenderHelpers !== "function") {
    throw new Error("MathMageRender failed to load.");
  }

  const stateHelpers = stateFactory.createStateHelpers(runtime);
  const combatHelpers = combatFactory.createCombatHelpers(runtime);
  const renderHelpers = renderFactory.createRenderHelpers(runtime);

  function createDefaultProfile(...args) { return stateHelpers.createDefaultProfile(...args); }
  function createDefaultSaveData(...args) { return stateHelpers.createDefaultSaveData(...args); }
  function normalizeProfile(...args) { return stateHelpers.normalizeProfile(...args); }
  function normalizeSaveData(...args) { return stateHelpers.normalizeSaveData(...args); }
  function persistSaveData(...args) { return stateHelpers.persistSaveData(...args); }
  function loadSaveData(...args) { return stateHelpers.loadSaveData(...args); }
  function getCurrentProfile(...args) { return stateHelpers.getCurrentProfile(...args); }
  function rebuildProgressFromProfile(...args) { return stateHelpers.rebuildProgressFromProfile(...args); }
  function syncCurrentProfileSave(...args) { return stateHelpers.syncCurrentProfileSave(...args); }
  function renderProfileOptions(...args) { return stateHelpers.renderProfileOptions(...args); }
  function applyProfile(...args) { return stateHelpers.applyProfile(...args); }
  function resetCurrentProfileProgress(...args) { return stateHelpers.resetCurrentProfileProgress(...args); }
  function createProfile(...args) { return stateHelpers.createProfile(...args); }
  function initializeSaveSystem(...args) { return stateHelpers.initializeSaveSystem(...args); }
  function hasUnlockedSpell(...args) { return stateHelpers.hasUnlockedSpell(...args); }
  function setDebugMenuOpen(...args) { return stateHelpers.setDebugMenuOpen(...args); }
  function isDebugMenuOpen(...args) { return stateHelpers.isDebugMenuOpen(...args); }
  function toggleDebugMenu(...args) { return stateHelpers.toggleDebugMenu(...args); }
  function startTitleDebugPress(...args) { return stateHelpers.startTitleDebugPress(...args); }
  function cancelTitleDebugPress(...args) { return stateHelpers.cancelTitleDebugPress(...args); }
  function updateDebugButtonText(...args) { return stateHelpers.updateDebugButtonText(...args); }
  function handleDebugSequenceKey(...args) { return stateHelpers.handleDebugSequenceKey(...args); }
  function isChainLightningUnlocked(...args) { return stateHelpers.isChainLightningUnlocked(...args); }
  function isMageTowerUnlocked(...args) { return stateHelpers.isMageTowerUnlocked(...args); }
  function getSpellStatusText(...args) { return stateHelpers.getSpellStatusText(...args); }
  function updateProgressionHud(...args) { return stateHelpers.updateProgressionHud(...args); }
  function getChainLightningDescription(...args) { return stateHelpers.getChainLightningDescription(...args); }
  function getMageTowerDescription(...args) { return stateHelpers.getMageTowerDescription(...args); }
  function hideSpellUnlockOverlay(...args) { return stateHelpers.hideSpellUnlockOverlay(...args); }
  function showSpellUnlockOverlay(...args) { return stateHelpers.showSpellUnlockOverlay(...args); }
  function unlockSpell(...args) { return stateHelpers.unlockSpell(...args); }
  function awardXp(...args) { return stateHelpers.awardXp(...args); }
  function updateSpellUnlockAnimation(...args) { return stateHelpers.updateSpellUnlockAnimation(...args); }
  function renderSpellUnlockOverlay(...args) { return stateHelpers.renderSpellUnlockOverlay(...args); }

  function randomInteger(...args) { return combatHelpers.randomInteger(...args); }
  function getEnemySpecialStateDef(...args) { return combatHelpers.getEnemySpecialStateDef(...args); }
  function createEnemySpecialCooldown(...args) { return combatHelpers.createEnemySpecialCooldown(...args); }
  function clearPetrifiedToken(...args) { return combatHelpers.clearPetrifiedToken(...args); }
  function getPetrifiedToken(...args) { return combatHelpers.getPetrifiedToken(...args); }
  function isTokenPetrified(...args) { return combatHelpers.isTokenPetrified(...args); }
  function petrifyRandomToken(...args) { return combatHelpers.petrifyRandomToken(...args); }
  function getMultiplyTargetValue(...args) { return combatHelpers.getMultiplyTargetValue(...args); }
  function hasChainReadyDivideEquation(...args) { return combatHelpers.hasChainReadyDivideEquation(...args); }
  function getDivideTargetValue(...args) { return combatHelpers.getDivideTargetValue(...args); }
  function getEnemyTargetValue(...args) { return combatHelpers.getEnemyTargetValue(...args); }
  function canUseExpandedSecondOperand(...args) { return combatHelpers.canUseExpandedSecondOperand(...args); }
  function canUseTowerEquation(...args) { return combatHelpers.canUseTowerEquation(...args); }
  function getMaxSecondOperandDigits(...args) { return combatHelpers.getMaxSecondOperandDigits(...args); }
  function requiresManualCastConfirmation(...args) { return combatHelpers.requiresManualCastConfirmation(...args); }
  function getDifferentEnemyTargetValue(...args) { return combatHelpers.getDifferentEnemyTargetValue(...args); }
  function rerollEnemyTargetsForCurrentMode(...args) { return combatHelpers.rerollEnemyTargetsForCurrentMode(...args); }
  function buildEquationKey(...args) { return combatHelpers.buildEquationKey(...args); }
  function canUseEquationOnEnemy(...args) { return combatHelpers.canUseEquationOnEnemy(...args); }
  function reserveEquationForEnemy(...args) { return combatHelpers.reserveEquationForEnemy(...args); }
  function releaseEquationReservation(...args) { return combatHelpers.releaseEquationReservation(...args); }
  function finalizeEquationOnEnemy(...args) { return combatHelpers.finalizeEquationOnEnemy(...args); }
  function triggerEquationShieldFlash(...args) { return combatHelpers.triggerEquationShieldFlash(...args); }
  function getGameScale(...args) { return combatHelpers.getGameScale(...args); }
  function getEnemySpawnX(...args) { return combatHelpers.getEnemySpawnX(...args); }
  function isCoarsePointerDevice(...args) { return combatHelpers.isCoarsePointerDevice(...args); }
  function getMageTowerLayout(...args) { return combatHelpers.getMageTowerLayout(...args); }
  function getMageTowerPuzzleLayout(...args) { return combatHelpers.getMageTowerPuzzleLayout(...args); }
  function getRandomTowerOperator(...args) { return combatHelpers.getRandomTowerOperator(...args); }
  function buildMageTowerPuzzle(...args) { return combatHelpers.buildMageTowerPuzzle(...args); }
  function resetMageTowerPuzzle(...args) { return combatHelpers.resetMageTowerPuzzle(...args); }
  function ensureMageTowerPuzzle(...args) { return combatHelpers.ensureMageTowerPuzzle(...args); }
  function getMageTowerTargetLane(...args) { return combatHelpers.getMageTowerTargetLane(...args); }
  function addTowerGroundFlame(...args) { return combatHelpers.addTowerGroundFlame(...args); }
  function launchMageTowerAttack(...args) { return combatHelpers.launchMageTowerAttack(...args); }
  function advanceTowerProjectileFrame(...args) { return combatHelpers.advanceTowerProjectileFrame(...args); }
  function updateTowerEffects(...args) { return combatHelpers.updateTowerEffects(...args); }
  function getTowerProjectileFrame(...args) { return combatHelpers.getTowerProjectileFrame(...args); }
  function getTowerGroundFrame(...args) { return combatHelpers.getTowerGroundFrame(...args); }
  function submitMageTowerAnswer(...args) { return combatHelpers.submitMageTowerAnswer(...args); }
  function buildTintedSpriteSource(...args) { return renderHelpers.buildTintedSpriteSource(...args); }
  function drawEnemySprite(...args) { return renderHelpers.drawEnemySprite(...args); }
  function getTokenUiLayout(...args) { return combatHelpers.getTokenUiLayout(...args); }
  function computeLaneYPositions(...args) { return combatHelpers.computeLaneYPositions(...args); }
  function createSelectionTokens(...args) { return combatHelpers.createSelectionTokens(...args); }
  function getOperationHintText(...args) { return combatHelpers.getOperationHintText(...args); }
  function formatOperator(...args) { return combatHelpers.formatOperator(...args); }
  function buildIndexedImageSequence(...args) { return renderHelpers.buildIndexedImageSequence(...args); }
  function loadSprites(...args) { return renderHelpers.loadSprites(...args); }

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
    castResultElement.textContent = t("enteringLevel", {
      level: getLevelDisplayName(selectedLevel),
    });
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
    statusLabelElement.textContent = t("statusMap");
    waveLabelElement.textContent = "-";
    equationTextElement.textContent = t("worldMapHint");
    castResultElement.textContent = t("startWithLevel", {
      level: getLevelDisplayName(LEVELS[getNextPlayableLevelIndex()]),
    });
    castResultElement.classList.remove("ok", "bad");
  }

  function getNextPlayableLevelIndex() {
    for (let levelIndex = 0; levelIndex <= highestUnlockedLevel; levelIndex += 1) {
      if (!completedLevelIndices.has(levelIndex)) {
        return levelIndex;
      }
    }

    return Math.min(highestUnlockedLevel, LEVELS.length - 1);
  }

  function getIslandScreenPoint(level) {
    return {
      x: level.mapPos.x * canvas.width,
      y: level.mapPos.y * canvas.height,
    };
  }

  function handleWorldMapClick(point) {
    const selectRadius = isCoarsePointerDevice() ? 44 : 30;
    for (let levelIndex = 0; levelIndex < LEVELS.length; levelIndex += 1) {
      const level = LEVELS[levelIndex];
      const islandPoint = getIslandScreenPoint(level);
      const distanceX = point.x - islandPoint.x;
      const distanceY = point.y - islandPoint.y;
      if (Math.sqrt(distanceX * distanceX + distanceY * distanceY) <= selectRadius) {
        if (levelIndex > highestUnlockedLevel) {
          castResultElement.textContent = t("levelLocked", {
            level: getLevelDisplayName(LEVELS[levelIndex - 1]),
          });
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
      name: getEnemyDisplayName(enemyType, definition.name),
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
        castResultElement.textContent = t("divisionByZero");
        return null;
      }
      if (firstNumber % secondNumber !== 0) {
        equationTextElement.textContent = `${firstNumber} ${formatOperator(selection.operator)} ${secondNumber} = invalid`;
        castResultElement.classList.remove("ok", "bad");
        castResultElement.classList.add("bad");
        castResultElement.textContent = t("divisionWhole");
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
      castResultElement.textContent = t("tokenPetrified", {
        token: formatOperator(token.symbol),
      });
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
          castResultElement.textContent = t("firstNumberLimit");
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
          castResultElement.textContent = t("secondNumberLimit", {
            digits: getMaxSecondOperandDigits(),
          });
          return;
        }
      }
    } else if (token.kind === "operator") {
      if (selection.firstNumber === null) {
        castResultElement.classList.remove("ok", "bad");
        castResultElement.classList.add("bad");
        castResultElement.textContent = t("pickNumberFirst");
        return;
      }
      selection.operator = token.symbol;
    }

    const equationResult = updateEquationPreview();
    if (equationResult) {
      if (requiresManualCastConfirmation()) {
        castResultElement.classList.remove("bad");
        castResultElement.classList.add("ok");
        castResultElement.textContent = t("chainReadyHint");
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
      castResultElement.textContent = t("noEnemyMatches", { result: targetValue });
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
      castResultElement.textContent = t("shieldRejects");
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
      castResultElement.textContent = t("castChainLightning", { count: chainTargets.length });
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
      castResultElement.textContent = t("castFireball", { enemy: frontEnemy.name });
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
      castResultElement.textContent = t("castLightning", { enemy: frontEnemy.name });
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
      castResultElement.textContent = t("hitLane", {
        enemy: targetEnemy.name,
        lane: targetEnemy.lane + 1,
      });
      castResultElement.classList.add("ok");
    }

    if (targetEnemy.hp <= 0) {
      setEnemyState(targetEnemy, "dead");
      targetEnemy.removeOnDeadEnd = true;
      awardXp(1);
      if (!suppressMessage) {
        castResultElement.textContent = t("eliminated", {
          enemy: targetEnemy.name,
          target: targetEnemy.target,
        });
      }
    } else {
      if (targetEnemy.rerollTargetOnHit) {
        const previousTarget = targetEnemy.target;
        targetEnemy.target = getDifferentEnemyTargetValue(targetEnemy.type, previousTarget);
        if (!suppressMessage) {
          castResultElement.textContent = t("rerolled", {
            enemy: targetEnemy.name,
            previous: previousTarget,
            next: targetEnemy.target,
          });
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

    statusLabelElement.textContent = t("statusRunning");
    castleHpElement.textContent = String(castleHp);
    castResultElement.textContent = t("lastCastDefault");
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
        statusLabelElement.textContent = t("statusVictory");
        completedLevelIndices.add(currentLevelIndex);
        highestUnlockedLevel = Math.max(
          highestUnlockedLevel,
          Math.min(LEVELS.length - 1, currentLevelIndex + 1),
        );
        syncCurrentProfileSave();
        castResultElement.textContent = t("levelComplete");
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
      castResultElement.textContent = t("enemyBreach", { count: escapedEnemyIds.size });
      castResultElement.classList.remove("ok");
      castResultElement.classList.add("bad");
    }

    if (castleHp <= 0) {
      castleHp = 0;
      gameResult = "defeat";
      levelCompleteTimerSeconds = 0;
      statusLabelElement.textContent = t("statusDefeat");
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
      context2d.fillText(t("laneLabel", { lane: laneIndex + 1 }), LANE_START_X + 132, lane.y + 5);
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
      tokenLayout.isTouchLayout ? t("touchTokenPanel") : t("tokenPanel"),
      tokenLayout.panelX + 16,
      tokenLayout.panelY + (tokenLayout.isTouchLayout ? 42 : 24),
    );

    context2d.font = tokenLayout.isTouchLayout ? "23px Segoe UI" : "14px Segoe UI";
    if (tokenLayout.isTouchLayout) {
      context2d.fillText(
        operationMode === "multiply"
          ? t("operatorMultiply")
          : operationMode === "divide"
            ? t("operatorDivide")
            : t("operatorPlusMinus"),
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
      t("equationTitle"),
      tokenLayout.equationPanelX + 16,
      tokenLayout.equationPanelY + (tokenLayout.isTouchLayout ? 42 : 24),
    );
    context2d.font = tokenLayout.isTouchLayout ? "16px Segoe UI" : "12px Segoe UI";
    context2d.fillText(
      t("inputHint"),
      tokenLayout.equationPanelX + 16,
      tokenLayout.equationPanelY + (tokenLayout.isTouchLayout ? 80 : 46),
    );
    context2d.fillText(
      t("clearHint"),
      tokenLayout.equationPanelX + 16,
      tokenLayout.equationPanelY + (tokenLayout.isTouchLayout ? 100 : 64),
    );
  }

  function drawWorldMapScene() {
    context2d.clearRect(0, 0, canvas.width, canvas.height);
    const nextPlayableLevelIndex = getNextPlayableLevelIndex();
    const nextPlayableLevel = LEVELS[nextPlayableLevelIndex];
    const nextPlayablePoint = getIslandScreenPoint(nextPlayableLevel);
    const pulsePhase = (performance.now() / 1000) / MAP_GUIDE_PULSE_SECONDS;
    const pulseAlpha = 0.42 + ((Math.sin(pulsePhase * Math.PI * 2) + 1) * 0.22);
    const pulseRadius = 26 + ((Math.sin(pulsePhase * Math.PI * 2) + 1) * 8);

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

    context2d.fillStyle = "rgba(10, 18, 44, 0.58)";
    context2d.fillRect(20, 20, 560, 132);
    context2d.strokeStyle = "rgba(155, 182, 255, 0.8)";
    context2d.lineWidth = 2;
    context2d.strokeRect(20, 20, 560, 132);

    context2d.fillStyle = "#e7edff";
    context2d.font = "bold 28px Segoe UI";
    context2d.fillText(t("worldMapTitle"), 40, 62);
    context2d.font = "16px Segoe UI";
    context2d.fillText(t("worldMapSubtitle"), 40, 95);
    context2d.fillStyle = "#ffd579";
    context2d.font = "bold 18px Segoe UI";
    context2d.fillText(t("startHere", { level: getLevelDisplayName(nextPlayableLevel) }), 40, 126);

    context2d.save();
    context2d.setLineDash([10, 10]);
    context2d.strokeStyle = `rgba(255, 213, 121, ${Math.min(0.95, pulseAlpha + 0.08)})`;
    context2d.lineWidth = 4;
    context2d.beginPath();
    context2d.moveTo(270, 138);
    context2d.lineTo(nextPlayablePoint.x - 28, nextPlayablePoint.y - 16);
    context2d.stroke();
    context2d.restore();

    for (let levelIndex = 0; levelIndex < LEVELS.length; levelIndex += 1) {
      const level = LEVELS[levelIndex];
      const point = getIslandScreenPoint(level);
      const isUnlocked = levelIndex <= highestUnlockedLevel;
      const isCompleted = completedLevelIndices.has(levelIndex);
      const isNextPlayable = levelIndex === nextPlayableLevelIndex;

      if (isNextPlayable) {
        context2d.save();
        context2d.strokeStyle = `rgba(255, 226, 131, ${pulseAlpha})`;
        context2d.lineWidth = 8;
        context2d.beginPath();
        context2d.arc(point.x, point.y, pulseRadius, 0, Math.PI * 2);
        context2d.stroke();
        context2d.restore();
      }

      context2d.beginPath();
      context2d.arc(point.x, point.y, 18, 0, Math.PI * 2);
      if (!isUnlocked) {
        context2d.fillStyle = "rgba(120, 125, 140, 0.9)";
      } else if (isCompleted) {
        context2d.fillStyle = "rgba(96, 218, 147, 0.95)";
      } else if (isNextPlayable) {
        context2d.fillStyle = "rgba(255, 226, 131, 0.98)";
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
      context2d.strokeText(getLevelDisplayName(level), point.x + 24, point.y - 4);
      context2d.fillText(getLevelDisplayName(level), point.x + 24, point.y - 4);
      context2d.font = "12px Segoe UI";
      context2d.strokeText(t("speedStat", { speed: level.baseSpeedMultiplier.toFixed(2) }), point.x + 24, point.y + 14);
      context2d.fillText(t("speedStat", { speed: level.baseSpeedMultiplier.toFixed(2) }), point.x + 24, point.y + 14);

      if (isNextPlayable) {
        context2d.strokeStyle = "rgba(39, 28, 4, 0.9)";
        context2d.lineWidth = 4;
        context2d.fillStyle = "#ffe28a";
        context2d.font = "bold 16px Segoe UI";
        context2d.strokeText(t("startHereBadge"), point.x - 8, point.y - 28);
        context2d.fillText(t("startHereBadge"), point.x - 8, point.y - 28);
      }
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
        context2d.fillText(t("stone"), token.x, token.y + tokenRadius * 1.15);
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
    const slotLabels = [t("slotA"), t("slotOp"), t("slotB")];

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
          ? t("selectionHintMultiplyChain")
          : t("selectionHintMultiply"))
        : operationMode === "divide"
          ? (isChainLightningUnlocked()
            ? t("selectionHintDivideChain")
            : t("selectionHintDivide"))
          : canUseExpandedSecondOperand()
            ? t("selectionHintLargeSpell")
            : t("selectionHintDefault"),
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
      t("spellMageTower"),
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
      context2d.fillText(t("enemyHp", { name: enemy.name, hp: enemy.hp }), enemy.x, laneY - 34 * gameScale);

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
      context2d.strokeText(t("levelUp"), effect.x, effect.y - 18);
      context2d.fillStyle = "#f8f6a0";
      context2d.fillText(t("levelUp"), effect.x, effect.y - 18);
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
    context2d.fillText(
      gameResult === "victory" ? t("endVictory") : t("endDefeat"),
      canvas.width / 2,
      canvas.height / 2 - 12,
    );

    context2d.fillStyle = "#f0f3ff";
    context2d.font = "22px Segoe UI";
    context2d.fillText(t("endResetHint"), canvas.width / 2, canvas.height / 2 + 34);

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
    castResultElement.textContent = t("debugAllUnlocked");
    castResultElement.classList.remove("bad");
    castResultElement.classList.add("ok");
  });

  debugGrantXpButtonElement.addEventListener("click", () => {
    awardXp(XP_PER_LEVEL);
    castResultElement.textContent = t("debugGainedXp", { xp: XP_PER_LEVEL });
    castResultElement.classList.remove("bad");
    castResultElement.classList.add("ok");
  });

  debugResetProgressButtonElement.addEventListener("click", () => {
    resetCurrentProfileProgress();
    castResultElement.textContent = t("debugResetDone");
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
    applyProfile(selectedProfile, t("profileLoaded", { name: selectedProfile.name }));
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

  applyLocalizedStaticText();
  loadSprites();
  setupSpeedSlider();
  initializeSaveSystem();
  updateDebugButtonText();
  setDebugMenuOpen(false);
  updateProgressionHud();
  requestAnimationFrame(frameLoop);
})();
