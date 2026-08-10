package main

import (
	"log/slog"
	"os"
	"ssa-viewer/cmd"
)

func main() {
	rootCmd := cmd.NewRootCmd(os.Stdout)

	if err := rootCmd.Execute(); err != nil {
		slog.Error("failed to process request", "error", err)
		os.Exit(1)
	}
}
