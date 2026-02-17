/**
 * OpenAPI 3.0 specification for the SpecTree public REST API.
 */

export function getOpenApiSpec(): Record<string, unknown> {
  return {
    openapi: '3.0.3',
    info: {
      title: 'SpecTree Public API',
      version: '1.0.0',
      description: 'API for managing software specification trees programmatically.',
      contact: { name: 'SpecTree Support' },
    },
    servers: [
      { url: '/api/v1', description: 'Current server' },
    ],
    security: [{ bearerAuth: [] }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          description: 'API key as Bearer token. Example: "Bearer sk_abc12345..."',
        },
      },
      schemas: {
        Spec: specSchema(),
        Epic: epicSchema(),
        Feature: featureSchema(),
        UserStory: userStorySchema(),
        Task: taskSchema(),
        Pagination: paginationSchema(),
        Error: errorSchema(),
      },
      parameters: {
        page: { name: 'page', in: 'query', schema: { type: 'integer', default: 1 }, description: 'Page number' },
        pageSize: { name: 'pageSize', in: 'query', schema: { type: 'integer', default: 25, maximum: 100 }, description: 'Items per page' },
        sort: { name: 'sort', in: 'query', schema: { type: 'string' }, description: 'Sort field:direction (e.g. "createdAt:desc")' },
      },
    },
    paths: {
      '/specs': specsPaths(),
      '/specs/{specId}': specByIdPaths(),
      '/specs/{specId}/epics': epicsPaths(),
      '/specs/{specId}/epics/{epicId}': epicByIdPaths(),
      '/specs/{specId}/epics/{epicId}/features': featuresPaths(),
      '/specs/{specId}/epics/{epicId}/features/{featureId}': featureByIdPaths(),
    },
    tags: [
      { name: 'Specs', description: 'Specification (App) operations' },
      { name: 'Epics', description: 'Epic operations within a spec' },
      { name: 'Features', description: 'Feature operations within an epic' },
    ],
  };
}

function specSchema(): Record<string, unknown> {
  return {
    type: 'object',
    properties: {
      id: { type: 'string' },
      name: { type: 'string' },
      globalInformation: { type: 'string' },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' },
    },
  };
}

function epicSchema(): Record<string, unknown> {
  return {
    type: 'object',
    properties: {
      id: { type: 'string' },
      title: { type: 'string' },
      description: { type: 'string' },
      goal: { type: 'string' },
      successCriteria: { type: 'string' },
      dependencies: { type: 'string' },
      timeline: { type: 'string' },
      resources: { type: 'string' },
      notes: { type: 'string' },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' },
    },
  };
}

function featureSchema(): Record<string, unknown> {
  return {
    type: 'object',
    properties: {
      id: { type: 'string' },
      title: { type: 'string' },
      description: { type: 'string' },
      details: { type: 'string' },
      notes: { type: 'string' },
      priority: { type: 'string' },
      effort: { type: 'string' },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' },
    },
  };
}

function userStorySchema(): Record<string, unknown> {
  return {
    type: 'object',
    properties: {
      id: { type: 'string' },
      title: { type: 'string' },
      role: { type: 'string' },
      action: { type: 'string' },
      goal: { type: 'string' },
      points: { type: 'string' },
      notes: { type: 'string' },
      developmentOrder: { type: 'integer' },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' },
    },
  };
}

function taskSchema(): Record<string, unknown> {
  return {
    type: 'object',
    properties: {
      id: { type: 'string' },
      title: { type: 'string' },
      details: { type: 'string' },
      priority: { type: 'integer' },
      notes: { type: 'string' },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' },
    },
  };
}

function paginationSchema(): Record<string, unknown> {
  return {
    type: 'object',
    properties: {
      page: { type: 'integer' },
      pageSize: { type: 'integer' },
      pageCount: { type: 'integer' },
      total: { type: 'integer' },
    },
  };
}

function errorSchema(): Record<string, unknown> {
  return {
    type: 'object',
    properties: {
      error: {
        type: 'object',
        properties: {
          code: { type: 'string' },
          message: { type: 'string' },
          status: { type: 'integer' },
          details: { type: 'object' },
        },
      },
    },
  };
}

function listResponse(ref: string): Record<string, unknown> {
  return {
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            data: { type: 'array', items: { $ref: `#/components/schemas/${ref}` } },
            meta: {
              type: 'object',
              properties: {
                apiVersion: { type: 'string' },
                requestId: { type: 'string' },
                pagination: { $ref: '#/components/schemas/Pagination' },
              },
            },
          },
        },
      },
    },
  };
}

function singleResponse(ref: string): Record<string, unknown> {
  return {
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            data: { $ref: `#/components/schemas/${ref}` },
            meta: {
              type: 'object',
              properties: {
                apiVersion: { type: 'string' },
                requestId: { type: 'string' },
              },
            },
          },
        },
      },
    },
  };
}

