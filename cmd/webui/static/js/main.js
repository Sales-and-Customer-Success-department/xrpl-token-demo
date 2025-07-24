// 导入翻译字典
import translations from './translations.js';

// 存储键常量
const LANG_STORAGE_KEY = 'xrpl_ui_language';
const ACCOUNTS_STORAGE_KEY = 'xrpl_accounts';

// 当前语言
let currentLang = localStorage.getItem(LANG_STORAGE_KEY) || 'zh';

// 格式化字符串的辅助函数
function formatString(str, ...args) {
  return str.replace(/{(\d+)}/g, (match, number) => {
    return typeof args[number] !== 'undefined' ? args[number] : match;
  });
}

// 字符串转换为十六进制
function stringToHex(str) {
  let hex = '';
  for (let i = 0; i < str.length; i++) {
    const charCode = str.charCodeAt(i);
    hex += charCode.toString(16).padStart(2, '0');
  }
  return hex;
}

// 检查字符串是否已经是十六进制格式
function isHexFormat(str) {
  return /^[0-9A-Fa-f]+$/.test(str);
}

// 处理域名格式 - 如果不是十六进制则转换
function processDomain(domain) {
  if (!domain) return '';
  return isHexFormat(domain) ? domain : stringToHex(domain);
}

// 翻译界面元素
function translate(lang) {
  if (!translations[lang]) {
    console.error(
      translations[currentLang] ? translations[currentLang]['unsupported-language'] : 'Unsupported language:',
      lang
    );
    return;
  }

  currentLang = lang;
  localStorage.setItem(LANG_STORAGE_KEY, lang);

  // 更新语言按钮状态
  document.querySelectorAll('.language-btn').forEach((btn) => {
    if (btn.getAttribute('data-lang') === lang) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // 防止DOM元素不存在导致的错误
  const safeSetText = (selector, text, options = {}) => {
    const { silent = false, required = false } = options;

    const elements =
      typeof selector === 'string'
        ? selector.startsWith('#')
          ? [document.getElementById(selector.substring(1))].filter(Boolean)
          : Array.from(document.querySelectorAll(selector))
        : [selector].filter(Boolean);

    elements.forEach((element) => {
      if (element) {
        element.textContent = text;
        element._translationInitialized = true;
      }
    });

    // 只有在明确要求警告或者是必需元素时才输出警告
    if (elements.length === 0 && (required || (!silent && selector.includes('main-title')))) {
      console.warn(translations[currentLang]['element-not-found'], selector);
    }

    return elements.length > 0;
  };

  // 翻译主标题 - 这是关键元素，需要警告
  safeSetText('#main-title', translations[lang]['main-title'], { required: true });

  // 翻译标签页 - 这些是关键元素
  safeSetText('#tab-accounts', translations[lang]['tab-accounts'], { required: true });
  safeSetText('#tab-tokens', translations[lang]['tab-tokens'], { required: true });
  safeSetText('#tab-balance', translations[lang]['tab-balance'], { required: true });

  // 翻译账户管理部分 - 静默处理，因为可能在不同标签页
  const accountCountEl = document.getElementById('accountCount');
  const accountCountText = accountCountEl ? accountCountEl.textContent : '';
  safeSetText('#my-accounts-title', translations[lang]['my-accounts'] + ' ' + accountCountText, { silent: true });
  safeSetText('#generate-account-btn', translations[lang]['generate-account'], { silent: true });
  safeSetText('#refresh-all-balances-btn', translations[lang]['refresh-all-balances'], { silent: true });
  safeSetText('#export-accounts-btn', translations[lang]['export-accounts'], { silent: true });
  safeSetText('#import-accounts-btn', translations[lang]['import-accounts'], { silent: true });

  // 翻译账户充值部分 - 静默处理
  safeSetText('#account-funding-title', translations[lang]['account-funding'], { silent: true });
  safeSetText('#testnet-funding-label', translations[lang]['testnet-funding'], { silent: true });
  safeSetText('#fundAddress option:first-child', translations[lang]['select-account-or-address'], { silent: true });
  safeSetText('#fund-testnet-account-btn', translations[lang]['fund-testnet-account'], { silent: true });

  // 翻译代币操作部分 - 静默处理
  safeSetText('#token-issuance-title', translations[lang]['token-issuance'], { silent: true });
  safeSetText('#configure-issuer-label', translations[lang]['configure-issuer'], { silent: true });
  safeSetText('#configure-distributor-label', translations[lang]['configure-distributor'], { silent: true });
  safeSetText('#create-trustline-label', translations[lang]['create-trustline'], { silent: true });
  safeSetText('#freeze-trustline-label', translations[lang]['freeze-trustline'], { silent: true });
  safeSetText('#unfreeze-trustline-label', translations[lang]['unfreeze-trustline'], { silent: true });
  safeSetText('#transfer-token-label', translations[lang]['transfer-token'], { silent: true });
  safeSetText('#trustline-note', translations[lang]['trustline-note'], { silent: true });
  safeSetText('#freeze-trustline-note', translations[lang]['freeze-trustline-note'], { silent: true });
  safeSetText('#unfreeze-trustline-note', translations[lang]['unfreeze-trustline-note'], { silent: true });

  // 代币操作部分的选择框和输入框占位文本 - 静默处理
  safeSetText('#issuerSecret option:first-child', translations[lang]['select-issuer-account'], { silent: true });
  safeSetText('#distributorSecret option:first-child', translations[lang]['select-distributor-account'], {
    silent: true,
  });
  safeSetText('#trustlineReceiverSecret option:first-child', translations[lang]['select-receiver-account'], {
    silent: true,
  });
  safeSetText('#trustlineIssuerAddress option:first-child', translations[lang]['select-issuer-address'], {
    silent: true,
  });
  safeSetText('#freezeAccountSecret option:first-child', translations[lang]['select-receiver-account'], {
    silent: true,
  });
  safeSetText('#freezeTrustlineAddress option:first-child', translations[lang]['select-issuer-address'], {
    silent: true,
  });
  safeSetText('#unfreezeAccountSecret option:first-child', translations[lang]['select-receiver-account'], {
    silent: true,
  });
  safeSetText('#unfreezeTrustlineAddress option:first-child', translations[lang]['select-issuer-address'], {
    silent: true,
  });
  safeSetText('#senderSecret option:first-child', translations[lang]['select-sender-account'], { silent: true });
  safeSetText('#receiverAddress option:first-child', translations[lang]['select-receiver-address'], { silent: true });
  safeSetText('#issuerAddress option:first-child', translations[lang]['select-issuer-address'], { silent: true });

  // 添加选择框提示
  document.querySelectorAll('select[data-hint]').forEach((select) => {
    const hintKey = select.getAttribute('data-hint');
    // 删除旧的提示元素（如果有）
    const prevElement = select.previousElementSibling;
    if (prevElement && prevElement.classList.contains('select-hint')) {
      prevElement.remove();
    }
    // 添加新的提示元素到选择框上方
    const hintElement = document.createElement('div');
    hintElement.className = 'select-hint';
    hintElement.textContent = translations[lang][hintKey];
    select.parentNode.insertBefore(hintElement, select);
  });

  // 添加输入框提示
  document.querySelectorAll('input[data-hint]').forEach((input) => {
    const hintKey = input.getAttribute('data-hint');
    // 删除旧的提示元素（如果有）
    const prevElement = input.previousElementSibling;
    if (prevElement && prevElement.classList.contains('input-hint')) {
      prevElement.remove();
    }
    // 添加新的提示元素到输入框上方
    const hintElement = document.createElement('div');
    hintElement.className = 'input-hint';
    hintElement.textContent = translations[lang][hintKey];
    input.parentNode.insertBefore(hintElement, input);
  });

  const placeholderElements = {
    '#trustlineTokenName': 'token-name-placeholder',
    '#trustlineAmount': 'trust-limit-placeholder',
    '#freezeTokenName': 'token-name-placeholder',
    '#unfreezeTokenName': 'token-name-placeholder',
    '#tokenName': 'token-name-placeholder',
    '#issueAmount': 'issue-amount-placeholder',
  };

  Object.entries(placeholderElements).forEach(([selector, translationKey]) => {
    const element = document.querySelector(selector);
    if (element) {
      element.placeholder = translations[lang][translationKey];
    }
  });

  // 代币操作按钮 - 静默处理
  safeSetText('#configure-issuer-btn', translations[lang]['configure-issuer-btn'], { silent: true });
  safeSetText('#configure-distributor-btn', translations[lang]['configure-distributor-btn'], { silent: true });
  safeSetText('#create-trustline-btn', translations[lang]['create-trustline-btn'], { silent: true });
  safeSetText('#freeze-trustline-btn', translations[lang]['freeze-trustline-btn'], { silent: true });
  safeSetText('#unfreeze-trustline-btn', translations[lang]['unfreeze-trustline-btn'], { silent: true });
  safeSetText('#transfer-token-btn', translations[lang]['transfer-token-btn'], { silent: true });

  // 翻译静态hint元素 - 静默处理
  safeSetText('#transfer-rate-hint', translations[lang]['transfer-rate-hint'], { silent: true });
  safeSetText('#estimated-fee-hint', translations[lang]['estimated-fee-hint'], { silent: true });

  // 翻译余额查询部分 - 静默处理
  safeSetText('#balance-inquiry-title', translations[lang]['balance-inquiry'], { silent: true });
  safeSetText('#xrp-balance-query-label', translations[lang]['xrp-balance-query'], { silent: true });
  safeSetText('#token-list-query-label', translations[lang]['token-list-query'], { silent: true });
  safeSetText('#trustlines-query-label', translations[lang]['trustlines-query'], { silent: true });
  safeSetText('#balanceAddress option:first-child', translations[lang]['select-account-or-address'], { silent: true });
  safeSetText('#tokensAddress option:first-child', translations[lang]['select-account-or-address'], { silent: true });
  safeSetText('#trustlinesAddress option:first-child', translations[lang]['select-account-or-address'], {
    silent: true,
  });
  safeSetText('#query-xrp-btn', translations[lang]['query-xrp-btn'], { silent: true });
  safeSetText('#query-tokens-btn', translations[lang]['query-tokens-btn'], { silent: true });
  safeSetText('#query-trustlines-btn', translations[lang]['query-trustlines-btn'], { silent: true });

  // 更新已渲染的账户卡片
  updateAccountCards();

  // 更新下拉列表中的账户文本
  updateSelectMenus();

  // 更新 TransferRate 费率百分比显示（如果函数可用）
  if (window.updateFeePercentageDisplay) {
    window.updateFeePercentageDisplay();
  }

  // 更新配置发行者的 TransferRate 费率百分比显示（如果函数可用）
  if (window.updateIssuerFeePercentageDisplay) {
    window.updateIssuerFeePercentageDisplay();
  }
}

// 更新已渲染的账户卡片的文本
function updateAccountCards() {
  const accounts = getSavedAccounts();
  if (accounts.length === 0) {
    const container = document.getElementById('addressCards');
    if (container && container.querySelector('p')) {
      container.querySelector('p').textContent = translations[currentLang]['no-accounts'];
    }
    return;
  }

  accounts.forEach((account, index) => {
    const card = document.querySelector(`.address-card:nth-child(${index + 1})`);
    if (!card) return;

    // 更新卡片标题
    const titleEl = card.querySelector('h3');
    if (titleEl) {
      titleEl.textContent = `${translations[currentLang]['account-label']} ${index + 1}`;
    }

    // 更新卡片内容标签
    const labels = card.querySelectorAll('.address-info p strong, .balance-info p strong');
    if (labels && labels.length >= 4) {
      labels[0].textContent = `${translations[currentLang]['address']}:`;
      labels[1].textContent = `${translations[currentLang]['secret']}:`;
      labels[2].textContent = `${translations[currentLang]['xrp-balance']}:`;
      labels[3].textContent = `${translations[currentLang]['tokens']}:`;
    }

    // 更新按钮文本
    const buttons = card.querySelectorAll('.address-actions button');
    if (buttons && buttons.length >= 2) {
      buttons[0].textContent = translations[currentLang]['refresh-balance'];
      buttons[1].textContent = translations[currentLang]['fund'];
    }
  });
}

// 从本地存储读取账户
function getSavedAccounts() {
  const accountsJson = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
  return accountsJson ? JSON.parse(accountsJson) : [];
}

// 保存账户到本地存储
function saveAccounts(accounts) {
  localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
}

// 初始化账户显示
function initializeAccountsFromStorage() {
  const accounts = getSavedAccounts();
  renderAccountCards(accounts);
  updateAccountCount();

  // 确保账户卡片翻译成正确的语言
  setTimeout(() => translate(currentLang), 10);
}

// 更新账户数量显示
function updateAccountCount() {
  const accounts = getSavedAccounts();
  const countElement = document.getElementById('accountCount');
  if (countElement) {
    countElement.textContent = accounts.length > 0 ? `(${accounts.length})` : '';
  }
}

// 更新所有选择菜单
function updateSelectMenus() {
  const accounts = getSavedAccounts();
  updateAddressSelects(accounts);
  updateSecretSelects(accounts);
}

// 更新地址选择下拉菜单
function updateAddressSelects(accounts) {
  const addressSelects = document.querySelectorAll('.address-select');
  addressSelects.forEach((select) => {
    // 保存当前选中的值
    const currentValue = select.value;

    // 清除现有选项（保留第一个默认选项）
    while (select.options.length > 1) {
      select.remove(1);
    }

    // 添加账户选项
    accounts.forEach((account, index) => {
      const option = document.createElement('option');
      option.value = account.address;
      option.text = `${translations[currentLang]['account-label']} ${index + 1}: ${account.address}`;
      select.appendChild(option);
    });

    // 如果可能，恢复之前选中的值
    if (currentValue) {
      select.value = currentValue;
    }
  });
}

// 更新密钥选择下拉菜单
function updateSecretSelects(accounts) {
  const secretSelects = document.querySelectorAll('.secret-select');
  secretSelects.forEach((select) => {
    // 保存当前选中的值
    const currentValue = select.value;

    // 清除现有选项（保留第一个默认选项）
    while (select.options.length > 1) {
      select.remove(1);
    }

    // 添加账户选项
    accounts.forEach((account, index) => {
      const option = document.createElement('option');
      option.value = account.secret;
      option.text = `${translations[currentLang]['account-label']} ${index + 1}: ${account.address}`;
      select.appendChild(option);
    });

    // 如果可能，恢复之前选中的值
    if (currentValue) {
      select.value = currentValue;
    }
  });
}

// 渲染账户卡片
function renderAccountCards(accounts) {
  const container = document.getElementById('addressCards');
  container.innerHTML = '';

  if (accounts.length === 0) {
    container.innerHTML = `<p>${translations[currentLang]['no-accounts']}</p>`;
    return;
  }

  accounts.forEach((account, index) => {
    const card = document.createElement('div');
    card.className = 'address-card';
    card.innerHTML = `
      <button class="delete-btn" onclick="deleteAccount(${index})" title="${
      translations[currentLang]['delete-account-confirm'].split('\n')[0]
    }">&times;</button>
      <h3>${translations[currentLang]['account-label']} ${index + 1}</h3>
      <div class="address-info">
        <p>
          <strong>${translations[currentLang]['address']}:</strong>
          <span title="${account.address}" class="code-text">${account.address}</span>
          <button class="copy-btn" onclick="copyToClipboard('${account.address}', this)" title="${
      translations[currentLang]['copy-address']
    }">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
          </button>
        </p>
        <p>
          <strong>${translations[currentLang]['secret']}:</strong>
          <span title="${account.secret}" class="code-text">${account.secret}</span>
          <button class="copy-btn" onclick="copyToClipboard('${account.secret}', this)" title="${
      translations[currentLang]['copy-secret']
    }">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
          </button>
        </p>
      </div>
      <div class="balance-info">
        <p><strong>${translations[currentLang]['xrp-balance']}:</strong> <span id="xrp-balance-${index}">${
      account.xrpBalance || translations[currentLang]['query-failed']
    }</span></p>
        <p><strong>${translations[currentLang]['tokens']}:</strong> <span id="token-balance-${index}">${
      account.tokenBalance || translations[currentLang]['no-tokens']
    }</span></p>
      </div>
      <div class="address-actions">
        <div class="flex-container">
          <button onclick="refreshAccountBalance(${index})" class="flex-1">${
      translations[currentLang]['refresh-balance']
    }</button>
          <button onclick="fundAccountById(${index})" class="btn-secondary flex-1">${
      translations[currentLang]['fund']
    }</button>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

// 复制内容到剪贴板
function copyToClipboard(text, element) {
  navigator.clipboard
    .writeText(text)
    .then(() => {
      // 检查元素是否是按钮
      if (element.classList.contains('copy-btn')) {
        // 是复制按钮
        element.classList.add('copy-success');
        const originalInnerHTML = element.innerHTML;
        element.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;

        // 显示一个小提示
        const tooltip = document.createElement('div');
        tooltip.className = 'copy-tooltip';
        tooltip.textContent = translations[currentLang]['copied'];
        element.appendChild(tooltip);

        setTimeout(() => {
          element.classList.remove('copy-success');
          element.innerHTML = originalInnerHTML;
          if (document.querySelector('.copy-tooltip')) {
            document.querySelector('.copy-tooltip').remove();
          }
        }, 1500);
      } else {
        // 原始的文本元素行为
        const originalText = element.textContent;
        element.textContent = translations[currentLang]['copied'];
        setTimeout(() => {
          element.textContent = originalText;
        }, 1500);
      }
    })
    .catch((err) => {
      console.error(translations[currentLang]['copy-failed'], err);
    });
}

// 生成账户
async function generateAccounts(count) {
  const generateBtn = document.querySelector('button[onclick="generateAccounts(1)"]');
  generateBtn.disabled = true;
  showResult('generateResult', translations[currentLang]['generating-account'], 'loading');

  try {
    const accounts = getSavedAccounts();
    const newAccounts = [];

    for (let i = 0; i < count; i++) {
      const result = await fetchApi('create-account');
      newAccounts.push({
        address: result.address,
        secret: result.secret,
        xrpBalance: null,
        tokenBalance: null,
      });
    }

    // 保存新生成的账户
    saveAccounts([...accounts, ...newAccounts]);

    // 更新UI
    renderAccountCards(getSavedAccounts());
    updateSelectMenus();
    updateAccountCount();

    const newAccount = newAccounts[0];
    const truncatedAddress = `${newAccount.address.substring(0, 8)}...${newAccount.address.substring(
      newAccount.address.length - 6
    )}`;
    showResult(
      'generateResult',
      formatString(translations[currentLang]['account-generated'], truncatedAddress),
      'success'
    );
  } catch (error) {
    showResult('generateResult', formatString(translations[currentLang]['error-generating'], error), 'error');
  } finally {
    generateBtn.disabled = false;
  }
}

// 删除账户
function deleteAccount(index) {
  const accounts = getSavedAccounts();
  if (!accounts[index]) return;

  const accountAddr = accounts[index].address;
  const shortAddr = `${accountAddr.substring(0, 8)}...${accountAddr.substring(accountAddr.length - 6)}`;

  if (confirm(formatString(translations[currentLang]['delete-account-confirm'], index + 1, shortAddr))) {
    accounts.splice(index, 1);
    saveAccounts(accounts);
    renderAccountCards(accounts);
    updateSelectMenus();
    updateAccountCount();

    showResult('generateResult', formatString(translations[currentLang]['account-deleted'], index + 1), 'success');
  }
}

// 刷新单个账户余额
async function refreshAccountBalance(index) {
  const accounts = getSavedAccounts();
  const account = accounts[index];

  if (!account) return;

  // 更新UI指示查询中
  document.getElementById(`xrp-balance-${index}`).textContent = translations[currentLang]['querying'];
  document.getElementById(`token-balance-${index}`).textContent = translations[currentLang]['querying'];

  try {
    // 查询XRP余额
    const balanceResult = await fetchApi('get-balance', { address: account.address });
    accounts[index].xrpBalance = balanceResult.balance;
    document.getElementById(`xrp-balance-${index}`).textContent = balanceResult.balance;

    // 查询代币余额
    const tokensResult = await fetchApi('get-tokens', { address: account.address });
    if (tokensResult.tokens && tokensResult.tokens.length > 0) {
      let tokenOutput = '';
      tokensResult.tokens.forEach((token) => {
        // 使用<br>代替换行符，使代币显示更加整洁
        tokenOutput += `${token.token_name}: ${token.balance}<br>`;
      });
      accounts[index].tokenBalance = tokenOutput;
      document.getElementById(`token-balance-${index}`).innerHTML = tokenOutput;
    } else {
      accounts[index].tokenBalance = null;
      document.getElementById(`token-balance-${index}`).textContent = translations[currentLang]['no-tokens'];
    }

    // 保存更新后的账户信息
    saveAccounts(accounts);
  } catch (error) {
    // 显示更详细的错误信息
    let errorMessage = translations[currentLang]['query-failed'];
    if (error.code) {
      if (error.code === 'BALANCE_ERROR') {
        accounts[index].xrpBalance = null;
        document.getElementById(`xrp-balance-${index}`).textContent = formatString(
          translations[currentLang]['error'],
          error.message
        );
        document.getElementById(`token-balance-${index}`).textContent = translations[currentLang]['query-failed'];
      } else if (error.code === 'TOKENS_ERROR') {
        accounts[index].tokenBalance = null;
        document.getElementById(`token-balance-${index}`).textContent = formatString(
          translations[currentLang]['error'],
          error.message
        );
      } else {
        accounts[index].xrpBalance = null;
        accounts[index].tokenBalance = null;
        document.getElementById(`xrp-balance-${index}`).textContent = translations[currentLang]['query-failed'];
        document.getElementById(`token-balance-${index}`).textContent = translations[currentLang]['query-failed'];
      }
    } else {
      accounts[index].xrpBalance = null;
      accounts[index].tokenBalance = null;
      document.getElementById(`xrp-balance-${index}`).textContent = translations[currentLang]['query-failed'];
      document.getElementById(`token-balance-${index}`).textContent = translations[currentLang]['query-failed'];
    }

    // 即使出错也保存账户状态
    saveAccounts(accounts);
    console.error(translations[currentLang]['refresh-balance-failed'], error);
  }
}

// 刷新所有账户余额
async function refreshAllBalances() {
  const accounts = getSavedAccounts();
  const refreshAllBtn = document.querySelector('button[onclick="refreshAllBalances()"]');
  refreshAllBtn.disabled = true;
  showResult('generateResult', translations[currentLang]['refreshing-all'], 'loading');

  try {
    for (let i = 0; i < accounts.length; i++) {
      showResult(
        'generateResult',
        formatString(translations[currentLang]['refreshing-account'], i + 1, accounts.length),
        'loading'
      );
      try {
        await refreshAccountBalance(i);
      } catch (error) {
        console.error(formatString(translations[currentLang]['refresh-account-balance-failed'], i + 1), error);
      }
    }
    showResult('generateResult', translations[currentLang]['all-refreshed'], 'success');
  } catch (error) {
    showResult(
      'generateResult',
      formatString(translations[currentLang]['refresh-error'], error.message || error),
      'error'
    );
  } finally {
    refreshAllBtn.disabled = false;
  }
}

// 通过ID给账户充值
async function fundAccountById(index) {
  const accounts = getSavedAccounts();
  if (!accounts[index]) return;

  document.getElementById('fundAddress').value = accounts[index].address;
  openTab({ currentTarget: document.querySelector('.tab') }, 'accounts');
  fundAccount();
}

// 打开标签页
function openTab(evt, tabName) {
  var i, tabcontent, tablinks;

  tabcontent = document.getElementsByClassName('tab-content');
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].className = tabcontent[i].className.replace(' active', '');
  }

  tablinks = document.getElementsByClassName('tab');
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(' active', '');
  }

  document.getElementById(tabName).className += ' active';
  evt.currentTarget.className += ' active';

  // 切换标签页后重新应用翻译
  setTimeout(() => translate(currentLang), 10);
}

// API通用函数
async function fetchApi(endpoint, data = {}) {
  const response = await fetch('/api/' + endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const responseData = await response.json();

  if (!response.ok) {
    // 处理详细的错误信息
    const errorMsg = responseData.detail
      ? `${responseData.error}: ${responseData.detail}`
      : `API请求失败: ${response.status}`;

    const error = new Error(errorMsg);
    error.code = responseData.code || 'UNKNOWN_ERROR';
    error.status = response.status;
    throw error;
  }

  return responseData;
}

// 获取XRPL交易浏览器URL
function getXRPLExplorerURL(txHash) {
  // 默认使用DevNet浏览器，如果需要针对不同网络设置不同URL可以进一步扩展
  return `https://devnet.xrpl.org/transactions/${txHash}`;
}

// 显示结果通用函数
function showResult(elementId, message, type = '') {
  const element = document.getElementById(elementId);

  // 检查是否包含交易哈希信息
  const txHashRegex = /交易哈希: ([A-F0-9]+)|Transaction hash: ([A-F0-9]+)|トランザクションハッシュ: ([A-F0-9]+)/;
  const match = message.match(txHashRegex);

  if (match) {
    // 提取交易哈希
    const txHash = match[1] || match[2] || match[3];
    const url = getXRPLExplorerURL(txHash);

    // 根据当前语言选择链接文本
    const viewText = translations[currentLang]['view-transaction'];

    // 创建链接HTML
    const linkHTML = ` <a href="${url}" target="_blank" class="tx-link">${viewText}</a>`;
    const htmlMessage = message.replace(txHash, `${txHash}${linkHTML}`);

    // 使用HTML而不是纯文本
    element.innerHTML = htmlMessage;
  } else {
    // 没有交易哈希，使用普通文本
    element.innerText = message;
  }

  element.className = 'result ' + type;
}

// 账户相关功能
async function fundAccount() {
  const address = document.getElementById('fundAddress').value;
  if (!address) {
    showResult('fundResult', translations[currentLang]['enter-address'], 'error');
    return;
  }

  showResult('fundResult', translations[currentLang]['funding-account'], 'loading');
  try {
    const result = await fetchApi('fund-account', { address });
    showResult('fundResult', translations[currentLang]['funding-success'], 'success');

    // 如果是已保存的账户，自动刷新其余额
    const accounts = getSavedAccounts();
    const accountIndex = accounts.findIndex((acc) => acc.address === address);
    if (accountIndex !== -1) {
      setTimeout(() => {
        refreshAccountBalance(accountIndex);
      }, 5000); // 5秒后刷新余额，给系统处理充值的时间
    }
  } catch (error) {
    const errorMsg = error.message ? error.message : String(error);
    showResult('fundResult', formatString(translations[currentLang]['error'], errorMsg), 'error');
    console.error(translations[currentLang]['fund-failed'], error);
  }
}

// 导出账户
function exportAccounts() {
  const accounts = getSavedAccounts();
  if (accounts.length === 0) {
    showResult('generateResult', translations[currentLang]['no-exportable-accounts'], 'error');
    return;
  }

  // 创建简化的账户数据（只包含地址和密钥）
  const exportData = accounts.map(({ address, secret }) => ({ address, secret }));
  const dataStr = JSON.stringify(exportData, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

  // 创建临时链接并下载
  const exportLink = document.createElement('a');
  exportLink.setAttribute('href', dataUri);
  exportLink.setAttribute('download', 'xrpl_accounts.json');
  document.body.appendChild(exportLink);
  exportLink.click();
  document.body.removeChild(exportLink);

  showResult(
    'generateResult',
    formatString(translations[currentLang]['accounts-exported'], accounts.length),
    'success'
  );
}

// 导入账户
function importAccounts(files) {
  if (!files || files.length === 0) return;

  const file = files[0];
  const reader = new FileReader();

  reader.onload = function (event) {
    try {
      const importData = JSON.parse(event.target.result);
      if (!Array.isArray(importData)) {
        throw new Error(translations[currentLang]['invalid-import-format']);
      }

      const accounts = getSavedAccounts();
      // 过滤掉已存在的账户
      const newAccounts = importData.filter((importAcc) => !accounts.some((acc) => acc.address === importAcc.address));

      if (newAccounts.length === 0) {
        showResult('generateResult', translations[currentLang]['no-importable-accounts'], 'error');
        return;
      }

      // 格式化新账户数据
      const formattedAccounts = newAccounts.map(({ address, secret }) => ({
        address,
        secret,
        xrpBalance: null,
        tokenBalance: null,
      }));

      // 保存合并后的账户列表
      saveAccounts([...accounts, ...formattedAccounts]);
      renderAccountCards(getSavedAccounts());
      updateSelectMenus();
      updateAccountCount();

      showResult(
        'generateResult',
        formatString(translations[currentLang]['accounts-imported'], newAccounts.length),
        'success'
      );
    } catch (error) {
      showResult('generateResult', formatString(translations[currentLang]['import-error'], error.message), 'error');
    }
  };

  reader.readAsText(file);
  // 重置文件输入，允许再次选择相同的文件
  document.getElementById('importFile').value = '';
}

// 代币发行相关功能
async function configureIssuerAccount() {
  const secret = document.getElementById('issuerSecret').value;
  if (!secret) {
    showResult('issuerConfigResult', translations[currentLang]['select-or-enter-secret'], 'error');
    return;
  }

  // 获取参数和标志
  const domain = document.getElementById('issuerDomain').value || 'example.com';
  const options = {
    domain: processDomain(domain),
    transferRate: parseInt(document.getElementById('issuerTransferRate').value) || 0,
    tickSize: parseInt(document.getElementById('issuerTickSize').value) || 0,

    // Transaction Flags (tf)
    setRequireDestTag: document.getElementById('issuerSetRequireDestTag').checked,
    setRequireAuth: document.getElementById('issuerSetRequireAuth').checked,
    setDisallowXRP: document.getElementById('issuerSetDisallowXRP').checked,

    // Account Set Flags (asf)
    setAsfRequireAuth: document.querySelector('input[name="issuerAsfFlag"]:checked').value === 'SetAsfRequireAuth',
    setAsfDefaultRipple: document.querySelector('input[name="issuerAsfFlag"]:checked').value === 'SetAsfDefaultRipple',
    setAsfAllowTrustLineClawback:
      document.querySelector('input[name="issuerAsfFlag"]:checked').value === 'SetAsfAllowTrustLineClawback',
  };

  showResult('issuerConfigResult', translations[currentLang]['configuring-issuer'], 'loading');
  try {
    const result = await fetchApi('configure-issuer', {
      secret,
      options,
    });

    showResult(
      'issuerConfigResult',
      formatString(translations[currentLang]['issuer-configured'], result.txHash),
      'success'
    );

    // 刷新相关账户余额
    refreshRelatedAccount(secret);
  } catch (error) {
    const errorMsg = error.message ? error.message : String(error);
    showResult('issuerConfigResult', formatString(translations[currentLang]['error'], errorMsg), 'error');
    console.error(translations[currentLang]['configure-issuer-failed'], error);
  }
}

async function configureDistributorAccount() {
  const secret = document.getElementById('distributorSecret').value;
  if (!secret) {
    showResult('distributorConfigResult', translations[currentLang]['select-or-enter-secret'], 'error');
    return;
  }

  // 获取参数和标志
  const domain = document.getElementById('distributorDomain').value || 'example.com';
  const options = {
    domain: processDomain(domain),

    // Transaction Flags (tf)
    setRequireDestTag: document.getElementById('distributorSetRequireDestTag').checked,
    setRequireAuth: document.getElementById('distributorSetRequireAuth').checked,
    setDisallowXRP: document.getElementById('distributorSetDisallowXRP').checked,

    // Account Set Flags (asf)
    setAsfRequireAuth: document.querySelector('input[name="distributorAsfFlag"]:checked').value === 'SetAsfRequireAuth',
    setAsfDefaultRipple:
      document.querySelector('input[name="distributorAsfFlag"]:checked').value === 'SetAsfDefaultRipple',
    setAsfAllowTrustLineClawback:
      document.querySelector('input[name="distributorAsfFlag"]:checked').value === 'SetAsfAllowTrustLineClawback',
  };

  showResult('distributorConfigResult', translations[currentLang]['configuring-distributor'], 'loading');
  try {
    const result = await fetchApi('configure-distributor', {
      secret,
      options,
    });

    showResult(
      'distributorConfigResult',
      formatString(translations[currentLang]['distributor-configured'], result.txHash),
      'success'
    );

    // 刷新相关账户余额
    refreshRelatedAccount(secret);
  } catch (error) {
    const errorMsg = error.message ? error.message : String(error);
    showResult('distributorConfigResult', formatString(translations[currentLang]['error'], errorMsg), 'error');
    console.error(translations[currentLang]['configure-distributor-failed'], error);
  }
}

async function createTrustLine() {
  const secret = document.getElementById('trustlineReceiverSecret').value;
  const issuerAddress = document.getElementById('trustlineIssuerAddress').value;
  const tokenName = document.getElementById('trustlineTokenName').value;
  const amount = document.getElementById('trustlineAmount').value;

  if (!secret || !issuerAddress || !tokenName || !amount) {
    showResult('trustlineResult', translations[currentLang]['fill-all-fields'], 'error');
    return;
  }

  const options = {
    issuerAddress,
    tokenName,
    amount,
  };
  showResult('trustlineResult', translations[currentLang]['creating-trustline'], 'loading');
  try {
    const result = await fetchApi('create-trustline', {
      secret,
      options,
    });
    showResult(
      'trustlineResult',
      formatString(translations[currentLang]['trustline-created'], result.txHash),
      'success'
    );

    // 刷新相关账户余额
    refreshRelatedAccount(secret);
  } catch (error) {
    const errorMsg = error.message ? error.message : String(error);
    showResult('trustlineResult', formatString(translations[currentLang]['error'], errorMsg), 'error');
    console.error(translations[currentLang]['create-trustline-failed'], error);
  }
}

// 冻结信任线
async function freezeTrustLine() {
  const secret = document.getElementById('freezeAccountSecret').value;
  const trustlineAddress = document.getElementById('freezeTrustlineAddress').value;
  const tokenName = document.getElementById('freezeTokenName').value;

  if (!secret || !trustlineAddress || !tokenName) {
    showResult('freezeResult', translations[currentLang]['fill-all-fields'], 'error');
    return;
  }

  showResult('freezeResult', translations[currentLang]['freezing-trustline'], 'loading');
  try {
    const result = await fetchApi('freeze-trustline', {
      secret,
      trustlineAddress,
      tokenName,
    });
    showResult('freezeResult', formatString(translations[currentLang]['trustline-frozen'], result.txHash), 'success');

    // 刷新相关账户余额
    refreshRelatedAccount(secret);
  } catch (error) {
    const errorMsg = error.message ? error.message : String(error);
    showResult('freezeResult', formatString(translations[currentLang]['error'], errorMsg), 'error');
    console.error(translations[currentLang]['freeze-trustline-failed'], error);
  }
}

// 解冻信任线
async function unfreezeTrustLine() {
  const secret = document.getElementById('unfreezeAccountSecret').value;
  const trustlineAddress = document.getElementById('unfreezeTrustlineAddress').value;
  const tokenName = document.getElementById('unfreezeTokenName').value;

  if (!secret || !trustlineAddress || !tokenName) {
    showResult('unfreezeResult', translations[currentLang]['fill-all-fields'], 'error');
    return;
  }

  showResult('unfreezeResult', translations[currentLang]['unfreezing-trustline'], 'loading');
  try {
    const result = await fetchApi('unfreeze-trustline', {
      secret,
      trustlineAddress,
      tokenName,
    });
    showResult(
      'unfreezeResult',
      formatString(translations[currentLang]['trustline-unfrozen'], result.txHash),
      'success'
    );

    // 刷新相关账户余额
    refreshRelatedAccount(secret);
  } catch (error) {
    const errorMsg = error.message ? error.message : String(error);
    showResult('unfreezeResult', formatString(translations[currentLang]['error'], errorMsg), 'error');
    console.error(translations[currentLang]['unfreeze-trustline-failed'], error);
  }
}

async function transferToken(operation) {
  const senderSecret = document.getElementById('senderSecret').value;
  const receiverAddress = document.getElementById('receiverAddress').value;
  const issuerAddress = document.getElementById('issuerAddress').value;
  const tokenName = document.getElementById('tokenName').value;
  const amount = document.getElementById('issueAmount').value;
  const transferRate = document.getElementById('transferRate').value || '0';

  if (!senderSecret || !receiverAddress || !issuerAddress || !tokenName || !amount) {
    showResult('issueResult', translations[currentLang]['fill-all-fields'], 'error');
    return;
  }

  // Get calculated sendMax from the global variable set by updateTransferFeeEstimate
  const sendMax = window.calculatedSendMax || amount;

  showResult('issueResult', translations[currentLang]['transferring-token'], 'loading');

  try {
    const result = await fetchApi('transfer-token', {
      senderSecret,
      receiverAddress,
      issuerAddress,
      tokenName,
      amount,
      transferRate,
      sendMax, // Include sendMax in the request
    });

    showResult('issueResult', formatString(translations[currentLang]['token-transferred'], result.txHash), 'success');

    // 刷新发送者和接收者的余额
    refreshRelatedAccount(senderSecret);

    // 如果接收者是我们已保存的账户，也刷新它
    const accounts = getSavedAccounts();
    const receiverIndex = accounts.findIndex((acc) => acc.address === receiverAddress);
    if (receiverIndex !== -1) {
      setTimeout(() => {
        refreshAccountBalance(receiverIndex);
      }, 3000);
    }
  } catch (error) {
    const errorMsg = error.message ? error.message : String(error);
    showResult('issueResult', formatString(translations[currentLang]['error'], errorMsg), 'error');
    console.error(translations[currentLang]['transfer-token-failed'], error);
  }
}

// 通过密钥查找并刷新相关账户
function refreshRelatedAccount(secret) {
  const accounts = getSavedAccounts();
  const accountIndex = accounts.findIndex((acc) => acc.secret === secret);
  if (accountIndex !== -1) {
    setTimeout(() => {
      refreshAccountBalance(accountIndex);
    }, 3000); // 延迟3秒刷新，给交易时间确认
  }
}

// 余额查询功能
async function getBalance() {
  const address = document.getElementById('balanceAddress').value;
  if (!address) {
    showResult('balanceResult', translations[currentLang]['select-or-enter-address'], 'error');
    return;
  }

  showResult('balanceResult', translations[currentLang]['querying-balance'], 'loading');
  try {
    const result = await fetchApi('get-balance', { address });
    showResult('balanceResult', formatString(translations[currentLang]['balance-result'], result.balance), 'success');
  } catch (error) {
    const errorMsg = error.message ? error.message : String(error);
    showResult('balanceResult', formatString(translations[currentLang]['error'], errorMsg), 'error');
    console.error(translations[currentLang]['query-balance-failed'], error);
  }
}

async function getTokens() {
  const address = document.getElementById('tokensAddress').value;
  if (!address) {
    showResult('tokensResult', translations[currentLang]['select-or-enter-address'], 'error');
    return;
  }

  showResult('tokensResult', translations[currentLang]['querying-tokens'], 'loading');
  try {
    const result = await fetchApi('get-tokens', { address });

    if (result.tokens && result.tokens.length > 0) {
      let output = translations[currentLang]['token-list-header'] + '\n\n';

      result.tokens.forEach((token, index) => {
        output += formatString(
          translations[currentLang]['token-item'],
          index + 1,
          token.token_name,
          token.issuer,
          token.balance,
          token.limit
        );
      });

      showResult('tokensResult', output, 'success');
    } else {
      showResult('tokensResult', translations[currentLang]['no-tokens-held'], 'success');
    }
  } catch (error) {
    const errorMsg = error.message ? error.message : String(error);
    showResult('tokensResult', formatString(translations[currentLang]['error'], errorMsg), 'error');
    console.error(translations[currentLang]['query-tokens-failed'], error);
  }
}

async function getTrustlines() {
  const address = document.getElementById('trustlinesAddress').value;
  if (!address) {
    showResult('trustlinesResult', translations[currentLang]['select-or-enter-address'], 'error');
    return;
  }

  showResult('trustlinesResult', translations[currentLang]['querying-trustlines'], 'loading');
  try {
    const result = await fetchApi('get-trustlines', { address });

    if (result.lines && result.lines.length > 0) {
      let output = translations[currentLang]['trustlines-list-header'] + '\n\n';

      result.lines.forEach((trustline, index) => {
        output += formatString(
          translations[currentLang]['trustline-item'],
          index + 1,
          trustline.account,
          trustline.currency,
          trustline.balance,
          trustline.limit,
          trustline.limit_peer,
          trustline.no_ripple ? '是/Yes' : '否/No',
          trustline.authorized ? '是/Yes' : '否/No',
          trustline.freeze ? '是/Yes' : '否/No'
        );
      });

      showResult('trustlinesResult', output, 'success');
    } else {
      showResult('trustlinesResult', translations[currentLang]['no-trustlines'], 'success');
    }
  } catch (error) {
    const errorMsg = error.message ? error.message : String(error);
    showResult('trustlinesResult', formatString(translations[currentLang]['error'], errorMsg), 'error');
    console.error('Query trustlines failed:', error);
  }
}

// 初始化账户配置参数填写器
function initializeAccountConfigSection() {
  // 设置默认值
  document.getElementById('issuerDomain').value = 'example.com';
  document.getElementById('issuerTransferRate').value = '0';
  document.getElementById('issuerTickSize').value = '0';
  document.getElementById('distributorDomain').value = 'example.com';

  // 根据后端函数的默认值设置标志
  // 发行者账户默认标志
  document.getElementById('issuerSetRequireDestTag').checked = false;
  document.getElementById('issuerSetRequireAuth').checked = false;
  document.getElementById('issuerSetDisallowXRP').checked = false;

  // 设置发行者的ASF标志 (根据后端默认值 SetAsfDefaultRipple: true)
  document.querySelector('input[name="issuerAsfFlag"][value="SetAsfDefaultRipple"]').checked = true;

  // 分发者账户默认标志
  document.getElementById('distributorSetRequireDestTag').checked = false;
  document.getElementById('distributorSetRequireAuth').checked = false;
  document.getElementById('distributorSetDisallowXRP').checked = false;

  // 设置分发者的ASF标志 (根据后端默认值 SetAsfRequireAuth: true)
  document.querySelector('input[name="distributorAsfFlag"][value="SetAsfRequireAuth"]').checked = true;

  // 添加输入验证 - 改为失焦后验证
  document.getElementById('issuerTransferRate').addEventListener('blur', function () {
    const value = parseInt(this.value);
    // 只有当输入不为空时才进行验证
    if (this.value.trim() !== '') {
      if (isNaN(value)) {
        alert(translations[currentLang]['invalid-transfer-rate'] || '转账费率必须是有效的数字');
      } else if (value !== 0 && (value < 1000000000 || value > 2000000000)) {
        alert(translations[currentLang]['transfer-rate-range'] || '转账费率必须为0或介于1000000000-2000000000之间');
      }
    }
  });

  document.getElementById('issuerTickSize').addEventListener('blur', function () {
    const value = parseInt(this.value);
    // 只有当输入不为空时才进行验证
    if (this.value.trim() !== '') {
      if (isNaN(value)) {
        alert(translations[currentLang]['invalid-tick-size'] || '报价精度必须是有效的数字');
      } else if (value < 0 || value > 15) {
        alert(translations[currentLang]['tick-size-range'] || '报价精度必须在0-15之间');
      }
    }
  });
}

window.initializeAccountConfigSection = initializeAccountConfigSection;

/**
 * Transfer Rate Fee Percentage Calculator Functions
 *
 * These functions handle the calculation and display of fee percentage
 * from TransferRate values in the XRP Ledger.
 */

// Constants for TransferRate to Fee calculations
const MIN_TRANSFER_RATE = 1000000000; // Represents 0% fee
const MAX_TRANSFER_RATE = 2000000000; // Represents 100% fee
const TRANSFER_RATE_RANGE = MAX_TRANSFER_RATE - MIN_TRANSFER_RATE;

/**
 * Initialize the TransferRate to Fee percentage display functionality
 */
function initializeTransferRateFeeDisplay() {
  // Get the transfer rate input element
  const transferRateInput = document.getElementById('transferRate');
  const feePercentageElement = document.getElementById('transferFeePercentage');

  if (!transferRateInput || !feePercentageElement) {
    console.error(translations[currentLang]['transfer-rate-input-not-found']);
    return;
  }

  // Add event listener for input changes
  transferRateInput.addEventListener('input', updateFeePercentage);

  // Also update when language changes (external function will call this)
  window.updateFeePercentageDisplay = updateFeePercentage;

  // Initialize with current value
  updateFeePercentage();

  /**
   * Updates the fee percentage display based on the current transfer rate input value
   */
  function updateFeePercentage() {
    // Get current language from localStorage
    const currentLang = localStorage.getItem('xrpl_ui_language') || 'zh';
    const transferRate = parseInt(transferRateInput.value || 0);

    if (transferRate === 0) {
      // Special case: 0 means no fee is charged (0%)
      feePercentageElement.textContent = '0%';
      feePercentageElement.classList.remove('high-fee');
      return;
    }

    if (transferRate < MIN_TRANSFER_RATE || transferRate > MAX_TRANSFER_RATE) {
      // Invalid value range - use translation
      feePercentageElement.textContent = translations[currentLang]['invalid-rate'] || 'Invalid';
      feePercentageElement.classList.add('high-fee');
      return;
    }

    // Calculate fee percentage: (transferRate - MIN_TRANSFER_RATE) / TRANSFER_RATE_RANGE * 100
    const feePercentage = ((transferRate - MIN_TRANSFER_RATE) / TRANSFER_RATE_RANGE) * 100;
    const formattedPercentage = feePercentage.toFixed(2);

    // Get translation for "Fee Rate:" prefix if available
    const feeRateLabel = translations[currentLang]['transfer-rate-fee'] || 'Fee Rate:';

    // Display fee percentage
    feePercentageElement.textContent = `${formattedPercentage}%`;

    // Add high-fee class if fee is >= 50%
    if (feePercentage >= 50) {
      feePercentageElement.classList.add('high-fee');
    } else {
      feePercentageElement.classList.remove('high-fee');
    }
  }
}

/**
 * Initialize the TransferRate to Fee percentage display functionality for issuer config
 */
function initializeIssuerTransferRateFeeDisplay() {
  // Get the issuer transfer rate input element
  const issuerTransferRateInput = document.getElementById('issuerTransferRate');
  const issuerFeePercentageElement = document.getElementById('feePercentage');

  if (!issuerTransferRateInput || !issuerFeePercentageElement) {
    console.error(translations[currentLang]['transfer-rate-input-not-found']);
    return;
  }

  // Add event listener for input changes
  issuerTransferRateInput.addEventListener('input', updateIssuerFeePercentage);

  // Also update when language changes (external function will call this)
  window.updateIssuerFeePercentageDisplay = updateIssuerFeePercentage;

  // Initialize with current value
  updateIssuerFeePercentage();

  /**
   * Updates the issuer fee percentage display based on the current transfer rate input value
   */
  function updateIssuerFeePercentage() {
    // Get current language from localStorage
    const currentLang = localStorage.getItem('xrpl_ui_language') || 'zh';
    const transferRate = parseInt(issuerTransferRateInput.value || 0);

    if (transferRate === 0) {
      // Special case: 0 means no fee is charged (0%)
      issuerFeePercentageElement.textContent = '0%';
      issuerFeePercentageElement.classList.remove('high-fee');
      return;
    }

    if (transferRate < MIN_TRANSFER_RATE || transferRate > MAX_TRANSFER_RATE) {
      // Invalid value range - use translation
      issuerFeePercentageElement.textContent = translations[currentLang]['invalid-rate'] || 'Invalid';
      issuerFeePercentageElement.classList.add('high-fee');
      return;
    }

    // Calculate fee percentage: (transferRate - MIN_TRANSFER_RATE) / TRANSFER_RATE_RANGE * 100
    const feePercentage = ((transferRate - MIN_TRANSFER_RATE) / TRANSFER_RATE_RANGE) * 100;
    const formattedPercentage = feePercentage.toFixed(2);

    // Display fee percentage
    issuerFeePercentageElement.textContent = `${formattedPercentage}%`;

    // Add high-fee class if fee is >= 50%
    if (feePercentage >= 50) {
      issuerFeePercentageElement.classList.add('high-fee');
    } else {
      issuerFeePercentageElement.classList.remove('high-fee');
    }
  }
}

/**
 * Initialize the token name display functionality for estimated fee
 */
function initializeTokenNameDisplay() {
  // Get the token name input element
  const tokenNameInput = document.getElementById('tokenName');
  const tokenNameDisplay = document.querySelector('.input-hint .token-name');

  if (!tokenNameInput || !tokenNameDisplay) {
    console.error(translations[currentLang]['token-display-element-not-found']);
    return;
  }

  // Add event listener for input changes
  tokenNameInput.addEventListener('input', updateTokenNameDisplay);

  // Initialize with current value
  updateTokenNameDisplay();

  /**
   * Updates the token name display in the estimated fee section
   */
  function updateTokenNameDisplay() {
    const tokenName = tokenNameInput.value.trim();

    if (tokenName) {
      tokenNameDisplay.textContent = ` ${tokenName}`;
    } else {
      tokenNameDisplay.textContent = '';
    }
  }
}

/**
 * Transfer Rate Form State Management Functions
 *
 * These functions handle the enabling/disabling of Transfer Rate input
 * based on whether sender/receiver addresses match the issuer address.
 */

/**
 * Initialize Transfer Rate form state management
 */
function initializeTransferRateFormState() {
  const senderSecretSelect = document.getElementById('senderSecret');
  const receiverAddressSelect = document.getElementById('receiverAddress');
  const issuerAddressSelect = document.getElementById('issuerAddress');
  const transferRateInput = document.getElementById('transferRate');
  const transferFeePercentageSpan = document.getElementById('transferFeePercentage');
  const transferRateHint = document.getElementById('transfer-rate-hint');

  if (
    !senderSecretSelect ||
    !receiverAddressSelect ||
    !issuerAddressSelect ||
    !transferRateInput ||
    !transferFeePercentageSpan ||
    !transferRateHint
  ) {
    console.error(translations[currentLang]['transfer-rate-form-not-found']);
    return;
  }

  // Create global updateTransferFeeEstimate function
  window.updateTransferFeeEstimate = function () {
    const transferRate = parseInt(transferRateInput.value || 0);
    const amount = parseFloat(document.getElementById('issueAmount').value || 0);
    const transferFeeSpan = document.getElementById('transferFee');

    if (!transferFeeSpan) return;

    if (transferRateInput.disabled || transferRate === 0 || !amount) {
      transferFeeSpan.textContent = '0';
      // Store calculated values for backend use
      window.calculatedSendMax = amount.toString();
      window.calculatedTransferFee = 0;
      return;
    }

    // Calculate estimated fee and sendMax based on transfer rate using BigNumber for precision
    if (transferRate >= 1000000000 && transferRate <= 2000000000) {
      try {
        // Convert to BigNumber for precise calculation
        const amountBN = new BigNumber(amount);
        const transferRateBN = new BigNumber(transferRate);
        const baseBN = new BigNumber(1000000000);

        // Calculate fee: (transferRate - 1000000000) / 1000000000 * amount
        const feeMultiplierBN = transferRateBN.minus(baseBN).dividedBy(baseBN);
        const estimatedFeeBN = amountBN.multipliedBy(feeMultiplierBN);

        // Round up the fee to ensure sufficient amount (to integer)
        const estimatedFeeRounded = estimatedFeeBN.decimalPlaces(0, BigNumber.ROUND_CEIL);

        // Calculate sendMax: amount + fee (total amount sender needs to pay)
        const sendMaxBN = amountBN.plus(estimatedFeeRounded);
        const sendMaxRounded = sendMaxBN.decimalPlaces(0, BigNumber.ROUND_CEIL);

        // Display estimated fee as integer
        transferFeeSpan.textContent = estimatedFeeRounded.toString();

        // Store calculated values for backend use
        window.calculatedSendMax = sendMaxRounded.toString();
        window.calculatedTransferFee = estimatedFeeRounded.toNumber();
      } catch (error) {
        console.error(translations[currentLang]['bignumber-calculation-error'], error);
        // Fallback to original calculation with integer rounding
        const feeMultiplier = (transferRate - 1000000000) / 1000000000;
        const estimatedFee = Math.ceil(amount * feeMultiplier);
        const sendMax = Math.ceil(amount + estimatedFee);

        transferFeeSpan.textContent = estimatedFee.toString();
        window.calculatedSendMax = sendMax.toString();
        window.calculatedTransferFee = estimatedFee;
      }
    } else {
      transferFeeSpan.textContent = '0';
      window.calculatedSendMax = amount.toString();
      window.calculatedTransferFee = 0;
    }
  };

  // Add event listeners to relevant form elements
  senderSecretSelect.addEventListener('change', updateTransferRateFormState);
  receiverAddressSelect.addEventListener('change', updateTransferRateFormState);
  issuerAddressSelect.addEventListener('change', updateTransferRateFormState);

  // Also add listeners specifically for transfer fee estimation
  senderSecretSelect.addEventListener('change', window.updateTransferFeeEstimate);
  receiverAddressSelect.addEventListener('change', window.updateTransferFeeEstimate);
  issuerAddressSelect.addEventListener('change', window.updateTransferFeeEstimate);

  // 初始化发行者转账费率百分比显示功能
  initializeIssuerTransferRateFeeDisplay();

  // 初始化表单状态
  updateTransferRateFormState();

  /**
   * Update Transfer Rate form state based on current address selections
   */
  function updateTransferRateFormState() {
    const currentLang = localStorage.getItem('xrpl_ui_language') || 'zh';
    const senderSecret = senderSecretSelect.value;
    const receiverAddress = receiverAddressSelect.value;
    const issuerAddress = issuerAddressSelect.value;

    // Get sender address from the secret key if available
    let senderAddress = '';
    if (senderSecret) {
      const accounts = getSavedAccounts();
      const senderAccount = accounts.find((acc) => acc.secret === senderSecret);
      if (senderAccount) {
        senderAddress = senderAccount.address;
      } else {
        // Try to get from the dropdown options text (format: "Address (partial)")
        const selectedOption = senderSecretSelect.options[senderSecretSelect.selectedIndex];
        if (selectedOption && selectedOption.textContent) {
          const addressMatch = selectedOption.textContent.match(/([aA1-zZ9]{25,34})/);
          if (addressMatch) {
            senderAddress = addressMatch[1];
          }
        }
      }
    }

    // Check if sender or receiver address matches issuer address
    const isSenderIssuer = senderAddress && issuerAddress && senderAddress === issuerAddress;
    const isReceiverIssuer = receiverAddress && issuerAddress && receiverAddress === issuerAddress;
    const shouldDisableTransferRate = isSenderIssuer || isReceiverIssuer;

    if (shouldDisableTransferRate) {
      // Disable Transfer Rate input and set to 0
      transferRateInput.disabled = true;
      transferRateInput.value = '0';
      transferFeePercentageSpan.textContent = '0%';
      transferFeePercentageSpan.classList.remove('high-fee');

      // Update hint text to indicate it's disabled
      const disabledText =
        translations[currentLang]['transfer-rate-fee-disabled'] || 'Transfer Rate (Disabled - Issuer Transaction)';
      transferRateHint.textContent = disabledText;
      transferRateHint.style.color = '#999';
    } else {
      // Enable Transfer Rate input
      transferRateInput.disabled = false;

      // Restore original hint text
      const originalText = 'Transfer Rate (0, 1000000000-2000000000)';
      transferRateHint.textContent = originalText;
      transferRateHint.style.color = '';
    }

    // Update the estimated fee display
    if (window.updateTransferFeeEstimate) {
      window.updateTransferFeeEstimate();
    }
  }

  // Add event listener to amount input to update fee estimate
  const amountInput = document.getElementById('issueAmount');
  if (amountInput) {
    amountInput.addEventListener('input', window.updateTransferFeeEstimate);
  }

  // Add event listener to transfer rate input to update fee estimate and percentage display
  transferRateInput.addEventListener('input', function () {
    window.updateTransferFeeEstimate();
    // Also update the fee percentage display if function exists
    if (window.updateFeePercentageDisplay) {
      window.updateFeePercentageDisplay();
    }
  });
}

// DOMContentLoaded事件处理
document.addEventListener('DOMContentLoaded', function () {
  // 初始翻译为当前语言
  translate(currentLang);

  // 语言按钮点击事件
  document.querySelectorAll('.language-btn').forEach((btn) => {
    btn.addEventListener('click', function () {
      const lang = this.getAttribute('data-lang');
      translate(lang);
    });
  });

  // 初始化账户和选择菜单
  initializeAccountsFromStorage();
  updateSelectMenus();

  // 初始化账户配置参数填写器
  initializeAccountConfigSection();

  // 初始化 TransferRate 费率百分比显示功能
  initializeTransferRateFeeDisplay();

  // 初始化配置发行者的 TransferRate 费率百分比显示功能
  initializeIssuerTransferRateFeeDisplay();

  // 初始化代币名称更新功能
  initializeTokenNameDisplay();

  // 初始化 Transfer Rate 表单状态管理功能
  initializeTransferRateFormState();
});

// 导出必要的函数到全局作用域，使HTML中的onclick事件能访问这些函数
window.openTab = openTab;
window.generateAccounts = generateAccounts;
window.refreshAllBalances = refreshAllBalances;
window.exportAccounts = exportAccounts;
window.importAccounts = importAccounts;
window.fundAccount = fundAccount;
window.configureIssuerAccount = configureIssuerAccount;
window.configureDistributorAccount = configureDistributorAccount;
window.createTrustLine = createTrustLine;
window.freezeTrustLine = freezeTrustLine;
window.unfreezeTrustLine = unfreezeTrustLine;
window.getBalance = getBalance;
window.getTokens = getTokens;
window.getTrustlines = getTrustlines;
window.deleteAccount = deleteAccount;
window.copyToClipboard = copyToClipboard;
window.refreshAccountBalance = refreshAccountBalance;
window.fundAccountById = fundAccountById;
window.transferToken = transferToken;
