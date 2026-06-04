# Introduction

## Overview

Welcome to the Boilerplate Monorepo Documentation!

### Purpose and Goals

This documentation serves as a comprehensive guide to the boilerplate monorepository, covering both frontend and backend. Its a foundational template for new software projects, offering a pre-configured structure and architecture that accelerates the development process. It provides a solid starting point, ensuring consistency and best practices right from the beginning. It aims to:

- **Simplify Setup:** Reduce the time spent on initial setup by providing a ready-to-use foundation with common configurations.

- **Ensure Consistency:** Enforce coding standards and best practices to maintain a consistent codebase throughout the project lifecycle.

- **Facilitate Scalability:** Design the architecture to accommodate growth, making it easier to scale the project as requirements evolve.

- **Encourage Collaboration:** Promote collaboration among team members by establishing a clear project structure and documentation.

- **Enhance Maintainability:** Set up a modular and organized codebase that facilitates easy maintenance and future enhancements.

- **Promote Testing:** Include testing frameworks and examples to encourage the development of robust and reliable software.

### Technologies Used

Boilerplate leverages a modern technology stack to deliver a robust and scalable solution. Key technologies include:

**Frontend:**
  - Next.js
  - React
  - Typescript
  - React Final Form
  - React Spectrum & React Aria
  - Zustand
  - Storybook
  - Axios
  - Svgr
  - React Testing Library / Jest / Cypress
  - SASS modules

**Backend:**
  - Nest.js
  - Typescript
  - Swagger
  - Class Validator
  - Prisma
  - AWS SDK
  - Sharp
  - Jest

## How to Use This Documentation

Whether you're a developer looking to contribute, a new team member getting started, this documentation is structured to provide you with initial information.

Happy coding!

# Project Structure

The project follows a well-organized directory structure to maintain clarity, modularity, and ease of navigation.

