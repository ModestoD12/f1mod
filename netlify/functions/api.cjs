const serverless = require('serverless-http');
const { getApp } = require('../../server/index.cjs');

let handler;

function apiPath(path) {
  const marker = '/.netlify/functions/api';
  if (!path || !path.includes(marker)) return path;
  const rest = path.slice(path.indexOf(marker) + marker.length) || '/';
  return `/api${rest.startsWith('/') ? rest : `/${rest}`}`;
}

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  event.path = apiPath(event.path);
  if (!handler) {
    handler = serverless(await getApp());
  }
  return handler(event, context);
};
