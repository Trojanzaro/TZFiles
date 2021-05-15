var Service = require('node-windows').Service;

// Create a new service object
var svc = new Service({
  name:'TZFiles Auth Backend',
  description: 'The backend web server for TZFiles.',
  script: '.\\index.js',
});


// svc.on('install',function(){
//   svc.start();
// });

// svc.install();

svc.stop();
svc.uninstall();