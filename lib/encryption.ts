import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;
const ITERATIONS = 100000;
const HASH_ALGORITHM = 'sha512';

export class Encryption {
  private static validateKey() {
    if (!ENCRYPTION_KEY) {
      throw new Error('ENCRYPTION_KEY environment variable is not set');
    }
  }

  static encrypt(text: string): string {
    this.validateKey();
    
    // Generate salt and IV
    const salt = crypto.randomBytes(SALT_LENGTH);
    const iv = crypto.randomBytes(IV_LENGTH);

    // Create key using PBKDF2
    const key = crypto.pbkdf2Sync(
      ENCRYPTION_KEY!,
      salt,
      ITERATIONS,
      32,
      HASH_ALGORITHM
    );

    // Create cipher
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    // Encrypt the text
    const encrypted = Buffer.concat([
      cipher.update(text, 'utf8'),
      cipher.final(),
    ]);

    // Get auth tag
    const tag = cipher.getAuthTag();

    // Combine all parameters
    const result = Buffer.concat([salt, iv, tag, encrypted]);

    return result.toString('base64');
  }

  static decrypt(encryptedText: string): string {
    this.validateKey();
    
    // Convert from base64
    const buffer = Buffer.from(encryptedText, 'base64');

    // Extract parameters
    const salt = buffer.subarray(0, SALT_LENGTH);
    const iv = buffer.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
    const tag = buffer.subarray(
      SALT_LENGTH + IV_LENGTH,
      SALT_LENGTH + IV_LENGTH + TAG_LENGTH
    );
    const encrypted = buffer.subarray(SALT_LENGTH + IV_LENGTH + TAG_LENGTH);

    // Create key using PBKDF2
    const key = crypto.pbkdf2Sync(
      ENCRYPTION_KEY!,
      salt,
      ITERATIONS,
      32,
      HASH_ALGORITHM
    );

    // Create decipher
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);

    // Decrypt the text
    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]);

    return decrypted.toString('utf8');
  }

  static hashPassword(password: string): string {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto
      .pbkdf2Sync(password, salt, 1000, 64, 'sha512')
      .toString('hex');
    return `${salt}:${hash}`;
  }

  static verifyPassword(password: string, hashedPassword: string): boolean {
    const [salt, hash] = hashedPassword.split(':');
    const verifyHash = crypto
      .pbkdf2Sync(password, salt, 1000, 64, 'sha512')
      .toString('hex');
    return hash === verifyHash;
  }
}
