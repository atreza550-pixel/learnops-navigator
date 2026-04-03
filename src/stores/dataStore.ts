import { create } from "zustand";

export interface ModuleData {
  id: string;
  title: string;
  description: string;
  difficulty: "débutant" | "intermédiaire" | "avancé";
  duration: string;
  color: string;
  icon: string;
  lessons: LessonData[];
}

export interface LessonData {
  id: string;
  title: string;
  type: "video" | "reading";
  duration: string;
  content: string;
}

export interface UserWithPassword {
  id: string;
  name: string;
  email: string;
  password: string;
  role: "student" | "admin" | "instructor";
  avatar: string;
  joinedAt: string;
  totalPoints: number;
  streak: number;
  completedModules: string[];
}

export interface ActivityEvent {
  id: string;
  type: "register" | "quiz_pass" | "quiz_fail" | "lesson_complete";
  userId: string;
  userName: string;
  detail: string;
  timestamp: string;
}

export interface Notification {
  id: string;
  type: "success" | "trophy" | "info" | "warning";
  message: string;
  time: string;
  read: boolean;
}

const initialUsers: UserWithPassword[] = [
  { id: "1", name: "Ahmed Ben Ali", email: "student@learnops.tn", password: "password123", role: "student", avatar: "AB", joinedAt: "2025-01-15", totalPoints: 1250, streak: 7, completedModules: ["mod1", "mod2"] },
  { id: "2", name: "Sameh Admin", email: "admin@learnops.tn", password: "admin123", role: "admin", avatar: "SA", joinedAt: "2024-09-01", totalPoints: 9999, streak: 30, completedModules: ["mod1", "mod2", "mod3", "mod4"] },
  { id: "3", name: "Riahi Semah", email: "semah@learnops.tn", password: "semah123", role: "student", avatar: "RS", joinedAt: "2025-02-10", totalPoints: 680, streak: 3, completedModules: ["mod1"] },
  { id: "4", name: "Yassine Trabelsi", email: "yassine@learnops.tn", password: "pass123", role: "student", avatar: "YT", joinedAt: "2025-03-01", totalPoints: 2100, streak: 14, completedModules: ["mod1", "mod2", "mod3"] },
  { id: "5", name: "Fatma Khelifi", email: "fatma@learnops.tn", password: "pass123", role: "student", avatar: "FK", joinedAt: "2025-01-20", totalPoints: 890, streak: 5, completedModules: ["mod1"] },
  { id: "6", name: "Omar Mansouri", email: "omar@learnops.tn", password: "pass123", role: "student", avatar: "OM", joinedAt: "2025-02-28", totalPoints: 3400, streak: 21, completedModules: ["mod1", "mod2", "mod3", "mod4"] },
  { id: "7", name: "Lina Bouaziz", email: "lina@learnops.tn", password: "pass123", role: "instructor", avatar: "LB", joinedAt: "2024-11-10", totalPoints: 5600, streak: 45, completedModules: ["mod1", "mod2", "mod3", "mod4"] },
  { id: "8", name: "Mehdi Gharbi", email: "mehdi@learnops.tn", password: "pass123", role: "student", avatar: "MG", joinedAt: "2025-03-15", totalPoints: 320, streak: 2, completedModules: [] },
  { id: "9", name: "Sarra Hamdi", email: "sarra@learnops.tn", password: "pass123", role: "student", avatar: "SH", joinedAt: "2025-02-05", totalPoints: 1760, streak: 10, completedModules: ["mod1", "mod2"] },
  { id: "10", name: "Karim Bensalem", email: "karim@learnops.tn", password: "pass123", role: "admin", avatar: "KB", joinedAt: "2024-08-01", totalPoints: 9999, streak: 60, completedModules: ["mod1", "mod2", "mod3", "mod4"] },
];

