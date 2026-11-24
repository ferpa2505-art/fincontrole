/**
 * Internationalization (i18n) module for fincontrole PWA
 * Supports Portuguese (Brazil), Spanish, and English
 *
 * Called by:
 * - src/main.js (app initialization)
 * - Feature modules for translations
 * - UI components for localized strings
 *
 * Architecture:
 * - Message catalog per locale (JSON-like objects)
 * - Pluralization support
 * - Interpolation with named placeholders
 * - Locale persistence in settings store
 * - Reactivity via state store observers
 */

import logger from '../utils/logger.js';
import store from '../state/store.js';

/**
 * Supported locales
 * @readonly
 * @enum {string}
 */
const LOCALES = {
  PT_BR: 'pt-BR',
  ES: 'es',
  EN: 'en',
};

/**
 * Default locale
 * @type {string}
 */
const DEFAULT_LOCALE = LOCALES.PT_BR;

/**
 * Message catalog with all translations
 * @type {Object<string, Object<string, string>>}
 */
const messages = {
  [LOCALES.PT_BR]: {
    // General
    appName: 'FinControle',
    appTagline: 'Seu controle financeiro pessoal',
    save: 'Salvar',
    cancel: 'Cancelar',
    delete: 'Excluir',
    edit: 'Editar',
    add: 'Adicionar',
    close: 'Fechar',
    confirm: 'Confirmar',
    back: 'Voltar',
    next: 'Próximo',
    previous: 'Anterior',
    loading: 'Carregando...',
    error: 'Erro',
    success: 'Sucesso',
    warning: 'Aviso',
    info: 'Informação',

    // Navigation
    navDashboard: 'Painel',
    navAccounts: 'Contas',
    navTransactions: 'Lançamentos',
    navCategories: 'Categorias',
    navReminders: 'Lembretes',
    navReports: 'Relatórios',
    navSettings: 'Ajustes',

    // Dashboard
    dashboardTitle: 'Painel',
    totalBalance: 'Saldo Total',
    monthlyIncome: 'Entradas do Mês',
    monthlyExpense: 'Saídas do Mês',
    monthlyBalance: 'Saldo do Mês',
    recentTransactions: 'Lançamentos Recentes',
    upcomingReminders: 'Lembretes Próximos',
    noTransactions: 'Nenhum lançamento encontrado',
    noReminders: 'Nenhum lembrete',

    // Accounts
    accountsTitle: 'Contas',
    addAccount: 'Adicionar Conta',
    editAccount: 'Editar Conta',
    accountName: 'Nome da Conta',
    accountType: 'Tipo de Conta',
    accountBalance: 'Saldo Inicial',
    accountColor: 'Cor',
    accountIcon: 'Ícone',
    accountTypes: {
      checking: 'Conta Corrente',
      savings: 'Poupança',
      credit: 'Cartão de Crédito',
      cash: 'Dinheiro',
      investment: 'Investimento',
      other: 'Outro',
    },
    deleteAccountConfirm: 'Tem certeza que deseja excluir esta conta?',
    accountDeleted: 'Conta excluída com sucesso',
    accountSaved: 'Conta salva com sucesso',

    // Transactions
    transactionsTitle: 'Lançamentos',
    addTransaction: 'Novo Lançamento',
    editTransaction: 'Editar Lançamento',
    transactionType: 'Tipo',
    transactionTypes: {
      income: 'Entrada',
      expense: 'Saída',
      transfer: 'Transferência',
    },
    transactionAmount: 'Valor',
    transactionDate: 'Data',
    transactionCategory: 'Categoria',
    transactionAccount: 'Conta',
    transactionDescription: 'Descrição (opcional)',
    transactionTags: 'Tags (opcional)',
    recurring: 'Recorrente',
    recurringFrequency: 'Frequência',
    recurringFrequencies: {
      daily: 'Diário',
      weekly: 'Semanal',
      monthly: 'Mensal',
      yearly: 'Anual',
    },
    deleteTransactionConfirm: 'Tem certeza que deseja excluir este lançamento?',
    transactionDeleted: 'Lançamento excluído com sucesso',
    transactionSaved: 'Lançamento salvo com sucesso',
    filterAll: 'Todos',
    filterIncome: 'Entradas',
    filterExpense: 'Saídas',
    filterTransfers: 'Transferências',

    // Categories
    categoriesTitle: 'Categorias',
    addCategory: 'Nova Categoria',
    editCategory: 'Editar Categoria',
    categoryName: 'Nome da Categoria',
    categoryType: 'Tipo',
    categoryIcon: 'Ícone',
    categoryColor: 'Cor',
    categoryParent: 'Categoria Pai (opcional)',
    deleteCategoryConfirm: 'Tem certeza que deseja excluir esta categoria?',
    categoryDeleted: 'Categoria excluída com sucesso',
    categorySaved: 'Categoria salva com sucesso',
    defaultCategories: {
      food: 'Alimentação',
      transport: 'Transporte',
      housing: 'Moradia',
      health: 'Saúde',
      education: 'Educação',
      entertainment: 'Lazer',
      shopping: 'Compras',
      salary: 'Salário',
      freelance: 'Freelance',
      investment_income: 'Rendimentos',
      transfer_in: 'Transferência Entrada',
      transfer_out: 'Transferência Saída',
    },

    // Reminders
    remindersTitle: 'Lembretes',
    addReminder: 'Novo Lembrete',
    editReminder: 'Editar Lembrete',
    reminderTitle: 'Título',
    reminderDescription: 'Descrição (opcional)',
    reminderDate: 'Data',
    reminderTime: 'Hora',
    reminderRepeat: 'Repetir',
    reminderRepeatOptions: {
      none: 'Não repetir',
      daily: 'Diário',
      weekly: 'Semanal',
      monthly: 'Mensal',
      yearly: 'Anual',
    },
    reminderAccount: 'Conta (opcional)',
    reminderCategory: 'Categoria (opcional)',
    reminderAmount: 'Valor (opcional)',
    reminderType: 'Tipo',
    reminderNotification: 'Notificação',
    deleteReminderConfirm: 'Tem certeza que deseja excluir este lembrete?',
    reminderDeleted: 'Lembrete excluído com sucesso',
    reminderSaved: 'Lembrete salvo com sucesso',
    upcomingRemindersTitle: 'Próximos Lembretes',
    overdueReminders: 'Lembretes Atrasados',
    todayReminders: 'Lembretes de Hoje',

    // Reports
    reportsTitle: 'Relatórios',
    reportPeriod: 'Período',
    reportPeriods: {
      week: 'Esta Semana',
      month: 'Este Mês',
      quarter: 'Este Trimestre',
      year: 'Este Ano',
      custom: 'Personalizado',
    },
    reportCategoryBreakdown: 'Por Categoria',
    reportAccountBreakdown: 'Por Conta',
    reportMonthlyTrend: 'Tendência Mensal',
    reportIncomeVsExpense: 'Entradas vs Saídas',
    noDataForPeriod: 'Sem dados para este período',

    // Settings
    settingsTitle: 'Ajustes',
    settingsLanguage: 'Idioma',
    settingsTheme: 'Tema',
    settingsThemes: {
      light: 'Claro',
      dark: 'Escuro',
      system: 'Sistema',
    },
    settingsCurrency: 'Moeda',
    settingsDateFormat: 'Formato de Data',
    settingsNumberFormat: 'Formato de Número',
    settingsBackup: 'Backup',
    settingsExportBackup: 'Exportar Backup',
    settingsImportBackup: 'Importar Backup',
    settingsExportSuccess: 'Backup exportado com sucesso',
    settingsImportSuccess: 'Backup importado com sucesso',
    settingsImportError: 'Erro ao importar backup',
    settingsNotifications: 'Notificações',
    settingsEnableNotifications: 'Ativar notificações',
    settingsReminderNotifications: 'Lembretes por notificação',
    settingsDataManagement: 'Gerenciamento de Dados',
    settingsClearAllData: 'Limpar Todos os Dados',
    settingsClearAllDataConfirm: 'Isso apagará TODOS os seus dados permanentemente. Tem certeza?',
    settingsDataCleared: 'Todos os dados foram limpos',
    settingsAbout: 'Sobre',
    settingsVersion: 'Versão',
    settingsPrivacyPolicy: 'Política de Privacidade',
    settingsTermsOfService: 'Termos de Serviço',

    // Common validation messages
    validationRequired: 'Este campo é obrigatório',
    validationMinLength: 'Mínimo {min} caracteres',
    validationMaxLength: 'Máximo {max} caracteres',
    validationPositiveNumber: 'Deve ser um número positivo',
    validationValidEmail: 'E-mail inválido',
    validationValidDate: 'Data inválida',
    validationValidAmount: 'Valor inválido',

    // Date/time formats
    dateFormatShort: 'DD/MM/YYYY',
    dateFormatLong: 'D [de] MMMM [de] YYYY',
    timeFormat: 'HH:mm',
    dateTimeFormat: 'DD/MM/YYYY HH:mm',

    // Relative time
    today: 'Hoje',
    tomorrow: 'Amanhã',
    yesterday: 'Ontem',
    daysAgo: '{days} dias atrás',
    inDays: 'em {days} dias',
    thisWeek: 'Esta semana',
    thisMonth: 'Este mês',
    thisYear: 'Este ano',
  },

  [LOCALES.ES]: {
    // General
    appName: 'FinControl',
    appTagline: 'Tu control financiero personal',
    save: 'Guardar',
    cancel: 'Cancelar',
    delete: 'Eliminar',
    edit: 'Editar',
    add: 'Añadir',
    close: 'Cerrar',
    confirm: 'Confirmar',
    back: 'Volver',
    next: 'Siguiente',
    previous: 'Anterior',
    loading: 'Cargando...',
    error: 'Error',
    success: 'Éxito',
    warning: 'Advertencia',
    info: 'Información',

    // Navigation
    navDashboard: 'Panel',
    navAccounts: 'Cuentas',
    navTransactions: 'Movimientos',
    navCategories: 'Categorías',
    navReminders: 'Recordatorios',
    navReports: 'Informes',
    navSettings: 'Ajustes',

    // Dashboard
    dashboardTitle: 'Panel',
    totalBalance: 'Saldo Total',
    monthlyIncome: 'Ingresos del Mes',
    monthlyExpense: 'Gastos del Mes',
    monthlyBalance: 'Saldo del Mes',
    recentTransactions: 'Movimientos Recientes',
    upcomingReminders: 'Próximos Recordatorios',
    noTransactions: 'No hay movimientos',
    noReminders: 'No hay recordatorios',

    // Accounts
    accountsTitle: 'Cuentas',
    addAccount: 'Añadir Cuenta',
    editAccount: 'Editar Cuenta',
    accountName: 'Nombre de la Cuenta',
    accountType: 'Tipo de Cuenta',
    accountBalance: 'Saldo Inicial',
    accountColor: 'Color',
    accountIcon: 'Icono',
    accountTypes: {
      checking: 'Cuenta Corriente',
      savings: 'Ahorros',
      credit: 'Tarjeta de Crédito',
      cash: 'Efectivo',
      investment: 'Inversión',
      other: 'Otro',
    },
    deleteAccountConfirm: '¿Seguro que quieres eliminar esta cuenta?',
    accountDeleted: 'Cuenta eliminada correctamente',
    accountSaved: 'Cuenta guardada correctamente',

    // Transactions
    transactionsTitle: 'Movimientos',
    addTransaction: 'Nuevo Movimiento',
    editTransaction: 'Editar Movimiento',
    transactionType: 'Tipo',
    transactionTypes: {
      income: 'Ingreso',
      expense: 'Gasto',
      transfer: 'Transferencia',
    },
    transactionAmount: 'Importe',
    transactionDate: 'Fecha',
    transactionCategory: 'Categoría',
    transactionAccount: 'Cuenta',
    transactionDescription: 'Descripción (opcional)',
    transactionTags: 'Etiquetas (opcional)',
    recurring: 'Recurrente',
    recurringFrequency: 'Frecuencia',
    recurringFrequencies: {
      daily: 'Diario',
      weekly: 'Semanal',
      monthly: 'Mensual',
      yearly: 'Anual',
    },
    deleteTransactionConfirm: '¿Seguro que quieres eliminar este movimiento?',
    transactionDeleted: 'Movimiento eliminado correctamente',
    transactionSaved: 'Movimiento guardado correctamente',
    filterAll: 'Todos',
    filterIncome: 'Ingresos',
    filterExpense: 'Gastos',
    filterTransfers: 'Transferencias',

    // Categories
    categoriesTitle: 'Categorías',
    addCategory: 'Nueva Categoría',
    editCategory: 'Editar Categoría',
    categoryName: 'Nombre de la Categoría',
    categoryType: 'Tipo',
    categoryIcon: 'Icono',
    categoryColor: 'Color',
    categoryParent: 'Categoría Padre (opcional)',
    deleteCategoryConfirm: '¿Seguro que quieres eliminar esta categoría?',
    categoryDeleted: 'Categoría eliminada correctamente',
    categorySaved: 'Categoría guardada correctamente',
    defaultCategories: {
      food: 'Alimentación',
      transport: 'Transporte',
      housing: 'Vivienda',
      health: 'Salud',
      education: 'Educación',
      entertainment: 'Ocio',
      shopping: 'Compras',
      salary: 'Salario',
      freelance: 'Freelance',
      investment_income: 'Rendimientos',
      transfer_in: 'Transferencia Entrada',
      transfer_out: 'Transferencia Salida',
    },

    // Reminders
    remindersTitle: 'Recordatorios',
    addReminder: 'Nuevo Recordatorio',
    editReminder: 'Editar Recordatorio',
    reminderTitle: 'Título',
    reminderDescription: 'Descripción (opcional)',
    reminderDate: 'Fecha',
    reminderTime: 'Hora',
    reminderRepeat: 'Repetir',
    reminderRepeatOptions: {
      none: 'No repetir',
      daily: 'Diario',
      weekly: 'Semanal',
      monthly: 'Mensual',
      yearly: 'Anual',
    },
    reminderAccount: 'Cuenta (opcional)',
    reminderCategory: 'Categoría (opcional)',
    reminderAmount: 'Importe (opcional)',
    reminderType: 'Tipo',
    reminderNotification: 'Notificación',
    deleteReminderConfirm: '¿Seguro que quieres eliminar este recordatorio?',
    reminderDeleted: 'Recordatorio eliminado correctamente',
    reminderSaved: 'Recordatorio guardado correctamente',
    upcomingRemindersTitle: 'Próximos Recordatorios',
    overdueReminders: 'Recordatorios Atrasados',
    todayReminders: 'Recordatorios de Hoy',

    // Reports
    reportsTitle: 'Informes',
    reportPeriod: 'Período',
    reportPeriods: {
      week: 'Esta Semana',
      month: 'Este Mes',
      quarter: 'Este Trimestre',
      year: 'Este Año',
      custom: 'Personalizado',
    },
    reportCategoryBreakdown: 'Por Categoría',
    reportAccountBreakdown: 'Por Cuenta',
    reportMonthlyTrend: 'Tendencia Mensual',
    reportIncomeVsExpense: 'Ingresos vs Gastos',
    noDataForPeriod: 'Sin datos para este período',

    // Settings
    settingsTitle: 'Ajustes',
    settingsLanguage: 'Idioma',
    settingsTheme: 'Tema',
    settingsThemes: {
      light: 'Claro',
      dark: 'Oscuro',
      system: 'Sistema',
    },
    settingsCurrency: 'Moneda',
    settingsDateFormat: 'Formato de Fecha',
    settingsNumberFormat: 'Formato de Número',
    settingsBackup: 'Respaldo',
    settingsExportBackup: 'Exportar Respaldo',
    settingsImportBackup: 'Importar Respaldo',
    settingsExportSuccess: 'Respaldo exportado correctamente',
    settingsImportSuccess: 'Respaldo importado correctamente',
    settingsImportError: 'Error al importar respaldo',
    settingsNotifications: 'Notificações',
    settingsEnableNotifications: 'Activar notificaciones',
    settingsReminderNotifications: 'Recordatorios por notificación',
    settingsDataManagement: 'Gestión de Datos',
    settingsClearAllData: 'Borrar Todos los Datos',
    settingsClearAllDataConfirm: 'Esto borrará TODOS tus datos permanentemente. ¿Estás seguro?',
    settingsDataCleared: 'Todos los datos han sido borrados',
    settingsAbout: 'Acerca de',
    settingsVersion: 'Versión',
    settingsPrivacyPolicy: 'Política de Privacidad',
    settingsTermsOfService: 'Términos de Servicio',

    // Common validation messages
    validationRequired: 'Este campo es obligatorio',
    validationMinLength: 'Mínimo {min} caracteres',
    validationMaxLength: 'Máximo {max} caracteres',
    validationPositiveNumber: 'Debe ser un número positivo',
    validationValidEmail: 'Email inválido',
    validationValidDate: 'Fecha inválida',
    validationValidAmount: 'Importe inválido',

    // Date/time formats
    dateFormatShort: 'DD/MM/YYYY',
    dateFormatLong: 'D [de] MMMM [de] YYYY',
    timeFormat: 'HH:mm',
    dateTimeFormat: 'DD/MM/YYYY HH:mm',

    // Relative time
    today: 'Hoy',
    tomorrow: 'Mañana',
    yesterday: 'Ayer',
    daysAgo: 'hace {days} días',
    inDays: 'en {days} días',
    thisWeek: 'Esta semana',
    thisMonth: 'Este mes',
    thisYear: 'Este año',
  },

  [LOCALES.EN]: {
    // General
    appName: 'FinControl',
    appTagline: 'Your personal finance tracker',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    close: 'Close',
    confirm: 'Confirm',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    warning: 'Warning',
    info: 'Info',

    // Navigation
    navDashboard: 'Dashboard',
    navAccounts: 'Accounts',
    navTransactions: 'Transactions',
    navCategories: 'Categories',
    navReminders: 'Reminders',
    navReports: 'Reports',
    navSettings: 'Settings',

    // Dashboard
    dashboardTitle: 'Dashboard',
    totalBalance: 'Total Balance',
    monthlyIncome: 'Monthly Income',
    monthlyExpense: 'Monthly Expense',
    monthlyBalance: 'Monthly Balance',
    recentTransactions: 'Recent Transactions',
    upcomingReminders: 'Upcoming Reminders',
    noTransactions: 'No transactions found',
    noReminders: 'No reminders',

    // Accounts
    accountsTitle: 'Accounts',
    addAccount: 'Add Account',
    editAccount: 'Edit Account',
    accountName: 'Account Name',
    accountType: 'Account Type',
    accountBalance: 'Initial Balance',
    accountColor: 'Color',
    accountIcon: 'Icon',
    accountTypes: {
      checking: 'Checking',
      savings: 'Savings',
      credit: 'Credit Card',
      cash: 'Cash',
      investment: 'Investment',
      other: 'Other',
    },
    deleteAccountConfirm: 'Are you sure you want to delete this account?',
    accountDeleted: 'Account deleted successfully',
    accountSaved: 'Account saved successfully',

    // Transactions
    transactionsTitle: 'Transactions',
    addTransaction: 'New Transaction',
    editTransaction: 'Edit Transaction',
    transactionType: 'Type',
    transactionTypes: {
      income: 'Income',
      expense: 'Expense',
      transfer: 'Transfer',
    },
    transactionAmount: 'Amount',
    transactionDate: 'Date',
    transactionCategory: 'Category',
    transactionAccount: 'Account',
    transactionDescription: 'Description (optional)',
    transactionTags: 'Tags (optional)',
    recurring: 'Recurring',
    recurringFrequency: 'Frequency',
    recurringFrequencies: {
      daily: 'Daily',
      weekly: 'Weekly',
      monthly: 'Monthly',
      yearly: 'Yearly',
    },
    deleteTransactionConfirm: 'Are you sure you want to delete this transaction?',
    transactionDeleted: 'Transaction deleted successfully',
    transactionSaved: 'Transaction saved successfully',
    filterAll: 'All',
    filterIncome: 'Income',
    filterExpense: 'Expense',
    filterTransfers: 'Transfers',

    // Categories
    categoriesTitle: 'Categories',
    addCategory: 'New Category',
    editCategory: 'Edit Category',
    categoryName: 'Category Name',
    categoryType: 'Type',
    categoryIcon: 'Icon',
    categoryColor: 'Color',
    categoryParent: 'Parent Category (optional)',
    deleteCategoryConfirm: 'Are you sure you want to delete this category?',
    categoryDeleted: 'Category deleted successfully',
    categorySaved: 'Category saved successfully',
    defaultCategories: {
      food: 'Food',
      transport: 'Transport',
      housing: 'Housing',
      health: 'Health',
      education: 'Education',
      entertainment: 'Entertainment',
      shopping: 'Shopping',
      salary: 'Salary',
      freelance: 'Freelance',
      investment_income: 'Investment Income',
      transfer_in: 'Transfer In',
      transfer_out: 'Transfer Out',
    },

    // Reminders
    remindersTitle: 'Reminders',
    addReminder: 'New Reminder',
    editReminder: 'Edit Reminder',
    reminderTitle: 'Title',
    reminderDescription: 'Description (optional)',
    reminderDate: 'Date',
    reminderTime: 'Time',
    reminderRepeat: 'Repeat',
    reminderRepeatOptions: {
      none: "Don't repeat",
      daily: 'Daily',
      weekly: 'Weekly',
      monthly: 'Monthly',
      yearly: 'Yearly',
    },
    reminderAccount: 'Account (optional)',
    reminderCategory: 'Category (optional)',
    reminderAmount: 'Amount (optional)',
    reminderType: 'Type',
    reminderNotification: 'Notification',
    deleteReminderConfirm: 'Are you sure you want to delete this reminder?',
    reminderDeleted: 'Reminder deleted successfully',
    reminderSaved: 'Reminder saved successfully',
    upcomingRemindersTitle: 'Upcoming Reminders',
    overdueReminders: 'Overdue Reminders',
    todayReminders: "Today's Reminders",

    // Reports
    reportsTitle: 'Reports',
    reportPeriod: 'Period',
    reportPeriods: {
      week: 'This Week',
      month: 'This Month',
      quarter: 'This Quarter',
      year: 'This Year',
      custom: 'Custom',
    },
    reportCategoryBreakdown: 'By Category',
    reportAccountBreakdown: 'By Account',
    reportMonthlyTrend: 'Monthly Trend',
    reportIncomeVsExpense: 'Income vs Expense',
    noDataForPeriod: 'No data for this period',

    // Settings
    settingsTitle: 'Settings',
    settingsLanguage: 'Language',
    settingsTheme: 'Theme',
    settingsThemes: {
      light: 'Light',
      dark: 'Dark',
      system: 'System',
    },
    settingsCurrency: 'Currency',
    settingsDateFormat: 'Date Format',
    settingsNumberFormat: 'Number Format',
    settingsBackup: 'Backup',
    settingsExportBackup: 'Export Backup',
    settingsImportBackup: 'Import Backup',
    settingsExportSuccess: 'Backup exported successfully',
    settingsImportSuccess: 'Backup imported successfully',
    settingsImportError: 'Error importing backup',
    settingsNotifications: 'Notifications',
    settingsEnableNotifications: 'Enable notifications',
    settingsReminderNotifications: 'Reminder notifications',
    settingsDataManagement: 'Data Management',
    settingsClearAllData: 'Clear All Data',
    settingsClearAllDataConfirm: 'This will delete ALL your data permanently. Are you sure?',
    settingsDataCleared: 'All data has been cleared',
    settingsAbout: 'About',
    settingsVersion: 'Version',
    settingsPrivacyPolicy: 'Privacy Policy',
    settingsTermsOfService: 'Terms of Service',

    // Common validation messages
    validationRequired: 'This field is required',
    validationMinLength: 'Minimum {min} characters',
    validationMaxLength: 'Maximum {max} characters',
    validationPositiveNumber: 'Must be a positive number',
    validationValidEmail: 'Invalid email',
    validationValidDate: 'Invalid date',
    validationValidAmount: 'Invalid amount',

    // Date/time formats
    dateFormatShort: 'MM/DD/YYYY',
    dateFormatLong: 'MMMM D, YYYY',
    timeFormat: 'HH:mm',
    dateTimeFormat: 'MM/DD/YYYY HH:mm',

    // Relative time
    today: 'Today',
    tomorrow: 'Tomorrow',
    yesterday: 'Yesterday',
    daysAgo: '{days} days ago',
    inDays: 'in {days} days',
    thisWeek: 'This week',
    thisMonth: 'This month',
    thisYear: 'This year',
  },
};

