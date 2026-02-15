/**
 * organization-invite router
 */

import { factories } from '@strapi/strapi';

const ORGANIZATION_INVITE_UID = 'api::organization-invite.organization-invite' as never;

export default factories.createCoreRouter(ORGANIZATION_INVITE_UID);
