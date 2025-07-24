package main

import (
	"bytes"
	"os"
	"testing"

	"github.com/stretchr/testify/assert"
)

// TestPrintUsage tests the print usage function
func TestPrintUsage(t *testing.T) {
	oldStdout := os.Stdout
	r, w, _ := os.Pipe()
	os.Stdout = w

	printUsage()

	w.Close()
	os.Stdout = oldStdout
	var buf bytes.Buffer
	buf.ReadFrom(r)
	output := buf.String()

	assert.Contains(t, output, "XRP Token Demo Program - Usage:")
	assert.Contains(t, output, "go run main.go create-account")
	assert.Contains(t, output, "go run main.go get-testnet-account")
}
