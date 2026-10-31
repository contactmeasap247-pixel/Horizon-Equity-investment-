# ============================================
# HORIZON EQUITY - LOCALIZED EMAIL TEMPLATES
# Supported Languages: en, es, nl, pt, fr, de, zh, ru, ar
# ============================================

from typing import Dict, Any, Optional, Tuple

LOCALIZED_EMAIL_DATA: Dict[str, Dict[str, Dict[str, str]]] = {
    "account_welcome": {
        "en": {
            "subject": "Welcome to Horizon Equity — Your ${{bonus_amount}} Welcome Bonus",
            "greeting": "Welcome, {{user_name}}",
            "body": "Thank you for registering your investor account with Horizon Equity. We are pleased to confirm that a ${{bonus_amount}} USDT Welcome Promotional Credit has been credited to your account.",
            "card_title": "🎁 ${{bonus_amount}} Welcome Bonus Allocation",
            "card_body": "Your ${{bonus_amount}} bonus is viewable in your dashboard wallet. Under our promotional terms, this welcome bonus is locked for withdrawal until you successfully complete your first qualifying investment portfolio contract (e.g. Silver Starter Tier).",
            "btn": "Access Client Portal",
            "footer": "If you have any questions, our 24/7 private concierge desk is available at {{support_email}}.",
        },
        "es": {
            "subject": "Bienvenido a Horizon Equity — Su bono de bienvenida de ${{bonus_amount}}",
            "greeting": "Bienvenido/a, {{user_name}}",
            "body": "Gracias por registrar su cuenta de inversor con Horizon Equity. Nos complace confirmar que se ha acreditado un Crédito Promocional de Bienvenida de ${{bonus_amount}} USDT en su cuenta.",
            "card_title": "🎁 Asignación de bono de bienvenida de ${{bonus_amount}}",
            "card_body": "Su bono de ${{bonus_amount}} es visible en la billetera de su panel. Según nuestros términos promocionales, este bono está bloqueado para retiro hasta que complete con éxito su primer contrato de inversión calificado (ej. Nivel Silver).",
            "btn": "Acceder al portal de clientes",
            "footer": "Si tiene alguna pregunta, nuestro servicio de conserjería privada 24/7 está disponible en {{support_email}}.",
        },
        "nl": {
            "subject": "Welkom bij Horizon Equity — Uw welkomstbonus van ${{bonus_amount}}",
            "greeting": "Welkom, {{user_name}}",
            "body": "Bedankt voor het registreren van uw beleggersaccount bij Horizon Equity. Met genoegen bevestigen wij dat er een welkomsttegoed van ${{bonus_amount}} USDT op uw account is bijgeschreven.",
            "card_title": "🎁 Welkomstbonustoewijzing van ${{bonus_amount}}",
            "card_body": "Uw bonus van ${{bonus_amount}} is zichtbaar in uw dashboardportemonnee. Volgens onze actievoorwaarden is deze bonus vergrendeld voor opname totdat u uw eerste in aanmerking komende beleggingscontract (bijv. Silver Starter Tier) heeft voltooid.",
            "btn": "Naar klantenportaal",
            "footer": "Heeft u vragen? Onze 24/7 conciërgedesk staat voor u klaar via {{support_email}}.",
        },
        "pt": {
            "subject": "Bem-vindo ao Horizon Equity — Seu bônus de boas-vindas de ${{bonus_amount}}",
            "greeting": "Bem-vindo(a), {{user_name}}",
            "body": "Obrigado por registrar sua conta de investidor no Horizon Equity. Temos o prazer de confirmar que um Crédito Promocional de Boas-Vindas de ${{bonus_amount}} USDT foi creditado em sua conta.",
            "card_title": "🎁 Alocação de bônus de boas-vindas de ${{bonus_amount}}",
            "card_body": "Seu bônus de ${{bonus_amount}} está visível na carteira do seu painel. Sob nossos termos promocionais, este bônus fica bloqueado para saque até que você conclua seu primeiro contrato de investimento qualificado (ex: Nível Silver).",
            "btn": "Acessar portal do cliente",
            "footer": "Se você tiver alguma dúvida, nosso atendimento exclusivo 24/7 está disponível em {{support_email}}.",
        },
        "fr": {
            "subject": "Bienvenue chez Horizon Equity — Votre bonus de bienvenue de ${{bonus_amount}}",
            "greeting": "Bienvenue, {{user_name}}",
            "body": "Merci d'avoir créé votre compte investisseur auprès d'Horizon Equity. Nous avons le plaisir de vous confirmer qu'un crédit promotionnel de bienvenue de ${{bonus_amount}} USDT a été crédité sur votre compte.",
            "card_title": "🎁 Allocation de bonus de bienvenue de ${{bonus_amount}}",
            "card_body": "Votre bonus de ${{bonus_amount}} est visible dans votre portefeuille. Selon nos conditions promotionnelles, ce bonus est verrouillé pour le retrait jusqu'à ce que vous complétiez votre premier contrat d'investissement qualifié (ex. Niveau Silver).",
            "btn": "Accéder au portail client",
            "footer": "Pour toute question, notre conciergerie privée 24/7 est disponible à l'adresse {{support_email}}.",
        },
        "de": {
            "subject": "Willkommen bei Horizon Equity — Ihr ${{bonus_amount}} Willkommensbonus",
            "greeting": "Willkommen, {{user_name}}",
            "body": "Vielen Dank für die Registrierung Ihres Anlegerkontos bei Horizon Equity. Wir freuen uns zu bestätigen, dass Ihrem Konto ein Willkommens-Guthaben von ${{bonus_amount}} USDT gutgeschrieben wurde.",
            "card_title": "🎁 Zuweisung des ${{bonus_amount}} Willkommensbonus",
            "card_body": "Ihr ${{bonus_amount}} Bonus ist in Ihrer Dashboard-Wallet sichtbar. Gemäß unseren Aktionsbedingungen ist dieser Willkommensbonus für Auszahlungen gesperrt, bis Sie Ihren ersten qualifizierenden Anlagevertrag abgeschlossen haben.",
            "btn": "Zum Kundenportal",
            "footer": "Bei Fragen steht Ihnen unser Concierge-Desk rund um die Uhr unter {{support_email}} zur Verfügung.",
        },
        "zh": {
            "subject": "欢迎加入 Horizon Equity — 您的 ${{bonus_amount}} 迎新奖金",
            "greeting": "尊敬的 {{user_name}}，欢迎您",
            "body": "感谢您在 Horizon Equity 注册投资者账户。我们很高兴地确认，一笔价值 ${{bonus_amount}} USDT 的迎新推广金已注入您的账户。",
            "card_title": "🎁 ${{bonus_amount}} 迎新奖金配额",
            "card_body": "您的 ${{bonus_amount}} 奖金可在控制面板的钱包中查看。根据促销规则，在您完成首笔符合条件的投资组合合约（例如白银初级计划）之前，该奖金暂被锁定以防提现。",
            "btn": "进入客户门户",
            "footer": "如有任何疑问，我们的 24/7 全天候私人礼宾客服团队将随时通过 {{support_email}} 为您服务。",
        },
        "ru": {
            "subject": "Добро пожаловать в Horizon Equity — Ваш приветственный бонус ${{bonus_amount}}",
            "greeting": "Добро пожаловать, {{user_name}}",
            "body": "Благодарим вас за открытие счета инвестора в Horizon Equity. Мы рады подтвердить зачисление приветственного бонуса в размере ${{bonus_amount}} USDT на ваш счет.",
            "card_title": "🎁 Начисление приветственного бонуса ${{bonus_amount}}",
            "card_body": "Ваш бонус ${{bonus_amount}} отображается в кошельке панели управления. Согласно условиям, вывод бонуса станет доступен после завершения вашего первого квалификационного инвестиционного контракта.",
            "btn": "Войти в личный кабинет",
            "footer": "Если у вас возникли вопросы, наша круглосуточная служба поддержки доступна по адресу {{support_email}}.",
        },
        "ar": {
            "subject": "مرحبًا بك في هورايزون إكويتي — مكافأة ترحيبية بقيمة ${{bonus_amount}}",
            "greeting": "مرحبًا بك، {{user_name}}",
            "body": "شكرًا لتسجيل حساب المستثمر الخاص بك مع هورايزون إكويتي. يسعدنا أن نؤكد أنه تم إضافة رصيد ترويجي ترحيبي بقيمة ${{bonus_amount}} USDT إلى حسابك.",
            "card_title": "🎁 تخصيص مكافأة ترحيبية بقيمة ${{bonus_amount}}",
            "card_body": "مكافأتك البالغة ${{bonus_amount}} معروضة في محفظتك. بموجب الشروط الترويجية، يتم قفل هذه المكافأة حتى تكمل أول عقد استثماري مؤهل.",
            "btn": "الدخول إلى بوابة العملاء",
            "footer": "إذا كانت لديك أية أسئلة، فإن مكتب الدعم المخصص متاح على مدار الساعة عبر {{support_email}}.",
        },
    },
    "account_verification": {
        "en": {
            "subject": "Verify your Horizon Equity account",
            "title": "Verify Your Email Address",
            "body": "Hello {{user_name}}, please confirm your email address to secure your account and activate withdrawals. This verification link expires in {{expires_hours}} hours.",
            "btn": "Verify Email Address",
            "subtext": "Or copy and paste this link in your browser: {{verification_link}}",
        },
        "es": {
            "subject": "Verifique su cuenta de Horizon Equity",
            "title": "Verifique su dirección de correo electrónico",
            "body": "Hola {{user_name}}, confirme su correo para proteger su cuenta y activar los retiros. Este enlace expira en {{expires_hours}} horas.",
            "btn": "Verificar correo electrónico",
            "subtext": "O copie y pegue este enlace en su navegador: {{verification_link}}",
        },
        "nl": {
            "subject": "Verifieer uw Horizon Equity-account",
            "title": "Verifieer uw e-mailadres",
            "body": "Hallo {{user_name}}, bevestig uw e-mailadres om uw account te beveiligen en opnames te activeren. Deze verificatielink verloopt over {{expires_hours}} uur.",
            "btn": "E-mailadres verifiëren",
            "subtext": "Of kopieer en plak deze link in uw browser: {{verification_link}}",
        },
        "pt": {
            "subject": "Verifique sua conta Horizon Equity",
            "title": "Verifique seu endereço de e-mail",
            "body": "Olá {{user_name}}, confirme seu endereço de e-mail para proteger sua conta e ativar saques. Este link expira em {{expires_hours}} horas.",
            "btn": "Verificar endereço de e-mail",
            "subtext": "Ou copie e cole este link no seu navegador: {{verification_link}}",
        },
        "fr": {
            "subject": "Vérifiez votre compte Horizon Equity",
            "title": "Vérifiez votre adresse e-mail",
            "body": "Bonjour {{user_name}}, veuillez confirmer votre e-mail pour sécuriser votre compte et débloquer les retraits. Ce lien expire dans {{expires_hours}} heures.",
            "btn": "Vérifier l'adresse e-mail",
            "subtext": "Ou copiez et collez ce lien dans votre navigateur : {{verification_link}}",
        },
        "de": {
            "subject": "Bestätigen Sie Ihr Horizon Equity-Konto",
            "title": "E-Mail-Adresse bestätigen",
            "body": "Hallo {{user_name}}, bitte bestätigen Sie Ihre E-Mail-Adresse, um Ihr Konto zu sichern und Auszahlungen freizuschalten. Dieser Link ist {{expires_hours}} Stunden gültig.",
            "btn": "E-Mail-Adresse bestätigen",
            "subtext": "Oder kopieren Sie diesen Link in Ihren Browser: {{verification_link}}",
        },
        "zh": {
            "subject": "验证您的 Horizon Equity 账户",
            "title": "验证您的电子邮箱地址",
            "body": "您好 {{user_name}}，请确认您的电子邮箱以确保账户安全并激活提现功能。此验证链接将在 {{expires_hours}} 小时后失效。",
            "btn": "验证电子邮箱",
            "subtext": "或将此链接复制并粘贴到浏览器中：{{verification_link}}",
        },
        "ru": {
            "subject": "Подтвердите свою учетную запись Horizon Equity",
            "title": "Подтвердите свой адрес электронной почты",
            "body": "Здравствуйте, {{user_name}}! Пожалуйста, подтвердите свой адрес электронной почты для защиты аккаунта и активации вывода средств. Ссылка действительна {{expires_hours}} ч.",
            "btn": "Подтвердить почту",
            "subtext": "Или скопируйте и вставьте эту ссылку в браузер: {{verification_link}}",
        },
        "ar": {
            "subject": "تحقق من حساب هورايزون إكويتي الخاص بك",
            "title": "تأكيد عنوان بريدك الإلكتروني",
            "body": "مرحبًا {{user_name}}، يرجى تأكيد عنوان بريدك الإلكتروني لتأمين حسابك وتفعيل السحب. تنتهي صلاحية هذا الرابط خلال {{expires_hours}} ساعة.",
            "btn": "تأكيد البريد الإلكتروني",
            "subtext": "أو انسخ هذا الرابط والصقه في متصفحك: {{verification_link}}",
        },
    },
    "password_reset": {
        "en": {
            "subject": "Reset Your Horizon Equity Password",
            "title": "Password Reset Request",
            "body": "Hello {{user_name}}, we received a request to reset your password. If you initiated this request, please click below. This link expires in {{expires_minutes}} minutes.",
            "btn": "Reset Password",
            "subtext": "If you did not make this request, please disregard this email or contact security immediately.",
        },
        "es": {
            "subject": "Restablezca su contraseña de Horizon Equity",
            "title": "Solicitud de restablecimiento de contraseña",
            "body": "Hola {{user_name}}, recibimos una solicitud para restablecer su contraseña. Si usted inició esto, haga clic abajo. Este enlace vence en {{expires_minutes}} minutos.",
            "btn": "Restablecer contraseña",
            "subtext": "Si no solicitó esto, ignore este mensaje o contacte a seguridad de inmediato.",
        },
        "nl": {
            "subject": "Stel uw Horizon Equity-wachtwoord opnieuw in",
            "title": "Verzoek om wachtwoord opnieuw in te stellen",
            "body": "Hallo {{user_name}}, we hebben een verzoek ontvangen om uw wachtwoord opnieuw in te stellen. Als u dit heeft aangevraagd, klik dan hieronder. Deze link verloopt over {{expires_minutes}} minuten.",
            "btn": "Wachtwoord opnieuw instellen",
            "subtext": "Als u dit verzoek niet heeft gedaan, negeer deze e-mail dan of neem direct contact op met onze beveiliging.",
        },
        "pt": {
            "subject": "Redefina sua senha do Horizon Equity",
            "title": "Solicitação de redefinição de senha",
            "body": "Olá {{user_name}}, recebemos uma solicitação para redefinir sua senha. Se foi você quem solicitou, clique abaixo. Este link expira em {{expires_minutes}} minutos.",
            "btn": "Redefinir senha",
            "subtext": "Se você não fez essa solicitação, desconsidere este e-mail ou entre em contato com nossa equipe de segurança.",
        },
        "fr": {
            "subject": "Réinitialisez votre mot de passe Horizon Equity",
            "title": "Demande de réinitialisation de mot de passe",
            "body": "Bonjour {{user_name}}, nous avons reçu une demande de réinitialisation de votre mot de passe. Si vous êtes à l'origine de cette demande, cliquez ci-dessous. Ce lien expire dans {{expires_minutes}} minutes.",
            "btn": "Réinitialiser le mot de passe",
            "subtext": "Si vous n'êtes pas à l'origine de cette demande, veuillez ignorer ce message ou contacter immédiatement le service sécurité.",
        },
        "de": {
            "subject": "Setzen Sie Ihr Horizon Equity-Passwort zurück",
            "title": "Passwort zurücksetzen",
            "body": "Hallo {{user_name}}, wir haben eine Anfrage zum Zurücksetzen Ihres Passworts erhalten. Wenn Sie dies initiiert haben, klicken Sie bitte unten. Dieser Link ist {{expires_minutes}} Minuten gültig.",
            "btn": "Passwort zurücksetzen",
            "subtext": "Falls Sie dies nicht angefordert haben, ignorieren Sie diese E-Mail bitte oder kontaktieren Sie sofort die Sicherheit.",
        },
        "zh": {
            "subject": "重置您的 Horizon Equity 密码",
            "title": "密码重置请求",
            "body": "您好 {{user_name}}，我们收到了重置您账户密码的请求。如果您发起此请求，请点击下方按钮。此链接将在 {{expires_minutes}} 分钟后失效。",
            "btn": "重置密码",
            "subtext": "如果您并未发起该请求，请忽略此邮件或立即与我们的安全中心联系。",
        },
        "ru": {
            "subject": "Сброс пароля Horizon Equity",
            "title": "Запрос на сброс пароля",
            "body": "Здравствуйте, {{user_name}}! Мы получили запрос на сброс вашего пароля. Если вы инициировали этот запрос, нажмите кнопку ниже. Ссылка активна {{expires_minutes}} мин.",
            "btn": "Сбросить пароль",
            "subtext": "Если вы не отправляли данный запрос, проигнорируйте это письмо или свяжитесь со службой безопасности.",
        },
        "ar": {
            "subject": "إعادة تعيين كلمة مرور هورايزون إكويتي",
            "title": "طلب إعادة تعيين كلمة المرور",
            "body": "مرحبًا {{user_name}}، تلقينا طلبًا لإعادة تعيين كلمة المرور الخاصة بك. إذا كنت صاحب الطلب، يرجى النقر أدناه. ينتهي الرابط خلال {{expires_minutes}} دقيقة.",
            "btn": "إعادة تعيين كلمة المرور",
            "subtext": "إذا لم تطلب ذلك، يُرجى تجاهل هذه الرسالة أو التواصل مع فريق الأمان فورًا.",
        },
    },
    "deposit_submitted": {
        "en": {
            "subject": "Deposit Request Received — Ref: {{reference}}",
            "title": "Deposit Request Received",
            "body": "Hello {{user_name}}, your deposit request of {{amount}} {{currency}} has been logged with reference {{reference}}. Our settlement desk is verifying the blockchain transaction.",
            "btn": "View Transaction Ledger",
        },
        "es": {
            "subject": "Solicitud de depósito recibida — Ref: {{reference}}",
            "title": "Solicitud de depósito recibida",
            "body": "Hola {{user_name}}, su solicitud de depósito de {{amount}} {{currency}} ha sido registrada con la referencia {{reference}}. Nuestra mesa de liquidación está verificando la transacción en la cadena de bloques.",
            "btn": "Ver registro de transacciones",
        },
        "nl": {
            "subject": "Stortingsverzoek ontvangen — Ref: {{reference}}",
            "title": "Stortingsverzoek ontvangen",
            "body": "Hallo {{user_name}}, uw stortingsverzoek van {{amount}} {{currency}} is geregistreerd met referentie {{reference}}. Onze afwikkelingsafdeling verifieert de blockchain-transactie.",
            "btn": "Transactieoverzicht bekijken",
        },
        "pt": {
            "subject": "Solicitação de depósito recebida — Ref: {{reference}}",
            "title": "Solicitação de depósito recebida",
            "body": "Olá {{user_name}}, sua solicitação de depósito de {{amount}} {{currency}} foi registrada com a referência {{reference}}. Nossa mesa de liquidação está verificando a transação blockchain.",
            "btn": "Ver extrato de transações",
        },
        "fr": {
            "subject": "Demande de dépôt reçue — Réf : {{reference}}",
            "title": "Demande de dépôt reçue",
            "body": "Bonjour {{user_name}}, votre demande de dépôt de {{amount}} {{currency}} a été enregistrée sous la référence {{reference}}. Notre bureau de règlement vérifie la transaction blockchain.",
            "btn": "Consulter l'historique",
        },
        "de": {
            "subject": "Einzahlungsanfrage erhalten — Ref: {{reference}}",
            "title": "Einzahlungsanfrage erhalten",
            "body": "Hallo {{user_name}}, Ihre Einzahlungsanfrage über {{amount}} {{currency}} wurde unter der Referenz {{reference}} erfasst. Unsere Abwicklungsabteilung prüft die Transaktion.",
            "btn": "Transaktionsübersicht ansehen",
        },
        "zh": {
            "subject": "入金请求已接收 — 编号：{{reference}}",
            "title": "入金申请已收到",
            "body": "您好 {{user_name}}，您提交的 {{amount}} {{currency}} 入金请求已记录（参考编号：{{reference}}）。结算中心正在核验区块链网络确认。",
            "btn": "查看账本记录",
        },
        "ru": {
            "subject": "Запрос на депозит получен — Номер: {{reference}}",
            "title": "Запрос на депозит получен",
            "body": "Здравствуйте, {{user_name}}! Ваш запрос на депозит в размере {{amount}} {{currency}} зарегистрирован с номером {{reference}}. Служба расчетов проверяет транзакцию в блокчейне.",
            "btn": "Открыть журнал транзакций",
        },
        "ar": {
            "subject": "تم استلام طلب الإيداع — المرجع: {{reference}}",
            "title": "تم استلام طلب الإيداع",
            "body": "مرحبًا {{user_name}}، تم تسجيل طلب الإيداع الخاص بك بقيمة {{amount}} {{currency}} بالمرجع {{reference}}. يتحقق مكتب التسوية من معاملة البلوكشين.",
            "btn": "عرض سجل المعاملات",
        },
    },
    "deposit_confirmed": {
        "en": {
            "subject": "Deposit Confirmed & Credited — {{amount}} {{currency}}",
            "title": "Deposit Confirmed & Settled",
            "body": "Hello {{user_name}}, your deposit of {{amount}} {{currency}} has been successfully verified on-chain and credited to your available balance.",
            "btn": "Access Dashboard",
        },
        "es": {
            "subject": "Depósito confirmado y acreditado — {{amount}} {{currency}}",
            "title": "Depósito confirmado y liquidado",
            "body": "Hola {{user_name}}, su depósito de {{amount}} {{currency}} ha sido verificado con éxito en la cadena de bloques y acreditado a su saldo disponible.",
            "btn": "Acceder al panel",
        },
        "nl": {
            "subject": "Storting bevestigd en bijgeschreven — {{amount}} {{currency}}",
            "title": "Storting bevestigd en afgewikkeld",
            "body": "Hallo {{user_name}}, uw storting van {{amount}} {{currency}} is succesvol geverifieerd op de blockchain en bijgeschreven op uw beschikbare saldo.",
            "btn": "Naar dashboard",
        },
        "pt": {
            "subject": "Depósito confirmado e creditado — {{amount}} {{currency}}",
            "title": "Depósito confirmado e liquidado",
            "body": "Olá {{user_name}}, seu depósito de {{amount}} {{currency}} foi verificado com sucesso na rede blockchain e creditado ao seu saldo disponível.",
            "btn": "Acessar painel",
        },
        "fr": {
            "subject": "Dépôt confirmé et crédité — {{amount}} {{currency}}",
            "title": "Dépôt confirmé et réglé",
            "body": "Bonjour {{user_name}}, votre dépôt de {{amount}} {{currency}} a été validé avec succès sur la blockchain et crédité sur votre solde disponible.",
            "btn": "Accéder au tableau de bord",
        },
        "de": {
            "subject": "Einzahlung bestätigt und gutgeschrieben — {{amount}} {{currency}}",
            "title": "Einzahlung bestätigt und abgerechnet",
            "body": "Hallo {{user_name}}, Ihre Einzahlung von {{amount}} {{currency}} wurde erfolgreich auf der Blockchain bestätigt und Ihrem Guthaben gutgeschrieben.",
            "btn": "Zum Dashboard",
        },
        "zh": {
            "subject": "入金已确认并入账 — {{amount}} {{currency}}",
            "title": "入金已确认结算",
            "body": "您好 {{user_name}}，您充值的 {{amount}} {{currency}} 已在区块链上完成验证，并全额计入您的可用流动资金池。",
            "btn": "进入控制面板",
        },
        "ru": {
            "subject": "Депозит подтвержден и зачислен — {{amount}} {{currency}}",
            "title": "Депозит подтвержден и рассчитан",
            "body": "Здравствуйте, {{user_name}}! Ваш депозит в размере {{amount}} {{currency}} успешно подтвержден в блокчейне и зачислен на ваш баланс.",
            "btn": "Перейти в панель",
        },
        "ar": {
            "subject": "تم تأكيد الإيداع وإضافته للرصيد — {{amount}} {{currency}}",
            "title": "تم تأكيد الإيداع وتسويته",
            "body": "مرحبًا {{user_name}}، تم التحقق بنجاح من إيداعك بقيمة {{amount}} {{currency}} على البلوكشين وتمت إضافته إلى رصيدك المتاح.",
            "btn": "الدخول إلى لوحة التحكم",
        },
    },
    "withdrawal_submitted": {
        "en": {
            "subject": "Withdrawal Request Received — Ref: {{reference}}",
            "title": "Withdrawal Request Pending Review",
            "body": "Hello {{user_name}}, your withdrawal request of {{amount}} {{currency}} to destination {{destination}} has been received and queued for administrative compliance review.",
            "btn": "Review Withdrawal Status",
        },
        "es": {
            "subject": "Solicitud de retiro recibida — Ref: {{reference}}",
            "title": "Solicitud de retiro pendiente de revisión",
            "body": "Hola {{user_name}}, su solicitud de retiro de {{amount}} {{currency}} hacia {{destination}} ha sido recibida y puesta en cola para revisión de cumplimiento.",
            "btn": "Revisar estado de retiro",
        },
        "nl": {
            "subject": "Opnameverzoek ontvangen — Ref: {{reference}}",
            "title": "Opnameverzoek in behandeling",
            "body": "Hallo {{user_name}}, uw opnameverzoek van {{amount}} {{currency}} naar {{destination}} is ontvangen en in de wachtrij geplaatst voor nalevingscontrole.",
            "btn": "Opnamestatus bekijken",
        },
        "pt": {
            "subject": "Solicitação de saque recebida — Ref: {{reference}}",
            "title": "Solicitação de saque pendente de revisão",
            "body": "Olá {{user_name}}, sua solicitação de saque de {{amount}} {{currency}} para o destino {{destination}} foi recebida e encaminhada para análise de conformidade.",
            "btn": "Verificar status do saque",
        },
        "fr": {
            "subject": "Demande de retrait reçue — Réf : {{reference}}",
            "title": "Demande de retrait en attente d'examen",
            "body": "Bonjour {{user_name}}, votre demande de retrait de {{amount}} {{currency}} vers {{destination}} a été reçue et mise en file d'attente pour validation de conformité.",
            "btn": "Vérifier le statut du retrait",
        },
        "de": {
            "subject": "Auszahlungsanfrage erhalten — Ref: {{reference}}",
            "title": "Auszahlungsanfrage in Prüfung",
            "body": "Hallo {{user_name}}, Ihre Auszahlungsanfrage über {{amount}} {{currency}} an {{destination}} ist eingegangen und wartet auf Compliance-Prüfung.",
            "btn": "Auszahlungsstatus prüfen",
        },
        "zh": {
            "subject": "提现申请已接收 — 编号：{{reference}}",
            "title": "提现申请审核中",
            "body": "您好 {{user_name}}，您发起的 {{amount}} {{currency}}（目标地址：{{destination}}）提现申请已进入合规审核队列。",
            "btn": "查看提现状态",
        },
        "ru": {
            "subject": "Запрос на вывод средств получен — Номер: {{reference}}",
            "title": "Запрос на вывод на рассмотрении",
            "body": "Здравствуйте, {{user_name}}! Ваш запрос на вывод {{amount}} {{currency}} на адрес {{destination}} получен и находится на проверке комплаенс.",
            "btn": "Проверить статус вывода",
        },
        "ar": {
            "subject": "تم استلام طلب السحب — المرجع: {{reference}}",
            "title": "طلب السحب قيد المراجعة",
            "body": "مرحبًا {{user_name}}، تم استلام طلب السحب الخاص بك بقيمة {{amount}} {{currency}} إلى {{destination}} وتم إدراجه للمراجعة والامتثال.",
            "btn": "مراجعة حالة السحب",
        },
    },
    "withdrawal_completed": {
        "en": {
            "subject": "Withdrawal Dispatched & Settled — {{amount}} {{currency}}",
            "title": "Withdrawal Completed Successfully",
            "body": "Hello {{user_name}}, your withdrawal of {{amount}} {{currency}} has been processed and broadcast to the blockchain network. Destination: {{wallet_address}}.",
            "btn": "View Transaction Ledger",
        },
        "es": {
            "subject": "Retiro enviado y liquidado — {{amount}} {{currency}}",
            "title": "Retiro completado con éxito",
            "body": "Hola {{user_name}}, su retiro de {{amount}} {{currency}} ha sido procesado y transmitido a la red blockchain. Destino: {{wallet_address}}.",
            "btn": "Ver registro de transacciones",
        },
        "nl": {
            "subject": "Opname verzonden en afgewikkeld — {{amount}} {{currency}}",
            "title": "Opname succesvol voltooid",
            "body": "Hallo {{user_name}}, uw opname van {{amount}} {{currency}} is verwerkt en verzonden naar het blockchain-netwerk. Bestemming: {{wallet_address}}.",
            "btn": "Transactielog bekijken",
        },
        "pt": {
            "subject": "Saque enviado e liquidado — {{amount}} {{currency}}",
            "title": "Saque concluído com sucesso",
            "body": "Olá {{user_name}}, seu saque de {{amount}} {{currency}} foi processado e transmitido à rede blockchain. Destino: {{wallet_address}}.",
            "btn": "Ver extrato de transações",
        },
        "fr": {
            "subject": "Retrait envoyé et réglé — {{amount}} {{currency}}",
            "title": "Retrait effectué avec succès",
            "body": "Bonjour {{user_name}}, votre retrait de {{amount}} {{currency}} a été traité et diffusé sur la blockchain. Destination : {{wallet_address}}.",
            "btn": "Consulter l'historique",
        },
        "de": {
            "subject": "Auszahlung versendet und abgerechnet — {{amount}} {{currency}}",
            "title": "Auszahlung erfolgreich abgeschlossen",
            "body": "Hallo {{user_name}}, Ihre Auszahlung von {{amount}} {{currency}} wurde verarbeitet und an die Blockchain übermittelt. Zieladresse: {{wallet_address}}.",
            "btn": "Transaktionen anzeigen",
        },
        "zh": {
            "subject": "提现已汇出并结算 — {{amount}} {{currency}}",
            "title": "提现处理完成",
            "body": "您好 {{user_name}}，您提现的 {{amount}} {{currency}} 已完成处理并在区块链网络上成功广播。打款目标：{{wallet_address}}。",
            "btn": "查看账本流水",
        },
        "ru": {
            "subject": "Вывод средств отправлен и рассчитан — {{amount}} {{currency}}",
            "title": "Вывод средств успешно выполнен",
            "body": "Здравствуйте, {{user_name}}! Ваш вывод {{amount}} {{currency}} обработан и отправлен в сеть блокчейн. Кошелек назначения: {{wallet_address}}.",
            "btn": "Открыть журнал транзакций",
        },
        "ar": {
            "subject": "تم إرسال السحب وتسويته — {{amount}} {{currency}}",
            "title": "اكتمل السحب بنجاح",
            "body": "مرحبًا {{user_name}}، تمت معالجة سحبك البالغ {{amount}} {{currency}} وإرساله إلى شبكة البلوكشين. الوجهة: {{wallet_address}}.",
            "btn": "عرض سجل المعاملات",
        },
    },
    "investment_activated": {
        "en": {
            "subject": "Investment Portfolio Contract Activated — {{plan_name}}",
            "title": "Yield Contract Active",
            "body": "Hello {{user_name}}, your {{plan_name}} portfolio contract has been successfully activated with principal {{amount}} {{currency}}. Maturity scheduled for {{maturity_date}}.",
            "btn": "Track Portfolio Yield",
        },
        "es": {
            "subject": "Contrato de inversión activado — {{plan_name}}",
            "title": "Contrato de rendimiento activo",
            "body": "Hola {{user_name}}, su contrato de cartera {{plan_name}} ha sido activado con un principal de {{amount}} {{currency}}. Vencimiento programado para {{maturity_date}}.",
            "btn": "Seguir rendimiento de cartera",
        },
        "nl": {
            "subject": "Investeringscontract geactiveerd — {{plan_name}}",
            "title": "Rendementscontract actief",
            "body": "Hallo {{user_name}}, uw portefeuillecontract voor {{plan_name}} is geactiveerd met een hoofdsom van {{amount}} {{currency}}. Vervaldatum: {{maturity_date}}.",
            "btn": "Portefeuillerendement volgen",
        },
        "pt": {
            "subject": "Contrato de investimento ativado — {{plan_name}}",
            "title": "Contrato de rendimento ativo",
            "body": "Olá {{user_name}}, seu contrato {{plan_name}} foi ativado com principal de {{amount}} {{currency}}. Vencimento previsto para {{maturity_date}}.",
            "btn": "Acompanhar rendimento",
        },
        "fr": {
            "subject": "Contrat d'investissement activé — {{plan_name}}",
            "title": "Contrat de rendement actif",
            "body": "Bonjour {{user_name}}, votre contrat {{plan_name}} a été activé avec un capital de {{amount}} {{currency}}. Échéance prévue le {{maturity_date}}.",
            "btn": "Suivre le rendement",
        },
        "de": {
            "subject": "Investmentportfolio-Vertrag aktiviert — {{plan_name}}",
            "title": "Renditevertrag aktiv",
            "body": "Hallo {{user_name}}, Ihr {{plan_name}}-Vertrag wurde mit einem Anlagebetrag von {{amount}} {{currency}} aktiviert. Fälligkeit am {{maturity_date}}.",
            "btn": "Rendite verfolgen",
        },
        "zh": {
            "subject": "投资组合合约已启动 — {{plan_name}}",
            "title": "收益合约已正式生效",
            "body": "您好 {{user_name}}，您的 {{plan_name}} 投资组合合约已启动，本金为 {{amount}} {{currency}}。合约到期结算日：{{maturity_date}}。",
            "btn": "监控投资回报",
        },
        "ru": {
            "subject": "Инвестиционный контракт активирован — {{plan_name}}",
            "title": "Доходный контракт активен",
            "body": "Здравствуйте, {{user_name}}! Ваш контракт {{plan_name}} активирован с основной суммой {{amount}} {{currency}}. Дата завершения: {{maturity_date}}.",
            "btn": "Следить за доходностью",
        },
        "ar": {
            "subject": "تم تفعيل عقد المحفظة الاستثمارية — {{plan_name}}",
            "title": "عقد العائد نشط",
            "body": "مرحبًا {{user_name}}، تم تفعيل عقد {{plan_name}} الخاص بك برأس مال قدره {{amount}} {{currency}}. الاستحقاق مجدول في {{maturity_date}}.",
            "btn": "متابعة عائد المحفظة",
        },
    },
    "security_alert": {
        "en": {
            "subject": "Security Alert: Important Account Activity",
            "title": "Security Alert",
            "body": "Hello {{user_name}}, we detected an important account event: {{event_type}}. IP Address: {{ip_address}} at {{timestamp}}.",
            "btn": "Review Account Security",
        },
        "es": {
            "subject": "Alerta de seguridad: Actividad importante en la cuenta",
            "title": "Alerta de seguridad",
            "body": "Hola {{user_name}}, detectamos un evento importante en su cuenta: {{event_type}}. Dirección IP: {{ip_address}} a las {{timestamp}}.",
            "btn": "Revisar seguridad de la cuenta",
        },
        "nl": {
            "subject": "Beveiligingswaarschuwing: Belangrijke accountactiviteit",
            "title": "Beveiligingswaarschuwing",
            "body": "Hallo {{user_name}}, we hebben een belangrijke accountgebeurtenis gedetecteerd: {{event_type}}. IP-adres: {{ip_address}} op {{timestamp}}.",
            "btn": "Accountbeveiliging bekijken",
        },
        "pt": {
            "subject": "Alerta de segurança: Atividade importante na conta",
            "title": "Alerta de segurança",
            "body": "Olá {{user_name}}, detectamos um evento importante na conta: {{event_type}}. Endereço IP: {{ip_address}} em {{timestamp}}.",
            "btn": "Revisar segurança da conta",
        },
        "fr": {
            "subject": "Alerte de sécurité : Activité importante sur le compte",
            "title": "Alerte de sécurité",
            "body": "Bonjour {{user_name}}, nous avons détecté un événement important sur votre compte : {{event_type}}. Adresse IP : {{ip_address}} le {{timestamp}}.",
            "btn": "Vérifier la sécurité du compte",
        },
        "de": {
            "subject": "Sicherheitswarnung: Wichtige Kontoaktivität",
            "title": "Sicherheitswarnung",
            "body": "Hallo {{user_name}}, wir haben ein wichtiges Ereignis in Ihrem Konto festgestellt: {{event_type}}. IP-Adresse: {{ip_address}} um {{timestamp}}.",
            "btn": "Kontosicherheit prüfen",
        },
        "zh": {
            "subject": "安全警报：重要的账户操作",
            "title": "安全风险警报",
            "body": "您好 {{user_name}}，系统检测到重要的账户事件：{{event_type}}。IP 地址：{{ip_address}}，操作时间：{{timestamp}}。",
            "btn": "检查账户安全",
        },
        "ru": {
            "subject": "Оповещение безопасности: Важное действие в аккаунте",
            "title": "Оповещение безопасности",
            "body": "Здравствуйте, {{user_name}}! Зафиксировано важное событие в вашем аккаунте: {{event_type}}. IP-адрес: {{ip_address}} в {{timestamp}}.",
            "btn": "Проверить безопасность аккаунта",
        },
        "ar": {
            "subject": "تنبيه أمني: نشاط مهم في الحساب",
            "title": "تنبيه أمني",
            "body": "مرحبًا {{user_name}}، اكتشفنا حدثًا مهمًا في حسابك: {{event_type}}. عنوان IP: {{ip_address}} في {{timestamp}}.",
            "btn": "مراجعة أمان الحساب",
        },
    },
}


