/**
 * organization-activity router
 */

import { factories } from '@strapi/strapi';

const ORGANIZATION_ACTIVITY_UID = 'api::organization-activity.organization-activity' as never;

export default factories.createCoreRouter(ORGANIZATION_ACTIVITY_UID);
