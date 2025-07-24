package main

import (
	"encoding/json"
	"fmt"
	"log"
	"math"
	"net/http"
	"path/filepath"
	"strconv"

	"github.com/Peersyst/xrpl-go/xrpl/transaction/types"
	"github.com/Peersyst/xrpl-go/xrpl/wallet"
	"github.com/Sales-and-Customer-Success-department/xrpl-token-demo/config"
	"github.com/Sales-and-Customer-Success-department/xrpl-token-demo/service"
)

// Helper function to import wallet from secret
func walletFromSecret(secret string) (*wallet.Wallet, error) {
	wallet, err := wallet.FromSecret(secret)
	if err != nil {
		return nil, fmt.Errorf("failed to import wallet from secret: %w", err)
	}
	return &wallet, nil
}

// Convert string to XRP type address
func toAddress(address string) types.Address {
	return types.Address(address)
}

func main() {
	// Initialize configuration
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load configuration: %v", err)
	}

	// Serve static files
	fs := http.FileServer(http.Dir(filepath.Join("cmd", "webui", "static")))
	http.Handle("/", fs)

	// API endpoints
	http.HandleFunc("/api/create-account", func(w http.ResponseWriter, r *http.Request) {
		xrplService := service.NewXRPLService(cfg)
		account, err := xrplService.CreateAccount()
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		fmt.Fprintf(w, `{"address":"%s","secret":"%s"}`, account.ClassicAddress, account.Seed)
	})

	http.HandleFunc("/api/fund-account", func(w http.ResponseWriter, r *http.Request) {
		var req struct {
			Address string `json:"address"`
		}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		success, err := service.FundDevnetAccount(toAddress(req.Address))
		if err != nil {
			errorResponse := map[string]string{
				"error":  "Account funding failed",
				"detail": err.Error(),
				"code":   "FUND_ERROR",
			}
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(errorResponse)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		fmt.Fprintf(w, `{"success":%t}`, success)
	})

	// Configure issuer account
	http.HandleFunc("/api/configure-issuer", func(w http.ResponseWriter, r *http.Request) {
		var req struct {
			Secret  string                  `json:"secret"`
			Options service.AccountSetFlags `json:"options,omitempty"`
		}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		// Import wallet from secret
		issuerWallet, err := walletFromSecret(req.Secret)
		if err != nil {
			http.Error(w, fmt.Sprintf("Failed to import issuer wallet: %v", err), http.StatusInternalServerError)
			return
		}

		// Configure issuer account
		xrplService := service.NewXRPLService(cfg)
		txHash, err := xrplService.ConfigureIssuerAccount(issuerWallet, &req.Options)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		fmt.Fprintf(w, `{"txHash":"%s"}`, txHash)
	})

	// Configure distributor account
	http.HandleFunc("/api/configure-distributor", func(w http.ResponseWriter, r *http.Request) {
		var req struct {
			Secret  string                  `json:"secret"`
			Options service.AccountSetFlags `json:"options,omitempty"`
		}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		// Import wallet from secret
		distributorWallet, err := walletFromSecret(req.Secret)
		if err != nil {
			http.Error(w, fmt.Sprintf("Failed to import distributor wallet: %v", err), http.StatusInternalServerError)
			return
		}

		// Configure distributor account
		xrplService := service.NewXRPLService(cfg)
		txHash, err := xrplService.ConfigureDistributorAccount(distributorWallet, &req.Options)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		fmt.Fprintf(w, `{"txHash":"%s"}`, txHash)
	})

	// Create trust line
	http.HandleFunc("/api/create-trustline", func(w http.ResponseWriter, r *http.Request) {
		var req struct {
			Secret  string                   `json:"secret"`
			Options service.TrustLineOptions `json:"options"`
		}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		// Import wallet from secret
		receiverWallet, err := walletFromSecret(req.Secret)
		if err != nil {
			http.Error(w, fmt.Sprintf("Failed to import receiver wallet: %v", err), http.StatusInternalServerError)
			return
		}

		// Create trust line
		xrplService := service.NewXRPLService(cfg)
		txHash, err := xrplService.CreateTrustLine(receiverWallet, &req.Options)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		fmt.Fprintf(w, `{"txHash":"%s"}`, txHash)
	})

	// Freeze trust line
	http.HandleFunc("/api/freeze-trustline", func(w http.ResponseWriter, r *http.Request) {
		var req struct {
			Secret           string `json:"secret"`
			TrustlineAddress string `json:"trustlineAddress"`
			TokenName        string `json:"tokenName"`
		}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		// Import wallet from secret
		accountWallet, err := walletFromSecret(req.Secret)
		if err != nil {
			http.Error(w, fmt.Sprintf("Failed to import account wallet: %v", err), http.StatusInternalServerError)
			return
		}

		// Freeze trust line
		xrplService := service.NewXRPLService(cfg)
		txHash, err := xrplService.FreezeTrustLine(accountWallet, toAddress(req.TrustlineAddress), req.TokenName)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		fmt.Fprintf(w, `{"txHash":"%s"}`, txHash)
	})

	// Unfreeze trust line
	http.HandleFunc("/api/unfreeze-trustline", func(w http.ResponseWriter, r *http.Request) {
		var req struct {
			Secret           string `json:"secret"`
			TrustlineAddress string `json:"trustlineAddress"`
			TokenName        string `json:"tokenName"`
		}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		// Import wallet from secret
		accountWallet, err := walletFromSecret(req.Secret)
		if err != nil {
			http.Error(w, fmt.Sprintf("Failed to import account wallet: %v", err), http.StatusInternalServerError)
			return
		}

		// Unfreeze trust line
		xrplService := service.NewXRPLService(cfg)
		txHash, err := xrplService.UnfreezeTrustLine(accountWallet, toAddress(req.TrustlineAddress), req.TokenName)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		fmt.Fprintf(w, `{"txHash":"%s"}`, txHash)
	})

	http.HandleFunc("/api/transfer-token", func(w http.ResponseWriter, r *http.Request) {
		var req struct {
			SenderSecret    string `json:"senderSecret"`
			ReceiverAddress string `json:"receiverAddress"`
			IssuerAddress   string `json:"issuerAddress"`
			TokenName       string `json:"tokenName"`
			TransferRate    string `json:"transferRate"`
			Amount          string `json:"amount"`
		}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		// Import wallet from secret
		senderWallet, err := walletFromSecret(req.SenderSecret)
		if err != nil {
			http.Error(w, fmt.Sprintf("Failed to import sender wallet: %v", err), http.StatusInternalServerError)
			return
		}

		// Calculate SendMax
		sendMax := req.Amount

		// Use TransferRate to calculate SendMax
		if req.TransferRate != "" && req.TransferRate != "0" {
			transferRate, err := strconv.ParseUint(req.TransferRate, 10, 32)
			if err != nil {
				http.Error(w, fmt.Sprintf("Invalid transfer rate: %v", err), http.StatusBadRequest)
				return
			}

			// Parse amount
			transferAmount, err := strconv.ParseFloat(req.Amount, 64)
			if err != nil {
				http.Error(w, fmt.Sprintf("Invalid transfer amount: %v", err), http.StatusBadRequest)
				return
			}

			// sendMax = transferAmount * transferRate /1_000_000_000
			// This gives the maximum amount sender will pay, including transfer fee
			sendMaxInt := int64(math.Ceil(transferAmount * float64(transferRate) / 1_000_000_000.0))
			sendMax = strconv.FormatInt(sendMaxInt, 10)
		}

		// Create transfer options
		transferToReceiverOptions := &service.TransferTokenOptions{
			ReceiverAddress: toAddress(req.ReceiverAddress),
			IssuerAddress:   toAddress(req.IssuerAddress),
			TokenName:       req.TokenName,
			Amount:          req.Amount,
			SendMax:         sendMax,
		}

		// Transfer tokens
		xrplService := service.NewXRPLService(cfg)
		txHash, err := xrplService.TransferToken(senderWallet, transferToReceiverOptions)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		fmt.Fprintf(w, `{"txHash":"%s"}`, txHash)
	})

	http.HandleFunc("/api/get-balance", func(w http.ResponseWriter, r *http.Request) {
		var req struct {
			Address string `json:"address"`
		}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		xrplService := service.NewXRPLService(cfg)
		balance, err := xrplService.GetBalance(toAddress(req.Address))
		if err != nil {
			errorResponse := map[string]string{
				"error":  "Failed to get balance",
				"detail": err.Error(),
				"code":   "BALANCE_ERROR",
			}
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(errorResponse)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		fmt.Fprintf(w, `{"balance":"%s"}`, balance)
	})

	http.HandleFunc("/api/get-tokens", func(w http.ResponseWriter, r *http.Request) {
		var req struct {
			Address string `json:"address"`
		}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		xrplService := service.NewXRPLService(cfg)
		tokens, err := xrplService.GetTokenBalances(toAddress(req.Address))
		if err != nil {
			errorResponse := map[string]string{
				"error":  "Failed to get token balances",
				"detail": err.Error(),
				"code":   "TOKENS_ERROR",
			}
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(errorResponse)
			return
		}

		// Convert token list to JSON
		tokensJSON, err := json.Marshal(tokens)
		if err != nil {
			errorResponse := map[string]string{
				"error":  "Failed to process token data",
				"detail": err.Error(),
				"code":   "JSON_ERROR",
			}
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(errorResponse)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		fmt.Fprintf(w, `{"tokens":%s}`, tokensJSON)
	})

	http.HandleFunc("/api/get-trustlines", func(w http.ResponseWriter, r *http.Request) {
		var req struct {
			Address string `json:"address"`
		}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		xrplService := service.NewXRPLService(cfg)
		trustlines, err := xrplService.GetAllTrustLines(toAddress(req.Address))
		if err != nil {
			errorResponse := map[string]string{
				"error":  "Failed to get trust lines",
				"detail": err.Error(),
				"code":   "TRUSTLINES_ERROR",
			}
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(errorResponse)
			return
		}

		// Convert trust lines data to JSON
		trustlinesJSON, err := json.Marshal(trustlines)
		if err != nil {
			errorResponse := map[string]string{
				"error":  "Failed to process trust lines data",
				"detail": err.Error(),
				"code":   "JSON_ERROR",
			}
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(errorResponse)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.Write(trustlinesJSON)
	})

	// Start server
	port := cfg.Port

	log.Printf("Web interface started, visit http://localhost:%s to view", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}
