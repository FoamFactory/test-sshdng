import { spawn } from 'child_process'
import events from 'events';
import fs from 'fs';
import path from 'path';
import { quote } from 'shell-quote';
import util from 'util';
import kill from 'tree-kill';

export class TestSSHD {
  constructor(options) {
    events.EventEmitter.call(this);

    let privateKey = fs.readFileSync(path.join(__dirname,'..','config','keys','id_rsa'))+'';

    let defaults = {
      port: 4000 ,
      mode: 'echo',
      host: '127.0.0.1',
      username: process.env.USER,
      privateKey:  privateKey,
      debug: false
    };

    this.settings = {
      ...defaults,
      ...options
    };

    let modes = [ 'expect', 'echo', 'exec', 'transfer' ] ;
    if (modes.indexOf(this.settings.mode) < 0) {
      throw new Error(`Unknown mode: "${this.settings.mode}". Please choose one of ${JSON.stringify(modes)}`);
    }

    this._process = null;
    this.status = 'stopped';
  }

  start() {
    const keysDir = path.join(__dirname, '..', 'config', 'keys');
    const keys = [ 'id_rsa', 'id_rsa.pub' , 'ssh_host_rsa_key', 'ssh_host_rsa_key.pub' ];

    // Let's make sure we have the right permissions
    keys.forEach(function(key) {
      fs.chmodSync(path.join(keysDir, key), '0600');
    });

    const hostKeyFile = path.join(keysDir,'ssh_host_rsa_key');
    const authorizedKeysFile = path.join(__dirname, '..', 'config', 'authorized_keys2');
    const configFile = path.join(__dirname, '..', 'config', 'sshd_config');

    const sshdArgs = [
      '-D',     // Don't fork as a deamon
    //  '-4',     // Only listen for ipv4
      '-f',
      configFile,
      '-e',     // Echo errors to stdout
      '-p',     // Port Option
      this.settings.port,// The port to use
      '-h',     // Hostkey Option
      quote([hostKeyFile]),
      '-o',
      'AuthorizedKeysFile=' + quote([authorizedKeysFile]),
      '-o',
      'AllowUsers=' + quote([this.settings.username]),
      '-o',
      'PidFile=/dev/null',
      '-o',
      'ListenAddress=127.0.0.1'
    ];

    // In echo mode we return the command executed
    if (this.settings.mode === 'echo' ) {
      sshdArgs.push('-o');
      sshdArgs.push('ForceCommand=echo $SSH_ORIGINAL_COMMAND');
    }

    // In transfer mode we enable sftp only
    if (this.settings.mode === 'transfer' ) {
      sshdArgs.push('-o');
      sshdArgs.push('Subsystem=sftp internal-sftp');
      sshdArgs.push('-o');
      sshdArgs.push('ForceCommand=internal-sftp');
    }

    if (this.settings.debug) {
      console.log(sshdArgs.join(' '));
    }

    this._process = spawn('/usr/sbin/sshd', sshdArgs);

    this._process.stdout.on('data', (data) => {
      this.emit('stdout', data);
    });

    let stderr = '';
    this._process.stderr.on('data', (data) => {
      let output = data + '';
      stderr = stderr +  output;
      this.emit('stderr', data);
      if (output.indexOf('Server listening') >= 0) {
        this.status = 'started';
        this.emit('ready');
      }
    });


    this._process.on('close', (code) => {
      // catch startup errors
      if (this.status !== 'started') {
        if (code !== 0) { // Maybe this was very fast and it was a clean kill
          this.emit('error', new Error('Exit code['+code + '] - ' +  stderr));
        }
      }

      this.status = 'stopped';
      this.emit('exit', code);
    });
  }

  stop() {
    return new Promise((resolve, reject) => {
      kill(this._process.pid, 'SIGTERM', (err) => {
        this.status = 'stopped';
        this._process = null;
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  connectParams() {
    // Return an immutable version of the connection parameters.
    const connectParams = {
      username: this.settings.username,
      host: this.settings.host,
      privateKey: this.settings.privateKey,
      port: this.settings.port
    };

    return JSON.parse(JSON.stringify(connectParams));
  }
}

util.inherits(TestSSHD, events.EventEmitter);
