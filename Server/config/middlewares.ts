export default [
  "strapi::logger",
  "strapi::errors",
  {
    /**
     * Security - CSP Configuration
     *
     * The current Content Security Policy allows 'unsafe-inline' and 'unsafe-eval'
     * for script sources to support the PDF viewer functionality. This relaxes
     * security restrictions and should be reviewed when updating the PDF viewer.
     */
    name: "strapi::security",
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          // This is is so we can develop locally with the POS / iframe on localhost:3000
          ...(process.env.POS_URL === "http://localhost:3000"
            ? {
                //Added 'unsafe-eval' for the PDF viewer in the Modal component to work
                "script-src": [
                  "'self'",
                  "https:",
                  "'unsafe-inline'",
                  "'unsafe-eval'",
                  "editor.unlayer.com",
                ],
                "frame-src": [
                  "'self'",
                  "https:",
                  "http://localhost:3000",
                  "editor.unlayer.com",
                ],
                //Added "data:" for the PDF viewer in the Modal component to work
                "connect-src": [
                  "'self'",
                  "https:",
                  "http://localhost:1337",
                  "http://localhost:3000",
                  "http://localhost:5500",
                  "data:",
                  "editor.unlayer.com",
                ],
              }
            : {
                //Added  "'unsafe-inline'", "'unsafe-eval'" for the PDF viewer in the Modal component to work
                "script-src": [
                  "'self'",
                  "https:",
                  "'unsafe-inline'",
                  "'unsafe-eval'",
                  "editor.unlayer.com",
                ],
                "frame-src": ["'self'", "https:", "editor.unlayer.com"],
                //Added "data:" for the PDF viewer in the Modal component to work
                "connect-src": [
                  "'self'",
                  "https:",
                  "data:",
                  "editor.unlayer.com",
                ],
              }),
          "img-src": [
            "'self'",
            "data:",
            "blob:",
            "cdn.jsdelivr.net",
            "strapi.io",
            "s3.amazonaws.com",
            `${process.env.AWS_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com`,
          ],
          "media-src": [
            "'self'",
            "data:",
            "blob:",
            `${process.env.AWS_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com`,
          ],
          upgradeInsecureRequests: null,
        },
      },
    },
  },
  // This is so we can develop locally with the POS / iframe on localhost:3000
  process.env.POS_URL === "http://localhost:3000"
    ? {
        name: "strapi::cors",
        config: {
          headers: "*",
          origin: [
            "http://localhost:3000",
            "http://localhost:1337",
            "http://localhost:5500",
          ],
        },
      }
    : "strapi::cors",
  {
    name: "strapi::poweredBy",
    config: {
      poweredBy: "Spec Tree <https://spectree.dev>",
    },
  },
  "strapi::poweredBy",
  "strapi::query",
  {
    name: "strapi::body",
    config: {
      formidable: {
        maxFileSize: 750 * 1024 * 1024, // multipart data, modify here limit of uploaded file size
      },
    },
  },
  "strapi::session",
  "strapi::favicon",
  "strapi::public",
  { resolve: "./src/middlewares/redirect" },
];
