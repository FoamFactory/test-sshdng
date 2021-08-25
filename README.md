# test-sshdng
A  library that allows you to start a local sshd daemon that you can test against. It is based off of Patrick Debois' original [test-sshd](https://github.com/jedi4ever/test-sshd.js) library.

> Because there is nothing like the real thing

Way too many codebases that uses ssh/sftp aren't being tested because mocking and stubbing `sshd` servers is hard.

# How
It starts an ssh server on the `localhost` such that:

- you can login as the current user (`process.env.USER`)
- using the test key provided (included in the package at `config/keys/id_rsa`)
- on a port you specify
- with one of three modes:
  - (mode: `echo`) if login succeeds it uses `ForceCommand` to echo the command in `$SSH_ORIGINAL_COMMAND`
  - (mode: `exec`) if login succeeds it executes the command
  - (mode: `transfer`) if login succeeds it allows for `sftp` transfers
- it does NOT do password authentication

# Usage
```
var TestSshd = require('test-sshd');
var sshd = TestSshd({port: 4000};

var connectParams = sshd.connectParams();

sshd.on('ready', function() {
  // When login is working
  console.log('ready to login');
});

sshd.on('error', function(error) {
  // When sshd has an error
});

sshd.on('stdout', function(data) {
  // receive sshd stdout
});

sshd.on('stderr', function(data) {
  // receive sshd stderr
});

sshd.on('exit', function() {
  // when daemon exit
});

sshd.start();

// Make sure to stop the sshd stop when the process exits
// This prevents orphaned processes
process.on('exit', function() {
  if(sshd.status === 'started') {
    sshd.stop();
  }
});
```

# Code information
## Getters
- `status`: either 'started' or 'stopped'
- `settings`: contains params used to initialize the sshd

## Options
- `port`: **integer** defdults to 4000
- `mode`: **string** default to `echo` (other options are `exec`, `transfer`)

## Events
- `ready`: when the sshd is succesfully listening
- `exit`: when the sshd exits
- `error`: when an error occurs

## ConnectParams()
This is a hash with;

- `host` : **string** host to connect to
- `username`: **string** username to connect with
- `port`: **integer** port it listens on
- `privateKey`: **string** key that can be used to connect

# License
MIT
