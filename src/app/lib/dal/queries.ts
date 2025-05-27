import fs from 'fs';
import path from 'path';
import bcrypt from 'bcrypt';
import type { User } from '../defintions';

const USERS_PATH = path.join(process.cwd(), 'src/app/lib/data/users.json');

// Read all users from JSON
export const getAllUsers = (): User[] => {
    const jsonData = fs.readFileSync(USERS_PATH, 'utf-8');
    return JSON.parse(jsonData) as User[];
};

// Find a user by email
export const findUserByEmail = (email: string): User | undefined => {
    return getAllUsers().find((user) => user.email === email);
};

// Validate email + password credentials
export const validateUser = async (email: string, plainPassword: string): Promise<User | null> => {
    const user = findUserByEmail(email);
    if (!user) return null;

    const match = await bcrypt.compare(plainPassword, user.password || "");
    return match ? user : null;
};
