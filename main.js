const { app, BrowserWindow, desktopCapturer, screen, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });

  win.loadFile('index.html');
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  // On macOS, only quit when explicitly told to do so, otherwise, leave the app running.
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

ipcMain.on('capture-screenshot', async (event) => {
  try {
    const screenShotInfo = await captureScreen();
    const platformPath = process.platform === 'darwin' ? 'mac' : 'windows';
    const imagePath = path.join(__dirname, `${platformPath}_${Date.now()}.png`);
    await saveImage(screenShotInfo, imagePath);
    event.sender.send('screenshot-captured', imagePath);
  } catch (error) {
    console.error('Error capturing or saving screenshot:', error);
    event.sender.send('screenshot-error', error.message || 'Unknown error');
  }
});

async function captureScreen() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.size;
  const options = {
    types: ['screen'],
    thumbnailSize: { width, height },
  };

  const sources = await desktopCapturer.getSources(options);
  const primarySource = sources.find(({ display_id }) => display_id == primaryDisplay.id);
  return primarySource.thumbnail;
}

function saveImage(image, imagePath) {
  return new Promise((resolve, reject) => {
    fs.writeFile(imagePath, image.toPNG(), (error) => {
      if (error) {
        reject(error);
      } else {
        console.log('Screenshot saved:', imagePath);
        resolve();
      }
    });
  });
}
