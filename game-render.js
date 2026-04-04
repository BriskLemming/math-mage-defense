(() => {
  "use strict";

  function createRenderHelpers(runtime) {
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
      runtime.spriteAssets.worldMapLoaded = false;
      runtime.spriteAssets.worldMap.src = "assets/sprites/WorldMap.png";
      runtime.spriteAssets.worldMap.onload = () => {
        runtime.spriteAssets.worldMapLoaded = true;
      };

      runtime.spriteAssets.laneBackgroundLoaded = false;
      runtime.spriteAssets.laneBackground.src = "assets/sprites/Lanes2.png";
      runtime.spriteAssets.laneBackground.onload = () => {
        runtime.spriteAssets.laneBackgroundLoaded = true;
      };

      runtime.spriteAssets.towerLoaded = false;
      runtime.spriteAssets.tower.src = "assets/sprites/Background/CastleTower.png";
      runtime.spriteAssets.tower.onload = () => {
        runtime.spriteAssets.towerLoaded = true;
      };

      runtime.spriteAssets.forestFlatLoaded = false;
      runtime.spriteAssets.forestFlat.src = "assets/sprites/Background/Forest/forest bridge.png";
      runtime.spriteAssets.forestFlat.onload = () => {
        runtime.spriteAssets.forestFlatLoaded = true;
      };

      runtime.spriteAssets.bambooFlatLoaded = false;
      runtime.spriteAssets.bambooFlat.src = "assets/sprites/Background/Bamboo/bamboo bridge.png";
      runtime.spriteAssets.bambooFlat.onload = () => {
        runtime.spriteAssets.bambooFlatLoaded = true;
      };

      runtime.spriteAssets.volcanoFlatLoaded = false;
      runtime.spriteAssets.volcanoFlat.src = "assets/sprites/Background/Volcano.png";
      runtime.spriteAssets.volcanoFlat.onload = () => {
        runtime.spriteAssets.volcanoFlatLoaded = true;
      };

      runtime.spriteAssets.darkCastleFlatLoaded = false;
      runtime.spriteAssets.darkCastleFlat.src = "assets/sprites/Background/Castle/dark castle bridge.png";
      runtime.spriteAssets.darkCastleFlat.onload = () => {
        runtime.spriteAssets.darkCastleFlatLoaded = true;
      };

      runtime.spriteAssets.fireballLoaded = false;
      runtime.spriteAssets.fireballSheet.src = "assets/sprites/FireballSheet.png";
      runtime.spriteAssets.fireballSheet.onload = () => {
        runtime.spriteAssets.fireballLoaded = true;
      };

      runtime.spriteAssets.explosionLoaded = false;
      runtime.spriteAssets.explosionSheet.src = "assets/sprites/Explosion.png";
      runtime.spriteAssets.explosionSheet.onload = () => {
        runtime.spriteAssets.explosionLoaded = true;
      };

      runtime.spriteAssets.lightningLoaded = false;
      runtime.spriteAssets.lightningSheet.src = "assets/sprites/Lightning/4.png";
      runtime.spriteAssets.lightningSheet.onload = () => {
        runtime.spriteAssets.lightningLoaded = true;
      };

      runtime.spriteAssets.gemTokenLoaded = false;
      runtime.spriteAssets.gemToken.src = "assets/sprites/Gem.png";
      runtime.spriteAssets.gemToken.onload = () => {
        runtime.spriteAssets.gemTokenLoaded = true;
      };

      runtime.spriteAssets.castleLoaded = false;
      runtime.spriteAssets.castle.src = "assets/sprites/Castle.png";
      runtime.spriteAssets.castle.onload = () => {
        runtime.spriteAssets.castleLoaded = true;
      };

      runtime.spriteAssets.wizardLoaded = false;
      runtime.spriteAssets.wizard.src = "assets/sprites/Wizard.png";
      runtime.spriteAssets.wizard.onload = () => {
        runtime.spriteAssets.wizardLoaded = true;
      };

      runtime.spriteAssets.shieldFlashLoaded = false;
      runtime.spriteAssets.shieldFlash.src = "assets/sprites/Shield/Shield_6/3.png";
      runtime.spriteAssets.shieldFlash.onload = () => {
        runtime.spriteAssets.shieldFlashLoaded = true;
      };

      runtime.spriteAssets.spellUnlockLightningLoaded = false;
      runtime.spriteAssets.spellUnlockLightningSheet.src = "assets/sprites/Effects/Lightning/lightning_sprite_sheet_5x760.png";
      runtime.spriteAssets.spellUnlockLightningSheet.onload = () => {
        runtime.spriteAssets.spellUnlockLightningLoaded = true;
      };

      runtime.spriteAssets.towerFireFrames = buildIndexedImageSequence(
        "assets/sprites/Effects/Flames/flame10/PNG",
        runtime.TOWER_FIRE_FRAME_COUNT,
        (frameIndex) => `${String(frameIndex).padStart(2, "0")}.png`,
      );
      runtime.spriteAssets.towerGroundFrames = buildIndexedImageSequence(
        "assets/sprites/Effects/Flames/flame5/png",
        runtime.TOWER_GROUND_FRAME_COUNT,
        (frameIndex) => `png_${String(frameIndex).padStart(2, "0")}.png`,
      );

      runtime.spriteAssets.wizardAnimations = {
        idle: new Image(),
        fireball: new Image(),
        lightning: new Image(),
        dead: new Image(),
      };
      runtime.spriteAssets.wizardAnimations.idle.src = "assets/sprites/Fire Wizard/Idle.png";
      runtime.spriteAssets.wizardAnimations.fireball.src = "assets/sprites/Fire Wizard/Fireball.png";
      runtime.spriteAssets.wizardAnimations.lightning.src = "assets/sprites/Fire Wizard/Attack_1.png";
      runtime.spriteAssets.wizardAnimations.dead.src = "assets/sprites/Fire Wizard/Dead.png";

      for (const enemyType of Object.keys(runtime.ENEMY_DEFS)) {
        const image = new Image();
        const fileName = runtime.ENEMY_DEFS[enemyType].spriteFile;
        image.src = `assets/sprites/${fileName}`;
        runtime.spriteAssets.enemyImages[enemyType] = image;

        if (runtime.ENEMY_DEFS[enemyType].animations) {
          runtime.spriteAssets.enemyAnimations[enemyType] = {};
          for (const animationState of Object.keys(runtime.ENEMY_DEFS[enemyType].animations)) {
            const animationImage = new Image();
            animationImage.src = runtime.ENEMY_DEFS[enemyType].animations[animationState].path;
            runtime.spriteAssets.enemyAnimations[enemyType][animationState] = animationImage;
          }
        }
      }
    }

    function buildTintedSpriteSource(image, sourceX, sourceY, sourceWidth, sourceHeight, tintColor) {
      if (!runtime.enemyTintContext || !tintColor) {
        return { image, sourceX, sourceY, sourceWidth, sourceHeight };
      }

      if (runtime.enemyTintCanvas.width !== sourceWidth || runtime.enemyTintCanvas.height !== sourceHeight) {
        runtime.enemyTintCanvas.width = sourceWidth;
        runtime.enemyTintCanvas.height = sourceHeight;
      }

      runtime.enemyTintContext.save();
      runtime.enemyTintContext.clearRect(0, 0, sourceWidth, sourceHeight);
      runtime.enemyTintContext.globalCompositeOperation = "source-over";
      runtime.enemyTintContext.drawImage(
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
      runtime.enemyTintContext.globalCompositeOperation = "multiply";
      runtime.enemyTintContext.fillStyle = tintColor;
      runtime.enemyTintContext.fillRect(0, 0, sourceWidth, sourceHeight);
      runtime.enemyTintContext.globalCompositeOperation = "destination-in";
      runtime.enemyTintContext.drawImage(
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
      runtime.enemyTintContext.restore();

      return {
        image: runtime.enemyTintCanvas,
        sourceX: 0,
        sourceY: 0,
        sourceWidth,
        sourceHeight,
      };
    }

    function drawEnemySprite(options) {
      const spriteSource = options.tintColor
        ? buildTintedSpriteSource(
          options.image,
          options.sourceX,
          options.sourceY,
          options.sourceWidth,
          options.sourceHeight,
          options.tintColor,
        )
        : {
          image: options.image,
          sourceX: options.sourceX,
          sourceY: options.sourceY,
          sourceWidth: options.sourceWidth,
          sourceHeight: options.sourceHeight,
        };

      runtime.context2d.save();
      if (options.flipHorizontally) {
        runtime.context2d.translate(options.destinationX + options.destinationWidth / 2, 0);
        runtime.context2d.scale(-1, 1);
        runtime.context2d.translate(-(options.destinationX + options.destinationWidth / 2), 0);
      }
      runtime.context2d.filter = options.drawFilter || "none";
      runtime.context2d.drawImage(
        spriteSource.image,
        spriteSource.sourceX,
        spriteSource.sourceY,
        spriteSource.sourceWidth,
        spriteSource.sourceHeight,
        options.destinationX,
        options.destinationY,
        options.destinationWidth,
        options.destinationHeight,
      );
      runtime.context2d.restore();
    }

    function drawBackground() {}
    function drawWorldMapScene() {}
    function drawTokens() {}
    function drawSelectionSlots() {}
    function drawMageTowerPuzzle() {}
    function drawEnemies() {}
    function drawTowerGroundFlames() {}
    function drawTowerProjectiles() {}
    function drawEffects() {}
    function drawProjectiles() {}
    function drawLightningEffects() {}
    function drawChainLightningEffects() {}
    function drawEndOverlay() {}
    function render() {}

    return {
      buildIndexedImageSequence,
      loadSprites,
      buildTintedSpriteSource,
      drawEnemySprite,
      drawBackground,
      drawWorldMapScene,
      drawTokens,
      drawSelectionSlots,
      drawMageTowerPuzzle,
      drawEnemies,
      drawTowerGroundFlames,
      drawTowerProjectiles,
      drawEffects,
      drawProjectiles,
      drawLightningEffects,
      drawChainLightningEffects,
      drawEndOverlay,
      render,
    };
  }

  window.MathMageRender = { createRenderHelpers };
})();