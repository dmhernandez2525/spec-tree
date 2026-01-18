import { describe, it, expect } from 'vitest';
import {
  fallbackHomePageData,
  fallbackContactPageData,
  fallbackTermsPageData,
  fallbackPrivacyPageData,
  fallbackCookiesPageData,
  fallbackAboutPageData,
  fallbackOurProcessPageData,
  fallbackBlogPageData,
} from './fallback-content';

describe('fallback-content', () => {
  describe('fallbackHomePageData', () => {
    it('exports fallback home page data', () => {
      expect(fallbackHomePageData).toBeDefined();
    });

    it('has hero data with header and subheader', () => {
      expect(fallbackHomePageData.heroData).toBeDefined();
      expect(fallbackHomePageData.heroData.Header).toBeDefined();
      expect(fallbackHomePageData.heroData.SubHeader).toBeDefined();
    });

    it('has our mission data', () => {
      expect(fallbackHomePageData.ourMissionData).toBeDefined();
      expect(fallbackHomePageData.ourMissionData.Header).toBe('Our Mission');
    });
  });

  describe('fallbackContactPageData', () => {
    it('exports fallback contact page data', () => {
      expect(fallbackContactPageData).toBeDefined();
    });

    it('has about section', () => {
      expect(fallbackContactPageData.aboutSection).toBeDefined();
      expect(fallbackContactPageData.aboutSection.header).toBe('Get in Touch');
    });

    it('has email section', () => {
      expect(fallbackContactPageData.emailSection).toBeDefined();
    });

    it('has phone section', () => {
      expect(fallbackContactPageData.phoneSection).toBeDefined();
    });
  });

  describe('fallbackTermsPageData', () => {
    it('exports fallback terms page data', () => {
      expect(fallbackTermsPageData).toBeDefined();
    });

    it('has about section with header', () => {
      expect(fallbackTermsPageData.aboutSection).toBeDefined();
      expect(fallbackTermsPageData.aboutSection.header).toBe('Terms of Service');
    });
  });

  describe('fallbackPrivacyPageData', () => {
    it('exports fallback privacy page data', () => {
      expect(fallbackPrivacyPageData).toBeDefined();
    });

    it('has about section with header', () => {
      expect(fallbackPrivacyPageData.aboutSection).toBeDefined();
      expect(fallbackPrivacyPageData.aboutSection.header).toBe('Privacy Policy');
    });
  });

  describe('fallbackCookiesPageData', () => {
    it('exports fallback cookies page data', () => {
      expect(fallbackCookiesPageData).toBeDefined();
    });

    it('has about section with header', () => {
      expect(fallbackCookiesPageData.aboutSection).toBeDefined();
      expect(fallbackCookiesPageData.aboutSection.header).toBeDefined();
    });
  });

  describe('fallbackAboutPageData', () => {
    it('exports fallback about page data', () => {
      expect(fallbackAboutPageData).toBeDefined();
    });

    it('has about section with header', () => {
      expect(fallbackAboutPageData.aboutSection).toBeDefined();
      expect(fallbackAboutPageData.aboutSection.header).toBeDefined();
    });
  });

  describe('fallbackOurProcessPageData', () => {
    it('exports fallback our process page data', () => {
      expect(fallbackOurProcessPageData).toBeDefined();
    });

    it('has about section with header', () => {
      expect(fallbackOurProcessPageData.aboutSection).toBeDefined();
      expect(fallbackOurProcessPageData.aboutSection.header).toBeDefined();
    });
  });

  describe('fallbackBlogPageData', () => {
    it('exports fallback blog page data', () => {
      expect(fallbackBlogPageData).toBeDefined();
    });

    it('has about section with header', () => {
      expect(fallbackBlogPageData.aboutSection).toBeDefined();
      expect(fallbackBlogPageData.aboutSection.header).toBe('Blog');
    });
  });
});
