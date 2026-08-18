package ssaparser

import (
	"golang.org/x/tools/go/ssa"
)

type InstructionDTO struct {
	Text string `json:"text"` // Renamed from String to avoid confusion with the Go type
}

type CodeBlockDTO struct {
	Index        int               `json:"index"`
	Instructions []*InstructionDTO `json:"instructions"`
	Succs        []int             `json:"succs"`
	Preds        []int             `json:"preds"`
}

type FunctionDTO struct {
	Path   string          `json:"path"`
	Name   string          `json:"name"`
	Blocks []*CodeBlockDTO `json:"blocks"`
}

type PackageDTO struct {
	Functions []*FunctionDTO `json:"functions"`
}

func NewPackageDTO(functions []*FunctionDTO) *PackageDTO {
	return &PackageDTO{
		Functions: functions,
	}
}

func NewFunctionDTO(path, name string, blocks []*CodeBlockDTO) *FunctionDTO {
	return &FunctionDTO{
		Path:   path,
		Name:   name,
		Blocks: blocks,
	}
}

func NewCodeBlockDTO() *CodeBlockDTO {
	return &CodeBlockDTO{
		Index:        0,
		Instructions: make([]*InstructionDTO, 0),
		Succs:        make([]int, 0),
		Preds:        make([]int, 0),
	}
}

func InstructionToDTO(instr ssa.Instruction) *InstructionDTO {
	dto := &InstructionDTO{}
	dto.Text = instr.String()

	/*switch v := instr.(type) {
	case *ssa.Alloc:
		fmt.Printf("%s, %v, %T, %s", v.Name(), v.Heap, v.Type(), v.String())
	}*/

	return dto
}

func CreateGraph(fn *ssa.Function) []*CodeBlockDTO {

	blocks := make([]*CodeBlockDTO, 0)

	for _, block := range fn.Blocks {

		blockDTO := NewCodeBlockDTO()

		blocks = append(blocks, blockDTO)
		for _, instr := range block.Instrs {
			//fmt.Printf("block: %d instr type %T\n", block.Index, instr)
			instrDto := InstructionToDTO(instr)
			blockDTO.Instructions = append(blockDTO.Instructions, instrDto)
		}

		for _, succ := range block.Succs {
			blockDTO.Succs = append(blockDTO.Succs, succ.Index)
		}
		for _, pred := range block.Preds {
			blockDTO.Preds = append(blockDTO.Preds, pred.Index)
		}
	}
	return blocks
}
