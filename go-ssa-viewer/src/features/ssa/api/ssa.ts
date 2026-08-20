import { useQuery, skipToken } from '@tanstack/react-query'
import { apiPost } from '@/lib/apiClient'
import { ssaResponseSchema, type SSAResponse } from "@/features/ssa/types"

type useSSAProps = {
    code: string
}

export function useSSA({ code }: useSSAProps) {
    return useQuery({
        queryKey: ['ssa'],
        queryFn: () => apiPost("/ssa", ssaResponseSchema, { "code": code })
    })
}

export function useSSAData() {
    return useQuery<SSAResponse>({
        queryKey: ['ssa'],
        queryFn: skipToken, // 
    })
}