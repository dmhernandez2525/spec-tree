/**
 * organization-activity service
 */

import { factories } from '@strapi/strapi';

const ORGANIZATION_ACTIVITY_UID = 'api::organization-activity.organization-activity' as never;

export default factories.createCoreService(ORGANIZATION_ACTIVITY_UID);