/**
 * Current locale state
 * @type {string}
 */
let currentLocale = DEFAULT_LOCALE;

/**
 * Interpolation cache for performance
 * @type {Map<string, Function>}
 */
const interpolationCache = new Map();

/**
 * Get message for current locale
 * @param {string} key - Message key (dot notation supported)
 * @param {Object} params - Interpolation parameters
 * @returns {string}
 */
function t(key, params = {}) {
  const localeMessages = messages[currentLocale] || messages[DEFAULT_LOCALE];
  let message = localeMessages;

  // Navigate dot notation (e.g., 'accountTypes.checking')
  const keys = key.split('.');
  for (const k of keys) {
    if (message && typeof message === 'object' && k in message) {
      message = message[k];
    } else {
      logger.warn(`[i18n] Translation key not found: ${key} for locale ${currentLocale}`);
      return key; // Return key as fallback
    }
  }

  if (typeof message !== 'string') {
    logger.warn(`[i18n] Translation value is not a string: ${key}`);
    return key;
  }

  // Interpolate parameters
  if (params && Object.keys(params).length > 0) {
    return interpolate(message, params);
  }

  return message;
}

/**
 * Interpolate parameters into message string
 * @param {string} message
 * @param {Object} params
 * @returns {string}
 */
function interpolate(message, params) {
  const cacheKey = message + JSON.stringify(params);
  let interpolator = interpolationCache.get(cacheKey);

  if (!interpolator) {
    // Create interpolation function
    interpolator = p => {
      return message.replace(/\{(\w+)\}/g, (match, key) => {
        return p.hasOwnProperty(key) ? String(p[key]) : match;
      });
    };
    interpolationCache.set(cacheKey, interpolator);
  }

  return interpolator(params);
}

