/**
 * organization-activity controller
 */

import { factories } from '@strapi/strapi';

const ORGANIZATION_ACTIVITY_UID = 'api::organization-activity.organization-activity' as never;

export default factories.createCoreController(ORGANIZATION_ACTIVITY_UID);
