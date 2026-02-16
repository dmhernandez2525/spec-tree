/**
 * organization-api-key controller
 */

import { factories } from '@strapi/strapi';

const ORGANIZATION_API_KEY_UID = 'api::organization-api-key.organization-api-key' as never;

export default factories.createCoreController(ORGANIZATION_API_KEY_UID);
