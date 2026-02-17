import { describe, it, expect } from 'vitest';
import { getOpenApiSpec } from './openapi-spec';

describe('openapi-spec', () => {
  it('returns a valid OpenAPI 3.0 spec object', () => {
    const spec = getOpenApiSpec();
    expect(spec.openapi).toBe('3.0.3');
    expect(spec.info).toBeDefined();
  });

  it('includes API version info', () => {
    const spec = getOpenApiSpec();
    const info = spec.info as Record<string, string>;
    expect(info.title).toBe('SpecTree Public API');
    expect(info.version).toBe('1.0.0');
  });

  it('defines security scheme', () => {
    const spec = getOpenApiSpec();
    const components = spec.components as Record<string, Record<string, unknown>>;
    expect(components.securitySchemes).toBeDefined();
    expect(components.securitySchemes.bearerAuth).toBeDefined();
  });

  it('defines all core schemas', () => {
    const spec = getOpenApiSpec();
    const components = spec.components as Record<string, Record<string, unknown>>;
    const schemas = components.schemas;
    expect(schemas.Spec).toBeDefined();
    expect(schemas.Epic).toBeDefined();
    expect(schemas.Feature).toBeDefined();
    expect(schemas.UserStory).toBeDefined();
    expect(schemas.Task).toBeDefined();
    expect(schemas.Pagination).toBeDefined();
    expect(schemas.Error).toBeDefined();
  });

  it('defines paths for specs, epics, and features', () => {
    const spec = getOpenApiSpec();
    const paths = spec.paths as Record<string, unknown>;
    expect(paths['/specs']).toBeDefined();
    expect(paths['/specs/{specId}']).toBeDefined();
    expect(paths['/specs/{specId}/epics']).toBeDefined();
    expect(paths['/specs/{specId}/epics/{epicId}']).toBeDefined();
  });

  it('specs path has GET and POST methods', () => {
    const spec = getOpenApiSpec();
    const paths = spec.paths as Record<string, Record<string, unknown>>;
    const specsPath = paths['/specs'];
    expect(specsPath.get).toBeDefined();
    expect(specsPath.post).toBeDefined();
  });

  it('spec by ID path has GET, PUT, DELETE', () => {
    const spec = getOpenApiSpec();
    const paths = spec.paths as Record<string, Record<string, unknown>>;
    const specById = paths['/specs/{specId}'];
    expect(specById.get).toBeDefined();
    expect(specById.put).toBeDefined();
    expect(specById.delete).toBeDefined();
  });
});
