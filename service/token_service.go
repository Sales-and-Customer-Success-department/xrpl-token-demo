package service

import (
	"fmt"

	"github.com/Peersyst/xrpl-go/xrpl/queries/account"
	"github.com/Peersyst/xrpl-go/xrpl/transaction"
	"github.com/Peersyst/xrpl-go/xrpl/transaction/types"
	"github.com/Peersyst/xrpl-go/xrpl/wallet"
	"github.com/Peersyst/xrpl-go/xrpl/websocket"
	"github.com/Sales-and-Customer-Success-department/xrpl-token-demo/config"
)

// XRPLService provides services for interacting with XRP Ledger
type XRPLService struct {
	client  *websocket.Client
	nodeURL string
}

// NewXRPLService creates a new XRPL service instance
func NewXRPLService(cfg *config.Config) *XRPLService {
	return &XRPLService{
		client:  cfg.Client,
		nodeURL: cfg.NodeURL,
	}
}

// Ensure client connection
func (s *XRPLService) ensureConnected() error {
	if !s.client.IsConnected() {
		if err := s.client.Connect(); err != nil {
			return fmt.Errorf("unable to connect to XRP Ledger: %w", err)
		}
	}
	return nil
}

// Account setting flags
type AccountSetFlags struct {
	// params
	Domain       string `json:"domain"`       // Domain (hexadecimal format)
	TransferRate uint32 `json:"transferRate"` // Transfer rate (0-1000, 0 means no fee, unit is 0.001%)
	TickSize     uint8  `json:"tickSize"`     // Tick size (0-15)
	// tf
	SetRequireDestTag bool `json:"setRequireDestTag"` // Set require destination tag
	SetRequireAuth    bool `json:"setRequireAuth"`    // Require authorization
	SetDisallowXRP    bool `json:"setDisallowXRP"`    // Disallow XRP
	// asf
	SetAsfRequireAuth            bool `json:"setAsfRequireAuth"`            // Set ASF require authorization
	SetAsfDefaultRipple          bool `json:"setAsfDefaultRipple"`          // Set ASF default ripple
	SetAsfAllowTrustLineClawback bool `json:"setAsfAllowTrustLineClawback"` // Allow trust line clawback
}

// Convert string to hexadecimal
func stringToHex(s string) string {
	var hexString string
	for _, c := range s {
		hexString += fmt.Sprintf("%02x", c)
	}
	return hexString
}

// Configure issuer account settings
func (s *XRPLService) ConfigureIssuerAccount(issuerWallet *wallet.Wallet, options *AccountSetFlags) (string, error) {
	// Ensure client is connected
	if err := s.ensureConnected(); err != nil {
		return "", err
	}
	defer s.client.Disconnect()

	// Use default options if none provided
	if options == nil {
		defaultOptions := AccountSetFlags{
			Domain:              "6578616D706C652E636F6D", // example.com
			TransferRate:        0,
			TickSize:            0,
			SetAsfDefaultRipple: true,
		}
		options = &defaultOptions
	}

	// Convert domain to hexadecimal (if not already in hex format)
	domainHex := options.Domain
	// Check if it's already in hexadecimal format
	isHex := true
	for _, c := range domainHex {
		if !((c >= '0' && c <= '9') || (c >= 'a' && c <= 'f') || (c >= 'A' && c <= 'F')) {
			isHex = false
			break
		}
	}
	// Convert if not in hexadecimal
	if !isHex {
		domainHex = stringToHex(options.Domain)
	}

	// Configure issuer account settings
	issuerAccountSet := &transaction.AccountSet{
		BaseTx: transaction.BaseTx{
			Account: issuerWallet.ClassicAddress,
		},
		TickSize:     types.TickSize(options.TickSize),         // Set tick size
		TransferRate: types.TransferRate(options.TransferRate), // Set transfer rate
		Domain:       types.Domain(domainHex),                  // Set domain
	}

	// Set flags based on options
	if options.SetRequireDestTag {
		issuerAccountSet.SetRequireDestTag()
	}
	if options.SetRequireAuth {
		issuerAccountSet.SetRequireAuth()
	}
	if options.SetDisallowXRP {
		issuerAccountSet.SetDisallowXRP()
	}
	if options.SetAsfRequireAuth {
		issuerAccountSet.SetAsfRequireAuth()
	}
	if options.SetAsfDefaultRipple {
		issuerAccountSet.SetAsfDefaultRipple()
	}
	if options.SetAsfAllowTrustLineClawback {
		issuerAccountSet.SetAsfAllowTrustLineClawback()
	}

	// Flatten and autofill transaction
	flattenedTx := issuerAccountSet.Flatten()
	err := s.client.Autofill(&flattenedTx)
	if err != nil {
		return "", fmt.Errorf("unable to autofill transaction: %w", err)
	}

	// Sign transaction
	txBlob, _, err := issuerWallet.Sign(flattenedTx)
	if err != nil {
		return "", fmt.Errorf("unable to sign transaction: %w", err)
	}

	// Submit transaction and wait
	response, err := s.client.SubmitTxBlobAndWait(txBlob, false)
	if err != nil {
		return "", fmt.Errorf("unable to submit transaction: %w", err)
	}

	if !response.Validated {
		return "", fmt.Errorf("issuer account settings configuration failed")
	}

	return response.Hash.String(), nil
}

