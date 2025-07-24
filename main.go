package main

import (
	"fmt"
	"log"
	"os"

	"github.com/Peersyst/xrpl-go/xrpl/transaction/types"
	"github.com/Peersyst/xrpl-go/xrpl/wallet"
	"github.com/Sales-and-Customer-Success-department/xrpl-token-demo/config"
	"github.com/Sales-and-Customer-Success-department/xrpl-token-demo/service"
)

func main() {
	log.Println("Starting XRP Token Demo Program...")

	// Initialize configuration
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load configuration: %v", err)
	}

	// Execute different operations based on command line arguments
	if len(os.Args) < 2 {
		printUsage()
		return
	}

	xrplService := service.NewXRPLService(cfg)

	switch os.Args[1] {
	case "create-account":
		wallet, err := xrplService.CreateAccount()
		if err != nil {
			log.Fatalf("Failed to create account: %v", err)
		}
		fmt.Printf("Account created successfully!\nAddress: %s\nSecret: %s\n", wallet.ClassicAddress, wallet.PrivateKey)

	case "fund-devnet-account":
		if len(os.Args) < 3 {
			fmt.Println("Usage: go run main.go fund-devnet-account <account-address>")
			return
		}
		address := types.Address(os.Args[2])
		success, err := service.FundDevnetAccount(address)
		if err != nil {
			log.Fatalf("Failed to fund account: %v", err)
		}
		if success {
			fmt.Println("Devnet account funding request submitted successfully, please check balance later")
		}

	case "config-issuer":
		if len(os.Args) < 3 {
			fmt.Println("Usage: go run main.go config-issuer <account-secret>")
			return
		}

		secret := os.Args[2]

		// Restore wallet from secret
		issuerWallet, err := wallet.FromSecret(secret)
		if err != nil {
			log.Fatalf("Failed to restore wallet from secret: %v", err)
		}

		// Configure issuer account
		txHash, err := xrplService.ConfigureIssuerAccount(&issuerWallet, nil)
		if err != nil {
			log.Fatalf("Failed to configure issuer account: %v", err)
		}

		fmt.Printf("Issuer account configured successfully!\nAccount address: %s\nTransaction hash: %s\n",
			issuerWallet.ClassicAddress, txHash)

	case "config-distributor":
		if len(os.Args) < 3 {
			fmt.Println("Usage: go run main.go config-distributor <account-secret>")
			return
		}

		secret := os.Args[2]

		// Restore wallet from secret
		distributorWallet, err := wallet.FromSecret(secret)
		if err != nil {
			log.Fatalf("Failed to restore wallet from secret: %v", err)
		}

		// Configure distributor account
		txHash, err := xrplService.ConfigureDistributorAccount(&distributorWallet, nil)
		if err != nil {
			log.Fatalf("Failed to configure distributor account: %v", err)
		}

		fmt.Printf("Distributor account configured successfully!\nAccount address: %s\nTransaction hash: %s\n",
			distributorWallet.ClassicAddress, txHash)

	case "create-trustline":
		if len(os.Args) < 6 {
			fmt.Println("Usage: go run main.go create-trustline <account-secret> <issuer-address> <token-name> <trust-limit>")
			return
		}

		secret := os.Args[2]
		issuerAddress := types.Address(os.Args[3])
		tokenName := os.Args[4]
		amount := os.Args[5]

		// Restore wallet from secret
		receiverWallet, err := wallet.FromSecret(secret)
		if err != nil {
			log.Fatalf("Failed to restore wallet from secret: %v", err)
		}

		// Create trust line options
		trustLineOptions := &service.TrustLineOptions{
			IssuerAddress: issuerAddress,
			TokenName:     tokenName,
			Amount:        amount,
		}

		// Create trust line
		txHash, err := xrplService.CreateTrustLine(&receiverWallet, trustLineOptions)
		if err != nil {
			log.Fatalf("Failed to create trust line: %v", err)
		}

		fmt.Printf("Trust line created successfully!\nReceiver address: %s\nIssuer address: %s\nToken name: %s\nTrust limit: %s\nTransaction hash: %s\n",
			receiverWallet.ClassicAddress, issuerAddress, tokenName, amount, txHash)

	case "transfer-token":
		if len(os.Args) < 7 {
			fmt.Println("Usage: go run main.go transfer-token <sender-secret> <receiver-address> <issuer-address> <token-name> <amount>")
			return
		}

		senderKey := os.Args[2]
		receiverAddress := types.Address(os.Args[3])
		issuerAddress := types.Address(os.Args[4])
		tokenName := os.Args[5]
		amount := os.Args[6]

		// Restore sender wallet from secret
		senderWallet, err := wallet.FromSecret(senderKey)
		if err != nil {
			log.Fatalf("Failed to restore wallet from secret: %v", err)
		}

		// Create transfer token options
		transferOptions := &service.TransferTokenOptions{
			ReceiverAddress: receiverAddress,
			IssuerAddress:   issuerAddress,
			TokenName:       tokenName,
			Amount:          amount,
		}

		// Transfer token
		txHash, err := xrplService.TransferToken(&senderWallet, transferOptions)
		if err != nil {
			log.Fatalf("Failed to transfer token: %v", err)
		}

		fmt.Printf("Token transferred successfully!\nSender: %s\nReceiver: %s\nToken name: %s\nAmount: %s\nTransaction hash: %s\n",
			senderWallet.ClassicAddress, receiverAddress, tokenName, amount, txHash)

	case "get-balance":
		if len(os.Args) < 3 {
			fmt.Println("Usage: go run main.go get-balance <account-address>")
			return
		}
		address := types.Address(os.Args[2])
		balance, err := xrplService.GetBalance(address)
		if err != nil {
			log.Fatalf("Failed to get account balance: %v", err)
		}
		fmt.Printf("XRP balance for account %s: %s\n", address, balance)

	case "get-tokens":
		if len(os.Args) < 3 {
			fmt.Println("Usage: go run main.go get-tokens <account-address>")
			return
		}
		address := types.Address(os.Args[2])
		tokens, err := xrplService.GetTokenBalances(address)
		if err != nil {
			log.Fatalf("Failed to get account tokens: %v", err)
		}

		if len(tokens) == 0 {
			fmt.Printf("Account %s does not hold any tokens\n", address)
			return
		}

		fmt.Printf("Token list held by account %s:\n", address)
		for i, token := range tokens {
			fmt.Printf("%d. Token: %s\n   Issuer: %s\n   Balance: %s\n   Limit: %s\n",
				i+1, token.TokenName, token.Issuer, token.Balance, token.LimitAmount)
		}

	case "get-trustlines":
		if len(os.Args) < 3 {
			fmt.Println("Usage: go run main.go get-trustlines <account-address>")
			return
		}
		address := types.Address(os.Args[2])
		trustlines, err := xrplService.GetAllTrustLines(address)
		if err != nil {
			log.Fatalf("Failed to get account trust lines: %v", err)
		}

		if len(trustlines.Lines) == 0 {
			fmt.Printf("Account %s has no trust lines\n", address)
			return
		}

		fmt.Printf("Trust line details for account %s:\n", address)
		fmt.Printf("Validation status: %t\n\n", trustlines.Validated)
		for i, line := range trustlines.Lines {
			fmt.Printf("%d. Trust line details:\n", i+1)
			fmt.Printf("   Counterparty address: %s\n", line.Account)
			fmt.Printf("   Currency code: %s\n", line.Currency)
			fmt.Printf("   Balance: %s\n", line.Balance)
			fmt.Printf("   Account limit: %s\n", line.Limit)
			fmt.Printf("   Counterparty limit: %s\n", line.LimitPeer)
			fmt.Printf("   Quality (receiving): %d\n", line.QualityIn)
			fmt.Printf("   Quality (sending): %d\n", line.QualityOut)
			fmt.Printf("   NoRipple flag: %t\n", line.NoRipple)
			fmt.Printf("   Counterparty NoRipple: %t\n", line.NoRipplePeer)
			fmt.Printf("   Authorized: %t\n", line.Authorized)
			fmt.Printf("   Counterparty authorized: %t\n", line.PeerAuthorized)
			fmt.Printf("   Frozen: %t\n", line.Freeze)
			fmt.Printf("   Counterparty frozen: %t\n\n", line.FreezePeer)
		}

	default:
		printUsage()
	}
}

func printUsage() {
	fmt.Println("XRP Token Demo Program - Usage:")
	fmt.Println("  go run main.go create-account - Create a new XRP account")
	fmt.Println("  go run main.go fund-devnet-account <account-address> - Fund account with test funds from development network faucet")
	fmt.Println("  go run main.go config-issuer <account-secret> - Configure issuer account settings")
	fmt.Println("  go run main.go config-distributor <account-secret> - Configure distributor account settings")
	fmt.Println("  go run main.go create-trustline <account-secret> <issuer-address> <token-name> <trust-limit> - Create trust line")
	fmt.Println("  go run main.go transfer-token <sender-secret> <receiver-address> <issuer-address> <token-name> <amount> - Transfer or issue tokens")
	fmt.Println("  go run main.go get-balance <account-address> - Query account XRP balance")
	fmt.Println("  go run main.go get-tokens <account-address> - Query account token list")
	fmt.Println("  go run main.go get-trustlines <account-address> - Query all trust line details for account")
}
