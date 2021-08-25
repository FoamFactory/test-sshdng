import { TestSSHD } from '../src/test-sshd.js';
import Connection from 'ssh2';
import process from 'process';

// let ssh_server = null;

describe ('TestSSHD', () => {
  it ('should be able to instantiate the object', () => {
    let ssh_server = new TestSSHD({
      port: 4001
    });

    expect(ssh_server.settings).toBeDefined();
    expect(ssh_server.settings.port).toBe(4001);
    expect(ssh_server.settings.privateKey).toBeDefined();
    expect(ssh_server.settings.host).toBe('127.0.0.1');
    expect(ssh_server.status).toBe('stopped');
    expect(ssh_server.connectParams()).toMatchObject({
      username: process.env['USER'],
      host: '127.0.0.1',
      privateKey: '-----BEGIN RSA PRIVATE KEY-----\n' +
        'MIIEowIBAAKCAQEAxQ+VlxRo4lzcfb9c4LSraqZ6bT5SCZqTXlfQ76HZ7amhwK2l\n' +
        '6voka9gMKlsSqdWfcn6mflBeqvFl/2vFSuM1Qfd66oeBBJFbf7lPq8CX5DzHQyTE\n' +
        '5M8FPxrpZesBrKh4vzyuPEiyKOXLqgolngeobwSvscAh1IChav4qPIm1JW0Qcu7E\n' +
        'YyAqaldDdofMR5K55PNaZaB4jh5krMWZX/s26wdI9fUvqv07A+bPLAvhPLW3vBeC\n' +
        '0K8oakQjzpvkKiLRz7wNEzX8k+bwqc3t4QJrw1xk2+4dgdFnBBMGrFPvQJwBdl3p\n' +
        'zqhfOm1RRUOz18/5Ze7bqxaqI0A4hBdk3GIBnwIDAQABAoIBADFC7xNAb+O+cQQi\n' +
        'VVZ686sKiOpMPPfXo2VfMITnAfKOiDgBcMun0nj/HjNsZuL72wslK/vBnZjAFc5f\n' +
        'I4fP+p1N/3UngJIiwCvSqF74G0BcDTf0th+4vMgEszneIKIHz3+G7Mt3JMpif6I3\n' +
        'PSYfJfTyx/T4Ybyclz2G4goWJql/BNRqOwF860XnNW74R09bHkPPQhdZb1RLBllx\n' +
        'RiEz5E1Pj873iqQbKFvsSsOHhyO8P2EXiL5MyHItm12iXbseoOrBkLfzaD9PvxoF\n' +
        'mrSlJzf3oEadF3Vl/dE3Uz5JCKabVr/kC9rIo31dJiL6OZP/eJiRFoIM9OEXsoum\n' +
        'nI1X/nECgYEA6FhSIM14AS5AwS+iaZfAczOMASmKTDYXVIPCCjSscNUk4v42xTgf\n' +
        '/XN5HbPZQx8wwClffn/DySLjenEe5Xxa3kOUbjXsUg3vFj2htzWDopQGVd5YF/Ay\n' +
        'X+0iz3KTcY699Lwb5QUncLRhXKOa4f9GpZXSN+0rWxM/EDjKlRsa9TcCgYEA2R+k\n' +
        'egYiOBkICLRIPxy6Q9Wl0puNj36qQCPk/Gcbn0R3q9K4b+xb8a7rkLBmVD9P8klH\n' +
        'NzZg2iFz231OkH4dxL3id+KdPwlp7o1p6LlHkN35aJIG3wsPH/p/M59A9/U3JLG2\n' +
        's6DqUxObnN/IWB2+NkN/tP2icjRbaybznYysCtkCgYEAnSdgJZ/Uk7fdRM4bZKCo\n' +
        'I0OyZvbZ/EJ59UhJbu3B1W/Vy1N3aF5WBPCd82E6ixQFvXQ+iymQG/PlOWRaKY67\n' +
        'R6seMo12kump1blKMMmZh9Xnkx0ZKNfmusuCyB4PbLfH9Eln9LhPvQPE9wwSLtqj\n' +
        'xkxYLEvXD3stJKPFIqV6znECgYBOAtN60FddJok/b18B5hV6p/nDeQZcx1ruXrc4\n' +
        'hOdkyxngT37bH+ZNKNcUjnzFylW0LOX8jXoxBZH2C8i9m8KgXMVQ48gxzPUVtBOY\n' +
        'fXGcOFUTYFw9qWCO0dcAOjkCnkVo1r1ZPvjSTpo7vB/koRMltgzdf7/tHqi2EDG5\n' +
        'qsBpyQKBgDmd6mN3s8hg17b2QJo2ojjxudTTEZkdGBZzgNg7JFLOBX4PVTykqNNj\n' +
        '5FdKJgIr7z5PU1ZCSUGAtGhWn8NqqhBsnB1MyI1LMAwgO7AssANdUC3N2+3BN5h7\n' +
        'iHnoIfQfy/3G68r75XyrX+E9G9KcmNDz0MdYxMP4Zw85pPYGipMW\n' +
        '-----END RSA PRIVATE KEY-----\n',
      port: 4001
    });
  });

  describe ('when attempting to instantiate a server running in a unknown mode', () => {
    it ('should throw an error', () => {
      expect(() => {
        new TestSSHD({
          mode: 'something-strange',
          port: 4003
        })
      }).toThrow('Unknown mode: "something-strange". Please choose one of ["expect","echo","exec","transfer"]');
    });
  });

  describe ('with a fully operational server running in default mode', () => {
    it ('should be able to launch the server and immediately close it', () => {
        let ssh_server = new TestSSHD({
          port: 4004,
          debug: true
        });

        ssh_server.start();
        return ssh_server.stop();
    });

    it ('should be able to login', () => {
      return new Promise((resolve, reject) => {
        let ssh_server = new TestSSHD({
          port: 4005
        });

        const connectParams = ssh_server.connectParams();

        let conn = new Connection();
        conn.on('ready', () => {
          ssh_server.stop().then(resolve);
        });

        conn.on('error', (err) => {
          ssh_server.stop().then(() => {
            reject(err);
          });
        });

        ssh_server.on('ready', () => {
          conn.connect(connectParams);
        });

        ssh_server.on('error', (err) => {
          reject(err);
        });

        ssh_server.start();
      });
    });

    describe ('with a fully operational server running in echo mode', () => {
      it ('should echo the command send after logging in', () => {
        return new Promise((resolve, reject) => {
          const command = 'uptime';
          const ssh_server = new TestSSHD({port: 4006, mode: 'echo'});
          const connectParams = ssh_server.connectParams();

          let conn = new Connection();
          conn.on('ready', () => {
            conn.exec(command, {}, (err, stream) => {
              if (err) {
                ssh_server.stop();
                reject (err);
              }

              stream.on('data', (data, extended) => {
                let output = data + '';
                expect(output.trim()).toEqual(command.trim());
                ssh_server.stop().then(resolve);
              });

              stream.on('exit', (code, signal) => {
                if (code !== 0) {
                  reject(new Error(`Incorrect exit code: ${code}`));
                }
              });
            });
          });

          conn.on('error', (err) => {
            ssh_server.stop().then(() => {
              reject(err);
            });
          });

          ssh_server.on('error', (err) => {
            reject(err);
          });

          ssh_server.on('ready', () => {
            conn.connect(connectParams);
          });

          ssh_server.start();
        });
      });
    });

    describe ('with a fully operational server running in exec mode', () => {
      it ('should return the result of running a command', () => {
        return new Promise((resolve, reject) => {
          const command = 'whoami';
          const ssh_server = new TestSSHD({port: 4007, mode: 'exec'});
          const connectParams = ssh_server.connectParams();

          let conn = new Connection();
          conn.on('ready',function() {
            conn.exec(command, {}, (err, stream) => {
              if (err) {
                reject(err);
              }

              stream.on('data', (data, extended) => {
                var output = data + '';
                expect(output.trim()).toEqual(process.env.USER.trim());
                ssh_server.stop().then(resolve);
              });

              stream.on('exit', (code, signal) => {
                if (code !== 0) {
                  reject(new Error(`Incorrect exit code: ${code}`));
                }
              });
            });
          });

          conn.on('error', (err) => {
            ssh_server.stop().then(() => {
              reject(err);
            });
          });

          ssh_server.on('error', (err) => {
            reject(err);
          });

          ssh_server.on('ready', () => {
            conn.connect(connectParams);
          });

          ssh_server.on('error', (err) => {
            reject(err);
          });

          ssh_server.start();
        });
      });
    });

    describe ('with a fully operational server running in transfer mode', () => {
      it ('should allow access to the home directory of the user', () => {
        return new Promise((resolve, reject) => {
          const ssh_server = new TestSSHD({port: 4008, mode: 'transfer'});
          const homeDir = process.env.HOME;
          const connectParams = ssh_server.connectParams();

          var conn = new Connection();
          conn.on('ready', () => {
            conn.sftp((err, sftp) => {
              if (err) {
                reject(err);
              }

              sftp.opendir(homeDir, (err, handle) => {
                if (err) {
                  reject(err);
                }

                ssh_server.stop().then(resolve);
              });
            });
          });

          conn.on('error', (err) => {
            ssh_server.stop().then(() => {
              reject(err);
            });
          });

          ssh_server.on('ready', () => {
            conn.connect(connectParams);
          });

          ssh_server.on('error', (err) => {
            reject(err);
          });

          ssh_server.start();
        });
      });
    });
  });
});
