# Implementation Plan: Migrating from OpenAI to Gemini 2.5 Pro

## Overview

This document outlines the plan to replace OpenAI's GPT models with Google's Gemini 2.5 Pro in the AI-PR-Reviewer project. The goal is to maintain all existing functionality while switching the underlying AI model.

## Required Changes

### 1. Dependencies

- [x] Install Google Generative AI package:

  ```bash
  npm install @google/generative-ai
  ```

- [x] Install file management package:

  ```bash
  npm install @google/generative-ai/server
  ```

- [x] Install mime-types for file handling:

  ```bash
  npm install mime-types
  ```

### 2. Configuration Changes

- [x] Update `action.yml` to replace OpenAI-specific inputs with Gemini equivalents:
  - [x] Change `openai_base_url` to `gemini_api_endpoint`
  - [x] Change `openai_light_model` to `gemini_light_model` (default: "gemini-2.0-flash-lite")
  - [x] Change `openai_heavy_model` to `gemini_heavy_model` (default: "gemini-2.5-pro-preview-03-25")
  - [x] Update environment variable requirement from `OPENAI_API_KEY` to `GEMINI_API_KEY`
  - [x] Update descriptions in action.yml

### 3. API Integration

- [x] Create new `src/gemini.ts` file to replace OpenAI functionality:
  - [x] Implement a `GeminiBot` class similar to the current `Bot` class
  - [x] Set up chat session and history handling
  - [x] Implement proper prompt handling for Gemini

### 4. Token Management

- [x] Update `src/tokenizer.ts` to work with Gemini models:
  - [x] Replace tiktoken with Gemini's native token counting
  - [x] Update token calculation methods
- [x] Update `src/limits.ts` with Gemini model token limits:
  - [x] Research and update token limits for Gemini 2.5 Pro
- [x] Implement direct token counting in `src/review.ts` and `src/review-comment.ts`:
  - [x] Add local token counting functions using Gemini's API
  - [x] Replace calls to the tokenizer with direct Gemini API calls

### 5. Bot Implementation

- [x] Modify `src/bot.ts` to use Gemini instead of ChatGPT:
  - [x] Replace imports and class definitions
  - [x] Change API initialization code
  - [x] Update chat functionality to use Gemini's API
  - [x] Modify prompt handling and response processing

### 6. Main Application Flow

- [x] Update `src/main.ts`:
  - [x] Change API key environment variable checks from OpenAI to Gemini
  - [x] Update bot initialization code
  - [x] Update options handling for Gemini-specific options

### 7. Options Management

- [x] Update `src/options.ts`:
  - [x] Rename OpenAI-specific options to Gemini equivalents
  - [x] Update default values
  - [x] Create a new GeminiOptions class to replace OpenAIOptions

### 8. Review and Comment Handling

- [x] Update `src/review.ts` and `src/review-comment.ts`:
  - [x] Update references from `openaiConcurrencyLimit` to `geminiConcurrencyLimit`
  - [x] Modify to handle Gemini's response format
  - [x] Update any OpenAI-specific functionality
  - [x] Ensure compatibility with GitHub PR review format

### 9. Documentation

- [x] Update README.md:
  - [x] Update installation instructions with Gemini API key setup
  - [x] Change environment variable requirements
  - [x] Update configuration options to reflect Gemini parameters
  - [x] Clarify any differences in behavior between models

### 9.x Random Fixes

- [x] Fix module system issues:
  - [x] Add `"type": "module"` and `"engines": { "node": ">=18" }` to package.json
  - [x] Update tsconfig.json: set `module` and `moduleResolution` to `Node16`, `noEmit` to `false`, remove `allowImportingTsExtensions`
  - [x] Add `.js` extension to all relative imports in `.ts` files
  - [x] Add `node:` prefix to all Node.js built-in module imports
  - [x] Replace `__dirname`/`__filename` usage with `import.meta.url` pattern
  - [x] Install `eslint-import-resolver-typescript`
  - [x] Configure ESLint (`.eslintrc.json`) to use both `typescript` and `node` resolvers
  - [x] Configure ESLint `import/extensions` rule to require `.js` extension for relative imports
  - [x] Fix compiling issues (addressed by the above steps)
- [x] Update GitHub Actions configuration:
  - [x] Set `runs.using` to `node20` in `action.yml`
  - [x] Update `actions/checkout` to `v4` in workflows (`openai-review.yml`, `combine-prs.yml`)
  - [x] Update `actions/github-script` to `v7` in `combine-prs.yml`
  - [x] Update `Actions-R-Us/actions-tagger` to `v2` in `versioning.yml`

### 10. Testing

- [ ] Test on sample PRs
- [ ] Verify all functionality works correctly with Gemini
- [ ] Ensure token limits are properly respected
- [ ] Compare output quality between OpenAI and Gemini models

## Implementation Strategy

1. First implement the core Gemini API integration
2. Update token management
3. Adapt bot functionality for Gemini
4. Update the main application flow
5. Test and refine

## Potential Challenges

- Differences in token counting between OpenAI and Gemini
- Variations in response format and quality
- Potential differences in model capabilities
- Handling chat history format differences
