import bcrypt from 'bcrypt';

export const hash = (s) => bcrypt.hashSync(s, 12);
export const compare = (s, h) => bcrypt.compare(s, h);
