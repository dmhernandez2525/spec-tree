'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Icons } from '@/components/shared/icons';
import { HeadingSection } from '@/components/shared/HeadingSection';
import {
  AboutPageData,
  TeamMember,
  Partner,
  TechnologyStack,
} from '@/types/about';
import Section from '@/components/layout/Section';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
    },
  },
  hover: {
    scale: 1.05,
    transition: {
      duration: 0.2,
    },
  },
};

const aboutData: AboutPageData = {
  vision:
    'To revolutionize project planning by making comprehensive context gathering and AI-powered assistance accessible to every team.',
  mission:
    "We're on a mission to transform how teams plan and execute projects by providing intelligent, context-aware tools that ensure nothing falls through the cracks.",
  values: [
    {
      title: 'Innovation',
      description: 'Pushing boundaries with AI and smart automation',
      icon: 'sparkles',
    },
    {
      title: 'Transparency',
      description: 'Clear, honest communication in everything we do',
      icon: 'eye',
    },
    {
      title: 'Collaboration',
      description: 'Building tools that bring teams together',
      icon: 'users',
    },
  ],
  whySpecTree: {
    title: 'Why Choose Spec Tree',
    description:
      'Our platform combines cutting-edge AI with intuitive design to solve the most challenging aspects of project planning.',
    keyPoints: [
      {
        title: 'AI-Powered Context Gathering',
        description: 'Smart systems that ask the right questions',
        icon: 'brain',
      },
      {
        title: 'Seamless Integration',
        description: 'Works with your existing tools and workflows',
        icon: 'plug',
      },
      {
        title: 'Scale with Confidence',
        description: 'Enterprise-ready features that grow with you',
        icon: 'barChart',
      },
    ],
  },
  team: [
    {
      id: '1',
      name: 'Sarah Chen',
      role: 'CEO & Founder',
      bio: 'Former tech lead with 15 years of project management experience',
      imageUrl:
        'https://plus.unsplash.com/premium_photo-1683121716061-3faddf4dc504?q=80&w=3432&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      socialLinks: {
        linkedin: 'https://linkedin.com/in/sarah-chen',
        twitter: 'https://twitter.com/sarahchen',
      },
    },
    {
      id: '2',
      name: 'Michael Rodriguez',
      role: 'CTO',
      bio: 'AI researcher and full-stack developer with a focus on developer tools',
      imageUrl:
        'https://plus.unsplash.com/premium_photo-1683121716061-3faddf4dc504?q=80&w=3432&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      socialLinks: {
        linkedin: 'https://linkedin.com/in/michael-rodriguez',
        github: 'https://github.com/mrodriguez',
      },
    },
  ],
  techStack: [
    {
      category: 'Frontend',
      technologies: [
        {
          name: 'Next.js',
          description: 'React framework for production',
          iconUrl:
            'https://plus.unsplash.com/premium_photo-1683121716061-3faddf4dc504?q=80&w=3432&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
          link: 'https://nextjs.org',
        },
        {
          name: 'TypeScript',
          description: 'JavaScript with syntax for types',
          iconUrl:
            'https://plus.unsplash.com/premium_photo-1683121716061-3faddf4dc504?q=80&w=3432&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
          link: 'https://www.typescriptlang.org',
        },
        {
          name: 'Tailwind CSS',
          description: 'Utility-first CSS framework',
          iconUrl:
            'https://plus.unsplash.com/premium_photo-1683121716061-3faddf4dc504?q=80&w=3432&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
          link: 'https://tailwindcss.com',
        },
      ],
    },
    {
      category: 'AI Integration',
      technologies: [
        {
          name: 'OpenAI',
          description: 'Advanced language models for context analysis',
          iconUrl:
            'https://plus.unsplash.com/premium_photo-1683121716061-3faddf4dc504?q=80&w=3432&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
          link: 'https://openai.com',
        },
        {
          name: 'TensorFlow',
          description: 'Machine learning framework',
          iconUrl:
            'https://plus.unsplash.com/premium_photo-1683121716061-3faddf4dc504?q=80&w=3432&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
          link: 'https://tensorflow.org',
        },
      ],
    },
  ],
  partners: [
    {
      id: '1',
      name: 'TechCorp Solutions',
      description: 'Enterprise software integration partner',
      logoUrl:
        'https://plus.unsplash.com/premium_photo-1683121716061-3faddf4dc504?q=80&w=3432&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      websiteUrl: 'https://techcorp.com',
    },
    {
      id: '2',
      name: 'AgileFlow',
      description: 'Agile project management tools',
      logoUrl:
        'https://plus.unsplash.com/premium_photo-1683121716061-3faddf4dc504?q=80&w=3432&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      websiteUrl: 'https://agileflow.com',
    },
  ],
};

