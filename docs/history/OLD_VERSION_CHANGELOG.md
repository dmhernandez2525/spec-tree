## Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

### [Unreleased]

#### Added

- Introduced tasks to the UserStory component. Now each user story can contain multiple tasks, which can be generated, added, and removed dynamically.
- Introduced Acceptance Criteria (AC) functionality, allowing users to add, remove, and update acceptance criteria within the UserStory component.
- Ability to generate tasks by making requests to an API, and to display loading status during the API request.
- Functionality to calculate and display the total number of tasks in the UserStory component.
- Functionality to calculate and display the total number of tasks in the Feature component.
- Functionality to calculate and display the total number of tasks in the Epic component.
- Functionality to calculate and display the total number of tasks on the global level in the App.tsx component.
- Introduced helper functions `makeDeleteHandler` and `makeUpdateHandler` for deleting and updating specific fields respectively.
- Introduced new hooks `useAsyncState`, `useConfirmationDialog`, `useCopyToClipboard`, `useInput`, `useModalState`, and `useAcceptanceCriteria` for managing component state.
- Introduced new utility functions for calculating total points, tasks, features, and user stories.
- Introduced new components including `Button`, `ButtonWithConfirmation`, `ExportCSVButton`, `InputField`, `LoadingSpinner`, `MetricsDisplay`, and `AcceptanceCriteriaList` to improve modularity and reusability of code.
- Ability to filter different file types in the `process_files.ps1` script. Users can now pass flags to the script to specify the types of files they want to include in the output. Supported file types are TypeScript (.ts, .tsx), JavaScript (.js, .jsx), CSS (.css, .scss), JSON (.json), and Markdown (.md), as well as test files.
- Ability to specify directories to be included in the `process_files.ps1` script. Users can pass a space-separated list of directory names with the `-Directories` flag, and the script will only process files in these directories.
- Enhanced script documentation in the newly created `process_files.md` file, including a section detailing all the possible permutations of commands that can be given.
- Instructions on how to grant execution permissions to the script across different operating systems (Windows, MacOS, Linux) in the `process_files.md` file.

#### Changed

- Updated UserStory, Feature, Epic, and App components to include task-related functionalities.
- Updated state management in Redux to include task-related actions and reducers.
- Updated types to include task-related fields in the UserStoryType.
- Refactored the `process_files.ps1` script to include directory-based filtering.
- Enhanced the CSV export functionality to include task details.
- Fixed the issue with updating task fields, ensuring that new values are displayed correctly.

#### Deprecated

#### Removed

#### Fixed

- Fixed the issue where the CSV export was not including all task details.
- Fixed the issue with updating task fields, ensuring that new values are displayed correctly.

#### Security
