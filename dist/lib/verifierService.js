"use strict";var _verifyFromPayload = require("./verifyFromPayload");

process.on('message', async payload => {
  const { id, params } = payload;
  try {
    const result = await (0, _verifyFromPayload.verifyParams)(params);
    process.send({ result, id });
  } catch (err) {
    const error = `${err}`;
    process.send({ id, error });
  }
});