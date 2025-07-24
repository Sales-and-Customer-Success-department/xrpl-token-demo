package config

import (
	"log"
	"os"

	"github.com/Peersyst/xrpl-go/xrpl/websocket"
	"github.com/joho/godotenv"
)

// Config contains application configuration information
type Config struct {
	// Node URL, can be testnet or mainnet
	NodeURL string
	// Client instance
	Client *websocket.Client
	// Application listening port
	Port string
}

// Load loads application configuration
func Load() (*Config, error) {
	// Try to load environment variables from .env file
	err := godotenv.Load()
	if err != nil {
		log.Println("Warning: .env file not found or cannot be loaded, will use system environment variables or default values")
	}

	// Get node URL environment variable
	nodeURL := os.Getenv("XRPL_NODE_URL")
	if nodeURL == "" {
		// If environment variable is not set, use XRP Ledger Devnet
		nodeURL = "wss://s.devnet.rippletest.net:51233"
	}

	// Create XRPL WebSocket client configuration
	clientConfig := websocket.NewClientConfig().WithHost(nodeURL)

	// Create XRPL client
	client := websocket.NewClient(clientConfig)

	// Get application port, default is 8080
	port := os.Getenv("APP_PORT")
	if port == "" {
		port = "8080"
	}

	return &Config{
		NodeURL: nodeURL,
		Client:  client,
		Port:    port,
	}, nil
}
