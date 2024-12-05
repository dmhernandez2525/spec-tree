/**
 * navbar controller
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::navbar.navbar",
  ({ strapi }) => ({
    async find(ctx) {
      // some custom logic here
      ctx.query = { ...ctx.query, local: 'en' }
  
      // Calling the default core action
      const { data, meta } = await super.find(ctx);
      strapi.log.info(JSON.stringify(data))
      // some more custom logic
      meta.date = Date.now()
  
      return { data, meta };
    }
  })
);
