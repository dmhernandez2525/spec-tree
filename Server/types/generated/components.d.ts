import type { Struct, Schema } from '@strapi/strapi';

export interface SeoSeoInformation extends Struct.ComponentSchema {
  collectionName: 'components_seo_seo_informations';
  info: {
    displayName: 'seoInformation';
    description: '';
  };
  attributes: {
    seoTitle: Schema.Attribute.String;
    seoDescription: Schema.Attribute.Text;
    keywords: Schema.Attribute.String;
  };
}

export interface SectionCardTitleCard extends Struct.ComponentSchema {
  collectionName: 'components_section_card_title_cards';
  info: {
    displayName: 'Title Card';
    icon: 'layer';
    description: '';
  };
  attributes: {
    header: Schema.Attribute.String;
    subHeader: Schema.Attribute.Text;
    headerColor: Schema.Attribute.String;
  };
}

export interface SectionCardTitleCardHelperText extends Struct.ComponentSchema {
  collectionName: 'components_section_card_title_card_helper_texts';
  info: {
    displayName: 'Title Card Helper Text';
    icon: 'feather';
  };
  attributes: {
    header: Schema.Attribute.String;
    subHeader: Schema.Attribute.String;
    helperText: Schema.Attribute.String;
  };
}

export interface SectionCardTitleCardCta extends Struct.ComponentSchema {
  collectionName: 'components_section_card_title_card_ctas';
  info: {
    displayName: 'Title Card CTA';
    icon: 'layer';
  };
  attributes: {
    header: Schema.Attribute.String;
    subHeader: Schema.Attribute.String;
    cta: Schema.Attribute.Component<'micro-component.button', false>;
  };
}

export interface SectionCardSocialOptions extends Struct.ComponentSchema {
  collectionName: 'components_section_card_social_options';
  info: {
    displayName: 'Social Options';
    icon: 'earth';
  };
  attributes: {
    header: Schema.Attribute.String;
    subHeader: Schema.Attribute.String;
    links: Schema.Attribute.Component<'datasets.icon-link', true>;
  };
}

export interface SectionCardNotes extends Struct.ComponentSchema {
  collectionName: 'components_section_card_notes';
  info: {
    displayName: 'notes';
    icon: 'file';
    description: '';
  };
  attributes: {
    content: Schema.Attribute.RichText;
  };
}

export interface SectionCardInfoNotes extends Struct.ComponentSchema {
  collectionName: 'components_section_card_info_notes';
  info: {
    displayName: 'infoNotes';
    icon: 'bulletList';
    description: '';
  };
  attributes: {
    goals: Schema.Attribute.String;
    details: Schema.Attribute.String;
  };
}

export interface SectionCardInfoButtonImage extends Struct.ComponentSchema {
  collectionName: 'components_section_card_info_button_images';
  info: {
    displayName: 'Info-Button-Image';
    description: '';
  };
  attributes: {
    title: Schema.Attribute.String & Schema.Attribute.Required;
    description: Schema.Attribute.Text;
    subText: Schema.Attribute.Text;
    image: Schema.Attribute.Media<'images'>;
    button: Schema.Attribute.Component<'micro-component.button', true>;
  };
}

export interface SectionCardFaq extends Struct.ComponentSchema {
  collectionName: 'components_section_card_faqs';
  info: {
    displayName: 'FAQ';
    icon: 'bulletList';
  };
  attributes: {
    items: Schema.Attribute.Component<'section-card.title-card', true>;
    header: Schema.Attribute.String;
    subHeader: Schema.Attribute.String;
  };
}

export interface SectionCardBackgroundCards extends Struct.ComponentSchema {
  collectionName: 'components_section_card_background_cards';
  info: {
    displayName: 'Background Cards';
    icon: 'layout';
  };
  attributes: {
    cards: Schema.Attribute.Component<'section-card.title-card', true>;
    backgroundImage: Schema.Attribute.Media<'images'>;
  };
}

