# GEMINI.md

## Project Overview

This project is **SpellWell**, an intelligent English spelling learning application designed as a WeChat Mini Program for children. It uses a gamified approach with an adventure map to make learning engaging.

*   **Purpose:** To help elementary school students learn English spelling in a fun and interactive way.
*   **Main Technologies:**
    *   **Frontend:** WeChat Mini Program (native development), WXSS for styling.
    *   **Backend:** Tencent CloudBase (Serverless platform) with Node.js for cloud functions.
    *   **AI Services:** Integrates with AI for intelligent word explanations and text-to-speech (TTS) for audio pronunciations.
*   **Architecture:** The application follows a standard WeChat Mini Program structure with a clear separation of pages, components, and utility services. It relies on cloud-native services for its backend, making it a serverless application.

## Building and Running

To build and run this project, you need to use the WeChat Developer Tools.

*   **Prerequisites:**
    *   WeChat Developer Tools
    *   Node.js
    *   A Tencent Cloud account for the CloudBase backend.

*   **Setup and Running:**
    1.  **Clone the repository.**
    2.  **Configure Cloud Environment:**
        *   Set up a Tencent CloudBase environment.
        *   Update the environment ID in `utils/config.js`.
        *   Deploy the cloud functions located in the `cloudbase/` directory.
    3.  **Run the Mini Program:**
        *   Open the project directory in the WeChat Developer Tools.
        *   Configure your AppID.
        *   Click the "Compile" button to run the application in the simulator.

*   **Testing:**
    *   The `README.md` mentions that testing tools were moved to a `temp_deleted/` directory, suggesting that tests exist but may not be in the current file structure. To run tests, you would likely need to restore this directory and follow the instructions within it.

## Development Conventions

*   **Coding Style:** The project uses ESLint for code linting, implying a standardized JavaScript coding style.
*   **Styling:** A custom design system called "Neo-Brutalism" is used, with global styles defined in `app.wxss` and component-specific styles in their respective `.wxss` files.
*   **Modularity:** The code is organized into pages, components, and a `utils` directory for shared services (like AI, audio, and data management), promoting a modular and maintainable codebase.
*   **Commits and Contributions:** The `README.md` includes a "Contribution Guide" section, which suggests a standard Git workflow (fork, branch, pull request) for contributions.
