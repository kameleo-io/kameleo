const { KameleoLocalApiClient } = require("@kameleo/local-api-client");
const { chromium } = require("playwright");
const { createCursor } = require('ghost-cursor-playwright');
const cv = require("@u4/opencv4nodejs");
const fs = require("fs");

(async () => {
  const client = new KameleoLocalApiClient();
  const fingerprints = await client.fingerprint.searchFingerprints("desktop", null, "chrome");
    const createProfileRequest = {
      fingerprintId: fingerprints[0].id,
      name: "Click CloudFlare Checkbox - With OpenCV",
    };
    const profile = await client.profile.createProfile(createProfileRequest);
  try {    
    await client.profile.startProfile(profile.id, {
      arguments: ["window-size=1280,840"]
    });

    const browserWSEndpoint = `ws://localhost:5050/playwright/${profile.id}`;
    const browser = await chromium.connectOverCDP(browserWSEndpoint);
    const context = browser.contexts()[0];
    const page = await context.newPage();

    console.log("Navigating to target page...");
    await page.goto("https://www.indeed.com/cmp/Burger-King/reviews");
    await page.waitForTimeout(10000);

    const fullScreenshotBuffer = await page.screenshot({ fullPage: true });

    const { x: clickX, y: clickY } = await locateClickPosition(fullScreenshotBuffer);

    console.log(`Click coordinates: (${clickX}, ${clickY})`);
    let cursor = null;
    try {
      cursor = await createCursor(page);
      console.log("Ghost Cursor initialized.");
    } catch (e) {
      console.warn("Ghost Cursor failed, using native mouse.", e);
    }

    if (cursor) {
      try {
        await cursor.actions.move({ x: clickX, y: clickY });
        await page.waitForTimeout(300);
        await cursor.actions.click();
        console.log(`Clicked at (${clickX}, ${clickY}) with Ghost Cursor.`);
      } catch {
        await page.mouse.move(clickX, clickY, { steps: 10 });
        await page.mouse.click(clickX, clickY);
        console.log(`Clicked at (${clickX}, ${clickY}) with native mouse fallback.`);
      }
    } else {
      await page.mouse.move(clickX, clickY, { steps: 10 });
      await page.mouse.click(clickX, clickY);
      console.log(`Clicked at (${clickX}, ${clickY}) with native mouse.`);
    }

    await page.waitForTimeout(5000);
    console.log("Done.");
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await client.profile.stopProfile(profile.id);
    console.log("Profile stopped.");
  }
})();

async function locateClickPosition(fullScreenshotBuffer) {
  const entireFrameNormal = fs.readFileSync("entire_frame.png");
  const entireFrameDark = fs.readFileSync("entire_frame_dark.png");
  const captchaBoxNormal = fs.readFileSync("captcha_box.png");
  const captchaBoxDark = fs.readFileSync("captcha_box_dark.png");

  let bestMatch = null;
  try { bestMatch = { mode: "normal", ...(await findTemplateMatchCoordinates(fullScreenshotBuffer, entireFrameNormal, 0.7)) }; } catch { }
  try {
    const darkMatch = await findTemplateMatchCoordinates(fullScreenshotBuffer, entireFrameDark, 0.7);
    if (!bestMatch || darkMatch.confidence > bestMatch.confidence) bestMatch = { mode: "dark", ...darkMatch };
  } catch { }

  if (!bestMatch) throw new Error("Could not find the Cloudflare entire frame.");

  console.log(`Detected entire frame (${bestMatch.mode} mode) confidence ${bestMatch.confidence.toFixed(2)} at (${bestMatch.clickX}, ${bestMatch.clickY})`);

  const fullImg = cv.imdecode(fullScreenshotBuffer);
  const entireFrameTemplate = (bestMatch.mode === "normal") ? cv.imdecode(entireFrameNormal) : cv.imdecode(entireFrameDark);

  const roiX = bestMatch.clickX - Math.floor(entireFrameTemplate.cols / 2);
  const roiY = bestMatch.clickY - Math.floor(entireFrameTemplate.rows / 2);

  const roiRect = new cv.Rect(
    Math.max(0, roiX),
    Math.max(0, roiY),
    entireFrameTemplate.cols,
    entireFrameTemplate.rows
  );

  if (roiRect.x + roiRect.width > fullImg.cols || roiRect.y + roiRect.height > fullImg.rows)
    throw new Error("Matched entire frame ROI out of bounds.");

  const croppedEntireFrame = fullImg.getRegion(roiRect);
  const captchaBoxTemplateBuffer = (bestMatch.mode === "normal") ? captchaBoxNormal : captchaBoxDark;

  const matchBox = await findTemplateMatchCoordinates(cv.imencode(".png", croppedEntireFrame), captchaBoxTemplateBuffer, 0.7);

  console.log(`Captcha box detected with confidence ${matchBox.confidence.toFixed(2)} at (${matchBox.clickX}, ${matchBox.clickY}) inside frame.`);

  return {
    x: roiRect.x + matchBox.clickX,
    y: roiRect.y + matchBox.clickY,
  };
}

async function findTemplateMatchCoordinates(sourceBuffer, templateBuffer, confidenceThreshold = 0.8) {
  const sourceMat = cv.imdecode(sourceBuffer);
  const templateMat = cv.imdecode(templateBuffer);

  if (sourceMat.empty || templateMat.empty) throw new Error("Failed to decode images.");

  const result = sourceMat.matchTemplate(templateMat, cv.TM_CCOEFF_NORMED);
  const { maxVal, maxLoc } = result.minMaxLoc();

  if (maxVal < confidenceThreshold) throw new Error(`No good match found: confidence ${maxVal.toFixed(2)}`);

  return {
    clickX: maxLoc.x + Math.floor(templateMat.cols / 2),
    clickY: maxLoc.y + Math.floor(templateMat.rows / 2),
    confidence: maxVal,
  };
}