export interface MicroComponentResolve extends Struct.ComponentSchema {
  collectionName: 'components_micro_component_resolves';
  info: {
    displayName: 'resolve';
    description: '';
  };
  attributes: {
    text: Schema.Attribute.String;
  };
}

export interface MicroComponentButton extends Struct.ComponentSchema {
  collectionName: 'components_micro_component_buttons';
  info: {
    displayName: 'button';
  };
  attributes: {
    text: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 180;
      }>;
    url: Schema.Attribute.String;
  };
}

export interface MicroComponentAcceptanceCriteria
  extends Struct.ComponentSchema {
  collectionName: 'components_micro_component_acceptance_criteria';
  info: {
    displayName: 'acceptanceCriteria';
  };
  attributes: {
    text: Schema.Attribute.Text;
  };
}

export interface CopyrightCopyrightFooter extends Struct.ComponentSchema {
  collectionName: 'components_copyright_copyright_footers';
  info: {
    displayName: 'CopyrightFooter';
    description: '';
  };
  attributes: {
    ownerStatement: Schema.Attribute.String;
  };
}

export interface DatasetsSmsPartialUser extends Struct.ComponentSchema {
  collectionName: 'components_datasets_sms_partial_users';
  info: {
    displayName: 'SMS Partial User';
    icon: 'phone';
    description: '';
  };
  attributes: {
    firstName: Schema.Attribute.String;
    phoneNumber: Schema.Attribute.String;
  };
}

export interface DatasetsServiceList extends Struct.ComponentSchema {
  collectionName: 'components_datasets_service_lists';
  info: {
    displayName: 'Service list';
  };
  attributes: {
    listEntry: Schema.Attribute.Text;
  };
}

export interface DatasetsRisksAndMitigation extends Struct.ComponentSchema {
  collectionName: 'components_datasets_risks_and_mitigations';
  info: {
    displayName: 'risksAndMitigation';
    description: '';
  };
  attributes: {
    own: Schema.Attribute.Component<'datasets.own', true>;
    accept: Schema.Attribute.Component<'datasets.accept', true>;
    mitigate: Schema.Attribute.Component<'datasets.mitigate', true>;
    resolve: Schema.Attribute.Component<'micro-component.resolve', true>;
  };
}

export interface DatasetsReviewsSection extends Struct.ComponentSchema {
  collectionName: 'components_datasets_reviews_sections';
  info: {
    displayName: 'ReviewsSection';
  };
  attributes: {
    text: Schema.Attribute.String;
  };
}

export interface DatasetsReviewsHeader extends Struct.ComponentSchema {
  collectionName: 'components_datasets_reviews_headers';
  info: {
    displayName: 'ReviewsHeader';
  };
  attributes: {
    Header: Schema.Attribute.String;
    HeaderColor: Schema.Attribute.String;
  };
}

export interface DatasetsResolve extends Struct.ComponentSchema {
  collectionName: 'components_datasets_resolves';
  info: {
    displayName: 'resolve';
  };
  attributes: {};
}

export interface DatasetsProcessWheelSection extends Struct.ComponentSchema {
  collectionName: 'components_datasets_process_wheel_sections';
  info: {
    displayName: 'ProcessWheelSection';
    description: '';
  };
  attributes: {
    title: Schema.Attribute.String;
    subHeader: Schema.Attribute.String;
    description: Schema.Attribute.Text;
    color: Schema.Attribute.String;
    icon: Schema.Attribute.Media<'images' | 'files'>;
  };
}

export interface DatasetsPartialUser extends Struct.ComponentSchema {
  collectionName: 'components_datasets_partial_users';
  info: {
    displayName: 'Partial User';
    icon: 'alien';
    description: '';
  };
  attributes: {
    firstName: Schema.Attribute.String;
    lastName: Schema.Attribute.String;
    email: Schema.Attribute.Email & Schema.Attribute.Required;
    phoneNumber: Schema.Attribute.String;
  };
}

export interface DatasetsOwn extends Struct.ComponentSchema {
  collectionName: 'components_datasets_owns';
  info: {
    displayName: 'own';
    description: '';
  };
  attributes: {
    text: Schema.Attribute.String;
  };
}

