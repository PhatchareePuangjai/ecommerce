// Simple in-memory observability metrics scaffold for umbrella targets
// Targets:
// - Status reflection latency: event → system reflection ≤ 60s
// - Notification provider handoff latency: trigger → provider handoff ≤ 300s

const statusEvents = new Map(); // id -> { eventTime, reflectedTime }
const notificationEvents = new Map(); // id -> { startTime, handoffTime }
const counters = new Map(); // name -> number

const AUTH_LOGIN_SUCCESS = 'auth.login.success';
const AUTH_LOGIN_FAILURE = 'auth.login.failure';
const AUTH_LOCKOUT = 'auth.lockout.triggered';
const AUTH_RESET_REQUESTED = 'auth.reset.requested';
const AUTH_RESET_COMPLETED = 'auth.reset.completed';
const AUTH_RESET_FAILED = 'auth.reset.failed';

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
  counters.clear();
}

// Generic counters (for feature-specific metrics)
function incCounter(name, amount = 1) {
  const curr = counters.get(name) || 0;
  counters.set(name, curr + amount);
}

function getCounter(name) {
  return counters.get(name) || 0;
}

// Auth-specific helpers
function recordAuthLoginSuccess() {
  incCounter(AUTH_LOGIN_SUCCESS);
}

function recordAuthLoginFailure() {
  incCounter(AUTH_LOGIN_FAILURE);
}

function recordAuthLockout() {
  incCounter(AUTH_LOCKOUT);
}

function recordAuthResetRequested() {
  incCounter(AUTH_RESET_REQUESTED);
}

function recordAuthResetCompleted() {
  incCounter(AUTH_RESET_COMPLETED);
}

function recordAuthResetFailed() {
  incCounter(AUTH_RESET_FAILED);
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
  // counters
  incCounter,
  getCounter,
  // utils
  resetAll,
  // auth helpers
  recordAuthLoginSuccess,
  recordAuthLoginFailure,
  recordAuthLockout,
  recordAuthResetRequested,
  recordAuthResetCompleted,
  recordAuthResetFailed,
};