const initialModules: ModuleData[] = [
  {
    id: "mod1", title: "Introduction à DevOps", description: "CI/CD, Culture DevOps, Outils essentiels",
    difficulty: "débutant", duration: "2h 30min", color: "#6366f1", icon: "🚀",
    lessons: [
      { id: "l1", title: "Qu'est-ce que DevOps ?", type: "video", duration: "15 min", content: "Introduction aux principes DevOps et leur importance dans le développement logiciel moderne. DevOps est une approche qui combine le développement (Dev) et les opérations (Ops) pour améliorer la collaboration et la productivité." },
      { id: "l2", title: "Culture et principes", type: "reading", duration: "20 min", content: "Les piliers de la culture DevOps : collaboration, automatisation, mesure, partage (CAMS). Comment transformer la culture d'une organisation." },
      { id: "l3", title: "CI/CD Pipeline", type: "video", duration: "25 min", content: "Mise en place d'un pipeline CI/CD avec GitHub Actions. Les étapes : build, test, deploy. Les bonnes pratiques." },
      { id: "l4", title: "Outils essentiels", type: "reading", duration: "20 min", content: "Git, Jenkins, GitHub Actions, GitLab CI, CircleCI. Comparaison et cas d'utilisation." },
      { id: "l5", title: "Mise en pratique", type: "video", duration: "30 min", content: "TP: Créer votre premier pipeline CI/CD avec GitHub Actions pour une application Node.js." },
    ],
  },
  {
    id: "mod2", title: "Conteneurs & Docker", description: "Dockerfile, Docker Compose, Registry",
    difficulty: "intermédiaire", duration: "3h", color: "#22d3ee", icon: "🐳",
    lessons: [
      { id: "l1", title: "Introduction à Docker", type: "video", duration: "15 min", content: "Concepts de conteneurisation, différence avec les machines virtuelles, architecture Docker." },
      { id: "l2", title: "Dockerfile", type: "reading", duration: "20 min", content: "Écrire un Dockerfile efficace : FROM, RUN, COPY, CMD, ENTRYPOINT. Multi-stage builds." },
      { id: "l3", title: "Docker Compose", type: "video", duration: "25 min", content: "Orchestration multi-conteneurs avec docker-compose.yml. Services, volumes, networks." },
      { id: "l4", title: "Docker Registry", type: "reading", duration: "15 min", content: "Publier et gérer vos images sur Docker Hub et registries privés." },
      { id: "l5", title: "Réseaux Docker", type: "video", duration: "20 min", content: "Networking dans Docker : bridge, host, overlay. Communication inter-conteneurs." },
      { id: "l6", title: "TP Docker", type: "video", duration: "30 min", content: "Déployer une application multi-services avec Docker Compose : API + Base de données + Frontend." },
    ],
  },
  {
    id: "mod3", title: "Kubernetes", description: "Pods, Services, Deployments, Helm",
    difficulty: "avancé", duration: "4h", color: "#a855f7", icon: "☸️",
    lessons: [
      { id: "l1", title: "Architecture K8s", type: "video", duration: "20 min", content: "Composants du cluster : Master, Worker, etcd, API Server, Scheduler, Controller Manager." },
      { id: "l2", title: "Pods et ReplicaSets", type: "reading", duration: "25 min", content: "Gestion des pods, ReplicaSets pour la haute disponibilité." },
      { id: "l3", title: "Services et Ingress", type: "video", duration: "20 min", content: "Exposer vos applications : ClusterIP, NodePort, LoadBalancer, Ingress Controller." },
      { id: "l4", title: "Deployments", type: "reading", duration: "20 min", content: "Stratégies de déploiement : Rolling Update, Blue-Green, Canary." },
      { id: "l5", title: "ConfigMaps & Secrets", type: "video", duration: "15 min", content: "Configuration et secrets dans Kubernetes. Bonnes pratiques de sécurité." },
      { id: "l6", title: "Helm Charts", type: "reading", duration: "25 min", content: "Templating Kubernetes avec Helm. Créer et publier vos propres charts." },
      { id: "l7", title: "Monitoring", type: "video", duration: "20 min", content: "Prometheus et Grafana pour le monitoring de votre cluster." },
      { id: "l8", title: "TP Kubernetes", type: "video", duration: "35 min", content: "Déployer une application complète sur Kubernetes avec Helm." },
    ],
  },
  {
    id: "mod4", title: "MLOps Fondamentaux", description: "ML Pipeline, MLflow, Model Registry",
    difficulty: "avancé", duration: "3h 30min", color: "#f59e0b", icon: "🤖",
    lessons: [
      { id: "l1", title: "Qu'est-ce que MLOps ?", type: "video", duration: "15 min", content: "DevOps pour le ML : principes, challenges, et maturité MLOps." },
      { id: "l2", title: "ML Pipeline", type: "reading", duration: "25 min", content: "Construire un pipeline ML reproductible : data ingestion, preprocessing, training, evaluation." },
      { id: "l3", title: "MLflow", type: "video", duration: "20 min", content: "Tracking des expériences avec MLflow : logging, comparison, model registry." },
      { id: "l4", title: "Model Registry", type: "reading", duration: "20 min", content: "Versioning des modèles, staging, production. Gouvernance du cycle de vie." },
      { id: "l5", title: "Feature Store", type: "video", duration: "20 min", content: "Gestion des features : online/offline stores, feature engineering at scale." },
      { id: "l6", title: "Model Serving", type: "reading", duration: "20 min", content: "Déploiement de modèles : REST API, batch inference, edge deployment." },
      { id: "l7", title: "TP MLOps", type: "video", duration: "30 min", content: "Pipeline ML end-to-end : de la donnée au modèle en production." },
    ],
  },
];