export interface DatasetsOurWorkSection extends Struct.ComponentSchema {
  collectionName: 'components_datasets_our_work_sections';
  info: {
    displayName: 'OurWorkSection';
    description: '';
  };
  attributes: {
    heading: Schema.Attribute.String;
    description: Schema.Attribute.Text;
    image: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    backgroundColor: Schema.Attribute.String;
    icon: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
  };
}

export interface DatasetsOurWorkHeader extends Struct.ComponentSchema {
  collectionName: 'components_datasets_our_work_headers';
  info: {
    displayName: 'ourWorkHeader';
  };
  attributes: {
    Header: Schema.Attribute.String;
    HeaderColor: Schema.Attribute.String;
  };
}

export interface DatasetsOurServices extends Struct.ComponentSchema {
  collectionName: 'components_datasets_our_services';
  info: {
    displayName: 'OurServices';
    description: '';
  };
  attributes: {
    Service: Schema.Attribute.String;
    ServiceDescription: Schema.Attribute.Text;
    serviceList: Schema.Attribute.Component<'datasets.service-list', true>;
    ServiceTitle: Schema.Attribute.String;
    ListTitle: Schema.Attribute.String;
  };
}

export interface DatasetsOurServicesHeader extends Struct.ComponentSchema {
  collectionName: 'components_datasets_our_services_headers';
  info: {
    displayName: 'OurServicesHeader';
  };
  attributes: {
    Header: Schema.Attribute.String;
    HeaderColor: Schema.Attribute.String;
  };
}

export interface DatasetsOurProcessSection extends Struct.ComponentSchema {
  collectionName: 'components_datasets_our_process_sections';
  info: {
    displayName: 'OurProcessSection';
  };
  attributes: {
    Header: Schema.Attribute.String;
    HeaderColor: Schema.Attribute.String;
  };
}

export interface DatasetsOurMissionSection extends Struct.ComponentSchema {
  collectionName: 'components_datasets_our_mission_sections';
  info: {
    displayName: 'OurMissionSection';
    description: '';
  };
  attributes: {
    Header: Schema.Attribute.String;
    SubHeader1: Schema.Attribute.Text;
    SubHeader2: Schema.Attribute.Text;
    SubHeader3: Schema.Attribute.Text;
    HeaderColor: Schema.Attribute.String;
  };
}

export interface DatasetsMitigate extends Struct.ComponentSchema {
  collectionName: 'components_datasets_mitigates';
  info: {
    displayName: 'mitigate';
    description: '';
  };
  attributes: {
    text: Schema.Attribute.String;
  };
}

export interface DatasetsItems extends Struct.ComponentSchema {
  collectionName: 'components_datasets_items';
  info: {
    displayName: 'items';
    icon: 'file';
  };
  attributes: {
    text: Schema.Attribute.String;
    icon: Schema.Attribute.Media<'images'>;
  };
}

export interface DatasetsIconLink extends Struct.ComponentSchema {
  collectionName: 'components_datasets_icon_links';
  info: {
    displayName: 'Icon Link';
    icon: 'link';
  };
  attributes: {
    icon: Schema.Attribute.Media<'images'>;
    link: Schema.Attribute.String;
  };
}

export interface DatasetsHeroSection extends Struct.ComponentSchema {
  collectionName: 'components_datasets_hero_sections';
  info: {
    displayName: 'HeroSection';
    description: '';
  };
  attributes: {
    Header: Schema.Attribute.String;
    SubHeader: Schema.Attribute.String;
    heroImage: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
  };
}

export interface DatasetsEmergencyContact extends Struct.ComponentSchema {
  collectionName: 'components_datasets_emergency_contacts';
  info: {
    displayName: 'emergencyContact';
    icon: 'handHeart';
  };
  attributes: {
    firstName: Schema.Attribute.String;
    lastName: Schema.Attribute.String;
    email: Schema.Attribute.String;
    relationship: Schema.Attribute.String;
    phoneNumber: Schema.Attribute.String;
  };
}

