/* ============================================================
   FinControle — app.js
   Controle de entradas, saídas, contas e fluxo de caixa.
   Dados salvos localmente no aparelho (localStorage).
   ============================================================ */
const STORAGE_KEY = 'fincontrole_data_v1';
const DEFAULT_CATEGORIES = {
  income: ['Salário', 'Freelance', 'Vendas', 'Investimentos', 'Outros'],
  expense: ['Moradia', 'Alimentação', 'Transporte', 'Saúde', 'Lazer', 'Educação', 'Contas', 'Outros']
};
/* ---------------- I18N ---------------- */
const I18N = {
  'pt-BR': {
    'aria.settings': 'Ajustes',
    'nav.home': 'Início', 'nav.flow': 'Fluxo', 'nav.accounts': 'Contas', 'nav.settings': 'Ajustes',
    'home.monthBalance': 'Saldo do mês (confirmado)',
    'home.accumulated': 'Saldo acumulado',
    'home.newEntry': 'Novo lançamento',
    'home.today': 'Hoje',
    'home.upcoming': 'Próximos 7 dias',
    'home.projected': 'Previsto no mês (com pendentes): {v}',
    'home.emptyToday': 'Nada previsto para hoje.',
    'home.emptyUpcoming': 'Nada previsto para os próximos dias.',
    'flow.income': 'Entradas', 'flow.expense': 'Saídas', 'flow.balance': 'Saldo',
    'flow.empty': 'Nenhum lançamento neste mês.',
    'accounts.title': 'Minhas contas', 'accounts.new': 'Nova conta',
    'accounts.empty': 'Você ainda não tem contas. Crie a primeira!',
    'settings.title': 'Ajustes',
    'settings.language': 'Idioma', 'settings.theme': 'Tema de cores', 'settings.fontSize': 'Tamanho do texto',
    'settings.notifications': 'Lembretes',
    'settings.enableNotifications': 'Ativar lembretes por notificação',
    'settings.notifOn': 'Lembretes ativados neste aparelho.',
    'settings.notifOff': 'Lembretes desativados.',
    'settings.notifBlocked': 'As notificações foram bloqueadas nas configurações do navegador.',
    'settings.notifHint': 'Funciona melhor com o app aberto ao menos uma vez por dia.',
    'settings.backup': 'Backup dos dados',
    'settings.exportBackup': 'Exportar backup (salvar arquivo)',
    'settings.importBackup': 'Importar backup',
    'settings.backupHint': 'Guarde o arquivo de backup em local seguro. É a única forma de recuperar seus dados se trocar de celular.',
    'modal.newEntry': 'Novo lançamento', 'modal.editEntryTitle': 'Editar lançamento',
    'modal.income': 'Entrada (recebimento)', 'modal.expense': 'Saída (pagamento)',
    'modal.description': 'Descrição', 'modal.invoicedTo': 'Faturado para (cliente)', 'modal.category': 'Categoria', 'modal.amount': 'Valor (R$)', 'modal.account': 'Conta',
    'modal.date': 'Data', 'modal.frequency': 'Frequência', 'modal.endDate': 'Repetir até (opcional)',
    'modal.notes': 'Observações (opcional)', 'modal.delete': 'Excluir', 'modal.save': 'Salvar',
    'modal.entryDetails': 'Detalhes do lançamento', 'modal.editEntry': 'Editar lançamento',
    'modal.confirm': 'Confirmar', 'modal.unconfirm': 'Marcar como pendente',
    'modal.newAccount': 'Nova conta', 'modal.editAccountTitle': 'Editar conta',
    'modal.accountName': 'Nome da conta', 'modal.initialBalance': 'Saldo inicial (R$)',
    'modal.accountColor': 'Cor', 'modal.cancel': 'Cancelar',
    'freq.once': 'Não se repete', 'freq.daily': 'Repete todo dia', 'freq.weekly': 'Repete toda semana',
    'freq.monthly': 'Repete todo mês', 'freq.yearly': 'Repete todo ano',
    'toast.saved': 'Salvo com sucesso.', 'toast.deleted': 'Excluído.',
    'toast.confirmed': 'Marcado como confirmado.', 'toast.unconfirmed': 'Marcado como pendente.',
    'toast.needAccount': 'Crie uma conta antes de lançar.',
    'toast.fillDescription': 'Digite uma descrição.', 'toast.fillAmount': 'Digite um valor maior que zero.',
    'toast.accountInUse': 'Essa conta está em uso em lançamentos. Altere-os antes de excluir.',
    'toast.backupExported': 'Backup salvo. Guarde o arquivo em local seguro.',
    'toast.backupImported': 'Backup importado com sucesso.',
    'toast.backupInvalid': 'Arquivo de backup inválido.',
    'confirm.deleteTransaction': 'Excluir este lançamento? Esta ação não pode ser desfeita.',
    'confirm.deleteAccount': 'Excluir esta conta?',
    'reminder.text': 'Você tem {n} lançamento(s) hoje. Toque para conferir.',
    'today.label': 'Hoje', 'tomorrow.label': 'Amanhã',
    'chart.title': 'Entradas x Saídas',
    'chart.from': 'De', 'chart.to': 'Até',
    'chart.allAccounts': 'Todas as contas',
    'chart.periodBalance': 'Saldo no período: {v}',
    'chart.empty': 'Sem lançamentos confirmados neste período.',
    'chart.income': 'Entradas', 'chart.expense': 'Saídas',
    'rates.dollar': 'Dólar', 'rates.euro': 'Euro',
    'rates.refreshAria': 'Atualizar cotações',
    'rates.updated': 'Cotação atualizada às {time}',
    'rates.cachedNote': 'Sem conexão — mostrando cotação de {time}',
    'rates.unavailable': 'Cotações indisponíveis no momento.',
    'rates.loading': 'Buscando cotações...',
    'settings.lock': 'Bloqueio do app (senha)',
    'lock.hintDisabled': 'Peça uma senha de 4 números toda vez que o app for aberto.',
    'lock.enable': 'Ativar bloqueio com senha',
    'lock.enabledStatus': 'Bloqueio ativado.',
    'lock.change': 'Alterar senha',
    'lock.disable': 'Desativar bloqueio',
    'lock.disableConfirm': 'Desativar o bloqueio por senha?',
    'lock.biometricOn': 'Digital ou rosto: ativado (toque para desativar)',
    'lock.biometricOff': 'Também permitir digital ou rosto',
    'lock.biometricSetupFailed': 'Não foi possível ativar a digital/rosto neste aparelho.',
    'lock.invalidPin': 'Digite uma senha com 4 números.',
    'lock.pinMismatch': 'As senhas digitadas não são iguais.',
    'lock.title': 'Digite sua senha',
    'lock.useBiometric': 'Desbloquear com digital ou rosto',
    'lock.forgot': 'Esqueci minha senha',
    'lock.forgotConfirm': 'Para recuperar o acesso é necessário apagar os dados deste aparelho. Se você tiver um arquivo de backup exportado, poderá importá-lo depois para recuperar as informações. Deseja continuar e apagar os dados agora?',
    'lock.wrongPin': 'Senha incorreta.',
    'lock.biometricFailed': 'Não foi possível desbloquear com digital/rosto. Tente a senha.',
    'lock.setupTitle': 'Criar senha de 4 números',
    'lock.newPin': 'Nova senha (4 números)',
    'lock.confirmPin': 'Confirme a nova senha',
  },
  'es': {
    'aria.settings': 'Ajustes',
    'nav.home': 'Inicio', 'nav.flow': 'Flujo', 'nav.accounts': 'Cuentas', 'nav.settings': 'Ajustes',
    'home.monthBalance': 'Saldo del mes (confirmado)',
    'home.accumulated': 'Saldo acumulado',
    'home.newEntry': 'Nuevo movimiento',
    'home.today': 'Hoy',
    'home.upcoming': 'Próximos 7 días',
    'home.projected': 'Previsto en el mes (con pendientes): {v}',
    'home.emptyToday': 'Nada previsto para hoy.',
    'home.emptyUpcoming': 'Nada previsto para los próximos días.',
    'flow.income': 'Ingresos', 'flow.expense': 'Gastos', 'flow.balance': 'Saldo',
    'flow.empty': 'Ningún movimiento este mes.',
    'accounts.title': 'Mis cuentas', 'accounts.new': 'Nueva cuenta',
    'accounts.empty': 'Todavía no tienes cuentas. ¡Crea la primera!',
    'settings.title': 'Ajustes',
    'settings.language': 'Idioma', 'settings.theme': 'Tema de colores', 'settings.fontSize': 'Tamaño del texto',
    'settings.notifications': 'Recordatorios',
    'settings.enableNotifications': 'Activar recordatorios por notificación',
    'settings.notifOn': 'Recordatorios activados en este dispositivo.',
    'settings.notifOff': 'Recordatorios desactivados.',
    'settings.notifBlocked': 'Las notificaciones fueron bloqueadas en el navegador.',
    'settings.notifHint': 'Funciona mejor si abres la app al menos una vez al día.',
    'settings.backup': 'Copia de seguridad',
    'settings.exportBackup': 'Exportar copia de seguridad (guardar archivo)',
    'settings.importBackup': 'Importar copia de seguridad',
    'settings.backupHint': 'Guarda el archivo en un lugar seguro. Es la única forma de recuperar tus datos si cambias de celular.',
    'modal.newEntry': 'Nuevo movimiento', 'modal.editEntryTitle': 'Editar movimiento',
    'modal.income': 'Ingreso (cobro)', 'modal.expense': 'Gasto (pago)',
    'modal.description': 'Descripción', 'modal.invoicedTo': 'Facturado a (cliente)', 'modal.category': 'Categoría', 'modal.amount': 'Valor (R$)', 'modal.account': 'Cuenta',
    'modal.date': 'Fecha', 'modal.frequency': 'Frecuencia', 'modal.endDate': 'Repetir hasta (opcional)',
    'modal.notes': 'Notas (opcional)', 'modal.delete': 'Eliminar', 'modal.save': 'Guardar',
    'modal.entryDetails': 'Detalles del movimiento', 'modal.editEntry': 'Editar movimiento',
    'modal.confirm': 'Confirmar', 'modal.unconfirm': 'Marcar como pendiente',
    'modal.newAccount': 'Nueva cuenta', 'modal.editAccountTitle': 'Editar cuenta',
    'modal.accountName': 'Nombre de la cuenta', 'modal.initialBalance': 'Saldo inicial (R$)',
    'modal.accountColor': 'Color', 'modal.cancel': 'Cancelar',
    'freq.once': 'No se repite', 'freq.daily': 'Se repite cada día', 'freq.weekly': 'Se repite cada semana',
    'freq.monthly': 'Se repite cada mes', 'freq.yearly': 'Se repite cada año',
    'toast.saved': 'Guardado con éxito.', 'toast.deleted': 'Eliminado.',
    'toast.confirmed': 'Marcado como confirmado.', 'toast.unconfirmed': 'Marcado como pendiente.',
    'toast.needAccount': 'Crea una cuenta antes de registrar un movimiento.',
    'toast.fillDescription': 'Escribe una descripción.', 'toast.fillAmount': 'Escribe un valor mayor que cero.',
    'toast.accountInUse': 'Esta cuenta está en uso. Modifica los movimientos antes de eliminarla.',
    'toast.backupExported': 'Copia guardada. Consérvala en un lugar seguro.',
    'toast.backupImported': 'Copia importada con éxito.',
    'toast.backupInvalid': 'Archivo de copia de seguridad inválido.',
    'confirm.deleteTransaction': '¿Eliminar este movimiento? Esta acción no se puede deshacer.',
    'confirm.deleteAccount': '¿Eliminar esta cuenta?',
    'reminder.text': 'Tienes {n} movimiento(s) hoy. Toca para revisar.',
    'today.label': 'Hoy', 'tomorrow.label': 'Mañana',
    'chart.title': 'Ingresos x Gastos',
    'chart.from': 'Desde', 'chart.to': 'Hasta',
    'chart.allAccounts': 'Todas las cuentas',
    'chart.periodBalance': 'Saldo del período: {v}',
    'chart.empty': 'Sin movimientos confirmados en este período.',
    'chart.income': 'Ingresos', 'chart.expense': 'Gastos',
    'rates.dollar': 'Dólar', 'rates.euro': 'Euro',
    'rates.refreshAria': 'Actualizar cotizaciones',
    'rates.updated': 'Cotización actualizada a las {time}',
    'rates.cachedNote': 'Sin conexión — mostrando cotización de las {time}',
    'rates.unavailable': 'Cotizaciones no disponibles en este momento.',
    'rates.loading': 'Buscando cotizaciones...',
    'settings.lock': 'Bloqueo de la app (contraseña)',
    'lock.hintDisabled': 'Pide una contraseña de 4 números cada vez que se abra la app.',
    'lock.enable': 'Activar bloqueo con contraseña',
    'lock.enabledStatus': 'Bloqueo activado.',
    'lock.change': 'Cambiar contraseña',
    'lock.disable': 'Desactivar bloqueo',
    'lock.disableConfirm': '¿Desactivar el bloqueo por contraseña?',
    'lock.biometricOn': 'Huella o rostro: activado (toca para desactivar)',
    'lock.biometricOff': 'También permitir huella o rostro',
    'lock.biometricSetupFailed': 'No fue posible activar la huella/rostro en este dispositivo.',
    'lock.invalidPin': 'Escribe una contraseña de 4 números.',
    'lock.pinMismatch': 'Las contraseñas no coinciden.',
    'lock.title': 'Escribe tu contraseña',
    'lock.useBiometric': 'Desbloquear con huella o rostro',
    'lock.forgot': 'Olvidé mi contraseña',
    'lock.forgotConfirm': 'Para recuperar el acceso es necesario borrar los datos de este dispositivo. Si tienes un archivo de copia de seguridad exportado, podrás importarlo después para recuperar la información. ¿Deseas continuar y borrar los datos ahora?',
    'lock.wrongPin': 'Contraseña incorrecta.',
    'lock.biometricFailed': 'No fue posible desbloquear con huella/rostro. Intenta con la contraseña.',
    'lock.setupTitle': 'Crear contraseña de 4 números',
    'lock.newPin': 'Nueva contraseña (4 números)',
    'lock.confirmPin': 'Confirma la nueva contraseña',
  },
  'en': {
    'aria.settings': 'Settings',
    'nav.home': 'Home', 'nav.flow': 'Cash Flow', 'nav.accounts': 'Accounts', 'nav.settings': 'Settings',
    'home.monthBalance': 'Month balance (confirmed)',
    'home.accumulated': 'Accumulated balance',
    'home.newEntry': 'New entry',
    'home.today': 'Today',
    'home.upcoming': 'Next 7 days',
    'home.projected': 'Projected for the month (with pending): {v}',
    'home.emptyToday': 'Nothing scheduled for today.',
    'home.emptyUpcoming': 'Nothing scheduled for the next few days.',
    'flow.income': 'Income', 'flow.expense': 'Expenses', 'flow.balance': 'Balance',
    'flow.empty': 'No entries this month.',
    'accounts.title': 'My accounts', 'accounts.new': 'New account',
    'accounts.empty': "You don't have any accounts yet. Create the first one!",
    'settings.title': 'Settings',
    'settings.language': 'Language', 'settings.theme': 'Color theme', 'settings.fontSize': 'Text size',
    'settings.notifications': 'Reminders',
    'settings.enableNotifications': 'Enable notification reminders',
    'settings.notifOn': 'Reminders enabled on this device.',
    'settings.notifOff': 'Reminders disabled.',
    'settings.notifBlocked': 'Notifications were blocked in the browser settings.',
    'settings.notifHint': 'Works best if you open the app at least once a day.',
    'settings.backup': 'Data backup',
    'settings.exportBackup': 'Export backup (save file)',
    'settings.importBackup': 'Import backup',
    'settings.backupHint': 'Keep the backup file somewhere safe. It is the only way to recover your data if you change phones.',
    'modal.newEntry': 'New entry', 'modal.editEntryTitle': 'Edit entry',
    'modal.income': 'Income (money in)', 'modal.expense': 'Expense (money out)',
    'modal.description': 'Description', 'modal.invoicedTo': 'Invoiced to (client)', 'modal.category': 'Category', 'modal.amount': 'Amount (R$)', 'modal.account': 'Account',
    'modal.date': 'Date', 'modal.frequency': 'Frequency', 'modal.endDate': 'Repeat until (optional)',
    'modal.notes': 'Notes (optional)', 'modal.delete': 'Delete', 'modal.save': 'Save',
    'modal.entryDetails': 'Entry details', 'modal.editEntry': 'Edit entry',
    'modal.confirm': 'Confirm', 'modal.unconfirm': 'Mark as pending',
    'modal.newAccount': 'New account', 'modal.editAccountTitle': 'Edit account',
    'modal.accountName': 'Account name', 'modal.initialBalance': 'Initial balance (R$)',
    'modal.accountColor': 'Color', 'modal.cancel': 'Cancel',
    'freq.once': "Doesn't repeat", 'freq.daily': 'Repeats every day', 'freq.weekly': 'Repeats every week',
    'freq.monthly': 'Repeats every month', 'freq.yearly': 'Repeats every year',
    'toast.saved': 'Saved successfully.', 'toast.deleted': 'Deleted.',
    'toast.confirmed': 'Marked as confirmed.', 'toast.unconfirmed': 'Marked as pending.',
    'toast.needAccount': 'Create an account before adding an entry.',
    'toast.fillDescription': 'Enter a description.', 'toast.fillAmount': 'Enter an amount greater than zero.',
    'toast.accountInUse': 'This account is used in entries. Change them before deleting it.',
    'toast.backupExported': 'Backup saved. Keep the file somewhere safe.',
    'toast.backupImported': 'Backup imported successfully.',
    'toast.backupInvalid': 'Invalid backup file.',
    'confirm.deleteTransaction': 'Delete this entry? This cannot be undone.',
    'confirm.deleteAccount': 'Delete this account?',
    'reminder.text': 'You have {n} entrie(s) today. Tap to review.',
    'today.label': 'Today', 'tomorrow.label': 'Tomorrow',
    'chart.title': 'Income x Expenses',
    'chart.from': 'From', 'chart.to': 'To',
    'chart.allAccounts': 'All accounts',
    'chart.periodBalance': 'Period balance: {v}',
    'chart.empty': 'No confirmed entries in this period.',
    'chart.income': 'Income', 'chart.expense': 'Expenses',
    'rates.dollar': 'Dollar', 'rates.euro': 'Euro',
    'rates.refreshAria': 'Refresh exchange rates',
    'rates.updated': 'Rate updated at {time}',
    'rates.cachedNote': 'Offline — showing rate from {time}',
    'rates.unavailable': 'Exchange rates unavailable right now.',
    'rates.loading': 'Fetching rates...',
    'settings.lock': 'App lock (passcode)',
    'lock.hintDisabled': 'Require a 4-digit passcode every time the app is opened.',
    'lock.enable': 'Enable passcode lock',
    'lock.enabledStatus': 'Lock enabled.',
    'lock.change': 'Change passcode',
    'lock.disable': 'Disable lock',
    'lock.disableConfirm': 'Disable the passcode lock?',
    'lock.biometricOn': 'Fingerprint or face: on (tap to turn off)',
    'lock.biometricOff': 'Also allow fingerprint or face',
    'lock.biometricSetupFailed': 'Could not set up fingerprint/face on this device.',
    'lock.invalidPin': 'Enter a 4-digit passcode.',
    'lock.pinMismatch': 'The passcodes do not match.',
    'lock.title': 'Enter your passcode',
    'lock.useBiometric': 'Unlock with fingerprint or face',
    'lock.forgot': 'Forgot passcode',
    'lock.forgotConfirm': "To recover access you need to erase this device's data. If you have an exported backup file, you can import it afterwards to restore your information. Continue and erase the data now?",
    'lock.wrongPin': 'Incorrect passcode.',
    'lock.biometricFailed': 'Could not unlock with fingerprint/face. Try the passcode.',
    'lock.setupTitle': 'Create a 4-digit passcode',
    'lock.newPin': 'New passcode (4 digits)',
    'lock.confirmPin': 'Confirm new passcode',
  }
};
const MONTHS = {
  'pt-BR': ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'],
  'es': ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'],
  'en': ['January','February','March','April','May','June','July','August','September','October','November','December']
};
const WEEKDAY_FULL = {
  'pt-BR': ['domingo','segunda-feira','terça-feira','quarta-feira','quinta-feira','sexta-feira','sábado'],
  'es': ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'],
  'en': ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
};
const LOCALE_MAP = { 'pt-BR': 'pt-BR', 'es': 'es-ES', 'en': 'en-US' };
const THEMES = [
  { id: 'classico', swatch: ['#1F4D3D', '#C69B3D'] },
  { id: 'noite', swatch: ['#1B2531', '#E0B84B'] },
  { id: 'lilas', swatch: ['#6C4A85', '#D89A57'] },
  { id: 'contraste', swatch: ['#000000', '#F5D93A'] },
];
const ACCOUNT_COLORS = ['#1F4D3D','#C69B3D','#3E7CB1','#B14E4E','#6C4A85','#3D8361','#A94B33','#5B6B63','#2E6E57','#8A64A4','#E0B84B','#21302B'];
/* ---------------- STATE ---------------- */
let state = loadState();
let ui = {
  currentView: 'inicio',
  homeMonth: startOfMonth(new Date()),
  fluxoMonth: startOfMonth(new Date()),
  editingTransactionId: null,
  currentType: 'income',
  editingAccountId: null,
  selectedAccountColor: ACCOUNT_COLORS[0],
  occContext: null, // { transactionId, dateISO }
  pendingDeleteAction: null,
  chart: { start: null, end: null, accountFilter: 'all' }, // accountFilter: 'all' | [ids]
  rates: { data: null, fresh: false },
};
function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return Object.assign(defaultState(), parsed);
    }
  } catch (e) { console.error('Erro ao carregar dados', e); }
  return defaultState();
}
function defaultState() {
  return {
    accounts: [],
    transactions: [],
    overrides: {},
    categories: { income: [], expense: [] },
    settings: { language: detectLanguage(), theme: 'classico', fontScale: 1, notificationsEnabled: false }
  };
}
function detectLanguage() {
  const nav = (navigator.language || 'pt-BR').toLowerCase();
  if (nav.startsWith('es')) return 'es';
  if (nav.startsWith('en')) return 'en';
  return 'pt-BR';
}
function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
function t(key, vars) {
  const lang = state.settings.language || 'pt-BR';
  let str = (I18N[lang] && I18N[lang][key]) || I18N['pt-BR'][key] || key;
  if (vars) {
    Object.keys(vars).forEach((k) => { str = str.replace(`{${k}}`, vars[k]); });
  }
  return str;
}
function uid() {
  return 'id' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
/* ---------------- DATE HELPERS ---------------- */
function todayDate() { const d = new Date(); d.setHours(0,0,0,0); return d; }
function todayISO() { return formatISO(todayDate()); }
function parseISO(iso) { const [y,m,d] = iso.split('-').map(Number); return new Date(y, m-1, d); }
function formatISO(date) {
  const y = date.getFullYear(), m = String(date.getMonth()+1).padStart(2,'0'), d = String(date.getDate()).padStart(2,'0');
  return `${y}-${m}-${d}`;
}
function startOfMonth(date) { return new Date(date.getFullYear(), date.getMonth(), 1); }
function endOfMonth(date) { return new Date(date.getFullYear(), date.getMonth()+1, 0); }
function addMonths(date, n) { return new Date(date.getFullYear(), date.getMonth()+n, 1); }
function addDays(date, n) { const d = new Date(date); d.setDate(d.getDate()+n); return d; }
function daysInMonth(year, monthIdx0) { return new Date(year, monthIdx0+1, 0).getDate(); }
function monthKey(date) { return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}`; }
function isSameDay(a,b){ return a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate(); }
function getMonthLabel(date) {
  const lang = state.settings.language;
  const name = MONTHS[lang][date.getMonth()];
  return `${name} ${date.getFullYear()}`;
}
function formatCurrency(value) {
  const lang = state.settings.language || 'pt-BR';
  try {
    return new Intl.NumberFormat(LOCALE_MAP[lang] || 'pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
  } catch (e) {
    return 'R$ ' + (value || 0).toFixed(2);
  }
}
function parseAmountInput(str) {
  if (!str) return 0;
  let s = String(str).trim();
  s = s.replace(/[^0-9,.\-]/g, '');
  // if both , and . present, assume . is thousand sep and , is decimal (pt-BR style)
  if (s.includes(',') && s.includes('.')) {
    s = s.replace(/\./g, '').replace(',', '.');
  } else if (s.includes(',')) {
    s = s.replace(',', '.');
  }
  const v = parseFloat(s);
  return isNaN(v) ? 0 : v;
}
/* ---------------- RECURRENCE ENGINE ---------------- */
// Returns array of Date objects (occurrence dates) for a transaction within [rangeStart, rangeEnd] inclusive.
function getOccurrencesInRange(txn, rangeStart, rangeEnd) {
  const results = [];
  const txnStart = parseISO(txn.date);
  const hardEnd = txn.endDate ? parseISO(txn.endDate) : null;
  const effectiveEnd = hardEnd && hardEnd < rangeEnd ? hardEnd : rangeEnd;
  if (txnStart > effectiveEnd) return results;
  if (txn.frequency === 'once') {
    if (txnStart >= rangeStart && txnStart <= effectiveEnd) results.push(new Date(txnStart));
    return results;
  }
  if (txn.frequency === 'daily') {
    let cur = txnStart > rangeStart ? new Date(txnStart) : new Date(rangeStart);
    while (cur <= effectiveEnd) {
      if (cur >= txnStart) results.push(new Date(cur));
      cur = addDays(cur, 1);
    }
    return results;
  }
  if (txn.frequency === 'weekly') {
    let cur = new Date(txnStart);
    // fast-forward close to rangeStart
    if (cur < rangeStart) {
      const diffDays = Math.floor((rangeStart - cur) / 86400000);
      const weeks = Math.floor(diffDays / 7);
      cur = addDays(cur, weeks * 7);
    }
    while (cur < rangeStart) cur = addDays(cur, 7);
    while (cur <= effectiveEnd) {
      results.push(new Date(cur));
      cur = addDays(cur, 7);
    }
    return results;
  }
  if (txn.frequency === 'monthly') {
    const day = txnStart.getDate();
    let cursor = new Date(rangeStart.getFullYear(), rangeStart.getMonth(), 1);
    const endCursor = new Date(effectiveEnd.getFullYear(), effectiveEnd.getMonth(), 1);
    while (cursor <= endCursor) {
      const dim = daysInMonth(cursor.getFullYear(), cursor.getMonth());
      const occDate = new Date(cursor.getFullYear(), cursor.getMonth(), Math.min(day, dim));
      if (occDate >= txnStart && occDate >= rangeStart && occDate <= effectiveEnd) {
        results.push(occDate);
      }
      cursor = addMonths(cursor, 1);
    }
    return results;
  }
  if (txn.frequency === 'yearly') {
    const month = txnStart.getMonth(), day = txnStart.getDate();
    for (let y = rangeStart.getFullYear(); y <= effectiveEnd.getFullYear(); y++) {
      const dim = daysInMonth(y, month);
      const occDate = new Date(y, month, Math.min(day, dim));
      if (occDate >= txnStart && occDate >= rangeStart && occDate <= effectiveEnd) {
        results.push(occDate);
      }
    }
    return results;
  }
  return results;
}
function overrideKey(transactionId, dateISO) { return `${transactionId}_${dateISO}`; }
function getOverride(transactionId, dateISO) { return state.overrides[overrideKey(transactionId, dateISO)] || null; }
function getOccStatus(transactionId, dateISO) { const o = getOverride(transactionId, dateISO); return (o && o.status) || 'pending'; }
function getOccAccountId(txn, dateISO) { const o = getOverride(txn.id, dateISO); return (o && o.accountId) || txn.accountId; }
function getOccAmount(txn, dateISO) { const o = getOverride(txn.id, dateISO); return (o && typeof o.amount === 'number') ? o.amount : txn.amount; }
function buildOccurrenceObjects(rangeStart, rangeEnd) {
  const list = [];
  state.transactions.forEach((txn) => {
    const dates = getOccurrencesInRange(txn, rangeStart, rangeEnd);
    dates.forEach((d) => {
      const iso = formatISO(d);
      list.push({
        transactionId: txn.id,
        date: iso,
        dateObj: d,
        type: txn.type,
        description: txn.description,
        category: txn.category || 'Outros',
        invoicedTo: txn.invoicedTo || '',
        amount: getOccAmount(txn, iso),
        accountId: getOccAccountId(txn, iso),
        status: getOccStatus(txn.id, iso),
        frequency: txn.frequency,
      });
    });
  });
  list.sort((a,b) => a.date.localeCompare(b.date));
  return list;
}
function computeMonthTotals(monthDate) {
  const start = startOfMonth(monthDate), end = endOfMonth(monthDate);
  const occs = buildOccurrenceObjects(start, end);
  let incomeConfirmed=0, expenseConfirmed=0, incomeAll=0, expenseAll=0;
  occs.forEach((o) => {
    if (o.type === 'income') {
      incomeAll += o.amount;
      if (o.status === 'confirmed') incomeConfirmed += o.amount;
    } else {
      expenseAll += o.amount;
      if (o.status === 'confirmed') expenseConfirmed += o.amount;
    }
  });
  return { incomeConfirmed, expenseConfirmed, incomeAll, expenseAll,
    balanceConfirmed: incomeConfirmed - expenseConfirmed, balanceAll: incomeAll - expenseAll };
}
function getEarliestMonth() {
  if (state.transactions.length === 0) return startOfMonth(new Date());
  let min = null;
  state.transactions.forEach((t) => {
    const d = startOfMonth(parseISO(t.date));
    if (!min || d < min) min = d;
  });
  return min;
}
function computeAccumulated(monthDate) {
  const earliest = getEarliestMonth();
  let cursor = new Date(earliest);
  let total = 0;
  const target = startOfMonth(monthDate);
  let safety = 0;
  while (cursor <= target && safety < 2400) {
    const totals = computeMonthTotals(cursor);
    total += totals.balanceConfirmed;
    cursor = addMonths(cursor, 1);
    safety++;
  }
  return total;
}
function computeAccountBalance(accountId) {
  const account = state.accounts.find((a) => a.id === accountId);
  if (!account) return 0;
  let total = account.initialBalance || 0;
  // scan a wide range: from earliest month to 2 years ahead, only confirmed matter
  const earliest = getEarliestMonth();
  const farFuture = addMonths(startOfMonth(new Date()), 24);
  const occs = buildOccurrenceObjects(earliest, farFuture);
  occs.forEach((o) => {
    if (o.status !== 'confirmed') return;
    if (o.accountId !== accountId) return;
    total += o.type === 'income' ? o.amount : -o.amount;
  });
  return total;
}
function isAccountInUse(accountId) {
  if (state.transactions.some((t) => t.accountId === accountId)) return true;
  return Object.values(state.overrides).some((o) => o.accountId === accountId);
}
/* ---------------- COTAÇÕES (Dólar / Euro) ---------------- */
const RATES_CACHE_KEY = 'fincontrole_rates_cache_v1';
const RATES_API_URL = 'https://economia.awesomeapi.com.br/json/last/USD-BRL,EUR-BRL';
function formatTime(timestampMs) {
  const lang = state.settings.language || 'pt-BR';
  try {
    return new Date(timestampMs).toLocaleTimeString(LOCALE_MAP[lang] || 'pt-BR', { hour: '2-digit', minute: '2-digit' });
  } catch (e) {
    return new Date(timestampMs).toTimeString().slice(0,5);
  }
}
function renderRates(data, isFresh) {
  const usdEl = document.getElementById('rateUSDValue');
  const eurEl = document.getElementById('rateEURValue');
  const usdArrow = document.getElementById('rateUSDArrow');
  const eurArrow = document.getElementById('rateEURArrow');
  const caption = document.getElementById('ratesCaption');
  if (!data) {
    usdEl.textContent = '—';
    eurEl.textContent = '—';
    usdArrow.textContent = ''; eurArrow.textContent = '';
    caption.textContent = t('rates.unavailable');
    return;
  }
  usdEl.textContent = formatCurrency(data.usd);
  eurEl.textContent = formatCurrency(data.eur);
  setArrow(usdArrow, data.usdChange);
  setArrow(eurArrow, data.eurChange);
  const timeStr = formatTime(data.timestamp);
  caption.textContent = isFresh ? t('rates.updated', { time: timeStr }) : t('rates.cachedNote', { time: timeStr });
}
function setArrow(el, change) {
  el.classList.remove('up', 'down');
  if (typeof change !== 'number' || isNaN(change) || change === 0) { el.textContent = ''; return; }
  if (change > 0) { el.textContent = '▲'; el.classList.add('up'); }
  else { el.textContent = '▼'; el.classList.add('down'); }
}
async function fetchExchangeRates() {
  const caption = document.getElementById('ratesCaption');
  caption.textContent = t('rates.loading');
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(RATES_API_URL, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (!res.ok) throw new Error('bad response');
    const json = await res.json();
    const data = {
      usd: parseFloat(json.USDBRL.bid),
      usdChange: parseFloat(json.USDBRL.pctChange),
      eur: parseFloat(json.EURBRL.bid),
      eurChange: parseFloat(json.EURBRL.pctChange),
      timestamp: Date.now()
    };
    localStorage.setItem(RATES_CACHE_KEY, JSON.stringify(data));
    ui.rates = { data, fresh: true };
    renderRates(data, true);
  } catch (e) {
    let cached = null;
    try { cached = JSON.parse(localStorage.getItem(RATES_CACHE_KEY)); } catch (e2) { /* ignore */ }
    ui.rates = { data: cached, fresh: false };
    renderRates(cached, false);
  }
}
/* ---------------- TOAST ---------------- */
let toastTimer = null;
function showToast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.add('hidden'), 2600);
}
/* ---------------- CONFIRM DIALOG ---------------- */
function askConfirm(message, onOk) {
  document.getElementById('confirmMessage').textContent = message;
  ui.pendingDeleteAction = onOk;
  document.getElementById('modalConfirm').classList.remove('hidden');
}
/* ---------------- RENDER: NAV / VIEWS ---------------- */
function switchView(view) {
  ui.currentView = view;
  document.querySelectorAll('.view').forEach((v) => v.classList.add('hidden'));
  document.getElementById(`view-${view}`).classList.remove('hidden');
  document.querySelectorAll('.nav-btn').forEach((b) => b.classList.toggle('active', b.dataset.view === view));
  renderAll();
}
function renderHeader() {
  const lang = state.settings.language;
  const d = new Date();
  const weekday = WEEKDAY_FULL[lang][d.getDay()];
  const label = `${capitalize(weekday)}, ${d.getDate()} ${t('of') || 'de'} ${MONTHS[lang][d.getMonth()]}`;
  document.getElementById('headerDate').textContent = lang === 'en' ? `${capitalize(weekday)}, ${MONTHS.en[d.getMonth()]} ${d.getDate()}` : label;
}
function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
function renderReminderBanner() {
  const iso = todayISO();
  const occs = buildOccurrenceObjects(todayDate(), todayDate()).filter((o) => o.status === 'pending');
  const banner = document.getElementById('reminderBanner');
  if (occs.length > 0) {
    banner.textContent = t('reminder.text', { n: occs.length });
    banner.classList.remove('hidden');
    banner.onclick = () => switchView('inicio');
  } else {
    banner.classList.add('hidden');
  }
}
/* ---------------- CHART (Entradas x Saídas) ---------------- */
function initChartDefaults() {
  if (!ui.chart.start || !ui.chart.end) {
    const now = new Date();
    ui.chart.start = formatISO(startOfMonth(now));
    ui.chart.end = formatISO(endOfMonth(now));
  }
}
function renderChartControls() {
  document.getElementById('chartStartDate').value = ui.chart.start;
  document.getElementById('chartEndDate').value = ui.chart.end;
  const wrap = document.getElementById('chartAccountChips');
  wrap.innerHTML = '';
  const allChip = document.createElement('button');
  allChip.className = 'chip' + (ui.chart.accountFilter === 'all' ? ' selected' : '');
  allChip.textContent = t('chart.allAccounts');
  allChip.addEventListener('click', () => {
    ui.chart.accountFilter = 'all';
    renderChartControls();
    renderChart();
  });
  wrap.appendChild(allChip);
  state.accounts.forEach((acc) => {
    const chip = document.createElement('button');
    const isSelected = ui.chart.accountFilter !== 'all' && ui.chart.accountFilter.includes(acc.id);
    chip.className = 'chip' + (isSelected ? ' selected' : '');
    const dot = document.createElement('span');
    dot.className = 'chip-dot';
    dot.style.background = acc.color;
    chip.appendChild(dot);
    chip.appendChild(document.createTextNode(acc.name));
    chip.addEventListener('click', () => {
      if (ui.chart.accountFilter === 'all') {
        ui.chart.accountFilter = [acc.id];
      } else if (ui.chart.accountFilter.includes(acc.id)) {
        const remaining = ui.chart.accountFilter.filter((id) => id !== acc.id);
        ui.chart.accountFilter = remaining.length ? remaining : 'all';
      } else {
        ui.chart.accountFilter = [...ui.chart.accountFilter, acc.id];
      }
      renderChartControls();
      renderChart();
    });
    wrap.appendChild(chip);
  });
}
function renderChart() {
  const startVal = document.getElementById('chartStartDate').value || ui.chart.start;
  const endVal = document.getElementById('chartEndDate').value || ui.chart.end;
  ui.chart.start = startVal;
  ui.chart.end = endVal;
  const rangeStart = parseISO(startVal);
  const rangeEnd = parseISO(endVal);
  const container = document.getElementById('chartVisual');
  const balanceEl = document.getElementById('chartPeriodBalance');
  if (rangeStart > rangeEnd) {
    container.innerHTML = `<div class="chart-empty-hint">${t('chart.empty')}</div>`;
    balanceEl.textContent = '';
    return;
  }
  const occs = buildOccurrenceObjects(rangeStart, rangeEnd).filter((o) => o.status === 'confirmed');
  const filtered = ui.chart.accountFilter === 'all'
    ? occs
    : occs.filter((o) => ui.chart.accountFilter.includes(o.accountId));
  let income = 0, expense = 0;
  filtered.forEach((o) => { if (o.type === 'income') income += o.amount; else expense += o.amount; });
  if (income === 0 && expense === 0) {
    container.innerHTML = `<div class="chart-empty-hint">${t('chart.empty')}</div>`;
    balanceEl.textContent = '';
    return;
  }
  const max = Math.max(income, expense, 1);
  const incomePct = Math.max(4, Math.round((income / max) * 100));
  const expensePct = Math.max(4, Math.round((expense / max) * 100));
  const incomeColor = getComputedStyle(document.body).getPropertyValue('--income').trim();
  const expenseColor = getComputedStyle(document.body).getPropertyValue('--expense').trim();
  const svg = `
    <svg viewBox="0 0 300 130" width="100%" height="150" role="img" aria-label="${t('chart.title')}">
      <text x="4" y="14" font-size="11" font-weight="700" fill="${incomeColor}">${t('chart.income')}</text>
      <rect x="4" y="20" width="${2.7 * incomePct}" height="26" rx="6" fill="${incomeColor}"></rect>
      <text x="${10 + 2.7 * incomePct}" y="38" font-size="12" font-weight="800" fill="${incomeColor}">${escapeXml(formatCurrency(income))}</text>
      <text x="4" y="72" font-size="11" font-weight="700" fill="${expenseColor}">${t('chart.expense')}</text>
      <rect x="4" y="78" width="${2.7 * expensePct}" height="26" rx="6" fill="${expenseColor}"></rect>
      <text x="${10 + 2.7 * expensePct}" y="96" font-size="12" font-weight="800" fill="${expenseColor}">${escapeXml(formatCurrency(expense))}</text>
    </svg>`;
  container.innerHTML = svg;
  balanceEl.textContent = t('chart.periodBalance', { v: formatCurrency(income - expense) });
  balanceEl.style.color = (income - expense) < 0 ? expenseColor : '';
}
function escapeXml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
/* ---------------- RENDER: HOME ---------------- */
function renderHome() {
  initChartDefaults();
  renderChartControls();
  renderChart();
  document.getElementById('homeMonthLabel').textContent = getMonthLabel(ui.homeMonth);
  const totals = computeMonthTotals(ui.homeMonth);
  document.getElementById('monthBalanceValue').textContent = formatCurrency(totals.balanceConfirmed);
  document.getElementById('monthBalanceValue').style.color = totals.balanceConfirmed < 0 ? 'var(--expense)' : '';
  const projectedEl = document.getElementById('monthProjectedValue');
  if (totals.balanceAll !== totals.balanceConfirmed) {
    projectedEl.textContent = t('home.projected', { v: formatCurrency(totals.balanceAll) });
  } else {
    projectedEl.textContent = '';
  }
  document.getElementById('accumulatedValue').textContent = formatCurrency(computeAccumulated(ui.homeMonth));
  // Today list (always real "today", independent of homeMonth navigation)
  const todayOccs = buildOccurrenceObjects(todayDate(), todayDate());
  renderEntryList('todayList', todayOccs, t('home.emptyToday'));
  // Upcoming 7 days (excluding today)
  const upcomingStart = addDays(todayDate(), 1);
  const upcomingEnd = addDays(todayDate(), 7);
  const upcomingOccs = buildOccurrenceObjects(upcomingStart, upcomingEnd).filter((o) => o.status === 'pending');
  renderEntryList('upcomingList', upcomingOccs, t('home.emptyUpcoming'), true);
}
function renderEntryList(elementId, occs, emptyMsg, showDate) {
  const ul = document.getElementById(elementId);
  ul.innerHTML = '';
  if (occs.length === 0) {
    const li = document.createElement('li');
    li.className = 'empty-hint';
    li.textContent = emptyMsg;
    ul.appendChild(li);
    return;
  }
  occs.forEach((o) => ul.appendChild(buildEntryItem(o, showDate)));
}
function buildEntryItem(o, showDate) {
  const li = document.createElement('li');
  li.className = 'entry-item' + (o.status === 'confirmed' ? ' confirmed' : '');
  const account = state.accounts.find((a) => a.id === o.accountId);
  const dot = document.createElement('div');
  dot.className = `entry-dot ${o.type}`;
  const info = document.createElement('div');
  info.className = 'entry-info';
  const desc = document.createElement('div');
  desc.className = 'entry-desc';
  desc.textContent = o.description;
  const meta = document.createElement('div');
  meta.className = 'entry-meta';
  let metaText = account ? account.name : '';
  if (o.category && o.category !== 'Outros') metaText = metaText ? `${o.category} · ${metaText}` : o.category;
  if (showDate) {
    const d = o.dateObj;
    metaText = `${d.getDate()}/${d.getMonth()+1} · ${metaText}`;
  }
  meta.textContent = metaText;
  info.appendChild(desc); info.appendChild(meta);
  const amount = document.createElement('div');
  amount.className = `entry-amount ${o.type}`;
  amount.textContent = (o.type === 'income' ? '+ ' : '- ') + formatCurrency(o.amount);
  const check = document.createElement('div');
  check.className = 'entry-check' + (o.status === 'confirmed' ? ' done' : '');
  check.textContent = o.status === 'confirmed' ? '✓' : '';
  li.appendChild(dot); li.appendChild(info); li.appendChild(amount); li.appendChild(check);
  li.addEventListener('click', () => openOccurrenceModal(o));
  return li;
}
/* ---------------- RENDER: FLUXO ---------------- */
function renderFluxo() {
  document.getElementById('fluxoMonthLabel').textContent = getMonthLabel(ui.fluxoMonth);
  const totals = computeMonthTotals(ui.fluxoMonth);
  document.getElementById('fluxoIncomeTotal').textContent = formatCurrency(totals.incomeConfirmed);
  document.getElementById('fluxoExpenseTotal').textContent = formatCurrency(totals.expenseConfirmed);
  document.getElementById('fluxoBalanceTotal').textContent = formatCurrency(totals.balanceConfirmed);
  const start = startOfMonth(ui.fluxoMonth), end = endOfMonth(ui.fluxoMonth);
  const occs = buildOccurrenceObjects(start, end);
  const ul = document.getElementById('fluxoList');
  ul.innerHTML = '';
  if (occs.length === 0) {
    const li = document.createElement('li');
    li.className = 'empty-hint';
    li.textContent = t('flow.empty');
    ul.appendChild(li);
    return;
  }
  occs.forEach((o) => ul.appendChild(buildEntryItem(o, true)));
}
/* ---------------- RENDER: CONTAS ---------------- */
function renderContas() {
  const ul = document.getElementById('accountList');
  ul.innerHTML = '';
  if (state.accounts.length === 0) {
    const li = document.createElement('li');
    li.className = 'empty-hint';
    li.textContent = t('accounts.empty');
    ul.appendChild(li);
    return;
  }
  state.accounts.forEach((acc) => {
    const li = document.createElement('li');
    li.className = 'account-item';
    const sw = document.createElement('div');
    sw.className = 'account-swatch';
    sw.style.background = acc.color;
    const name = document.createElement('div');
    name.className = 'account-name';
    name.textContent = acc.name;
    const bal = document.createElement('div');
    bal.className = 'account-balance';
    const balance = computeAccountBalance(acc.id);
    bal.textContent = formatCurrency(balance);
    bal.style.color = balance < 0 ? 'var(--expense)' : 'var(--income)';
    li.appendChild(sw); li.appendChild(name); li.appendChild(bal);
    li.addEventListener('click', () => openAccountModal(acc.id));
    ul.appendChild(li);
  });
}
/* ---------------- BLOQUEIO POR SENHA / BIOMETRIA ---------------- */
const LOCK_STORAGE_KEY = 'fincontrole_lock_v1';
let lockState = loadLockState();
let pinBuffer = '';
let biometricAvailable = false;
function loadLockState() {
  try {
    const raw = localStorage.getItem(LOCK_STORAGE_KEY);
    if (raw) return Object.assign({ enabled: false, pinHash: null, biometricEnabled: false, credentialId: null }, JSON.parse(raw));
  } catch (e) { /* ignore */ }
  return { enabled: false, pinHash: null, biometricEnabled: false, credentialId: null };
}
function saveLockState() { localStorage.setItem(LOCK_STORAGE_KEY, JSON.stringify(lockState)); }
async function sha256Hex(str) {
  const enc = new TextEncoder().encode('fincontrole-pin-' + str);
  const buf = await crypto.subtle.digest('SHA-256', enc);
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
}
function randomBytes(len) {
  const arr = new Uint8Array(len);
  crypto.getRandomValues(arr);
  return arr;
}
function bufToBase64(buf) { return btoa(String.fromCharCode(...new Uint8Array(buf))); }
function base64ToBuf(b64) {
  const bin = atob(b64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return arr;
}
async function isPlatformAuthenticatorAvailable() {
  if (!window.PublicKeyCredential || !PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable) return false;
  try { return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable(); }
  catch (e) { return false; }
}
async function registerBiometric() {
  const publicKey = {
    challenge: randomBytes(32),
    rp: { name: 'FinControle' },
    user: { id: randomBytes(16), name: 'fincontrole-usuario', displayName: 'FinControle' },
    pubKeyCredParams: [{ type: 'public-key', alg: -7 }, { type: 'public-key', alg: -257 }],
    authenticatorSelection: { authenticatorAttachment: 'platform', userVerification: 'required' },
    timeout: 60000,
    attestation: 'none'
  };
  const cred = await navigator.credentials.create({ publicKey });
  return bufToBase64(cred.rawId);
}
async function verifyBiometric(credentialIdB64) {
  const publicKey = {
    challenge: randomBytes(32),
    allowCredentials: [{ id: base64ToBuf(credentialIdB64), type: 'public-key', transports: ['internal'] }],
    userVerification: 'required',
    timeout: 60000
  };
  await navigator.credentials.get({ publicKey });
  return true;
}
/* ---- Tela de bloqueio (overlay) ---- */
function showLockOverlay() {
  pinBuffer = '';
  updateLockDots();
  document.getElementById('lockOverlay').classList.remove('hidden');
  document.getElementById('btnBiometricUnlock').classList.toggle('hidden', !lockState.biometricEnabled);
  const appEl = document.getElementById('app');
  if ('inert' in appEl) appEl.inert = true;
}
function hideLockOverlay() {
  document.getElementById('lockOverlay').classList.add('hidden');
  const appEl = document.getElementById('app');
  if ('inert' in appEl) appEl.inert = false;
}
function updateLockDots() {
  document.querySelectorAll('#lockDots .lock-dot').forEach((d, i) => d.classList.toggle('filled', i < pinBuffer.length));
}
function shakeLockDots() {
  const box = document.getElementById('lockDots');
  box.classList.add('shake');
  setTimeout(() => box.classList.remove('shake'), 350);
}
async function handlePinDigit(digit) {
  if (pinBuffer.length >= 4) return;
  pinBuffer += digit;
  updateLockDots();
  if (pinBuffer.length === 4) {
    const hash = await sha256Hex(pinBuffer);
    if (hash === lockState.pinHash) {
      hideLockOverlay();
      pinBuffer = '';
    } else {
      shakeLockDots();
      showToast(t('lock.wrongPin'));
      setTimeout(() => { pinBuffer = ''; updateLockDots(); }, 350);
    }
  }
}
function handlePinBackspace() { pinBuffer = pinBuffer.slice(0, -1); updateLockDots(); }
async function tryBiometricUnlock() {
  if (!lockState.biometricEnabled || !lockState.credentialId) return;
  try {
    await verifyBiometric(lockState.credentialId);
    hideLockOverlay();
  } catch (e) {
    showToast(t('lock.biometricFailed'));
  }
}
function handleForgotPin() {
  askConfirm(t('lock.forgotConfirm'), () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(RATES_CACHE_KEY);
    localStorage.removeItem('fincontrole_last_notify');
    localStorage.removeItem(LOCK_STORAGE_KEY);
    location.reload();
  });
}
function initLockScreen() {
  if (!lockState.enabled) return;
  showLockOverlay();
}
/* ---- Configuração em Ajustes ---- */
function renderLockSettings() {
  const container = document.getElementById('lockSettingsCard');
  container.innerHTML = '';
  const label = document.createElement('label');
  label.className = 'settings-label';
  label.textContent = t('settings.lock');
  container.appendChild(label);
  if (!lockState.enabled) {
    const p = document.createElement('p');
    p.className = 'hint-text';
    p.style.marginBottom = '12px';
    p.textContent = t('lock.hintDisabled');
    container.appendChild(p);
    const btn = document.createElement('button');
    btn.className = 'secondary-btn full-width';
    btn.style.marginBottom = '0';
    btn.textContent = t('lock.enable');
    btn.addEventListener('click', () => openSetPinModal());
    container.appendChild(btn);
    return;
  }
  const status = document.createElement('p');
  status.className = 'hint-text';
  status.style.marginBottom = '12px';
  status.textContent = t('lock.enabledStatus');
  container.appendChild(status);
  const btnChange = document.createElement('button');
  btnChange.className = 'secondary-btn full-width';
  btnChange.textContent = t('lock.change');
  btnChange.addEventListener('click', () => openSetPinModal());
  container.appendChild(btnChange);
  if (biometricAvailable) {
    const btnBio = document.createElement('button');
    btnBio.className = 'secondary-btn full-width';
    btnBio.textContent = lockState.biometricEnabled ? t('lock.biometricOn') : t('lock.biometricOff');
    btnBio.addEventListener('click', toggleBiometric);
    container.appendChild(btnBio);
  }
  const btnDisable = document.createElement('button');
  btnDisable.className = 'danger-btn full-width';
  btnDisable.style.marginBottom = '0';
  btnDisable.textContent = t('lock.disable');
  btnDisable.addEventListener('click', () => {
    askConfirm(t('lock.disableConfirm'), () => {
      lockState = { enabled: false, pinHash: null, biometricEnabled: false, credentialId: null };
      saveLockState();
      renderLockSettings();
      showToast(t('toast.saved'));
    });
  });
  container.appendChild(btnDisable);
}
async function toggleBiometric() {
  if (lockState.biometricEnabled) {
    lockState.biometricEnabled = false;
    lockState.credentialId = null;
    saveLockState();
    renderLockSettings();
    showToast(t('toast.saved'));
    return;
  }
  try {
    const credId = await registerBiometric();
    lockState.biometricEnabled = true;
    lockState.credentialId = credId;
    saveLockState();
    renderLockSettings();
    showToast(t('toast.saved'));
  } catch (e) {
    showToast(t('lock.biometricSetupFailed'));
  }
}
function openSetPinModal() {
  document.getElementById('fieldNewPin').value = '';
  document.getElementById('fieldConfirmPin').value = '';
  document.getElementById('modalSetPin').classList.remove('hidden');
}
function closeSetPinModal() { document.getElementById('modalSetPin').classList.add('hidden'); }
async function saveSetPin() {
  const p1 = document.getElementById('fieldNewPin').value;
  const p2 = document.getElementById('fieldConfirmPin').value;
  if (!/^\d{4}$/.test(p1)) { showToast(t('lock.invalidPin')); return; }
  if (p1 !== p2) { showToast(t('lock.pinMismatch')); return; }
  const hash = await sha256Hex(p1);
  lockState.enabled = true;
  lockState.pinHash = hash;
  saveLockState();
  closeSetPinModal();
  renderLockSettings();
  showToast(t('toast.saved'));
}
/* ---------------- RENDER: AJUSTES ---------------- */
function renderAjustes() {
  renderLockSettings();
  document.getElementById('selectLanguage').value = state.settings.language;
  document.getElementById('fontSizeLabel').textContent = Math.round(state.settings.fontScale * 100) + '%';
  const grid = document.getElementById('themeGrid');
  grid.innerHTML = '';
  THEMES.forEach((th) => {
    const div = document.createElement('div');
    div.className = 'theme-swatch' + (state.settings.theme === th.id ? ' selected' : '');
    div.style.background = `linear-gradient(135deg, ${th.swatch[0]} 50%, ${th.swatch[1]} 50%)`;
    div.addEventListener('click', () => {
      state.settings.theme = th.id;
      saveState();
      applyTheme();
      renderAjustes();
    });
    grid.appendChild(div);
  });
  updateNotifStatusText();
}
function updateNotifStatusText() {
  const el = document.getElementById('notifStatusText');
  if (!('Notification' in window)) { el.textContent = ''; return; }
  if (Notification.permission === 'denied') el.textContent = t('settings.notifBlocked');
  else if (state.settings.notificationsEnabled && Notification.permission === 'granted') el.textContent = t('settings.notifOn') + ' ' + t('settings.notifHint');
  else el.textContent = t('settings.notifOff');
}
/* ---------------- APPLY THEME / LANG / FONT ---------------- */
function applyTheme() {
  document.body.setAttribute('data-theme', state.settings.theme);
  document.querySelector('meta[name="theme-color"]').setAttribute('content',
    getComputedStyle(document.body).getPropertyValue('--primary').trim() || '#1F4D3D');
}
function applyFontScale() {
  document.documentElement.style.setProperty('--font-scale', state.settings.fontScale);
}
function applyLanguage() {
  document.documentElement.lang = state.settings.language;
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll('[data-i18n-aria]').forEach((el) => {
    el.setAttribute('aria-label', t(el.dataset.i18nAria));
  });
}
/* ---------------- MASTER RENDER ---------------- */
function renderAll() {
  applyLanguage();
  renderHeader();
  renderReminderBanner();
  if (ui.rates.data) renderRates(ui.rates.data, ui.rates.fresh);
  if (ui.currentView === 'inicio') renderHome();
  if (ui.currentView === 'fluxo') renderFluxo();
  if (ui.currentView === 'contas') renderContas();
  if (ui.currentView === 'ajustes') renderAjustes();
  populateAccountSelects();
}
function populateAccountSelects() {
  ['fieldAccount', 'occAccount'].forEach((id) => {
    const sel = document.getElementById(id);
    const current = sel.value;
    sel.innerHTML = '';
    state.accounts.forEach((acc) => {
      const opt = document.createElement('option');
      opt.value = acc.id; opt.textContent = acc.name;
      sel.appendChild(opt);
    });
    if (current) sel.value = current;
  });
}
/* ---------------- CATEGORIAS ---------------- */
function populateCategorySelect(selected) {
  const select = document.getElementById('fieldCategory');
  if (!select) return;
  const type = ui.currentType;
  const cats = (state.categories[type] || []).concat(DEFAULT_CATEGORIES[type]);
  select.innerHTML = '';
  cats.forEach((c) => {
    const opt = document.createElement('option');
    opt.value = c;
    opt.textContent = c;
    select.appendChild(opt);
  });
  if (selected && cats.includes(selected)) select.value = selected;
}
/* ============================================================
   MODAL: TRANSACTION (novo / editar lançamento)
   ============================================================ */
function openTransactionModal(existing) {
  ui.editingTransactionId = existing ? existing.id : null;
  document.getElementById('modalTransactionTitle').textContent = existing ? t('modal.editEntryTitle') : t('modal.newEntry');
  document.getElementById('btnDeleteTransaction').classList.toggle('hidden', !existing);
  const type = existing ? existing.type : 'income';
  setTransactionType(type);
  document.getElementById('fieldDescription').value = existing ? existing.description : '';
  document.getElementById('fieldAmount').value = existing ? String(existing.amount).replace('.', ',') : '';
  populateCategorySelect(existing ? existing.category : null);
  document.getElementById('fieldInvoicedTo').value = existing && existing.invoicedTo ? existing.invoicedTo : '';
  populateAccountSelects();
  document.getElementById('fieldAccount').value = existing ? existing.accountId : (state.accounts[0] ? state.accounts[0].id : '');
  document.getElementById('fieldDate').value = existing ? existing.date : todayISO();
  document.getElementById('fieldFrequency').value = existing ? existing.frequency : 'once';
  document.getElementById('fieldEndDate').value = existing && existing.endDate ? existing.endDate : '';
  document.getElementById('fieldNotes').value = existing && existing.notes ? existing.notes : '';
  toggleEndDateVisibility();
  document.getElementById('modalTransaction').classList.remove('hidden');
}
function setTransactionType(type) {
  ui.currentType = type;
  document.getElementById('btnTypeIncome').classList.toggle('active', type === 'income');
  document.getElementById('btnTypeExpense').classList.toggle('active', type === 'expense');
  populateCategorySelect();
}
function toggleEndDateVisibility() {
  const freq = document.getElementById('fieldFrequency').value;
  document.getElementById('endDateWrapper').classList.toggle('hidden', freq === 'once');
}
function closeTransactionModal() {
  document.getElementById('modalTransaction').classList.add('hidden');
}
function saveTransactionFromModal() {
  if (state.accounts.length === 0) { showToast(t('toast.needAccount')); return; }
  const description = document.getElementById('fieldDescription').value.trim();
  if (!description) { showToast(t('toast.fillDescription')); return; }
  const amount = parseAmountInput(document.getElementById('fieldAmount').value);
  if (!amount || amount <= 0) { showToast(t('toast.fillAmount')); return; }
  const accountId = document.getElementById('fieldAccount').value;
  const date = document.getElementById('fieldDate').value || todayISO();
  const frequency = document.getElementById('fieldFrequency').value;
  const endDate = frequency !== 'once' ? (document.getElementById('fieldEndDate').value || null) : null;
  const notes = document.getElementById('fieldNotes').value.trim();
  const category = document.getElementById('fieldCategory') ? document.getElementById('fieldCategory').value : 'Outros';
  const invoicedTo = document.getElementById('fieldInvoicedTo') ? document.getElementById('fieldInvoicedTo').value.trim() : '';
  if (ui.editingTransactionId) {
    const txn = state.transactions.find((t) => t.id === ui.editingTransactionId);
    Object.assign(txn, { type: ui.currentType, description, amount, accountId, date, frequency, endDate, notes, category, invoicedTo });
  } else {
    state.transactions.push({
      id: uid(), type: ui.currentType, description, amount, accountId, date, frequency, endDate, notes, category, invoicedTo,
      createdAt: Date.now()
    });
  }
  saveState();
  closeTransactionModal();
  renderAll();
  showToast(t('toast.saved'));
}
function deleteTransactionFromModal() {
  const id = ui.editingTransactionId;
  askConfirm(t('confirm.deleteTransaction'), () => {
    state.transactions = state.transactions.filter((t) => t.id !== id);
    Object.keys(state.overrides).forEach((k) => { if (k.startsWith(id + '_')) delete state.overrides[k]; });
    saveState();
    closeTransactionModal();
    renderAll();
    showToast(t('toast.deleted'));
  });
}
/* ============================================================
   MODAL: OCCURRENCE (confirmar / detalhe do dia)
   ============================================================ */
function openOccurrenceModal(occ) {
  ui.occContext = { transactionId: occ.transactionId, date: occ.date };
  const txn = state.transactions.find((t) => t.id === occ.transactionId);
  const lang = state.settings.language;
  const d = occ.dateObj;
  const dateLabel = `${capitalize(WEEKDAY_FULL[lang][d.getDay()])}, ${d.getDate()} ${MONTHS[lang][d.getMonth()]} ${d.getFullYear()}`;
  const details = document.getElementById('occDetails');
  details.innerHTML = '';
  const descEl = document.createElement('div'); descEl.className = 'od-desc'; descEl.textContent = occ.description;
  const amtEl = document.createElement('div'); amtEl.className = 'od-amount'; amtEl.style.color = occ.type === 'income' ? 'var(--income)' : 'var(--expense)';
  amtEl.textContent = (occ.type === 'income' ? '+ ' : '- ') + formatCurrency(occ.amount);
  const metaEl = document.createElement('div'); metaEl.className = 'od-meta'; metaEl.textContent = dateLabel;
  details.appendChild(descEl); details.appendChild(amtEl); details.appendChild(metaEl);
  if (occ.category || occ.invoicedTo) {
    const catEl = document.createElement('div'); catEl.className = 'od-meta';
    catEl.textContent = [occ.category, occ.invoicedTo].filter(Boolean).join(' · ');
    details.appendChild(catEl);
  }
  document.getElementById('occAmount').value = String(occ.amount).replace('.', ',');
  populateAccountSelects();
  document.getElementById('occAccount').value = occ.accountId;
  const confirmBtn = document.getElementById('btnConfirmOccurrence');
  confirmBtn.textContent = occ.status === 'confirmed' ? t('modal.unconfirm') : t('modal.confirm');
  confirmBtn.className = occ.status === 'confirmed' ? 'secondary-btn' : 'primary-btn';
  document.getElementById('modalOccurrence').classList.remove('hidden');
}
function closeOccurrenceModal() {
  document.getElementById('modalOccurrence').classList.add('hidden');
}
function toggleOccurrenceConfirm() {
  const { transactionId, date } = ui.occContext;
  const txn = state.transactions.find((t) => t.id === transactionId);
  const key = overrideKey(transactionId, date);
  const currentStatus = getOccStatus(transactionId, date);
  const newStatus = currentStatus === 'confirmed' ? 'pending' : 'confirmed';
  const selectedAccount = document.getElementById('occAccount').value;
  const enteredAmount = parseAmountInput(document.getElementById('occAmount').value);
  const override = state.overrides[key] || {};
  override.status = newStatus;
  if (selectedAccount && selectedAccount !== txn.accountId) override.accountId = selectedAccount; else delete override.accountId;
  if (enteredAmount && enteredAmount !== txn.amount) override.amount = enteredAmount; else delete override.amount;
  state.overrides[key] = override;
  saveState();
  closeOccurrenceModal();
  renderAll();
  showToast(newStatus === 'confirmed' ? t('toast.confirmed') : t('toast.unconfirmed'));
}
function editTransactionFromOccurrence() {
  const { transactionId } = ui.occContext;
  const txn = state.transactions.find((t) => t.id === transactionId);
  closeOccurrenceModal();
  openTransactionModal(txn);
}
/* ============================================================
   MODAL: ACCOUNT (nova / editar conta)
   ============================================================ */
function openAccountModal(accountId) {
  ui.editingAccountId = accountId || null;
  const existing = accountId ? state.accounts.find((a) => a.id === accountId) : null;
  document.getElementById('modalAccountTitle').textContent = existing ? t('modal.editAccountTitle') : t('modal.newAccount');
  document.getElementById('btnDeleteAccount').classList.toggle('hidden', !existing);
  document.getElementById('fieldAccountName').value = existing ? existing.name : '';
  document.getElementById('fieldAccountInitial').value = existing ? String(existing.initialBalance).replace('.', ',') : '';
  ui.selectedAccountColor = existing ? existing.color : ACCOUNT_COLORS[state.accounts.length % ACCOUNT_COLORS.length];
  renderColorGrid();
  document.getElementById('modalAccount').classList.remove('hidden');
}
function renderColorGrid() {
  const grid = document.getElementById('accountColorGrid');
  grid.innerHTML = '';
  ACCOUNT_COLORS.forEach((c) => {
    const div = document.createElement('div');
    div.className = 'color-swatch' + (ui.selectedAccountColor === c ? ' selected' : '');
    div.style.background = c;
    div.addEventListener('click', () => { ui.selectedAccountColor = c; renderColorGrid(); });
    grid.appendChild(div);
  });
}
function closeAccountModal() { document.getElementById('modalAccount').classList.add('hidden'); }
function saveAccountFromModal() {
  const name = document.getElementById('fieldAccountName').value.trim();
  if (!name) { showToast(t('toast.fillDescription')); return; }
  const initialBalance = parseAmountInput(document.getElementById('fieldAccountInitial').value);
  if (ui.editingAccountId) {
    const acc = state.accounts.find((a) => a.id === ui.editingAccountId);
    Object.assign(acc, { name, initialBalance, color: ui.selectedAccountColor });
  } else {
    state.accounts.push({ id: uid(), name, initialBalance, color: ui.selectedAccountColor });
  }
  saveState();
  closeAccountModal();
  renderAll();
  showToast(t('toast.saved'));
}
function deleteAccountFromModal() {
  const id = ui.editingAccountId;
  if (isAccountInUse(id)) { showToast(t('toast.accountInUse')); return; }
  askConfirm(t('confirm.deleteAccount'), () => {
    state.accounts = state.accounts.filter((a) => a.id !== id);
    saveState();
    closeAccountModal();
    renderAll();
    showToast(t('toast.deleted'));
  });
}
/* ============================================================
   BACKUP
   ============================================================ */
function exportBackup() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const stamp = todayISO();
  a.href = url;
  a.download = `fincontrole-backup-${stamp}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  showToast(t('toast.backupExported'));
}
function importBackupFile(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.accounts) || !Array.isArray(parsed.transactions)) {
        throw new Error('invalid');
      }
      state = Object.assign(defaultState(), parsed);
      saveState();
      applyTheme(); applyFontScale();
      renderAll();
      showToast(t('toast.backupImported'));
    } catch (e) {
      showToast(t('toast.backupInvalid'));
    }
  };
  reader.readAsText(file);
}
/* ============================================================
   NOTIFICATIONS (best-effort)
   ============================================================ */
