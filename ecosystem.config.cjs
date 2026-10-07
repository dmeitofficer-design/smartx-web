// PM2 process file — usage on the server:
//   pm2 start ecosystem.config.cjs
//   pm2 reload smartx-web
module.exports = {
  apps: [
    {
      name: 'smartx-web',
      cwd: __dirname,
      script: 'node_modules/next/dist/bin/next',
      // dme-cms already uses 3000 on this VPS, so SmartX runs on 3001.
      // Bound to localhost only — the web server (nginx) is the public entry point.
      args: 'start -p 3001 -H 127.0.0.1',
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
