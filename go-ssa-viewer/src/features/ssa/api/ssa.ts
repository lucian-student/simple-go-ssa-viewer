import { useQuery } from '@tanstack/react-query'
import { apiPost } from '@/lib/apiClient'
import { ssaResponseSchema } from "@/features/ssa/types"

type useSSAProps = {
    code: string
}

export function useSSA({ code }: useSSAProps) {
    return useQuery({
        queryKey: ['ssa', code],
        queryFn: () => apiPost("/ssa", ssaResponseSchema, { code })

    })
}
