package service

import (
	"fmt"

	"github.com/Peersyst/xrpl-go/xrpl/faucet"
	"github.com/Peersyst/xrpl-go/xrpl/transaction/types"
)

// FundDevnetAccount funds an existing address with test funds from the faucet
func FundDevnetAccount(address types.Address) (bool, error) {
	devnetFaucet := faucet.NewDevnetFaucetProvider()
	err := devnetFaucet.FundWallet(address)
	if err != nil {
		return false, fmt.Errorf("failed to fund account: %w", err)
	}

	return true, nil
}

// FundTestnetAccount funds an existing address with test funds from the faucet
func FundTestnetAccount(address types.Address) (bool, error) {
	testnetFaucet := faucet.NewTestnetFaucetProvider()
	err := testnetFaucet.FundWallet(address)
	if err != nil {
		return false, fmt.Errorf("failed to fund account: %w", err)
	}

	return true, nil
}
