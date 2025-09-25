package main

import (
	"log"
	"my_project/internal/server"
)

func main() {
	// Create server with error handling
	srv, err := server.NewServer()
	if err != nil {
		log.Fatalf("❌ Failed to create server: %v", err)
	}

	// Start server (includes graceful shutdown)
	if err := srv.Start(); err != nil {
		log.Fatalf("❌ Server error: %v", err)
	}
}
