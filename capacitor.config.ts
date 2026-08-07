import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lavid.vlibrasdroid',
  appName: 'VLibras',
  webDir: 'build',
  bundledWebRuntime: false,
  cordova: {},
  server: {
    iosScheme: 'https',
    androidScheme: 'http',
    allowNavigation: [
      'lavid.nsa.root.sx',
      'transcodificador.vlibras.gov.br',
    ],
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
    },
    CapacitorHttp: {
      enabled: true,
    },
  },
};

export default config;
