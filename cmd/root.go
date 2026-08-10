package cmd

import (
	"io"
	"ssa-viewer/internal/server"

	"github.com/spf13/cobra"
)

// Config or options struct to hold flag values

// NewRootCmd creates a fresh, isolated instance of the root command
func NewRootCmd(out io.Writer) *cobra.Command {
	opts := &server.ServerOptions{}

	cmd := &cobra.Command{
		Use:   "mycli",
		Short: "A cleanly structured CLI application",
		RunE: func(cmd *cobra.Command, args []string) error {
			return server.Listen(opts)
		},
	}

	cmd.Flags().IntVar(&opts.Port, "port", 8073, "Port of a web server")

	return cmd
}
