'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { jobOpenings } from '@/lib/data/jobOpenings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useForm } from 'react-hook-form';

interface FormValues {
  fullName: string;
  email: string;
  coverLetter: string;
  resume?: FileList;
}

export default function ApplyPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const jobId = searchParams.get('id');

  const [job, setJob] = useState<{
    id: string;
    title: string;
    location: string;
    department: string;
    description: string;
    requirements: string[];
  } | null>(null);

  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    defaultValues: {
      fullName: '',
      email: '',
      coverLetter: '',
    },
  });

  useEffect(() => {
    if (!jobId) return;

    // Find the job from the jobOpenings
    const foundJob = jobOpenings.find((j) => j.id === jobId);
    if (!foundJob) {
      setSubmitError('Job not found.');
    } else {
      setJob(foundJob);
    }
  }, [jobId]);

  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    setResumeFile(file || null);
  };

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    setSubmitError(null);
    setSuccessMessage(null);

    // Validate resume
    if (!resumeFile) {
      setSubmitError('Please attach your resume.');
      setIsSubmitting(false);
      return;
    }

    try {
      // TODO: submit this form data to backend.
      // For now, we will simulate a delay and then show a success message.
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // After successful submission:
      setSuccessMessage('Your application has been submitted successfully!');
      reset();
      setResumeFile(null);
    } catch (err) {
      setSubmitError('Failed to submit application. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!jobId) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4">
        <Alert variant="destructive" className="max-w-md w-full">
          <AlertDescription>No job ID provided.</AlertDescription>
        </Alert>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => router.push('/careers')}
        >
          Back to Careers
        </Button>
      </div>
    );
  }

  if (submitError && !job) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4">
        <Alert variant="destructive" className="max-w-md w-full">
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => router.push('/careers')}
        >
          Back to Careers
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Apply for a Position
          </h1>
          <p className="text-gray-600 mt-2 max-w-3xl">
            Fill out the form below to apply for this role. We look forward to
            reviewing your application.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-10 w-full">
        {job && (
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900">
              {job.title}
            </h2>
            <p className="text-gray-600 mt-1">
              {job.location} • {job.department}
            </p>
            <p className="text-gray-700 mt-4 max-w-3xl">{job.description}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="max-w-3xl space-y-6">
          {submitError && (
            <Alert variant="destructive">
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          )}

          {successMessage && (
            <Alert variant="default">
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-gray-700 font-medium">
              Full Name
            </Label>
            <Input
              id="fullName"
              placeholder="Your full name"
              className="border-gray-300"
              {...register('fullName', { required: 'Full Name is required' })}
            />
            {errors.fullName && (
              <p className="text-red-600 text-sm">{errors.fullName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-700 font-medium">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Your email address"
              className="border-gray-300"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^\S+@\S+\.\S+$/,
                  message: 'Please enter a valid email',
                },
              })}
            />
            {errors.email && (
              <p className="text-red-600 text-sm">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="coverLetter" className="text-gray-700 font-medium">
              Cover Letter
            </Label>
            <Textarea
              id="coverLetter"
              placeholder="Tell us why you are a great fit for this role..."
              className="border-gray-300 min-h-[150px]"
              {...register('coverLetter', {
                required: 'Cover letter is required',
              })}
            />
            {errors.coverLetter && (
              <p className="text-red-600 text-sm">
                {errors.coverLetter.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="resume" className="text-gray-700 font-medium">
              Resume (PDF)
            </Label>
            <Input
              id="resume"
              type="file"
              accept=".pdf"
              onChange={handleResumeChange}
              className="border-gray-300"
            />
            {resumeFile && (
              <p className="text-sm text-gray-600">
                Selected File: {resumeFile.name}
              </p>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <Button
              className="bg-black text-white hover:bg-gray-900 rounded-md px-4 py-2 font-medium"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </Button>
            <Button
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-50 rounded-md"
              type="button"
              onClick={() => router.push('/careers')}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
