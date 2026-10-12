/**
 * Preload for running the project from an exFAT drive (Windows).
 *
 * exFAT has no symlinks, and on it Node's fs.readlink() fails with EISDIR instead of EINVAL
 * ("not a symlink") – webpack, Next.js and other tools only expect EINVAL and abort the build.
 * This patch maps the error back to EINVAL. It is a no-op on every other file system, because
 * there readlink() never reports EISDIR.
 */
const fs = require("node:fs");

function normalize(error) {
  if (error && error.code === "EISDIR" && error.syscall === "readlink") {
    error.code = "EINVAL";
    error.errno = -4071;
  }
  return error;
}

const { readlink, readlinkSync } = fs;
const readlinkPromise = fs.promises.readlink;

fs.readlinkSync = function patchedReadlinkSync(...args) {
  try {
    return readlinkSync.apply(this, args);
  } catch (error) {
    throw normalize(error);
  }
};

fs.readlink = function patchedReadlink(path, options, callback) {
  const cb = typeof options === "function" ? options : callback;
  const opts = typeof options === "function" ? undefined : options;
  return readlink.call(this, path, opts, (error, result) => cb(normalize(error), result));
};

fs.promises.readlink = async function patchedReadlinkPromise(...args) {
  try {
    return await readlinkPromise.apply(this, args);
  } catch (error) {
    throw normalize(error);
  }
};
