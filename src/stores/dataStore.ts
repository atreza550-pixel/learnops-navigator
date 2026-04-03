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
  role: "student" | "admin";
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

const initialUsers: UserWithPassword[] = [
  { id: "1", name: "Ahmed Ben Ali", email: "student@learnops.tn", password: "password123", role: "student", avatar: "AB", joinedAt: "2025-01-15", totalPoints: 1250, streak: 7, completedModules: ["mod1", "mod2"] },
  { id: "2", name: "Sameh Admin", email: "admin@learnops.tn", password: "admin123", role: "admin", avatar: "SA", joinedAt: "2024-09-01", totalPoints: 9999, streak: 30, completedModules: ["mod1", "mod2", "mod3", "mod4"] },
  { id: "3", name: "Riahi Semah", email: "semah@learnops.tn", password: "semah123", role: "student", avatar: "RS", joinedAt: "2025-02-10", totalPoints: 680, streak: 3, completedModules: ["mod1"] },
];

const initialModules: ModuleData[] = [
  {
    id: "mod1", title: "Introduction à DevOps", description: "CI/CD, Culture DevOps, Outils essentiels",
    difficulty: "débutant", duration: "2h 30min", color: "#6366f1", icon: "🚀",
    lessons: [
      { id: "l1", title: "Qu'est-ce que DevOps ?", type: "video", duration: "15 min", content: "Introduction aux principes DevOps..." },
      { id: "l2", title: "Culture et principes", type: "reading", duration: "20 min", content: "Les piliers de la culture DevOps..." },
      { id: "l3", title: "CI/CD Pipeline", type: "video", duration: "25 min", content: "Mise en place d'un pipeline CI/CD..." },
      { id: "l4", title: "Outils essentiels", type: "reading", duration: "20 min", content: "Git, Jenkins, GitHub Actions..." },
      { id: "l5", title: "Mise en pratique", type: "video", duration: "30 min", content: "TP: Créer votre premier pipeline..." },
    ],
  },
  {
    id: "mod2", title: "Conteneurs & Docker", description: "Dockerfile, Docker Compose, Registry",
    difficulty: "intermédiaire", duration: "3h", color: "#22d3ee", icon: "🐳",
    lessons: [
      { id: "l1", title: "Introduction à Docker", type: "video", duration: "15 min", content: "Concepts de conteneurisation..." },
      { id: "l2", title: "Dockerfile", type: "reading", duration: "20 min", content: "Écrire un Dockerfile efficace..." },
      { id: "l3", title: "Docker Compose", type: "video", duration: "25 min", content: "Orchestration multi-conteneurs..." },
      { id: "l4", title: "Docker Registry", type: "reading", duration: "15 min", content: "Publier et gérer vos images..." },
      { id: "l5", title: "Réseaux Docker", type: "video", duration: "20 min", content: "Networking dans Docker..." },
      { id: "l6", title: "TP Docker", type: "video", duration: "30 min", content: "Déployer une app multi-services..." },
    ],
  },
  {
    id: "mod3", title: "Kubernetes", description: "Pods, Services, Deployments, Helm",
    difficulty: "avancé", duration: "4h", color: "#a855f7", icon: "☸️",
    lessons: [
      { id: "l1", title: "Architecture K8s", type: "video", duration: "20 min", content: "Composants du cluster..." },
      { id: "l2", title: "Pods et ReplicaSets", type: "reading", duration: "25 min", content: "Gestion des pods..." },
      { id: "l3", title: "Services et Ingress", type: "video", duration: "20 min", content: "Exposer vos applications..." },
      { id: "l4", title: "Deployments", type: "reading", duration: "20 min", content: "Stratégies de déploiement..." },
      { id: "l5", title: "ConfigMaps & Secrets", type: "video", duration: "15 min", content: "Configuration et secrets..." },
      { id: "l6", title: "Helm Charts", type: "reading", duration: "25 min", content: "Templating Kubernetes..." },
      { id: "l7", title: "Monitoring", type: "video", duration: "20 min", content: "Prometheus et Grafana..." },
      { id: "l8", title: "TP Kubernetes", type: "video", duration: "35 min", content: "Déployer une app complète..." },
    ],
  },
  {
    id: "mod4", title: "MLOps Fondamentaux", description: "ML Pipeline, MLflow, Model Registry",
    difficulty: "avancé", duration: "3h 30min", color: "#f59e0b", icon: "🤖",
    lessons: [
      { id: "l1", title: "Qu'est-ce que MLOps ?", type: "video", duration: "15 min", content: "DevOps pour le ML..." },
      { id: "l2", title: "ML Pipeline", type: "reading", duration: "25 min", content: "Construire un pipeline ML..." },
      { id: "l3", title: "MLflow", type: "video", duration: "20 min", content: "Tracking des expériences..." },
      { id: "l4", title: "Model Registry", type: "reading", duration: "20 min", content: "Versioning des modèles..." },
      { id: "l5", title: "Feature Store", type: "video", duration: "20 min", content: "Gestion des features..." },
      { id: "l6", title: "Model Serving", type: "reading", duration: "20 min", content: "Déploiement de modèles..." },
      { id: "l7", title: "TP MLOps", type: "video", duration: "30 min", content: "Pipeline ML end-to-end..." },
    ],
  },
];

