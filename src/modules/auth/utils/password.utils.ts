import * as bcrypt from 'bcrypt';

const getSalt = async (): Promise<string> => {
  return await bcrypt.genSalt();
};

export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, await getSalt());
};

export const comparePassword = async (
  password: string,
  hashedPassword: string,
): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};
