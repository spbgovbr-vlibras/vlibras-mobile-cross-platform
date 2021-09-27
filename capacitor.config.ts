import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'br.ufpb.lavid.vlibras',
  appName: 'VLibrasMobile',
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