async function enableNotifications() {
  if (!('Notification' in window)) { updateNotifStatusText(); return; }
  const perm = await Notification.requestPermission();
  if (perm === 'granted') {
    state.settings.notificationsEnabled = true;
    saveState();
    checkAndNotifyToday();
  } else {
    state.settings.notificationsEnabled = false;
    saveState();
  }
  updateNotifStatusText();
}
function checkAndNotifyToday() {
  if (!state.settings.notificationsEnabled) return;
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  const pending = buildOccurrenceObjects(todayDate(), todayDate()).filter((o) => o.status === 'pending');
  if (pending.length === 0) return;
  const lastNotified = localStorage.getItem('fincontrole_last_notify');
  if (lastNotified === todayISO()) return; // avoid spamming every load
  const body = t('reminder.text', { n: pending.length });
  try {
    if (navigator.serviceWorker && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'SHOW_NOTIFICATION', title: 'FinControle', body, tag: 'fincontrole-daily' });
    } else {
      new Notification('FinControle', { body, icon: 'icons/icon-192.png' });
    }
    localStorage.setItem('fincontrole_last_notify', todayISO());
  } catch (e) { /* ignore */ }
}
/* ============================================================
   EVENTS
   ============================================================ */
function bindEvents() {
  document.querySelectorAll('.nav-btn').forEach((btn) => {
    btn.addEventListener('click', () => switchView(btn.dataset.view));
  });
  document.getElementById('btnSettingsShortcut').addEventListener('click', () => switchView('ajustes'));
  document.getElementById('reminderBanner').addEventListener('click', () => switchView('inicio'));
  document.getElementById('btnRefreshRates').addEventListener('click', fetchExchangeRates);
  // Lock screen keypad
  document.querySelectorAll('.lock-key[data-digit]').forEach((btn) => {
    btn.addEventListener('click', () => handlePinDigit(btn.dataset.digit));
  });
  document.getElementById('btnLockBackspace').addEventListener('click', handlePinBackspace);
  document.getElementById('btnBiometricUnlock').addEventListener('click', tryBiometricUnlock);
  document.getElementById('btnForgotPin').addEventListener('click', handleForgotPin);
  // Set PIN modal
  document.getElementById('closeModalSetPin').addEventListener('click', closeSetPinModal);
  document.getElementById('btnSavePin').addEventListener('click', saveSetPin);
  // Home month nav
  document.getElementById('homePrevMonth').addEventListener('click', () => { ui.homeMonth = addMonths(ui.homeMonth, -1); renderHome(); });
  document.getElementById('homeNextMonth').addEventListener('click', () => { ui.homeMonth = addMonths(ui.homeMonth, 1); renderHome(); });
  document.getElementById('fluxoPrevMonth').addEventListener('click', () => { ui.fluxoMonth = addMonths(ui.fluxoMonth, -1); renderFluxo(); });
  document.getElementById('fluxoNextMonth').addEventListener('click', () => { ui.fluxoMonth = addMonths(ui.fluxoMonth, 1); renderFluxo(); });
  // Chart date range
  document.getElementById('chartStartDate').addEventListener('change', renderChart);
  document.getElementById('chartEndDate').addEventListener('change', renderChart);
  // New transaction buttons
  document.getElementById('btnNewTransactionHome').addEventListener('click', () => openTransactionModal(null));
  document.getElementById('btnNewTransactionFlow').addEventListener('click', () => openTransactionModal(null));
  document.getElementById('closeModalTransaction').addEventListener('click', closeTransactionModal);
  document.getElementById('btnTypeIncome').addEventListener('click', () => setTransactionType('income'));
  document.getElementById('btnTypeExpense').addEventListener('click', () => setTransactionType('expense'));
  document.getElementById('fieldFrequency').addEventListener('change', toggleEndDateVisibility);
  document.getElementById('btnSaveTransaction').addEventListener('click', saveTransactionFromModal);
  document.getElementById('btnDeleteTransaction').addEventListener('click', deleteTransactionFromModal);
  // Occurrence modal
  document.getElementById('closeModalOccurrence').addEventListener('click', closeOccurrenceModal);
  document.getElementById('btnConfirmOccurrence').addEventListener('click', toggleOccurrenceConfirm);
  document.getElementById('btnEditTransactionFromOcc').addEventListener('click', editTransactionFromOccurrence);
  // Account modal
  document.getElementById('btnNewAccount').addEventListener('click', () => openAccountModal(null));
  document.getElementById('closeModalAccount').addEventListener('click', closeAccountModal);
  document.getElementById('btnSaveAccount').addEventListener('click', saveAccountFromModal);
  document.getElementById('btnDeleteAccount').addEventListener('click', deleteAccountFromModal);
  // Confirm dialog
  document.getElementById('btnConfirmCancel').addEventListener('click', () => document.getElementById('modalConfirm').classList.add('hidden'));
  document.getElementById('btnConfirmOk').addEventListener('click', () => {
    document.getElementById('modalConfirm').classList.add('hidden');
    if (ui.pendingDeleteAction) ui.pendingDeleteAction();
    ui.pendingDeleteAction = null;
  });
  // Settings
  document.getElementById('selectLanguage').addEventListener('change', (e) => {
    state.settings.language = e.target.value;
    saveState();
    renderAll();
  });
  document.getElementById('btnFontSmaller').addEventListener('click', () => {
    state.settings.fontScale = Math.max(0.85, +(state.settings.fontScale - 0.1).toFixed(2));
    saveState(); applyFontScale(); renderAjustes();
  });
  document.getElementById('btnFontBigger').addEventListener('click', () => {
    state.settings.fontScale = Math.min(1.6, +(state.settings.fontScale + 0.1).toFixed(2));
    saveState(); applyFontScale(); renderAjustes();
  });
  document.getElementById('btnEnableNotifications').addEventListener('click', enableNotifications);
  document.getElementById('btnExportBackup').addEventListener('click', exportBackup);
  document.getElementById('btnImportBackup').addEventListener('click', () => document.getElementById('fileImportBackup').click());
  document.getElementById('fileImportBackup').addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) importBackupFile(e.target.files[0]);
    e.target.value = '';
  });
  // Close modals by tapping overlay background
  document.querySelectorAll('.modal-overlay').forEach((ov) => {
    ov.addEventListener('click', (e) => { if (e.target === ov) ov.classList.add('hidden'); });
  });
}
/* ============================================================
   INIT
   ============================================================ */
function init() {
  applyTheme();
  applyFontScale();
  bindEvents();
  switchView('inicio');
  checkAndNotifyToday();
  try {
    const cached = JSON.parse(localStorage.getItem(RATES_CACHE_KEY));
    if (cached) { ui.rates = { data: cached, fresh: false }; renderRates(cached, false); }
  } catch (e) { /* ignore */ }
  fetchExchangeRates();
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js').catch(() => {});
  }
  initLockScreen();
  isPlatformAuthenticatorAvailable().then((v) => {
    biometricAvailable = v;
    if (ui.currentView === 'ajustes') renderLockSettings();
  });
}
document.addEventListener('DOMContentLoaded', init);