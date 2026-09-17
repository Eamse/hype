import { NextResponse } from 'next/server';

export function badRequest(route: string, message: string) {
    console.warn(`[api:${route}] 400 - ${message}`);
    return NextResponse.json({ error: message }, { status: 400 });
}
