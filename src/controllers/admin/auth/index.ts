import { createErrorResponse, createSuccessResponse } from '@/controllers/_schemas'
import { createClient } from '@supabase/supabase-js'
import { Context, Hono } from 'hono'
import { describeRoute, validator } from 'hono-openapi'
import { getCookie, setCookie } from 'hono/cookie'
import z from 'zod'

// Supabase client setup
const supabaseUrl = process.env.SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_ANON_KEY!


const getSupabase = (accessToken?: string) => {
    return createClient(supabaseUrl, supabaseKey, {
        global: {
            headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {}
        }
    })
}

// Middleware to verify authentication
export const authMiddleware = async (c: Context<any, any, {}>, next: () => any) => {
    const token = getCookie(c, 'sb-access-token')

    if (!token) {
        return c.json(createErrorResponse('Unauthorized', ''), 401)
    }

    const supabase = getSupabase(token)
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
        return c.json(createErrorResponse('Invalid token', ''), 401)
    }

    c.set('user', user)
    await next()
}

const authRoute = new Hono();

// Define your data schema
const responseSchema = z.object({

});

// Query schema
const requestSchema = z.object({
    email: z.email(),
    password: z.string(),
});


// Sign in endpoint
authRoute.post('/signin',
    describeRoute({
        tags: ["Auth"],
        summary: "Signin",
        description: "",
        responses: {
            200: {
                description: "Successful response",
                content: {
                    "application/json": {},
                },
            },
        },
    }),
    validator("json", requestSchema),
    async (c) => {
        const { email, password } = c.req.valid("json");
        const supabase = getSupabase()

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            return c.json({ error: error.message }, 400)
        }

        setCookie(c, 'sb-access-token', data.session.access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Lax',
            maxAge: 60 * 60 * 24 * 7,
        })
        setCookie(c, 'sb-refresh-token', data.session.refresh_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Lax',
            maxAge: 60 * 60 * 24 * 30,
        })

        return c.json(createSuccessResponse({ user: data.user, session: data.session }))
    })

// Sign out endpoint
authRoute.post('/signout', describeRoute({
    tags: ["Auth"],
    summary: "Signout",
    description: "",
    responses: {
        200: {
            description: "Successful response",
            content: {
                "application/json": {},
            },
        },
    },
}), async (c) => {
    const token = getCookie(c, 'sb-access-token')

    if (token) {
        const supabase = getSupabase(token)
        await supabase.auth.signOut()
    }

    setCookie(c, 'sb-access-token', '', { maxAge: 0 })
    setCookie(c, 'sb-refresh-token', '', { maxAge: 0 })

    return c.json({ message: 'Signed out successfully' })
})

// Refresh token endpoint
authRoute.post('/refresh', async (c) => {
    const refreshToken = getCookie(c, 'sb-refresh-token')

    if (!refreshToken) {
        return c.json({ error: 'No refresh token' }, 401)
    }

    const supabase = getSupabase()
    const { data, error } = await supabase.auth.refreshSession({
        refresh_token: refreshToken,
    })

    if (error) {
        return c.json({ error: error.message }, 400)
    }

    if (!data.session) {
        return c.json({ error: 'Session data is missing' }, 400);
    }

    setCookie(c, 'sb-access-token', data.session.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Lax',
        maxAge: 60 * 60 * 24 * 7,
    })

    return c.json({ session: data.session })
})

// Get current user
authRoute.get('/me', describeRoute({
    tags: ["Auth"],
    summary: "Get current user",
    description: "Get current user",
    responses: {
        200: {
            description: "Successful response",
            content: {
                "application/json": {},
            },
        },
    },
}), authMiddleware, async (c) => {
    // Fix: Ensure type safety when accessing user from context variable map
    const user = (c.var as any).user;
    return c.json(createSuccessResponse({ user }));
});

export default authRoute;