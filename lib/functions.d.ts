import { CacheType, ChatInputCommandInteraction, Client } from 'discord.js';
import { Config } from './create/config';
import { UserDB } from './create/user';
export declare function defineCommands(c: Client): void;
export declare function submitError(err: any, c: Client): Promise<void | import("discord.js").Message<true>>;
export declare function findUser(userId: string, i: ChatInputCommandInteraction<CacheType>, c: Client, options: {
    isKiller: boolean;
    isVictim: boolean;
}): Promise<void | import("discord.js").Message<true> | UserDB | null>;
export declare function serverConfig(i: ChatInputCommandInteraction<CacheType>, c: Client): Promise<void | import("discord.js").Message<true> | Config | null>;
