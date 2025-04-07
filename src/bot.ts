import './fetch-polyfill'

import {info, setFailed, warning} from '@actions/core'
import {
  GoogleGenerativeAI,
  GenerativeModel,
  HarmCategory,
  HarmBlockThreshold
} from '@google/generative-ai'
import pRetry from 'p-retry'
import {Options} from './options'

// Define type to save chat session information
export interface Ids {
  chatSession?: any
  messageHistory?: Array<{
    role: string
    parts: Array<{text: string}>
  }>
}

export class Bot {
  private readonly model: GenerativeModel | null = null
  private readonly client: GoogleGenerativeAI | null = null
  private readonly options: Options
  private readonly systemMessage: string

  constructor(options: Options, modelName: string) {
    this.options = options
    if (process.env.GEMINI_API_KEY) {
      const currentDate = new Date().toISOString().split('T')[0]
      this.systemMessage = `${options.systemMessage} 
Current date: ${currentDate}

IMPORTANT: Entire response must be in the language with ISO code: ${options.language}
`
      // Initialize the Gemini client
      this.client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

      // Create the model instance
      this.model = this.client.getGenerativeModel({
        model: modelName,
        generationConfig: {
          temperature: options.geminiModelTemperature,
          topK: 64,
          topP: 0.95,
          maxOutputTokens: 65536 // This should be replaced by proper token limits
        },
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_NONE
          },
          {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_NONE
          },
          {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_NONE
          },
          {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_NONE
          }
        ]
      })
    } else {
      const err =
        "Unable to initialize the Gemini API, 'GEMINI_API_KEY' environment variable is not available"
      throw new Error(err)
    }
  }

  chat = async (message: string, ids: Ids): Promise<[string, Ids]> => {
    let res: [string, Ids] = ['', {}]
    try {
      res = await this.chat_(message, ids)
      return res
    } catch (e: unknown) {
      warning(
        `Failed to chat with Gemini: ${e}, backtrace: ${(e as Error).stack}`
      )
      return res
    }
  }

  private readonly chat_ = async (
    message: string,
    ids: Ids
  ): Promise<[string, Ids]> => {
    // record timing
    const start = Date.now()
    if (!message) {
      return ['', {}]
    }

    let response: any = null
    let chatSession = ids.chatSession
    let messageHistory = ids.messageHistory || []

    if (this.model != null) {
      try {
        // If we have an existing chat session, use it
        if (chatSession) {
          response = await pRetry(() => chatSession.sendMessage(message), {
            retries: this.options.geminiRetries
          })
        } else {
          // Create a new chat session with history if available
          if (messageHistory.length > 0) {
            chatSession = this.model.startChat({
              history: messageHistory
            })
          } else {
            // Initialize with system message
            chatSession = this.model.startChat({
              history: [
                {
                  role: 'user',
                  parts: [{text: this.systemMessage}]
                },
                {
                  role: 'model',
                  parts: [
                    {
                      text: 'I understand and will follow these guidelines for the code review.'
                    }
                  ]
                }
              ]
            })
            messageHistory = [
              {
                role: 'user',
                parts: [{text: this.systemMessage}]
              },
              {
                role: 'model',
                parts: [
                  {
                    text: 'I understand and will follow these guidelines for the code review.'
                  }
                ]
              }
            ]
          }

          // Send the user's message
          response = await pRetry(() => chatSession.sendMessage(message), {
            retries: this.options.geminiRetries,
            onFailedAttempt: error => {
              warning(
                `Attempt ${error.attemptNumber} failed. There are ${error.retriesLeft} retries left.`
              )
              return Promise.resolve()
            }
          })
        }
      } catch (e: unknown) {
        info(
          `response: ${response}, failed to send message to Gemini: ${e}, backtrace: ${
            (e as Error).stack
          }`
        )
      }
      const end = Date.now()
      info(`response: ${JSON.stringify(response)}`)
      info(
        `Gemini sendMessage (including retries) response time: ${
          end - start
        } ms`
      )
    } else {
      setFailed('The Gemini API is not initialized')
    }

    let responseText = ''
    if (response != null) {
      responseText = response.text()

      // Update message history with new exchange
      messageHistory.push({
        role: 'user',
        parts: [{text: message}]
      })

      messageHistory.push({
        role: 'model',
        parts: [{text: responseText}]
      })
    } else {
      warning('Gemini response is null')
    }

    // Update ids with new chat session and history
    const newIds: Ids = {
      chatSession,
      messageHistory
    }

    if (this.options.debug) {
      info(`Gemini response: ${responseText}`)
    }

    return [responseText, newIds]
  }
}
