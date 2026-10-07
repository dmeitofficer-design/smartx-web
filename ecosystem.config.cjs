// PM2 process file — usage on the server:
//   pm2 start ecosystem.config.cjs
//   pm2 reload smartx-web
module.exports = {
  apps: [
    {
      name: 'smartx-web',
      cwd: __dirname,
      script: 'node_modules/next/dist/bin/next',
      // Ports on the WHM server: 3001 = dmebd-nextjs, 3002 = dme-business-card → SmartX uses 3003.
      // Bound to localhost only — Apache (userdata proxy include) is the public entry point.
      args: 'start -p 3003 -H 127.0.0.1',
      env: {
        NODE_ENV: 'production',
      },
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '700M',
      autorestart: true,
      time: true,
    },
  ],
};
