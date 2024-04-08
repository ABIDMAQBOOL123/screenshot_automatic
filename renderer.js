async function takeScreenshot() {
  await window.screenshot.captureScreenShot()
  window.screenshot.screenShotCaptured((event, imagePath) => {
    document.getElementById('screenshot-image').src = imagePath;
  });
}



setInterval(takeScreenshot, 7000)