const initialActivities: ActivityEvent[] = [
  { id: "a1", type: "register", userId: "8", userName: "Mehdi Gharbi", detail: "s'est inscrit", timestamp: "2025-04-03T09:15:00" },
  { id: "a2", type: "lesson_complete", userId: "1", userName: "Ahmed Ben Ali", detail: "a terminé 'CI/CD Pipeline'", timestamp: "2025-04-03T08:45:00" },
  { id: "a3", type: "quiz_pass", userId: "4", userName: "Yassine Trabelsi", detail: "a réussi le Quiz Kubernetes (88%)", timestamp: "2025-04-02T16:30:00" },
  { id: "a4", type: "lesson_complete", userId: "9", userName: "Sarra Hamdi", detail: "a terminé 'Docker Compose'", timestamp: "2025-04-02T14:20:00" },
  { id: "a5", type: "quiz_fail", userId: "5", userName: "Fatma Khelifi", detail: "a échoué le Quiz Docker (55%)", timestamp: "2025-04-02T11:00:00" },
  { id: "a6", type: "lesson_complete", userId: "6", userName: "Omar Mansouri", detail: "a terminé 'TP MLOps'", timestamp: "2025-04-01T17:45:00" },
  { id: "a7", type: "quiz_pass", userId: "6", userName: "Omar Mansouri", detail: "a réussi le Quiz MLOps (78%)", timestamp: "2025-04-01T15:00:00" },
  { id: "a8", type: "register", userId: "9", userName: "Sarra Hamdi", detail: "s'est inscrit", timestamp: "2025-04-01T10:30:00" },
  { id: "a9", type: "lesson_complete", userId: "4", userName: "Yassine Trabelsi", detail: "a terminé 'Helm Charts'", timestamp: "2025-03-31T14:00:00" },
  { id: "a10", type: "quiz_pass", userId: "1", userName: "Ahmed Ben Ali", detail: "a réussi le Quiz DevOps (80%)", timestamp: "2025-03-31T11:00:00" },
];

const initialNotifications: Notification[] = [
  { id: "n1", type: "success", message: "Vous avez complété la leçon 'Introduction Docker'", time: "Il y a 2h", read: false },
  { id: "n2", type: "trophy", message: "Badge débloqué : 🔥 En feu (7 jours de streak) !", time: "Il y a 1j", read: false },
  { id: "n3", type: "info", message: "Nouveau module disponible : Kubernetes Avancé", time: "Il y a 2j", read: true },
  { id: "n4", type: "warning", message: "Votre streak est en danger ! Connectez-vous aujourd'hui", time: "Il y a 3j", read: true },
  { id: "n5", type: "success", message: "Quiz DevOps réussi avec 80% !", time: "Il y a 5j", read: true },
];

export const weeklyAnalytics = [
  { week: "Semaine 1", newUsers: 3, lessonsCompleted: 18, quizzesPassed: 5, avgScore: 74 },
  { week: "Semaine 2", newUsers: 2, lessonsCompleted: 24, quizzesPassed: 8, avgScore: 79 },
  { week: "Semaine 3", newUsers: 4, lessonsCompleted: 31, quizzesPassed: 11, avgScore: 76 },
  { week: "Semaine 4", newUsers: 1, lessonsCompleted: 15, quizzesPassed: 6, avgScore: 82 },
];

