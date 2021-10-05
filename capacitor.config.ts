import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lavid.vlibrasdroid',
  appName: 'VLibras',
  webDir: 'build',
  bundledWebRuntime: false,
  cordova: {},
  server: {
    androidScheme: 'http',
    allowNavigation: ['lavid.nsa.root.sx'],
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
    },
  },
};

export default config;
