// ============================================
// HORIZON EQUITY - PLATFORM-WIDE PHRASE & PATTERN TRANSLATOR
// Covers Public Pages, Auth, User Dashboard, Admin Dashboard & Dynamic Strings
// ============================================

import { LanguageCode, translations } from "../translations";
import { EXTENDED_PHRASES } from "./extended-phrases";

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

/**
 * Compact multi-language phrase table keyed by exact English UI string.
 * Order of tuple: [es, nl, pt, fr, de, zh, ru, ar]
 */
const BASE_PHRASE_TABLE: Record<string, LangTuple> = {
  // ── Public Nav & Footer ──
  "Markets": ["Mercados", "Markten", "Mercados", "Marchés", "Märkte", "市场行情", "Рынки", "الأسواق"],
  "Investment Plans": ["Planes de Inversión", "Investeringsplannen", "Planos de Investimento", "Plans d'Investissement", "Anlagepläne", "投资方案", "Инвест-планы", "خطط الاستثمار"],
  "Yield Calculator": ["Calculadora de Rendimiento", "Rendementscalculator", "Calculadora de Rendimento", "Calculateur de Rendement", "Renditerechner", "收益计算器", "Калькулятор Доходности", "حاسبة العوائد"],
  "Copy Trading": ["Copy Trading", "Copy Trading", "Copy Trading", "Copy Trading", "Copy Trading", "跟单交易", "Копи-трейдинг", "نسخ الصفقات"],
  "Security & Governance": ["Seguridad y Gobernanza", "Beveiliging & Governance", "Segurança e Governança", "Sécurité & Gouvernance", "Sicherheit & Governance", "安全与合规", "Безопасность и Надзор", "الأمان والحوكمة"],
  "Sign In": ["Iniciar Sesión", "Inloggen", "Entrar", "Connexion", "Anmelden", "登录", "Войти", "تسجيل الدخول"],
  "Open Account": ["Abrir Cuenta", "Rekening Openen", "Abrir Conta", "Ouvrir un Compte", "Konto Eröffnen", "立即开户", "Открыть Счет", "فتح حساب"],
  "Interface Language": ["Idioma de la Interfaz", "Interfacetaal", "Idioma da Interface", "Langue de l'Interface", "Oberflächensprache", "界面语言", "Язык Интерфейса", "لغة الواجهة"],
  "Precious Metals & Gold": ["Metales Preciosos y Oro", "Edelmetalen & Goud", "Metais Preciosos e Ouro", "Métaux Précieux & Or", "Edelmetalle & Gold", "贵金属与黄金", "Драгоценные Металлы и Золото", "المعادن الثمينة والذهب"],
  "Crypto (BTC / ETH / SOL)": ["Cripto (BTC / ETH / SOL)", "Crypto (BTC / ETH / SOL)", "Cripto (BTC / ETH / SOL)", "Crypto (BTC / ETH / SOL)", "Krypto (BTC / ETH / SOL)", "加密货币 (BTC / ETH / SOL)", "Крипто (BTC / ETH / SOL)", "العملات الرقمية (BTC / ETH / SOL)"],
  "Forex Hub (G10 Pairs)": ["Centro Forex (Pares G10)", "Forex Hub (G10 Paren)", "Hub Forex (Pares G10)", "Hub Forex (Paires G10)", "Forex-Hub (G10-Paare)", "外汇中心 (G10 货币对)", "Форекс Хаб (Пары G10)", "مركز الفوركس (أزواج G10)"],
  "Oil, Gas & Energy Futures": ["Futuros de Petróleo, Gas y Energía", "Olie, Gas & Energie Futures", "Futuros de Petróleo, Gás e Energia", "Contrats Pétrole, Gaz & Énergie", "Öl-, Gas- & Energie-Futures", "石油、天然气与能源期货", "Фьючерсы Нефть, Газ и Энергия", "عقود النفط والغاز والطاقة"],
  "Real Estate Syndicates": ["Sindicatos Inmobiliarios", "Vastgoedsyndicaten", "Sindicatos Imobiliários", "Syndicats Immobiliers", "Immobilien-Syndikate", "房地产投资银团", "Синдикаты Недвижимости", "اتحادات العقارات"],
  "Desks & Legal": ["Mesas y Legal", "Desks & Juridisch", "Mesas e Jurídico", "Bureaux & Légal", "Desks & Rechtliches", "交易台与法律", "Дески и Право", "المكاتب والشؤون القانونية"],
  "Global Trading Desks": ["Mesas de Trading Globales", "Wereldwijde Trading Desks", "Mesas Globais de Negociação", "Bureaux de Trading Mondiaux", "Globale Trading-Desks", "全球交易柜台", "Глобальные Трейдинг-Дески", "مكاتب التداول العالمية"],
  "Frequently Asked Questions": ["Preguntas Frecuentes", "Veelgestelde Vragen", "Perguntas Frequentes", "Questions Fréquemment Posées", "Häufig Gestellte Fragen", "常见问题解答", "Часто Задаваемые Вопросы", "الأسئلة الشائعة"],
  "Cold Vault Security": ["Seguridad de Bóveda Fría", "Koude Kluis Beveiliging", "Segurança de Cofre Frio", "Sécurité Coffre Froid", "Cold-Vault-Sicherheit", "冷金库安全保障", "Безопасность Холодного Хранилища", "أمان الخزائن الباردة"],
  "Terms and Conditions": ["Términos y Condiciones", "Algemene Voorwaarden", "Termos e Condições", "Conditions Générales", "Allgemeine Geschäftsbedingungen", "服务条款与条件", "Условия и Положения", "الشروط والأحكام"],
  "Privacy & Data Security": ["Privacidad y Seguridad de Datos", "Privacy & Gegevensbeveiliging", "Privacidade e Segurança de Dados", "Confidentialité & Sécurité des Données", "Datenschutz & Datensicherheit", "隐私与数据安全", "Конфиденциальность и Защита Данных", "الخصوصية وأمن البيانات"],
  "Risk Disclosure": ["Aviso de Riesgo", "Risicowaarschuwing", "Declaração de Risco", "Avertissement sur les Risques", "Risikohinweis", "风险披露声明", "Уведомление о Рисках", "إفصاح المخاطر"],
  "Terms": ["Términos", "Voorwaarden", "Termos", "Conditions", "AGB", "条款", "Условия", "الشروط"],
  "Privacy": ["Privacidad", "Privacy", "Privacidade", "Confidentialité", "Datenschutz", "隐私", "Конфиденциальность", "الخصوصية"],
  "Risk": ["Riesgo", "Risico", "Risco", "Risque", "Risiko", "风险", "Риск", "المخاطر"],
  "Contact": ["Contacto", "Contact", "Contato", "Contact", "Kontakt", "联系我们", "Контакты", "اتصل بنا"],

  // ── Homepage Sections & Plans ──
  "METALS · CRYPTO · FOREX · ENERGY · REAL ESTATE": [
    "METALES · CRIPTO · FOREX · ENERGÍA · BIENES RAÍCES",
    "METALEN · CRYPTO · FOREX · ENERGIE · VASTGOED",
    "METAIS · CRIPTO · FOREX · ENERGIA · IMÓVEIS",
    "MÉTAUX · CRYPTO · FOREX · ÉNERGIE · IMMOBILIER",
    "METALLE · KRYPTO · FOREX · ENERGIE · IMMOBILIEN",
    "贵金属 · 加密货币 · 外汇 · 能源 · 房地产",
    "МЕТАЛЛЫ · КРИПТО · ФОРЕКС · ЭНЕРГИЯ · НЕДВИЖИМОСТЬ",
    "المعادن · الكريبتو · الفوركس · الطاقة · العقارات",
  ],
  "Trade Beyond": ["Opere Más Allá de", "Handel Verder dan", "Negocie Além de", "Investissez Au-Delà", "Handeln Sie Über", "超越单一市场，", "Торгуйте за Пределами", "تداول أبعد من"],
  "a Single Market.": ["un Solo Mercado.", "Één Enkele Markt.", "um Único Mercado.", "d'un Seul Marché.", "Einen Markt Hinaus.", "全球多元交易。", "Одного Рынка.", "سوق واحد."],
  "Explore opportunities across precious metals, crypto, forex, energy, and real estate through one connected investment platform.": [
    "Explore oportunidades en metales preciosos, criptomonedas, divisas forex, energía y bienes raíces desde una plataforma conectada.",
    "Ontdek kansen in edelmetalen, crypto, forex, energie en vastgoed via één verbonden institutioneel beleggingsplatform.",
    "Explore oportunidades em metais preciosos, criptoativos, forex, energia e imóveis através de uma plataforma de investimento conectada.",
    "Explorez des opportunités sur les métaux précieux, les cryptomonnaies, le forex, l'énergie et l'immobilier via une plateforme connectée.",
    "Entdecken Sie Chancen in Edelmetallen, Krypto, Forex, Energie und Immobilien über eine vernetzte Investmentplattform.",
    "通过一个互联的机构级投资平台，把握贵金属、加密货币、外汇、能源与房地产领域的全球增长机遇。",
    "Откройте возможности в драгоценных металлах, криптовалютах, форексе, энергетике и недвижимости на единой платформе.",
    "استكشف الفرص الاستثمارية عبر المعادن الثمينة والعملات الرقمية والفوركس والطاقة والعقارات من خلال منصة متكاملة واحدة.",
  ],
  "Get Started": ["Comenzar Ahora", "Aan de Slag", "Começar Agora", "Commencer", "Jetzt Starten", "立即开始", "Начать", "ابدأ الآن"],
  "Explore Markets": ["Explorar Mercados", "Markten Verkennen", "Explorar Mercados", "Explorer les Marchés", "Märkte Entdecken", "探索市场", "Обзор Рынков", "استكشف الأسواق"],
  "Aggregated Volume": ["Volumen Agregado", "Geaggregeerd Volume", "Volume Agregado", "Volume Agrégé", "Gesamtvolumen", "累计成交量", "Совокупный Объем", "إجمالي حجم التداول"],
  "Active Desks": ["Mesas Activas", "Actieve Desks", "Mesas Ativas", "Bureaux Actifs", "Aktive Desks", "活跃交易席位", "Активных Десков", "المكاتب النشطة"],
  "140+ Jurisdictions": ["140+ Jurisdicciones", "140+ Jurisdicties", "140+ Jurisdições", "140+ Juridictions", "140+ Jurisdiktionen", "140+ 司法管辖区", "140+ Юрисдикций", "140+ دولة"],
  "Yield Ceiling": ["Techo de Rendimiento", "Maximale Rente", "Teto de Rendimento", "Plafond de Rendement", "Maximale Rendite", "收益上限", "Потолок Доходности", "سقف العوائد"],
  "Up to 45%": ["Hasta 45%", "Tot 45%", "Até 45%", "Jusqu'à 45%", "Bis zu 45%", "高达 45%", "До 45%", "حتى 45%"],
  "Fixed Maturity": ["Vencimiento Fijo", "Vaste Looptijd", "Vencimento Fixo", "Échéance Fixe", "Feste Laufzeit", "固定到期结算", "Фиксированный Срок", "استحقاق ثابت"],
  "Execution Latency": ["Latencia de Ejecución", "Uitvoeringslatentie", "Latência de Execução", "Latence d'Exécution", "Ausführungslatenz", "执行延迟", "Задержка Исполнения", "سرعة التنفيذ"],
  "LIVE MARKETS": ["MERCADOS EN VIVO", "LIVE MARKTEN", "MERCADOS AO VIVO", "MARCHÉS EN DIRECT", "LIVE-MÄRKTE", "实时行情", "РЫНКИ ОНЛАЙН", "الأسواق المباشرة"],
  "Precious Metals & Bullion": ["Metales Preciosos y Lingotes", "Edelmetalen & Goudbaren", "Metais Preciosos e Ouro", "Métaux Précieux & Lingots", "Edelmetalle & Barren", "贵金属与金银储备", "Драгоценные Металлы и Слитки", "المعادن الثمينة والسبائك"],
  "Physical gold and silver allocations vaulted in Zurich and London with spot liquidity, instant settlement, and audit guarantees.": [
    "Asignaciones físicas de oro y plata custodiadas en Zúrich y Londres con liquidez inmediata y auditoría garantizada.",
    "Fysieke goud- en zilverallocaties opgeslagen in Zürich en Londen met directe spotliquiditeit en auditgaranties.",
    "Alocações físicas de ouro e prata custodiadas em Zurique e Londres com liquidez imediata e garantias de auditoria.",
    "Allocations physiques d'or et d'argent conservées à Zurich et Londres avec liquidité immédiate et garanties d'audit.",
    "Physische Gold- und Silberallokationen in Zürich und London mit sofortiger Liquidität und Prüfungsgarantie.",
    "存放于苏黎世和伦敦金库的实物黄金与白银配置，具备现货流动性、即时结算与审计保障。",
    "Физическое золото и серебро в хранилищах Цюриха и Лондона с мгновенной ликвидностью и аудитом.",
    "تخصيصات ذهب وفضة فعلية محفوظة في خزائن زيورخ ولندن مع سيولة فورية وضمانات تدقيق كاملة.",
  ],
  "Spot Metals Orderbook": ["Libro de Órdenes de Metales", "Spot Metalen Orderboek", "Livro de Ofertas de Metais", "Carnet d'Ordres Métaux", "Edelmetall-Orderbuch", "贵金属现货订单簿", "Книга Ордеров по Металлам", "سجل أوامر المعادن الفورية"],
  "Cryptocurrency Perpetuals": ["Perpetuos de Criptomonedas", "Crypto Perpetuals", "Perpétuos de Criptomoedas", "Perpétuels Cryptomonnaies", "Krypto-Perpetuals", "加密货币永续合约", "Криптовалютные Перпетуалы", "عقود العملات الرقمية الدائمة"],
  "Sub-millisecond execution across BTC, ETH, SOL, and 120+ digital asset pairs backed by cold multi-sig custody.": [
    "Ejecución en submilisegundos para BTC, ETH, SOL y más de 120 pares digitales respaldados por custodia en frío multifirma.",
    "Sub-milliseconde uitvoering voor BTC, ETH, SOL en 120+ digitale valutaparen ondersteund door multi-sig koude opslag.",
    "Execução em sub-milissegundos para BTC, ETH, SOL e mais de 120 pares digitais com custódia fria multi-assinatura.",
    "Exécution sub-milliseconde sur BTC, ETH, SOL et plus de 120 paires numériques sécurisées en coffres froids multi-sig.",
    "Sub-Millisekunden-Ausführung für BTC, ETH, SOL und 120+ digitale Paare mit Multi-Sig Cold Custody.",
    "亚毫秒级执行 BTC、ETH、SOL 等 120+ 数字资产交易对，多重签名冷钱包安全托管。",
    "Субмиллисекундное исполнение по BTC, ETH, SOL и 120+ парам с холодным мультиподписным хранением.",
    "تنفيذ فائق السرعة لأزواج BTC وETH وSOL وأكثر من 120 أصلاً رقمياً مدعوماً بالحفظ البارد متعدد التوقيع.",
  ],
  "Digital Asset Orderbooks": ["Libros de Activos Digitales", "Digitale Activa Orderboeken", "Livros de Ativos Digitais", "Carnets d'Actifs Numériques", "Krypto-Orderbücher", "数字资产订单簿", "Книги Цифровых Активов", "سجلات الأصول الرقمية"],
  "Global Forex Desks": ["Mesas Globales de Forex", "Wereldwijde Forex Desks", "Mesas Globais de Forex", "Bureaux Forex Mondiaux", "Globale Forex-Desks", "全球外汇交易台", "Мировые Форекс-Дески", "مكاتب الفوركس العالمية"],
  "Institutional pricing across G10 and emerging currency pairs with micro-pip spreads and aggregated Tier-1 liquidity.": [
    "Precios institucionales en pares G10 y emergentes con spreads mínimos y liquidez Tier-1 agregada.",
    "Institutionele prijzen voor G10- en opkomende valutaparen met micro-pip spreads en Tier-1 liquiditeit.",
    "Preços institucionais em pares de moedas G10 e emergentes com spreads mínimos e liquidez Tier-1.",
    "Tarification institutionnelle sur les paires G10 et émergentes avec spreads ultra-serrés et liquidité Tier-1.",
    "Institutionelle Kurse für G10- und Schwellenländerwährungen mit engsten Spreads.",
    "G10 及新兴市场货币对机构级报价，微点差与一级流动性聚合。",
    "Институциональные котировки по валютным парам G10 с минимальными спредами и ликвидностью Tier-1.",
    "تسعير مؤسسي لأزواج عملات G10 والأسواق الناشئة بفروق أسعار دقيقة وسيولة من الفئة الأولى.",
  ],
  "G10 Currency Hub": ["Centro de Divisas G10", "G10 Valuta Hub", "Hub de Moedas G10", "Hub Devises G10", "G10 Währungs-Hub", "G10 外汇枢纽", "Валютный Хаб G10", "مركز عملات G10"],
  "Oil, Gas & Energy": ["Petróleo, Gas y Energía", "Olie, Gas & Energie", "Petróleo, Gás e Energia", "Pétrole, Gaz & Énergie", "Öl, Gas & Energie", "石油、天然气与能源", "Нефть, Газ и Энергетика", "النفط والغاز والطاقة"],
  "Exposure to global benchmark Brent crude, West Texas Intermediate, natural gas, and sustainable energy infrastructure yield.": [
    "Exposición al crudo Brent, WTI, gas natural y rendimiento en infraestructura de energía sostenible.",
    "Blootstelling aan Brent-olie, WTI, aardgas en duurzaam rendement uit energie-infrastructuur.",
    "Exposição ao petróleo Brent, WTI, gás natural e rendimento em infraestrutura de energia sustentável.",
    "Exposition au pétrole Brent, WTI, gaz naturel et rendement d'infrastructures énergétiques durables.",
    "Zugang zu Brent-Rohöl, WTI, Erdgas und nachhaltigen Energieinfrastruktur-Renditen.",
    "覆盖布伦特原油、WTI 原油、天然气及可持续能源基础设施收益。",
    "Доступ к нефти Brent, WTI, природному газу и доходности энергетической инфраструктуры.",
    "تعرض مباشر لخام برنت وخام غرب تكساس والغاز الطبيعي وعوائد البنية التحتية للطاقة المستدامة.",
  ],
  "Energy Contracts": ["Contratos de Energía", "Energiecontracten", "Contratos de Energia", "Contrats d'Énergie", "Energiekontrakte", "能源合约", "Энергетические Контракты", "عقود الطاقة"],
  "Commercial property debt and fractional ownership of premium metropolitan developments with quarterly rent yield distributions.": [
    "Deuda inmobiliaria comercial y propiedad fraccionada de desarrollos metropolitanos premium con distribuciones trimestrales.",
    "Commercieel vastgoedkrediet en fractioneel eigendom van grootstedelijke projecten met kwartaaluitkeringen.",
    "Dívida imobiliária comercial e propriedade fracionada de empreendimentos metropolitanos premium.",
    "Dette immobilière commerciale et propriété fractionnée d'actifs métropolitains premium avec revenus trimestriels.",
    "Gewerbliche Immobilienkredite und Teileigentum an erstklassigen Großstadtprojekten.",
    "商业地产债权与核心都会高端地产份额认购，按季派发租金收益。",
    "Коммерческая недвижимость и долевое владение премиальными объектами с квартальными выплатами.",
    "ديون العقارات التجارية والملكية الجزئية للمشاريع الحضرية الفاخرة مع توزيعات عوائد ربع سنوية.",
  ],
  "Property Portfolios": ["Carteras Inmobiliarias", "Vastgoedportefeuilles", "Portfólios Imobiliários", "Portefeuilles Immobiliers", "Immobilienportfolios", "地产投资组合", "Портфели Недвижимости", "المحافظ العقارية"],
  "Mirror Trading Protocol": ["Protocolo de Copy Trading", "Mirror Trading Protocol", "Protocolo de Copy Trading", "Protocole de Copy Trading", "Mirror-Trading-Protokoll", "智能镜像跟单协议", "Протокол Копи-Трейдинга", "بروتوكول نسخ التداول"],
  "Replicate verified master quantitative traders automatically in real-time with customizable stop-loss rules and transparent win-rates.": [
    "Replique automáticamente en tiempo real a operadores cuantitativos verificados con reglas de stop-loss personalizables.",
    "Kopieer geverifieerde kwantitatieve toptraders automatisch in realtime met instelbare stop-loss regels.",
    "Replique traders quantitativos verificados automaticamente em tempo real com regras de stop-loss personalizáveis.",
    "Répliquez automatiquement en temps réel des traders quantitatifs vérifiés avec règles de stop-loss personnalisables.",
    "Replizieren Sie geprüfte quantitative Top-Trader automatisch in Echtzeit mit anpassbaren Stop-Loss-Regeln.",
    "实时自动复制经认证的量化交易大师策略，支持自定义止损规则与透明胜率记录。",
    "Автоматическое копирование сделок проверенных квант-трейдеров в реальном времени с настройкой стоп-лосса.",
    "انسخ صفقات كبار المتداولين الكميين الموثقين تلقائياً في الوقت الفعلي مع قواعد وقف خسارة قابلة للتخصيص.",
  ],
  "View Trader Leaderboard": ["Ver Clasificación de Traders", "Bekijk Trader Ranglijst", "Ver Ranking de Traders", "Voir le Classement des Traders", "Trader-Rangliste Ansehen", "查看交易员排行榜", "Рейтинг Трейдеров", "عرض قائمة المتصدرين"],
  "STRUCTURED CAPITAL STRATEGIES": ["ESTRATEGIAS DE CAPITAL ESTRUCTURADO", "GESTRUCTUREERDE KAPITAALSTRATEGIEËN", "ESTRATÉGIAS DE CAPITAL ESTRUTURADO", "STRATÉGIES DE CAPITAL STRUCTURÉES", "STRUKTURIERTE KAPITALSTRATEGIEN", "结构化资本策略", "СТРУКТУРИРОВАННЫЕ СТРАТЕГИИ КАПИТАЛА", "استراتيجيات رأس المال المهيكلة"],
  "Fixed-Yield Investment Tiers": ["Niveles de Inversión de Rendimiento Fijo", "Beleggingsplannen met Vast Rendement", "Níveis de Investimento de Rendimento Fixo", "Niveaux d'Investissement à Rendement Fixe", "Festverzinsliche Anlagestufen", "固定收益投资等级", "Инвестиционные Уровни с Фиксированной Доходностью", "باقات الاستثمار ذات العائد الثابت"],
  "Four distinct allocation tiers engineered for capital preservation, institutional arbitrage, and guaranteed maturity payouts.": [
    "Cuatro niveles diseñados para la preservación del capital, arbitraje institucional y pagos garantizados al vencimiento.",
    "Vier gestructureerde allocatieniveaus ontworpen voor kapitaalbehoud, institutionele arbitrage en gegarandeerde uitbetalingen.",
    "Quatro níveis distintos projetados para preservação de capital, arbitragem institucional e pagamentos garantidos no vencimento.",
    "Quatre niveaux d'allocation conçus pour la préservation du capital, l'arbitrage institutionnel et des paiements garantis à l'échéance.",
    "Vier strukturierte Allokationsstufen für Kapitalerhalt, institutionelle Arbitrage und garantierte Auszahlungen.",
    "专为资本保值、机构套利及到期保证兑付而设计的四大结构化配置等级。",
    "Четыре уровня аллокации, разработанные для сохранения капитала, арбитража и гарантированных выплат.",
    "أربع باقات استثمارية مصممة لحماية رأس المال والمراجحة المؤسسية وعوائد الاستحقاق المضمونة.",
  ],
  "Compare All Plan Specifications": ["Comparar Todas las Especificaciones", "Vergelijk Alle Planspecificaties", "Comparar Todas as Especificações", "Comparer Toutes les Spécifications", "Alle Planspezifikationen Vergleichen", "对比所有方案详情", "Сравнить Все Характеристики Планов", "مقارنة جميع مواصفات الخطط"],
  "Silver Tier": ["Nivel Plata", "Zilver Niveau", "Nível Prata", "Niveau Argent", "Silber-Stufe", "白银等级", "Уровень Silver", "الباقة الفضية"],
  "Gold Tier": ["Nivel Oro", "Goud Niveau", "Nível Ouro", "Niveau Or", "Gold-Stufe", "黄金等级", "Уровень Gold", "الباقة الذهبية"],
  "Platinum Tier": ["Nivel Platino", "Platina Niveau", "Nível Platina", "Niveau Platine", "Platin-Stufe", "铂金等级", "Уровень Platinum", "الباقة البلاتينية"],
  "Diamond Tier": ["Nivel Diamante", "Diamant Niveau", "Nível Diamante", "Niveau Diamant", "Diamant-Stufe", "钻石等级", "Уровень Diamond", "الباقة الماسية"],
  "Entry Tier": ["Nivel Inicial", "Instapniveau", "Nível de Entrada", "Niveau Initial", "Einstiegsstufe", "入门等级", "Базовый Уровень", "باقة البداية"],
  "Most Popular": ["Más Popular", "Meest Populair", "Mais Popular", "Le Plus Populaire", "Am Beliebtesten", "最受欢迎", "Самый Популярный", "الأكثر شعبية"],
  "Institutional": ["Institucional", "Institutioneel", "Institucional", "Institutionnel", "Institutionell", "机构专享", "Институциональный", "مؤسسي"],
  "VIP Unlimited": ["VIP Ilimitado", "VIP Onbeperkt", "VIP Ilimitado", "VIP Illimité", "VIP Unbegrenzt", "VIP 无上限", "VIP Безлимит", "كبار العملاء غير محدود"],
  "Net Fixed ROI": ["ROI Fijo Neto", "Netto Vast ROI", "ROI Fixo Líquido", "ROI Fixe Net", "Netto-Festrendite", "固定净收益率", "Чистый Фикс. ROI", "صافي العائد الثابت"],
  "Min Entry:": ["Entrada Mín:", "Min. Inleg:", "Entrada Mín:", "Entrée Min:", "Min. Einzahlung:", "最低投入:", "Мин. Вход:", "الحد الأدنى:"],
  "Max Entry:": ["Entrada Máx:", "Max. Inleg:", "Entrada Máx:", "Entrée Max:", "Max. Einzahlung:", "最高投入:", "Макс. Вход:", "الحد الأقصى:"],
  "Unlimited": ["Ilimitado", "Onbeperkt", "Ilimitado", "Illimité", "Unbegrenzt", "无上限", "Безлимитно", "غير محدود"],
  "Cycle Duration:": ["Duración del Ciclo:", "Looptijd Cyclus:", "Duração do Ciclo:", "Durée du Cycle:", "Zyklusdauer:", "运作周期:", "Длительность Цикла:", "مدة الدورة:"],
  "15.0% fixed contract return": ["15.0% de retorno fijo por contrato", "15,0% vast contractrendement", "15,0% de retorno fixo do contrato", "15,0% de rendement fixe sur contrat", "15,0% feste Vertragsrendite", "15.0% 固定合约收益率", "15.0% фиксированная доходность", "عائد عقد ثابت بنسبة 15.0%"],
  "20.0% fixed contract return": ["20.0% de retorno fijo por contrato", "20,0% vast contractrendement", "20,0% de retorno fixo do contrato", "20,0% de rendement fixe sur contrat", "20,0% feste Vertragsrendite", "20.0% 固定合约收益率", "20.0% фиксированная доходность", "عائد عقد ثابت بنسبة 20.0%"],
  "35.0% fixed contract return": ["35.0% de retorno fijo por contrato", "35,0% vast contractrendement", "35,0% de retorno fixo do contrato", "35,0% de rendement fixe sur contrat", "35,0% feste Vertragsrendite", "35.0% 固定合约收益率", "35.0% фиксированная доходность", "عائد عقد ثابت بنسبة 35.0%"],
  "45.0% fixed contract return": ["45.0% de retorno fijo por contrato", "45,0% vast contractrendement", "45,0% de retorno fixo do contrato", "45,0% de rendement fixe sur contrat", "45,0% feste Vertragsrendite", "45.0% 固定合约收益率", "45.0% фиксированная доходность", "عائد عقد ثابت بنسبة 45.0%"],
  "2-day maturity period": ["Período de vencimiento de 2 días", "Looptijd van 2 dagen", "Período de vencimento de 2 dias", "Période de maturité de 2 jours", "2 Tage Laufzeit", "2 天到期周期", "Срок погашения 2 дня", "فترة استحقاق يومين"],
  "3-day maturity period": ["Período de vencimiento de 3 días", "Looptijd van 3 dagen", "Período de vencimento de 3 dias", "Période de maturité de 3 jours", "3 Tage Laufzeit", "3 天到期周期", "Срок погашения 3 дня", "فترة استحقاق 3 أيام"],
  "7-day maturity period (1 week)": ["Período de vencimiento de 7 días (1 semana)", "Looptijd van 7 dagen (1 week)", "Período de vencimento de 7 dias (1 semana)", "Période de maturité de 7 jours (1 semaine)", "7 Tage Laufzeit (1 Woche)", "7 天到期周期（1 周）", "Срок погашения 7 дней (1 неделя)", "فترة استحقاق 7 أيام (أسبوع واحد)"],
  "7-day maximum compounding cycle (1 week)": ["Ciclo máximo de capitalización de 7 días (1 semana)", "Maximale samengestelde cyclus van 7 dagen (1 week)", "Ciclo máximo de capitalização de 7 dias (1 semana)", "Cycle maximal de capitalisation de 7 jours (1 semaine)", "Maximaler 7-Tage-Zinseszinszyklus (1 Woche)", "7 天最高复利周期（1 周）", "Максимальный цикл 7 дней (1 неделя)", "دورة تراكمية قصوى لمدة 7 أيام (أسبوع واحد)"],
  "Automatic principal return on maturity": ["Retorno automático del capital al vencimiento", "Automatische teruggave van hoofdsom op einddatum", "Retorno automático do principal no vencimento", "Retour automatique du capital à l'échéance", "Automatische Kapitalrückzahlung bei Fälligkeit", "到期自动返还本金", "Автоматический возврат депозита в конце срока", "إرجاع رأس المال تلقائياً عند الاستحقاق"],
  "Supported: BTC, ETH, USDT, SOL": ["Soportado: BTC, ETH, USDT, SOL", "Ondersteund: BTC, ETH, USDT, SOL", "Suportado: BTC, ETH, USDT, SOL", "Supporté : BTC, ETH, USDT, SOL", "Unterstützt: BTC, ETH, USDT, SOL", "支持币种：BTC、ETH、USDT、SOL", "Поддержка: BTC, ETH, USDT, SOL", "العملات المدعومة: BTC، ETH، USDT، SOL"],
  "Standard email & ticketing liaison": ["Soporte estándar por correo y tickets", "Standaard e-mail & ticketondersteuning", "Suporte padrão por e-mail e tickets", "Support standard par e-mail et tickets", "Standard-E-Mail- & Ticket-Support", "标准邮件与工单客服支持", "Стандартная поддержка по почте и тикетам", "دعم قياسي عبر البريد والتذاكر"],
  "Daily automated yield compounding": ["Interés compuesto diario automatizado", "Dagelijkse geautomatiseerde rente-op-rente", "Capitalização diária automatizada", "Capitalisation quotidienne automatisée", "Täglicher automatischer Zinseszins", "每日全自动复利计息", "Ежедневное авто-начисление доходности", "تراكم يومي آلي للعوائد"],
  "Priority automated withdrawal channel": ["Canal prioritario de retiro automatizado", "Prioritair geautomatiseerd opnamekanaal", "Canal prioritário de saque automatizado", "Canal de retrait automatisé prioritaire", "Priorisierter automatischer Auszahlungskanal", "优先全自动提款通道", "Приоритетный канал авто-выплат", "قناة سحب آلي ذات أولوية"],
  "Dedicated account portfolio strategist": ["Estratega de cartera dedicado", "Toegewijde portefeuillestrateeg", "Estrategista de portfólio dedicado", "Stratège de portefeuille dédié", "Persönlicher Portfoliostratege", "专属账户投资组合顾问", "Персональный портфельный стратег", "مستشار محفظة مخصص للحساب"],
  "Zero management or performance exit fees": ["Cero comisiones de gestión o salida", "Geen beheer- of uitstapkosten", "Zero taxas de administração ou saída", "Zéro frais de gestion ou de sortie", "Keine Verwaltungs- oder Ausstiegsgebühren", "零管理费与零退出手续费", "Без комиссий за управление и вывод", "بدون رسوم إدارة أو رسوم خروج"],
  "Institutional orderbook routing": ["Enrutamiento de libro de órdenes institucional", "Institutionele orderboek-routering", "Roteamento institucional de livro de ofertas", "Routage de carnet d'ordres institutionnel", "Institutionelles Orderbuch-Routing", "机构级订单簿智能路由", "Институциональная маршрутизация ордеров", "توجيه مؤسسي لسجل الأوامر"],
  "Direct VIP communication desk": ["Mesa de comunicación VIP directa", "Directe VIP-communicatiedesk", "Mesa de comunicação VIP direta", "Bureau de communication VIP direct", "Direkter VIP-Kommunikationsdesk", "VIP 专属直通服务台", "Прямой VIP-деск связи", "مكتب تواصل مباشر لكبار العملاء"],
  "Multi-asset algorithmic hedging protocol": ["Protocolo de cobertura algorítmica multiactivo", "Multi-asset algoritmisch hedgingprotocol", "Protocolo de hedge algorítmico multiativos", "Protocole de couverture algorithmique multi-actifs", "Algorithmisches Multi-Asset-Hedging", "多资产算法对冲保护协议", "Алгоритмическое мульти-активное хеджирование", "بروتوكول تحوط خوارزمي متعدد الأصول"],
  "Principal insurance protection guarantee": ["Garantía de seguro de protección de capital", "Verzekeringsgarantie voor hoofdsombescherming", "Garantia de seguro de proteção do capital", "Garantie d'assurance protection du capital", "Kapitalschutz-Versicherungsgarantie", "本金保险保障承诺", "Гарантия страховой защиты капитала", "ضمان تأمين حماية رأس المال"],
  "Unlimited capital allocation ceiling": ["Techo de asignación de capital ilimitado", "Onbeperkt kapitaalallocatieplafond", "Teto ilimitado de alocação de capital", "Plafond d'allocation de capital illimité", "Unbegrenzte Kapitalallokationsgrenze", "无上限资本配置额度", "Безлимитный лимит размещения капитала", "سقف غير محدود لتخصيص رأس المال"],
  "Bespoke private wealth management": ["Gestión de patrimonio privado a medida", "Op maat gemaakt particulier vermogensbeheer", "Gestão de patrimônio privado personalizada", "Gestion de fortune privée sur mesure", "Maßgeschneidertes Private Wealth Management", "定制化私人财富管理", "Индивидуальное управление капиталом", "إدارة ثروات خاصة مصممة حسب الطلب"],
  "Priority on-chain & wire settlements": ["Liquidaciones prioritarias en cadena y bancarias", "Prioritaire on-chain & bankafwikkelingen", "Liquidações prioritárias on-chain e bancárias", "Règlements prioritaires on-chain et virements", "Priorisierte On-Chain- & Bankabwicklungen", "链上与电汇优先清算通道", "Приоритетные расчеты в блокчейне и банке", "تسويات ذات أولوية عبر البلوكشين والتحويلات"],
  "Quarterly institutional audit certificates": ["Certificados trimestrales de auditoría institucional", "Driemaandelijkse institutionele auditcertificaten", "Certificados trimestrais de auditoria institucional", "Certificats d'audit institutionnel trimestriels", "Vierteljährliche institutionelle Prüfungszertifikate", "季度机构级审计认证报告", "Квартальные сертификаты аудита", "شهادات تدقيق مؤسسية ربع سنوية"],

  // ── Calculator & Copy Trading & FAQ ──
  "SIMULATOR": ["SIMULADOR", "SIMULATOR", "SIMULADOR", "SIMULATEUR", "SIMULATOR", "收益模拟器", "СИМУЛЯТОР", "محاكي العوائد"],
  "Project Your Investment Yield": ["Proyecte su Rendimiento de Inversión", "Bereken Uw Verwachte Rendement", "Projete Seu Rendimento de Investimento", "Projetez Votre Rendement d'Investissement", "Berechnen Sie Ihre Anlagerendite", "测算您的投资预期收益", "Рассчитайте Свою Доходность", "احسب توقعات عائد استثمارك"],
  "Select your preferred structured tier and principal amount to simulate anticipated maturity settlement and returns.": [
    "Seleccione su nivel estructurado preferido y el monto principal para simular su liquidación al vencimiento.",
    "Kies uw gewenste beleggingsniveau en inlegbedrag om uw verwachte einduitkering en winst te simuleren.",
    "Selecione seu nível estruturado preferido e o valor principal para simular a liquidação e os retornos no vencimento.",
    "Sélectionnez votre niveau structuré et le capital principal pour simuler votre règlement à l'échéance.",
    "Wählen Sie Ihre bevorzugte Stufe und Ihr Kapital, um Ihre erwartete Gesamtauszahlung zu simulieren.",
    "选择您偏好的结构化等级与本金金额，模拟到期总回报与每日收益。",
    "Выберите желаемый уровень и сумму капитала для расчета итоговой выплаты по окончании срока.",
    "اختر الباقة المهيكلة المفضلة ومبلغ رأس المال لمحاكاة إجمالي التسوية والأرباح عند الاستحقاق.",
  ],
  "Investment Capital (USD)": ["Capital de Inversión (USD)", "Beleggingskapitaal (USD)", "Capital de Investimento (USD)", "Capital Investi (USD)", "Anlagekapital (USD)", "投资本金 (USD)", "Инвестиционный Капитал (USD)", "رأس المال المستثمر (USD)"],
  "Unlimited ($5,000+ Permitted)": ["Ilimitado ($5,000+ Permitido)", "Onbeperkt ($5.000+ Toegestaan)", "Ilimitado ($5.000+ Permitido)", "Illimité (5 000 $+ Autorisé)", "Unbegrenzt (ab 5.000 $)", "无上限（支持 $5,000+）", "Безлимитно (от $5,000+)", "غير محدود (يُسمح بـ 5,000$+ فأكثر)"],
  "Explore All Verified Masters": ["Explorar Todos los Traders Verificados", "Bekijk Alle Geverifieerde Traders", "Explorar Todos os Traders Verificados", "Explorer Tous les Traders Vérifiés", "Alle Geprüften Trader Entdecken", "浏览全部认证交易大师", "Все Проверенные Трейдеры", "استكشف جميع المتداولين الموثقين"],
  "30D Win Rate": ["Tasa de Éxito 30D", "30D Winstpercentage", "Taxa de Acerto 30D", "Taux de Réussite 30J", "30T Erfolgsquote", "30日胜率", "Винрейт 30Д", "نسبة النجاح 30 يوم"],
  "30D Net ROI": ["ROI Neto 30D", "30D Netto ROI", "ROI Líquido 30D", "ROI Net 30J", "30T Netto-ROI", "30日净回报", "Чистый ROI 30Д", "صافي العائد 30 يوم"],
  "Top Performer": ["Mejor Rendimiento", "Toppresteerder", "Melhor Desempenho", "Meilleure Performance", "Top-Performer", "最佳表现", "Лидер Доходности", "الأعلى أداءً"],
  "Consistent Yield": ["Rendimiento Constante", "Stabiel Rendement", "Rendimento Consistente", "Rendement Constant", "Konstante Rendite", "稳健收益", "Стабильный Доход", "عائد مستقر"],
  "High Volume": ["Alto Volumen", "Hoog Volume", "Alto Volume", "Volume Élevé", "Hohes Volumen", "高成交量", "Высокий Объем", "حجم تداول مرتفع"],
  "Arbitrage & Perpetual Futures": ["Arbitraje y Futuros Perpetuos", "Arbitrage & Perpetual Futures", "Arbitragem e Futuros Perpétuos", "Arbitrage & Contrats Perpétuels", "Arbitrage & Perpetual Futures", "统计套利与永续合约", "Арбитраж и Перпетуалы", "المراجحة والعقود الدائمة"],
  "Quantitative Forex & Macro": ["Forex Cuantitativo y Macro", "Kwantitatieve Forex & Macro", "Forex Quantitativo e Macro", "Forex Quantitatif & Macro", "Quantitatives Forex & Makro", "量化外汇与宏观策略", "Квант-Форекс и Макро", "الفوركس الكمي والماكرو"],
  "Global Equities & Breakouts": ["Acciones Globales y Rupturas", "Wereldwijde Aandelen & Breakouts", "Ações Globais e Rompimentos", "Actions Mondiales & Cassures", "Globale Aktien & Breakouts", "全球股票与突破策略", "Мировые Акции и Пробои", "الأسهم العالمية والاختراقات"],
  "Mirror Strategy": ["Copiar Estrategia", "Strategie Kopiëren", "Copiar Estratégia", "Copier la Stratégie", "Strategie Kopieren", "复制该策略", "Копировать Стратегию", "نسخ الاستراتيجية"],
  "Full Custodial Segregation Standards": ["Estándares de Segregación Custodial Total", "Volledige Vermogensscheiding", "Padrões de Segregação Custodial Total", "Normes de Ségrégation Totale des Actifs", "Vollständige Verwahrungstrennung", "完全托管资产隔离标准", "Стандарты Полного Разделения Активов", "معايير الفصل الكامل للأصول"],
  "Client capital is never co-mingled with platform operational reserves.": [
    "El capital del cliente nunca se mezcla con las reservas operativas de la plataforma.",
    "Klantkapitaal wordt nooit vermengd met operationele bedrijfsreserves van het platform.",
    "O capital dos clientes nunca é misturado com as reservas operacionais da plataforma.",
    "Le capital des clients n'est jamais mélangé aux réserves opérationnelles de la plateforme.",
    "Kundenkapital wird niemals mit den operativen Reserven der Plattform vermischt.",
    "客户资金与平台运营储备完全隔离，绝不混用。",
    "Капитал клиентов никогда не смешивается с операционными резервами платформы.",
    "لا يتم خلط أموال العملاء أبداً مع الاحتياطيات التشغيلية للمنصة.",
  ],
  "Review Custody Documentation": ["Revisar Documentación de Custodia", "Bekijk Bewaardocumentatie", "Revisar Documentação de Custódia", "Consulter la Documentation de Garde", "Verwahrungsdokumentation Prüfen", "查阅托管安全文档", "Документация по Хранению", "مراجعة وثائق الحفظ الأمين"],
  "Knowledge Base": ["Base de Conocimiento", "Kennisbank", "Base de Conhecimento", "Base de Connaissances", "Wissensdatenbank", "知识库", "База Знаний", "قاعدة المعرفة"],
  "Clear answers regarding institutional execution, account tiers, and capital preservation.": [
    "Respuestas claras sobre ejecución institucional, niveles de cuenta y preservación de capital.",
    "Duidelijke antwoorden over institutionele uitvoering, accountniveaus en kapitaalbescherming.",
    "Respostas claras sobre execução institucional, níveis de conta e preservação de capital.",
    "Réponses claires concernant l'exécution institutionnelle, les niveaux de compte et la protection du capital.",
    "Klare Antworten zu institutioneller Ausführung, Kontostufen und Kapitalerhalt.",
    "关于机构执行、账户等级与本金保障的清晰解答。",
    "Подробные ответы об исполнении сделок, инвестиционных планах и защите капитала.",
    "إجابات واضحة حول التنفيذ المؤسسي وباقات الحسابات وحماية رأس المال.",
  ],
  "How does Horizon Equity generate yield on managed allocations?": [
    "¿Cómo genera rendimiento Horizon Equity en las asignaciones gestionadas?",
    "Hoe genereert Horizon Equity rendement op beheerde allocaties?",
    "Como a Horizon Equity gera rendimento nas alocações gerenciadas?",
    "Comment Horizon Equity génère-t-il du rendement sur les allocations gérées ?",
    "Wie erwirtschaftet Horizon Equity Renditen auf verwaltete Allokationen?",
    "Horizon Equity 如何通过受托配置产生收益？",
    "Как Horizon Equity генерирует доходность по управляемым активам?",
    "كيف تحقق Horizon Equity عوائد على التخصيصات المدارة؟",
  ],
  "Yields are generated through automated cross-market statistical arbitrage, market-making liquidity provision on digital asset and forex perpetuals, and structured fixed-income allocations backed by institutional counterparties.": [
    "Los rendimientos se generan mediante arbitraje estadístico automatizado entre mercados, provisión de liquidez en perpetuos cripto y forex, y asignaciones de renta fija respaldadas por contrapartes institucionales.",
    "Rendementen worden gegenereerd via geautomatiseerde statistische arbitrage, market-making liquiditeitsverschaffing in digitale activa en forex, en gestructureerde vastrentende allocaties.",
    "Os rendimentos são gerados por meio de arbitragem estatística automatizada entre mercados, provisão de liquidez em perpétuos cripto e forex, e alocações de renda fixa estruturadas.",
    "Les rendements sont générés par l'arbitrage statistique inter-marchés automatisé, la fourniture de liquidité sur les perpétuels crypto et forex, et des allocations à revenu fixe.",
    "Renditen entstehen durch automatisierte statistische Markt-Arbitrage, Liquiditätsbereitstellung bei Krypto- und Forex-Perpetuals sowie strukturierte Festzinsallokationen.",
    "收益通过跨市场自动化统计套利、数字资产与外汇永续合约做市流动性提供，以及由机构对手方担保的结构化固定收益配置产生。",
    "Доходность формируется за счет автоматического межрыночного статистического арбитража, предоставления ликвидности и инструментов с фиксированной доходностью.",
    "تتحقق العوائد من خلال المراجحة الإحصائية الآلية عبر الأسواق، وتوفير السيولة في عقود الكريبتو والفوركس، وتخصيصات الدخل الثابت المهيكلة.",
  ],
  "What deposit and withdrawal methods are supported?": [
    "¿Qué métodos de depósito y retiro están soportados?",
    "Welke stortings- en opnamemethoden worden ondersteund?",
    "Quais métodos de depósito e saque são suportados?",
    "Quelles méthodes de dépôt et de retrait sont prises en charge ?",
    "Welche Ein- und Auszahlungsmethoden werden unterstützt?",
    "支持哪些存款和提款方式？",
    "Какие методы пополнения и вывода поддерживаются?",
    "ما هي طرق الإيداع والسحب المدعومة؟",
  ],
  "We natively support Bitcoin (BTC), Ethereum (ETH), Tether (USDT on ERC-20 / TRC-20), and Solana (SOL). Withdrawals are processed automatically through dedicated private node clusters with zero artificial holding delays.": [
    "Soportamos nativamente Bitcoin (BTC), Ethereum (ETH), Tether (USDT en ERC-20 / TRC-20) y Solana (SOL). Los retiros se procesan automáticamente mediante nodos dedicados sin demoras.",
    "Wij ondersteunen Bitcoin (BTC), Ethereum (ETH), Tether (USDT op ERC-20 / TRC-20) en Solana (SOL). Opnames worden automatisch verwerkt via privé-nodeclusters zonder vertraging.",
    "Suportamos nativamente Bitcoin (BTC), Ethereum (ETH), Tether (USDT em ERC-20 / TRC-20) e Solana (SOL). Os saques são processados automaticamente sem atrasos.",
    "Nous prenons en charge Bitcoin (BTC), Ethereum (ETH), Tether (USDT sur ERC-20 / TRC-20) et Solana (SOL). Les retraits sont traités automatiquement sans délai.",
    "Wir unterstützen Bitcoin (BTC), Ethereum (ETH), Tether (USDT auf ERC-20 / TRC-20) und Solana (SOL). Auszahlungen erfolgen automatisch ohne Verzögerung.",
    "我们原生支持比特币 (BTC)、以太坊 (ETH)、泰达币 (USDT ERC-20 / TRC-20) 与索拉纳 (SOL)。提款通过专用私有节点集群自动处理，零人为延迟。",
    "Мы поддерживаем Bitcoin (BTC), Ethereum (ETH), Tether (USDT ERC-20 / TRC-20) и Solana (SOL). Выплаты обрабатываются автоматически без задержек.",
    "ندعم بشكل أساسي بيتكوين (BTC) وإيثريوم (ETH) وتيثر (USDT عبر ERC-20 / TRC-20) وسولانا (SOL). تتم معالجة السحوبات تلقائياً عبر عقد خاصة مخصصة دون أي تأخير.",
  ],
  "How is principal capital secured against market volatility?": [
    "¿Cómo se protege el capital principal frente a la volatilidad del mercado?",
    "Hoe wordt het hoofdkapitaal beschermd tegen marktvolatiliteit?",
    "Como o capital principal é protegido contra a volatilidade do mercado?",
    "Comment le capital principal est-il protégé contre la volatilité du marché ?",
    "Wie wird das Stammkapital gegen Marktvolatilität abgesichert?",
    "本金如何抵御市场波动风险？",
    "Как основной капитал защищен от рыночной волатильности?",
    "كيف يتم تأمين رأس المال الأساسي ضد تقلبات السوق؟",
  ],
  "Over 98% of reserves are stored in geographically distributed, air-gapped cold vaults. Algorithmic hedging models dynamically adjust delta-neutral positions to protect capital during sharp market downturns.": [
    "Más del 98% de las reservas se almacenan en bóvedas frías desconectadas. Los modelos de cobertura algorítmica ajustan dinámicamente posiciones delta-neutrales para proteger el capital.",
    "Meer dan 98% van de reserves wordt bewaard in geografisch verspreide koude kluizen. Algoritmische hedgingmodellen passen delta-neutrale posities dynamisch aan.",
    "Mais de 98% das reservas são armazenadas em cofres frios isolados. Modelos de hedge algorítmico ajustam dinamicamente posições delta-neutras para proteger o capital.",
    "Plus de 98% des réserves sont stockées dans des coffres froids isolés. Des modèles de couverture algorithmique ajustent dynamiquement les positions delta-neutres.",
    "Über 98% der Reserven lagern in geografisch verteilten Cold-Vaults. Algorithmische Hedging-Modelle sichern das Kapital durch delta-neutrale Positionen ab.",
    "超过 98% 的储备存储在地理分布的物理隔离冷金库中。算法对冲模型动态调整 Delta 中性头寸，在市场剧烈波动时保护本金安全。",
    "Более 98% резервов хранится в изолированных холодных хранилищах. Алгоритмическое хеджирование поддерживает дельта-нейтральные позиции.",
    "يتم تخزين أكثر من 98% من الاحتياطيات في خزائن باردة معزولة. وتقوم نماذج التحوط الخوارزمية بضبط المراكز المحايدة لحماية رأس المال.",
  ],
  "Can I compound my earnings automatically?": [
    "¿Puedo reinvertir mis ganancias automáticamente?",
    "Kan ik mijn inkomsten automatisch herbeleggen?",
    "Posso reinvestir meus ganhos automaticamente?",
    "Puis-je capitaliser mes gains automatiquement ?",
    "Kann ich meine Erträge automatisch reinvestieren?",
    "我可以自动复利我的收益吗？",
    "Могу ли я автоматически реинвестировать прибыль?",
    "هل يمكنني مضاعفة أرباحي تلقائياً؟",
  ],
  "Yes. All active investment tiers allow optional auto-renew and automated daily compounding, enabling your returns to compound seamlessly across consecutive maturity cycles.": [
    "Sí. Todos los niveles activos permiten renovación automática opcional y capitalización diaria, logrando que sus retornos crezcan de forma continua.",
    "Ja. Alle actieve beleggingsniveaus bieden optionele automatische verlenging en dagelijkse samengestelde rente over opeenvolgende cycli.",
    "Sim. Todos os níveis ativos permitem renovação automática opcional e capitalização diária contínua.",
    "Oui. Tous les niveaux actifs permettent le renouvellement automatique optionnel et la capitalisation quotidienne.",
    "Ja. Alle aktiven Anlagestufen ermöglichen eine optionale automatische Verlängerung und täglichen Zinseszins.",
    "可以。所有活跃投资等级均支持可选的自动续期与每日自动复利，让您的回报在连续周期中无缝增长。",
    "Да. Все активные тарифы поддерживают автопродление и ежедневное реинвестирование дохода.",
    "نعم. تتيح جميع باقات الاستثمار النشطة التجديد التلقائي الاختياري والمضاعفة اليومية الآلية للعوائد.",
  ],
  "What regulatory and compliance standards are maintained?": [
    "¿Qué estándares regulatorios y de cumplimiento se mantienen?",
    "Welke regelgevings- en compliancenormen worden gehanteerd?",
    "Quais padrões regulatórios e de conformidade são mantidos?",
    "Quelles normes réglementaires et de conformité sont maintenues ?",
    "Welche Regulierungs- und Compliance-Standards werden eingehalten?",
    "平台遵循哪些监管与合规标准？",
    "Какие стандарты регулирования и комплаенса соблюдаются?",
    "ما هي المعايير التنظيمية ومعايير الامتثال المتبعة؟",
  ],
  "Horizon Equity operates under strict AML/KYC guidelines, performs regular internal and third-party smart contract audits, and maintains complete segregation between client deposits and operational treasury capital.": [
    "Horizon Equity opera bajo estrictas normas AML/KYC, realiza auditorías periódicas y mantiene una segregación total entre los depósitos de clientes y el capital operativo.",
    "Horizon Equity werkt onder strikte AML/KYC-richtlijnen, voert regelmatige audits uit en houdt klanttegoeden volledig gescheiden van het bedrijfskapitaal.",
    "A Horizon Equity opera sob rígidas diretrizes AML/KYC, realiza auditorias regulares e mantém segregação total entre depósitos de clientes e tesouraria operacional.",
    "Horizon Equity opère selon des directives AML/KYC strictes, réalise des audits réguliers et maintient une ségrégation complète des fonds clients.",
    "Horizon Equity arbeitet nach strengen AML/KYC-Richtlinien, führt regelmäßige Audits durch und trennt Kundeneinlagen strikt vom Betriebskapital.",
    "Horizon Equity 严格遵循 AML/KYC 准则运营，定期进行内部与第三方审计，并保持客户存款与运营资金的完全隔离。",
    "Horizon Equity соблюдает строгие стандарты AML/KYC, проводит регулярный аудит и полностью разделяет средства клиентов и компании.",
    "تعمل Horizon Equity وفق إرشادات صارمة لمكافحة غسل الأموال وتوثيق الهوية (AML/KYC)، وتجري عمليات تدقيق منتظمة مع فصل تام لأموال العملاء.",
  ],
  "Ready to Allocate Capital With Institutional Rigor?": [
    "¿Listo para Asignar Capital con Rigor Institucional?",
    "Klaar om Kapitaal te Alloceren met Institutionele Precisie?",
    "Pronto para Alocar Capital com Rigor Institucional?",
    "Prêt à Allouer du Capital avec une Rigueur Institutionnelle ?",
    "Bereit für Institutionelle Kapitalallokation?",
    "准备好以机构级标准配置您的资本了吗？",
    "Готовы Размещать Капитал на Институциональном Уровне?",
    "هل أنت مستعد لتخصيص رأس المال بمعايير مؤسسية؟",
  ],
  "Open your multi-currency account in under two minutes. Access automated compounding yields and deep market liquidity.": [
    "Abra su cuenta multidivisa en menos de dos minutos. Acceda a rendimientos compuestos automatizados y liquidez profunda.",
    "Open uw multi-valuta account binnen twee minuten. Krijg toegang tot geautomatiseerd rendement en diepe marktliquiditeit.",
    "Abra sua conta multimoeda em menos de dois minutos. Acesse rendimentos compostos automatizados e liquidez profunda.",
    "Ouvrez votre compte multidevise en moins de deux minutes. Accédez à des rendements composés automatisés.",
    "Eröffnen Sie Ihr Multi-Währungs-Konto in unter zwei Minuten. Nutzen Sie automatisierte Zinseszinsen.",
    "两分钟内开通您的多币种账户，尊享自动化复利收益与深度市场流动性。",
    "Откройте мультивалютный счет менее чем за две минуты. Доступ к автоматической доходности и ликвидности.",
    "افتح حسابك متعدد العملات في أقل من دقيقتين واستفد من العوائد التراكمية المؤتمتة.",
  ],
  "Open Protected Account": ["Abrir Cuenta Protegida", "Beveiligde Rekening Openen", "Abrir Conta Protegida", "Ouvrir un Compte Protégé", "Geschütztes Konto Eröffnen", "开通受保护账户", "Открыть Защищенный Счет", "فتح حساب محمي"],
  "Review Terms & Comparison": ["Revisar Términos y Comparativa", "Voorwaarden & Vergelijking Bekijken", "Revisar Termos e Comparação", "Voir les Conditions & Comparatif", "Bedingungen & Vergleich Ansehen", "查看条款与方案对比", "Условия и Сравнение Планов", "مراجعة الشروط والمقارنة"],

  // ── Auth Pages ──
  "Back to Homepage": ["Volver al Inicio", "Terug naar Startpagina", "Voltar ao Início", "Retour à l'Accueil", "Zurück zur Startseite", "返回首页", "На Главную", "العودة للرئيسية"],
  "Client Sign In": ["Acceso de Clientes", "Klant Inloggen", "Acesso do Cliente", "Connexion Client", "Kundenanmeldung", "客户登录", "Вход для Клиентов", "تسجيل دخول العملاء"],
  "Access your multi-asset portfolio and institutional accounts": [
    "Acceda a su cartera multiactivo y cuentas institucionales",
    "Toegang tot uw multi-asset portefeuille en institutionele rekeningen",
    "Acesse seu portfólio multiativos e contas institucionais",
    "Accédez à votre portefeuille multi-actifs et à vos comptes institutionnels",
    "Greifen Sie auf Ihr Multi-Asset-Portfolio und Ihre Konten zu",
    "访问您的多资产投资组合与机构账户",
    "Доступ к вашему мульти-активному портфелю и счетам",
    "الوصول إلى محفظتك متعددة الأصول وحساباتك المؤسسية",
  ],
  "Email Address": ["Correo Electrónico", "E-mailadres", "Endereço de E-mail", "Adresse E-mail", "E-Mail-Adresse", "电子邮箱地址", "Электронная Почта", "البريد الإلكتروني"],
  "Email Address *": ["Correo Electrónico *", "E-mailadres *", "Endereço de E-mail *", "Adresse E-mail *", "E-Mail-Adresse *", "电子邮箱地址 *", "Электронная Почта *", "البريد الإلكتروني *"],
  "Password": ["Contraseña", "Wachtwoord", "Senha", "Mot de Passe", "Passwort", "密码", "Пароль", "كلمة المرور"],
  "Password (min. 6 characters) *": ["Contraseña (mín. 6 caracteres) *", "Wachtwoord (min. 6 tekens) *", "Senha (mín. 6 caracteres) *", "Mot de Passe (min. 6 caractères) *", "Passwort (mind. 6 Zeichen) *", "密码（至少 6 位字符）*", "Пароль (мин. 6 символов) *", "كلمة المرور (6 أحرف على الأقل) *"],
  "Sign In to Account": ["Iniciar Sesión en la Cuenta", "Inloggen op Account", "Entrar na Conta", "Se Connecter au Compte", "Im Konto Anmelden", "登录账户", "Войти в Аккаунт", "تسجيل الدخول إلى الحساب"],
  "Authenticating Session...": ["Autenticando Sesión...", "Sessie Verifiëren...", "Autenticando Sessão...", "Authentification de la Session...", "Sitzung Wird Authentifiziert...", "正在验证会话...", "Проверка Сессии...", "جاري توثيق الجلسة..."],
  "Don't have an institutional account yet?": ["¿Aún no tiene una cuenta institucional?", "Nog geen institutioneel account?", "Ainda não possui uma conta institucional?", "Vous n'avez pas encore de compte institutionnel ?", "Noch kein institutionelles Konto?", "还没有机构账户？", "Еще нет институционального счета?", "ليس لديك حساب مؤسسي بعد؟"],
  "Access automated compounding yields and multi-currency wallets": [
    "Acceda a rendimientos compuestos automatizados y billeteras multidivisa",
    "Toegang tot geautomatiseerd samengesteld rendement en multi-valuta wallets",
    "Acesse rendimentos compostos automatizados e carteiras multimoeda",
    "Accédez aux rendements composés automatisés et aux portefeuilles multidevises",
    "Zugang zu automatisierten Renditen und Multi-Währungs-Wallets",
    "获取自动化复利收益与多币种数字钱包",
    "Доступ к автоматической доходности и мультивалютным кошелькам",
    "الوصول إلى العوائد التراكمية المؤتمتة والمحافظ متعددة العملات",
  ],
  "Full Legal Name *": ["Nombre Legal Completo *", "Volledige Wettelijke Naam *", "Nome Completo Legal *", "Nom Complet Légal *", "Vollständiger Gesetzlicher Name *", "法定全名 *", "Полное Юридическое Имя *", "الاسم القانوني الكامل *"],
  "Referral Code": ["Código de Referido", "Verwijzingscode", "Código de Indicação", "Code de Parrainage", "Empfehlungscode", "推荐码", "Реферальный Код", "رمز الإحالة"],
  "Optional": ["Opcional", "Optioneel", "Opcional", "Optionnel", "Optional", "选填", "Необязательно", "اختياري"],
  "Terms of Service": ["Términos de Servicio", "Servicevoorwaarden", "Termos de Serviço", "Conditions d'Utilisation", "Nutzungsbedingungen", "服务条款", "Условия Использования", "شروط الخدمة"],
  "Complete Account Registration": ["Completar Registro de Cuenta", "Accountregistratie Voltooien", "Concluir Cadastro da Conta", "Finaliser l'Inscription", "Kontoregistrierung Abschließen", "完成账户注册", "Завершить Регистрацию", "إكمال تسجيل الحساب"],
  "Creating Client Account...": ["Creando Cuenta de Cliente...", "Klantaccount Aanmaken...", "Criando Conta do Cliente...", "Création du Compte Client...", "Kundenkonto Wird Erstellt...", "正在创建客户账户...", "Создание Счета Клиента...", "جاري إنشاء حساب العميل..."],
  "Already registered with Horizon Equity?": ["¿Ya está registrado en Horizon Equity?", "Al geregistreerd bij Horizon Equity?", "Já possui cadastro na Horizon Equity?", "Déjà inscrit chez Horizon Equity ?", "Bereits bei Horizon Equity registriert?", "已在 Horizon Equity 注册？", "Уже зарегистрированы в Horizon Equity?", "مسجل بالفعل في Horizon Equity؟"],
  "Sign In Here": ["Inicie Sesión Aquí", "Log Hier In", "Entre Aqui", "Connectez-vous Ici", "Hier Anmelden", "在此登录", "Войти Здесь", "سجل الدخول هنا"],
  "Please provide both email and password.": ["Por favor ingrese correo y contraseña.", "Vul zowel uw e-mailadres als wachtwoord in.", "Por favor, informe e-mail e senha.", "Veuillez saisir votre e-mail et votre mot de passe.", "Bitte geben Sie E-Mail und Passwort ein.", "请输入电子邮箱和密码。", "Пожалуйста, введите почту и пароль.", "يرجى إدخال البريد الإلكتروني وكلمة المرور."],
  "Please populate all required fields.": ["Por favor complete todos los campos obligatorios.", "Vul alle verplichte velden in.", "Por favor, preencha todos os campos obrigatórios.", "Veuillez remplir tous les champs obligatoires.", "Bitte füllen Sie alle Pflichtfelder aus.", "请填写所有必填字段。", "Пожалуйста, заполните все обязательные поля.", "يرجى ملء جميع الحقول المطلوبة."],
  "You must accept the terms of service to open an account.": ["Debe aceptar los términos de servicio para abrir una cuenta.", "U moet de servicevoorwaarden accepteren om een account te openen.", "Você deve aceitar os termos de serviço para abrir uma conta.", "Vous devez accepter les conditions d'utilisation pour ouvrir un compte.", "Sie müssen die Nutzungsbedingungen akzeptieren.", "您必须同意服务条款才能开户。", "Необходимо принять условия использования.", "يجب الموافقة على شروط الخدمة لفتح حساب."],
  "Account initialized successfully! Redirecting you to sign in...": ["¡Cuenta creada con éxito! Redirigiendo al inicio de sesión...", "Account succesvol aangemaakt! U wordt doorgestuurd naar inloggen...", "Conta criada com sucesso! Redirecionando para o login...", "Compte créé avec succès ! Redirection vers la connexion...", "Konto erfolgreich erstellt! Weiterleitung zur Anmeldung...", "账户创建成功！正在跳转至登录页面...", "Аккаунт успешно создан! Перенаправление на вход...", "تم إنشاء الحساب بنجاح! جاري تحويلك لتسجيل الدخول..."],
  "Incorrect email or password. Please verify your credentials.": ["Correo o contraseña incorrectos. Verifique sus credenciales.", "Onjuist e-mailadres of wachtwoord. Controleer uw gegevens.", "E-mail ou senha incorretos. Verifique suas credenciais.", "E-mail ou mot de passe incorrect. Veuillez vérifier vos identifiants.", "E-Mail oder Passwort falsch. Bitte prüfen Sie Ihre Zugangsdaten.", "邮箱或密码错误，请核对您的登录凭据。", "Неверный email или пароль. Проверьте данные.", "البريد الإلكتروني أو كلمة المرور غير صحيحة."],

  // ── User & Admin Dashboard Navigation & Overview ──
  "Verifying secure session...": ["Verificando sesión segura...", "Beveiligde sessie verifiëren...", "Verificando sessão segura...", "Vérification de la session sécurisée...", "Sichere Sitzung wird überprüft...", "正在验证安全会话...", "Проверка защищенной сессии...", "جاري التحقق من الجلسة الآمنة..."],
  "Loading portfolio telemetry...": ["Cargando telemetría de cartera...", "Portfoliogegevens laden...", "Carregando telemetria do portfólio...", "Chargement des données du portefeuille...", "Portfoliodaten werden geladen...", "正在加载投资组合数据...", "Загрузка данных портфеля...", "جاري تحميل بيانات المحفظة..."],
  "Member Operations": ["Operaciones del Miembro", "Ledenoperaties", "Operações do Membro", "Opérations Membre", "Mitgliederbereich", "会员业务中心", "Операции Клиента", "عمليات الأعضاء"],
  "System Administration": ["Administración del Sistema", "Systeembeheer", "Administração do Sistema", "Administration Système", "Systemadministration", "系统管理后台", "Администрирование", "إدارة النظام"],
  "Client Portal": ["Portal del Cliente", "Klantenportaal", "Portal do Cliente", "Portail Client", "Kundenportal", "客户门户", "Клиентский Портал", "بوابة العميل"],
  "Overview": ["Resumen", "Overzicht", "Visão Geral", "Vue d'Ensemble", "Übersicht", "账户总览", "Обзор", "نظرة عامة"],
  "Take a Loan": ["Solicitar Préstamo", "Lening Aanvragen", "Solicitar Empréstimo", "Demander un Prêt", "Kredit Aufnehmen", "申请贷款", "Взять Займ", "طلب تمويل"],
  "Verification": ["Verificación", "Verificatie", "Verificação", "Vérification", "Verifizierung", "身份认证", "Верификация", "توثيق الهوية"],
  "Wallets": ["Billeteras", "Wallets", "Carteiras", "Portefeuilles", "Wallets", "数字钱包", "Кошельки", "المحافظ"],
  "Deposits": ["Depósitos", "Stortingen", "Depósitos", "Dépôts", "Einzahlungen", "存入资金", "Пополнения", "الإيداعات"],
  "My Deposits": ["Mis Depósitos", "Mijn Stortingen", "Meus Depósitos", "Mes Dépôts", "Meine Einzahlungen", "我的存款", "Мои Депозиты", "إيداعاتي"],
  "Withdrawals": ["Retiros", "Opnames", "Saques", "Retraits", "Auszahlungen", "提取资金", "Вывод Средств", "السحوبات"],
  "Withdrawal History": ["Historial de Retiros", "Opnamegeschiedenis", "Histórico de Saques", "Historique des Retraits", "Auszahlungsverlauf", "提款记录", "История Выводов", "سجل السحوبات"],
  "Active Investments": ["Inversiones Activas", "Actieve Investeringen", "Investimentos Ativos", "Investissements Actifs", "Aktive Anlagen", "进行中投资", "Активные Инвестиции", "الاستثمارات النشطة"],
  "Referral Network": ["Red de Referidos", "Verwijzingsnetwerk", "Rede de Indicações", "Réseau de Parrainage", "Empfehlungsnetzwerk", "推荐网络", "Партнерская Сеть", "شبكة الإحالة"],
  "Transactions": ["Transacciones", "Transacties", "Transações", "Transactions", "Transaktionen", "交易明细", "Транзакции", "المعاملات"],
  "Support Desk": ["Centro de Soporte", "Support Desk", "Central de Suporte", "Support Client", "Support-Desk", "客服工单", "Служба Поддержки", "مكتب الدعم"],
  "Settings": ["Configuración", "Instellingen", "Configurações", "Paramètres", "Einstellungen", "账户设置", "Настройки", "الإعدادات"],
  "Sign Out": ["Cerrar Sesión", "Uitloggen", "Sair", "Déconnexion", "Abmelden", "退出登录", "Выйти", "تسجيل الخروج"],
  "Mark all as read": ["Marcar todo como leído", "Alles als gelezen markeren", "Marcar tudo como lido", "Tout marquer comme lu", "Alle als gelesen markieren", "全部标为已读", "Отметить все как прочитанные", "تحديد الكل كمقروء"],
  "No notifications to display": ["No hay notificaciones para mostrar", "Geen meldingen om weer te geven", "Nenhuma notificação para exibir", "Aucune notification à afficher", "Keine Benachrichtigungen vorhanden", "暂无系统通知", "Нет новых уведомлений", "لا توجد إشعارات للعرض"],
  "Admin": ["Admin", "Beheerder", "Admin", "Admin", "Admin", "管理员", "Админ", "مسؤول"],
  "Users": ["Usuarios", "Gebruikers", "Usuários", "Utilisateurs", "Benutzer", "用户管理", "Пользователи", "المستخدمون"],
  "KYC Submissions": ["Solicitudes KYC", "KYC Aanvragen", "Envios de KYC", "Soumissions KYC", "KYC-Einreichungen", "KYC 审核", "Заявки KYC", "طلبات توثيق KYC"],
  "Loan Management": ["Gestión de Préstamos", "Leningbeheer", "Gestão de Empréstimos", "Gestion des Prêts", "Kreditverwaltung", "贷款管理", "Управление Займами", "إدارة القروض"],
  "Withdrawal Requests": ["Solicitudes de Retiro", "Opnameverzoeken", "Solicitações de Saque", "Demandes de Retrait", "Auszahlungsanträge", "提款请求", "Запросы на Вывод", "طلبات السحب"],
  "Active Deposits": ["Depósitos Activos", "Actieve Stortingen", "Depósitos Ativos", "Dépôts Actifs", "Aktive Einzahlungen", "活跃存款", "Активные Депозиты", "الإيداعات النشطة"],
  "Referral Earnings": ["Ganancias por Referidos", "Verwijzingsinkomsten", "Ganhos de Indicação", "Gains de Parrainage", "Empfehlungserträge", "推荐佣金", "Реферальные Начисления", "أرباح الإحالة"],
  "Exchange Management": ["Gestión de Cambio", "Wisselkoersbeheer", "Gestão de Câmbio", "Gestion des Changes", "Wechselkursverwaltung", "汇率管理", "Управление Обменом", "إدارة الصرف"],
  "Email Templates": ["Plantillas de Correo", "E-mailsjablonen", "Modelos de E-mail", "Modèles d'E-mails", "E-Mail-Vorlagen", "邮件模板", "Шаблоны Писем", "قوالب البريد الإلكتروني"],
  "Notifications": ["Notificaciones", "Meldingen", "Notificações", "Notifications", "Benachrichtigungen", "系统通知", "Уведомления", "الإشعارات"],
  "Audit Logs": ["Registros de Auditoría", "Auditlogboeken", "Registros de Auditoria", "Journaux d'Audit", "Audit-Protokolle", "审计日志", "Журнал Аудита", "سجلات التدقيق"],
  "Security & Controls": ["Seguridad y Controles", "Beveiliging & Controles", "Segurança e Controles", "Sécurité & Contrôles", "Sicherheit & Kontrollen", "安全与风控", "Безопасность и Контроль", "الأمان والضوابط"],
  "Platform Settings": ["Ajustes de Plataforma", "Platforminstellingen", "Configurações da Plataforma", "Paramètres Plateforme", "Plattformeinstellungen", "平台设置", "Настройки Платформы", "إعدادات المنصة"],
  "System Wallets": ["Billeteras del Sistema", "Systeemwallets", "Carteiras do Sistema", "Portefeuilles Système", "System-Wallets", "系统钱包", "Системные Кошельки", "محافظ النظام"],

  // ── Dashboard Overview Content ──
  "Real-time multi-asset liquidity reserves and daily yield compounding performance.": [
    "Reservas de liquidez multiactivo en tiempo real y rendimiento compuesto diario.",
    "Realtime multi-asset liquiditeitsreserves en dagelijks samengesteld rendement.",
    "Reservas de liquidez multiativos em tempo real e desempenho diário composto.",
    "Réserves de liquidité multi-actifs en temps réel et performance quotidienne composée.",
    "Echtzeit-Multi-Asset-Liquiditätsreserven und tägliche Zinseszins-Performance.",
    "实时多资产流动性储备与每日复利收益表现。",
    "Мульти-активные резервы ликвидности в реальном времени и ежедневная доходность.",
    "احتياطيات السيولة متعددة الأصول في الوقت الفعلي وأداء العوائد التراكمية اليومية.",
  ],
  "Deposit Funds": ["Depositar Fondos", "Geld Storten", "Depositar Fundos", "Déposer des Fonds", "Geld Einzahlen", "存入资金", "Пополнить Счет", "إيداع الأموال"],
  "Invest Now": ["Invertir Ahora", "Nu Investeren", "Investir Agora", "Investir Maintenant", "Jetzt Investieren", "立即投资", "Инвестировать", "استثمر الآن"],
  "Unlocked for Withdrawal": ["Desbloqueado para Retiro", "Vrijgegeven voor Opname", "Desbloqueado para Saque", "Débloqué pour Retrait", "Für Auszahlung Freigeschaltet", "已解锁可提现", "Разблокировано для Вывода", "متاح للسحب"],
  "Locked (Qualifying Plan Required)": ["Bloqueado (Plan Calificado Requerido)", "Vergrendeld (Kwalificerend Plan Vereist)", "Bloqueado (Plano Qualificado Necessário)", "Verrouillé (Plan Éligible Requis)", "Gesperrt (Qualifizierender Plan Erforderlich)", "锁定中（需完成合资格投资方案）", "Заблокировано (Нужен Инвест-План)", "مقفل (يتطلب خطة استثمار مؤهلة)"],
  "Complete your first qualifying investment contract (e.g. Silver Plan) to unlock this welcome bonus for withdrawal.": [
    "Complete su primer contrato de inversión calificado (p. ej., Plan Plata) para desbloquear este bono de bienvenida para retiro.",
    "Voltooi uw eerste kwalificerende investeringscontract (bijv. Zilver Plan) om deze welkomstbonus vrij te geven voor opname.",
    "Conclua seu primeiro contrato de investimento qualificado (ex.: Plano Prata) para desbloquear este bônus de boas-vindas para saque.",
    "Complétez votre premier contrat d'investissement éligible (ex. Plan Argent) pour débloquer ce bonus de bienvenue.",
    "Schließen Sie Ihren ersten qualifizierenden Anlagevertrag (z. B. Silber-Plan) ab, um diesen Willkommensbonus zur Auszahlung freizuschalten.",
    "完成您的首个合资格投资合约（例如白银方案），即可解锁此欢迎奖金用于提款。",
    "Завершите первый квалификационный инвест-контракт (например, план Silver), чтобы разблокировать приветственный бонус для вывода.",
    "أكمل أول عقد استثمار مؤهل (مثل الباقة الفضية) لفتح مكافأة الترحيب هذه للسحب.",
  ],
  "View Balances →": ["Ver Saldos →", "Bekijk Saldi →", "Ver Saldos →", "Voir les Soldes →", "Guthaben Ansehen →", "查看余额 →", "Смотреть Баланс →", "عرض الأرصدة ←"],
  "Explore Qualifying Plans →": ["Explorar Planes Calificados →", "Bekijk Kwalificerende Plannen →", "Explorar Planos Qualificados →", "Explorer les Plans Éligibles →", "Qualifizierende Pläne Entdecken →", "浏览合资格投资方案 →", "Перейти к Планам →", "استكشف الخطط المؤهلة ←"],
  "Total Assets": ["Activos Totales", "Totale Activa", "Ativos Totais", "Total des Actifs", "Gesamtvermögen", "总资产", "Всего Активов", "إجمالي الأصول"],
  "Live USD Balances": ["Saldos USD en Vivo", "Live USD Saldi", "Saldos USD ao Vivo", "Soldes USD en Direct", "Live-USD-Guthaben", "实时 USD 余额", "Баланс в USD", "الأرصدة المباشرة بالدولار"],
  "Aggregated Live Balances (USD)": ["Saldos Agregados en Tiempo Real (USD)", "Geaggregeerde Live Saldi (USD)", "Saldos Agregados ao Vivo (USD)", "Soldes Agrégés en Direct (USD)", "Gesamtsaldo in Echtzeit (USD)", "实时汇总总余额 (USD)", "Совокупный Баланс (USD)", "إجمالي الأرصدة المباشرة (USD)"],
  "Active Contracts": ["Contratos Activos", "Actieve Contracten", "Contratos Ativos", "Contrats Actifs", "Aktive Verträge", "进行中合约", "Активные Контракты", "العقود النشطة"],
  "Accruing yield daily": ["Acumulando rendimiento diario", "Dagelijks rendement opbouwend", "Acumulando rendimento diário", "Générant un rendement quotidien", "Tägliche Renditegutschrift", "每日持续计息中", "Ежедневное начисление дохода", "تحقق عوائد يومية"],
  "KYC Compliance": ["Cumplimiento KYC", "KYC Naleving", "Conformidade KYC", "Conformité KYC", "KYC-Compliance", "KYC 合规状态", "KYC Статус", "امتثال توثيق الهوية"],
  "Verified": ["Verificado", "Geverifieerd", "Verificado", "Vérifié", "Verifiziert", "已认证", "Верифицирован", "موثق"],
  "Under Review": ["En Revisión", "In Behandeling", "Em Análise", "En Cours d'Examen", "In Prüfung", "审核中", "На Проверке", "قيد المراجعة"],
  "Pending": ["Pendiente", "In Afwachting", "Pendente", "En Attente", "Ausstehend", "待处理", "Ожидание", "قيد الانتظار"],
  "Rejected": ["Rechazado", "Afgewezen", "Rejeitado", "Rejeté", "Abgelehnt", "已拒绝", "Отклонено", "مرفوض"],
  "Approved": ["Aprobado", "Goedgekeurd", "Aprovado", "Approuvé", "Genehmigt", "已批准", "Одобрено", "مقبول"],
  "Completed": ["Completado", "Voltooid", "Concluído", "Terminé", "Abgeschlossen", "已完成", "Завершено", "مكتمل"],
  "Active": ["Activo", "Actief", "Ativo", "Actif", "Aktiv", "进行中", "Активен", "نشط"],
  "Matured": ["Vencido", "Vervallen", "Vencido", "Échu", "Fällig", "已到期", "Завершен", "مستحق"],
  "Tier-1 Standing Active": ["Nivel Tier-1 Activo", "Tier-1 Status Actief", "Status Tier-1 Ativo", "Statut Tier-1 Actif", "Tier-1-Status Aktiv", "一级合规权限已激活", "Статус Tier-1 Активен", "حالة الفئة الأولى نشطة"],
  "Complete Verification →": ["Completar Verificación →", "Verificatie Voltooien →", "Concluir Verificação →", "Compléter la Vérification →", "Verifizierung Abschließen →", "完成身份认证 →", "Пройти Верификацию →", "إكمال التوثيق ←"],
  "Liquid Asset Reserves": ["Reservas de Activos Líquidos", "Liquide Activareserves", "Reservas de Ativos Líquidos", "Réserves d'Actifs Liquides", "Liquide Vermögensreserven", "流动资产储备", "Резервы Ликвидных Активов", "احتياطيات الأصول السائلة"],
  "BTC Wallet": ["Billetera BTC", "BTC Wallet", "Carteira BTC", "Portefeuille BTC", "BTC-Wallet", "BTC 钱包", "Кошелек BTC", "محفظة BTC"],
  "ETH Wallet": ["Billetera ETH", "ETH Wallet", "Carteira ETH", "Portefeuille ETH", "ETH-Wallet", "ETH 钱包", "Кошелек ETH", "محفظة ETH"],
  "USDT Wallet": ["Billetera USDT", "USDT Wallet", "Carteira USDT", "Portefeuille USDT", "USDT-Wallet", "USDT 钱包", "Кошелек USDT", "محفظة USDT"],
  "SOL Wallet": ["Billetera SOL", "SOL Wallet", "Carteira SOL", "Portefeuille SOL", "SOL-Wallet", "SOL 钱包", "Кошелек SOL", "محفظة SOL"],
  "0.0000 Locked": ["0.0000 Bloqueado", "0.0000 Vergrendeld", "0.0000 Bloqueado", "0.0000 Verrouillé", "0.0000 Gesperrt", "0.0000 已锁定", "0.0000 Заблокировано", "0.0000 مقفل"],
  "Deposit / Withdraw": ["Depositar / Retirar", "Storten / Opnemen", "Depositar / Sacar", "Déposer / Retirer", "Einzahlen / Auszahlen", "存款 / 提款", "Пополнить / Вывести", "إيداع / سحب"],
  "Active Yield Contracts": ["Contratos de Rendimiento Activos", "Actieve Rendementscontracten", "Contratos de Rendimento Ativos", "Contrats de Rendement Actifs", "Aktive Renditeverträge", "进行中的收益合约", "Активные Контракты Доходности", "عقود العوائد النشطة"],
  "Explore Tiers": ["Explorar Niveles", "Bekijk Niveaus", "Explorar Níveis", "Explorer les Niveaux", "Stufen Entdecken", "浏览等级", "Все Тарифы", "استكشف الباقات"],
  "No active yield contracts running. Explore our structured tiers to start earning.": [
    "No hay contratos de rendimiento activos. Explore nuestros niveles estructurados para comenzar a ganar.",
    "Geen actieve rendementscontracten. Bekijk onze gestructureerde plannen om te beginnen met verdienen.",
    "Nenhum contrato de rendimento ativo no momento. Explore nossos níveis estruturados para começar a ganhar.",
    "Aucun contrat de rendement actif. Explorez nos niveaux structurés pour commencer à gagner.",
    "Keine aktiven Renditeverträge. Entdecken Sie unsere strukturierten Stufen, um Erträge zu erzielen.",
    "当前没有进行中的收益合约。浏览我们的结构化投资等级以开始获取收益。",
    "Нет активных контрактов доходности. Выберите инвестиционный тариф, чтобы начать зарабатывать.",
    "لا توجد عقود عوائد نشطة حالياً. استكشف باقاتنا المهيكلة لبدء تحقيق الأرباح.",
  ],
  "Expected Total Settlement:": ["Liquidación Total Esperada:", "Verwachte Totale Uitkering:", "Liquidação Total Esperada:", "Règlement Total Attendu :", "Erwartete Gesamtauszahlung:", "预计到期总结算:", "Ожидаемая Итоговая Выплата:", "إجمالي التسوية المتوقعة:"],
  "Partner Program": ["Programa de Socios", "Partnerprogramma", "Programa de Parceiros", "Programme Partenaire", "Partnerprogramm", "合作伙伴计划", "Партнерская Программа", "برنامج الشركاء"],
  "Earn direct compounding commissions when your partners register and fund investment tiers. Commissions credit immediately to your liquid balance.": [
    "Gane comisiones directas cuando sus socios se registren y financien niveles de inversión. Las comisiones se acreditan de inmediato a su saldo líquido.",
    "Verdien directe commissies wanneer uw partners zich registreren en investeringsplannen financieren. Commissies worden direct bijgeschreven.",
    "Ganhe comissões diretas quando seus parceiros se cadastrarem e financiarem planos de investimento. As comissões são creditadas imediatamente.",
    "Gagnez des commissions directes lorsque vos partenaires s'inscrivent et financent des plans d'investissement.",
    "Verdienen Sie direkte Provisionen, wenn sich Ihre Partner registrieren und Anlagestufen finanzieren.",
    "当您的合作伙伴注册并投资任意方案时，即可赚取直接佣金，实时计入您的可用余额。",
    "Получайте прямые комиссии, когда ваши партнеры регистрируются и инвестируют. Начисления поступают мгновенно.",
    "اربح عمولات مباشرة عندما يقوم شركاؤك بالتسجيل وتمويل باقات الاستثمار. تُضاف العمولات فوراً إلى رصيدك المتاح.",
  ],
  "Your Referral Link": ["Su Enlace de Referido", "Uw Verwijzingslink", "Seu Link de Indicação", "Votre Lien de Parrainage", "Ihr Empfehlungslink", "您的专属推荐链接", "Ваша Реферальная Ссылка", "رابط الإحالة الخاص بك"],
  "Referred Members": ["Miembros Referidos", "Doorverwezen Leden", "Membros Indicados", "Membres Parrainés", "Geworbene Mitglieder", "已推荐会员", "Приглашенные", "الأعضاء المُحالون"],
  "Earned Rewards": ["Recompensas Ganadas", "Verdiende Beloningen", "Recompensas Ganhas", "Récompenses Gagnées", "Verdiente Prämien", "累计奖励收益", "Заработано", "المكافآت المكتسبة"],

  // ── Admin Overview & Common Table / Form Controls ──
  "Production Management System": ["Sistema de Gestión en Producción", "Productiebeheersysteem", "Sistema de Gestão de Produção", "Système de Gestion de Production", "Produktionsverwaltungssystem", "生产环境管理系统", "Система Управления Платформой", "نظام إدارة الإنتاج"],
  "Platform Control Center": ["Centro de Control de la Plataforma", "Platform Controlecentrum", "Centro de Controle da Plataforma", "Centre de Contrôle de la Plateforme", "Plattform-Kontrollzentrum", "平台控制中心", "Центр Управления Платформой", "مركز التحكم بالمنصة"],
  "Real-time multi-asset metrics aggregated directly from platform database records.": [
    "Métricas multiactivo en tiempo real agregadas directamente desde la base de datos.",
    "Realtime multi-asset statistieken direct geaggregeerd uit de platformdatabase.",
    "Métricas multiativos em tempo real agregadas diretamente do banco de dados da plataforma.",
    "Indicateurs multi-actifs en temps réel agrégés directement depuis la base de données.",
    "Echtzeit-Multi-Asset-Kennzahlen direkt aus der Plattformdatenbank.",
    "直接从平台数据库实时汇总的多资产核心指标。",
    "Мульти-активные показатели в реальном времени напрямую из базы данных.",
    "مقاييس متعددة الأصول في الوقت الفعلي مجمعة مباشرة من سجلات قاعدة بيانات المنصة.",
  ],
  "Today": ["Hoy", "Vandaag", "Hoje", "Aujourd'hui", "Heute", "今日", "Сегодня", "اليوم"],
  "Last 7 Days": ["Últimos 7 Días", "Laatste 7 Dagen", "Últimos 7 Dias", "7 Derniers Jours", "Letzte 7 Tage", "最近 7 天", "За 7 Дней", "آخر 7 أيام"],
  "Last 30 Days": ["Últimos 30 Días", "Laatste 30 Dagen", "Últimos 30 Dias", "30 Derniers Jours", "Letzte 30 Tage", "最近 30 天", "За 30 Дней", "آخر 30 يوماً"],
  "Last 90 Days": ["Últimos 90 Días", "Laatste 90 Dagen", "Últimos 90 Dias", "90 Derniers Jours", "Letzte 90 Tage", "最近 90 天", "За 90 Дней", "آخر 90 يوماً"],
  "All Time": ["Todo el Tiempo", "Altijd", "Todo o Período", "Tout le Temps", "Gesamter Zeitraum", "全部时间", "За Все Время", "كل الأوقات"],
  "Refresh": ["Actualizar", "Vernieuwen", "Atualizar", "Actualiser", "Aktualisieren", "刷新", "Обновить", "تحديث"],
  "Search": ["Buscar", "Zoeken", "Buscar", "Rechercher", "Suchen", "搜索", "Поиск", "بحث"],
  "Filter": ["Filtrar", "Filteren", "Filtrar", "Filtrer", "Filtern", "筛选", "Фильтр", "تصفية"],
  "Status": ["Estado", "Status", "Status", "Statut", "Status", "状态", "Статус", "الحالة"],
  "Amount": ["Monto", "Bedrag", "Valor", "Montant", "Betrag", "金额", "Сумма", "المبلغ"],
  "Currency": ["Moneda", "Valuta", "Moeda", "Devise", "Währung", "币种", "Валюта", "العملة"],
  "Date": ["Fecha", "Datum", "Data", "Date", "Datum", "日期", "Дата", "التاريخ"],
  "Actions": ["Acciones", "Acties", "Ações", "Actions", "Aktionen", "操作", "Действия", "الإجراءات"],
  "Approve": ["Aprobar", "Goedkeuren", "Aprovar", "Approuver", "Genehmigen", "批准", "Одобрить", "موافقة"],
  "Reject": ["Rechazar", "Afwijzen", "Rejeitar", "Rejeter", "Ablehnen", "拒绝", "Отклонить", "رفض"],
  "Cancel": ["Cancelar", "Annuleren", "Cancelar", "Annuler", "Abbrechen", "取消", "Отмена", "إلغاء"],
  "Save": ["Guardar", "Opslaan", "Salvar", "Enregistrer", "Speichern", "保存", "Сохранить", "حفظ"],
  "Save Changes": ["Guardar Cambios", "Wijzigingen Opslaan", "Salvar Alterações", "Enregistrer les Modifications", "Änderungen Speichern", "保存更改", "Сохранить Изменения", "حفظ التغييرات"],
  "Submit": ["Enviar", "Verzenden", "Enviar", "Soumettre", "Absenden", "提交", "Отправить", "إرسال"],
  "Close": ["Cerrar", "Sluiten", "Fechar", "Fermer", "Schließen", "关闭", "Закрыть", "إغلاق"],
  "Confirm": ["Confirmar", "Bevestigen", "Confirmar", "Confirmer", "Bestätigen", "确认", "Подтвердить", "تأكيد"],
  "Delete": ["Eliminar", "Verwijderen", "Excluir", "Supprimer", "Löschen", "删除", "Удалить", "حذف"],
  "Edit": ["Editar", "Bewerken", "Editar", "Modifier", "Bearbeiten", "编辑", "Изменить", "تعديل"],
  "View": ["Ver", "Bekijken", "Visualizar", "Voir", "Ansehen", "查看", "Просмотр", "عرض"],
  "Copy": ["Copiar", "Kopiëren", "Copiar", "Copier", "Kopieren", "复制", "Копировать", "نسخ"],
  "Copied": ["Copiado", "Gekopieerd", "Copiado", "Copié", "Kopiert", "已复制", "Скопировано", "تم النسخ"],
  "Available Balance": ["Saldo Disponible", "Beschikbaar Saldo", "Saldo Disponível", "Solde Disponible", "Verfügbares Guthaben", "可用余额", "Доступный Баланс", "الرصيد المتاح"],
  "Locked Balance": ["Saldo Bloqueado", "Vergrendeld Saldo", "Saldo Bloqueado", "Solde Verrouillé", "Gesperrtes Guthaben", "锁定余额", "Заблокированный Баланс", "الرصيد المقفل"],
  "Pending Withdrawal": ["Retiro Pendiente", "Opname in Afwachting", "Saque Pendente", "Retrait en Attente", "Ausstehende Auszahlung", "待处理提款", "Ожидающий Вывод", "سحب قيد الانتظار"],
  "Pending Deposit": ["Depósito Pendiente", "Storting in Afwachting", "Depósito Pendente", "Dépôt en Attente", "Ausstehende Einzahlung", "待处理存款", "Ожидающий Депозит", "إيداع قيد الانتظار"],
};

