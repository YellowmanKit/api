import CreateApp from './createapp';

var app = new CreateApp('bigboard',8004);
new CreateApp('memories',8006);
new CreateApp('bedside',8007);
new CreateApp('changepw/build',8008);

export default app;
