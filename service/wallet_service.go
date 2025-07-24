package service

import (
	"fmt"

	"github.com/Peersyst/xrpl-go/pkg/crypto"
	"github.com/Peersyst/xrpl-go/xrpl/queries/account"
	"github.com/Peersyst/xrpl-go/xrpl/transaction/types"
	"github.com/Peersyst/xrpl-go/xrpl/wallet"
)

// CreateAccount creates a new XRP account
func (s *XRPLService) CreateAccount() (*wallet.Wallet, error) {
	// Create new wallet
	newWallet, err := wallet.New(crypto.ED25519())
	if err != nil {
		return nil, fmt.Errorf("failed to create wallet: %w", err)
	}

	return &newWallet, nil
}

func (s *XRPLService) GetBalance(address types.Address) (string, error) {
	// Ensure client is connected
	if err := s.ensureConnected(); err != nil {
		return "", err
	}
	defer s.client.Disconnect()

	// Create account info request
	req := &account.InfoRequest{
		Account: address,
	}

	// Get account information
	resp, err := s.client.GetAccountInfo(req)
	if err != nil {
		return "", fmt.Errorf("failed to get account info: %w", err)
	}

	// Extract XRP balance from result and convert to string (XRP is stored as drops in XRPL, 1 XRP = 1,000,000 drops)
	balance := resp.AccountData.Balance
	balanceInXRP := float64(balance) / 1000000.0

	return fmt.Sprintf("%.6f XRP", balanceInXRP), nil
}
