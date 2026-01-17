/**
 * MSW Request Handlers
 *
 * Mock API handlers for Strapi and Microservice endpoints
 */

import { http, HttpResponse } from 'msw';
import {
  createMockEpic,
  createMockFeature,
  createMockUserStory,
  createMockTask,
  createMockApp,
} from '../fixtures/work-items';

const STRAPI_API_URL = 'http://localhost:1337/api';
const MICROSERVICE_URL = 'http://localhost:3001';

// HTTP Handlers for Strapi API
export const strapiHandlers = [
  // Apps endpoints
  http.get(`${STRAPI_API_URL}/apps`, () => {
    const apps = Array.from({ length: 3 }, () => createMockApp());
    return HttpResponse.json({
      data: apps.map((app) => ({
        id: app.id,
        documentId: app.documentId,
        attributes: app,
      })),
      meta: { pagination: { total: apps.length } },
    });
  }),

  http.get(`${STRAPI_API_URL}/apps/:documentId`, ({ params }) => {
    const app = createMockApp({ documentId: params.documentId as string });
    return HttpResponse.json({
      data: { id: app.id, documentId: app.documentId, attributes: app },
    });
  }),

  http.post(`${STRAPI_API_URL}/apps`, async ({ request }) => {
    const body = (await request.json()) as { data: Record<string, unknown> };
    const newApp = createMockApp(body.data);
    return HttpResponse.json(
      { data: { id: newApp.id, documentId: newApp.documentId, attributes: newApp } },
      { status: 201 }
    );
  }),

  // Epics endpoints
  http.get(`${STRAPI_API_URL}/epics`, ({ request }) => {
    const url = new URL(request.url);
    const appId = url.searchParams.get('filters[app][documentId][$eq]');
    const epics = Array.from({ length: 3 }, () =>
      createMockEpic({ parentAppId: appId || undefined })
    );
    return HttpResponse.json({
      data: epics.map((epic) => ({
        id: epic.id,
        documentId: epic.documentId,
        attributes: epic,
      })),
      meta: { pagination: { total: epics.length } },
    });
  }),

  http.get(`${STRAPI_API_URL}/epics/:documentId`, ({ params }) => {
    const epic = createMockEpic({ documentId: params.documentId as string });
    return HttpResponse.json({
      data: { id: epic.id, documentId: epic.documentId, attributes: epic },
    });
  }),

  http.post(`${STRAPI_API_URL}/epics`, async ({ request }) => {
    const body = (await request.json()) as { data: Record<string, unknown> };
    const newEpic = createMockEpic(body.data);
    return HttpResponse.json(
      { data: { id: newEpic.id, documentId: newEpic.documentId, attributes: newEpic } },
      { status: 201 }
    );
  }),

  http.put(`${STRAPI_API_URL}/epics/:documentId`, async ({ params, request }) => {
    const body = (await request.json()) as { data: Record<string, unknown> };
    const updatedEpic = createMockEpic({
      ...body.data,
      documentId: params.documentId as string,
    });
    return HttpResponse.json({
      data: { id: updatedEpic.id, documentId: updatedEpic.documentId, attributes: updatedEpic },
    });
  }),

  http.delete(`${STRAPI_API_URL}/epics/:documentId`, () => {
    return HttpResponse.json({ data: null }, { status: 200 });
  }),

  // Features endpoints
  http.get(`${STRAPI_API_URL}/features`, ({ request }) => {
    const url = new URL(request.url);
    const epicId = url.searchParams.get('filters[epic][documentId][$eq]');
    const features = Array.from({ length: 3 }, () =>
      createMockFeature({ parentEpicId: epicId || undefined })
    );
    return HttpResponse.json({
      data: features.map((feature) => ({
        id: feature.id,
        documentId: feature.documentId,
        attributes: feature,
      })),
      meta: { pagination: { total: features.length } },
    });
  }),

  http.post(`${STRAPI_API_URL}/features`, async ({ request }) => {
    const body = (await request.json()) as { data: Record<string, unknown> };
    const newFeature = createMockFeature(body.data);
    return HttpResponse.json(
      { data: { id: newFeature.id, documentId: newFeature.documentId, attributes: newFeature } },
      { status: 201 }
    );
  }),

  http.put(`${STRAPI_API_URL}/features/:documentId`, async ({ params, request }) => {
    const body = (await request.json()) as { data: Record<string, unknown> };
    const updatedFeature = createMockFeature({
      ...body.data,
      documentId: params.documentId as string,
    });
    return HttpResponse.json({
      data: { id: updatedFeature.id, documentId: updatedFeature.documentId, attributes: updatedFeature },
    });
  }),

  http.delete(`${STRAPI_API_URL}/features/:documentId`, () => {
    return HttpResponse.json({ data: null }, { status: 200 });
  }),

  // User Stories endpoints
  http.get(`${STRAPI_API_URL}/user-stories`, ({ request }) => {
    const url = new URL(request.url);
    const featureId = url.searchParams.get('filters[feature][documentId][$eq]');
    const userStories = Array.from({ length: 3 }, () =>
      createMockUserStory({ parentFeatureId: featureId || undefined })
    );
    return HttpResponse.json({
      data: userStories.map((story) => ({
        id: story.id,
        documentId: story.documentId,
        attributes: story,
      })),
      meta: { pagination: { total: userStories.length } },
    });
  }),

  http.post(`${STRAPI_API_URL}/user-stories`, async ({ request }) => {
    const body = (await request.json()) as { data: Record<string, unknown> };
    const newUserStory = createMockUserStory(body.data);
    return HttpResponse.json(
      { data: { id: newUserStory.id, documentId: newUserStory.documentId, attributes: newUserStory } },
      { status: 201 }
    );
  }),

  http.put(`${STRAPI_API_URL}/user-stories/:documentId`, async ({ params, request }) => {
    const body = (await request.json()) as { data: Record<string, unknown> };
    const updatedUserStory = createMockUserStory({
      ...body.data,
      documentId: params.documentId as string,
    });
    return HttpResponse.json({
      data: { id: updatedUserStory.id, documentId: updatedUserStory.documentId, attributes: updatedUserStory },
    });
  }),

  http.delete(`${STRAPI_API_URL}/user-stories/:documentId`, () => {
    return HttpResponse.json({ data: null }, { status: 200 });
  }),

  // Tasks endpoints
  http.get(`${STRAPI_API_URL}/tasks`, ({ request }) => {
    const url = new URL(request.url);
    const userStoryId = url.searchParams.get('filters[userStory][documentId][$eq]');
    const tasks = Array.from({ length: 3 }, () =>
      createMockTask({ parentUserStoryId: userStoryId || undefined })
    );
    return HttpResponse.json({
      data: tasks.map((task) => ({
        id: task.id,
        documentId: task.documentId,
        attributes: task,
      })),
      meta: { pagination: { total: tasks.length } },
    });
  }),

  http.post(`${STRAPI_API_URL}/tasks`, async ({ request }) => {
    const body = (await request.json()) as { data: Record<string, unknown> };
    const newTask = createMockTask(body.data);
    return HttpResponse.json(
      { data: { id: newTask.id, documentId: newTask.documentId, attributes: newTask } },
      { status: 201 }
    );
  }),

  http.put(`${STRAPI_API_URL}/tasks/:documentId`, async ({ params, request }) => {
    const body = (await request.json()) as { data: Record<string, unknown> };
    const updatedTask = createMockTask({
      ...body.data,
      documentId: params.documentId as string,
    });
    return HttpResponse.json({
      data: { id: updatedTask.id, documentId: updatedTask.documentId, attributes: updatedTask },
    });
  }),

  http.delete(`${STRAPI_API_URL}/tasks/:documentId`, () => {
    return HttpResponse.json({ data: null }, { status: 200 });
  }),
];

// HTTP Handlers for Microservice (OpenAI proxy)
export const microserviceHandlers = [
  http.post(`${MICROSERVICE_URL}/api/openai/chat`, async () => {
    // Mock AI response for generating work items
    return HttpResponse.json({
      choices: [
        {
          message: {
            content: JSON.stringify({
              title: 'Generated Title',
              description: 'Generated description for the work item',
            }),
          },
        },
      ],
    });
  }),
];

// Error simulation handlers
export const errorHandlers = [
  http.get(`${STRAPI_API_URL}/error/500`, () => {
    return HttpResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }),

  http.get(`${STRAPI_API_URL}/error/404`, () => {
    return HttpResponse.json({ error: 'Not Found' }, { status: 404 });
  }),

  http.get(`${STRAPI_API_URL}/error/401`, () => {
    return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }),
];

// Export all handlers
export const handlers = [...strapiHandlers, ...microserviceHandlers, ...errorHandlers];
export default handlers;
