const MESSAGE_ROLES = {
  USER: "user",
  ASSISTANT: "assistant",
  SYSTEM: "system",
  REPRESENTATIVE: "representative",
}

const EVENT_TYPES = {
  RESPONSE: "ai-response",
  REALTIME: "realtime",
  APPOINTMENT: "appointment",
  ERROR: "error",
  HANDOVER: "handover",
  AI_RESUME: "ai-resume",
  REPRESENTATIVE_MESSAGE: "representative-message",
  JOIN_AS_REPRESENTATIVE: "joinAsRepresentative",
  LEAVE_AS_REPRESENTATIVE: "leaveAsRepresentative"
}

const TAG_SYMBOL = "⚡"

const BUSINESS_INFO = {
  name: "TechGadget Store",
  description: "Premium electronics retailer specializing in cutting-edge devices",
  websiteUrl: "https://www.techgadgetstore.com",
  productCategories: ["smartphones", "laptops", "smart-home"],
  customQuestions: [
    "What type of device are you looking for?",
    "Do you prefer any specific brands?",
    "What's your budget range?",
    "Any must-have features?",
  ],
  appointmentUrl: "/appointmentAttachment",
}

module.exports = {
  MESSAGE_ROLES,
  EVENT_TYPES,
  TAG_SYMBOL,
  BUSINESS_INFO,
}
