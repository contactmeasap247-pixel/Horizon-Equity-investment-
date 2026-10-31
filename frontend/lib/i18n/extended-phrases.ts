// ============================================
// HORIZON EQUITY - EXTENDED PLATFORM PHRASES
// Public Subpages, User Dashboard Pages & Admin Dashboard Pages
// ============================================

type LangTuple = [
  es: string,
  nl: string,
  pt: string,
  fr: string,
  de: string,
  zh: string,
  ru: string,
  ar: string
];

export const EXTENDED_PHRASES: Record<string, LangTuple> = {
  // ── Markets Page ──
  "REAL-TIME STREAMING FEEDS (COINBASE & GLOBAL FX)": [
    "TRANSMISIÓN EN TIEMPO REAL (COINBASE Y FX GLOBAL)",
    "REALTIME KOERSFEEDS (COINBASE & GLOBAL FX)",
    "FEEDS EM TEMPO REAL (COINBASE E FX GLOBAL)",
    "FLUX EN TEMPS RÉEL (COINBASE & FX MONDIAL)",
    "ECHTZEIT-DATENFEEDS (COINBASE & GLOBAL FX)",
    "实时行情数据流 (COINBASE 与全球外汇)",
    "ПОТОК ДАННЫХ В РЕАЛЬНОМ ВРЕМЕНИ (COINBASE И FX)",
    "بث مباشر في الوقت الفعلي (COINBASE والفوركس العالمي)",
  ],
  "Live Multi-Asset Financial Markets": [
    "Mercados Financieros Multiactivo en Vivo",
    "Live Multi-Asset Financiële Markten",
    "Mercados Financeiros Multiativos ao Vivo",
    "Marchés Financiers Multi-Actifs en Direct",
    "Live Multi-Asset-Finanzmärkte",
    "实时多资产金融市场",
    "Финансовые Рынки Мульти-Активов Онлайн",
    "الأسواق المالية المباشرة متعددة الأصول",
  ],
  "Institutional-grade live spot pricing, orderbook liquidity, and daily volatility across digital assets, precious metals, forex pairs, and commodities.": [
    "Precios spot en vivo de grado institucional, liquidez de libro de órdenes y volatilidad diaria en activos digitales, metales preciosos, divisas y materias primas.",
    "Institutionele live spotprijzen, orderboekliquiditeit en dagelijkse volatiliteit in digitale activa, edelmetalen, valutaparen en grondstoffen.",
    "Preços spot ao vivo de nível institucional, liquidez de livro de ofertas e volatilidade diária em ativos digitais, metais preciosos, forex e commodities.",
    "Cotations spot en direct de qualité institutionnelle, liquidité de carnet d'ordres et volatilité sur les actifs numériques, métaux précieux et devises.",
    "Institutionelle Live-Spotpreise, Orderbuch-Liquidität und tägliche Volatilität für digitale Assets, Edelmetalle, Devisen und Rohstoffe.",
    "横跨数字资产、贵金属、外汇货币对及大宗商品的机构级实时现货价格、订单簿流动性与日内波动率。",
    "Институциональные спотовые цены, ликвидность книги ордеров и дневная волатильность по цифровым активам, металлам, валютам и сырью.",
    "أسعار فورية مباشرة بمستوى مؤسسي وسيولة سجل الأوامر عبر الأصول الرقمية والمعادن الثمينة وأزواج العملات والسلع.",
  ],
  "Refresh Rates": ["Actualizar Cotizaciones", "Koersen Vernieuwen", "Atualizar Cotações", "Actualiser les Cours", "Kurse Aktualisieren", "刷新实时汇率", "Обновить Котировки", "تحديث الأسعار"],
  "Live Spot Feed": ["Cotización Spot en Vivo", "Live Spot Feed", "Cotação Spot ao Vivo", "Flux Spot en Direct", "Live-Spot-Feed", "实时现货数据源", "Спотовый Поток", "بث فوري مباشر"],
  "Trade Asset": ["Operar Activo", "Handel in Activa", "Negociar Ativo", "Négocier l'Actif", "Asset Handeln", "交易该资产", "Торговать", "تداول الأصل"],
  "Cryptocurrency Markets": ["Mercados de Criptomonedas", "Cryptovalutamarkten", "Mercados de Criptomoedas", "Marchés des Cryptomonnaies", "Kryptowährungsmärkte", "加密货币市场", "Рынки Криптовалют", "أسواق العملات الرقمية"],
  "Precious Metals & Commodities": ["Metales Preciosos y Materias Primas", "Edelmetalen & Grondstoffen", "Metais Preciosos e Commodities", "Métaux Précieux & Matières Premières", "Edelmetalle & Rohstoffe", "贵金属与大宗商品", "Драгоценные Металлы и Сырье", "المعادن الثمينة والسلع"],
  "Global Forex & Indices": ["Forex Global e Índices", "Wereldwijde Forex & Indices", "Forex Global e Índices", "Forex Mondial & Indices", "Globale Devisen & Indizes", "全球外汇与股指", "Мировой Форекс и Индексы", "الفوركس والمؤشرات العالمية"],

  // ── Plans, Calculator, Copy Trading, Security, Contact, FAQ Pages ──
  "Institutional Allocation Tiers": ["Niveles de Asignación Institucional", "Institutionele Allocatieniveaus", "Níveis de Alocação Institucional", "Niveaux d'Allocation Institutionnelle", "Institutionelle Allokationsstufen", "机构级资本配置等级", "Институциональные Тарифы", "باقات التخصيص المؤسسي"],
  "High Yield": ["Alto Rendimiento", "Hoog Rendement", "Alto Rendimento", "Haut Rendement", "Hohe Rendite", "高收益优选", "Высокая Доходность", "عائد مرتفع"],
  "Select This Tier": ["Seleccionar Este Nivel", "Selecteer Dit Niveau", "Selecionar Este Nível", "Choisir Ce Niveau", "Diese Stufe Wählen", "选择此等级方案", "Выбрать Тариф", "اختر هذه الباقة"],
  "Allocate Capital": ["Asignar Capital", "Kapitaal Alloceren", "Alocar Capital", "Allouer du Capital", "Kapital Anlegen", "立即配置资金", "Разместить Капитал", "تخصيص رأس المال"],
  "Contact Institutional Support": ["Contactar Soporte Institucional", "Neem Contact op met Support", "Contatar Suporte Institucional", "Contacter le Support Institutionnel", "Institutionellen Support Kontaktieren", "联系机构客服支持", "Связаться с Поддержкой", "التواصل مع الدعم المؤسسي"],
  "Send Message": ["Enviar Mensaje", "Bericht Verzenden", "Enviar Mensagem", "Envoyer le Message", "Nachricht Senden", "发送消息", "Отправить Сообщение", "إرسال الرسالة"],
  "Subject": ["Asunto", "Onderwerp", "Assunto", "Objet", "Betreff", "主题", "Тема", "الموضوع"],
  "Message": ["Mensaje", "Bericht", "Mensagem", "Message", "Nachricht", "消息内容", "Сообщение", "الرسالة"],

  // ── User Dashboard: Wallets Page ──
  "Multi-Currency Custody Wallets": ["Billeteras de Custodia Multidivisa", "Multi-Valuta Custody Wallets", "Carteiras de Custódia Multimoeda", "Portefeuilles de Garde Multidevises", "Multi-Währungs-Wallets", "多币种托管数字钱包", "Мультивалютные Кошельки", "محافظ الحفظ متعددة العملات"],
  "Add Withdrawal Wallet": ["Agregar Billetera de Retiro", "Opnamewallet Toevoegen", "Adicionar Carteira de Saque", "Ajouter un Portefeuille de Retrait", "Auszahlungswallet Hinzufügen", "添加提款钱包地址", "Добавить Кошелек для Вывода", "إضافة محفظة سحب"],
  "Saved Withdrawal Wallets": ["Billeteras de Retiro Guardadas", "Opgeslagen Opnamewallets", "Carteiras de Saque Salvas", "Portefeuilles de Retrait Enregistrés", "Gespeicherte Auszahlungswallets", "已保存的提款钱包", "Сохраненные Кошельки", "محافظ السحب المحفوظة"],
  "Total Deposited": ["Total Depositado", "Totaal Gestort", "Total Depositado", "Total Déposé", "Gesamt Eingezahlt", "累计存入", "Всего Пополнено", "إجمالي الإيداعات"],
  "Total Withdrawn": ["Total Retirado", "Totaal Opgenomen", "Total Sacado", "Total Retiré", "Gesamt Ausgezahlt", "累计提出", "Всего Выведено", "إجمالي السحوبات"],
  "Default": ["Predeterminada", "Standaard", "Padrão", "Par Défaut", "Standard", "默认", "По Умолчанию", "افتراضي"],
  "Set as Default": ["Establecer Predeterminada", "Instellen als Standaard", "Definir como Padrão", "Définir par Défaut", "Als Standard Festlegen", "设为默认地址", "Сделать Основным", "تعيين كافتراضي"],
  "Wallet Address": ["Dirección de Billetera", "Walletadres", "Endereço da Carteira", "Adresse du Portefeuille", "Wallet-Adresse", "钱包地址", "Адрес Кошелька", "عنوان المحفظة"],
  "Network": ["Red", "Netwerk", "Rede", "Réseau", "Netzwerk", "区块链网络", "Сеть", "الشبكة"],

  // ── User Dashboard: Deposits & My Deposits ──
  "Loading platform deposit custody addresses...": ["Cargando direcciones de custodia de depósito...", "Stortingsadressen laden...", "Carregando endereços de custódia de depósito...", "Chargement des adresses de dépôt...", "Einzahlungsadressen werden geladen...", "正在加载平台托管存款地址...", "Загрузка депозитных адресов...", "جاري تحميل عناوين الإيداع..."],
  "Fund Your Account": ["Financie su Cuenta", "Stort Geld op Uw Account", "Financie Sua Conta", "Approvisionner Votre Compte", "Konto Aufladen", "账户资金存入", "Пополнение Счета", "تمويل حسابك"],
  "Select Deposit Asset": ["Seleccionar Activo de Depósito", "Selecteer Stortingsvaluta", "Selecionar Ativo de Depósito", "Sélectionner l'Actif de Dépôt", "Einzahlungswährung Wählen", "选择存入币种", "Выберите Валюту Депозита", "اختر عملة الإيداع"],
  "Deposit History": ["Historial de Depósitos", "Stortingsgeschiedenis", "Histórico de Depósitos", "Historique des Dépôts", "Einzahlungsverlauf", "存款历史记录", "История Депозитов", "سجل الإيداعات"],
  "Submit Deposit Proof": ["Enviar Comprobante de Depósito", "Stortingsbewijs Indienen", "Enviar Comprovante de Depósito", "Soumettre la Preuve de Dépôt", "Einzahlungsnachweis Senden", "提交存款凭证", "Отправить Подтверждение", "إرسال إثبات الإيداع"],
  "Transaction Hash / TXID": ["Hash de Transacción / TXID", "Transactiehash / TXID", "Hash da Transação / TXID", "Hash de Transaction / TXID", "Transaktions-Hash / TXID", "区块链交易哈希 / TXID", "Хэш Транзакции / TXID", "معرف المعاملة / TXID"],
  "Deposit Amount": ["Monto del Depósito", "Stortingsbedrag", "Valor do Depósito", "Montant du Dépôt", "Einzahlungsbetrag", "存款金额", "Сумма Депозита", "مبلغ الإيداع"],
  "New Deposit": ["Nuevo Depósito", "Nieuwe Storting", "Novo Depósito", "Nouveau Dépôt", "Neue Einzahlung", "发起新存款", "Новый Депозит", "إيداع جديد"],

  // ── User Dashboard: Withdrawals & History ──
  "Request Withdrawal": ["Solicitar Retiro", "Opname Aanvragen", "Solicitar Saque", "Demander un Retrait", "Auszahlung Anfordern", "申请提取资金", "Запросить Вывод", "طلب سحب الأموال"],
  "Withdrawable Balance": ["Saldo Retirable", "Opneembaar Saldo", "Saldo Disponível para Saque", "Solde Retirable", "Auszahlbares Guthaben", "可提现余额", "Доступно к Выводу", "الرصيد القابل للسحب"],
  "Withdrawal Amount": ["Monto de Retiro", "Opnamebedrag", "Valor do Saque", "Montant du Retrait", "Auszahlungsbetrag", "提款金额", "Сумма Вывода", "مبلغ السحب"],
  "Destination Address": ["Dirección de Destino", "Bestemmingsadres", "Endereço de Destino", "Adresse de Destination", "Zieladresse", "目标收款地址", "Адрес Получателя", "عنوان الوجهة"],
  "Submit Withdrawal Request": ["Enviar Solicitud de Retiro", "Opnameverzoek Indienen", "Enviar Solicitação de Saque", "Soumettre la Demande de Retrait", "Auszahlungsantrag Senden", "提交提款申请", "Отправить Запрос на Вывод", "إرسال طلب السحب"],
  "New Withdrawal": ["Nuevo Retiro", "Nieuwe Opname", "Novo Saque", "Nouveau Retrait", "Neue Auszahlung", "发起新提款", "Новый Вывод", "سحب جديد"],

  // ── User Dashboard: Investments, Loans, Referrals, Transactions, Tickets, Verification, Settings ──
  "Activate Investment Contract": ["Activar Contrato de Inversión", "Investeringscontract Activeren", "Ativar Contrato de Investimento", "Activer le Contrat d'Investissement", "Anlagevertrag Aktivieren", "激活投资合约", "Активировать Контракт", "تفعيل عقد الاستثمار"],
  "Expected Return": ["Retorno Esperado", "Verwacht Rendement", "Retorno Esperado", "Rendement Attendu", "Erwarteter Ertrag", "预期总回报", "Ожидаемый Доход", "العائد المتوقع"],
  "Maturity Date": ["Fecha de Vencimiento", "Vervaldatum", "Data de Vencimento", "Date d'Échéance", "Fälligkeitsdatum", "到期日期", "Дата Погашения", "تاريخ الاستحقاق"],
  "Identity Verification (KYC)": ["Verificación de Identidad (KYC)", "Identiteitsverificatie (KYC)", "Verificação de Identidade (KYC)", "Vérification d'Identité (KYC)", "Identitätsprüfung (KYC)", "身份合规认证 (KYC)", "Верификация Личности (KYC)", "توثيق الهوية (KYC)"],
  "Submit Verification Documents": ["Enviar Documentos de Verificación", "Verificatiedocumenten Indienen", "Enviar Documentos de Verificação", "Soumettre les Documents", "Verifizierungsdokumente Einreichen", "提交身份认证文件", "Отправить Документы", "إرسال مستندات التوثيق"],
  "Document Type": ["Tipo de Documento", "Documenttype", "Tipo de Documento", "Type de Document", "Dokumenttyp", "证件类型", "Тип Документа", "نوع المستند"],
  "Passport": ["Pasaporte", "Paspoort", "Passaporte", "Passeport", "Reisepass", "护照", "Паспорт", "جواز سفر"],
  "Driver's License": ["Licencia de Conducir", "Rijbewijs", "Carteira de Motorista", "Permis de Conduire", "Führerschein", "驾驶执照", "Водительское Удостоверение", "رخصة قيادة"],
  "National ID Card": ["Documento Nacional de Identidad", "Identiteitskaart", "Carteira de Identidade Nacional", "Carte Nationale d'Identité", "Personalausweis", "国民身份证", "Национальный ID", "بطاقة الهوية الوطنية"],
  "Open New Ticket": ["Abrir Nuevo Ticket", "Nieuw Ticket Openen", "Abrir Novo Chamado", "Ouvrir un Nouveau Ticket", "Neues Ticket Eröffnen", "创建新客服工单", "Создать Тикет", "فتح تذكرة دعم جديدة"],
  "Change Password": ["Cambiar Contraseña", "Wachtwoord Wijzigen", "Alterar Senha", "Changer le Mot de Passe", "Passwort Ändern", "修改登录密码", "Сменить Пароль", "تغيير كلمة المرور"],
  "Current Password": ["Contraseña Actual", "Huidig Wachtwoord", "Senha Atual", "Mot de Passe Actuel", "Aktuelles Passwort", "当前密码", "Текущий Пароль", "كلمة المرور الحالية"],
  "New Password": ["Nueva Contraseña", "Nieuw Wachtwoord", "Nova Senha", "Nouveau Mot de Passe", "Neues Passwort", "新密码", "Новый Пароль", "كلمة المرور الجديدة"],
  "Confirm New Password": ["Confirmar Nueva Contraseña", "Bevestig Nieuw Wachtwoord", "Confirmar Nova Senha", "Confirmer le Nouveau Mot de Passe", "Neues Passwort Bestätigen", "确认新密码", "Подтвердите Новый Пароль", "تأكيد كلمة المرور الجديدة"],
  "Profile Information": ["Información del Perfil", "Profielinformatie", "Informações do Perfil", "Informations du Profil", "Profilinformationen", "个人资料信息", "Данные Профиля", "معلومات الملف الشخصي"],
  "Account Settings": ["Configuración de la Cuenta", "Accountinstellingen", "Configurações da Conta", "Paramètres du Compte", "Kontoeinstellungen", "账户设置", "Настройки Аккаунта", "إعدادات الحساب"],
  "Personal profile updated successfully.": ["Perfil personal actualizado con éxito.", "Persoonlijk profiel succesvol bijgewerkt.", "Perfil pessoal atualizado com sucesso.", "Profil personnel mis à jour avec succès.", "Persönliches Profil erfolgreich aktualisiert.", "个人资料更新成功。", "Профиль успешно обновлен.", "تم تحديث الملف الشخصي بنجاح."],
  "Phone Number": ["Número de Teléfono", "Telefoonnummer", "Número de Telefone", "Numéro de Téléphone", "Telefonnummer", "电话号码", "Номер Телефона", "رقم الهاتف"],
  "Country": ["País", "Land", "País", "Pays", "Land", "国家 / 地区", "Страна", "الدولة"],
  "City": ["Ciudad", "Stad", "Cidade", "Ville", "Stadt", "城市", "Город", "المدينة"],
  "Residential Address": ["Dirección Residencial", "Woonadres", "Endereço Residencial", "Adresse Résidentielle", "Wohnadresse", "居住地址", "Адрес Проживания", "عنوان السكن"],

  // ── Admin Dashboard Cards & Subpages ──
  "Accounts, KYC, balances & suspensions": ["Cuentas, KYC, saldos y suspensiones", "Accounts, KYC, saldi & schorsingen", "Contas, KYC, saldos e suspensões", "Comptes, KYC, soldes & suspensions", "Konten, KYC, Salden & Sperrungen", "账户、KYC、余额与冻结管理", "Аккаунты, KYC, балансы и блокировки", "الحسابات وتوثيق الهوية والأرصدة"],
  "Proof review & custody verifications": ["Revisión de comprobantes y custodia", "Bewijsbeoordeling & custodiecontrole", "Revisão de comprovantes e custódia", "Vérification des preuves & garde", "Nachweisprüfung & Verwahrung", "存款凭证审核与入账确认", "Проверка переводов и зачисление", "مراجعة الإثباتات وتأكيد الإيداعات"],
  "Dispatches & reinvestment actions": ["Envíos de pagos y reinversiones", "Uitbetalingen & herinvesteringen", "Envios de saques e reinvestimentos", "Expéditions & réinvestissements", "Auszahlungen & Reinvestitionen", "提款发放与复投操作", "Выплаты и реинвестирование", "إرسال السحوبات وإعادة الاستثمار"],
  "Immutable financial ledger records": ["Registros contables financieros inmutables", "Onveranderlijke financiële grootboekrecords", "Registros contábeis financeiros imutáveis", "Registres financiers immuables", "Unveränderliche Finanzbuchhaltung", "不可篡改的财务账本流水", "Неизменяемый финансовый реестр", "سجلات دفتر الأستاذ المالي"],
  "Unexpired contracts & maturity": ["Contratos vigentes y vencimientos", "Lopende contracten & vervaldata", "Contratos vigentes e vencimentos", "Contrats actifs & échéances", "Laufende Verträge & Fälligkeiten", "未到期投资合约与到期管理", "Действующие контракты и сроки", "العقود النشطة وتواريخ الاستحقاق"],
  "Commission network & top referrers": ["Red de comisiones y principales referidores", "Commissienetwerk & topverwijzers", "Rede de comissões e principais indicadores", "Réseau de commissions & parrains", "Provisionsnetzwerk & Top-Werber", "佣金网络与顶级推荐人", "Партнерская сеть и лидеры", "شبكة العمولات وأفضل المحيلين"],
  "Market rates & bridge controls": ["Tasas de mercado y controles de cambio", "Marktkoersen & wisselcontroles", "Taxas de mercado e controles de câmbio", "Taux du marché & contrôles", "Marktkurse & Wechselkontrollen", "市场汇率与跨币种兑换控制", "Рыночные курсы и обмен", "أسعار السوق وضوابط الصرف"],
  "Custom templates & previewer": ["Plantillas personalizadas y vista previa", "Aangepaste sjablonen & voorbeeld", "Modelos personalizados e pré-visualização", "Modèles personnalisés & aperçu", "Vorlagen & Vorschau", "自定义邮件模板与预览", "Шаблоны писем и предпросмотр", "قوالب مخصصة ومعاينة مباشرة"],
  "System alerts & user broadcast": ["Alertas del sistema y difusión a usuarios", "Systeemmeldingen & gebruikersuitzending", "Alertas do sistema e transmissão", "Alertes système & diffusion", "Systemwarnungen & Rundschreiben", "系统警报与全员广播通知", "Системные оповещения и рассылка", "تنبيهات النظام والبث للمستخدمين"],
  "Traceable admin & security events": ["Eventos de seguridad y administración trazables", "Traceerbare beheer- & beveiligingslogboeken", "Eventos rastreáveis de admin e segurança", "Événements d'audit & sécurité", "Nachvollziehbare Sicherheitsereignisse", "可追溯的管理员与安全事件", "Журнал действий и безопасности", "أحداث الإدارة والأمان القابلة للتتبع"],
  "Maintenance mode & login rules": ["Modo mantenimiento y reglas de acceso", "Onderhoudsmodus & inlogregels", "Modo de manutenção e regras de login", "Mode maintenance & règles d'accès", "Wartungsmodus & Anmelderegeln", "维护模式与登录安全策略", "Режим обслуживания и правила входа", "وضع الصيانة وقواعد تسجيل الدخول"],
  "Global parameters & auto-withdrawal": ["Parámetros globales y retiro automático", "Globale parameters & auto-opname", "Parâmetros globais e saque automático", "Paramètres globaux & retrait auto", "Globale Parameter & Auto-Auszahlung", "全局系统参数与自动提款配置", "Глобальные параметры платформы", "المعلمات العامة والسحب التلقائي"],
  "Total Users": ["Usuarios Totales", "Totaal Gebruikers", "Total de Usuários", "Total Utilisateurs", "Benutzer Gesamt", "总用户数", "Всего Пользователей", "إجمالي المستخدمين"],
  "Active Users": ["Usuarios Activos", "Actieve Gebruikers", "Usuários Ativos", "Utilisateurs Actifs", "Aktive Benutzer", "活跃用户", "Активные Пользователи", "المستخدمون النشطون"],
  "Suspended Users": ["Usuarios Suspendidos", "Geschorste Gebruikers", "Usuários Suspensos", "Utilisateurs Suspendus", "Gesperrte Benutzer", "已冻结用户", "Заблокированные", "المستخدمون الموقوفون"],
  "Pending Deposits": ["Depósitos Pendientes", "Stortingen in Afwachting", "Depósitos Pendentes", "Dépôts en Attente", "Ausstehende Einzahlungen", "待审存款", "Ожидающие Депозиты", "الإيداعات المعلقة"],
  "Pending Withdrawals": ["Retiros Pendientes", "Opnames in Afwachting", "Saques Pendentes", "Retraits en Attente", "Ausstehende Auszahlungen", "待审提款", "Ожидающие Выводы", "السحوبات المعلقة"],
  "Total Transactions": ["Transacciones Totales", "Totaal Transacties", "Total de Transações", "Total Transactions", "Transaktionen Gesamt", "总交易笔数", "Всего Транзакций", "إجمالي المعاملات"],
};
