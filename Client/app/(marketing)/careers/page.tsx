'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { JobDetails } from '@/components/marketing/careers/JobDetails';
import { jobOpenings } from '@/lib/data/jobOpenings';

export default function CareersPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState(jobOpenings);
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // TODO: fetch jobs from an API.
    // Here, we have a static array above, so this is just a no-op.
    setJobs(jobOpenings);
  }, []);

  const handleSelectJob = (id: string) => {
    setSelectedJob(id);
  };

  const filteredJobs = jobs.filter(
    (job) =>
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="relative bg-white border-b border-gray-200 overflow-hidden">
        {/* Hero Section with Background Image */}
        <div className="absolute inset-0 -z-10">
          <Image
            src="/images/careers-hero.png"
            alt="Corporate building skyline"
            fill
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-black/30" />
        </div>

        <div className="mx-auto max-w-7xl px-4 py-24 text-white relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <h1 className="text-4xl font-bold">Careers at Our Company</h1>
            <p className="text-gray-200 mt-4 max-w-3xl text-lg">
              We’re on a mission to build products that change how people
              interact with technology every day. Our diverse team is dedicated,
              creative, and driven by results.
            </p>
            <p className="text-gray-200 mt-2 max-w-3xl text-lg">
              At our company, you’ll find a supportive environment that
              encourages continuous learning and growth. We believe in work-life
              balance, mentorship, and helping each other succeed. Join us and
              be part of our journey.
            </p>
          </motion.div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-10 w-full space-y-16">
        <motion.section
          className="space-y-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1, duration: 0.6, ease: 'easeOut' }}
        >
          <section>
            <h2 className="text-3xl font-semibold text-gray-900">Who We Are</h2>
            <div className="mt-4 flex flex-col md:flex-row md:items-start md:space-x-8">
              <motion.div
                className="flex-1"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <p className="text-gray-700 max-w-3xl text-lg">
                  We’re a team of innovators, dreamers, and doers. Each member
                  of our team brings unique experiences and perspectives that
                  help us tackle complex challenges and build meaningful
                  solutions.
                </p>
              </motion.div>
              <motion.div
                className="flex-1 mt-6 md:mt-0"
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <Image
                  src="/images/team-culture.png"
                  alt="Our team collaborating"
                  width={1950}
                  height={1300}
                  className="w-full h-auto rounded-md shadow-md"
                />
              </motion.div>
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-semibold text-gray-900">What We Do</h2>
            <div className="mt-4">
              <p className="text-gray-700 max-w-3xl text-lg">
                From crafting engaging user interfaces to architecting scalable
                backends, our focus is always on delivering value to our users.
                We work collaboratively, relying on data-driven insights and
                open communication to guide our decisions.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-semibold text-gray-900">
              Why We Matter
            </h2>
            <div className="mt-4">
              <p className="text-gray-700 max-w-3xl text-lg">
                Our products and services make it easier for people around the
                world to connect, learn, and thrive. Whether it’s helping
                businesses improve their operations or enabling consumers to
                access new opportunities, our impact is felt far and wide.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-semibold text-gray-900">Our Values</h2>
            <ul className="list-disc pl-5 mt-4 text-gray-700 space-y-1 max-w-3xl text-lg">
              <li>
                <strong>Innovation:</strong> We encourage creative thinking to
                find impactful solutions.
              </li>
              <li>
                <strong>Collaboration:</strong> Success is a team
                effort—everyone’s input matters.
              </li>
              <li>
                <strong>Inclusion:</strong> We embrace diverse perspectives and
                foster an inclusive culture.
              </li>
              <li>
                <strong>Integrity:</strong> We build trust by being honest,
                transparent, and accountable.
              </li>
              <li>
                <strong>Growth:</strong> We invest in personal and professional
                development for everyone on our team.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-3xl font-semibold text-gray-900">Benefits</h2>
            <ul className="list-disc pl-5 mt-4 text-gray-700 space-y-1 max-w-3xl text-lg">
              <li>Comprehensive healthcare plans</li>
              <li>Flexible remote work environment</li>
              <li>Generous PTO and parental leave</li>
              <li>401(k) or equivalent retirement savings plans</li>
              <li>Professional development and education stipends</li>
            </ul>
          </section>

          {/* Video Section */}
          <section>
            <h2 className="text-3xl font-semibold text-gray-900">
              See Us In Action
            </h2>
            <p className="text-gray-700 mt-2 max-w-3xl text-lg">
              Take a glimpse into our work environment and hear from our team
              members.
            </p>
            <div className="mt-6 aspect-w-16 aspect-h-9 max-w-3xl">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="overflow-hidden rounded-md shadow-md"
              >
                <iframe
                  className="w-full h-full"
                  src="https://www.youtube.com/embed/LXb3EKWsInQ"
                  title="Our Team's Journey"
                  frameBorder="0"
                  allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </motion.div>
            </div>
          </section>
        </motion.section>

        <motion.section
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <h2 className="text-3xl font-semibold text-gray-900">
            Open Positions
          </h2>
          <p className="text-gray-600 mt-2 max-w-xl text-lg">
            We’re looking for talented individuals from various backgrounds. Use
            the search box below to find a role that matches your interests.
          </p>
          <div className="mt-4 max-w-md">
            <Input
              placeholder="Search by title, location, or department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-gray-300"
            />
          </div>
        </motion.section>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                delayChildren: 0.2,
                staggerChildren: 0.1,
              },
            },
          }}
        >
          {filteredJobs.map((job) => {
            const isSelected = selectedJob === job.id;
            return (
              <motion.div
                key={job.id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                <Card
                  onClick={() => handleSelectJob(job.id)}
                  className={`cursor-pointer border border-gray-200 rounded-md shadow-sm transition-transform duration-200 hover:shadow-md hover:scale-[1.01] ${
                    isSelected ? 'ring-2 ring-primary' : ''
                  }`}
                >
                  <CardHeader className="p-4">
                    <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-1">
                      {job.title}
                    </CardTitle>
                    <CardDescription className="text-sm text-gray-600 mt-1 line-clamp-1">
                      {job.location} • {job.department}
                    </CardDescription>
                  </CardHeader>
                  <CardFooter className="p-4">
                    <Button
                      variant={isSelected ? 'secondary' : 'outline'}
                      className={`w-full transition-colors rounded-md ${
                        isSelected
                          ? 'bg-primary text-white border-transparent hover:bg-primary/90'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {isSelected ? 'Selected' : 'View Details'}
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        <AnimatePresence>
          {selectedJob && (
            <motion.div
              key="jobdetails"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            >
              <JobDetails
                job={jobs.find((j) => j.id === selectedJob)!}
                onClose={() => setSelectedJob(null)}
                onApply={(jobId: string) => {
                  // Navigate to an apply page using Next.js navigation
                  router.push(`/careers/apply?id=${jobId}`);
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
