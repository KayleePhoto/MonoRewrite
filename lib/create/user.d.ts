import { Model } from 'sequelize';
export declare class UserDB extends Model {
}
export declare function createUser(id: string, server: string, options?: {
    isKiller: boolean;
    isVictim: boolean;
}): Promise<void>;
