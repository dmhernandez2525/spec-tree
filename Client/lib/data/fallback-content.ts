/**
 * Fallback content for all CMS-dependent pages
 * Used when Strapi backend is unavailable
 */

import type { HomePageData, ImageAttributes } from '@/types/main';
import type {
  ContactPageAttributes,
  TermsPageAttributes,
  PrivacyPageAttributes,
  CookiesPageAttributes,
  AboutPageAttributes,
  OurProcessPageAttributes,
  BlogPageAttributes,
} from '@/api/fetchData';

/**
 * Empty placeholder image for fallback content where images are not available
 */
const emptyImageAttributes: ImageAttributes = {
  id: 0,
  documentId: '',
  name: '',
  alternativeText: null,
  caption: null,
  width: 0,
  height: 0,
  hash: '',
  ext: '',
  mime: '',
  size: 0,
  url: '',
  previewUrl: null,
  provider: '',
  provider_metadata: null,
  createdAt: '',
  updatedAt: '',
  publishedAt: '',
};

export const fallbackHomePageData: HomePageData = {
  heroData: {
    Header: 'Transform Ideas into Actionable Specs',
    SubHeader:
      'AI-powered project planning that breaks down your vision into epics, features, user stories, and tasks in minutes.',
    heroImage: { url: '', caption: '' },
  },
  ourMissionData: {
    Header: 'Our Mission',
    HeaderColor: '#000000',
    SubHeader1:
      'At Spec Tree, we believe every great product starts with a clear plan. Our mission is to democratize professional project planning by putting AI-powered specification tools in the hands of every team.',
    SubHeader2:
      'We combine cutting-edge AI technology with proven project management methodologies to help teams move from idea to execution faster than ever before.',
    SubHeader3:
      'By fostering clarity, collaboration, and comprehensive planning, we empower teams of all sizes to build better products with confidence.',
  },
  reviews: [],
  ourWorkData: [],
  ourWorkHeader: { Header: 'Our Work', HeaderColor: '#000000' },
  reviewsHeader: { Header: 'What Our Customers Say', HeaderColor: '#000000' },
  showReviews: false,
};

export const fallbackContactPageData: ContactPageAttributes = {
  id: 1,
  aboutSection: {
    header: 'Get in Touch',
    subHeader:
      "Have questions about Spec Tree? We'd love to hear from you. Send us a message and we'll respond as soon as possible.",
  },
  emailSection: {
    header: 'Email Us',
    subHeader: 'Send us an email anytime',
    helperText: 'support@spectree.app',
  },
  phoneSection: {
    header: 'Call Us',
    subHeader: 'Mon-Fri from 9am to 5pm EST',
    helperText: '+1 (555) 123-4567',
  },
  contactSection: {
    header: 'Send a Message',
    subHeader: "Fill out the form below and we'll get back to you shortly.",
  },
  faqSection: {
    header: 'Frequently Asked Questions',
    subHeader: 'Quick answers to common questions',
    items: [
      {
        header: 'What is Spec Tree?',
        subHeader:
          'Spec Tree is an AI-powered project planning tool that helps you break down ideas into structured specifications with epics, features, user stories, and tasks.',
      },
      {
        header: 'How does the AI generation work?',
        subHeader:
          'Our AI analyzes your project description and uses industry best practices to generate comprehensive breakdowns. You can refine and iterate on the generated content at any level.',
      },
      {
        header: 'Can I export my specifications?',
        subHeader:
          'Yes! You can export your entire project as JSON, CSV, or Markdown. Integration with Jira and Linear is coming soon.',
      },
      {
        header: 'Is there a free tier?',
        subHeader:
          'Yes, we offer a free tier with 3 projects and 50 AI generations per month. Upgrade for more capacity and features.',
      },
    ],
  },
};

