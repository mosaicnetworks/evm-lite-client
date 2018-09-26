import * as http from 'http'

let request = (options, callback) => {
    return http.request(options, (response) => {
        // console.log(`${options.method} ${options.host}:${options.port}${options.path}`);
        let data = '';
        response.on('data', (chunk) => {
            data += chunk;
        });
        response.on('end', () => {
            callback(data);
        });
    })
};

export default class EVMLiteClient {
    public constructor(readonly host: string, readonly port: number) {
    }

    public getAccount(address: string): Promise<string> {
        let options = this._constructOptions('GET', `/account/${address}`);
        return new Promise((resolve, reject) => {
            let req = request(options, resolve);
            req.on('error', (err) => reject(err));
            req.end();
        });
    }

    public getAccounts(): Promise<string> {
        let options = this._constructOptions('GET', '/accounts');
        return new Promise((resolve, reject) => {
            let req = request(options, resolve);
            req.on('error', (err) => reject(err));
            req.end();
        });
    }

    public call(tx: string): Promise<string> {
        let options = this._constructOptions('POST', '/call');
        return new Promise((resolve, reject) => {
            let req = request(options, resolve);
            req.write(tx);
            req.on('error', (err) => reject(err));
            req.end()
        });
    }

    public sendTx(tx: string): Promise<string> {
        let options = this._constructOptions('POST', '/tx');
        return new Promise((resolve, reject) => {
            let req = request(options, resolve);
            req.write(tx);
            req.on('error', (err) => reject(err));
            req.end();
        })
    }

    public sendRawTx(tx: string) {
        let options = this._constructOptions('POST', '/rawtx');
        return new Promise((resolve, reject) => {
            let req = request(options, resolve);
            req.write(tx);
            req.on('error', (err) => reject(err));
            req.end();
        });
    }

    public getReceipt(txHash: string) {
        let options = this._constructOptions('GET', `/tx/${txHash}`);
        return new Promise((resolve, reject) => {
            let req = request(options, resolve);
            req.on('error', (err) => reject(err));
            req.end();
        })
    }

    private _constructOptions(method, path: string) {
        return {
            host: this.host,
            port: this.port,
            method: method,
            path: path
        }
    }
}
