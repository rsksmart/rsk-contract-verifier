"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.Api = Api;exports.default = void 0;
var _ContractVerifier = require("./ContractVerifier");
var _getSolc = _interopRequireDefault(require("./getSolc"));function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}

function Api(config, { log }) {
  log = log || console;
  const { timeout } = config;
  const verifier = (0, _ContractVerifier.ContractVerifier)({ log, timeout });
  const getSolc = (0, _getSolc.default)(config);
  const requests = new Map();

  const resolveId = ({ id, error, data, request }) => {
    const socket = requests.get(id);
    requests.delete(id);
    apiResponse(socket, 'verify', { error, data, request });
  };

  verifier.events.on(_ContractVerifier.EVENTS.VERIFICATION, result => {
    resolveId(result);
  });

  verifier.events.on(_ContractVerifier.EVENTS.ERROR, result => {
    resolveId(result);
  });

  const run = async (payload, socket) => {
    const { action, params } = payload;
    switch (action) {
      case 'verify':
        const id = await verifier.verify(params);
        if (!id) return apiResponse(socket, action, { error: 'Unknown error' });
        requests.set(id, socket);
        break;

      case 'versions':
        const data = await getSolc.getList();
        apiResponse(socket, action, { data });
        break;}

  };
  return Object.freeze({ run });
}

function apiResponse(socket, action, { error, data, request }) {
  socket.emit('data', { action, error, data, request });
}var _default =

Api;exports.default = _default;