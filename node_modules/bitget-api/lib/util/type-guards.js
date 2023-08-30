"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isWsFuturesPositionsSnapshotEvent = exports.isWsFuturesAccountSnapshotEvent = exports.isWsPositionsSnapshotEvent = exports.isWsAccountSnapshotEvent = void 0;
/** TypeGuard: event has a string "action" property */
function isWsEvent(event) {
    return (typeof event === 'object' &&
        event &&
        typeof event['action'] === 'string' &&
        event['data']);
}
/** TypeGuard: event has "action === snapshot" */
function isWsSnapshotEvent(event) {
    return isWsEvent(event) && event.action === 'snapshot';
}
/** TypeGuard: event has a string channel name */
function isWsChannelEvent(event) {
    if (typeof event['arg'] === 'object' &&
        event.arg &&
        typeof (event === null || event === void 0 ? void 0 : event.arg['channel']) === 'string') {
        return true;
    }
    return false;
}
/** TypeGuard: event is an account update (balance) */
function isWsAccountSnapshotEvent(event) {
    return (isWsSnapshotEvent(event) &&
        isWsChannelEvent(event) &&
        event.arg.channel === 'account' &&
        Array.isArray(event.data));
}
exports.isWsAccountSnapshotEvent = isWsAccountSnapshotEvent;
/** TypeGuard: event is a positions update */
function isWsPositionsSnapshotEvent(event) {
    return (isWsSnapshotEvent(event) &&
        isWsChannelEvent(event) &&
        event.arg.channel === 'positions' &&
        Array.isArray(event.data));
}
exports.isWsPositionsSnapshotEvent = isWsPositionsSnapshotEvent;
/** TypeGuard: event is a UMCBL account update (balance) */
function isWsFuturesAccountSnapshotEvent(event) {
    return isWsAccountSnapshotEvent(event) && event.arg.instType === 'umcbl';
}
exports.isWsFuturesAccountSnapshotEvent = isWsFuturesAccountSnapshotEvent;
/** TypeGuard: event is a UMCBL positions update */
function isWsFuturesPositionsSnapshotEvent(event) {
    return isWsPositionsSnapshotEvent(event) && event.arg.instType === 'umcbl';
}
exports.isWsFuturesPositionsSnapshotEvent = isWsFuturesPositionsSnapshotEvent;
//# sourceMappingURL=type-guards.js.map