export const fallbackTermsPageData: TermsPageAttributes = {
  id: 1,
  aboutSection: {
    header: 'Terms of Service',
    subHeader: 'Last updated: January 2026',
  },
  contentSection: `
## 1. Acceptance of Terms

By accessing and using Spec Tree ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.

## 2. Description of Service

Spec Tree provides AI-powered project planning and specification generation tools. The Service allows users to create, manage, and export project specifications including epics, features, user stories, and tasks.

## 3. User Accounts

You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.

## 4. Acceptable Use

You agree not to:
- Use the Service for any unlawful purpose
- Attempt to gain unauthorized access to the Service
- Interfere with or disrupt the Service
- Use the Service to generate harmful or malicious content

## 5. Intellectual Property

The content you create using Spec Tree remains your property. However, by using the Service, you grant us a license to host, store, and display your content as necessary to provide the Service.

## 6. AI-Generated Content

Content generated by our AI features is provided as a starting point and suggestion. You are responsible for reviewing, editing, and ensuring the accuracy of all AI-generated content before use.

## 7. Payment and Billing

Paid subscriptions are billed in advance on a monthly or annual basis. Refunds are provided in accordance with our refund policy.

## 8. Limitation of Liability

The Service is provided "as is" without warranties of any kind. We are not liable for any indirect, incidental, or consequential damages arising from your use of the Service.

## 9. Changes to Terms

We reserve the right to modify these terms at any time. Continued use of the Service after changes constitutes acceptance of the new terms.

## 10. Contact

For questions about these terms, please contact us at legal@spectree.app.
  `,
};

export const fallbackPrivacyPageData: PrivacyPageAttributes = {
  id: 1,
  aboutSection: {
    header: 'Privacy Policy',
    subHeader: 'Last updated: January 2026',
  },
  contentSection: `
## 1. Information We Collect

We collect information you provide directly, including:
- Account information (name, email, password)
- Project and specification data you create
- Payment information (processed securely by our payment provider)

We also collect usage information automatically:
- Log data (IP address, browser type, pages visited)
- Device information
- Cookies and similar technologies

## 2. How We Use Your Information

We use your information to:
- Provide and improve the Service
- Process transactions
- Send service-related communications
- Analyze usage patterns to improve user experience
- Ensure security and prevent fraud

## 3. AI Processing

Your project descriptions and content may be processed by AI services to generate specifications. This data is:
- Used only to provide the requested AI features
- Not used to train AI models without explicit consent
- Processed in accordance with our data processing agreements

## 4. Data Sharing

We do not sell your personal information. We may share data with:
- Service providers who assist in operating the Service
- Legal authorities when required by law
- Acquiring entities in the event of a merger or acquisition

## 5. Data Security

We implement industry-standard security measures to protect your data, including:
- Encryption in transit and at rest
- Regular security audits
- Access controls and authentication

## 6. Your Rights

You have the right to:
- Access your personal data
- Correct inaccurate data
- Delete your account and data
- Export your data
- Opt out of marketing communications

## 7. Data Retention

We retain your data for as long as your account is active or as needed to provide the Service. You can request deletion at any time.

## 8. Children's Privacy

The Service is not intended for users under 16 years of age. We do not knowingly collect data from children.

## 9. International Transfers

Your data may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place for such transfers.

## 10. Contact Us

For privacy-related inquiries, contact us at privacy@spectree.app.
  `,
};

