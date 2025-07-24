# XRP Ledger Token Demo

This project demonstrates how to create, issue, and transfer tokens using the XRP Ledger. The project uses the XRP Ledger development network (DevNet) and is implemented based on the Peersyst/xrpl-go library.

## Requirements

- Go 1.23 or higher
- Access to XRP Ledger development network (DevNet: wss://s.devnet.rippletest.net:51233)

## Installation

1. Clone the repository:

```bash
git clone https://github.com/Sales-and-Customer-Success-department/xrpl-token-demo.git
cd xrpl-token-demo
```

2. Install dependencies:

```bash
go mod download
```

3. (Optional) Configure environment:

```bash
cp .env.example .env
# Modify the .env file as needed
```

## Features

This project provides the following features:

1. Create XRP accounts
2. Fund existing accounts from the development network faucet
3. Configure issuer accounts
4. Configure distributor accounts
5. Create trust lines
6. Issue and transfer custom tokens
7. Query account XRP balance
8. Query account token lists
9. Frontend internationalization support

## Usage

### Start Web Interface

The project provides a simple web interface for intuitive operations:

```bash
go run cmd/webui/main.go
```

Then visit `http://localhost:8080` in your browser

### Command Line Usage

#### Create and Configure Accounts

Create a new XRP account:

```bash
go run main.go create-account
```

Fund an account from the development network faucet:

```bash
go run main.go fund-devnet-account <account-address>
```

Configure issuer account:

```bash
go run main.go config-issuer <account-secret>
```

Configure distributor account:

```bash
go run main.go config-distributor <account-secret>
```

#### Create Trust Lines and Token Operations

Create trust line:

```bash
go run main.go create-trustline <account-secret> <issuer-address> <token-name> <trust-limit>
```

Transfer tokens (including token issuance scenarios):

```bash
go run main.go transfer-token <sender-secret> <receiver-address> <issuer-address> <token-name> <amount>
```

#### Query Account Information

Query account XRP balance:

```bash
go run main.go get-balance <account-address>
```

Query account token list:

```bash
go run main.go get-tokens <account-address>
```

#### Run Tests

Run unit tests:

```bash
go test -v ./...
```

Run integration tests:

```bash
go test -v -tags=integration ./...
```

## Project Structure

```plaintext
├── cmd/
│   └── webui/            # Web interface related code
│       ├── main.go       # Web server entry point
│       └── static/       # Static files directory
│           ├── index.html # Web interface HTML file
│           ├── css/      # CSS styles directory
│           │   └── main.css # Main stylesheet
│           └── js/       # JavaScript files directory
│               ├── main.js        # Main script file
│               └── translations.js # Internationalization translation file
├── config/
│   └── config.go         # Configuration loading and management
├── service/
│   ├── faucet_service.go # Faucet service wrapper
│   ├── token_service.go  # Token operation related functions
│   └── wallet_service.go # Wallet and account related functions
├── main.go               # Command line tool entry point
├── main_test.go          # Main program unit tests
├── integration_test.go   # Integration tests
├── go.mod                # Go module definition
├── go.sum                # Go dependency verification
└── .env.example          # Environment variables example
```

## Technical Implementation

This project uses the following technologies and libraries:

1. **Peersyst/xrpl-go v0.1.10**: Go language client library for XRP Ledger, used to interact with the XRPL network
2. **WebSocket Client**: Real-time communication with XRP Ledger nodes
3. **Signing and Encryption**: Uses ED25519 algorithm for transaction signing
4. **HTTP Server**: Provides web interface and API endpoints
5. **JavaScript & CSS**: Implements frontend interaction and internationalization support

### Core Workflows

Each command performs a single function, following the UNIX philosophy of "do one thing and do it well":

1. **Account Creation and Configuration**:
   - Create account (create-account)
   - Fund account for activation (fund-devnet-account)
   - Configure issuer account (config-issuer)
   - Configure distributor account (config-distributor)

2. **Token Management**:
   - Create trust line (create-trustline)
   - Transfer tokens (transfer-token), including issuance and subsequent transfer operations

3. **Account Queries**:
   - Query XRP balance (get-balance)
   - Query token balance (get-tokens)

### DevNet vs TestNet vs MainNet

- **DevNet**: Development testing environment, can be frequently reset, used for initial development
- **TestNet**: More stable testing environment, suitable for integration testing
- **MainNet**: Production environment, requires real XRP

This project uses **DevNet** for convenient development and testing.

## Notes

1. This is a demonstration project and is not recommended for direct use in production environments.
2. Connects to the XRP Ledger development network (DevNet) by default.
3. In actual applications, please keep account keys secure and do not pass them in plain text on the command line.
4. Please ensure you are using Go 1.23 or higher to run this project.
5. When calling Web APIs, all account key data is only used locally and is not stored by the server.

## API Reference

The web interface interacts with the backend through the following APIs:

- `POST /api/create-account`: Create new account
- `POST /api/fund-account`: Fund account with test funds
- `POST /api/configure-issuer`: Configure issuer account
- `POST /api/configure-distributor`: Configure distributor account
- `POST /api/create-trustline`: Create trust line
- `POST /api/transfer-token`: Transfer tokens (including issuance)
- `POST /api/get-balance`: Get XRP balance
- `POST /api/get-tokens`: Get account token list

## Resource Links

- [XRP Ledger Developer Documentation](https://xrpl.org/docs.html)
- [XRP Ledger Development Network Faucet](https://faucet.devnet.rippletest.net/)
- [XRP Ledger Explorer](https://devnet.xrpl.org/)
- [Peersyst/xrpl-go Documentation](https://github.com/Peersyst/xrpl-go)
