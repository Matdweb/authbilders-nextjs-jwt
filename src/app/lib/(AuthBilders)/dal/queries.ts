import fs from 'fs';
import path from 'path';
import bcrypt from 'bcrypt';
import type { User } from '../defintions';
import { generateUID } from '../utils/uuid';
import { extractErrorDetails } from '../utils/errors';
import { successResponse, errorResponse } from '../utils/response';

const USERS_PATH = path.join(process.cwd(), 'src/app/lib/(AuthBilders)/data/users.json');

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

export const addUser = async ({ email, password }: { email: string; password: string; }) => {
    try {
        const hash = await bcrypt.hash(password, 10);
        const newUser = {
            id: generateUID(),
            email,
            password: hash,
            email_verified: false,
        };
        const users = getAllUsers();
        users.push(newUser);
        fs.writeFileSync(USERS_PATH, JSON.stringify(users, null, 2));

        return successResponse(['User created successfully'], {
            user: newUser,
        });

    } catch (error) {
        const { message } = extractErrorDetails(error);
        return errorResponse(['User creation failed'], {
            errors: [message || "An error occurred while creating the user."]
        });
    }
}

export const verifyUserEmail = (email: string): User | null => {
    const users = getAllUsers();
    const user = users.find((user) => user.email === email);
    
    if (!user) return null;

    user.email_verified = true;
    fs.writeFileSync(USERS_PATH, JSON.stringify(users, null, 2));
    
    return user;
}