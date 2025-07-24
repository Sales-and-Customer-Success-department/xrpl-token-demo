package main

import (
	"fmt"
	"strconv"
	"testing"
	"time"

	"github.com/Peersyst/xrpl-go/xrpl/transaction/types"
	"github.com/Sales-and-Customer-Success-department/xrpl-token-demo/config"
	"github.com/Sales-and-Customer-Success-department/xrpl-token-demo/service"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// TestAccountLifecycle tests the complete process of account creation, funding, and balance queries
func TestAccountLifecycle(t *testing.T) {
	// 1. Load configuration
	t.Log("1. Create issuer account")
	cfg, err := config.Load()
	require.NoError(t, err, "Failed to load configuration")
	xrplService := service.NewXRPLService(cfg)

	// 2. Create accounts
	t.Log("2.1 Create issuer account")
	issuerWallet, err := xrplService.CreateAccount()
	require.NoError(t, err, "Failed to create issuer account")
	issuerAddress := issuerWallet.ClassicAddress
	t.Logf("Issuer account created successfully: %s", issuerAddress)

	t.Log("2.2 Create distributor account")
	distributorWallet, err := xrplService.CreateAccount()
	require.NoError(t, err, "Failed to create distributor account")
	distributorAddress := distributorWallet.ClassicAddress
	t.Logf("Distributor account created successfully: %s", distributorAddress)

	// 3. Fund accounts
	t.Log("3.1 Fund issuer account")
	success, err := service.FundDevnetAccount(issuerAddress)
	require.NoError(t, err, "Failed to fund issuer account")
	assert.True(t, success)

	t.Log("3.2 Fund distributor account")
	success, err = service.FundDevnetAccount(distributorAddress)
	require.NoError(t, err, "Failed to fund distributor account")
	assert.True(t, success)

	// 4. Wait for funding to arrive
	t.Log("4. Wait for funding to arrive")
	time.Sleep(10 * time.Second)

	// Check XRP balance of both accounts
	const maxWaitTime = 120 * time.Second
	const retryInterval = 5 * time.Second
	startTime := time.Now()

	// Wait for issuer account balance to arrive
	var issuerBalance string
	var balanceFound bool
	for time.Since(startTime) < maxWaitTime {
		issuerBalance, err = xrplService.GetBalance(issuerAddress)
		if err == nil {
			balanceFound = true
			t.Logf("Issuer account balance: %s", issuerBalance)
			break
		}
		t.Logf("Failed to get issuer balance, retrying in 5 seconds: %v", err)
		time.Sleep(retryInterval)
	}
	require.True(t, balanceFound, "Failed to get issuer account balance within the specified time")

	// Wait for distributor account balance to arrive
	startTime = time.Now()
	balanceFound = false
	var distributorBalance string
	for time.Since(startTime) < maxWaitTime {
		distributorBalance, err = xrplService.GetBalance(distributorAddress)
		if err == nil {
			balanceFound = true
			t.Logf("Distributor account balance: %s", distributorBalance)
			break
		}
		t.Logf("Failed to get distributor balance, retrying in 5 seconds: %v", err)
		time.Sleep(retryInterval)
	}
	require.True(t, balanceFound, "Failed to get distributor account balance within the specified time")

	// 5. Configure issuer account
	t.Log("5. Configure issuer account settings")
	transferRate := uint32(1_005_000_000)
	issuerOptions := &service.AccountSetFlags{
		Domain:              "6578616D706C652E636F6D", // example.com
		TransferRate:        transferRate,
		TickSize:            0,
		SetAsfDefaultRipple: true,
	}
	_, err = xrplService.ConfigureIssuerAccount(issuerWallet, issuerOptions)
	require.NoError(t, err, "Failed to configure issuer account settings")

	// 6. Configure distributor account
	t.Log("6. Configure distributor account settings")
	distributorOptions := &service.AccountSetFlags{
		Domain:            "6578616D706C652E636F6D", // example.com
		SetAsfRequireAuth: true,
	}
	_, err = xrplService.ConfigureDistributorAccount(distributorWallet, distributorOptions)
	require.NoError(t, err, "Failed to configure distributor account settings")

	// 7. Create distributor trust line
	tokenName := "FOO"
	trustAmount := "1000000"
	t.Log("7. Create trust line from distributor to issuer")

	trustLineOptions := &service.TrustLineOptions{
		IssuerAddress: issuerAddress,
		TokenName:     tokenName,
		Amount:        trustAmount,
	}

	_, err = xrplService.CreateTrustLine(
		distributorWallet,
		trustLineOptions,
	)
	require.NoError(t, err, "Failed to create trust line")

	// 8. Issue tokens from issuer to distributor
	t.Log("8. Issue tokens from issuer to distributor")
	mintAmount := "2000" // Issue 2000 tokens
	transferOptions := &service.TransferTokenOptions{
		ReceiverAddress: distributorAddress,
		IssuerAddress:   issuerAddress,
		TokenName:       tokenName,
		Amount:          mintAmount,
	}

	_, err = xrplService.TransferToken(
		issuerWallet,
		transferOptions,
	)
	require.NoError(t, err, "Failed to issue tokens")

	// Check distributor's token balance
	t.Log("Check distributor's token balance")
	time.Sleep(5 * time.Second) // Wait for transaction confirmation

	tokenBalances, err := xrplService.GetTokenBalances(distributorAddress)
	require.NoError(t, err, "Failed to get distributor's token balance")

	// 9. Verify token balance
	t.Log("9. Verify token balance")
	assert.NotEmpty(t, tokenBalances, "Distributor should hold tokens")
	var found bool
	for _, token := range tokenBalances {
		if token.TokenName == tokenName && types.Address(token.Issuer) == issuerAddress {
			assert.Equal(t, mintAmount, token.Balance, "Token balance should equal the issued amount")
			found = true
			break
		}
	}
	assert.True(t, found, "Correct token not found")

	// 10. Create third-party account (receiver account)
	t.Log("10.1 Create third-party receiver account")
	receiverWallet, err := xrplService.CreateAccount()
	require.NoError(t, err, "Failed to create third-party receiver account")
	receiverAddress := receiverWallet.ClassicAddress
	t.Logf("Third-party receiver account created successfully: %s", receiverAddress)

	// 10. Fund third-party receiver account with XRP
	t.Log("10.2 Fund third-party receiver account with XRP")
	success, err = service.FundDevnetAccount(receiverAddress)
	require.NoError(t, err, "Failed to fund third-party receiver account")
	assert.True(t, success)

	// Wait for third-party account funding to arrive
	t.Log("Wait for third-party account funding to arrive")
	time.Sleep(10 * time.Second)

	// Check third-party account's XRP balance
	startTime = time.Now()
	balanceFound = false
	var receiverBalance string
	for time.Since(startTime) < maxWaitTime {
		receiverBalance, err = xrplService.GetBalance(receiverAddress)
		if err == nil {
			balanceFound = true
			t.Logf("Third-party receiver account balance: %s", receiverBalance)
			break
		}
		t.Logf("Failed to get third-party receiver account balance, retrying in 5 seconds: %v", err)
		time.Sleep(retryInterval)
	}
	require.True(t, balanceFound, "Failed to get third-party receiver account balance within the specified time")

	// 11. Create trust line from third-party receiver to issuer
	t.Log("11. Create trust line from third-party receiver to issuer")
	receiverTrustLineOptions := &service.TrustLineOptions{
		IssuerAddress: issuerAddress,
		TokenName:     tokenName,
		Amount:        trustAmount,
	}

	_, err = xrplService.CreateTrustLine(
		receiverWallet,
		receiverTrustLineOptions,
	)
	require.NoError(t, err, "Failed to create third-party receiver trust line")

	// 12. Transfer tokens from distributor to third-party receiver
	t.Log("12. Transfer tokens from distributor to third-party receiver")
	transferAmount := "1000" // Transfer some tokens
	transferAmountFloat, _ := strconv.ParseFloat(transferAmount, 64)

	// Calculate transfer fee: fee = transferAmount * (transferRate - 1_000_000_000) / 1_000_000_000
	feeRate := (float64(transferRate) - 1_000_000_000) / 1_000_000_000
	transferFee := transferAmountFloat * feeRate

	// Calculate sendMax: total amount to pay = transfer amount + fee
	sendMaxFloat := transferAmountFloat + transferFee
	sendMax := fmt.Sprintf("%.0f", sendMaxFloat)

	t.Logf("Transfer amount: %s, Fee rate: %.2f%%, Calculated fee: %.2f, SendMax: %s",
		transferAmount, feeRate*100, transferFee, sendMax)

	transferToReceiverOptions := &service.TransferTokenOptions{
		ReceiverAddress: receiverAddress,
		IssuerAddress:   issuerAddress,
		TokenName:       tokenName,
		Amount:          transferAmount,
		SendMax:         sendMax,
	}

	_, err = xrplService.TransferToken(
		distributorWallet,
		transferToReceiverOptions,
	)
	require.NoError(t, err, "Failed to transfer tokens from distributor to third-party receiver")

	// Wait for transaction confirmation
	t.Log("Wait for transaction confirmation")
	time.Sleep(5 * time.Second)

	// 13. Verify distributor and third-party receiver token balances
	t.Log("13.1 Verify distributor's token balance")
	distributorTokenBalances, err := xrplService.GetTokenBalances(distributorAddress)
	require.NoError(t, err, "Failed to get distributor's token balance")

	// Verify distributor's token balance decrease
	// Distributor's actual paid amount = transfer amount + fee
	// Remaining balance = original balance (2000) - actual paid amount
	actualPaidAmount := transferAmountFloat + transferFee
	expectedDistributorBalanceFloat := 2000.0 - actualPaidAmount
	expectedDistributorBalance := fmt.Sprintf("%.0f", expectedDistributorBalanceFloat)

	t.Logf("Distributor expected remaining balance: %s (original: 2000, actual paid: %.2f)",
		expectedDistributorBalance, actualPaidAmount)

	distributorTokenFound := false
	for _, token := range distributorTokenBalances {
		if token.TokenName == tokenName && types.Address(token.Issuer) == issuerAddress {
			t.Logf("Distributor actual balance: %s", token.Balance)
			// Allow a certain margin of error due to potential precision issues
			actualBalance, _ := strconv.ParseFloat(token.Balance, 64)
			expectedBalance, _ := strconv.ParseFloat(expectedDistributorBalance, 64)
			tolerance := 1.0 // Allow 1 unit of error

			assert.InDelta(t, expectedBalance, actualBalance, tolerance,
				"Distributor token balance should equal original balance minus actual paid amount (transfer amount + fee)")
			distributorTokenFound = true
			break
		}
	}
	assert.True(t, distributorTokenFound, "Correct distributor token not found")

	// Verify third-party receiver's token balance
	t.Log("13.2 Verify third-party receiver's token balance")
	receiverTokenBalances, err := xrplService.GetTokenBalances(receiverAddress)
	require.NoError(t, err, "Failed to get third-party receiver's token balance")

	receiverTokenFound := false
	for _, token := range receiverTokenBalances {
		if token.TokenName == tokenName && types.Address(token.Issuer) == issuerAddress {
			assert.Equal(t, transferAmount, token.Balance, "Third-party receiver token balance should equal transfer amount")
			receiverTokenFound = true
			break
		}
	}
	assert.True(t, receiverTokenFound, "Correct third-party receiver token not found")
}