// Configure distributor account settings
func (s *XRPLService) ConfigureDistributorAccount(distributorWallet *wallet.Wallet, options *AccountSetFlags) (string, error) {
	// Ensure client is connected
	if err := s.ensureConnected(); err != nil {
		return "", err
	}
	defer s.client.Disconnect()

	// Use default options if none provided
	if options == nil {
		defaultOptions := AccountSetFlags{
			Domain:            "6578616D706C652E636F6D", // example.com
			SetAsfRequireAuth: true,
		}
		options = &defaultOptions
	}

	// Convert domain to hexadecimal (if not already in hex format)
	domainHex := options.Domain
	// Check if it's already in hexadecimal format
	isHex := true
	for _, c := range domainHex {
		if !((c >= '0' && c <= '9') || (c >= 'a' && c <= 'f') || (c >= 'A' && c <= 'F')) {
			isHex = false
			break
		}
	}
	// Convert if not in hexadecimal
	if !isHex {
		domainHex = stringToHex(options.Domain)
	}

	// Configure distributor account settings
	distributorAccountSet := &transaction.AccountSet{
		BaseTx: transaction.BaseTx{
			Account: distributorWallet.ClassicAddress,
		},
		Domain: types.Domain(domainHex), // Set domain
	}

	// Set flags based on options
	if options.SetRequireDestTag {
		distributorAccountSet.SetRequireDestTag()
	}
	if options.SetRequireAuth {
		distributorAccountSet.SetRequireAuth()
	}
	if options.SetDisallowXRP {
		distributorAccountSet.SetDisallowXRP()
	}
	if options.SetAsfRequireAuth {
		distributorAccountSet.SetAsfRequireAuth()
	}
	if options.SetAsfDefaultRipple {
		distributorAccountSet.SetAsfDefaultRipple()
	}
	if options.SetAsfAllowTrustLineClawback {
		distributorAccountSet.SetAsfAllowTrustLineClawback()
	}

	// Flatten and autofill transaction
	flattenedTx := distributorAccountSet.Flatten()
	err := s.client.Autofill(&flattenedTx)
	if err != nil {
		return "", fmt.Errorf("unable to autofill transaction: %w", err)
	}

	// Sign transaction
	txBlob, _, err := distributorWallet.Sign(flattenedTx)
	if err != nil {
		return "", fmt.Errorf("unable to sign transaction: %w", err)
	}

	// Submit transaction and wait
	response, err := s.client.SubmitTxBlobAndWait(txBlob, false)
	if err != nil {
		return "", fmt.Errorf("unable to submit transaction: %w", err)
	}

	if !response.Validated {
		return "", fmt.Errorf("distributor account settings configuration failed")
	}

	return response.Hash.String(), nil
}

