import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ImplementationStep {
  title: string;
  description: string;
  duration: string;
  deliverables: string[];
  icon: React.ReactNode;
}

const steps: ImplementationStep[] = [
  {
    title: 'Discovery & Planning',
    description:
      "Initial consultation to understand your organization's needs, current workflows, and project management goals.",
    duration: '1-2 weeks',
    deliverables: [
      'Needs assessment document',
      'Custom implementation roadmap',
      'Project timeline',
      'Resource allocation plan',
    ],
    icon: '🎯',
  },
  {
    title: 'Setup & Configuration',
    description:
      'Technical setup of Spec Tree, including user roles, permissions, and initial template creation.',
    duration: '1 week',
    deliverables: [
      'Configured Spec Tree instance',
      'Custom templates',
      'User roles and permissions setup',
      'Initial workflow configurations',
    ],
    icon: '⚙️',
  },
  {
    title: 'Training & Onboarding',
    description:
      'Comprehensive training sessions for team members on using Spec Tree effectively.',
    duration: '1-2 weeks',
    deliverables: [
      'Training materials',
      'Recorded sessions',
      'Best practices documentation',
      'User guides',
    ],
    icon: '📚',
  },
  {
    title: 'Testing & Refinement',
    description:
      'Pilot testing with selected teams and refinement based on feedback.',
    duration: '2 weeks',
    deliverables: [
      'Test results documentation',
      'Feedback analysis',
      'System adjustments',
      'Performance metrics',
    ],
    icon: '🔍',
  },
  {
    title: 'Full Deployment',
    description:
      'Organization-wide rollout with ongoing support and monitoring.',
    duration: '1-2 weeks',
    deliverables: [
      'Deployment schedule',
      'Success metrics',
      'Support documentation',
      'Maintenance plan',
    ],
    icon: '🚀',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const stepVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

export function ProcessImplementationSteps() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {steps.map((step, index) => (
        <motion.div
          key={step.title}
          variants={stepVariants}
          className="relative"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-4">
                <span className="text-4xl">{step.icon}</span>
                <div>
                  <span className="text-sm text-muted-foreground">
                    Step {index + 1}
                  </span>
                  <h3 className="text-xl font-bold">{step.title}</h3>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6 lg:grid-cols-2">
              <div>
                <p className="text-muted-foreground mb-4">{step.description}</p>
                <p className="text-sm">
                  <span className="font-semibold">Duration:</span>{' '}
                  {step.duration}
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Deliverables:</h4>
                <ul className="space-y-2">
                  {step.deliverables.map((deliverable) => (
                    <li key={deliverable} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                      <span className="text-sm text-muted-foreground">
                        {deliverable}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
          {index < steps.length - 1 && (
            <div className="absolute left-8 top-full h-8 w-px bg-border" />
          )}
        </motion.div>
      ))}
    </motion.div>
  );
}

export default ProcessImplementationSteps;
