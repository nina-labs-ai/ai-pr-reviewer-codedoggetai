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

- [ ] Update `src/options.ts`:
  - Rename OpenAI-specific options to Gemini equivalents
  - Update default values
  - Create a new GeminiOptions class to replace OpenAIOptions

### 8. Review and Comment Handling

- [ ] Update `src/review.ts` and `src/review-comment.ts`:
  - Modify to handle Gemini's response format
  - Update any OpenAI-specific functionality
  - Ensure compatibility with GitHub PR review format

### 9. Documentation

- [ ] Update README.md:
  - Update installation instructions with Gemini API key setup
  - Change environment variable requirements
  - Update configuration options to reflect Gemini parameters
  - Clarify any differences in behavior between models

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
