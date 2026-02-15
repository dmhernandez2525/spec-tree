/**
 * version-snapshot service
 */

import { factories } from '@strapi/strapi';

const VERSION_SNAPSHOT_UID = 'api::version-snapshot.version-snapshot' as never;

export default factories.createCoreService(
  VERSION_SNAPSHOT_UID
);
