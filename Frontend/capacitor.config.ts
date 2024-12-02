import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "me.mapjourney",
  appName: "Map Journey",
  webDir: "dist",
  android: {
    buildOptions: {
      keystorePath: "keystore.jks",
      keystorePassword: "mapjourney123",
      keystoreAlias: "MapJourney",
      keystoreAliasPassword: "mapjourney123",
      releaseType: "AAB",
    },
  },
};

export default config;