function errorResponse(): Record<string, unknown> {
  return {
    content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
  };
}

function specsPaths(): Record<string, unknown> {
  return {
    get: {
      tags: ['Specs'], summary: 'List specifications',
      parameters: [
        { $ref: '#/components/parameters/page' },
        { $ref: '#/components/parameters/pageSize' },
        { $ref: '#/components/parameters/sort' },
        { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Search by name' },
      ],
      responses: { '200': { description: 'List of specs', ...listResponse('Spec') }, '401': { description: 'Unauthorized', ...errorResponse() } },
    },
    post: {
      tags: ['Specs'], summary: 'Create a specification',
      requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/Spec' } } } },
      responses: { '201': { description: 'Created', ...singleResponse('Spec') }, '400': { description: 'Bad request', ...errorResponse() } },
    },
  };
}

function specByIdPaths(): Record<string, unknown> {
  return {
    get: {
      tags: ['Specs'], summary: 'Get a specification by ID',
      parameters: [{ name: 'specId', in: 'path', required: true, schema: { type: 'string' } }],
      responses: { '200': { description: 'Spec details', ...singleResponse('Spec') }, '404': { description: 'Not found', ...errorResponse() } },
    },
    put: {
      tags: ['Specs'], summary: 'Update a specification',
      parameters: [{ name: 'specId', in: 'path', required: true, schema: { type: 'string' } }],
      requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/Spec' } } } },
      responses: { '200': { description: 'Updated', ...singleResponse('Spec') }, '404': { description: 'Not found', ...errorResponse() } },
    },
    delete: {
      tags: ['Specs'], summary: 'Delete a specification',
      parameters: [{ name: 'specId', in: 'path', required: true, schema: { type: 'string' } }],
      responses: { '204': { description: 'Deleted' }, '404': { description: 'Not found', ...errorResponse() } },
    },
  };
}

function epicsPaths(): Record<string, unknown> {
  return {
    get: {
      tags: ['Epics'], summary: 'List epics in a specification',
      parameters: [
        { name: 'specId', in: 'path', required: true, schema: { type: 'string' } },
        { $ref: '#/components/parameters/page' },
        { $ref: '#/components/parameters/pageSize' },
      ],
      responses: { '200': { description: 'List of epics', ...listResponse('Epic') } },
    },
    post: {
      tags: ['Epics'], summary: 'Create an epic',
      parameters: [{ name: 'specId', in: 'path', required: true, schema: { type: 'string' } }],
      requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/Epic' } } } },
      responses: { '201': { description: 'Created', ...singleResponse('Epic') } },
    },
  };
}

function epicByIdPaths(): Record<string, unknown> {
  return {
    get: {
      tags: ['Epics'], summary: 'Get an epic by ID',
      parameters: [
        { name: 'specId', in: 'path', required: true, schema: { type: 'string' } },
        { name: 'epicId', in: 'path', required: true, schema: { type: 'string' } },
      ],
      responses: { '200': { description: 'Epic details', ...singleResponse('Epic') } },
    },
    put: {
      tags: ['Epics'], summary: 'Update an epic',
      parameters: [
        { name: 'specId', in: 'path', required: true, schema: { type: 'string' } },
        { name: 'epicId', in: 'path', required: true, schema: { type: 'string' } },
      ],
      requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/Epic' } } } },
      responses: { '200': { description: 'Updated', ...singleResponse('Epic') } },
    },
    delete: {
      tags: ['Epics'], summary: 'Delete an epic',
      parameters: [
        { name: 'specId', in: 'path', required: true, schema: { type: 'string' } },
        { name: 'epicId', in: 'path', required: true, schema: { type: 'string' } },
      ],
      responses: { '204': { description: 'Deleted' } },
    },
  };
}

function featuresPaths(): Record<string, unknown> {
  return {
    get: {
      tags: ['Features'], summary: 'List features in an epic',
      parameters: [
        { name: 'specId', in: 'path', required: true, schema: { type: 'string' } },
        { name: 'epicId', in: 'path', required: true, schema: { type: 'string' } },
        { $ref: '#/components/parameters/page' },
        { $ref: '#/components/parameters/pageSize' },
      ],
      responses: { '200': { description: 'List of features', ...listResponse('Feature') } },
    },
  };
}

function featureByIdPaths(): Record<string, unknown> {
  return {
    get: {
      tags: ['Features'], summary: 'Get a feature by ID',
      parameters: [
        { name: 'specId', in: 'path', required: true, schema: { type: 'string' } },
        { name: 'epicId', in: 'path', required: true, schema: { type: 'string' } },
        { name: 'featureId', in: 'path', required: true, schema: { type: 'string' } },
      ],
      responses: { '200': { description: 'Feature details', ...singleResponse('Feature') } },
    },
  };
}