export const fallbackCookiesPageData: CookiesPageAttributes = {
  id: 1,
  aboutSection: {
    header: 'Cookie Policy',
    subHeader: 'Last updated: January 2026',
  },
  contentSection: `
## What Are Cookies

Cookies are small text files stored on your device when you visit a website. They help websites remember your preferences and provide a better user experience.

## How We Use Cookies

### Essential Cookies

These cookies are necessary for the Service to function properly. They include:
- Authentication cookies to keep you logged in
- Security cookies to protect against unauthorized access
- Session cookies to maintain your session state

### Analytics Cookies

We use analytics cookies to understand how users interact with our Service:
- Page views and navigation patterns
- Feature usage statistics
- Error tracking and performance monitoring

### Preference Cookies

These cookies remember your preferences:
- Language settings
- Theme preferences (light/dark mode)
- Display preferences

## Managing Cookies

You can control cookies through your browser settings:
- Block all cookies
- Block third-party cookies
- Delete existing cookies
- Receive notifications when cookies are set

Note that blocking essential cookies may affect the functionality of the Service.

## Third-Party Cookies

We may use third-party services that set their own cookies:
- Analytics providers (for usage statistics)
- Payment processors (for secure transactions)
- Authentication providers (for social login)

## Updates to This Policy

We may update this Cookie Policy from time to time. Changes will be posted on this page with an updated revision date.

## Contact Us

For questions about our use of cookies, contact us at privacy@spectree.app.
  `,
  attributes: {} as CookiesPageAttributes,
};

export const fallbackAboutPageData: AboutPageAttributes = {
  id: 1,
  aboutSection: {
    header: 'About Spec Tree',
    subHeader:
      "We're building the future of project planning with AI-powered specification tools that help teams move from idea to execution faster.",
    cta: {
      text: 'Get Started',
      url: '/register',
    },
  },
  metricSection: {
    header: 'By the Numbers',
    subHeader: 'See our impact',
    backgroundImage: emptyImageAttributes,
    cards: [
      { header: '10,000+', subHeader: 'Projects Created' },
      { header: '50,000+', subHeader: 'Specifications Generated' },
      { header: '95%', subHeader: 'Customer Satisfaction' },
      { header: '60%', subHeader: 'Time Saved on Planning' },
    ],
  },
  newsletterSection: {
    header: 'Stay Updated',
    subHeader: 'Get the latest updates on features and best practices.',
  },
  socialSection: {
    header: 'Connect With Us',
    subHeader: 'Follow us on social media',
    links: [],
  },
  mediaContent: { data: emptyImageAttributes, meta: {} },
  wysiwyg: '',
  mediaContentHeader: '',
};

export const fallbackOurProcessPageData: OurProcessPageAttributes = {
  id: 1,
  aboutSection: {
    header: 'Our Process',
    subHeader:
      'A simple yet powerful approach to transforming your ideas into actionable specifications.',
  },
  sectionTwo: {
    header: 'How It Works',
    subHeader:
      'Spec Tree uses a hierarchical approach to break down complex projects into manageable pieces.',
  },
  wysiwygSectionTwo: `
## Step 1: Describe Your Vision

Start by describing your project or feature at a high level. What problem are you solving? Who are your users? What's the scope?

## Step 2: AI-Powered Breakdown

Our AI analyzes your description and generates a comprehensive breakdown:
- **Epics** - Major themes or initiatives
- **Features** - Specific capabilities within each epic
- **User Stories** - User-focused requirements for each feature
- **Tasks** - Actionable development tasks

## Step 3: Refine and Iterate

Review the generated content and refine it to match your needs. You can:
- Edit any item directly
- Regenerate specific sections
- Add custom items
- Reorder and reorganize

## Step 4: Export and Execute

Once your specification is complete, export it in your preferred format:
- JSON for programmatic use
- CSV for spreadsheets
- Markdown for documentation
- Direct integration with project management tools (coming soon)
  `,
  newsletterSection: {
    header: 'Ready to Get Started?',
    subHeader: 'Join thousands of teams using Spec Tree to plan better projects.',
  },
  socialSection: {
    header: 'Learn More',
    subHeader: 'Explore our resources and documentation.',
    links: [],
  },
  wysiwyg: '',
  button: {
    text: 'Start Free Trial',
    url: '/register',
  },
};

export const fallbackBlogPageData: BlogPageAttributes = {
  id: 1,
  aboutSection: {
    header: 'Blog',
    subHeader:
      'Insights, tutorials, and updates from the Spec Tree team on project planning, AI, and product development.',
  },
};
