export function formatLog(raw) {
  return {
    id:       raw.id,
    userId:   raw['user-id']   ?? raw.user_id   ?? raw.userId,
    userName: raw['user-name'] ?? raw.user_name ?? raw.userName,
    channel:  raw.channel,
    category: raw.category,
    body:     raw.body,
    success:  raw.success,
    sentAt:   raw['sent-at']   ?? raw.sent_at   ?? raw.sentAt,
  }
}