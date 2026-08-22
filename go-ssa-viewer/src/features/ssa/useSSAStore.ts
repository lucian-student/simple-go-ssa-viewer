import { create } from 'zustand'

export const DEFAULT_CODE = [
    "package main",
    "",
    "import \"fmt\"",
    "",
    "func add(a,b int) int{",
    "   return a + b",
    "}",
    "",
    "func main(){",
    "   fmt.Printf(\"Hello world\")",
    "}",
].join("\n")

export type SSAStore = {
    code: string
    setCode: (newCode: string) => void
}


const useSSAStore = create<SSAStore>((set) => ({
    code: DEFAULT_CODE,
    setCode: (newCode: string) => set({ code: newCode })
}))

export default useSSAStore