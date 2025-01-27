const { model } = require('../config/aiConfig')
const { createSystemPrompt } = require('../utils/prompts')
const { TAG_SYMBOL } = require('../utils/constants')

class AIService {
  static async getResponse(message, context) {
    const systemPrompt = createSystemPrompt(context)
    const chat = model.startChat()
    const result = await chat.sendMessage(`${systemPrompt}\nUser: ${message}`)
    return result.response.text()
  }

  static extractTags(message) {
    return message.match(new RegExp(`${TAG_SYMBOL}[^${TAG_SYMBOL}]+${TAG_SYMBOL}`, "g")) || []
  }

  static cleanMessage(message) {
    return message.replace(new RegExp(`${TAG_SYMBOL}[^${TAG_SYMBOL}]+${TAG_SYMBOL}`, "g"), "").trim()
  }
}

module.exports = AIService