export interface DatasetsEmailOptions extends Struct.ComponentSchema {
  collectionName: 'components_datasets_email_options';
  info: {
    displayName: 'Email Options';
    icon: 'book';
    description: '';
  };
  attributes: {
    subject: Schema.Attribute.String;
    from: Schema.Attribute.String;
    to: Schema.Attribute.String;
    cc: Schema.Attribute.String;
    bcc: Schema.Attribute.String;
    replyTo: Schema.Attribute.String;
  };
}

export interface DatasetsEmailContent extends Struct.ComponentSchema {
  collectionName: 'components_datasets_email_contents';
  info: {
    displayName: 'Email Content';
    icon: 'file';
  };
  attributes: {
    subject: Schema.Attribute.String & Schema.Attribute.Required;
    emailBody: Schema.Attribute.RichText & Schema.Attribute.Required;
  };
}

export interface DatasetsAccept extends Struct.ComponentSchema {
  collectionName: 'components_datasets_accepts';
  info: {
    displayName: 'accept';
    description: '';
  };
  attributes: {
    text: Schema.Attribute.String;
  };
}

export interface BannerLogo extends Struct.ComponentSchema {
  collectionName: 'components_banner_logos';
  info: {
    displayName: 'Logo';
    description: '';
  };
  attributes: {
    logo: Schema.Attribute.Media<'images'> & Schema.Attribute.Required;
  };
}

export interface AddressAddress extends Struct.ComponentSchema {
  collectionName: 'components_address_address_s';
  info: {
    displayName: 'completeAddress';
    description: '';
  };
  attributes: {
    street: Schema.Attribute.String;
    state: Schema.Attribute.String;
    country: Schema.Attribute.String;
    zipCode: Schema.Attribute.String;
    city: Schema.Attribute.String;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'seo.seo-information': SeoSeoInformation;
      'section-card.title-card': SectionCardTitleCard;
      'section-card.title-card-helper-text': SectionCardTitleCardHelperText;
      'section-card.title-card-cta': SectionCardTitleCardCta;
      'section-card.social-options': SectionCardSocialOptions;
      'section-card.notes': SectionCardNotes;
      'section-card.info-notes': SectionCardInfoNotes;
      'section-card.info-button-image': SectionCardInfoButtonImage;
      'section-card.faq': SectionCardFaq;
      'section-card.background-cards': SectionCardBackgroundCards;
      'micro-component.resolve': MicroComponentResolve;
      'micro-component.button': MicroComponentButton;
      'micro-component.acceptance-criteria': MicroComponentAcceptanceCriteria;
      'copyright.copyright-footer': CopyrightCopyrightFooter;
      'datasets.sms-partial-user': DatasetsSmsPartialUser;
      'datasets.service-list': DatasetsServiceList;
      'datasets.risks-and-mitigation': DatasetsRisksAndMitigation;
      'datasets.reviews-section': DatasetsReviewsSection;
      'datasets.reviews-header': DatasetsReviewsHeader;
      'datasets.resolve': DatasetsResolve;
      'datasets.process-wheel-section': DatasetsProcessWheelSection;
      'datasets.partial-user': DatasetsPartialUser;
      'datasets.own': DatasetsOwn;
      'datasets.our-work-section': DatasetsOurWorkSection;
      'datasets.our-work-header': DatasetsOurWorkHeader;
      'datasets.our-services': DatasetsOurServices;
      'datasets.our-services-header': DatasetsOurServicesHeader;
      'datasets.our-process-section': DatasetsOurProcessSection;
      'datasets.our-mission-section': DatasetsOurMissionSection;
      'datasets.mitigate': DatasetsMitigate;
      'datasets.items': DatasetsItems;
      'datasets.icon-link': DatasetsIconLink;
      'datasets.hero-section': DatasetsHeroSection;
      'datasets.emergency-contact': DatasetsEmergencyContact;
      'datasets.email-options': DatasetsEmailOptions;
      'datasets.email-content': DatasetsEmailContent;
      'datasets.accept': DatasetsAccept;
      'banner.logo': BannerLogo;
      'address.address': AddressAddress;
    }
  }
}
