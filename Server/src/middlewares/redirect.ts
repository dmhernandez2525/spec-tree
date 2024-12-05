/**
 * `redirect` middleware
 */

import type { Core } from "@strapi/strapi";

export default (config, { strapi }: { strapi: Core.Strapi }) => {
  // return async (ctx, next) => {
  //   strapi.log.info('In redirect middleware.');
  //   await next();
  // };
  // TODO-p2: bring back when we have the dashboard fixed
  const redirects: any = ["/", "/index.html", "/admin", "/admin/"].map(
    (path) => ({
      method: "GET",
      path,
      // handler: (ctx) => ctx.redirect("/admin/plugins/dashboard"),
      handler: (ctx) => ctx.redirect("/admin/plugins/dry-calendar"),
      config: { auth: false },
    }),
  );
  strapi.server.routes(redirects);
};
