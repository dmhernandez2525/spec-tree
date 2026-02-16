/**
 * organization-member service
 */

import { factories } from '@strapi/strapi';

const ORGANIZATION_MEMBER_UID = 'api::organization-member.organization-member' as never;

export default factories.createCoreService(ORGANIZATION_MEMBER_UID);
