import { z } from 'zod'

export const instructionDTOSchema = z.object({
  text: z.string(),
})

export const codeBlockDTOSchema = z.object({
  index: z.number().int(),
  instructions: z.array(instructionDTOSchema),
  succs: z.array(z.number().int()),
  preds: z.array(z.number().int()),
})

export const functionDTOSchema = z.object({
  path: z.string(),
  name: z.string(),
  blocks: z.array(codeBlockDTOSchema),
})

export const packageDTOSchema = z.object({
  functions: z.array(functionDTOSchema),
})

export const ssaResponseSchema = z.object({
  packages: z.array(packageDTOSchema)
})

// Automatically infer TypeScript types from schemas
export type InstructionDTO = z.infer<typeof instructionDTOSchema>
export type CodeBlockDTO = z.infer<typeof codeBlockDTOSchema>
export type FunctionDTO = z.infer<typeof functionDTOSchema>
export type PackageDTO = z.infer<typeof packageDTOSchema>
export type SSAResponse = z.infer<typeof ssaResponseSchema>