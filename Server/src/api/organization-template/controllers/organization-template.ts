/**
 * organization-template controller
 */

import { factories } from '@strapi/strapi';

const ORGANIZATION_TEMPLATE_UID = 'api::organization-template.organization-template' as never;

export default factories.createCoreController(ORGANIZATION_TEMPLATE_UID);
