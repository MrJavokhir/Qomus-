import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, signToken, setAuthCookie, UserRole } from '@/lib/auth';
import { signupSchema } from '@/lib/validations';
import { ZodError } from 'zod';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate input
        const { username, password } = signupSchema.parse(body);

        // Check if username already exists
        const existingUser = await prisma.user.findUnique({
            where: { username },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: 'Username already exists' },
                { status: 400 }
            );
        }

        // Hash password and create user
        const passwordHash = await hashPassword(password);
        const user = await prisma.user.create({
            data: {
                username,
                passwordHash,
                role: 'MEMBER',
            },
        });

        // Create JWT token
        const token = signToken({
            userId: user.id,
            username: user.username,
            role: user.role as UserRole,
        });

        // Set auth cookie
        await setAuthCookie(token);

        return NextResponse.json({
            message: 'Account created successfully',
            user: {
                id: user.id,
                username: user.username,
                role: user.role,
            },
        }, { status: 201 });

    } catch (error) {
        if (error instanceof ZodError) {
            return NextResponse.json(
                { error: 'Validation error', details: error.issues },
                { status: 400 }
            );
        }

        console.error('Signup error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
