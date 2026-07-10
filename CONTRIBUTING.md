# Contributing to GrowEasy CSV Importer

We welcome contributions! Please follow these guidelines to ensure a smooth collaboration process.

## Local Development Setup

1. **Fork and Clone**
   Fork the repository and clone your fork locally.

2. **Install Dependencies**
   The project has both frontend and backend dependencies.
   ```bash
   # Install backend dependencies
   npm install

   # Install frontend dependencies
   cd client
   npm install
   ```

3. **Environment Setup**
   Copy `.env.example` to `.env` in the root directory and configure your API keys (e.g., Anthropic, Gemini, or OpenAI).

4. **Start Development Servers**
   ```bash
   # Terminal 1: Backend
   npm run dev

   # Terminal 2: Frontend
   cd client
   npm run dev
   ```

## Development Guidelines

- **Architecture:** Keep the controllers thin. Business logic should reside in the `src/services` folder.
- **Constraints:** We enforce a soft limit of 300 lines of code per file to ensure readability. If a file grows larger, break it down into smaller modules.
- **Style:** We use ESLint and Prettier. Ensure your code passes the linting checks before submitting a PR.
- **API Contracts:** Do not modify existing API request/response structures unless it is a coordinated, versioned change.

## Pull Request Process

1. Create a feature branch from `main`.
2. Ensure you have tested your changes locally.
3. If you add new functionality, add a sample dataset to `examples/` if applicable.
4. Submit a Pull Request with a clear description of the problem solved or feature added.
5. Wait for CI checks to pass and a maintainer to review your code.

Thank you for contributing!
