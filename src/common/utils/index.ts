import { createHash } from 'crypto';

export const generateHash = (input) => {
  return createHash('md5').update(input).digest('hex');
};
