# XRP Ledger 代币演示

这个项目演示了如何使用 XRP Ledger 进行代币的创建、发行和转账操作。该项目使用了 XRP Ledger 的开发网络(DevNet)，并基于 Peersyst/xrpl-go 库实现。

## 环境要求

- Go 1.23 或更高版本
- 访问 XRP Ledger 开发网络 (DevNet: wss://s.devnet.rippletest.net:51233)

## 安装

1. 克隆仓库：

```bash
git clone https://github.com/Sales-and-Customer-Success-department/xrpl-token-demo.git
cd xrpl-token-demo
```

2. 安装依赖：

```bash
go mod download
```

3. （可选）配置环境：

```bash
cp .env.example .env
# 根据需要修改 .env 文件
```

## 功能

该项目提供以下功能：

1. 创建 XRP 账户
2. 为现有账户从开发网水龙头获取测试资金
3. 配置发行者账户
4. 配置分发者账户
5. 创建信任线
6. 发行和转移自定义代币
7. 查询账户XRP余额
8. 查询账户持有的代币列表
9. 前端支持国际化

## 使用方法

### 启动Web界面

项目提供了一个简单的Web界面，可以直观地进行各种操作：

```bash
go run cmd/webui/main.go
```

然后在浏览器中访问 `http://localhost:8080`

### 命令行使用

#### 创建和配置账户

创建一个新的 XRP 账户：

```bash
go run main.go create-account
```

为账户从开发网水龙头获取测试资金：

```bash
go run main.go fund-devnet-account <账户地址>
```

配置发行者账户：

```bash
go run main.go config-issuer <账户密钥>
```

配置分发者账户：

```bash
go run main.go config-distributor <账户密钥>
```

#### 创建信任线和代币操作

创建信任线：

```bash
go run main.go create-trustline <账户密钥> <发行者地址> <代币名称> <信任额度>
```

转移代币（包括发行代币的场景）：

```bash
go run main.go transfer-token <发送者密钥> <接收者地址> <发行者地址> <代币名称> <数量>
```

#### 查询账户信息

查询账户XRP余额：

```bash
go run main.go get-balance <账户地址>
```

查询账户持有的代币列表：

```bash
go run main.go get-tokens <账户地址>
```

#### 运行测试

运行单元测试：

```bash
go test -v ./...
```

运行集成测试：

```bash
go test -v -tags=integration ./...
```

## 项目结构

```plaintext
├── cmd/
│   └── webui/            # Web界面相关代码
│       ├── main.go       # Web服务器入口
│       └── static/       # 静态文件目录
│           ├── index.html # Web界面HTML文件
│           ├── css/      # CSS样式目录
│           │   └── main.css # 主样式文件
│           └── js/       # JavaScript文件目录
│               ├── main.js        # 主要脚本文件
│               └── translations.js # 国际化翻译文件
├── config/
│   └── config.go         # 配置加载和管理
├── service/
│   ├── faucet_service.go # 水龙头服务封装
│   ├── token_service.go  # 代币操作相关功能
│   └── wallet_service.go # 钱包和账户相关功能
├── main.go               # 命令行工具入口
├── main_test.go          # 主程序单元测试
├── integration_test.go   # 集成测试
├── go.mod                # Go模块定义
├── go.sum                # Go依赖校验
└── .env.example          # 环境变量示例
```

## 技术实现

该项目使用了以下技术和库：

1. **Peersyst/xrpl-go v0.1.10**: XRP Ledger 的 Go 语言客户端库，用于与 XRPL 网络交互
2. **WebSocket 客户端**: 与 XRP Ledger 节点实时通信
3. **签名和加密**: 使用 ED25519 算法进行交易签名
4. **HTTP服务器**: 提供Web界面和API接口
5. **JavaScript & CSS**: 实现前端交互和国际化支持

### 核心流程

每个命令执行单一功能，符合UNIX哲学中的"做好一件事，并把它做好"原则：

1. **账户创建与配置**:
   - 创建账户 (create-account)
   - 为账户充值激活 (fund-devnet-account)
   - 配置发行者账户 (config-issuer)
   - 配置分发者账户 (config-distributor)

2. **代币管理**:
   - 创建信任线 (create-trustline)
   - 转移代币 (transfer-token)，包括发行和后续的转账操作

3. **账户查询**:
   - 查询XRP余额 (get-balance)
   - 查询代币余额 (get-tokens)

### DevNet vs TestNet vs MainNet

- **DevNet**: 开发测试环境，可以频繁重置，用于初始开发
- **TestNet**: 更稳定的测试环境，适合集成测试
- **MainNet**: 生产环境，需要真实的XRP

本项目使用 **DevNet**，便于开发和测试。

## 注意事项

1. 这是一个演示项目，不建议在生产环境中直接使用。
2. 默认连接到 XRP Ledger 的开发网络(DevNet)。
3. 在实际应用中，请妥善保管账户密钥，不要在命令行中明文传递。
4. 请确保使用 Go 1.23 或更高版本运行此项目。
5. 在调用 Web API 时，所有账户密钥数据仅在本地使用，不会被服务端存储。

## API参考

Web界面通过以下API与后端交互：

- `POST /api/create-account`: 创建新账户
- `POST /api/fund-account`: 为账户充值测试资金
- `POST /api/configure-issuer`: 配置发行者账户
- `POST /api/configure-distributor`: 配置分发者账户
- `POST /api/create-trustline`: 创建信任线
- `POST /api/transfer-token`: 转移代币（包括发行）
- `POST /api/get-balance`: 获取XRP余额
- `POST /api/get-tokens`: 获取账户代币列表

## 资源链接

- [XRP Ledger 开发者文档](https://xrpl.org/docs.html)
- [XRP Ledger 开发网水龙头](https://faucet.devnet.rippletest.net/)
- [XRP Ledger 浏览器](https://devnet.xrpl.org/)
- [Peersyst/xrpl-go 文档](https://github.com/Peersyst/xrpl-go)
