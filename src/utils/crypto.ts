import crypto from 'crypto';

const SALT_KEY = 'oma.maocanhua.cn';
const IV = SALT_KEY.toUpperCase();
export function encrypt(data: string) {
  const cipher = crypto.createCipheriv('aes-128-cbc', SALT_KEY, IV);
  let crypted = cipher.update(data, 'utf8', 'binary');
  crypted += cipher.final('binary');
  crypted = Buffer.from(crypted, 'binary').toString('base64');
  return crypted;
};


export function decrypt(crypted: string) {
  crypted = Buffer.from(crypted, 'base64').toString('binary');
  const decipher = crypto.createDecipheriv('aes-128-cbc', SALT_KEY, IV);
  let decoded = decipher.update(crypted, 'binary', 'utf8');
  decoded += decipher.final('utf8');
  return decoded;
};

export function encodePassword(password: string) {
  return crypto.createHmac('sha256', SALT_KEY).update(password).digest('hex');
}
