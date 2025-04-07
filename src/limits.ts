export class TokenLimits {
  maxTokens: number
  requestTokens: number
  responseTokens: number
  knowledgeCutOff: string

  constructor(model = 'gemini-2.0-flash-lite') {
    this.knowledgeCutOff = '2024-03-25'
    if (model === 'gemini-2.5-pro-preview-03-25') {
      this.maxTokens = 1048576 // 1M tokens input limit
      this.responseTokens = 65536 // 64K tokens output limit
    } else if (model === 'gemini-2.0-flash') {
      this.maxTokens = 1048576 // 1M tokens input limit
      this.responseTokens = 65536 // 64K tokens output limit
    } else if (model === 'gemini-2.0-flash-lite') {
      this.maxTokens = 1048576 // 1M tokens input limit
      this.responseTokens = 65536 // 64K tokens output limit
    } else {
      // Default to conservative limits
      this.maxTokens = 32768 // 32K tokens
      this.responseTokens = 4096 // 4K tokens
    }
    // provide some margin for the request tokens
    this.requestTokens = this.maxTokens - this.responseTokens - 100
  }

  string(): string {
    return `max_tokens=${this.maxTokens}, request_tokens=${this.requestTokens}, response_tokens=${this.responseTokens}`
  }
}
