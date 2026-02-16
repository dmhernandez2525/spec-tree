/**
 * organization-invite controller
 */

import { factories } from '@strapi/strapi';

const ORGANIZATION_INVITE_UID = 'api::organization-invite.organization-invite' as never;

export default factories.createCoreController(ORGANIZATION_INVITE_UID);
