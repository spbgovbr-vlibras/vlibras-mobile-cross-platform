import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'lavid.ufpb.vlibras.mobile',
  appName: 'VLibrasMobile',
  webDir: 'build',
  bundledWebRuntime: false,
  cordova: {},
  "server": {
    "androidScheme": "http",
    "allowNavigation": [
      "lavid.nsa.root.sx"
    ]
  },
  "plugins": {
    "SplashScreen": {
      "launchShowDuration": 0
    }
  }
};

export default config;
