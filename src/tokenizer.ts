import {GoogleGenerativeAI} from '@google/generative-ai'
import {warning} from '@actions/core'

// For backward compatibility
export function encode(): Uint32Array {
  // This is a placeholder since we don't need the actual encoding anymore
  return new Uint32Array()
}

// Initialize Gemini for token counting
let genAI: GoogleGenerativeAI | null = null
let tokenCountModel: any = null

export function initializeTokenCounter(apiKey: string, modelName: string) {
  if (!genAI) {
    genAI = new GoogleGenerativeAI(apiKey)
    tokenCountModel = genAI.getGenerativeModel({model: modelName})
  }
}

export function getTokenCount(
  text: string,
  modelName: string = 'gemini-2.0-flash-lite'
): number {
  if (!process.env.GEMINI_API_KEY) {
    warning('GEMINI_API_KEY not set, using default token count')
    return Math.ceil(text.length / 4) // Rough estimate: 1 token ≈ 4 characters
  }

  // Initialize with the appropriate model if not already initialized
  if (!tokenCountModel) {
    initializeTokenCounter(process.env.GEMINI_API_KEY, modelName)
  }

  try {
    return tokenCountModel.countTokens(text).totalTokens
  } catch (err) {
    warning(`Error counting tokens: ${err}, using default token count`)
    return Math.ceil(text.length / 4) // Rough estimate: 1 token ≈ 4 characters
  }
}
