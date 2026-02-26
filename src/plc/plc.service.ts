import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodes7 = require('nodes7');

export interface Db54Data {
    brightness: number;
    positions: {
        color: number;
        text: number;
    }[];
}

@Injectable()
export class PlcService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(PlcService.name);
    private conn = new nodes7();
    private isConnected = false;
    private isConnecting = false;
    private readonly plcIp: string;
    private readonly rack: number;
    private readonly slot: number;

    private lastError: string | null = null;

    constructor(private configService: ConfigService) {
        this.plcIp = this.configService.get<string>('PLC_IP', '192.168.190.53');
        this.rack = this.configService.get<number>('PLC_RACK', 0);
        this.slot = this.configService.get<number>('PLC_SLOT', 1);
    }

    async onModuleInit() {
        this.logger.log(`Initializing PLC connection to ${this.plcIp}...`);
        this.connect();
    }

    async onModuleDestroy() {
        this.logger.log('Closing PLC connection...');
        if (this.conn) {
            this.conn.dropConnection();
        }
    }

    private connect() {
        if (this.isConnecting || this.isConnected) return;

        this.isConnecting = true;
        this.lastError = null;
        try {
            this.conn.initiateConnection(
                { port: 102, host: this.plcIp, rack: this.rack, slot: this.slot },
                (err: Error | string | undefined) => {
                    this.isConnecting = false;
                    if (err !== undefined) {
                        this.lastError = `Connection Failed: ${err}`;
                        this.logger.error(`PLC Connection Failed: ${err}`);
                        this.isConnected = false;
                        setTimeout(() => this.connect(), 5000);
                    } else {
                        this.lastError = null;
                        this.logger.log('PLC Connected successfully.');
                        this.isConnected = true;
                    }
                },
            );
        } catch (err) {
            this.isConnecting = false;
            this.lastError = `Connection Error (sync): ${err}`;
            this.logger.error(`PLC Connection Error (sync): ${err}`);
            this.isConnected = false;
            setTimeout(() => this.connect(), 5000);
        }
    }

    async readDb54() {
        if (!this.isConnected) {
            throw new Error('PLC not connected');
        }

        return new Promise<Db54Data>((resolve, reject) => {
            // Area: DB=0x84, DBNumber: 54, Start: 0, Size: 94
            try {
                this.conn.readArea(0x84, 54, 0, 94, (err: Error | string | undefined, data: Buffer) => {
                    if (err) {
                        this.logger.error(`Error reading DB54: ${err}`);
                        reject(new Error(`Error reading DB54: ${err}`));
                    } else {
                        // Log the raw buffer to see if we are getting zeros or data
                        this.logger.log(`[DEBUG] RAW BUFFER (Hex): ${data.toString('hex')}`);

                        const result: Db54Data = {
                            brightness: data.readInt16BE(0),
                            positions: [],
                        };

                        for (let i = 0; i < 23; i++) {
                            const baseOffset = 2 + (i * 4);
                            result.positions.push({
                                color: data.readInt16BE(baseOffset),
                                text: data.readInt16BE(baseOffset + 2),
                            });
                        }
                        resolve(result);
                    }
                });
            } catch (syncErr) {
                this.logger.error(`Error initiating readDb54: ${syncErr}`);
                reject(new Error(`Error initiating readDb54: ${syncErr}`));
            }
        });
    }

    async writeDb54(values: { brightness: number, positions: { color: number, text: number }[] }) {
        if (!this.isConnected) {
            throw new Error('PLC not connected');
        }

        const buf = Buffer.alloc(94);
        buf.writeInt16BE(values.brightness, 0);

        values.positions.forEach((pos, i) => {
            if (i < 23) {
                const baseOffset = 2 + (i * 4);
                buf.writeInt16BE(pos.color, baseOffset);
                buf.writeInt16BE(pos.text, baseOffset + 2);
            }
        });

        return new Promise<void>((resolve, reject) => {
            this.conn.writeArea(0x84, 54, 0, 94, buf, (err: Error | string | undefined) => {
                if (err) {
                    this.logger.error(`Error writing DB54: ${err}`);
                    reject(err);
                } else {
                    this.logger.log('Wrote DB54 successfully. Pulsing M150.0...');
                    this.pulseM150_0().then(() => resolve()).catch(reject);
                }
            });
        });
    }

    private async pulseM150_0() {
        return new Promise<boolean>((resolve, reject) => {
            // Write True to M150.0
            this.conn.writeArea(0x83, 0, 150 * 8 + 0, 1, Buffer.from([1]), async (err: Error | string | undefined) => {
                if (err) return reject(err);

                await new Promise(r => setTimeout(r, 500));

                // Write False to M150.0
                this.conn.writeArea(0x83, 0, 150 * 8 + 0, 1, Buffer.from([0]), (err2: Error | string | undefined) => {
                    if (err2) return reject(err2);
                    resolve(true);
                });
            });
        });
    }

    async readLineUse() {
        if (!this.isConnected) return null;

        return new Promise<Record<string, boolean>>((resolve, reject) => {
            // Area M at byte 10
            try {
                this.conn.readArea(0x83, 0, 10, 1, (err: Error | string | undefined, data: Buffer) => {
                    if (err) {
                        this.logger.error(`Error reading Line Use: ${err}`);
                        resolve(null);
                    }
                    else {
                        const byte = data[0];
                        resolve({
                            line1: !!(byte & (1 << 0)),
                            line2: !!(byte & (1 << 1)),
                            line3: !!(byte & (1 << 2)),
                            line4: !!(byte & (1 << 3)),
                        });
                    }
                });
            } catch (syncErr) {
                this.logger.error(`Error initiating readLineUse: ${syncErr}`);
                resolve(null);
            }
        });
    }

    async writeLineUse(lineIndex: number, value: boolean) {
        if (!this.isConnected) throw new Error('PLC not connected');

        const bitAddress = 10 * 8 + (lineIndex - 1);

        return new Promise<boolean>((resolve, reject) => {
            this.conn.writeArea(0x83, 0, bitAddress, 1, Buffer.from([value ? 1 : 0]), (err: Error | string | undefined) => {
                if (err) reject(err);
                else resolve(true);
            });
        });
    }

    getStatus() {
        return {
            isConnected: this.isConnected,
            ip: this.plcIp,
            lastError: this.lastError,
        };
    }
}