// Trust line options
type TrustLineOptions struct {
	IssuerAddress types.Address `json:"issuerAddress"` // Issuer address
	TokenName     string        `json:"tokenName"`     // Token name
	Amount        string        `json:"amount"`        // Trust limit
}

// Create trust line
func (s *XRPLService) CreateTrustLine(wallet *wallet.Wallet, options *TrustLineOptions) (string, error) {
	// Ensure client is connected
	if err := s.ensureConnected(); err != nil {
		return "", err
	}
	defer s.client.Disconnect()

	// Return error if no options provided
	if options == nil {
		return "", fmt.Errorf("trust line options must be provided")
	}

	// Create trust line from distributor account to issuer
	trustSet := &transaction.TrustSet{
		BaseTx: transaction.BaseTx{
			Account: wallet.ClassicAddress,
		},
		LimitAmount: types.IssuedCurrencyAmount{
			Currency: options.TokenName,
			Issuer:   options.IssuerAddress,
			Value:    options.Amount,
		},
	}

	// Flatten and autofill transaction
	flattenedTx := trustSet.Flatten()
	err := s.client.Autofill(&flattenedTx)
	if err != nil {
		return "", fmt.Errorf("unable to autofill transaction: %w", err)
	}

	// Sign transaction
	txBlob, _, err := wallet.Sign(flattenedTx)
	if err != nil {
		return "", fmt.Errorf("unable to sign transaction: %w", err)
	}

	// Submit transaction and wait
	response, err := s.client.SubmitTxBlobAndWait(txBlob, false)
	if err != nil {
		return "", fmt.Errorf("unable to submit transaction: %w", err)
	}

	if !response.Validated {
		return "", fmt.Errorf("unable to create trust line")
	}

	return response.Hash.String(), nil
}

// Freeze trust line
func (s *XRPLService) FreezeTrustLine(wallet *wallet.Wallet, trustlineAddress types.Address, tokenName string) (string, error) {
	// Ensure client is connected
	if err := s.ensureConnected(); err != nil {
		return "", err
	}
	defer s.client.Disconnect()

	// Create TrustSet transaction to freeze trust line
	trustSet := &transaction.TrustSet{
		BaseTx: transaction.BaseTx{
			Account: wallet.ClassicAddress,
		},
		LimitAmount: types.IssuedCurrencyAmount{
			Currency: tokenName,
			Issuer:   trustlineAddress,
			Value:    "0", // Keep current limit when freezing, using 0 as placeholder, will maintain existing limit
		},
	}

	// Set freeze flag
	trustSet.SetSetFreezeFlag()

	// Flatten and autofill transaction
	flattenedTx := trustSet.Flatten()
	err := s.client.Autofill(&flattenedTx)
	if err != nil {
		return "", fmt.Errorf("unable to autofill transaction: %w", err)
	}

	// Sign transaction
	txBlob, _, err := wallet.Sign(flattenedTx)
	if err != nil {
		return "", fmt.Errorf("unable to sign transaction: %w", err)
	}

	// Submit transaction and wait
	response, err := s.client.SubmitTxBlobAndWait(txBlob, false)
	if err != nil {
		return "", fmt.Errorf("unable to submit transaction: %w", err)
	}

	if !response.Validated {
		return "", fmt.Errorf("unable to freeze trust line")
	}

	return response.Hash.String(), nil
}

