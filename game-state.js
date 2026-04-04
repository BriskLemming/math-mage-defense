(() => {
  "use strict";

  function createStateHelpers(runtime) {
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
        version: runtime.SAVE_DATA_VERSION,
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
      const aliasedProfile = runtime.LEGACY_PROFILE_ID_ALIASES[rawProfileId] || null;
      const profileId = aliasedProfile ? aliasedProfile.id : rawProfileId;
      const profileName = typeof rawProfile?.name === "string" && rawProfile.name.trim().length > 0
        ? rawProfile.name.trim()
        : runtime.t("profileFallback", { number: fallbackIndex + 1 });
      const completedLevelKeys = Array.isArray(rawProfile?.completedLevelKeys)
        ? rawProfile.completedLevelKeys.filter((levelKey) => typeof levelKey === "string")
        : [];
      const selectedOperationMode = runtime.isValidOperationMode(rawProfile?.selectedOperationMode)
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
      const selectedProfileIdCandidate = rawSelectedProfileId
        && runtime.LEGACY_PROFILE_ID_ALIASES[rawSelectedProfileId]
        ? runtime.LEGACY_PROFILE_ID_ALIASES[rawSelectedProfileId].id
        : rawSelectedProfileId;
      const selectedProfileId = profiles.some((profile) => profile.id === selectedProfileIdCandidate)
        ? selectedProfileIdCandidate
        : profiles[0].id;

      return {
        version: runtime.SAVE_DATA_VERSION,
        selectedProfileId,
        profiles,
      };
    }

    function persistSaveData() {
      if (!runtime.saveData) {
        return;
      }

      try {
        window.localStorage.setItem(runtime.SAVE_STORAGE_KEY, JSON.stringify(runtime.saveData));
      } catch (error) {
        console.warn("Failed to persist save data.", error);
      }
    }

    function loadSaveData() {
      try {
        const rawSaveText = window.localStorage.getItem(runtime.SAVE_STORAGE_KEY);
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
      if (!runtime.saveData) {
        return null;
      }
      return runtime.saveData.profiles.find((profile) => profile.id === runtime.currentProfileId) || null;
    }

    function rebuildProgressFromProfile(profile) {
      const existingLevelKeys = new Set(runtime.LEVELS.map((level) => level.key));
      const completedLevelKeys = new Set(
        profile.completedLevelKeys.filter((levelKey) => existingLevelKeys.has(levelKey)),
      );

      runtime.completedLevelIndices = new Set();
      runtime.LEVELS.forEach((level, levelIndex) => {
        if (completedLevelKeys.has(level.key)) {
          runtime.completedLevelIndices.add(levelIndex);
        }
      });

      runtime.highestUnlockedLevel = 0;
      for (let levelIndex = 0; levelIndex < runtime.LEVELS.length - 1; levelIndex += 1) {
        if (!completedLevelKeys.has(runtime.LEVELS[levelIndex].key)) {
          break;
        }
        runtime.highestUnlockedLevel = levelIndex + 1;
      }
      runtime.currentLevelIndex = Math.min(runtime.currentLevelIndex, runtime.highestUnlockedLevel);
    }

    function syncCurrentProfileSave() {
      const currentProfile = getCurrentProfile();
      if (!currentProfile) {
        return;
      }

      currentProfile.completedLevelKeys = runtime.LEVELS
        .filter((level, levelIndex) => runtime.completedLevelIndices.has(levelIndex))
        .map((level) => level.key);
      currentProfile.selectedOperationMode = runtime.isValidOperationMode(runtime.operationMode)
        ? runtime.operationMode
        : "add-sub";
      currentProfile.playerXp = runtime.playerXp;
      currentProfile.playerLevel = runtime.playerLevel;
      currentProfile.unlockedSpells = [...runtime.unlockedSpells];
      runtime.saveData.selectedProfileId = currentProfile.id;
      persistSaveData();
    }

    function renderProfileOptions() {
      runtime.profileSelectElement.innerHTML = "";
      for (const profile of runtime.saveData.profiles) {
        const optionElement = document.createElement("option");
        optionElement.value = profile.id;
        optionElement.textContent = profile.name;
        runtime.profileSelectElement.appendChild(optionElement);
      }
      runtime.profileSelectElement.value = runtime.currentProfileId;
    }

    function applyProfile(profile, messageText = null) {
      runtime.currentProfileId = profile.id;
      runtime.saveData.selectedProfileId = profile.id;
      rebuildProgressFromProfile(profile);
      runtime.playerXp = Number.isFinite(profile.playerXp) ? profile.playerXp : 0;
      runtime.playerLevel = Number.isFinite(profile.playerLevel) ? profile.playerLevel : 1;
      runtime.unlockedSpells = Array.isArray(profile.unlockedSpells) ? [...profile.unlockedSpells] : [];

      runtime.operationMode = runtime.isValidOperationMode(profile.selectedOperationMode)
        ? profile.selectedOperationMode
        : "add-sub";
      runtime.operationModeElement.value = runtime.operationMode;
      runtime.createSelectionTokens();
      runtime.returnToWorldMap();
      hideSpellUnlockOverlay();
      updateProgressionHud();
      runtime.updateSpeedDisplay();
      renderProfileOptions();
      persistSaveData();

      if (messageText) {
        runtime.castResultElement.textContent = messageText;
        runtime.castResultElement.classList.remove("bad");
        runtime.castResultElement.classList.add("ok");
      }
    }

    function resetCurrentProfileProgress() {
      const currentProfile = getCurrentProfile();
      if (!currentProfile) {
        return;
      }

      runtime.playerXp = 0;
      runtime.playerLevel = 1;
      runtime.unlockedSpells = [];
      runtime.completedLevelIndices = new Set();
      runtime.highestUnlockedLevel = 0;
      runtime.currentLevelIndex = 0;
      hideSpellUnlockOverlay();
      runtime.clearPetrifiedToken();
      updateProgressionHud();
      runtime.returnToWorldMap();
      syncCurrentProfileSave();
    }

    function createProfile() {
      const enteredName = window.prompt(
        runtime.t("profilePrompt"),
        runtime.t("playerDefaultName", { number: runtime.saveData.profiles.length + 1 }),
      );
      if (enteredName === null) {
        return;
      }

      const profileName = enteredName.trim();
      if (!profileName) {
        runtime.castResultElement.textContent = runtime.t("profileNameEmpty");
        runtime.castResultElement.classList.remove("ok");
        runtime.castResultElement.classList.add("bad");
        return;
      }

      const profileId = `profile-${Date.now()}`;
      const newProfile = createDefaultProfile(profileId, profileName);
      runtime.saveData.profiles.push(newProfile);
      applyProfile(newProfile, runtime.t("profileCreated", { name: profileName }));
    }

    function initializeSaveSystem() {
      runtime.saveData = loadSaveData();
      const initialProfile = runtime.saveData.profiles.find(
        (profile) => profile.id === runtime.saveData.selectedProfileId,
      ) || runtime.saveData.profiles[0];
      applyProfile(initialProfile);
    }

    function hasUnlockedSpell(spellId) {
      return runtime.unlockedSpells.includes(spellId);
    }

    function setDebugMenuOpen(nextOpen) {
      if (!runtime.debugMenuElement) {
        return;
      }
      runtime.debugMenuElement.classList.toggle("hidden", !nextOpen);
    }

    function isDebugMenuOpen() {
      return Boolean(runtime.debugMenuElement && !runtime.debugMenuElement.classList.contains("hidden"));
    }

    function toggleDebugMenu() {
      setDebugMenuOpen(!isDebugMenuOpen());
    }

    function startTitleDebugPress() {
      if (!runtime.appTitleElement || runtime.titleDebugPressTimer !== null) {
        return;
      }

      runtime.titleDebugPressTimer = window.setTimeout(() => {
        runtime.titleDebugPressTimer = null;
        toggleDebugMenu();
      }, runtime.TITLE_DEBUG_HOLD_MS);
    }

    function cancelTitleDebugPress() {
      if (runtime.titleDebugPressTimer === null) {
        return;
      }
      window.clearTimeout(runtime.titleDebugPressTimer);
      runtime.titleDebugPressTimer = null;
    }

    function updateDebugButtonText() {
      if (runtime.debugGrantXpButtonElement) {
        runtime.debugGrantXpButtonElement.textContent = runtime.t("debugGainXp", {
          xp: runtime.XP_PER_LEVEL,
        });
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
      if (nowMs - runtime.lastDebugSequenceTimestampMs > runtime.DEBUG_SEQUENCE_TIMEOUT_MS) {
        runtime.debugSequenceBuffer = "";
      }
      runtime.lastDebugSequenceTimestampMs = nowMs;

      runtime.debugSequenceBuffer = (runtime.debugSequenceBuffer + keyboardEvent.key.toLowerCase())
        .slice(-runtime.DEBUG_SEQUENCE.length);

      if (runtime.debugSequenceBuffer === runtime.DEBUG_SEQUENCE) {
        runtime.debugSequenceBuffer = "";
        toggleDebugMenu();
        return true;
      }

      return false;
    }

    function isChainLightningUnlocked() {
      return hasUnlockedSpell(runtime.SPELL_CHAIN_LIGHTNING);
    }

    function isMageTowerUnlocked() {
      return hasUnlockedSpell(runtime.SPELL_MAGE_TOWER);
    }

    function getSpellStatusText() {
      const spellStatuses = [
        isChainLightningUnlocked()
          ? runtime.t("spellStatusReady", { name: runtime.t("spellChainLightning") })
          : runtime.t("spellStatusLocked", {
            name: runtime.t("spellChainLightning"),
            level: runtime.CHAIN_LIGHTNING_UNLOCK_LEVEL,
          }),
        isMageTowerUnlocked()
          ? runtime.t("spellStatusReady", { name: runtime.t("spellMageTower") })
          : runtime.t("spellStatusLocked", {
            name: runtime.t("spellMageTower"),
            level: runtime.MAGE_TOWER_UNLOCK_LEVEL,
          }),
      ];
      return spellStatuses.join(" • ");
    }

    function updateProgressionHud() {
      if (runtime.playerLevelElement) {
        runtime.playerLevelElement.textContent = String(runtime.playerLevel);
      }
      if (runtime.xpBarFillElement) {
        runtime.xpBarFillElement.style.width = `${Math.max(0, Math.min(100, (runtime.playerXp / runtime.XP_PER_LEVEL) * 100))}%`;
      }
      if (runtime.xpTextElement) {
        runtime.xpTextElement.textContent = runtime.t("xpText", {
          current: runtime.playerXp,
          required: runtime.XP_PER_LEVEL,
        });
      }
      if (runtime.spellStatusElement) {
        runtime.spellStatusElement.textContent = getSpellStatusText();
      }
    }

    function getChainLightningDescription() {
      return runtime.t("chainLightningDescription");
    }

    function getMageTowerDescription() {
      return runtime.t("mageTowerDescription");
    }

    function hideSpellUnlockOverlay() {
      runtime.spellUnlockAnimation.active = false;
      runtime.spellUnlockAnimation.timer = 0;
      runtime.spellUnlockAnimation.frameTimer = 0;
      runtime.spellUnlockAnimation.frame = 0;
      if (runtime.spellUnlockOverlayElement) {
        runtime.spellUnlockOverlayElement.classList.add("hidden");
      }
      if (runtime.spellUnlockEffectContext && runtime.spellUnlockEffectCanvasElement) {
        runtime.spellUnlockEffectContext.clearRect(
          0,
          0,
          runtime.spellUnlockEffectCanvasElement.width,
          runtime.spellUnlockEffectCanvasElement.height,
        );
      }
      if (runtime.sceneMode === "game" && runtime.gameResult === "running" && !runtime.spellUnlockWasPausedBefore) {
        runtime.setPauseState(false);
      }
      runtime.spellUnlockWasPausedBefore = false;
    }

    function showSpellUnlockOverlay(spellId) {
      if (!runtime.spellUnlockOverlayElement) {
        return;
      }

      runtime.spellUnlockTitleElement.textContent = runtime.t("spellUnlockTitle");
      if (spellId === runtime.SPELL_CHAIN_LIGHTNING) {
        runtime.spellUnlockNameElement.textContent = runtime.t("spellChainLightning");
        runtime.spellUnlockDescriptionElement.textContent = getChainLightningDescription();
      } else if (spellId === runtime.SPELL_MAGE_TOWER) {
        runtime.spellUnlockNameElement.textContent = runtime.t("spellMageTower");
        runtime.spellUnlockDescriptionElement.textContent = getMageTowerDescription();
      } else {
        runtime.spellUnlockNameElement.textContent = runtime.t("spellNew");
        runtime.spellUnlockDescriptionElement.textContent = runtime.t("spellNewDescription");
      }

      runtime.spellUnlockAnimation.active = true;
      runtime.spellUnlockAnimation.timer = runtime.SPELL_UNLOCK_OVERLAY_DURATION_SECONDS;
      runtime.spellUnlockAnimation.duration = runtime.SPELL_UNLOCK_OVERLAY_DURATION_SECONDS;
      runtime.spellUnlockAnimation.frameTimer = 0;
      runtime.spellUnlockAnimation.frame = 0;
      runtime.spellUnlockWasPausedBefore = runtime.isPaused;
      if (runtime.sceneMode === "game" && runtime.gameResult === "running") {
        runtime.setPauseState(true);
      }
      runtime.spellUnlockOverlayElement.classList.remove("hidden");
    }

    function unlockSpell(spellId) {
      if (hasUnlockedSpell(spellId)) {
        return false;
      }
      runtime.unlockedSpells = [...runtime.unlockedSpells, spellId];
      updateProgressionHud();
      syncCurrentProfileSave();
      showSpellUnlockOverlay(spellId);
      return true;
    }

    function awardXp(amount) {
      if (!Number.isFinite(amount) || amount <= 0) {
        return;
      }

      runtime.playerXp += Math.floor(amount);
      let leveledUp = false;
      while (runtime.playerXp >= runtime.XP_PER_LEVEL) {
        runtime.playerXp -= runtime.XP_PER_LEVEL;
        runtime.playerLevel += 1;
        leveledUp = true;
        const wizardOrigin = runtime.getWizardCastOrigin();
        runtime.levelUpEffects.push({
          x: wizardOrigin.x,
          y: wizardOrigin.y - 58,
          ttl: runtime.LEVEL_UP_EFFECT_DURATION_SECONDS,
          duration: runtime.LEVEL_UP_EFFECT_DURATION_SECONDS,
          text: runtime.t("levelNumberExclaim", { level: runtime.playerLevel }),
        });
      }

      if (leveledUp && runtime.playerLevel >= runtime.CHAIN_LIGHTNING_UNLOCK_LEVEL) {
        unlockSpell(runtime.SPELL_CHAIN_LIGHTNING);
      }
      if (leveledUp && runtime.playerLevel >= runtime.MAGE_TOWER_UNLOCK_LEVEL) {
        unlockSpell(runtime.SPELL_MAGE_TOWER);
      }

      updateProgressionHud();
      syncCurrentProfileSave();
    }

    function updateSpellUnlockAnimation(deltaSeconds) {
      if (!runtime.spellUnlockAnimation.active) {
        return;
      }

      runtime.spellUnlockAnimation.timer -= deltaSeconds;
      runtime.spellUnlockAnimation.frameTimer += deltaSeconds;
      const frameDuration = 1 / runtime.SPELL_UNLOCK_EFFECT_FPS;
      while (runtime.spellUnlockAnimation.frameTimer >= frameDuration) {
        runtime.spellUnlockAnimation.frameTimer -= frameDuration;
        runtime.spellUnlockAnimation.frame = (runtime.spellUnlockAnimation.frame + 1)
          % runtime.SPELL_UNLOCK_EFFECT_FRAME_COUNT;
      }

      if (runtime.spellUnlockAnimation.timer <= 0) {
        hideSpellUnlockOverlay();
      }
    }

    function renderSpellUnlockOverlay() {
      if (
        !runtime.spellUnlockAnimation.active
        || !runtime.spellUnlockEffectContext
        || !runtime.spellUnlockEffectCanvasElement
      ) {
        return;
      }

      runtime.spellUnlockEffectContext.clearRect(
        0,
        0,
        runtime.spellUnlockEffectCanvasElement.width,
        runtime.spellUnlockEffectCanvasElement.height,
      );

      if (
        runtime.spriteAssets.spellUnlockLightningLoaded
        && runtime.spriteAssets.spellUnlockLightningSheet.complete
        && runtime.spriteAssets.spellUnlockLightningSheet.naturalWidth > 0
      ) {
        const frameWidth = Math.floor(
          runtime.spriteAssets.spellUnlockLightningSheet.width / runtime.SPELL_UNLOCK_EFFECT_FRAME_COUNT,
        );
        const frameHeight = runtime.spriteAssets.spellUnlockLightningSheet.height;
        const frameIndex = Math.min(
          runtime.SPELL_UNLOCK_EFFECT_FRAME_COUNT - 1,
          runtime.spellUnlockAnimation.frame,
        );
        const alpha = Math.max(
          0.35,
          runtime.spellUnlockAnimation.timer / runtime.spellUnlockAnimation.duration,
        );
        runtime.spellUnlockEffectContext.save();
        runtime.spellUnlockEffectContext.globalAlpha = alpha;
        runtime.spellUnlockEffectContext.drawImage(
          runtime.spriteAssets.spellUnlockLightningSheet,
          frameIndex * frameWidth,
          0,
          frameWidth,
          frameHeight,
          0,
          0,
          runtime.spellUnlockEffectCanvasElement.width,
          runtime.spellUnlockEffectCanvasElement.height,
        );
        runtime.spellUnlockEffectContext.restore();
      }
    }

    return {
      createDefaultProfile,
      createDefaultSaveData,
      normalizeProfile,
      normalizeSaveData,
      persistSaveData,
      loadSaveData,
      getCurrentProfile,
      rebuildProgressFromProfile,
      syncCurrentProfileSave,
      renderProfileOptions,
      applyProfile,
      resetCurrentProfileProgress,
      createProfile,
      initializeSaveSystem,
      hasUnlockedSpell,
      setDebugMenuOpen,
      isDebugMenuOpen,
      toggleDebugMenu,
      startTitleDebugPress,
      cancelTitleDebugPress,
      updateDebugButtonText,
      handleDebugSequenceKey,
      isChainLightningUnlocked,
      isMageTowerUnlocked,
      getSpellStatusText,
      updateProgressionHud,
      getChainLightningDescription,
      getMageTowerDescription,
      hideSpellUnlockOverlay,
      showSpellUnlockOverlay,
      unlockSpell,
      awardXp,
      updateSpellUnlockAnimation,
      renderSpellUnlockOverlay,
    };
  }

  window.MathMageState = { createStateHelpers };
})();