def build_localized_email(
    template_key: str,
    variables: Dict[str, Any],
    lang: Optional[str] = "en",
) -> Optional[Tuple[str, str, str]]:
    """Build localized email subject, HTML content, and plaintext content for any of the 9 supported languages."""
    target_lang = (lang or "en").lower().strip()
    if target_lang not in ("en", "es", "nl", "pt", "fr", "de", "zh", "ru", "ar"):
        target_lang = "en"

    KEY_ALIASES = {
        "welcome_bonus": "account_welcome",
        "welcome": "account_welcome",
        "verify_email": "account_verification",
    }
    resolved_key = KEY_ALIASES.get(template_key, template_key)

    template_dict = LOCALIZED_EMAIL_DATA.get(resolved_key)
    if not template_dict:
        return None

    lang_data = template_dict.get(target_lang) or template_dict.get("en")
    if not lang_data:
        return None

    # Replace variable placeholders in strings
    def substitute(template_str: str) -> str:
        res = template_str
        for k, v in variables.items():
            res = res.replace(f"{{{{{k}}}}}", str(v if v is not None else ""))
        return res

    subject = substitute(lang_data.get("subject", "Horizon Equity Notification"))
    greeting = substitute(lang_data.get("greeting", lang_data.get("title", "Horizon Equity")))
    body = substitute(lang_data.get("body", ""))
    btn_text = substitute(lang_data.get("btn", "Access Client Portal"))
    subtext = substitute(lang_data.get("subtext", ""))
    footer_text = substitute(lang_data.get("footer", "If you have any questions, our concierge desk is available 24/7."))

    action_url = (
        variables.get("verification_link")
        or variables.get("reset_link")
        or variables.get("login_url")
        or variables.get("dashboard_url")
        or "https://horizon-equity-investment.vercel.app/dashboard"
    )

    is_rtl = target_lang == "ar"
    dir_attr = 'dir="rtl"' if is_rtl else 'dir="ltr"'
    text_align = "right" if is_rtl else "left"

    card_markup = ""
    if "card_title" in lang_data:
        card_title = substitute(lang_data["card_title"])
        card_body = substitute(lang_data["card_body"])
        card_markup = f"""
    <div style="background: rgba(67, 136, 245, 0.1); border: 1px solid rgba(67, 136, 245, 0.25); border-radius: 6px; padding: 15px; margin: 20px 0; text-align: {text_align};">
      <p style="margin: 0 0 5px; color: #4388F5; font-weight: 700; font-size: 13px;">{card_title}</p>
      <p style="margin: 0; color: #94A3B8; font-size: 12px; line-height: 1.5;">{card_body}</p>
    </div>
"""

    subtext_markup = ""
    if subtext:
        subtext_markup = f"""<p style="color: #64748B; font-size: 12px; margin-top: 20px; line-height: 1.5; word-break: break-all; text-align: {text_align};">{subtext}</p>"""

    html_content = f"""<div {dir_attr} style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0B0F14; color: #F5F7FA; padding: 40px 20px; max-width: 600px; margin: auto; border-radius: 8px; border: 1px solid #1A2332;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #4388F5; margin: 0; font-size: 24px; letter-spacing: 1px;">HORIZON EQUITY</h1>
    <p style="color: #7D8998; font-size: 13px; margin: 5px 0 0;">Institutional Multi-Asset Wealth Management</p>
  </div>
  <div style="background: #111821; border: 1px solid #1E293B; border-radius: 8px; padding: 25px; margin-bottom: 25px; text-align: {text_align};">
    <h2 style="font-size: 18px; margin-top: 0; color: #FFFFFF; text-align: {text_align};">{greeting}</h2>
    <p style="color: #94A3B8; font-size: 14px; line-height: 1.6; text-align: {text_align};">{body}</p>
    {card_markup}
    <div style="text-align: center; margin: 30px 0;">
      <a href="{action_url}" style="background: #4388F5; color: #FFFFFF; text-decoration: none; padding: 12px 30px; border-radius: 6px; font-weight: 600; font-size: 14px; display: inline-block;">{btn_text}</a>
    </div>
    {subtext_markup}
  </div>
  <div style="color: #64748B; font-size: 12px; text-align: center; line-height: 1.5;">
    <p>{footer_text}</p>
    <p>&copy; Horizon Equity Investment Group. All rights reserved.</p>
  </div>
</div>"""

    text_content = f"{greeting}\n\n{body}\n\nLink: {action_url}\n\n{subtext}\n\nHorizon Equity"

    return subject, html_content, text_content

