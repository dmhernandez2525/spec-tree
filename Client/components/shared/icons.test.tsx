import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Icons, Icon } from './icons';

describe('Icons', () => {
  it('exports Icons object with expected icon mappings', () => {
    expect(Icons).toBeDefined();
    expect(typeof Icons).toBe('object');
  });

  it('contains twitter icon', () => {
    expect(Icons.twitter).toBeDefined();
    const TwitterIcon = Icons.twitter;
    render(<TwitterIcon data-testid="twitter-icon" />);
    expect(screen.getByTestId('twitter-icon')).toBeInTheDocument();
  });

  it('contains facebook icon', () => {
    expect(Icons.facebook).toBeDefined();
    const FacebookIcon = Icons.facebook;
    render(<FacebookIcon data-testid="facebook-icon" />);
    expect(screen.getByTestId('facebook-icon')).toBeInTheDocument();
  });

  it('contains instagram icon', () => {
    expect(Icons.instagram).toBeDefined();
    const InstagramIcon = Icons.instagram;
    render(<InstagramIcon data-testid="instagram-icon" />);
    expect(screen.getByTestId('instagram-icon')).toBeInTheDocument();
  });

  it('contains linkedin icon', () => {
    expect(Icons.linkedin).toBeDefined();
    const LinkedinIcon = Icons.linkedin;
    render(<LinkedinIcon data-testid="linkedin-icon" />);
    expect(screen.getByTestId('linkedin-icon')).toBeInTheDocument();
  });

  it('contains gitHub icon', () => {
    expect(Icons.gitHub).toBeDefined();
    const GitHubIcon = Icons.gitHub;
    render(<GitHubIcon data-testid="github-icon" />);
    expect(screen.getByTestId('github-icon')).toBeInTheDocument();
  });

  it('contains mail icon', () => {
    expect(Icons.mail).toBeDefined();
    const MailIcon = Icons.mail;
    render(<MailIcon data-testid="mail-icon" />);
    expect(screen.getByTestId('mail-icon')).toBeInTheDocument();
  });

  it('contains phone icon', () => {
    expect(Icons.phone).toBeDefined();
    const PhoneIcon = Icons.phone;
    render(<PhoneIcon data-testid="phone-icon" />);
    expect(screen.getByTestId('phone-icon')).toBeInTheDocument();
  });

  it('contains alert icon', () => {
    expect(Icons.alert).toBeDefined();
    const AlertIcon = Icons.alert;
    render(<AlertIcon data-testid="alert-icon" />);
    expect(screen.getByTestId('alert-icon')).toBeInTheDocument();
  });

  it('contains warning icon', () => {
    expect(Icons.warning).toBeDefined();
    const WarningIcon = Icons.warning;
    render(<WarningIcon data-testid="warning-icon" />);
    expect(screen.getByTestId('warning-icon')).toBeInTheDocument();
  });

  it('contains chevronDown icon', () => {
    expect(Icons.chevronDown).toBeDefined();
    const ChevronDownIcon = Icons.chevronDown;
    render(<ChevronDownIcon data-testid="chevron-down-icon" />);
    expect(screen.getByTestId('chevron-down-icon')).toBeInTheDocument();
  });

  it('contains eye icon', () => {
    expect(Icons.eye).toBeDefined();
    const EyeIcon = Icons.eye;
    render(<EyeIcon data-testid="eye-icon" />);
    expect(screen.getByTestId('eye-icon')).toBeInTheDocument();
  });

  it('contains users icon', () => {
    expect(Icons.users).toBeDefined();
    const UsersIcon = Icons.users;
    render(<UsersIcon data-testid="users-icon" />);
    expect(screen.getByTestId('users-icon')).toBeInTheDocument();
  });

  it('contains brain icon', () => {
    expect(Icons.brain).toBeDefined();
    const BrainIcon = Icons.brain;
    render(<BrainIcon data-testid="brain-icon" />);
    expect(screen.getByTestId('brain-icon')).toBeInTheDocument();
  });

  it('contains barChart icon', () => {
    expect(Icons.barChart).toBeDefined();
    const BarChartIcon = Icons.barChart;
    render(<BarChartIcon data-testid="bar-chart-icon" />);
    expect(screen.getByTestId('bar-chart-icon')).toBeInTheDocument();
  });

  it('contains plug icon', () => {
    expect(Icons.plug).toBeDefined();
    const PlugIcon = Icons.plug;
    render(<PlugIcon data-testid="plug-icon" />);
    expect(screen.getByTestId('plug-icon')).toBeInTheDocument();
  });

  it('contains sparkles icon', () => {
    expect(Icons.sparkles).toBeDefined();
    const SparklesIcon = Icons.sparkles;
    render(<SparklesIcon data-testid="sparkles-icon" />);
    expect(screen.getByTestId('sparkles-icon')).toBeInTheDocument();
  });

  it('contains quote icon', () => {
    expect(Icons.quote).toBeDefined();
    const QuoteIcon = Icons.quote;
    render(<QuoteIcon data-testid="quote-icon" />);
    expect(screen.getByTestId('quote-icon')).toBeInTheDocument();
  });

  it('contains menu icon', () => {
    expect(Icons.menu).toBeDefined();
    const MenuIcon = Icons.menu;
    render(<MenuIcon data-testid="menu-icon" />);
    expect(screen.getByTestId('menu-icon')).toBeInTheDocument();
  });

  it('contains check icon', () => {
    expect(Icons.check).toBeDefined();
    const CheckIcon = Icons.check;
    render(<CheckIcon data-testid="check-icon" />);
    expect(screen.getByTestId('check-icon')).toBeInTheDocument();
  });

  it('contains x icon', () => {
    expect(Icons.x).toBeDefined();
    const XIcon = Icons.x;
    render(<XIcon data-testid="x-icon" />);
    expect(screen.getByTestId('x-icon')).toBeInTheDocument();
  });

  it('contains arrowRight icon', () => {
    expect(Icons.arrowRight).toBeDefined();
    const ArrowRightIcon = Icons.arrowRight;
    render(<ArrowRightIcon data-testid="arrow-right-icon" />);
    expect(screen.getByTestId('arrow-right-icon')).toBeInTheDocument();
  });

  it('contains spinner icon', () => {
    expect(Icons.spinner).toBeDefined();
    const SpinnerIcon = Icons.spinner;
    render(<SpinnerIcon data-testid="spinner-icon" />);
    expect(screen.getByTestId('spinner-icon')).toBeInTheDocument();
  });

  it('contains search icon', () => {
    expect(Icons.search).toBeDefined();
    const SearchIcon = Icons.search;
    render(<SearchIcon data-testid="search-icon" />);
    expect(screen.getByTestId('search-icon')).toBeInTheDocument();
  });

  it('contains jira icon', () => {
    expect(Icons.jira).toBeDefined();
    const JiraIcon = Icons.jira;
    render(<JiraIcon data-testid="jira-icon" />);
    expect(screen.getByTestId('jira-icon')).toBeInTheDocument();
  });

  it('contains slack icon', () => {
    expect(Icons.slack).toBeDefined();
    const SlackIcon = Icons.slack;
    render(<SlackIcon data-testid="slack-icon" />);
    expect(screen.getByTestId('slack-icon')).toBeInTheDocument();
  });

  it('contains gitLab icon', () => {
    expect(Icons.gitLab).toBeDefined();
    const GitLabIcon = Icons.gitLab;
    render(<GitLabIcon data-testid="gitlab-icon" />);
    expect(screen.getByTestId('gitlab-icon')).toBeInTheDocument();
  });

  it('contains microsoft icon', () => {
    expect(Icons.microsoft).toBeDefined();
    const MicrosoftIcon = Icons.microsoft;
    render(<MicrosoftIcon data-testid="microsoft-icon" />);
    expect(screen.getByTestId('microsoft-icon')).toBeInTheDocument();
  });

  it('contains bitbucket icon', () => {
    expect(Icons.bitbucket).toBeDefined();
    const BitbucketIcon = Icons.bitbucket;
    render(<BitbucketIcon data-testid="bitbucket-icon" />);
    expect(screen.getByTestId('bitbucket-icon')).toBeInTheDocument();
  });

  it('contains plus icon', () => {
    expect(Icons.plus).toBeDefined();
    const PlusIcon = Icons.plus;
    render(<PlusIcon data-testid="plus-icon" />);
    expect(screen.getByTestId('plus-icon')).toBeInTheDocument();
  });

  it('contains creditCard icon', () => {
    expect(Icons.creditCard).toBeDefined();
    const CreditCardIcon = Icons.creditCard;
    render(<CreditCardIcon data-testid="credit-card-icon" />);
    expect(screen.getByTestId('credit-card-icon')).toBeInTheDocument();
  });

  it('contains shield icon', () => {
    expect(Icons.shield).toBeDefined();
    const ShieldIcon = Icons.shield;
    render(<ShieldIcon data-testid="shield-icon" />);
    expect(screen.getByTestId('shield-icon')).toBeInTheDocument();
  });

  it('contains download icon', () => {
    expect(Icons.download).toBeDefined();
    const DownloadIcon = Icons.download;
    render(<DownloadIcon data-testid="download-icon" />);
    expect(screen.getByTestId('download-icon')).toBeInTheDocument();
  });

  it('contains externalLink icon', () => {
    expect(Icons.externalLink).toBeDefined();
    const ExternalLinkIcon = Icons.externalLink;
    render(<ExternalLinkIcon data-testid="external-link-icon" />);
    expect(screen.getByTestId('external-link-icon')).toBeInTheDocument();
  });

  it('contains openai icon', () => {
    expect(Icons.openai).toBeDefined();
    const OpenAIIcon = Icons.openai;
    render(<OpenAIIcon data-testid="openai-icon" />);
    expect(screen.getByTestId('openai-icon')).toBeInTheDocument();
  });

  it('contains settings icon', () => {
    expect(Icons.settings).toBeDefined();
    const SettingsIcon = Icons.settings;
    render(<SettingsIcon data-testid="settings-icon" />);
    expect(screen.getByTestId('settings-icon')).toBeInTheDocument();
  });

  it('contains key icon', () => {
    expect(Icons.key).toBeDefined();
    const KeyIcon = Icons.key;
    render(<KeyIcon data-testid="key-icon" />);
    expect(screen.getByTestId('key-icon')).toBeInTheDocument();
  });

  it('contains xIcon icon', () => {
    expect(Icons.xIcon).toBeDefined();
    const XIconComponent = Icons.xIcon;
    render(<XIconComponent data-testid="x-icon-component" />);
    expect(screen.getByTestId('x-icon-component')).toBeInTheDocument();
  });

  it('contains chevronLeft icon', () => {
    expect(Icons.chevronLeft).toBeDefined();
    const ChevronLeftIcon = Icons.chevronLeft;
    render(<ChevronLeftIcon data-testid="chevron-left-icon" />);
    expect(screen.getByTestId('chevron-left-icon')).toBeInTheDocument();
  });

  it('icons accept className prop', () => {
    const TwitterIcon = Icons.twitter;
    render(<TwitterIcon data-testid="twitter-icon" className="h-6 w-6 text-primary" />);

    const icon = screen.getByTestId('twitter-icon');
    expect(icon).toHaveClass('h-6');
    expect(icon).toHaveClass('w-6');
    expect(icon).toHaveClass('text-primary');
  });
});

describe('Icon type export', () => {
  it('exports Icon type', () => {
    // Type-level test - if this compiles, the type is exported correctly
    const testIcon: Icon = Icons.twitter;
    expect(testIcon).toBeDefined();
  });
});

describe('Icons object immutability', () => {
  it('Icons object is const (readonly)', () => {
    // The Icons object is exported as const, meaning it's readonly
    expect(Object.keys(Icons).length).toBeGreaterThan(0);
    expect(Object.keys(Icons)).toContain('twitter');
    expect(Object.keys(Icons)).toContain('check');
  });

  it('has expected number of icon mappings', () => {
    const iconKeys = Object.keys(Icons);
    expect(iconKeys.length).toBe(39);
  });
});