// Unfreeze trust line
func (s *XRPLService) UnfreezeTrustLine(wallet *wallet.Wallet, trustlineAddress types.Address, tokenName string) (string, error) {
	// Ensure client is connected
	if err := s.ensureConnected(); err != nil {
		return "", err
	}
	defer s.client.Disconnect()

	// Create TrustSet transaction to unfreeze trust line
	trustSet := &transaction.TrustSet{
		BaseTx: transaction.BaseTx{
			Account: wallet.ClassicAddress,
		},
		LimitAmount: types.IssuedCurrencyAmount{
			Currency: tokenName,
			Issuer:   trustlineAddress,
			Value:    "0", // Keep current limit when unfreezing, using 0 as placeholder, will maintain existing limit
		},
	}

	// Set unfreeze flag
	trustSet.SetClearFreezeFlag()

	// Flatten and autofill transaction
	flattenedTx := trustSet.Flatten()
	err := s.client.Autofill(&flattenedTx)
	if err != nil {
		return "", fmt.Errorf("unable to autofill transaction: %w", err)
	}

	// Sign transaction
	txBlob, _, err := wallet.Sign(flattenedTx)
	if err != nil {
		return "", fmt.Errorf("unable to sign transaction: %w", err)
	}

	// Submit transaction and wait
	response, err := s.client.SubmitTxBlobAndWait(txBlob, false)
	if err != nil {
		return "", fmt.Errorf("unable to submit transaction: %w", err)
	}

	if !response.Validated {
		return "", fmt.Errorf("unable to unfreeze trust line")
	}

	return response.Hash.String(), nil
}

// Token transfer options
type TransferTokenOptions struct {
	ReceiverAddress types.Address `json:"receiverAddress"` // Receiver address
	IssuerAddress   types.Address `json:"issuerAddress"`   // Issuer address
	TokenName       string        `json:"tokenName"`       // Token name
	Amount          string        `json:"amount"`          // Transfer amount
	SendMax         string        `json:"sendMax"`         // (Optional) Maximum amount sender is willing to spend
}

// TransferToken transfers tokens
func (s *XRPLService) TransferToken(senderWallet *wallet.Wallet, options *TransferTokenOptions) (string, error) {
	// Ensure client is connected
	if err := s.ensureConnected(); err != nil {
		return "", err
	}
	defer s.client.Disconnect()

	// Return error if no options provided
	if options == nil {
		return "", fmt.Errorf("token transfer options must be provided")
	}

	// Send tokens from sender to receiver
	payment := &transaction.Payment{
		BaseTx: transaction.BaseTx{
			Account: senderWallet.ClassicAddress,
		},
		Amount: types.IssuedCurrencyAmount{
			Currency: options.TokenName,
			Issuer:   options.IssuerAddress,
			Value:    options.Amount,
		},
		Destination: options.ReceiverAddress,
	}

	// Set SendMax field if provided
	if options.SendMax != "" {
		payment.SendMax = types.IssuedCurrencyAmount{
			Currency: options.TokenName,
			Issuer:   options.IssuerAddress,
			Value:    options.SendMax,
		}
	}

	// Flatten and autofill transaction
	flattenedTx := payment.Flatten()
	err := s.client.Autofill(&flattenedTx)
	if err != nil {
		return "", fmt.Errorf("unable to autofill transaction: %w", err)
	}

	// Sign transaction
	txBlob, _, err := senderWallet.Sign(flattenedTx)
	if err != nil {
		return "", fmt.Errorf("unable to sign transaction: %w", err)
	}

	// Submit transaction and wait
	response, err := s.client.SubmitTxBlobAndWait(txBlob, false)
	if err != nil {
		return "", fmt.Errorf("unable to submit transaction: %w", err)
	}

	if !response.Validated {
		return "", fmt.Errorf("token payment failed")
	}

	return response.Hash.String(), nil
}

// TokenBalance structure represents token balance information
type TokenBalance struct {
	TokenName   string `json:"token_name"`
	Issuer      string `json:"issuer"`
	Balance     string `json:"balance"`
	LimitAmount string `json:"limit_amount"`
}

