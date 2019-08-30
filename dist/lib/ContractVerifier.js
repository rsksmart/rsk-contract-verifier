"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.ContractVerifier = ContractVerifier;exports.default = exports.EVENTS = void 0;var _events = require("events");
var _Services = require("./Services");
var _Queue = _interopRequireDefault(require("./Queue"));function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}

const EVENTS = {
  VERIFICATION: 'verification',
  ERROR: 'error' };exports.EVENTS = EVENTS;


const newVerifierService = options => (0, _Services.suicidalForkedService)('verifierService.js', options);

function ContractVerifier({ timeout, log }) {
  timeout = timeout || 60000;
  log = log || console;
  const queue = (0, _Queue.default)();
  const verifying = new Map();
  const events = new _events.EventEmitter();

  const verify = payload => {
    const id = queue.add(payload);
    processNext();
    return id;
  };
  const resolve = (id, error, data) => {
    const request = verifying.get(id);
    verifying.delete(id);
    log.debug(`Verification done ${id}`);
    log.trace(JSON.stringify(data));
    events.emit(EVENTS.VERIFICATION, { id, data, error, request });
    processNext();
  };

  const processNext = () => {
    if (verifying.size > 0) return;
    const task = queue.next();
    if (!task) return;
    const [id, payload] = task;
    performVerification(id, payload);
  };

  const performVerification = async (id, params) => {
    try {
      verifying.set(id, params);
      const payload = { id, params };
      const verification = await newVerifierService({ payload, timeout });
      if (!verification) throw new Error('Verifier returns an empty result');
      resolve(id, null, verification);
    } catch (err) {
      log.debug(err);
      const error = `${err}`;
      resolve(id, error);
    }
  };
  return Object.freeze({ verify, events });
}var _default =

ContractVerifier;exports.default = _default;