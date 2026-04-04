(() => {
  "use strict";

  function createCombatHelpers(runtime) {
    function randomInteger(minimumValue, maximumValue) {
      return Math.floor(Math.random() * (maximumValue - minimumValue + 1)) + minimumValue;
    }

    function getEnemySpecialStateDef(enemyType) {
      return runtime.ENEMY_DEFS[enemyType]?.specialState || null;
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
      runtime.petrifiedTokenId = null;
      runtime.petrifiedTokenTimer = 0;
    }

    function getPetrifiedToken() {
      if (!runtime.petrifiedTokenId || runtime.petrifiedTokenTimer <= 0) {
        return null;
      }

      return runtime.tokens.find((token) => token.id === runtime.petrifiedTokenId) || null;
    }

    function isTokenPetrified(token) {
      return Boolean(token && runtime.petrifiedTokenTimer > 0 && token.id === runtime.petrifiedTokenId);
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

    function setCastResult(messageText, statusClass) {
      runtime.castResultElement.classList.remove("ok", "bad");
      if (statusClass) {
        runtime.castResultElement.classList.add(statusClass);
      }
      runtime.castResultElement.textContent = messageText;
    }

    function petrifyRandomToken() {
      const eligibleTokens = runtime.tokens.filter((token) => token.kind === "number");
      if (eligibleTokens.length === 0) {
        return;
      }

      const targetToken = eligibleTokens[randomInteger(0, eligibleTokens.length - 1)];
      runtime.petrifiedTokenId = targetToken.id;
      runtime.petrifiedTokenTimer = runtime.PETRIFIED_TOKEN_DURATION_SECONDS;
      runtime.clearEquationSelection();
      setCastResult(runtime.t("medusaPetrified", {
        token: formatOperator(targetToken.symbol),
      }), "bad");
    }

    function getMultiplyTargetValue() {
      const defaultResult = randomInteger(1, 10) * randomInteger(1, 10);
      if (!runtime.isChainLightningUnlocked() || Math.random() > runtime.CHAIN_LIGHTNING_TARGET_BIAS_CHANCE) {
        return defaultResult;
      }

      const chainReadyProducts = [];
      for (let leftFactor = 1; leftFactor <= 10; leftFactor += 1) {
        for (let rightFactor = 1; rightFactor <= 10; rightFactor += 1) {
          const product = leftFactor * rightFactor;
          if (product > runtime.CHAIN_LIGHTNING_MULTIPLY_RESULT_THRESHOLD) {
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
        let divisor = runtime.CHAIN_LIGHTNING_DIVIDE_SECOND_OPERAND_THRESHOLD;
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
      if (!runtime.isChainLightningUnlocked() || Math.random() > runtime.CHAIN_LIGHTNING_TARGET_BIAS_CHANCE) {
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
      const definition = runtime.ENEMY_DEFS[enemyType];
      if (runtime.operationMode === "multiply") {
        return getMultiplyTargetValue();
      }
      if (runtime.operationMode === "divide") {
        return getDivideTargetValue();
      }
      return randomInteger(definition.valueMin, definition.valueMax);
    }

    function canUseExpandedSecondOperand() {
      if (!runtime.selection.firstNumber || !runtime.isChainLightningUnlocked()) {
        return false;
      }

      if (runtime.operationMode === "add-sub") {
        return Number(runtime.selection.firstNumber)
          > runtime.CHAIN_LIGHTNING_ADD_SUB_FIRST_OPERAND_THRESHOLD;
      }

      return runtime.operationMode === "multiply" || runtime.operationMode === "divide";
    }

    function canUseTowerEquation() {
      return runtime.isMageTowerUnlocked();
    }

    function getMaxSecondOperandDigits() {
      return canUseExpandedSecondOperand() ? runtime.MAX_SECOND_OPERAND_DIGITS : 1;
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

      const definition = runtime.ENEMY_DEFS[enemyType];
      if (runtime.operationMode === "divide") {
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
      for (const enemy of runtime.enemies) {
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
      enemy.shieldFlashTimer = runtime.SHIELD_FLASH_DURATION_SECONDS;
    }

    function getGameScale() {
      return runtime.canvas.height / runtime.BASE_GAME_HEIGHT;
    }

    function getEnemySpawnX() {
      const offscreenMargin = Math.max(12, 26 * getGameScale());
      return runtime.canvas.width + offscreenMargin;
    }

    function isCoarsePointerDevice() {
      return Boolean(window.matchMedia && window.matchMedia("(pointer: coarse)").matches);
    }

    function getMageTowerLayout() {
      const gameScale = getGameScale();
      const towerWidth = 104 * gameScale;
      const towerHeight = 178 * gameScale;
      const topLaneY = runtime.lanes.length > 0 ? runtime.lanes[0].y : (250 * gameScale);
      const towerX = runtime.LANE_START_X + 6 * gameScale;
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
      if (runtime.operationMode === "multiply") {
        return "*";
      }
      if (runtime.operationMode === "divide") {
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

      if (runtime.operationMode === "multiply") {
        firstValue = randomInteger(2, 5);
        secondValue = randomInteger(2, 5);
        thirdValue = randomInteger(2, 4);
        resultValue = firstValue * secondValue * thirdValue;
      } else if (runtime.operationMode === "divide") {
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

      runtime.towerPuzzle.expressionText = `${firstValue} ${formatOperator(firstOperator)} ${secondValue} ${formatOperator(secondOperator)} ${thirdValue}`;
      runtime.towerPuzzle.expectedResult = resultValue;
      runtime.towerPuzzle.answerText = "";
      runtime.towerPuzzle.isFocused = false;
    }

    function resetMageTowerPuzzle() {
      runtime.towerPuzzle.expressionText = "";
      runtime.towerPuzzle.expectedResult = null;
      runtime.towerPuzzle.answerText = "";
      runtime.towerPuzzle.isFocused = false;
    }

    function ensureMageTowerPuzzle() {
      if (runtime.isMageTowerUnlocked() && runtime.towerPuzzle.expectedResult === null) {
        buildMageTowerPuzzle();
      }
    }

    function getMageTowerTargetLane() {
      const aliveEnemies = runtime.enemies.filter((enemy) => enemy.state !== "dead");
      if (aliveEnemies.length === 0) {
        return 1;
      }

      aliveEnemies.sort((enemyA, enemyB) => enemyA.x - enemyB.x);
      return aliveEnemies[0].lane;
    }

    function addTowerGroundFlame(laneIndex, flameX) {
      const gameScale = getGameScale();
      runtime.towerGroundFlames.push({
        lane: laneIndex,
        x: flameX,
        ttl: runtime.TOWER_GROUND_DURATION_SECONDS,
        duration: runtime.TOWER_GROUND_DURATION_SECONDS,
        frame: randomInteger(0, runtime.TOWER_GROUND_FRAME_COUNT - 1),
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

      runtime.towerGlowTimer = runtime.TOWER_GLOW_DURATION_SECONDS;
      runtime.towerProjectiles.push({
        lane: laneIndex,
        x: startX,
        endX: runtime.canvas.width + drawWidth * 0.35,
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
      const frameDuration = 1 / runtime.TOWER_FIRE_FPS;
      projectile.frameTimer += deltaSeconds;

      while (projectile.frameTimer >= frameDuration) {
        projectile.frameTimer -= frameDuration;

        if (projectile.phase === "launch") {
          if (projectile.frame < runtime.TOWER_FIRE_LOOP_START_FRAME - 1) {
            projectile.frame += 1;
          } else {
            projectile.phase = "loop";
            projectile.frame = runtime.TOWER_FIRE_LOOP_START_FRAME;
          }
        } else if (projectile.phase === "loop") {
          projectile.frame += 1;
          if (projectile.frame > runtime.TOWER_FIRE_LOOP_END_FRAME) {
            projectile.frame = runtime.TOWER_FIRE_LOOP_START_FRAME;
          }
        } else if (projectile.frame < runtime.TOWER_FIRE_FRAME_COUNT - 1) {
          projectile.frame += 1;
        }
      }
    }

    function updateTowerEffects(deltaSeconds) {
      runtime.towerGlowTimer = Math.max(0, runtime.towerGlowTimer - deltaSeconds);

      for (const projectile of runtime.towerProjectiles) {
        projectile.x += runtime.TOWER_PROJECTILE_SPEED * deltaSeconds;
        while (projectile.x - projectile.lastGroundX >= runtime.TOWER_PROJECTILE_GROUND_SPACING) {
          projectile.lastGroundX += runtime.TOWER_PROJECTILE_GROUND_SPACING;
          addTowerGroundFlame(projectile.lane, projectile.lastGroundX + projectile.drawWidth * 0.12);
        }

        if (
          projectile.phase !== "finish"
          && projectile.x >= projectile.endX - projectile.drawWidth * 0.82
        ) {
          projectile.phase = "finish";
          projectile.frame = runtime.TOWER_FIRE_LOOP_END_FRAME + 1;
          projectile.frameTimer = 0;
        }

        advanceTowerProjectileFrame(projectile, deltaSeconds);
      }

      runtime.towerProjectiles = runtime.towerProjectiles.filter(
        (projectile) => !(projectile.phase === "finish" && projectile.frame >= runtime.TOWER_FIRE_FRAME_COUNT - 1),
      );

      const groundFrameDuration = 1 / runtime.TOWER_GROUND_FPS;
      for (const groundFlame of runtime.towerGroundFlames) {
        groundFlame.ttl -= deltaSeconds;
        groundFlame.frameTimer += deltaSeconds;
        while (groundFlame.frameTimer >= groundFrameDuration) {
          groundFlame.frameTimer -= groundFrameDuration;
          groundFlame.frame = (groundFlame.frame + 1) % runtime.TOWER_GROUND_FRAME_COUNT;
        }
      }

      runtime.towerGroundFlames = runtime.towerGroundFlames.filter((groundFlame) => groundFlame.ttl > 0);
    }

    function getTowerProjectileFrame(frameIndex) {
      return runtime.spriteAssets.towerFireFrames[frameIndex] || null;
    }

    function getTowerGroundFrame(frameIndex) {
      return runtime.spriteAssets.towerGroundFrames[frameIndex] || null;
    }

    function submitMageTowerAnswer() {
      if (!runtime.isMageTowerUnlocked() || runtime.towerPuzzle.expectedResult === null) {
        return false;
      }

      const submittedValue = Number(runtime.towerPuzzle.answerText);
      if (!Number.isFinite(submittedValue)) {
        setCastResult(runtime.t("mageTowerEnterResult"), "bad");
        return true;
      }

      if (submittedValue !== runtime.towerPuzzle.expectedResult) {
        setCastResult(runtime.t("mageTowerIncorrect"), "bad");
        runtime.towerPuzzle.answerText = "";
        runtime.towerPuzzle.isFocused = true;
        return true;
      }

      const targetLane = getMageTowerTargetLane();
      const laneTargets = runtime.enemies.filter(
        (enemy) => enemy.state !== "dead" && enemy.lane === targetLane,
      );

      launchMageTowerAttack(targetLane);
      for (const laneTarget of laneTargets) {
        applyEnemyDamage(laneTarget, {
          damage: runtime.TOWER_ATTACK_DAMAGE,
          spawnExplosion: false,
          suppressMessage: true,
        });
      }

      setCastResult(runtime.t("mageTowerLaneDamage", {
        lane: targetLane + 1,
        damage: runtime.TOWER_ATTACK_DAMAGE,
      }), "ok");
      buildMageTowerPuzzle();
      return true;
    }

    function getTokenUiLayout() {
      const isTouchDevice = window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
      if (isTouchDevice || window.innerWidth <= 900) {
        const panelX = 12;
        const panelY = 16;
        const panelWidth = runtime.CASTLE_PANEL_WIDTH - 24;
        const panelHeight = runtime.canvas.height - 32;
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
        tokenRadius: runtime.TOKEN_RADIUS,
        tokenHitRadius: runtime.TOKEN_RADIUS + 3,
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
      runtime.lanes = Array.from({ length: runtime.LANE_COUNT }, (_, laneIndex) => ({
        y: topMargin + laneIndex * laneGap,
      }));
    }

    function createSelectionTokens() {
      runtime.tokens = [];
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
          runtime.tokens.push({
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

      if (runtime.operationMode === "multiply" || runtime.operationMode === "divide") {
        runtime.tokens.push({
          id: runtime.operationMode === "multiply" ? "op-multiply" : "op-divide",
          symbol: runtime.operationMode === "multiply" ? "*" : "/",
          kind: "operator",
          x: layout.operatorX,
          y: layout.multiplyY,
          radius: layout.tokenRadius,
          hitRadius: layout.tokenHitRadius,
        });
      } else {
        runtime.tokens.push({
          id: "op-plus",
          symbol: "+",
          kind: "operator",
          x: layout.operatorX,
          y: layout.plusY,
          radius: layout.tokenRadius,
          hitRadius: layout.tokenHitRadius,
        });
        runtime.tokens.push({
          id: "op-minus",
          symbol: "-",
          kind: "operator",
          x: layout.operatorX,
          y: layout.minusY,
          radius: layout.tokenRadius,
          hitRadius: layout.tokenHitRadius,
        });
      }

      if (runtime.petrifiedTokenId && !runtime.tokens.some((token) => token.id === runtime.petrifiedTokenId)) {
        clearPetrifiedToken();
      }
    }

    function getOperationHintText() {
      if (runtime.operationMode === "multiply") {
        return runtime.isChainLightningUnlocked()
          ? runtime.t("operationHintMultiplyChain")
          : runtime.t("operationHintMultiply");
      }
      if (runtime.operationMode === "divide") {
        return runtime.isChainLightningUnlocked()
          ? runtime.t("operationHintDivideChain")
          : runtime.t("operationHintDivide");
      }
      if (runtime.isChainLightningUnlocked()) {
        return runtime.t("operationHintAddSubChain");
      }
      return runtime.t("operationHintAddSub");
    }

    function updateEquationPreview() {
      const hasFirstNumber = runtime.selection.firstNumber !== null;
      const hasOperator = runtime.selection.operator !== null;
      const hasSecondNumber = runtime.selection.secondNumber !== null;

      if (!hasFirstNumber && !hasOperator && !hasSecondNumber) {
        runtime.equationTextElement.textContent = getOperationHintText();
        return null;
      }

      if (hasFirstNumber && !hasOperator) {
        runtime.equationTextElement.textContent = `${runtime.selection.firstNumber} _ _`;
        return null;
      }
      if (hasFirstNumber && hasOperator && !hasSecondNumber) {
        runtime.equationTextElement.textContent = `${runtime.selection.firstNumber} ${formatOperator(runtime.selection.operator)} _`;
        return null;
      }

      const firstNumber = Number(runtime.selection.firstNumber);
      const secondNumber = Number(runtime.selection.secondNumber);
      if (!Number.isFinite(firstNumber) || !Number.isFinite(secondNumber)) {
        return null;
      }
      if (!(
        runtime.selection.operator === "+"
        || runtime.selection.operator === "-"
        || runtime.selection.operator === "*"
        || runtime.selection.operator === "/"
      )) {
        return null;
      }

      let resultValue = 0;
      if (runtime.selection.operator === "+") {
        resultValue = firstNumber + secondNumber;
      } else if (runtime.selection.operator === "-") {
        resultValue = firstNumber - secondNumber;
      } else if (runtime.selection.operator === "*") {
        resultValue = firstNumber * secondNumber;
      } else {
        if (secondNumber === 0) {
          runtime.equationTextElement.textContent = `${firstNumber} ${formatOperator(runtime.selection.operator)} ${secondNumber} = invalid`;
          setCastResult(runtime.t("divisionByZero"), "bad");
          return null;
        }
        if (firstNumber % secondNumber !== 0) {
          runtime.equationTextElement.textContent = `${firstNumber} ${formatOperator(runtime.selection.operator)} ${secondNumber} = invalid`;
          setCastResult(runtime.t("divisionWhole"), "bad");
          return null;
        }
        resultValue = firstNumber / secondNumber;
      }

      runtime.equationTextElement.textContent = `${firstNumber} ${formatOperator(runtime.selection.operator)} ${secondNumber} = ${resultValue}`;

      return {
        firstNumber,
        secondNumber,
        operator: runtime.selection.operator,
        operandCount: 2,
        equationText: `${firstNumber} ${formatOperator(runtime.selection.operator)} ${secondNumber}`,
        equationKey: buildEquationKey(firstNumber, runtime.selection.operator, secondNumber),
        result: resultValue,
      };
    }

    function getTokenBySymbol(symbolValue, kindValue) {
      return runtime.tokens.find((token) => token.symbol === symbolValue && token.kind === kindValue);
    }

    function getWizardCastOrigin() {
      return {
        x: runtime.BATTLEFIELD_START_X + runtime.CASTLE_AREA_WIDTH * 0.5,
        y: runtime.canvas.height * 0.5 - 30,
      };
    }

    function shouldUseChainLightningSpell(equationResult) {
      if (!runtime.isChainLightningUnlocked()) {
        return false;
      }
      if (equationResult.operandCount > 2) {
        return false;
      }
      if (runtime.operationMode === "add-sub") {
        return equationResult.firstNumber > runtime.CHAIN_LIGHTNING_ADD_SUB_FIRST_OPERAND_THRESHOLD;
      }
      if (runtime.operationMode === "multiply") {
        return equationResult.result > runtime.CHAIN_LIGHTNING_MULTIPLY_RESULT_THRESHOLD;
      }
      if (runtime.operationMode === "divide") {
        return equationResult.secondNumber >= runtime.CHAIN_LIGHTNING_DIVIDE_SECOND_OPERAND_THRESHOLD;
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
        { x: enemyA.x, y: runtime.lanes[enemyA.lane].y },
        { x: enemyB.x, y: runtime.lanes[enemyB.lane].y },
      );
    }

    function getDistanceFromWizard(enemy) {
      const wizardOrigin = getWizardCastOrigin();
      return getDistanceBetweenPoints(wizardOrigin, { x: enemy.x, y: runtime.lanes[enemy.lane].y });
    }

    function getChainLightningTargets(primaryEnemy, maxTargetCount) {
      const chainTargets = [primaryEnemy];
      const remainingEnemies = runtime.enemies.filter(
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
      runtime.chainLightningEffects.push({
        points: targetEnemies.map((enemy) => ({
          x: enemy.x,
          y: runtime.lanes[enemy.lane].y - 12,
        })),
        ttl: runtime.CHAIN_LIGHTNING_EFFECT_DURATION_SECONDS,
        duration: runtime.CHAIN_LIGHTNING_EFFECT_DURATION_SECONDS,
      });
    }

    function tryCastCurrentEquation() {
      const equationResult = updateEquationPreview();
      if (!equationResult) {
        return;
      }

      castSpellFromResult(equationResult);
      runtime.clearEquationSelection();
    }

    function registerTokenSelection(token) {
      if (isTokenPetrified(token)) {
        setCastResult(runtime.t("tokenPetrified", {
          token: formatOperator(token.symbol),
        }), "bad");
        return;
      }

      if (token.kind === "number") {
        if (runtime.selection.operator === null) {
          if (runtime.selection.firstNumber === null) {
            runtime.selection.firstNumber = token.symbol;
          } else if (runtime.selection.firstNumber.length < runtime.MAX_FIRST_OPERAND_DIGITS) {
            runtime.selection.firstNumber += token.symbol;
          } else {
            setCastResult(runtime.t("firstNumberLimit"), "bad");
            return;
          }
        } else if (runtime.selection.secondNumber === null) {
          runtime.selection.secondNumber = token.symbol;
        } else if (runtime.selection.secondNumber.length < getMaxSecondOperandDigits()) {
          runtime.selection.secondNumber += token.symbol;
        } else {
          setCastResult(runtime.t("secondNumberLimit", {
            digits: getMaxSecondOperandDigits(),
          }), "bad");
          return;
        }
      } else if (token.kind === "operator") {
        if (runtime.selection.firstNumber === null) {
          setCastResult(runtime.t("pickNumberFirst"), "bad");
          return;
        }
        runtime.selection.operator = token.symbol;
      }

      const equationResult = updateEquationPreview();
      if (equationResult) {
        if (requiresManualCastConfirmation()) {
          setCastResult(runtime.t("chainReadyHint"), "ok");
        } else {
          castSpellFromResult(equationResult);
          runtime.clearEquationSelection();
        }
      }
    }

    function castSpellFromResult(equationResult) {
      if (runtime.gameResult !== "running") {
        return;
      }

      const targetValue = equationResult.result;
      runtime.equationTextElement.textContent = `${equationResult.equationText} = ${targetValue}`;
      const matchingEnemies = runtime.enemies
        .filter((enemy) => enemy.target === targetValue && enemy.state !== "dead")
        .sort((enemyA, enemyB) => enemyA.x - enemyB.x);

      runtime.castResultElement.classList.remove("ok", "bad");

      if (matchingEnemies.length === 0) {
        setCastResult(runtime.t("noEnemyMatches", { result: targetValue }), "bad");
        return;
      }

      const frontEnemy = matchingEnemies.find(
        (enemy) => canUseEquationOnEnemy(enemy, equationResult.equationKey),
      );
      if (!frontEnemy) {
        matchingEnemies.forEach((enemy) => {
          if (enemy.equationShield) {
            triggerEquationShieldFlash(enemy);
          }
        });
        setCastResult(runtime.t("shieldRejects"), "bad");
        return;
      }

      if (shouldUseChainLightningSpell(equationResult)) {
        const chainTargets = getChainLightningTargets(frontEnemy, runtime.CHAIN_LIGHTNING_TARGET_COUNT);
        runtime.setWizardAnimation("lightning");
        finalizeEquationOnEnemy(frontEnemy, equationResult.equationText, equationResult.equationKey);
        addChainLightningEffect(chainTargets);
        for (const chainTarget of chainTargets) {
          runtime.lightningEffects.push({
            x: chainTarget.x,
            y: runtime.lanes[chainTarget.lane].y - 52,
            ttl: runtime.LIGHTNING_DURATION_SECONDS,
            duration: runtime.LIGHTNING_DURATION_SECONDS,
          });
          applyEnemyDamage(chainTarget, { spawnExplosion: false, suppressMessage: true });
        }
        setCastResult(runtime.t("castChainLightning", { count: chainTargets.length }), "ok");
        return;
      }

      const chosenSpell = Math.random() < 0.5 ? "fireball" : "lightning";
      if (chosenSpell === "fireball") {
        runtime.setWizardAnimation("fireball");
        const wizardOrigin = getWizardCastOrigin();
        reserveEquationForEnemy(frontEnemy, equationResult.equationKey);
        runtime.activeProjectiles.push({
          targetEnemyId: frontEnemy.id,
          fromX: wizardOrigin.x,
          fromY: wizardOrigin.y,
          toX: frontEnemy.x,
          toY: runtime.lanes[frontEnemy.lane].y,
          ttl: runtime.PROJECTILE_TRAVEL_SECONDS,
          duration: runtime.PROJECTILE_TRAVEL_SECONDS,
          equationText: equationResult.equationText,
          equationKey: equationResult.equationKey,
        });
        setCastResult(runtime.t("castFireball", { enemy: frontEnemy.name }), "ok");
      } else {
        runtime.setWizardAnimation("lightning");
        finalizeEquationOnEnemy(frontEnemy, equationResult.equationText, equationResult.equationKey);
        runtime.lightningEffects.push({
          x: frontEnemy.x,
          y: runtime.lanes[frontEnemy.lane].y - 52,
          ttl: runtime.LIGHTNING_DURATION_SECONDS,
          duration: runtime.LIGHTNING_DURATION_SECONDS,
        });
        applyEnemyDamage(frontEnemy, false);
        setCastResult(runtime.t("castLightning", { enemy: frontEnemy.name }), "ok");
      }
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
        runtime.hitEffects.push({
          x: targetEnemy.x,
          y: runtime.lanes[targetEnemy.lane].y,
          ttl: runtime.EXPLOSION_DURATION_SECONDS,
          duration: runtime.EXPLOSION_DURATION_SECONDS,
          color: "#78d6ff",
        });
      }

      if (!suppressMessage) {
        setCastResult(runtime.t("hitLane", {
          enemy: targetEnemy.name,
          lane: targetEnemy.lane + 1,
        }), "ok");
      }

      if (targetEnemy.hp <= 0) {
        runtime.setEnemyState(targetEnemy, "dead");
        targetEnemy.removeOnDeadEnd = true;
        runtime.awardXp(1);
        if (!suppressMessage) {
          runtime.castResultElement.textContent = runtime.t("eliminated", {
            enemy: targetEnemy.name,
            target: targetEnemy.target,
          });
        }
      } else {
        if (targetEnemy.rerollTargetOnHit) {
          const previousTarget = targetEnemy.target;
          targetEnemy.target = getDifferentEnemyTargetValue(targetEnemy.type, previousTarget);
          if (!suppressMessage) {
            runtime.castResultElement.textContent = runtime.t("rerolled", {
              enemy: targetEnemy.name,
              previous: previousTarget,
              next: targetEnemy.target,
            });
          }
        }
        runtime.setEnemyState(targetEnemy, "hurt");
      }
    }

    function applyProjectileImpact(projectile) {
      const targetEnemy = runtime.enemies.find((enemy) => enemy.id === projectile.targetEnemyId);
      if (!targetEnemy || targetEnemy.state === "dead") {
        releaseEquationReservation(targetEnemy, projectile.equationKey);
        return;
      }
      finalizeEquationOnEnemy(targetEnemy, projectile.equationText, projectile.equationKey);
      applyEnemyDamage(targetEnemy, true);
    }

    return {
      randomInteger,
      getEnemySpecialStateDef,
      createEnemySpecialCooldown,
      clearPetrifiedToken,
      getPetrifiedToken,
      isTokenPetrified,
      petrifyRandomToken,
      getMultiplyTargetValue,
      hasChainReadyDivideEquation,
      getDivideTargetValue,
      getEnemyTargetValue,
      canUseExpandedSecondOperand,
      canUseTowerEquation,
      getMaxSecondOperandDigits,
      requiresManualCastConfirmation,
      getDifferentEnemyTargetValue,
      rerollEnemyTargetsForCurrentMode,
      buildEquationKey,
      canUseEquationOnEnemy,
      reserveEquationForEnemy,
      releaseEquationReservation,
      finalizeEquationOnEnemy,
      triggerEquationShieldFlash,
      getGameScale,
      getEnemySpawnX,
      isCoarsePointerDevice,
      getMageTowerLayout,
      getMageTowerPuzzleLayout,
      getRandomTowerOperator,
      buildMageTowerPuzzle,
      resetMageTowerPuzzle,
      ensureMageTowerPuzzle,
      getMageTowerTargetLane,
      addTowerGroundFlame,
      launchMageTowerAttack,
      advanceTowerProjectileFrame,
      updateTowerEffects,
      getTowerProjectileFrame,
      getTowerGroundFrame,
      submitMageTowerAnswer,
      getTokenUiLayout,
      computeLaneYPositions,
      createSelectionTokens,
      getOperationHintText,
      formatOperator,
      updateEquationPreview,
      getTokenBySymbol,
      getWizardCastOrigin,
      shouldUseChainLightningSpell,
      getDistanceBetweenPoints,
      getDistanceBetweenEnemies,
      getDistanceFromWizard,
      getChainLightningTargets,
      addChainLightningEffect,
      tryCastCurrentEquation,
      registerTokenSelection,
      castSpellFromResult,
      applyEnemyDamage,
      applyProjectileImpact,
    };
  }

  window.MathMageCombat = { createCombatHelpers };
})();