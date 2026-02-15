/**
 * organization-template service
 */

import { factories } from '@strapi/strapi';

const ORGANIZATION_TEMPLATE_UID = 'api::organization-template.organization-template' as never;

export default factories.createCoreService(ORGANIZATION_TEMPLATE_UID);
