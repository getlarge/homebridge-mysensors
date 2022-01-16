import { API } from 'homebridge';

import { setHap } from './hap';
import { MySensorsPlatform } from './platform';
import { PLATFORM_NAME } from './settings';

/**
 * This method registers the platform with Homebridge
 */
export = (api: API) => {
  setHap(api.hap);
  api.registerPlatform(PLATFORM_NAME, MySensorsPlatform);
};