const initialActivities: ActivityEvent[] = [
  { id: "a1", type: "register", userId: "3", userName: "Riahi Semah", detail: "s'est inscrit", timestamp: "2025-04-03T09:15:00" },
  { id: "a2", type: "lesson_complete", userId: "1", userName: "Ahmed Ben Ali", detail: "a terminé 'CI/CD Pipeline'", timestamp: "2025-04-03T08:45:00" },
  { id: "a3", type: "quiz_pass", userId: "1", userName: "Ahmed Ben Ali", detail: "a réussi le Quiz Docker (85%)", timestamp: "2025-04-02T16:30:00" },
  { id: "a4", type: "lesson_complete", userId: "3", userName: "Riahi Semah", detail: "a terminé 'Qu'est-ce que DevOps ?'", timestamp: "2025-04-02T14:20:00" },
  { id: "a5", type: "quiz_fail", userId: "3", userName: "Riahi Semah", detail: "a échoué le Quiz Kubernetes (40%)", timestamp: "2025-04-02T11:00:00" },
  { id: "a6", type: "lesson_complete", userId: "2", userName: "Sameh Admin", detail: "a terminé 'Helm Charts'", timestamp: "2025-04-01T17:45:00" },
  { id: "a7", type: "register", userId: "1", userName: "Ahmed Ben Ali", detail: "s'est inscrit", timestamp: "2025-01-15T10:00:00" },
  { id: "a8", type: "quiz_pass", userId: "2", userName: "Sameh Admin", detail: "a réussi le Quiz MLOps (92%)", timestamp: "2025-04-01T15:00:00" },
  { id: "a9", type: "lesson_complete", userId: "1", userName: "Ahmed Ben Ali", detail: "a terminé 'Docker Compose'", timestamp: "2025-04-01T10:30:00" },
  { id: "a10", type: "quiz_pass", userId: "1", userName: "Ahmed Ben Ali", detail: "a réussi le Quiz DevOps (78%)", timestamp: "2025-03-31T14:00:00" },
];

interface DataStore {
  users: UserWithPassword[];
  modules: ModuleData[];
  activities: ActivityEvent[];
  addUser: (user: Omit<UserWithPassword, "id" | "avatar" | "joinedAt" | "totalPoints" | "streak" | "completedModules"> & { role: "student" | "admin" }) => void;
  updateUser: (id: string, updates: Partial<UserWithPassword>) => void;
  deleteUser: (id: string) => void;
  addModule: (mod: Omit<ModuleData, "id" | "lessons">) => void;
  updateModule: (id: string, updates: Partial<ModuleData>) => void;
  deleteModule: (id: string) => void;
  addLesson: (moduleId: string, lesson: Omit<LessonData, "id">) => void;
  updateLesson: (moduleId: string, lessonId: string, updates: Partial<LessonData>) => void;
  deleteLesson: (moduleId: string, lessonId: string) => void;
  reorderLessons: (moduleId: string, fromIndex: number, toIndex: number) => void;
}

export const useDataStore = create<DataStore>((set) => ({
  users: initialUsers,
  modules: initialModules,
  activities: initialActivities,

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
}));