// Seed quiz attempts in localStorage if empty
function seedQuizAttempts() {
  const key = "learnops_quiz_attempts";
  if (!localStorage.getItem(key)) {
    const seed = [
      { moduleId: "mod1", moduleName: "Introduction à DevOps", score: 4, total: 5, percentage: 80, passed: true, date: "2025-06-01T10:00:00", answers: [0, 2, 1, 1, 1] },
      { moduleId: "mod2", moduleName: "Conteneurs & Docker", score: 3, total: 5, percentage: 65, passed: false, date: "2025-06-03T14:00:00", answers: [1, 2, 0, 1, 1] },
      { moduleId: "mod2", moduleName: "Conteneurs & Docker", score: 4, total: 5, percentage: 83, passed: true, date: "2025-06-04T09:00:00", answers: [1, 2, 1, 1, 1] },
    ];
    localStorage.setItem(key, JSON.stringify(seed));
  }
}
seedQuizAttempts();

interface DataStore {
  users: UserWithPassword[];
  modules: ModuleData[];
  activities: ActivityEvent[];
  notifications: Notification[];
  addUser: (user: Omit<UserWithPassword, "id" | "avatar" | "joinedAt" | "totalPoints" | "streak" | "completedModules"> & { role: "student" | "admin" | "instructor" }) => void;
  updateUser: (id: string, updates: Partial<UserWithPassword>) => void;
  deleteUser: (id: string) => void;
  addModule: (mod: Omit<ModuleData, "id" | "lessons">) => void;
  updateModule: (id: string, updates: Partial<ModuleData>) => void;
  deleteModule: (id: string) => void;
  addLesson: (moduleId: string, lesson: Omit<LessonData, "id">) => void;
  updateLesson: (moduleId: string, lessonId: string, updates: Partial<LessonData>) => void;
  deleteLesson: (moduleId: string, lessonId: string) => void;
  reorderLessons: (moduleId: string, fromIndex: number, toIndex: number) => void;
  addNotification: (notif: Omit<Notification, "id">) => void;
  markAllNotificationsRead: () => void;
  markNotificationRead: (id: string) => void;
}

export const useDataStore = create<DataStore>((set) => ({
  users: initialUsers,
  modules: initialModules,
  activities: initialActivities,
  notifications: initialNotifications,

  addUser: (userData) => set((state) => {
    const newUser: UserWithPassword = {
      ...userData,
      id: String(Date.now()),
      avatar: userData.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2),
      joinedAt: new Date().toISOString().split("T")[0],
      totalPoints: 0,
      streak: 0,
      completedModules: [],
    };
    return { users: [...state.users, newUser] };
  }),

  updateUser: (id, updates) => set((state) => ({
    users: state.users.map((u) => (u.id === id ? { ...u, ...updates } : u)),
  })),

  deleteUser: (id) => set((state) => ({
    users: state.users.filter((u) => u.id !== id),
  })),

  addModule: (modData) => set((state) => ({
    modules: [...state.modules, { ...modData, id: `mod${Date.now()}`, lessons: [] }],
  })),

  updateModule: (id, updates) => set((state) => ({
    modules: state.modules.map((m) => (m.id === id ? { ...m, ...updates } : m)),
  })),

  deleteModule: (id) => set((state) => ({
    modules: state.modules.filter((m) => m.id !== id),
  })),

  addLesson: (moduleId, lessonData) => set((state) => ({
    modules: state.modules.map((m) =>
      m.id === moduleId
        ? { ...m, lessons: [...m.lessons, { ...lessonData, id: `l${Date.now()}` }] }
        : m
    ),
  })),

  updateLesson: (moduleId, lessonId, updates) => set((state) => ({
    modules: state.modules.map((m) =>
      m.id === moduleId
        ? { ...m, lessons: m.lessons.map((l) => (l.id === lessonId ? { ...l, ...updates } : l)) }
        : m
    ),
  })),

  deleteLesson: (moduleId, lessonId) => set((state) => ({
    modules: state.modules.map((m) =>
      m.id === moduleId
        ? { ...m, lessons: m.lessons.filter((l) => l.id !== lessonId) }
        : m
    ),
  })),

  reorderLessons: (moduleId, fromIndex, toIndex) => set((state) => ({
    modules: state.modules.map((m) => {
      if (m.id !== moduleId) return m;
      const lessons = [...m.lessons];
      const [moved] = lessons.splice(fromIndex, 1);
      lessons.splice(toIndex, 0, moved);
      return { ...m, lessons };
    }),
  })),

  addNotification: (notif) => set((state) => ({
    notifications: [{ ...notif, id: `n${Date.now()}` }, ...state.notifications],
  })),

  markAllNotificationsRead: () => set((state) => ({
    notifications: state.notifications.map((n) => ({ ...n, read: true })),
  })),

  markNotificationRead: (id) => set((state) => ({
    notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
  })),
}));
