import { Hono } from 'hono';
import { router } from './api';
import { prettyJSON } from 'hono/pretty-json';
import { Bindings } from './types';
import { doSomeTaskOnASchedule } from './model';

const app = new Hono();
app.use('/', prettyJSON());
app.route('/', router);
const scheduled: ExportedHandlerScheduledHandler<Bindings> = async (event, env, ctx) => {
  ctx.waitUntil(doSomeTaskOnASchedule(env));
};
export default {
  fetch: app.fetch,
  scheduled,
};
