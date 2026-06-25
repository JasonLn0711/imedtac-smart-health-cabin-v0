import { SHC_EVENT_TOPICS } from "@shc/contracts";

export function topicForEventType(eventType: string): string {
  if (eventType === "questionnaire_response.completed.v1") {
    return "shc.questionnaire.responses.v1";
  }

  const topic = SHC_EVENT_TOPICS[eventType as keyof typeof SHC_EVENT_TOPICS];
  if (!topic) {
    throw new Error(`Unknown outbox event_type: ${eventType}`);
  }
  return topic;
}
