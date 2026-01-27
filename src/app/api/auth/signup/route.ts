import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, signToken, setAuthCookie, UserRole } from '@/lib/auth';
import { signupSchema } from '@/lib/validations';
import { ZodError } from 'zod';

export async function POST(request: NextRequest) {
    try {
        // Step 1: Parse JSON body
        let body;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                { error: 'Invalid JSON body' },
                { status: 400 }
            );
        }

        // Step 2: Validate input
        let validatedData;
        try {
            validatedData = signupSchema.parse(body);
        } catch (error) {
            if (error instanceof ZodError) {
                return NextResponse.json(
                    { error: 'Validation error', details: error.issues },
                    { status: 400 }
                );
            }
            throw error;
        }

        const { username, password } = validatedData;

        // Step 3: Check if username already exists
        let existingUser;
        try {
            existingUser = await prisma.user.findUnique({
                where: { username },
            });
        } catch (error) {
            console.error('Database error during signup check:', error);
            return NextResponse.json(
                { error: 'Database connection error. Please try again.' },
                { status: 503 }
            );
        }

        if (existingUser) {
            return NextResponse.json(
                { error: 'Username already exists' },
                { status: 409 }
            );
        }

        // Step 4: Hash password
        let passwordHash;
        try {
            passwordHash = await hashPassword(password);
        } catch (error) {
            console.error('Password hashing error:', error);
            return NextResponse.json(
                { error: 'Account creation failed' },
                { status: 500 }
            );
        }

        // Step 5: Create user
        let user;
        try {
            user = await prisma.user.create({
                data: {
                    username,
                    passwordHash,
                    role: 'MEMBER',
                },
            });
        } catch (error) {
            console.error('User creation error:', error);
            return NextResponse.json(
                { error: 'Account creation failed. Please try again.' },
                { status: 500 }
            );
        }

        // Step 6: Create JWT token
        let token;
        try {
            token = signToken({
                userId: user.id,
                username: user.username,
                role: user.role as UserRole,
            });
        } catch (error) {
            console.error('Token creation error:', error);
            return NextResponse.json(
                { error: 'Session creation failed' },
                { status: 500 }
            );
        }

        // Step 7: Set auth cookie
        try {
            await setAuthCookie(token);
        } catch (error) {
            console.error('Cookie setting error:', error);
            // Continue anyway - user was created successfully
        }

        return NextResponse.json({
            message: 'Account created successfully',
            user: {
                id: user.id,
                username: user.username,
                role: user.role,
            },
        }, { status: 201 });

    } catch (error) {
        console.error('Unexpected signup error:', error);
        return NextResponse.json(
            { error: 'An unexpected error occurred. Please try again.' },
            { status: 500 }
        );
    }
}
