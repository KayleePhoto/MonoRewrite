import { Model } from 'sequelize';
export declare class Config extends Model {
}
export declare function createConfig(server: string): Promise<void>;