function AnimatedSection({ children }: { children: React.ReactNode }) {
  const controls = useAnimation();
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  useEffect(() => {
    if (inView) {
      controls.start('visible');
    }
  }, [controls, inView]);

  return (
    <motion.div
      ref={ref}
      animate={controls}
      initial="hidden"
      variants={containerVariants}
    >
      {children}
    </motion.div>
  );
}

function TeamSection({ team }: { team: TeamMember[] }) {
  return (
    <section className="py-16 bg-muted/50">
      <Section>
        <AnimatedSection>
          <HeadingSection
            heading="Our Team"
            description="Meet the people building Spec Tree"
            className="mb-12"
          />
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {team.map((member) => (
              <motion.div
                key={member.id}
                variants={cardVariants}
                whileHover="hover"
              >
                <Card className="overflow-hidden h-full">
                  <div className="relative aspect-square">
                    <Image
                      src={member.imageUrl}
                      alt={member.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <CardHeader>
                    <CardTitle>{member.name}</CardTitle>
                    <CardDescription>{member.role}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{member.bio}</p>
                    {member.socialLinks && (
                      <div className="flex gap-4">
                        {member.socialLinks.linkedin && (
                          <Link
                            href={member.socialLinks.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Icons.linkedin className="h-5 w-5" />
                          </Link>
                        )}
                        {member.socialLinks.twitter && (
                          <Link
                            href={member.socialLinks.twitter}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Icons.twitter className="h-5 w-5" />
                          </Link>
                        )}
                        {member.socialLinks.github && (
                          <Link
                            href={member.socialLinks.github}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Icons.gitHub className="h-5 w-5" />
                          </Link>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </AnimatedSection>
      </Section>
    </section>
  );
}

function TechStackSection({ techStack }: { techStack: TechnologyStack[] }) {
  return (
    <section className="py-16">
      <Section>
        <AnimatedSection>
          <HeadingSection
            heading="Our Technology Stack"
            description="Built with modern, scalable technologies"
            className="mb-12"
          />
          <div className="space-y-12">
            {techStack.map((category) => (
              <motion.div key={category.category} variants={itemVariants}>
                <h3 className="text-xl font-semibold mb-6">
                  {category.category}
                </h3>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {category.technologies.map((tech) => (
                    <motion.div
                      key={tech.name}
                      variants={cardVariants}
                      whileHover="hover"
                    >
                      <Link
                        href={tech.link || '#'}
                        className="block"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Card className="transition-shadow hover:shadow-lg">
                          <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                              <div className="relative h-10 w-10 flex-shrink-0">
                                <Image
                                  src={tech.iconUrl}
                                  alt={tech.name}
                                  fill
                                  className="object-contain"
                                />
                              </div>
                              <div>
                                <h4 className="font-semibold group-hover:text-primary">
                                  {tech.name}
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  {tech.description}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatedSection>
      </Section>
    </section>
  );
}

function PartnersSection({ partners }: { partners: Partner[] }) {
  return (
    <section className="py-16 bg-muted/50">
      <Section>
        <AnimatedSection>
          <HeadingSection
            heading="Our Partners"
            description="Working together to deliver the best solutions"
            className="mb-12"
          />
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {partners.map((partner) => (
              <motion.div
                key={partner.id}
                variants={cardVariants}
                whileHover="hover"
              >
                <Link
                  href={partner.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Card className="h-full">
                    <CardContent className="p-6">
                      <div className="relative h-20 mb-4">
                        <Image
                          src={partner.logoUrl}
                          alt={partner.name}
                          fill
                          className="object-contain"
                        />
                      </div>
                      <h4 className="font-semibold mb-2">{partner.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {partner.description}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </AnimatedSection>
      </Section>
    </section>
  );
}

export default function AboutPage() {
  return (
    <div className="flex-1">
      {/* Vision & Mission */}
      <section className="py-16 bg-muted/50">
        <Section>
          <div className="max-w-3xl mx-auto text-center">
            <AnimatedSection>
              <motion.div variants={itemVariants}>
                <HeadingSection
                  heading="Our Vision"
                  description={aboutData.vision}
                  className="mb-12"
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <HeadingSection
                  heading="Our Mission"
                  description={aboutData.mission}
                  className="mb-12"
                />
              </motion.div>
            </AnimatedSection>
          </div>
        </Section>
      </section>

      {/* Values */}
      <section className="py-16">
        <Section>
          <AnimatedSection>
            <HeadingSection
              heading="Our Values"
              description="The principles that guide everything we do"
              className="mb-12"
            />
            <div className="grid gap-8 md:grid-cols-3">
              {aboutData.values.map((value) => {
                const Icon = Icons[value.icon];
                return (
                  <motion.div
                    key={value.title}
                    variants={cardVariants}
                    whileHover="hover"
                  >
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex flex-col items-center text-center">
                          <div className="rounded-lg bg-primary/10 p-3 mb-4">
                            <Icon className="h-5 w-5 text-primary" />
                          </div>
                          <h3 className="text-xl font-semibold mb-2">
                            {value.title}
                          </h3>
                          <p className="text-muted-foreground">
                            {value.description}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </AnimatedSection>
        </Section>
      </section>

      {/* Why Spec Tree */}
      <section className="py-16 bg-muted/50">
        <Section>
          <AnimatedSection>
            <HeadingSection
              heading={aboutData.whySpecTree.title}
              description={aboutData.whySpecTree.description}
              className="mb-12"
            />
            <div className="grid gap-8 md:grid-cols-3">
              {aboutData.whySpecTree.keyPoints.map((point) => {
                const Icon = Icons[point.icon];
                return (
                  <motion.div
                    key={point.title}
                    variants={cardVariants}
                    whileHover="hover"
                  >
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex flex-col items-center text-center">
                          <div className="rounded-lg bg-primary/10 p-3 mb-4">
                            <Icon className="h-5 w-5 text-primary" />
                          </div>
                          <h3 className="text-xl font-semibold mb-2">
                            {point.title}
                          </h3>
                          <p className="text-muted-foreground">
                            {point.description}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </AnimatedSection>
        </Section>
      </section>

      {/* Team Section */}
      <TeamSection team={aboutData.team} />

      {/* Tech Stack Section */}
      <TechStackSection techStack={aboutData.techStack} />

      {/* Partners Section */}
      <PartnersSection partners={aboutData.partners} />

      {/* CTA Section */}
      <section className="py-16">
        <Section>
          <AnimatedSection>
            <motion.div
              className="rounded-lg bg-primary p-8 text-primary-foreground text-center"
              variants={cardVariants}
              whileHover="hover"
            >
              <h2 className="text-3xl font-bold mb-4">
                Ready to Transform Your Project Planning?
              </h2>
              <p className="text-lg mb-8 opacity-90">
                Join thousands of teams using Spec Tree to deliver
                better projects.
              </p>
              <div className="flex justify-center gap-4">
                <Button variant="secondary" size="lg" asChild>
                  <Link href="/register">Start Free Trial</Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  asChild
                  className="bg-transparent hover:bg-primary-foreground/10"
                >
                  <Link href="/contact">Contact Sales</Link>
                </Button>
              </div>
            </motion.div>
          </AnimatedSection>
        </Section>
      </section>
    </div>
  );
}
