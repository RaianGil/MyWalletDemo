import crypto from 'crypto';

const ALGORITHM = process.env.ALGORITHM || 'aes-256-xts';
const IV_LENGTH = 16;

function encryptKey(key: string, secretCode: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, secretCode, iv);

  let encrypted = cipher.update(key, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  return iv.toString('hex') + encrypted;
}