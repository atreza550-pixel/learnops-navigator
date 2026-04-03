export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface QuizData {
  moduleId: string;
  title: string;
  questions: QuizQuestion[];
}

export interface QuizAttempt {
  moduleId: string;
  moduleName: string;
  score: number;
  total: number;
  percentage: number;
  passed: boolean;
  date: string;
  answers: number[];
}

export const QUIZZES: QuizData[] = [
  {
    moduleId: "mod1",
    title: "Quiz DevOps",
    questions: [
      { id: "q1", question: "Que signifie CI/CD ?", options: ["Continuous Integration / Continuous Deployment", "Code Integration / Code Delivery", "Central Intelligence / Core Data", "Compiled Instructions / Cached Data"], correctAnswer: 0 },
      { id: "q2", question: "Quel est le principal objectif de DevOps ?", options: ["Remplacer les développeurs", "Réduire les coûts uniquement", "Unifier le développement et les opérations", "Automatiser les tests seulement"], correctAnswer: 2 },
      { id: "q3", question: "Lequel n'est PAS un outil DevOps ?", options: ["Jenkins", "Photoshop", "Ansible", "Terraform"], correctAnswer: 1 },
      { id: "q4", question: "Que signifie IaC ?", options: ["Internet as Code", "Infrastructure as Code", "Integration and Compliance", "Internal Access Control"], correctAnswer: 1 },
      { id: "q5", question: "Quel est le rôle d'un pipeline CI/CD ?", options: ["Gérer les bases de données", "Automatiser le build, test et déploiement", "Créer des interfaces utilisateur", "Surveiller les serveurs"], correctAnswer: 1 },
    ],
  },
  {
    moduleId: "mod2",
    title: "Quiz Docker",
    questions: [
      { id: "q1", question: "Qu'est-ce qu'un conteneur Docker ?", options: ["Un serveur virtuel complet", "Une instance isolée d'une application avec ses dépendances", "Un type de base de données", "Un langage de programmation"], correctAnswer: 1 },
      { id: "q2", question: "Quel fichier définit une image Docker ?", options: ["docker-compose.yml", "package.json", "Dockerfile", "Makefile"], correctAnswer: 2 },
      { id: "q3", question: "Quelle commande lance un conteneur ?", options: ["docker build", "docker run", "docker push", "docker init"], correctAnswer: 1 },
      { id: "q4", question: "Docker Compose sert à quoi ?", options: ["Compiler du code", "Orchestrer plusieurs conteneurs", "Créer des images", "Monitorer les logs"], correctAnswer: 1 },
      { id: "q5", question: "Quelle est la différence entre image et conteneur ?", options: ["Aucune différence", "L'image est le template, le conteneur est l'instance en cours d'exécution", "Le conteneur est plus petit", "L'image tourne en production"], correctAnswer: 1 },
    ],
  },
  {
    moduleId: "mod3",
    title: "Quiz Kubernetes",
    questions: [
      { id: "q1", question: "Qu'est-ce qu'un Pod dans Kubernetes ?", options: ["Un serveur physique", "La plus petite unité déployable", "Un réseau virtuel", "Un fichier de configuration"], correctAnswer: 1 },
      { id: "q2", question: "Quel composant gère l'état souhaité du cluster ?", options: ["kubelet", "etcd", "kube-controller-manager", "kube-proxy"], correctAnswer: 2 },
      { id: "q3", question: "À quoi sert un Service K8s ?", options: ["Stocker des données", "Exposer une application réseau", "Compiler le code", "Gérer les secrets"], correctAnswer: 1 },
      { id: "q4", question: "Qu'est-ce que Helm ?", options: ["Un langage de programmation", "Un gestionnaire de packages pour K8s", "Un outil de monitoring", "Un service cloud"], correctAnswer: 1 },
      { id: "q5", question: "Quelle ressource gère les mises à jour progressives ?", options: ["Pod", "Service", "Deployment", "ConfigMap"], correctAnswer: 2 },
    ],
  },
  {
    moduleId: "mod4",
    title: "Quiz MLOps",
    questions: [
      { id: "q1", question: "Que signifie MLOps ?", options: ["Machine Learning Operations", "Multi-Layer Operations", "Model Loading Optimization", "Managed Linux Operations"], correctAnswer: 0 },
      { id: "q2", question: "Quel outil est utilisé pour le tracking d'expériences ML ?", options: ["Docker", "MLflow", "Jenkins", "Grafana"], correctAnswer: 1 },
      { id: "q3", question: "Qu'est-ce qu'un Feature Store ?", options: ["Un magasin en ligne", "Un système centralisé pour gérer les features ML", "Un type de base de données NoSQL", "Un framework de tests"], correctAnswer: 1 },
      { id: "q4", question: "Le Model Registry sert à quoi ?", options: ["Enregistrer les utilisateurs", "Versionner et gérer les modèles ML", "Créer des conteneurs", "Surveiller les performances"], correctAnswer: 1 },
      { id: "q5", question: "Quelle étape vient après l'entraînement d'un modèle ?", options: ["Collecte de données", "Feature engineering", "Model serving / déploiement", "Nettoyage des données"], correctAnswer: 2 },
    ],
  },
];

export function getQuizByModuleId(moduleId: string): QuizData | undefined {
  return QUIZZES.find((q) => q.moduleId === moduleId);
}

export function getQuizAttempts(): QuizAttempt[] {
  const saved = localStorage.getItem("learnops_quiz_attempts");
  return saved ? JSON.parse(saved) : [];
}

export function saveQuizAttempt(attempt: QuizAttempt): void {
  const attempts = getQuizAttempts();
  attempts.unshift(attempt);
  localStorage.setItem("learnops_quiz_attempts", JSON.stringify(attempts));
}

export function getModuleQuizBestScore(moduleId: string): QuizAttempt | null {
  const attempts = getQuizAttempts().filter((a) => a.moduleId === moduleId);
  if (attempts.length === 0) return null;
  return attempts.reduce((best, a) => (a.percentage > best.percentage ? a : best), attempts[0]);
}
