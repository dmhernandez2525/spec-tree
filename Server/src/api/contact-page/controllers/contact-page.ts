/**
 * contact-page controller
 */

import { factories, Schema } from "@strapi/strapi";
import { yup } from "@strapi/utils";
import { Data } from "@strapi/types";
import { Context } from "koa";

// Updated interface for ContactRequestBody to match the new request structure
interface ContactRequestBody {
  name: string;
  email: string;
  message: string;
  phoneNumber: string;
}

// Define or import your schema's UID
type ContactPageUID = "api::contact-page.contact-page";

// Extended context interface for type-safe request body access
interface ExtendedContext extends Context {
  request: Context["request"] & { body: ContactRequestBody };
}
export default factories.createCoreController(
  "api::contact-page.contact-page",
  ({ strapi }) => ({
    async contactUs(ctx: ExtendedContext) {
      try {
        // Define validation schema
        const contactSchema = yup.object().shape({
          name: yup.string().required("Name is required"),
          email: yup
            .string()
            .email("Invalid email address")
            .required("Email is required"),
          message: yup.string().required("Message is required"),
          phoneNumber: yup.string().required("Phone number is required"),
        });

        // Validate the incoming request data
        await contactSchema.validate(ctx.request.body);

        // Sanitize the input
        const sanitizedData = await strapi.contentAPI.sanitize.input(
          ctx.request.body,
          strapi.contentType("api::contact-page.contact-page"),
        );

        // Extract the sanitized data
        const { name, email, message, phoneNumber } =
          sanitizedData as ContactRequestBody;

        // Fetch the contact email from the contact page
        const contactPage: Data.ContentType<ContactPageUID, "emailSection"> =
          await strapi.documents("api::contact-page.contact-page").findFirst({
            populate: ["emailSection"],
          });

        if (
          !contactPage ||
          !contactPage.emailSection ||
          !contactPage.emailSection.helperText
        ) {
          return ctx.badRequest("Contact email is not configured properly.");
        }

        const contactEmail = contactPage.emailSection.helperText;

        // Prepare the email options
        const emailOptions = {
          to: contactEmail,
          replyTo: email,
          subject: `Contact Us Message from ${name}`,
          text: message,
          html: `<p>${message}</p><p>From: ${name} (${email})</p><p>Phone: ${phoneNumber}</p>`,
        };

        // Send the email using Strapi's email plugin
        await strapi.plugins["email"].services.email.send(emailOptions);

        // Respond with a success message
        ctx.body = {
          message: "Your message has been sent successfully.",
          success: true,
        };
      } catch (error) {
        // Catch and handle validation errors or any other errors during the process
        console.error(
          "Unexpected error during contact form submission:",
          error,
        );
        ctx.internalServerError(
          "An unexpected error occurred while submitting the contact form.",
        );
        return ctx.badRequest(`Validation error ${error.message}`);
      }
    },
  }),
);
