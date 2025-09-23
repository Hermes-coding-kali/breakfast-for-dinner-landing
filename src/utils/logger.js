// src/utils/logger.js
const enabled = String(process.env.REACT_APP_DEBUG || '').trim() === '1';

const make =
  (fn) =>
  (...args) => {
    if (!enabled) return;
    // eslint-disable-next-line no-console
    console[fn](...args);
  };

export const debug = make('log');
export const info = make('info');
export const warn = make('warn');
// Always allow errors so real problems still surface
export const error = (...args) => console.error(...args);
