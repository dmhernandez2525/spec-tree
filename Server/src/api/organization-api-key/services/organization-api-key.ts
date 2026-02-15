/**
 * organization-api-key service
 */

import { factories } from '@strapi/strapi';

const ORGANIZATION_API_KEY_UID = 'api::organization-api-key.organization-api-key' as never;

export default factories.createCoreService(ORGANIZATION_API_KEY_UID);
