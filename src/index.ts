import { Hono } from 'hono';
import { router } from './api';
import { prettyJSON } from 'hono/pretty-json';

const app = new Hono();
app.use('/', prettyJSON());
app.route('/', router);

export default {
  fetch: app.fetch,
};
