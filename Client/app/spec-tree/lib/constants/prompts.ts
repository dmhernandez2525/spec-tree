import { RootState } from '../store';
import {
  EpicType,
  FeatureType,
  UserStoryType,
  TaskType,
} from '../types/work-items';
import {
  selectFeatureById,
  selectUserStoryById,
  selectTaskById,
} from '../store/slices/sow-slice';

const mapFeatures = (featureIds: string[], state: RootState): string =>
  JSON.stringify(featureIds.map((id) => selectFeatureById(state, id)));

const mapUserStories = (userStoryIds: string[], state: RootState): string =>
  JSON.stringify(userStoryIds.map((id) => selectUserStoryById(state, id)));

const mapTasks = (taskIds: string[], state: RootState): string =>
  JSON.stringify(taskIds.map((id) => selectTaskById(state, id)));
export const epicPrompt = (requirements: string, context?: string): string => `
  ${context ? `Additional Context: ${context}\n` : ''}
    Given the following requirements, generate an Epic in the JSON format as follows: 
    {
      "title": "epic title", 
      "description": "epic description", 
      "goal": "epic goal", 
      "successCriteria": "success criteria", 
      "dependencies": "dependencies", 
      "timeline": "timeline", 
      "resources": "resources", 
      "risksAndMitigation": {
        "resolve": [
          { "text": "resolve strategy one" },
          { "text": "resolve strategy two" }
        ]
        "own": [
          { "text": "own strategy one" },
          { "text": "own strategy two" }
        ]
        "accept": [
          { "text": "accept strategy one" },
          { "text": "accept strategy two" }
        ]
        "mitigate": [
          { "text": "mitigate strategy one" },
          { "text": "mitigate strategy two" }
        ]
      },
      "notes": "notes"
    }
    Please avoid repeating epics that have already been mentioned. Do not start a new JSON object if you cannot complete it within the character limit. Separate each JSON object with "=+=".
    ${requirements}
  `;

export const featurePrompt = (
  epic: EpicType,
  state: RootState,
  context?: string
): string => `
  ${context ? `Additional Context: ${context}\n` : ''}
  Given the epic with the following details:
  Title: ${epic.title}
  Description: ${epic.description}
  Goal: ${epic.goal}
  Success Criteria: ${epic.successCriteria}
  Dependencies: ${epic.dependencies}
  Timeline: ${epic.timeline}
  Resources: ${epic.resources}
  Risks and Mitigation Strategies: ${JSON.stringify(epic.risksAndMitigation)}
  Existing Features: ${mapFeatures(epic.featureIds, state)}
  Generate the technical details necessary for a developer to implement this feature. Please avoid repeating features that have already been mentioned. 
  Return the response in the following JSON format:{
    "title": "feature title", 
    "description": "feature description", 
    "details": "feature details", 
    "dependencies": "dependencies", 
    "acceptanceCriteria": [
      { "text": "criteria one" },
      { "text": "criteria two" }
    ]
    "parent": "parent feature", 
    "notes": "notes"
  }.
  Do not start a new JSON object if you cannot complete it within the character limit. Separate each JSON object with "=+=".
  `;

export const userStoryPrompt = (
  feature: FeatureType,
  state: RootState,
  context?: string
): string => `
  ${context ? `Additional Context: ${context}\n` : ''}
    Existing User Stories: ${mapUserStories(feature.userStoryIds, state)}
    Given the feature "${feature}", generate granular user stories from a development perspective. Each user story should be detailed enough that it would take a developer approximately one week to implement. Please avoid repeating user stories that have already been mentioned.
    Return each user story in the following JSON format: {
    "title": "user story title", 
    "role": "user role", 
    "action": "action", 
    "goal": "goal", 
    "points": "estimated points",    
    "acceptanceCriteria": [
      { "text": "criteria one" },
      { "text": "criteria two" }
    ], 
    "notes": "notes", 
    "parent": "parent user story", 
    "developmentOrder": "development order", 
    "dependentUserStories": ["user story one", "user story two"]
    }.
    Do not start a new JSON object if you cannot complete it within the character limit. Separate each JSON object with "=+=".
  `;