/**
 * Set current locale
 * @param {string} locale - Locale code
 * @returns {Promise<void>}
 */
async function setLocale(locale) {
  if (!Object.values(LOCALES).includes(locale)) {
    logger.warn(`[i18n] Invalid locale: ${locale}, falling back to ${DEFAULT_LOCALE}`);
    locale = DEFAULT_LOCALE;
  }

  if (currentLocale === locale) {
    logger.debug(`[i18n] Locale already set to: ${locale}`);
    return;
  }

  const previousLocale = currentLocale;
  currentLocale = locale;

  // Persist to settings store
  try {
    await store.updateSettings({ language: locale });
    logger.info(`[i18n] Locale changed from ${previousLocale} to ${locale}`);
  } catch (error) {
    logger.error('[i18n] Failed to persist locale:', error);
  }
}

/**
 * Get current locale
 * @returns {string}
 */
function getLocale() {
  return currentLocale;
}

/**
 * Get available locales
 * @returns {string[]}
 */
function getAvailableLocales() {
  return Object.values(LOCALES);
}

/**
 * Get locale display name
 * @param {string} locale
 * @returns {string}
 */
function getLocaleDisplayName(locale) {
  const names = {
    [LOCALES.PT_BR]: 'Português (Brasil)',
    [LOCALES.ES]: 'Español',
    [LOCALES.EN]: 'English',
  };
  return names[locale] || locale;
}

