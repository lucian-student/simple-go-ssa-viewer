import z from "zod"
import { APIError } from '@/errors/api-error'


const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

/**
 * @throws
 * ZodError when validation fails
 * Error when status isnt ok, tldr some fetch error probably
 * APIError when fetch API fails
 */
export async function apiPost<RESULT, BODY = undefined>(
    url: string,
    resultSchema: z.ZodType<RESULT>,
    body?: BODY
): Promise<RESULT> {
    // Automatically prepends base URL if a relative path is provided
    const targetUrl = url.startsWith('http') ? url : `${BASE_URL.replace(/\/$/, '')}/${url.replace(/^\//, '')}`

    const res = await fetch(targetUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: body ? JSON.stringify(body) : undefined
    })

    if (!res.ok) throw new APIError(`HTTP error ${res.status}: ${res.statusText}`, res.status)
    const data = await res.json()
    return resultSchema.parse(data)
}