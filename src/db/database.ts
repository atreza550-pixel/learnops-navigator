// ─── Fake localStorage-backed database ───
const DB_KEYS = {
  users: "loj_users",
  modules: "loj_modules",
  lessons: "loj_lessons",
  quizzes: "loj_quizzes",
  attempts: "loj_attempts",
  progress: "loj_progress",
  notifications: "loj_notifications",
  notes: "loj_notes",
  token: "loj_token",
} as const;

export type DBKey = keyof typeof DB_KEYS;

class Database {
  get<T = any>(key: DBKey): T[] {
    try {
      const raw = localStorage.getItem(DB_KEYS[key]);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  }

  set<T = any>(key: DBKey, value: T[]): void {
    localStorage.setItem(DB_KEYS[key], JSON.stringify(value));
  }

  getRaw(key: DBKey): string | null {
    return localStorage.getItem(DB_KEYS[key]);
  }

  setRaw(key: DBKey, value: string): void {
    localStorage.setItem(DB_KEYS[key], value);
  }

  removeRaw(key: DBKey): void {
    localStorage.removeItem(DB_KEYS[key]);
  }

  findById<T extends { id: string }>(key: DBKey, id: string): T | undefined {
    return this.get<T>(key).find((r) => r.id === id);
  }

  findWhere<T = any>(key: DBKey, predicate: (item: T) => boolean): T[] {
    return this.get<T>(key).filter(predicate);
  }

  insert(key: DBKey, record: any): any {
    const items = this.get(key);
    const newRecord = { ...record, id: record.id || `${key[0]}${Date.now()}`, createdAt: new Date().toISOString() };
    items.push(newRecord);
    this.set(key, items);
    return newRecord;
  }

  update(key: DBKey, id: string, changes: any): any {
    const items = this.get<{ id: string }>(key);
    const idx = items.findIndex((r) => r.id === id);
    if (idx === -1) return undefined;
    (items as any[])[idx] = { ...(items as any[])[idx], ...changes };
    this.set(key, items);
    return (items as any[])[idx];
  }

  delete(key: DBKey, id: string): boolean {
    const items = this.get<{ id: string }>(key);
    const filtered = items.filter((r) => r.id !== id);
    if (filtered.length === items.length) return false;
    this.set(key, filtered);
    return true;
  }

  seed(): void {
    if (localStorage.getItem("loj_seeded")) return;
    this.set("users", seedUsers);
    this.set("modules", seedModules);
    this.set("lessons", seedLessons);
    this.set("quizzes", seedQuizzes);
    this.set("progress", seedProgress);
    this.set("attempts", seedAttempts);
    this.set("notifications", seedNotifications);
    this.set("notes", []);
    localStorage.setItem("loj_seeded", "1");
  }
}

// ─── SEED DATA ───

export interface DBUser {
  id: string; name: string; email: string; password: string;
  role: "student" | "admin" | "instructor";
  avatar: string; avatarColor: string; joinedAt: string;
  totalPoints: number; streak: number; lastActiveDate: string;
  completedModules: string[];
}

export interface DBModule {
  id: string; title: string; icon: string; color: string;
  difficulty: string; duration: string; description: string;
  lessonCount: number; order: number;
}

export interface DBLesson {
  id: string; moduleId: string; title: string; type: "video" | "reading";
  duration: string; order: number; content: string;
}

export interface DBQuiz {
  id: string; moduleId: string; title: string; passingScore: number;
  questions: { id: string; question: string; options: string[]; correctAnswer: number }[];
}

export interface DBProgress {
  id: string; userId: string; moduleId: string;
  completedLessons: string[]; quizPassed: boolean; quizScore: number | null;
}

export interface DBAttempt {
  id: string; userId: string; moduleId: string; quizId: string;
  score: number; total: number; percentage: number; passed: boolean;
  date: string; duration: string; answers: number[];
}

export interface DBNotification {
  id: string; userId: string; type: "success" | "trophy" | "info" | "warning";
  message: string; time: string; read: boolean; createdAt: string;
}

export interface DBNote {
  id: string; userId: string; lessonId: string; content: string; updatedAt: string;
}

const today = new Date().toISOString().split("T")[0];
const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

const seedUsers: DBUser[] = [
  { id: "u1", name: "Ahmed Ben Ali", email: "student@demo.tn", password: "demo123", role: "student", avatar: "AB", avatarColor: "#6366f1", joinedAt: "2025-01-15", totalPoints: 1250, streak: 7, lastActiveDate: today, completedModules: ["mod1"] },
  { id: "u2", name: "Sameh Admin", email: "admin@demo.tn", password: "admin123", role: "admin", avatar: "SA", avatarColor: "#f59e0b", joinedAt: "2024-09-01", totalPoints: 9999, streak: 30, lastActiveDate: today, completedModules: ["mod1", "mod2", "mod3", "mod4"] },
  { id: "u3", name: "Riahi Semah", email: "semah@demo.tn", password: "demo123", role: "student", avatar: "RS", avatarColor: "#10b981", joinedAt: "2025-02-10", totalPoints: 680, streak: 3, lastActiveDate: yesterday, completedModules: [] },
  { id: "u4", name: "Yassine Trabelsi", email: "yassine@demo.tn", password: "demo123", role: "student", avatar: "YT", avatarColor: "#0ea5e9", joinedAt: "2025-03-01", totalPoints: 2100, streak: 14, lastActiveDate: today, completedModules: ["mod1", "mod2"] },
  { id: "u5", name: "Fatma Khelifi", email: "fatma@demo.tn", password: "demo123", role: "student", avatar: "FK", avatarColor: "#ec4899", joinedAt: "2025-01-20", totalPoints: 890, streak: 5, lastActiveDate: "2025-06-01", completedModules: ["mod1"] },
  { id: "u6", name: "Omar Mansouri", email: "omar@demo.tn", password: "demo123", role: "student", avatar: "OM", avatarColor: "#8b5cf6", joinedAt: "2025-02-28", totalPoints: 3400, streak: 21, lastActiveDate: today, completedModules: ["mod1", "mod2", "mod3", "mod4"] },
  { id: "u7", name: "Lina Bouaziz", email: "lina@demo.tn", password: "demo123", role: "instructor", avatar: "LB", avatarColor: "#f97316", joinedAt: "2024-11-10", totalPoints: 5600, streak: 45, lastActiveDate: today, completedModules: ["mod1", "mod2", "mod3", "mod4"] },
  { id: "u8", name: "Mehdi Gharbi", email: "mehdi@demo.tn", password: "demo123", role: "student", avatar: "MG", avatarColor: "#14b8a6", joinedAt: "2025-03-15", totalPoints: 320, streak: 2, lastActiveDate: "2025-05-28", completedModules: [] },
  { id: "u9", name: "Sarra Hamdi", email: "sarra@demo.tn", password: "demo123", role: "student", avatar: "SH", avatarColor: "#a855f7", joinedAt: "2025-02-05", totalPoints: 1760, streak: 10, lastActiveDate: today, completedModules: ["mod1", "mod2"] },
  { id: "u10", name: "Karim Bensalem", email: "karim@demo.tn", password: "demo123", role: "admin", avatar: "KB", avatarColor: "#ef4444", joinedAt: "2024-08-01", totalPoints: 9999, streak: 60, lastActiveDate: today, completedModules: ["mod1", "mod2", "mod3", "mod4"] },
];

const seedModules: DBModule[] = [
  { id: "mod1", title: "Introduction DevOps", icon: "GitBranch", color: "#6366f1", difficulty: "Débutant", duration: "2h30", description: "Fondamentaux DevOps, culture agile, principes CI/CD.", lessonCount: 4, order: 1 },
  { id: "mod2", title: "Git & GitHub Actions CI/CD", icon: "Workflow", color: "#f59e0b", difficulty: "Intermédiaire", duration: "3h", description: "Maîtrisez Git avancé et la mise en place de pipelines CI/CD.", lessonCount: 5, order: 2 },
  { id: "mod3", title: "Docker & Conteneurisation", icon: "Container", color: "#0ea5e9", difficulty: "Intermédiaire", duration: "4h", description: "Conteneurisez vos applications avec Docker et Docker Compose.", lessonCount: 6, order: 3 },
  { id: "mod4", title: "MLOps & DVC", icon: "Brain", color: "#10b981", difficulty: "Avancé", duration: "5h", description: "Versioning de données, tracking d'expériences ML avec DVC et MLflow.", lessonCount: 6, order: 4 },
];

const seedLessons: DBLesson[] = [
  // mod1
  { id: "l1", moduleId: "mod1", title: "Qu'est-ce que DevOps ?", type: "video", duration: "20 min", order: 1, content: "DevOps est une philosophie qui rapproche les équipes de développement (Dev) et d'opérations (Ops). L'objectif principal est de raccourcir le cycle de développement tout en assurant une qualité continue. DevOps repose sur l'automatisation, la collaboration et le feedback rapide. Les organisations qui adoptent DevOps constatent une amélioration significative de la fréquence de déploiement, du temps de récupération et du taux de changement réussi. Cette leçon couvre les origines de DevOps, le mouvement Agile qui l'a précédé, et pourquoi les silos entre Dev et Ops posent problème dans le développement logiciel moderne." },
  { id: "l2", moduleId: "mod1", title: "Culture Agile", type: "reading", duration: "25 min", order: 2, content: "La culture Agile est le fondement de DevOps. Elle met l'accent sur la livraison itérative, la réponse au changement et la collaboration client. Les méthodologies Agile comme Scrum et Kanban fournissent des cadres pour organiser le travail en sprints ou en flux continu. Dans un contexte DevOps, Agile signifie que les équipes travaillent en petits lots, déploient fréquemment et recueillent le feedback rapidement. Les cérémonies Agile (daily standups, rétrospectives, reviews) favorisent la transparence et l'amélioration continue. Comprendre Agile est essentiel avant de plonger dans les outils DevOps." },
  { id: "l3", moduleId: "mod1", title: "Les 4 piliers CALMS", type: "video", duration: "30 min", order: 3, content: "Le framework CALMS définit les piliers de DevOps : Culture, Automatisation, Lean, Mesure et Sharing. La Culture encourage la collaboration et la responsabilité partagée. L'Automatisation réduit les erreurs humaines via les pipelines CI/CD, l'infrastructure as code et les tests automatisés. Le Lean élimine le gaspillage en optimisant les flux de travail. La Mesure utilise les métriques (DORA metrics : deployment frequency, lead time, MTTR, change failure rate) pour évaluer la performance. Le Sharing favorise le partage de connaissances entre équipes. Ensemble, ces piliers transforment la façon dont les organisations livrent du logiciel." },
  { id: "l4", moduleId: "mod1", title: "Outils essentiels", type: "reading", duration: "20 min", order: 4, content: "L'écosystème DevOps comprend de nombreux outils. Pour le contrôle de version : Git, GitHub, GitLab. Pour l'intégration continue : Jenkins, GitHub Actions, GitLab CI, CircleCI. Pour la conteneurisation : Docker, Podman. Pour l'orchestration : Kubernetes, Docker Swarm. Pour l'infrastructure as code : Terraform, Ansible, Pulumi. Pour le monitoring : Prometheus, Grafana, Datadog. Pour la gestion de configuration : Chef, Puppet. Cette leçon présente chaque catégorie d'outils, leurs cas d'utilisation et comment ils s'intègrent dans un pipeline DevOps complet. Nous comparerons les solutions open-source et commerciales." },
  // mod2
  { id: "l5", moduleId: "mod2", title: "Git avancé", type: "video", duration: "35 min", order: 1, content: "Au-delà des commandes basiques, Git offre des fonctionnalités puissantes pour les équipes. Le rebase interactif permet de réécrire l'historique pour un historique propre. Le cherry-pick sélectionne des commits spécifiques entre branches. Les submodules et subtrees gèrent les dépendances. Les hooks Git (pre-commit, pre-push) automatisent les vérifications de qualité. Le stash sauvegarde le travail en cours. Les stratégies de branching (Git Flow, GitHub Flow, Trunk-Based Development) organisent le développement parallèle. Les reflog et bisect aident au debugging. Maîtriser ces fonctionnalités est essentiel pour travailler efficacement en équipe." },
  { id: "l6", moduleId: "mod2", title: "GitHub Actions", type: "reading", duration: "30 min", order: 2, content: "GitHub Actions est une plateforme CI/CD intégrée à GitHub. Les workflows sont définis en YAML dans .github/workflows/. Chaque workflow contient des jobs qui s'exécutent sur des runners (Ubuntu, macOS, Windows). Les actions sont des étapes réutilisables, disponibles sur le Marketplace. Les déclencheurs incluent push, pull_request, schedule, workflow_dispatch. Les matrices permettent de tester sur plusieurs versions. Les secrets stockent les informations sensibles. Les artifacts partagent des fichiers entre jobs. Les environments protègent les déploiements en production avec des approbations requises. Cette leçon montre comment créer un workflow complet." },
  { id: "l7", moduleId: "mod2", title: "Pipeline CI tests", type: "video", duration: "35 min", order: 3, content: "Un pipeline CI robuste commence par la détection automatique des changements. À chaque push, le pipeline : checkout le code, installe les dépendances, exécute le linting (ESLint, Prettier), lance les tests unitaires (Jest, Vitest), les tests d'intégration, et calcule la couverture de code. Les rapports sont publiés comme artifacts. Les stratégies de cache accélèrent les builds. Les builds parallèles réduisent le temps d'attente. Les règles de protection de branche empêchent le merge si les tests échouent. Cette leçon met en place un pipeline CI complet pour une application TypeScript avec Node.js." },
  { id: "l8", moduleId: "mod2", title: "Pipeline CD déploiement", type: "video", duration: "30 min", order: 4, content: "Le déploiement continu automatise la mise en production. Les stratégies incluent : blue-green deployment (deux environnements identiques), canary release (déploiement progressif), rolling update (mise à jour progressive). Les outils comme ArgoCD, Flux et Spinnaker orchestrent les déploiements Kubernetes. Les feature flags (LaunchDarkly, Unleash) permettent d'activer/désactiver des fonctionnalités sans redéployer. Le rollback automatique revient en arrière en cas de problème. Les health checks vérifient que l'application fonctionne correctement après déploiement. Cette leçon configure un pipeline CD vers Vercel et AWS." },
  { id: "l9", moduleId: "mod2", title: "Secrets & Environnements", type: "reading", duration: "25 min", order: 5, content: "La gestion des secrets est critique en DevOps. Ne jamais committer de secrets dans le code ! Les solutions incluent : GitHub Secrets (chiffrés par environnement), HashiCorp Vault (gestion centralisée), AWS Secrets Manager, Azure Key Vault. Les variables d'environnement séparent la configuration du code. Les fichiers .env sont ignorés par Git (.gitignore). Les environnements (development, staging, production) ont des configurations différentes. Les outils de scanning (GitGuardian, TruffleHog) détectent les fuites de secrets. SOPS et sealed-secrets chiffrent les secrets dans les repos. Cette leçon enseigne les bonnes pratiques de sécurité." },
  // mod3
  { id: "l10", moduleId: "mod3", title: "Introduction Docker", type: "video", duration: "25 min", order: 1, content: "Docker révolutionne le déploiement en encapsulant les applications dans des conteneurs légers et portables. Contrairement aux machines virtuelles, les conteneurs partagent le noyau de l'OS hôte, ce qui les rend beaucoup plus rapides à démarrer et moins gourmands en ressources. Docker utilise des images immuables construites à partir de Dockerfiles. Le Docker Engine gère le cycle de vie des conteneurs. Docker Hub est le registre public d'images. Cette leçon couvre l'installation de Docker, les commandes essentielles (run, build, pull, push), et la différence entre images et conteneurs. Vous apprendrez à exécuter votre première application conteneurisée." },
  { id: "l11", moduleId: "mod3", title: "Dockerfile best practices", type: "reading", duration: "30 min", order: 2, content: "Un Dockerfile bien écrit produit des images légères, sécurisées et performantes. Les bonnes pratiques incluent : utiliser des images de base légères (Alpine, distroless), optimiser les couches avec l'ordre des instructions, utiliser le multi-stage build pour séparer build et runtime, ne pas exécuter en tant que root (USER instruction), minimiser le nombre de couches, utiliser .dockerignore, éviter d'installer des paquets inutiles, utiliser COPY au lieu de ADD, définir des HEALTHCHECK, et spécifier des versions précises des images de base. Les labels ajoutent des métadonnées. Les arguments de build (ARG) paramétrient les builds." },
  { id: "l12", moduleId: "mod3", title: "Docker Compose", type: "video", duration: "35 min", order: 3, content: "Docker Compose orchestre des applications multi-conteneurs avec un simple fichier YAML. Le docker-compose.yml définit les services, réseaux et volumes. Chaque service peut avoir son propre Dockerfile, des variables d'environnement, des healthchecks et des dépendances (depends_on). Les profiles permettent de démarrer des sous-ensembles de services. Les extensions YAML (x-) factorisent la configuration. Les secrets Docker sécurisent les données sensibles. Les volumes nommés persistent les données entre redémarrages. Cette leçon crée une stack complète : API Node.js + PostgreSQL + Redis + Nginx reverse proxy." },
  { id: "l13", moduleId: "mod3", title: "Réseaux Docker", type: "reading", duration: "25 min", order: 4, content: "Docker fournit plusieurs drivers réseau. Le bridge (défaut) crée un réseau isolé pour les conteneurs. Le host partage le réseau de l'hôte (pas d'isolation). L'overlay connecte des conteneurs sur plusieurs hôtes (Swarm). Le macvlan attribue des adresses MAC/IP aux conteneurs. Le none désactive le réseau. Les conteneurs sur le même réseau bridge personnalisé se découvrent par nom DNS. Les ports sont exposés avec -p (host:container). Les règles iptables contrôlent le trafic. Les network policies ajoutent de la sécurité. Cette leçon illustre la communication inter-conteneurs dans différents scénarios." },
  { id: "l14", moduleId: "mod3", title: "Volumes & Persistance", type: "video", duration: "30 min", order: 5, content: "Par défaut, les données d'un conteneur sont éphémères. Les volumes Docker persistent les données au-delà du cycle de vie du conteneur. Trois types de montage : volumes nommés (gérés par Docker), bind mounts (dossiers de l'hôte), tmpfs mounts (mémoire). Les volumes nommés sont préférés en production pour la portabilité. Les drivers de volume supportent des backends externes (NFS, AWS EBS, GCE). Les backups de volumes utilisent des conteneurs temporaires. Le volume pruning nettoie les volumes orphelins. Cette leçon configure la persistance pour PostgreSQL et les uploads d'une application web." },
  { id: "l15", moduleId: "mod3", title: "Docker en production", type: "reading", duration: "30 min", order: 6, content: "Déployer Docker en production nécessite des considérations supplémentaires. La sécurité : scanner les images (Trivy, Snyk), utiliser des images signées, limiter les capabilities, activer seccomp et AppArmor. La performance : limiter CPU/mémoire (--cpus, --memory), utiliser le cache de build, optimiser les layers. La haute disponibilité : Docker Swarm ou Kubernetes pour l'orchestration. Le monitoring : collecte de logs (Fluentd, Logstash), métriques (cAdvisor, Prometheus). Les registres privés (Harbor, ECR, GCR) pour stocker les images. Le CI/CD avec Docker : build, test et push automatisés." },
  // mod4
  { id: "l16", moduleId: "mod4", title: "Introduction MLOps", type: "video", duration: "30 min", order: 1, content: "MLOps applique les principes DevOps au machine learning. Le ML a des défis uniques : gestion des données, reproductibilité des expériences, drift des modèles, et versioning complexe. Le cycle de vie MLOps comprend : collecte et préparation des données, feature engineering, entraînement, évaluation, déploiement et monitoring. Les niveaux de maturité MLOps vont de 0 (manuel) à 2 (CI/CD/CT complet). Les rôles impliqués : data scientist, ML engineer, data engineer, platform engineer. Cette leçon introduit les concepts fondamentaux et les défis spécifiques au déploiement de modèles ML en production." },
  { id: "l17", moduleId: "mod4", title: "DVC Data Version Control", type: "reading", duration: "35 min", order: 2, content: "DVC (Data Version Control) étend Git pour gérer les fichiers volumineux et les pipelines de données. DVC track les fichiers de données sans les stocker dans Git (utilise des fichiers .dvc). Les remotes DVC supportent S3, GCS, Azure, SSH, et le stockage local. Les pipelines DVC (dvc.yaml) définissent les étapes de traitement avec leurs dépendances, commandes et sorties. dvc repro reproduit le pipeline entier. dvc metrics et dvc plots visualisent les résultats. dvc exp gère les expériences ML avec comparaison et sélection. L'intégration Git permet le versioning complet du code, des données et des modèles ensemble." },
  { id: "l18", moduleId: "mod4", title: "MLflow Tracking", type: "video", duration: "35 min", order: 3, content: "MLflow est une plateforme open-source pour gérer le cycle de vie ML. MLflow Tracking enregistre les paramètres, métriques, artifacts et code de chaque expérience. L'API Python est simple : mlflow.log_param(), mlflow.log_metric(), mlflow.log_artifact(). L'UI web visualise et compare les runs. Le Model Registry versionnne les modèles avec des étapes (Staging, Production, Archived). MLflow Projects standardise le packaging du code ML. MLflow Models définit un format standard de modèle avec des flavors (sklearn, pytorch, tensorflow). Le tracking server peut être hébergé centralement pour la collaboration d'équipe." },
  { id: "l19", moduleId: "mod4", title: "Pipelines ML", type: "reading", duration: "30 min", order: 4, content: "Les pipelines ML automatisent le flux de travail end-to-end. Les composants incluent : ingestion de données (extraction depuis diverses sources), validation des données (Great Expectations, TFDV), preprocessing (nettoyage, normalisation, encoding), feature engineering (création, sélection, store), entraînement (hyperparameter tuning, cross-validation), évaluation (métriques, bias check, fairness), et déploiement. Les orchestrateurs (Airflow, Kubeflow, Prefect, Dagster) gèrent l'exécution. Les feature stores (Feast, Tecton) centralisent les features. Le continuous training (CT) ré-entraîne automatiquement quand les données changent." },
  { id: "l20", moduleId: "mod4", title: "Déploiement FastAPI", type: "video", duration: "35 min", order: 5, content: "FastAPI est un framework Python performant pour déployer des modèles ML en tant qu'API REST. Les avantages : validation automatique avec Pydantic, documentation OpenAPI, support asynchrone, typage statique. Cette leçon crée une API de prédiction complète : chargement du modèle au démarrage, endpoint de prédiction avec validation d'entrée, batch prediction, health check, versioning d'API. La conteneurisation avec Docker, le déploiement sur Kubernetes avec des replicas pour la haute disponibilité, et l'auto-scaling basé sur les métriques (CPU, latence, file d'attente). Les tests d'intégration vérifient les prédictions." },
  { id: "l21", moduleId: "mod4", title: "Monitoring modèles", type: "reading", duration: "30 min", order: 6, content: "Le monitoring en production est crucial pour les modèles ML. Le data drift détecte quand la distribution des données change (KS test, PSI). Le concept drift détecte quand la relation entrée-sortie change. Le model performance monitoring suit les métriques en temps réel (accuracy, latency, throughput). Les outils : Evidently AI, Whylogs, Arize, Seldon. Les alertes automatiques notifient quand les performances se dégradent. Le A/B testing compare les modèles en production. Les shadow deployments testent silencieusement les nouveaux modèles. Le feedback loop intègre les corrections humaines pour l'amélioration continue." },
];

const seedQuizzes: DBQuiz[] = [
  {
    id: "q1", moduleId: "mod1", title: "Quiz DevOps", passingScore: 70,
    questions: [
      { id: "q1_1", question: "Que signifie DevOps ?", options: ["Development + Operations", "Device + Optimization", "Developer + Open Source", "Design + Operations"], correctAnswer: 0 },
      { id: "q1_2", question: "Quel framework définit Culture, Automatisation, Lean, Mesure, Sharing ?", options: ["SCRUM", "CALMS", "SAFe", "ITIL"], correctAnswer: 1 },
      { id: "q1_3", question: "Quelle métrique DORA mesure le temps de récupération après incident ?", options: ["Deployment Frequency", "Lead Time", "MTTR", "Change Failure Rate"], correctAnswer: 2 },
      { id: "q1_4", question: "Quel outil est utilisé pour l'Infrastructure as Code ?", options: ["Jira", "Terraform", "Figma", "Postman"], correctAnswer: 1 },
      { id: "q1_5", question: "CI signifie :", options: ["Continuous Integration", "Code Inspection", "Container Infrastructure", "Cloud Instance"], correctAnswer: 0 },
    ],
  },
  {
    id: "q2", moduleId: "mod2", title: "Quiz Git & CI/CD", passingScore: 75,
    questions: [
      { id: "q2_1", question: "Quelle commande Git réécrit l'historique interactivement ?", options: ["git merge", "git rebase -i", "git cherry-pick", "git stash"], correctAnswer: 1 },
      { id: "q2_2", question: "Où sont définis les workflows GitHub Actions ?", options: [".github/actions/", ".github/workflows/", ".ci/", "workflows/"], correctAnswer: 1 },
      { id: "q2_3", question: "Quelle stratégie de déploiement utilise deux environnements identiques ?", options: ["Canary", "Rolling Update", "Blue-Green", "A/B Testing"], correctAnswer: 2 },
      { id: "q2_4", question: "Quel outil détecte les fuites de secrets dans le code ?", options: ["ESLint", "GitGuardian", "Prettier", "Jest"], correctAnswer: 1 },
      { id: "q2_5", question: "Le Trunk-Based Development favorise :", options: ["Les branches longues", "Les commits directs sur main", "Les feature branches de courte durée", "Le fork"], correctAnswer: 2 },
    ],
  },
  {
    id: "q3", moduleId: "mod3", title: "Quiz Docker", passingScore: 70,
    questions: [
      { id: "q3_1", question: "Quelle est la différence principale entre conteneur et VM ?", options: ["Les conteneurs partagent le noyau OS", "Les conteneurs sont plus lents", "Les VMs sont plus légères", "Aucune différence"], correctAnswer: 0 },
      { id: "q3_2", question: "Quelle instruction Dockerfile définit la commande par défaut ?", options: ["RUN", "COPY", "CMD", "ADD"], correctAnswer: 2 },
      { id: "q3_3", question: "Quel driver réseau Docker connecte des conteneurs sur plusieurs hôtes ?", options: ["bridge", "host", "overlay", "macvlan"], correctAnswer: 2 },
      { id: "q3_4", question: "Le multi-stage build sert à :", options: ["Accélérer le runtime", "Réduire la taille de l'image", "Ajouter du networking", "Gérer les volumes"], correctAnswer: 1 },
      { id: "q3_5", question: "Quel outil scanne les vulnérabilités des images Docker ?", options: ["Docker Compose", "Trivy", "Portainer", "Watchtower"], correctAnswer: 1 },
    ],
  },
  {
    id: "q4", moduleId: "mod4", title: "Quiz MLOps", passingScore: 75,
    questions: [
      { id: "q4_1", question: "Que gère DVC principalement ?", options: ["Les conteneurs", "Le versioning de données", "Les tests unitaires", "Le déploiement cloud"], correctAnswer: 1 },
      { id: "q4_2", question: "MLflow Tracking enregistre :", options: ["Uniquement le code", "Paramètres, métriques et artifacts", "Les conteneurs Docker", "Les tickets Jira"], correctAnswer: 1 },
      { id: "q4_3", question: "Le data drift indique :", options: ["Un bug dans le code", "Un changement de distribution des données", "Un problème réseau", "Un manque de RAM"], correctAnswer: 1 },
      { id: "q4_4", question: "Quel framework Python est recommandé pour déployer des modèles ML comme API ?", options: ["Django", "Flask", "FastAPI", "Tornado"], correctAnswer: 2 },
      { id: "q4_5", question: "Le Feature Store centralise :", options: ["Les images Docker", "Les features ML réutilisables", "Les logs d'application", "Les secrets"], correctAnswer: 1 },
    ],
  },
];

const seedProgress: DBProgress[] = [
  { id: "p1", userId: "u1", moduleId: "mod1", completedLessons: ["l1", "l2", "l3", "l4"], quizPassed: true, quizScore: 80 },
  { id: "p2", userId: "u1", moduleId: "mod2", completedLessons: ["l5", "l6", "l7"], quizPassed: false, quizScore: null },
  { id: "p3", userId: "u3", moduleId: "mod1", completedLessons: ["l1", "l2"], quizPassed: false, quizScore: null },
  { id: "p4", userId: "u4", moduleId: "mod1", completedLessons: ["l1", "l2", "l3", "l4"], quizPassed: true, quizScore: 90 },
  { id: "p5", userId: "u4", moduleId: "mod2", completedLessons: ["l5", "l6", "l7", "l8", "l9"], quizPassed: true, quizScore: 85 },
  { id: "p6", userId: "u4", moduleId: "mod3", completedLessons: ["l10", "l11", "l12", "l13"], quizPassed: false, quizScore: null },
  { id: "p7", userId: "u6", moduleId: "mod1", completedLessons: ["l1", "l2", "l3", "l4"], quizPassed: true, quizScore: 95 },
  { id: "p8", userId: "u6", moduleId: "mod2", completedLessons: ["l5", "l6", "l7", "l8", "l9"], quizPassed: true, quizScore: 88 },
  { id: "p9", userId: "u6", moduleId: "mod3", completedLessons: ["l10", "l11", "l12", "l13", "l14", "l15"], quizPassed: true, quizScore: 82 },
  { id: "p10", userId: "u6", moduleId: "mod4", completedLessons: ["l16", "l17", "l18", "l19", "l20", "l21"], quizPassed: true, quizScore: 78 },
];

const seedAttempts: DBAttempt[] = [
  { id: "a1", userId: "u1", moduleId: "mod1", quizId: "q1", score: 4, total: 5, percentage: 80, passed: true, date: "2025-06-01T10:00:00", duration: "4min", answers: [0, 1, 2, 1, 0] },
  { id: "a2", userId: "u1", moduleId: "mod2", quizId: "q2", score: 3, total: 5, percentage: 60, passed: false, date: "2025-06-03T14:00:00", duration: "6min", answers: [1, 1, 0, 1, 2] },
  { id: "a3", userId: "u4", moduleId: "mod1", quizId: "q1", score: 5, total: 5, percentage: 100, passed: true, date: "2025-06-02T09:00:00", duration: "3min", answers: [0, 1, 2, 1, 0] },
  { id: "a4", userId: "u4", moduleId: "mod2", quizId: "q2", score: 4, total: 5, percentage: 80, passed: true, date: "2025-06-04T11:00:00", duration: "5min", answers: [1, 1, 2, 1, 2] },
  { id: "a5", userId: "u6", moduleId: "mod1", quizId: "q1", score: 5, total: 5, percentage: 100, passed: true, date: "2025-05-15T08:00:00", duration: "2min", answers: [0, 1, 2, 1, 0] },
  { id: "a6", userId: "u6", moduleId: "mod3", quizId: "q3", score: 4, total: 5, percentage: 80, passed: true, date: "2025-05-20T16:30:00", duration: "7min", answers: [0, 2, 2, 1, 1] },
  { id: "a7", userId: "u6", moduleId: "mod4", quizId: "q4", score: 4, total: 5, percentage: 80, passed: true, date: "2025-06-05T14:00:00", duration: "9min", answers: [1, 1, 1, 2, 1] },
  { id: "a8", userId: "u3", moduleId: "mod1", quizId: "q1", score: 3, total: 5, percentage: 60, passed: false, date: "2025-06-06T10:00:00", duration: "5min", answers: [0, 0, 2, 0, 1] },
];

const seedNotifications: DBNotification[] = [
  { id: "n1", userId: "u1", type: "success", message: "Vous avez complété la leçon 'Introduction Docker'", time: "Il y a 2h", read: false, createdAt: new Date(Date.now() - 7200000).toISOString() },
  { id: "n2", userId: "u1", type: "trophy", message: "Badge débloqué : 🔥 En feu (7 jours de streak) !", time: "Il y a 1j", read: false, createdAt: new Date(Date.now() - 86400000).toISOString() },
  { id: "n3", userId: "u1", type: "info", message: "Nouveau module disponible : Kubernetes Avancé", time: "Il y a 2j", read: true, createdAt: new Date(Date.now() - 172800000).toISOString() },
  { id: "n4", userId: "u1", type: "warning", message: "Votre streak est en danger ! Connectez-vous aujourd'hui", time: "Il y a 3j", read: true, createdAt: new Date(Date.now() - 259200000).toISOString() },
  { id: "n5", userId: "u1", type: "success", message: "Quiz DevOps réussi avec 80% !", time: "Il y a 5j", read: true, createdAt: new Date(Date.now() - 432000000).toISOString() },
];

// Singleton
export const db = new Database();
db.seed();