/**
 * Initialize i18n from stored settings
 * @returns {Promise<void>}
 */
async function init() {
  try {
    const state = store.getState();
    const savedLocale = state.settings?.language;
    if (savedLocale && Object.values(LOCALES).includes(savedLocale)) {
      currentLocale = savedLocale;
      logger.info(`[i18n] Initialized with saved locale: ${currentLocale}`);
    } else {
      // Try to detect from browser
      const browserLocale = navigator.language || navigator.userLanguage;
      if (browserLocale.startsWith('pt')) {
        currentLocale = LOCALES.PT_BR;
      } else if (browserLocale.startsWith('es')) {
        currentLocale = LOCALES.ES;
      } else {
        currentLocale = DEFAULT_LOCALE;
      }
      logger.info(`[i18n] Initialized with detected locale: ${currentLocale}`);
    }
  } catch (error) {
    logger.error('[i18n] Failed to initialize:', error);
    currentLocale = DEFAULT_LOCALE;
  }
}

/**
 * Format number according to locale
 * @param {number} value
 * @param {Object} options
 * @returns {string}
 */
function formatNumber(value, options = {}) {
  const localeMap = {
    [LOCALES.PT_BR]: 'pt-BR',
    [LOCALES.ES]: 'es-ES',
    [LOCALES.EN]: 'en-US',
  };

  const locale = localeMap[currentLocale] || 'pt-BR';
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...options,
  }).format(value);
}

