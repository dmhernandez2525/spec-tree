/**
 * organization-audit-log router
 */

import { factories } from '@strapi/strapi';

const ORGANIZATION_AUDIT_LOG_UID = 'api::organization-audit-log.organization-audit-log' as never;

export default factories.createCoreRouter(ORGANIZATION_AUDIT_LOG_UID);
