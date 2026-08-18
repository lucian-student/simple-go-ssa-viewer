package handler

import (
	"encoding/json"
	"fmt"
	"net/http"
	"ssa-viewer/internal/ssaparser"

	"go/ast"
	"go/importer"
	"go/parser"
	"go/token"
	"go/types"

	"golang.org/x/tools/go/ssa"
	"golang.org/x/tools/go/ssa/ssautil"
)

type GetSSARequest struct {
	Code string `json:"code"`
}

type GetSSAResponse struct {
	/*
		Returns basic block graph
	*/
	Packages []*ssaparser.PackageDTO
}

func NewGetSSAResponseWithPackage(pkg *ssaparser.PackageDTO) *GetSSAResponse {
	packages := []*ssaparser.PackageDTO{pkg}
	return &GetSSAResponse{
		Packages: packages,
	}
}

func GenerateSSA(request *GetSSARequest) (*GetSSAResponse, error) {

	fset := token.NewFileSet()

	file, err := parser.ParseFile(fset, "main.go", request.Code, 0)

	if err != nil {
		return nil, err
	}

	pkg := types.NewPackage("main", "main")
	conf := &types.Config{Importer: importer.Default()}

	ssaPkg, _, err := ssautil.BuildPackage(conf, fset, pkg, []*ast.File{file}, ssa.SanityCheckFunctions)

	if err != nil {
		return nil, err
	}

	ssaPkg.Build()

	functions := make([]*ssaparser.FunctionDTO, 0)
	for _, member := range ssaPkg.Members {
		if fn, ok := member.(*ssa.Function); ok {
			/*fmt.Printf("================ SSA for: %s ================\n", "")
			fn.WriteTo(os.Stdout)
			fmt.Println()*/
			fnGraph := ssaparser.CreateGraph(fn)
			fnDto := ssaparser.NewFunctionDTO("", fn.Name(), fnGraph)
			functions = append(functions, fnDto)
		}
	}

	packageDTO := ssaparser.NewPackageDTO(functions)
	return NewGetSSAResponseWithPackage(packageDTO), nil
}

func GetSSA(w http.ResponseWriter, r *http.Request) {
	// 1. Optional: Protect server by limiting max request size (e.g., 1 MB)
	r.Body = http.MaxBytesReader(w, r.Body, 1048576)

	// 2. Decode the JSON body into the struct
	var req GetSSARequest
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		http.Error(w, "Invalid JSON payload", http.StatusBadRequest)
		return
	}

	// 3. Validate that the field was provided
	if req.Code == "" {
		http.Error(w, "'code' field is required", http.StatusBadRequest)
		return
	}

	// You can now use req.Code directly:
	response, err := GenerateSSA(&req)

	if err != nil {
		http.Error(w, fmt.Sprintf("%v", err), http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")

	// 2. Set status code (optional; defaults to 200 OK if omitted)
	w.WriteHeader(http.StatusOK)

	// 3. Encode the struct directly into http.ResponseWriter
	if err := json.NewEncoder(w).Encode(response); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func Register(mux *http.ServeMux) {
	mux.HandleFunc("POST /ssa", GetSSA)
}
