/* @flow */
/* eslint import/no-default-export: off */

import { getKarmaConfig } from "@krakenjs/karma-config-grumbler";

import { WEBPACK_CONFIG_TEST } from "./webpack.config";

export default function configKarma(karma: Object) {
  const karmaConfig = getKarmaConfig(karma, {
    basePath: __dirname,
    webpack: WEBPACK_CONFIG_TEST,
    // un-comment to show console.log() during tests
    // client: {
    //   captureConsole: true,
    //   mocha: {
    //     bail: true,
    //   },
    // },
  });

  karma.set(karmaConfig);
}
