import type { ClientFeedmeConfig } from "./feedme-config-loader";

declare const __FEEDME_CLIENT_CONFIG__: ClientFeedmeConfig;

const feedmeConfig: ClientFeedmeConfig = __FEEDME_CLIENT_CONFIG__;

export default feedmeConfig;
