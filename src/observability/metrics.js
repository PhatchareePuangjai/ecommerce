// Simple in-memory observability metrics scaffold for umbrella targets
// Targets:
// - Status reflection latency: event → system reflection ≤ 60s
// - Notification provider handoff latency: trigger → provider handoff ≤ 300s

const statusEvents = new Map(); // id -> { eventTime, reflectedTime }
const notificationEvents = new Map(); // id -> { startTime, handoffTime }

function now() {
  return Date.now();
}

// Status reflection metrics
function startStatusEvent(id, eventTimeMs = now()) {
  statusEvents.set(id, { eventTime: eventTimeMs, reflectedTime: undefined });
}

function markStatusReflected(id, reflectedTimeMs = now()) {
  const rec = statusEvents.get(id);
  if (!rec) throw new Error('Unknown status event id');
  rec.reflectedTime = reflectedTimeMs;
  statusEvents.set(id, rec);
}

function getStatusReflectionLatencyMs(id) {
  const rec = statusEvents.get(id);
  if (!rec || rec.reflectedTime == null) return undefined;
  return Math.max(0, rec.reflectedTime - rec.eventTime);
}

// Notification handoff metrics
function startNotificationHandoff(id, startTimeMs = now()) {
  notificationEvents.set(id, { startTime: startTimeMs, handoffTime: undefined });
}

function markNotificationHandedOff(id, handoffTimeMs = now()) {
  const rec = notificationEvents.get(id);
  if (!rec) throw new Error('Unknown notification id');
  rec.handoffTime = handoffTimeMs;
  notificationEvents.set(id, rec);
}

function getNotificationHandoffLatencyMs(id) {
  const rec = notificationEvents.get(id);
  if (!rec || rec.handoffTime == null) return undefined;
  return Math.max(0, rec.handoffTime - rec.startTime);
}

// Utilities (for tests)
function resetAll() {
  statusEvents.clear();
  notificationEvents.clear();
}

module.exports = {
  // status
  startStatusEvent,
  markStatusReflected,
  getStatusReflectionLatencyMs,
  // notification
  startNotificationHandoff,
  markNotificationHandedOff,
  getNotificationHandoffLatencyMs,
  // utils
  resetAll,
};

