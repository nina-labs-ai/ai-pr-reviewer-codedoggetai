import {info} from '@actions/core'
import {minimatch} from 'minimatch'
import {TokenLimits} from './limits'

export class Options {
  debug: boolean
  disableReview: boolean
  disableReleaseNotes: boolean
  maxFiles: number
  reviewSimpleChanges: boolean
  reviewCommentLGTM: boolean
  pathFilters: PathFilter
  systemMessage: string
  geminiLightModel: string
  geminiHeavyModel: string
  geminiModelTemperature: number
  geminiRetries: number
  geminiTimeoutMS: number
  geminiConcurrencyLimit: number
  githubConcurrencyLimit: number
  lightTokenLimits: TokenLimits
  heavyTokenLimits: TokenLimits
  geminiApiEndpoint: string
  language: string

  constructor(
    debug: boolean,
    disableReview: boolean,
    disableReleaseNotes: boolean,
    maxFiles = '0',
    reviewSimpleChanges = false,
    reviewCommentLGTM = false,
    pathFilters: string[] | null = null,
    systemMessage = '',
    openaiModelTemperature = '0.0',
    openaiRetries = '3',
    openaiTimeoutMS = '120000',
    openaiConcurrencyLimit = '6',
    githubConcurrencyLimit = '6',
    geminiApiEndpoint = 'https://generativelanguage.googleapis.com/v1',
    language = 'en-US',
    geminiLightModel = 'gemini-2.0-flash-lite',
    geminiHeavyModel = 'gemini-2.5-pro-preview-03-25'
  ) {
    this.debug = debug
    this.disableReview = disableReview
    this.disableReleaseNotes = disableReleaseNotes
    this.maxFiles = parseInt(maxFiles)
    this.reviewSimpleChanges = reviewSimpleChanges
    this.reviewCommentLGTM = reviewCommentLGTM
    this.pathFilters = new PathFilter(pathFilters)
    this.systemMessage = systemMessage

    // Map OpenAI parameters to Gemini parameters
    this.geminiLightModel = geminiLightModel
    this.geminiHeavyModel = geminiHeavyModel
    this.geminiModelTemperature = parseFloat(openaiModelTemperature)
    this.geminiRetries = parseInt(openaiRetries)
    this.geminiTimeoutMS = parseInt(openaiTimeoutMS)
    this.geminiConcurrencyLimit = parseInt(openaiConcurrencyLimit)
    this.githubConcurrencyLimit = parseInt(githubConcurrencyLimit)

    // Initialize token limits for Gemini models
    this.lightTokenLimits = new TokenLimits(geminiLightModel)
    this.heavyTokenLimits = new TokenLimits(geminiHeavyModel)

    this.geminiApiEndpoint = geminiApiEndpoint
    this.language = language
  }

  // print all options using core.info
  print(): void {
    info(`debug: ${this.debug}`)
    info(`disable_review: ${this.disableReview}`)
    info(`disable_release_notes: ${this.disableReleaseNotes}`)
    info(`max_files: ${this.maxFiles}`)
    info(`review_simple_changes: ${this.reviewSimpleChanges}`)
    info(`review_comment_lgtm: ${this.reviewCommentLGTM}`)
    info(`path_filters: ${this.pathFilters}`)
    info(`system_message: ${this.systemMessage}`)
    info(`gemini_light_model: ${this.geminiLightModel}`)
    info(`gemini_heavy_model: ${this.geminiHeavyModel}`)
    info(`gemini_model_temperature: ${this.geminiModelTemperature}`)
    info(`gemini_retries: ${this.geminiRetries}`)
    info(`gemini_timeout_ms: ${this.geminiTimeoutMS}`)
    info(`gemini_concurrency_limit: ${this.geminiConcurrencyLimit}`)
    info(`github_concurrency_limit: ${this.githubConcurrencyLimit}`)
    info(`summary_token_limits: ${this.lightTokenLimits.string()}`)
    info(`review_token_limits: ${this.heavyTokenLimits.string()}`)
    info(`gemini_api_endpoint: ${this.geminiApiEndpoint}`)
    info(`language: ${this.language}`)
  }

  checkPath(path: string): boolean {
    const ok = this.pathFilters.check(path)
    info(`checking path: ${path} => ${ok}`)
    return ok
  }
}

export class PathFilter {
  private readonly rules: Array<[string /* rule */, boolean /* exclude */]>

  constructor(rules: string[] | null = null) {
    this.rules = []
    if (rules != null) {
      for (const rule of rules) {
        const trimmed = rule?.trim()
        if (trimmed) {
          if (trimmed.startsWith('!')) {
            this.rules.push([trimmed.substring(1).trim(), true])
          } else {
            this.rules.push([trimmed, false])
          }
        }
      }
    }
  }

  check(path: string): boolean {
    if (this.rules.length === 0) {
      return true
    }

    let included = false
    let excluded = false
    let inclusionRuleExists = false

    for (const [rule, exclude] of this.rules) {
      if (minimatch(path, rule)) {
        if (exclude) {
          excluded = true
        } else {
          included = true
        }
      }
      if (!exclude) {
        inclusionRuleExists = true
      }
    }

    return (!inclusionRuleExists || included) && !excluded
  }
}

export class OpenAIOptions {
  model: string
  tokenLimits: TokenLimits

  constructor(model = 'gpt-3.5-turbo', tokenLimits: TokenLimits | null = null) {
    this.model = model
    if (tokenLimits != null) {
      this.tokenLimits = tokenLimits
    } else {
      this.tokenLimits = new TokenLimits(model)
    }
  }
}

export class GeminiOptions {
  model: string
  tokenLimits: TokenLimits
  temperature: number
  maxOutputTokens: number
  topK: number
  topP: number

  constructor(
    model = 'gemini-2.0-flash-lite',
    tokenLimits: TokenLimits | null = null,
    temperature = 0.0,
    maxOutputTokens = 65536,
    topK = 64,
    topP = 0.95
  ) {
    this.model = model
    if (tokenLimits != null) {
      this.tokenLimits = tokenLimits
    } else {
      this.tokenLimits = new TokenLimits(model)
    }
    this.temperature = temperature
    this.maxOutputTokens = maxOutputTokens
    this.topK = topK
    this.topP = topP
  }
}