export const taskPrompt = (
  userStory: UserStoryType,
  state: RootState,
  context?: string
): string => `
  ${context ? `Additional Context: ${context}\n` : ''}
  Given the user story "${userStory.title}
  Role: ${userStory.role}
  Action: ${userStory.action}
  Acceptance criteria: ${userStory.acceptanceCriteria}
  Existing Tasks: ${mapTasks(userStory.taskIds, state)},
  generate granular tasks from a development perspective. Each task should be detailed enough that it would take a developer approximately one day to implement. Please avoid repeating tasks that have already been mentioned.
  Return each task in the following JSON format: {
    "title": "task title", 
    "details": "task details", 
    "priority": "task priority", 
    "notes": "notes", 
    "parent": "parent task", 
    "developmentOrder": "development order", 
    "dependentTasks": ["task one", "task two"]
  }.
  Do not start a new JSON object if you cannot complete it within the character limit. Separate each JSON object with "=+=".
  `;

export const generateAdditionalEpicsPrompt = ({
  state,
}: {
  state: RootState;
}): string => {
  return `Given the epic with the following details:
  globalInformation: ${state.sow.globalInformation}
  application information: ${state.sow.globalInformation}
  existing epics: ${state?.sow?.epics}
  Identify and generate as many additional epics as possible, necessary from a development perspective. Each epics should be detailed, leveraging the provided information. Each epics should include a short descriptive title, a brief summary, an in-depth description, and any dependencies. Please avoid repeating epics that have already been mentioned.
  Return each epics in the following JSON format:{
    "title": "epic title", 
    "description": "epic description",
    "goal": "epic goal", 
    "successCriteria": "successCriteria",
    "dependencies": "dependencies",
    "timeline": "timeline",
    "resources": "resources",
    "risksAndMitigation": [{
      resolve: [{
        text:string
      }];
      own: [{
        text:string
      }];
      accept: [{
        text:string
      }];
      mitigate: [{
        text:string
      }];
    }], 
    "notes": "notes"
  }.
  Please ensure to adhere strictly to the JSON format. Do not start a new JSON object if you cannot complete it within the character limit. Separate each JSON object with "####".
  `;
};
export const generateAdditionalFeaturesPrompt = (
  epic: EpicType,
  state: RootState
): string => `
  Given the epic with the following details:
  Title: ${epic.title}
  Description: ${epic.description}
  Goal: ${epic.goal}
  Success Criteria: ${epic.successCriteria}
  Dependencies: ${epic.dependencies}
  Timeline: ${epic.timeline}
  Resources: ${epic.resources}
  Risks and Mitigation Strategies: ${JSON.stringify(epic.risksAndMitigation)}
  Existing Features: ${mapFeatures(epic.featureIds, state)}
  Identify and generate as many additional features as possible, necessary from a development perspective. Each feature should be detailed, leveraging the provided information. Each feature should include a short descriptive title, a brief summary, an in-depth description, and any dependencies. Please avoid repeating features that have already been mentioned.
  Return each feature in the following JSON format: {
    "title": "feature title", 
    "description": "feature description", 
    "details": "feature details", 
    "dependencies": "dependencies",  
    "acceptanceCriteria": [
      { "text": "criteria one" },
      { "text": "criteria two" }
    ]
    "notes": "notes"
  }.
  Please ensure to adhere strictly to the JSON format. Do not start a new JSON object if you cannot complete it within the character limit. Separate each JSON object with "####".
  `;

export const generateAdditionalUserStoriesPrompt = (
  feature: FeatureType,
  state: RootState
): string => `
  Given the feature with the following details:
  Title: ${feature.title}
  Description: ${feature.description}
  Details: ${feature.details}
  Dependencies: ${feature.dependencies}
  Acceptance Criteria: ${JSON.stringify(feature.acceptanceCriteria)}
  Existing User Stories: ${mapUserStories(feature.userStoryIds, state)}
  Generate as many additional user stories as possible from a development perspective. Each user story should be detailed, leveraging the provided information, and granular enough that it would take a developer approximately one week to implement. Please avoid repeating user stories that have already been mentioned.
  Return each user story in the following JSON format: {
    "title": "user story title", 
    "role": "user role", 
    "action": "action", 
    "goal": "goal", 
    "points": "estimated points", 
    "acceptanceCriteria": [
      { "text": "criteria one" },
      { "text": "criteria two" }
    ]
    "notes": "notes", 
    "parent": "parent user story", 
    "developmentOrder": "development order", 
    "dependentUserStories": ["user story one", "user story two"]
  }.
  Please ensure to adhere strictly to the JSON format. Do not start a new JSON object if you cannot complete it within the character limit. Separate each JSON object with "####".
  `;

