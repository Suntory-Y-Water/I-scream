import { Hono } from 'hono';
import { router } from './iscream/api';
import { prettyJSON } from 'hono/pretty-json';
import { scheduled } from './iscream/model';

const app = new Hono();
app.use('/', prettyJSON());
app.route('/', router);

export default {
  fetch: app.fetch,
  scheduled: scheduled,
};
