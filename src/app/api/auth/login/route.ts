import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { comparePassword, signToken, setAuthCookie, UserRole } from '@/lib/auth';
import { loginSchema } from '@/lib/validations';
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
            validatedData = loginSchema.parse(body);
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

        // Step 3: Find user in database
        let user;
        try {
            user = await prisma.user.findUnique({
                where: { username },
            });
        } catch (error) {
            console.error('Database error during login:', error);
            return NextResponse.json(
                { error: 'Database connection error. Please try again.' },
                { status: 503 }
            );
        }

        if (!user) {
            return NextResponse.json(
                { error: 'Invalid username or password' },
                { status: 401 }
            );
        }

        // Step 4: Check if user is disabled
        if (user.status === 'DISABLED') {
            return NextResponse.json(
                { error: 'Your account has been disabled. Please contact support.' },
                { status: 403 }
            );
        }

        // Step 5: Verify password
        let isValidPassword;
        try {
            isValidPassword = await comparePassword(password, user.passwordHash);
        } catch (error) {
            console.error('Password comparison error:', error);
            return NextResponse.json(
                { error: 'Authentication service error' },
                { status: 500 }
            );
        }

        if (!isValidPassword) {
            return NextResponse.json(
                { error: 'Invalid username or password' },
                { status: 401 }
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
            // Cookie setting might fail but we can still return success with the token info
        }

        return NextResponse.json({
            message: 'Login successful',
            user: {
                id: user.id,
                username: user.username,
                role: user.role,
            },
        });

    } catch (error) {
        console.error('Unexpected login error:', error);
        return NextResponse.json(
            { error: 'An unexpected error occurred. Please try again.' },
            { status: 500 }
        );
    }
}
