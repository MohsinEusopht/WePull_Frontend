import { EncryptStorage } from 'encrypt-storage';
import config from '../../configs/config';
export const encryptStorage = new EncryptStorage(config.encryption_key, {});
