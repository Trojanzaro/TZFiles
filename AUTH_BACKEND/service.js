var Service = require('node-windows').Service;

// Create a new service object
var svc = new Service({
  name:'TZFiles Auth Backend',
  description: 'The backend web server for TZFiles.',
  script: '.\\index.js',

  //, workingDirectory: '...'
});

// Listen for the "install" event, which indicates the
// process is available as a service.
svc.on('install',function(){
  svc.start();
});

// svc.install();

svc.stop();
svc.uninstall();