/**
 * Format currency according to locale
 * @param {number} value
 * @param {string} currency - Currency code (BRL, USD, EUR)
 * @returns {string}
 */
function formatCurrency(value, currency = 'BRL') {
  const localeMap = {
    [LOCALES.PT_BR]: 'pt-BR',
    [LOCALES.ES]: 'es-ES',
    [LOCALES.EN]: 'en-US',
  };

  const locale = localeMap[currentLocale] || 'pt-BR';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format date according to locale
 * @param {Date|number|string} date
 * @param {Object} options
 * @returns {string}
 */
function formatDate(date, options = {}) {
  const localeMap = {
    [LOCALES.PT_BR]: 'pt-BR',
    [LOCALES.ES]: 'es-ES',
    [LOCALES.EN]: 'en-US',
  };

  const locale = localeMap[currentLocale] || 'pt-BR';
  const dateObj = date instanceof Date ? date : new Date(date);

  if (isNaN(dateObj.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    ...options,
  }).format(dateObj);
}

/**
 * Format relative time (e.g., "2 days ago")
 * @param {Date|number|string} date
 * @returns {string}
 */
function formatRelativeTime(date) {
  const dateObj = date instanceof Date ? date : new Date(date);
  if (isNaN(dateObj.getTime())) {
    return '';
  }

  const now = new Date();
  const diffMs = dateObj.getTime() - now.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return t('today');
  if (diffDays === 1) return t('tomorrow');
  if (diffDays === -1) return t('yesterday');
  if (diffDays > 0) return t('inDays', { days: diffDays });
  return t('daysAgo', { days: Math.abs(diffDays) });
}

// Export public API
export {
  LOCALES,
  DEFAULT_LOCALE,
  t,
  setLocale,
  getLocale,
  getAvailableLocales,
  getLocaleDisplayName,
  init,
  formatNumber,
  formatCurrency,
  formatDate,
  formatRelativeTime,
  messages,
};

export default {
  LOCALES,
  DEFAULT_LOCALE,
  t,
  setLocale,
  getLocale,
  getAvailableLocales,
  getLocaleDisplayName,
  init,
  formatNumber,
  formatCurrency,
  formatDate,
  formatRelativeTime,
};
