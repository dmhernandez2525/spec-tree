import { describe, it, expect } from 'vitest';
import { jobOpenings } from './jobOpenings';

describe('jobOpenings data', () => {
  it('exports jobOpenings array', () => {
    expect(Array.isArray(jobOpenings)).toBe(true);
    expect(jobOpenings.length).toBeGreaterThan(0);
  });

  it('each job has required properties', () => {
    jobOpenings.forEach((job) => {
      expect(job.id).toBeDefined();
      expect(typeof job.id).toBe('string');
      expect(job.title).toBeDefined();
      expect(typeof job.title).toBe('string');
      expect(job.location).toBeDefined();
      expect(typeof job.location).toBe('string');
      expect(job.department).toBeDefined();
      expect(typeof job.department).toBe('string');
      expect(job.description).toBeDefined();
      expect(typeof job.description).toBe('string');
      expect(job.requirements).toBeDefined();
      expect(Array.isArray(job.requirements)).toBe(true);
    });
  });

  it('each job has at least one requirement', () => {
    jobOpenings.forEach((job) => {
      expect(job.requirements.length).toBeGreaterThan(0);
    });
  });

  it('includes engineering positions', () => {
    const engineeringJobs = jobOpenings.filter(
      (job) => job.department === 'Engineering'
    );
    expect(engineeringJobs.length).toBeGreaterThan(0);
  });

  it('includes frontend engineer position', () => {
    const frontendJob = jobOpenings.find(
      (job) => job.id === 'frontend-engineer'
    );
    expect(frontendJob).toBeDefined();
    expect(frontendJob?.title).toBe('Front-End Engineer');
  });

  it('includes backend engineer position', () => {
    const backendJob = jobOpenings.find(
      (job) => job.id === 'backend-engineer'
    );
    expect(backendJob).toBeDefined();
    expect(backendJob?.title).toBe('Backend Engineer');
  });

  it('all jobs have unique ids', () => {
    const ids = jobOpenings.map((job) => job.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });
});
