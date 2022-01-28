import promBundle from 'express-prom-bundle';
import promClient from 'prom-client'
import express from 'express';
import os from 'os';
import pidusage from 'pidusage';

const cpuGauge = new promClient.Gauge({ name: 'nodejs_cpu', help: 'cpu usage' });
const memoryGauge = new promClient.Gauge({ name: 'nodejs_memory', help: 'memory usage' });
const load1Gauge = new promClient.Gauge({ name: 'nodejs_load1', help: 'average 1-minute load' });
const load5Gauge = new promClient.Gauge({ name: 'nodejs_load5', help: 'average 5-minute load' });
const load15Gauge = new promClient.Gauge({ name: 'nodejs_load15', help: 'average 15-minute load' });

setInterval(async () => {
  const stats = await pidusage(process.pid)
  memoryGauge.set(stats.memory / 1024 / 1024);
  cpuGauge.set(stats.cpu);

  const [load1, load5, load15] = os.loadavg();
  load1Gauge.set(load1);
  load5Gauge.set(load5);
  load15Gauge.set(load15);
}, 10000);

promClient.collectDefaultMetrics();

const app = express()

const metricsMiddleware = promBundle({ includeMethod: true });

app.use(metricsMiddleware as any);
app.listen(8080);
