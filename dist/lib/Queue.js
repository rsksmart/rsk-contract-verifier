"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.Queue = Queue;exports.default = void 0;
var _utils = require("./utils");

function Queue() {
  const queue = new Map();

  const getId = () => {
    return (0, _utils.randomHexString)();
  };
  const add = payload => {
    const id = getId();
    queue.set(id, payload);
    return id;
  };
  const remove = id => {
    queue.delete(id);
  };

  const next = () => {
    if (!queue.size) return;
    const [id, payload] = queue.entries().next().value;
    queue.delete(id);
    return [id, payload];
  };

  const get = id => {
    return queue.get(id);
  };

  const queued = () => {
    return queue.size;
  };
  return Object.freeze({ add, remove, queued, next, get });
}var _default =

Queue;exports.default = _default;