- **packages/**: Directory containing sub-packages or projects within the monorepo.
  - **frontend/**: Frontend application code.
    - **chromatic.log**: Log file generated during integration with Chromatic, a tool for visual regression testing of UI components.
    - **jest.config.js**: Configuration file for Jest.
    - **jest.setup.ts**: TypeScript file used for setting up Jest configurations and global setup for tests.
	- **package.json**: Project metadata and dependencies for the frontend.
	- **.env**: File with environment variables.
	- **.env.production**: File with production environment variables.
	- **.env.staging**: File with staging environment variables.
	- **tsconfig.json**: TypeScript configuration file for the frontend.
	- **css.d.ts**: TypeScript declaration file for CSS modules.
	- **__mocks__/**: Directory containing mock files used in Jest tests.
	- **public/**: Directory for static assets that should be served directly, such as images or fonts.
	- **typings/**: Directory for TypeScript type definitions specific to the frontend application.
	- **cypress/**: Directory containing end-to-end (E2E) tests written using Cypress.
	- **next.config.js**: Configuration file for Next.js.
	- **cypress.config.ts**: TypeScript configuration file for Cypress.
	- **next-env.d.ts**: TypeScript declaration file for Next.js.
	- **.eslintrc**: Configuration file used by ESLint.
	- **.eslintignore**: File is used to specify files and directories that ESLint should ignore during linting.
	- **src/**: Directory containing the source code of the frontend application.
		- **app/**: Directory containing the core application logic.
		- **instrumentation.ts**: TypeScript file related to application monitoring and logging tools.
		- **middleware.ts**: TypeScript file defining middleware functions used in the application.
		- **services/**: Directory for service modules that encapsulate business logic.
		- **store/**: Directory for Zustand stores.
		- **env.ts**: A TypeScript file for check environment variables.
		- **locales/**: Directory for localization or internationalization files.
		- **providers/**: Directory for provider modules.
		- **shared/**: Directory for shared code and utilities that can be used across different parts of the application.
  - **backend/**: Backend application code.
    - **prisma/**: Directory for Prisma-related files.
    	- **schema.prisma**: defines the data model for the database, including entities, relationships, and constraints. It serves as the single source of truth for the application's database schema.
	- **tsconfig.build.json**: TypeScript configuration file specifically for building the project.
	- **tsconfig-checks.json**: TypeScript configuration file for type-checking specific files or directories.
	- **tsconfig.json**: Main TypeScript configuration file for the backend.
	- **nest-cli.json**: Configuration file for Nest CLI (Command Line Interface).
	- **package.json**: Project metadata and dependencies for the backend.
	- **.env**: File with environment variables.
	- **.env.production**: File with production environment variables.
	- **.env.staging**: File with staging environment variables.
	- **src/**: Directory containing the source code of the backend application.
		- **app.module.ts**: The main module file of your Nest.js application.
		- **env.ts**: A TypeScript file for check environment variables.
		- **main.ts**: The entry point of your Nest.js application.
		- **modules/**: A directory that contains sub-modules.
		- **repositories/**: A directory containing database repository files.
		- **shared/**: A directory for shared code and utilities that can be used across different parts of the application.
		- **typings/**: A directory for TypeScript type definitions.
- **.gihub/**: Github workflows.
- **.husky/**: Git hooks.
- **.git/**: Git version control.
- **.gitignore/**: Projects gitignore.
- **.yarnrc.yml**: Yarn configuration file in YAML format.
- **branching-model.md**: Document describing the branching model used in the repository.
- **docker-compose.yml**: Configuration file for Docker Compose.
- **Dockerfile.backend**: Dockerfile for building the backend application.
- **Dockerfile.backend_production**: Dockerfile for building the production version of the backend application.
- **Dockerfile.backend_staging**: Dockerfile for building the staging version of the backend application.
- **Dockerfile.frontend**: Dockerfile for building the frontend application.
- **Dockerfile.frontend_production**: Dockerfile for building the production version of the frontend application.
- **Dockerfile.frontend_staging**: Dockerfile for building the staging version of the frontend application.
- **heroku_backend_production.yml**: Heroku configuration file for deploying the backend to production.
- **heroku_backend_staging.yml**: Heroku configuration file for deploying the backend to staging.
- **heroku_frontend_production.yml**: Heroku configuration file for deploying the frontend to production.
- **heroku_frontend_staging.yml**: Heroku configuration file for deploying the frontend to staging.
- **README.md**: Project overview.
- **package.json**: Project metadata and dependencies.
- **tsconfig.json**: TypeScript configuration file.

# System Architecture

For a visual representation of the system's high-level architecture, please see the [System Architecture Diagram](./docs/architecture.md).

# Detailed Documentation

For more detailed information on specific parts of the application, please refer to the following documents:

- [Admin Portal Overview](./docs/admin_overview.md)
- [Client Portal Overview](./docs/client_portal_overview.md)
- [Contract Mobile App Overview](./docs/contract_mobile_overview.md)
- [Contractor Web Portal Overview](./docs/contractor_web_overview.md)

# Architecture Overview

The architecture follows a clear and modular structure, consisting of key components: modules, controllers, services, and repositories.

## Modules

- **Description:** Modules represent distinct features or functionalities within the application. Each module encapsulates a set of related components, promoting a modular and organized codebase.

## Controllers

- **Description:** Controllers handle the incoming requests and serve as the entry point for the application. They process user inputs, interact with services, and return appropriate responses.

## Services

- **Description:** Services contain the business logic of the application. They handle specific functionalities, such as data processing, business rules, and external integrations, promoting separation of concerns.

## Repositories

- **Description:** Repositories manage the interaction with the data storage layer. They abstract the database operations, providing a clean interface for services to access and manipulate data.

## Architecture Schema

project-root/
│
├── modules/
│   ├── feature1/
│   │   ├── controllers/    ←   services/
│   │   │       ↑                   ↑
│   │   └── services/       ←   repositories/
│   │
│   ├── feature2/
│   │   ├── controllers/    ←    services/
│   │   │       ↑                   ↑
│   │   └── services/       ←    repositories/
│   │
│   └── ...
│
├── repositories/
│   ├── entity1/
│   │   └── ...repository
│   │
│   ├── entity2/
│   │   └── ...repository
│   │
│   └── ...
│
├── shared/
│
├── ...

# 4. Authentication

## Overview of Authentication Mechanisms

We utilizes JSON Web Tokens (JWT) and HTTP-only cookies for authentication. The authentication flow involves the frontend sending user credentials or data obtained from OAuth providers such as Facebook, GitHub, or Google to the backend. The backend, upon successful validation, responds with HTTP-only cookies containing a JWT token and a refresh token. In the case of OAuth providers, the tokens are initially validated.

### Setup and Configuration Details

#### **Backend**

1. **JWT Configuration:**
   - Configure JWT for token creation, validation, and expiration.
   - Using RSA secret keys and algorithms for signing and verifying tokens.
   - Using guards to verify JWT tokens on protected routes.

2. **OAuth Provider Integration:**
   - Integrated with OAuth providers (Facebook, GitHub, Google) using their API.
   - Establish callback routes to handle OAuth redirections.

3. **HTTP-only Cookies:**
   - Configure cookies as HTTP-only for enhanced security.
   - Issue cookies containing the JWT token and refresh tokens.

#### **Frontend**

1. **User Authentication:**
   - Collect user credentials or OAuth data (from Facebook, GitHub, Google).
   - Utilize OAuth provider's redirects.

2. **Token Storage:**
   - Store JWT tokens obtained from our backend stored in http-only cookies ONLY.


 Frontend                Backend (NestJS)           OAuth Providers
    │                           │                             │
    │                           │                             │
    │                           ├─── OAuth Provider Data ───▶ |
    │                           │                             │
    │                           ├─── Validate OAuth Data ───▶ |
    │                           │                             │
    │                           │                             │
    ├─ Authenticated Request ─▶ |                             │
    │                           │                             │
    │                           │                             │
    │                           │                             │
    │◀─ JWT & Refresh Tokens ── │                             │
    └───────────────────────────┘                             |

# 5. Database Connection

The boilerplate provides support for connecting to PostgreSQL using Prisma as the database ORM.

## Configuration Details

Prisma is configured in the NestJS to facilitate database operations and interactions. Database credentials, including connection URL, username, password, and other configuration details, are sourced from the `.env` file. Example: DATABASE_URL=postgresql://username:password@localhost:5432/yourdatabase

# 6. Mail Provider Connection

## Integration with a Mail Provider (Brevo)

The boilerplate provides integration with Brevo as the chosen mail provider for handling email communication in separate 'mail' module. Obtain a Brevo API key from the Brevo dashboard, store the API key in the `.env` file. Example: 
BREVO_API_KEY=example

# 7. Blob Storage

## Integration with Blob Storage (AWS S3)

The boilerplate provides integration with blob storage to handle file uploads, serving as a reliable and scalable solution for storing and retrieving files. We have a separate blob storage module to encapsulate file upload and storage logic. The blob storage service within the blob storage module provides methods for uploading and retrieving files. Store blob storage credentials and configuration details in the .env file. Example: 
AWS_S3_REGION=eu-north
AWS_ACCESS_KEY=ACCESS_KEY
AWS_SECRET_ACCESS_KEY=SECRET_KEY
AWS_BUCKET_NAME=NAME

# 8. Testing

## Overview of the Testing

The boilerplate follows a comprehensive testing strategy, incorporating unit testing, integration testing, and end-to-end testing to ensure the reliability and correctness of the application. We provide test cases demonstrate the testing approach for key functionalities in both the backend and frontend, covering unit tests, integration tests, and end-to-end tests using Jest, React Testing Library, and Cypress.

## Tools used for Testing

### Backend (NestJS)

- **Jest:** Used as the primary testing framework for unit and integration testing in the NestJS backend.
- **nestjs/testing:** Using for integration testing with NestJS

### Frontend (React)

- **Jest:** Utilized for unit testing React components and functions.
- **React Testing Library:** Integrated for testing React components in a way that simulates user interactions and behavior.
- **Cypress:** Employed for end-to-end testing, ensuring the application works seamlessly from a user's perspective.

# 9. Code Quality and Linting

## Coding Standards and Conventions

We strictly adhere to elevated coding standards and conventions, aiming to uphold uniform and well-maintained code throughout the entire codebase. This is accomplished by incorporating sophisticated ESLint configurations, defaults, examples, and conducting code reviews, all of which contribute to ensuring the implementation of best practices and maintaining high code quality.

## Integration with Linting Tools

We utilizes ESLint as the primary linting tool for code formatting and static code analysis to identify and fix problems in your TypeScript code.

While we primarily useing ESLint for linting, you have the flexibility to add your preferred code formatting tool locally. Ensure that the chosen formatting tool does not conflict with ESLint rules to maintain code consistency.

# 11. Continuous Integration/Continuous Deployment (CI/CD)

## Overview of CI/CD Pipeline

The boilerplate incorporates a robust Continuous Integration/Continuous Deployment (CI/CD) pipeline to automate and streamline the software development and deployment processes. The `.github/workflows` directory contains YAML files specifying the GitHub Actions workflow for CI/CD.

## Deployment Process and Configurations

### Staging Branch

- **Automated Deployment:**
  - The staging branch is automatically deployed to the staging environment upon each push.

### Main Branch

- **Automated Deployment:**
  - The main branch is automatically deployed to the production environment upon each push.

# 12. Branching model

- *main* branch is always deployable;
- *staging* branch is always deployable;
- *hotfixes* are backmerged to master branch;
- deployments to production are done by tagging a release branch and incrementing it's version;
​
**Feature branch naming:**
- Format: `{feat | fix | ref}/{issue id}-{name}`
- Example: feat/IN-13_add-auth0-authentication
​
**Pull Requests (when working in a team):**Each and every feature branch has to be peer-reviewed before or after being merged into the trunk. Prefer to review PRs before merging to trunk, but post-merge reviews are possible to in order to unblock the person working on the feature.We are following the next process:
​
- name the PR in the following format: `{feat|fix|ref}: #{issue id} - {issue name}`, for example `feat: #IN-2 - add auth0 authentication`
- in the PR, we are checking that:
- code works;
- code solves the task and corresponds to acceptance criteria;
- the code respects Clean Code principles, is well structured, variables and functions are clearly named, etc;
- there is no commented code (unless it is really, really important, in that case it has to be explained why in a comment);
- is well-commented but doesn’t have useless comments (prefer clear code to too many comments).
​
**Team Lead responsibilities:**
- merge PRs to *staging* and *main*;
- check and approve code;
- help devs with hard issues;
- сhecking all builds for errors and success  / reviewing deployed links on Heroku / check envs for prod / staging;
​
**STRICTLY forbidden for DEVS:**
- merge code to *staging* and *main* branches;

