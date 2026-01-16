## Overview

This application is a tool for generating user stories based on provided epics and features. It uses the OpenAI API to generate the user stories, which are then displayed in the application.

## Getting Started

### Prerequisites

- Node.js and npm installed on your local machine.
- An OpenAI API key.

### Installation

1. Clone the repository: `git clone https://github.com/your-repo-url`
2. Install dependencies: `npm install`
3. Start the application: `npm start`

## Usage

1. Enter the details for your epics and features in the provided input fields.
2. Click the "Generate User Stories" button to generate the user stories.
3. The generated user stories will be displayed in the application.

## Design

The application is built with React and uses the `fetch` function to make API calls to the OpenAI API. The application state is managed with React's `useState` hook, and side effects like API calls are handled with the `useEffect` hook.

The application has a form for inputting the epic and feature details, and a display area for showing the generated user stories. The form values are stored in the state and updated with an `onChange` handler.

The application also has a loading state to show a loading message while the API call is in progress, and error handling to show an error message if the API call fails.

## Future Improvements

- Add functionality to save the generated user stories to a local file or database.
- Improve the user interface with a library like Material-UI or Bootstrap.
- Add tests with a library like Jest or React Testing Library.

## Changelog

This project follows the [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) format for changelogs.

Changelogs are important to communicate your project's progress to users in a clear and organized way. The main types of changes that we document are:

- `Added` for new features.
- `Changed` for changes in existing functionality.
- `Deprecated` for soon-to-be removed features.
- `Removed` for now removed features.
- `Fixed` for any bug fixes.
- `Security` in case of vulnerabilities.

The changelog is intended to be easy to read and understand for all users of the project. We encourage all contributors to this project to add their changes to the changelog. If you're not sure how to do this, please refer to the [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) guide.