export const generateAdditionalTasksPrompt = (
  userStory: UserStoryType,
  state: RootState
): string => `
  Given the user story with the following details:
  Title: ${userStory.title}
  Role: ${userStory.role}
  Action: ${userStory.action}
  Goal: ${userStory.goal}
  Points: ${userStory.points}
  Acceptance Criteria: ${JSON.stringify(userStory.acceptanceCriteria)}
  Notes: ${userStory.notes}
  Parent: ${userStory.parentFeatureId}
  Development Order: ${userStory.developmentOrder}
  Dependent User Stories: ${JSON.stringify(userStory.dependentUserStoryIds)}
  Existing Tasks: ${mapTasks(userStory.taskIds, state)}
  Generate as many additional tasks as possible from a development perspective. Each task should be detailed, leveraging the provided information, and granular enough that it would take a developer approximately one day to implement. Please avoid repeating tasks that have already been mentioned.
  Return each task in the following JSON format: {
    "title": "task title", 
    "details": "task details", 
    "priority": "task priority", 
    "notes": "notes", 
    "parent": "parent task", 
    "developmentOrder": "development order", 
    "dependentTasks": ["task one", "task two"]
  }.
  Please ensure to adhere strictly to the JSON format. Do not start a new JSON object if you cannot complete it within the character limit. Separate each JSON object with "####".
  `;

// ======================
// ContextQuestions
// ======================

export const generateContextQuestionsForEpic = (epic: EpicType): string => `
Given the epic with the following details:
Title: ${epic.title}
Description: ${epic.description}
Goal: ${epic.goal}
Success Criteria: ${epic.successCriteria}
Dependencies: ${epic.dependencies}
Timeline: ${epic.timeline}
Resources: ${epic.resources}
Risks and Mitigation Strategies: ${JSON.stringify(epic.risksAndMitigation)}
Generate a set of questions that would help in understanding the detailed requirements, dependencies, goals, and other aspects of this epic. The answers to these questions will be used to create a detailed context for generating work items related to this epic.
Return each question in a separate line and use "=+=" as a separator between questions.
Please include only the questions and "=+=" separators without any additional text or formatting.
`;

export const generateContextQuestionsForFeature = (
  feature: FeatureType
): string => `
Given the feature with the following details:
Title: ${feature.title}
Description: ${feature.description}
Details: ${feature.details}
Dependencies: ${feature.dependencies}
Acceptance Criteria: ${JSON.stringify(feature.acceptanceCriteria)}
Notes: ${feature.notes}
Generate a set of questions that would help in understanding the detailed requirements, dependencies, user needs, and technical aspects of this feature. The answers to these questions will be used to create a detailed context for generating work items related to this feature.
Return each question in a separate line and use "=+=" as a separator between questions.
Please include only the questions and "=+=" separators without any additional text or formatting.
`;

export const generateContextQuestionsForUserStory = (
  userStory: UserStoryType
): string => `
Given the user story with the following details:
Title: ${userStory.title}
Role: ${userStory.role}
Action: ${userStory.action}
Goal: ${userStory.goal}
Points: ${userStory.points}
Acceptance Criteria: ${JSON.stringify(userStory.acceptanceCriteria)}
Notes: ${userStory.notes}
Generate a set of questions that would help in understanding the detailed requirements, role, action, goal, and other aspects of this user story. The answers to these questions will be used to create a detailed context for generating work items related to this user story.
Return each question in a separate line and use "=+=" as a separator between questions.
Please include only the questions and "=+=" separators without any additional text or formatting.
`;

export const generateContextQuestionsForTask = (task: TaskType): string => `
Given the task with the following details:
Title: ${task.title}
Details: ${task.details}
Priority: ${task.priority}
Notes: ${task.notes}
Development Order: ${task.developmentOrder}
Dependent Tasks: ${JSON.stringify(task.dependentTaskIds)}
Generate a set of questions that would help in understanding the detailed requirements, priority, dependencies, and other aspects of this task. The answers to these questions will be used to create a detailed context for generating work items related to this task.
Return each question in a separate line and use "=+=" as a separator between questions.
Please include only the questions and "=+=" separators without any additional text or formatting.
`;

export const generateContextQuestionsForGlobalRefinement = (
  globalInformation: string
): string => `
Global Information: ${globalInformation}
Please generate a set of questions that would help in refining and understanding the overall context, requirements, architecture, and other aspects of the application.
Return each question on a new line, and separate each question with "=+=".
Include only the questions and "=+=" separators in the response, without any additional text or formatting.
`;

export const generateExplanationForGlobalRefinement = (
  globalInformation: string,
  context: string
): string => `
Global Information: ${globalInformation}

Contextual Questions and Answers:
${context}

Please generate a refined and concise explanation based on the above information. Consider the global context of the application and the answers provided to the questions.

Include only the updated explanation in the response, without any additional text or formatting. Use the special separator "=+=" to denote the start and end of the explanation.

`;
