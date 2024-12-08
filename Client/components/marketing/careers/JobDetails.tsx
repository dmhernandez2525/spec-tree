'use client';

import { Button } from '@/components/ui/button';

interface JobDetailsProps {
  job: {
    id: string;
    title: string;
    location: string;
    department: string;
    description: string;
    requirements: string[];
  };
  onClose: () => void;
  onApply: (id: string) => void;
}

export function JobDetails({ job, onClose, onApply }: JobDetailsProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-md shadow-sm p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-2xl font-semibold text-gray-900">{job.title}</h3>
          <p className="text-sm text-gray-600 mt-1">
            {job.location} • {job.department}
          </p>
        </div>
        <Button
          variant="outline"
          className="border-gray-300 text-gray-700 hover:bg-gray-50 rounded-md"
          onClick={onClose}
        >
          Close
        </Button>
      </div>
      <div className="space-y-4">
        <p className="text-gray-700">{job.description}</p>
        <div>
          <h4 className="text-lg font-medium text-gray-900">Requirements</h4>
          <ul className="list-disc pl-5 space-y-1 text-gray-700 mt-2">
            {job.requirements.map((req, idx) => (
              <li key={idx}>{req}</li>
            ))}
          </ul>
        </div>
      </div>
      <div className="mt-6 flex justify-end">
        <Button
          className="bg-black text-white hover:bg-gray-900 rounded-md px-4 py-2 font-medium"
          onClick={() => onApply(job.id)}
        >
          Apply Now
        </Button>
      </div>
    </div>
  );
}