// GetTokenBalances gets the list of tokens and balances held by an account (simplified version, maintains backward compatibility)
func (s *XRPLService) GetTokenBalances(holderAddress types.Address) ([]TokenBalance, error) {
	// Ensure client is connected
	if err := s.ensureConnected(); err != nil {
		return nil, err
	}
	defer s.client.Disconnect()

	// Create account trust lines request
	req := &account.LinesRequest{
		Account: holderAddress,
	}

	// Send request to get account trust lines
	resp, err := s.client.GetAccountLines(req)
	if err != nil {
		return nil, fmt.Errorf("failed to get account trust lines: %w", err)
	}

	// Return empty result if no trust lines
	if len(resp.Lines) == 0 {
		return []TokenBalance{}, nil
	}

	// Parse information for each trust line
	var tokenBalances []TokenBalance
	for _, line := range resp.Lines {
		// Create and add token balance information
		tokenBalances = append(tokenBalances, TokenBalance{
			TokenName:   line.Currency,
			Issuer:      string(line.Account),
			Balance:     line.Balance,
			LimitAmount: line.Limit,
		})
	}

	return tokenBalances, nil
}

// TrustLine structure represents detailed trust line information
type TrustLine struct {
	Account        string `json:"account"`         // Counterparty address
	Balance        string `json:"balance"`         // Current balance (positive means holding tokens, negative means owed)
	Currency       string `json:"currency"`        // Token code
	Limit          string `json:"limit"`           // Maximum amount this account is willing to owe counterparty
	LimitPeer      string `json:"limit_peer"`      // Maximum amount counterparty is willing to owe this account
	QualityIn      uint32 `json:"quality_in"`      // Exchange rate for receiving balances
	QualityOut     uint32 `json:"quality_out"`     // Exchange rate for sending balances
	NoRipple       bool   `json:"no_ripple"`       // Whether this account has NoRipple flag enabled
	NoRipplePeer   bool   `json:"no_ripple_peer"`  // Whether counterparty has NoRipple flag enabled
	Authorized     bool   `json:"authorized"`      // Whether this account has authorized this trust line
	PeerAuthorized bool   `json:"peer_authorized"` // Whether counterparty has authorized this trust line
	Freeze         bool   `json:"freeze"`          // Whether this account has frozen this trust line
	FreezePeer     bool   `json:"freeze_peer"`     // Whether counterparty has frozen this trust line
}

// TrustLinesResponse represents the response for getting trust lines
type TrustLinesResponse struct {
	Account   string      `json:"account"`   // Queried account address
	Lines     []TrustLine `json:"lines"`     // Trust lines list
	Validated bool        `json:"validated"` // Whether from validated ledger
}

// GetAllTrustLines gets all detailed trust line information for an account
func (s *XRPLService) GetAllTrustLines(accountAddress types.Address) (*TrustLinesResponse, error) {
	// Ensure client is connected
	if err := s.ensureConnected(); err != nil {
		return nil, err
	}
	defer s.client.Disconnect()

	// Create account trust lines request
	req := &account.LinesRequest{
		Account: accountAddress,
	}

	// Send request to get account trust lines
	resp, err := s.client.GetAccountLines(req)
	if err != nil {
		return nil, fmt.Errorf("failed to get account trust lines: %w", err)
	}

	// Build response result
	result := &TrustLinesResponse{
		Account:   string(accountAddress),
		Lines:     make([]TrustLine, 0, len(resp.Lines)),
		Validated: true, // Assume from validated ledger, should actually get from response
	}

	// Convert trust line data
	for _, line := range resp.Lines {
		trustLine := TrustLine{
			Account:        string(line.Account),
			Balance:        line.Balance,
			Currency:       line.Currency,
			Limit:          line.Limit,
			LimitPeer:      line.LimitPeer,
			QualityIn:      uint32(line.QualityIn),
			QualityOut:     uint32(line.QualityOut),
			NoRipple:       line.NoRipple,
			NoRipplePeer:   line.NoRipplePeer,
			Authorized:     line.Authorized,
			PeerAuthorized: line.PeerAuthorized,
			Freeze:         line.Freeze,
			FreezePeer:     line.FreezePeer,
		}

		result.Lines = append(result.Lines, trustLine)
	}

	return result, nil
}
