/**
 * `redirect` middleware
 */

import type { Core } from "@strapi/strapi";

export default (config, { strapi }: { strapi: Core.Strapi }) => {
  // return async (ctx, next) => {
  //   strapi.log.info('In redirect middleware.');
  //   await next();
  // };
  const redirects: any = ["/", "/index.html", "/admin", "/admin/"].map(
    (path) => ({
      method: "GET",
      path,
      handler: (ctx) => ctx.redirect("/admin/plugins/dashboard"),
      config: { auth: false },
    }),
  );
  strapi.server.routes(redirects);
};
