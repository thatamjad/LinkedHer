export const log = (...args) => {
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.log(...args);
  }
};

export const warn = (...args) => {
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.warn(...args);
  }
};

export const error = (...args) => {
  // Always output errors
  // eslint-disable-next-line no-console
  console.error(...args);
}; 