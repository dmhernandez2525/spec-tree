/**
 * version-snapshot router
 */

import { factories } from '@strapi/strapi';

const VERSION_SNAPSHOT_UID = 'api::version-snapshot.version-snapshot' as never;

export default factories.createCoreRouter(
  VERSION_SNAPSHOT_UID
);