const PHRASE_TABLE: Record<string, LangTuple> = {
  ...BASE_PHRASE_TABLE,
  ...EXTENDED_PHRASES,
};

const LANG_INDEX: Record<Exclude<LanguageCode, "en">, number> = {
  es: 0,
  nl: 1,
  pt: 2,
  fr: 3,
  de: 4,
  zh: 5,
  ru: 6,
  ar: 7,
};

/**
 * Translate any UI phrase or dynamic pattern into the target language while preserving
 * financial numbers, currency codes, wallet addresses, and user names.
 */
export function translatePhrase(raw: string, lang: LanguageCode): string {
  if (!raw || lang === "en") return raw;

  // 1. Check translation key dictionary first
  if (translations[lang]?.[raw]) {
    return translations[lang][raw];
  }

  const trimmed = raw.trim();
  if (!trimmed) return raw;

  const idx = LANG_INDEX[lang];
  if (idx === undefined) return raw;

  // 2. Direct exact phrase lookup
  const exact = PHRASE_TABLE[trimmed];
  if (exact && exact[idx]) {
    return raw.replace(trimmed, exact[idx]);
  }

  // 3. Case-insensitive status / badge lookup for single status words
  const lower = trimmed.toLowerCase();
  const statusMap: Record<string, string> = {
    pending: "Pending",
    approved: "Approved",
    verified: "Verified",
    rejected: "Rejected",
    completed: "Completed",
    active: "Active",
    matured: "Matured",
    under_review: "Under Review",
  };
  if (statusMap[lower] && PHRASE_TABLE[statusMap[lower]]) {
    return raw.replace(trimmed, PHRASE_TABLE[statusMap[lower]][idx]);
  }

  // 4. Dynamic Pattern Matching (preserves numbers, currencies, dates, and names)
  // Pattern: "Welcome back, <Name>"
  const welcomeMatch = trimmed.match(/^Welcome back,\s*(.+)$/i);
  if (welcomeMatch) {
    const name = welcomeMatch[1];
    const prefixes: LangTuple = [
      `Bienvenido de nuevo, ${name}`,
      `Welkom terug, ${name}`,
      `Bem-vindo de volta, ${name}`,
      `Bon retour, ${name}`,
      `Willkommen zurück, ${name}`,
      `欢迎回来，${name}`,
      `С возвращением, ${name}`,
      `مرحباً بعودتك، ${name}`,
    ];
    return prefixes[idx];
  }

  // Pattern: "Notifications (<N>)"
  const notifMatch = trimmed.match(/^Notifications\s*\((\d+)\)$/i);
  if (notifMatch) {
    const n = notifMatch[1];
    const labels: LangTuple = [
      `Notificaciones (${n})`,
      `Meldingen (${n})`,
      `Notificações (${n})`,
      `Notifications (${n})`,
      `Benachrichtigungen (${n})`,
      `系统通知 (${n})`,
      `Уведомления (${n})`,
      `الإشعارات (${n})`,
    ];
    return labels[idx];
  }

  // Pattern: "<N> Days" or "<N> days left"
  const daysMatch = trimmed.match(/^(\d+)\s+Days$/i);
  if (daysMatch) {
    const n = daysMatch[1];
    const labels: LangTuple = [
      `${n} Días`,
      `${n} Dagen`,
      `${n} Dias`,
      `${n} Jours`,
      `${n} Tage`,
      `${n} 天`,
      `${n} Дн.`,
      `${n} أيام`,
    ];
    return labels[idx];
  }

  const daysLeftMatch = trimmed.match(/^(\d+)\s+days\s+left$/i);
  if (daysLeftMatch) {
    const n = daysLeftMatch[1];
    const labels: LangTuple = [
      `${n} días restantes`,
      `Nog ${n} dagen`,
      `${n} dias restantes`,
      `${n} jours restants`,
      `Noch ${n} Tage`,
      `剩余 ${n} 天`,
      `Осталось ${n} дн.`,
      `متبقي ${n} أيام`,
    ];
    return labels[idx];
  }

  // Pattern: "Select <Tier>"
  const selectTierMatch = trimmed.match(/^Select\s+(Silver|Gold|Platinum|Diamond)$/i);
  if (selectTierMatch) {
    const tierKey = `${selectTierMatch[1]} Tier`;
    const translatedTier = PHRASE_TABLE[tierKey]?.[idx] || selectTierMatch[1];
    const prefixes: LangTuple = [
      `Seleccionar ${translatedTier}`,
      `Selecteer ${translatedTier}`,
      `Selecionar ${translatedTier}`,
      `Choisir ${translatedTier}`,
      `${translatedTier} Wählen`,
      `选择${translatedTier}`,
      `Выбрать ${translatedTier}`,
      `اختر ${translatedTier}`,
    ];
    return prefixes[idx];
  }

  // Pattern: "$<Amount> USDT Welcome Bonus Credited"
  const bonusMatch = trimmed.match(/^\$([\d.,]+)\s+USDT\s+Welcome\s+Bonus\s+Credited$/i);
  if (bonusMatch) {
    const amt = bonusMatch[1];
    const labels: LangTuple = [
      `Bono de Bienvenida de $${amt} USDT Acreditado`,
      `$${amt} USDT Welkomstbonus Bijgeschreven`,
      `Bônus de Boas-Vindas de $${amt} USDT Creditado`,
      `Bonus de Bienvenue de $${amt} USDT Crédité`,
      `$${amt} USDT Willkommensbonus Gutgeschrieben`,
      `已发放 $${amt} USDT 欢迎奖金`,
      `Начислен Приветственный Бонус $${amt} USDT`,
      `تمت إضافة مكافأة ترحيب بقيمة $${amt} USDT`,
    ];
    return labels[idx];
  }

  // Pattern: "<N> affiliated members"
  const affMatch = trimmed.match(/^(\d+)\s+affiliated\s+members$/i);
  if (affMatch) {
    const n = affMatch[1];
    const labels: LangTuple = [
      `${n} miembros afiliados`,
      `${n} aangesloten leden`,
      `${n} membros afiliados`,
      `${n} membres affiliés`,
      `${n} verbundene Mitglieder`,
      `${n} 位关联会员`,
      `${n} партнеров`,
      `${n} أعضاء تابعين`,
    ];
    return labels[idx];
  }

  // Pattern: "<N> Copiers"
  const copiersMatch = trimmed.match(/^([\d,.\s]+)\s+Copiers$/i);
  if (copiersMatch) {
    const n = copiersMatch[1];
    const labels: LangTuple = [
      `${n} Copiadores`,
      `${n} Volgers`,
      `${n} Copiadores`,
      `${n} Copieurs`,
      `${n} Kopierer`,
      `${n} 位跟单者`,
      `${n} Копируют`,
      `${n} ناسخ`,
    ];
    return labels[idx];
  }

  // Pattern: "Min: $<Amt>" / "Max: $<Amt>"
  const minMatch = trimmed.match(/^Min:\s*(.+)$/i);
  if (minMatch) {
    const val = minMatch[1];
    const labels: LangTuple = [
      `Mín: ${val}`,
      `Min: ${val}`,
      `Mín: ${val}`,
      `Min : ${val}`,
      `Min: ${val}`,
      `最低: ${val}`,
      `Мин: ${val}`,
      `الحد الأدنى: ${val}`,
    ];
    return labels[idx];
  }

  const maxMatch = trimmed.match(/^Max:\s*(.+)$/i);
  if (maxMatch) {
    const val = maxMatch[1];
    const labels: LangTuple = [
      `Máx: ${val}`,
      `Max: ${val}`,
      `Máx: ${val}`,
      `Max : ${val}`,
      `Max: ${val}`,
      `最高: ${val}`,
      `Макс: ${val}`,
      `الحد الأقصى: ${val}`,
    ];
    return labels[idx];
  }

  // Pattern: "Locked: <Amt>"
  const lockedMatch = trimmed.match(/^Locked:\s*(.+)$/i);
  if (lockedMatch) {
    const val = lockedMatch[1];
    const labels: LangTuple = [
      `Bloqueado: ${val}`,
      `Vergrendeld: ${val}`,
      `Bloqueado: ${val}`,
      `Verrouillé : ${val}`,
      `Gesperrt: ${val}`,
      `已锁定: ${val}`,
      `Заблокировано: ${val}`,
      `مقفل: ${val}`,
    ];
    return labels[idx];
  }

  // Pattern: "Principal: <Amt>"
  const principalMatch = trimmed.match(/^Principal:\s*(.+)$/i);
  if (principalMatch) {
    const val = principalMatch[1];
    const labels: LangTuple = [
      `Capital: ${val}`,
      `Hoofdsom: ${val}`,
      `Principal: ${val}`,
      `Capital : ${val}`,
      `Kapital: ${val}`,
      `本金: ${val}`,
      `Депозит: ${val}`,
      `رأس المال: ${val}`,
    ];
    return labels[idx];
  }

  // Pattern: "Maturity: <N>%"
  const matMatch = trimmed.match(/^Maturity:\s*(\d+%)$/i);
  if (matMatch) {
    const val = matMatch[1];
    const labels: LangTuple = [
      `Vencimiento: ${val}`,
      `Looptijd: ${val}`,
      `Vencimento: ${val}`,
      `Maturité : ${val}`,
      `Fälligkeit: ${val}`,
      `到期进度: ${val}`,
      `Срок: ${val}`,
      `الاستحقاق: ${val}`,
    ];
    return labels[idx];
  }

  // Pattern: "Started: <Date>"
  const startMatch = trimmed.match(/^Started:\s*(.+)$/i);
  if (startMatch) {
    const val = startMatch[1];
    const labels: LangTuple = [
      `Iniciado: ${val}`,
      `Gestart: ${val}`,
      `Iniciado: ${val}`,
      `Début : ${val}`,
      `Gestartet: ${val}`,
      `开始时间: ${val}`,
      `Начало: ${val}`,
      `بدأ في: ${val}`,
    ];
    return labels[idx];
  }

  return raw;
}
