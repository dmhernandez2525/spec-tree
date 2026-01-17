export default ({ env }) => {
  return {
    "users-permissions": {
      config: {
        jwt: {
          expiresIn: "30d",
        },
      },
    },
    email: {
      config: {
        provider: "sendgrid", // For community providers pass the full package name (e.g. provider: 'strapi-provider-email-mandrill')
        providerOptions: {
          apiKey: env("SENDGRID_API_KEY"),
          // twilioAccountSid: env("TWILIO_ACCOUNT_SID"),
          // twilioAuthToken: env("TWILIO_AUTH_TOKEN"),
        },
        settings: {
          defaultFrom: env(
            "DEFAULT_FROM",
            "noreply@spectree.dev"
          ),
          defaultReplyTo: env(
            "DEFAULT_REPLY_TO",
            "support@spectree.dev"
          ),
        },
        smsSettings: {
          // SMS integration: Configure TWILIO_PHONE_NUMBER in environment
        },
        templates: {},
      },
    },
    upload: {
      config: {
        sizeLimit: 750 * 1024 * 1024, // 750mb in bytes
        provider: "aws-s3",
        providerOptions: {
          s3Options: {
            accessKeyId: env("AWS_ACCESS_KEY_ID"),
            secretAccessKey: env("AWS_ACCESS_SECRET"),
            region: env("AWS_REGION"),
            params: {
              ACL: "private",
              Bucket: env("AWS_BUCKET"),
              signedUrlExpires: env("AWS_SIGNED_URL_EXPIRES", 15 * 60),
            },
          },
        },
        actionOptions: {
          upload: {},
          uploadStream: {},
          delete: {},
        },
      },
    },
  };
};
