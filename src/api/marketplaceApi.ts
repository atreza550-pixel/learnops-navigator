import { db, DBMarketplaceCourse, DBPurchase, DBReview, DBWallet, DBCoupon, DBUser } from "@/db/database";
import { fakeDelay, getCurrentUserId, ApiError } from "./helpers";

export async function getCourses(filters?: {
  category?: string; level?: string; priceMin?: number; priceMax?: number;
  search?: string; sort?: string;
}) {
  await fakeDelay();
  let courses = db.get<DBMarketplaceCourse>("marketplace").filter(c => c.status === "published");
  if (filters?.category && filters.category !== "Tous") courses = courses.filter(c => c.category === filters.category);
  if (filters?.level && filters.level !== "Tous") courses = courses.filter(c => c.level === filters.level);
  if (filters?.priceMin != null) courses = courses.filter(c => c.price >= filters.priceMin!);
  if (filters?.priceMax != null) courses = courses.filter(c => c.price <= filters.priceMax!);
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    courses = courses.filter(c => c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q) || c.tags.some(t => t.includes(q)));
  }
  if (filters?.sort === "price_asc") courses.sort((a, b) => a.price - b.price);
  else if (filters?.sort === "price_desc") courses.sort((a, b) => b.price - a.price);
  else if (filters?.sort === "rating") courses.sort((a, b) => b.rating - a.rating);
  else if (filters?.sort === "newest") courses.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  else courses.sort((a, b) => b.studentsCount - a.studentsCount); // popular default
  return courses;
}

export async function getAllCoursesAdmin() {
  await fakeDelay();
  return db.get<DBMarketplaceCourse>("marketplace");
}

export async function getCourseById(id: string) {
  await fakeDelay();
  const course = db.findById<DBMarketplaceCourse>("marketplace", id);
  if (!course) throw new ApiError(404, "Cours introuvable");
  const instructor = db.findById<DBUser>("users", course.instructorId);
  const reviews = db.findWhere<DBReview>("reviews", r => r.courseId === id);
  const userId = getCurrentUserId();
  const isPurchased = userId ? db.findWhere<DBPurchase>("purchases", p => p.userId === userId && p.courseId === id && p.status === "completed").length > 0 : false;
  return { ...course, instructor: instructor ? { id: instructor.id, name: instructor.name, avatar: instructor.avatar, avatarColor: instructor.avatarColor } : null, reviews, isPurchased };
}

export async function purchase(courseId: string, paymentMethod: string, couponCode?: string) {
  await fakeDelay(1500, 2000);
  const userId = getCurrentUserId();
  if (!userId) throw new ApiError(401, "Non authentifié");
  const course = db.findById<DBMarketplaceCourse>("marketplace", courseId);
  if (!course) throw new ApiError(404, "Cours introuvable");
  const existing = db.findWhere<DBPurchase>("purchases", p => p.userId === userId && p.courseId === courseId && p.status === "completed");
  if (existing.length > 0) throw new ApiError(400, "Vous avez déjà acheté ce cours");

  let finalPrice = course.price;
  if (couponCode) {
    const coupons = db.get<DBCoupon>("coupons");
    const coupon = coupons.find(c => c.code === couponCode && c.active && c.usedCount < c.maxUses);
    if (!coupon || new Date(coupon.expiresAt) < new Date()) throw new ApiError(400, "Coupon invalide ou expiré");
    finalPrice = coupon.type === "percent" ? course.price * (1 - coupon.discount / 100) : Math.max(0, course.price - coupon.discount);
    finalPrice = Math.round(finalPrice * 100) / 100;
    db.set("coupons", coupons.map(c => c.code === couponCode ? { ...c, usedCount: c.usedCount + 1 } : c));
  }

  if (paymentMethod === "wallet") {
    const wallets = db.get<DBWallet>("wallet");
    let wallet = wallets.find(w => w.userId === userId);
    if (!wallet) { wallet = { userId, balance: 0, currency: "TND", transactions: [] }; wallets.push(wallet); }
    if (wallet.balance < finalPrice) throw new ApiError(400, "Solde insuffisant");
    wallet.balance = Math.round((wallet.balance - finalPrice) * 100) / 100;
    wallet.transactions.push({ id: `t${Date.now()}`, type: "debit", amount: finalPrice, description: `Achat: ${course.title}`, date: new Date().toISOString().split("T")[0] });
    db.set("wallet", wallets);
  }

  const p: DBPurchase = { id: `pu${Date.now()}`, userId, courseId, amount: finalPrice, currency: "TND", date: new Date().toISOString().split("T")[0], paymentMethod, status: "completed" };
  const purchases = db.get<DBPurchase>("purchases");
  purchases.push(p);
  db.set("purchases", purchases);

  // Update course student count
  db.update("marketplace", courseId, { studentsCount: course.studentsCount + 1 });

  // Notification
  db.insert("notifications", { userId, type: "success", message: `Cours "${course.title}" acheté avec succès !`, time: "À l'instant", read: false });

  return p;
}

export async function applyCoupon(code: string, courseId: string) {
  await fakeDelay();
  const course = db.findById<DBMarketplaceCourse>("marketplace", courseId);
  if (!course) throw new ApiError(404, "Cours introuvable");
  const coupons = db.get<DBCoupon>("coupons");
  const coupon = coupons.find(c => c.code === code && c.active && c.usedCount < c.maxUses);
  if (!coupon || new Date(coupon.expiresAt) < new Date()) throw new ApiError(400, "Coupon invalide ou expiré");
  const discount = coupon.type === "percent" ? course.price * coupon.discount / 100 : coupon.discount;
  const finalPrice = Math.max(0, Math.round((course.price - discount) * 100) / 100);
  return { discount: Math.round(discount * 100) / 100, finalPrice };
}

export async function addReview(courseId: string, rating: number, comment: string) {
  await fakeDelay();
  const userId = getCurrentUserId();
  if (!userId) throw new ApiError(401, "Non authentifié");
  const purchased = db.findWhere<DBPurchase>("purchases", p => p.userId === userId && p.courseId === courseId && p.status === "completed");
  if (purchased.length === 0) throw new ApiError(403, "Vous devez acheter le cours pour laisser un avis");
  const existing = db.findWhere<DBReview>("reviews", r => r.userId === userId && r.courseId === courseId);
  if (existing.length > 0) throw new ApiError(400, "Vous avez déjà laissé un avis");
  const review: DBReview = { id: `rv${Date.now()}`, userId, courseId, rating, comment, date: new Date().toISOString().split("T")[0] };
  const reviews = db.get<DBReview>("reviews");
  reviews.push(review);
  db.set("reviews", reviews);
  // Update course rating
  const courseReviews = reviews.filter(r => r.courseId === courseId);
  const avgRating = Math.round(courseReviews.reduce((s, r) => s + r.rating, 0) / courseReviews.length * 10) / 10;
  db.update("marketplace", courseId, { rating: avgRating, reviewsCount: courseReviews.length });
  return review;
}

export async function getMyPurchases() {
  await fakeDelay();
  const userId = getCurrentUserId();
  if (!userId) return [];
  const purchases = db.findWhere<DBPurchase>("purchases", p => p.userId === userId && p.status === "completed");
  return purchases.map(p => {
    const course = db.findById<DBMarketplaceCourse>("marketplace", p.courseId);
    return { ...p, course };
  });
}

export async function getWallet() {
  await fakeDelay();
  const userId = getCurrentUserId();
  if (!userId) throw new ApiError(401, "Non authentifié");
  const wallets = db.get<DBWallet>("wallet");
  let wallet = wallets.find(w => w.userId === userId);
  if (!wallet) {
    wallet = { userId, balance: 0, currency: "TND", transactions: [] };
    wallets.push(wallet);
    db.set("wallet", wallets);
  }
  return wallet;
}

export async function rechargeWallet(amount: number) {
  await fakeDelay(1500, 2000);
  const userId = getCurrentUserId();
  if (!userId) throw new ApiError(401, "Non authentifié");
  const wallets = db.get<DBWallet>("wallet");
  let wallet = wallets.find(w => w.userId === userId);
  if (!wallet) { wallet = { userId, balance: 0, currency: "TND", transactions: [] }; wallets.push(wallet); }
  wallet.balance = Math.round((wallet.balance + amount) * 100) / 100;
  wallet.transactions.push({ id: `t${Date.now()}`, type: "credit", amount, description: `Rechargement +${amount} TND`, date: new Date().toISOString().split("T")[0] });
  db.set("wallet", wallets);
  return wallet;
}

// Instructor APIs
export async function getMyCoursesAsInstructor() {
  await fakeDelay();
  const userId = getCurrentUserId();
  if (!userId) return [];
  return db.findWhere<DBMarketplaceCourse>("marketplace", c => c.instructorId === userId);
}

export async function createCourse(data: Omit<DBMarketplaceCourse, "id" | "createdAt" | "studentsCount" | "rating" | "reviewsCount">) {
  await fakeDelay(800, 1200);
  const course: DBMarketplaceCourse = { ...data, id: `mc${Date.now()}`, createdAt: new Date().toISOString().split("T")[0], studentsCount: 0, rating: 0, reviewsCount: 0 };
  const courses = db.get<DBMarketplaceCourse>("marketplace");
  courses.push(course);
  db.set("marketplace", courses);
  return course;
}

export async function updateCourse(id: string, data: Partial<DBMarketplaceCourse>) {
  await fakeDelay();
  return db.update("marketplace", id, data);
}

export async function deleteCourse(id: string) {
  await fakeDelay();
  db.delete("marketplace", id);
}

export async function getCourseStats(id: string) {
  await fakeDelay();
  const purchases = db.findWhere<DBPurchase>("purchases", p => p.courseId === id && p.status === "completed");
  const reviews = db.findWhere<DBReview>("reviews", r => r.courseId === id);
  const revenue = purchases.reduce((s, p) => s + p.amount, 0);
  const avgRating = reviews.length > 0 ? Math.round(reviews.reduce((s, r) => s + r.rating, 0) / reviews.length * 10) / 10 : 0;
  return { revenue: Math.round(revenue * 100) / 100, students: purchases.length, avgRating, salesHistory: [
    { month: "Jan", revenue: 120 }, { month: "Fév", revenue: 340 }, { month: "Mar", revenue: 280 },
    { month: "Avr", revenue: 560 }, { month: "Mai", revenue: 890 }, { month: "Juin", revenue: 720 },
  ]};
}

// Admin
export async function getMarketplaceStats() {
  await fakeDelay();
  const courses = db.get<DBMarketplaceCourse>("marketplace");
  const purchases = db.get<DBPurchase>("purchases");
  const totalRevenue = purchases.reduce((s, p) => s + p.amount, 0);
  const coupons = db.get<DBCoupon>("coupons");
  return { totalCourses: courses.length, publishedCourses: courses.filter(c => c.status === "published").length, totalPurchases: purchases.length, totalRevenue: Math.round(totalRevenue * 100) / 100, coupons };
}

export async function getCoupons() {
  await fakeDelay();
  return db.get<DBCoupon>("coupons");
}

export async function createCoupon(coupon: DBCoupon) {
  await fakeDelay();
  const coupons = db.get<DBCoupon>("coupons");
  coupons.push(coupon);
  db.set("coupons", coupons);
  return coupon;
}

export async function toggleCoupon(code: string) {
  await fakeDelay();
  const coupons = db.get<DBCoupon>("coupons");
  const updated = coupons.map(c => c.code === code ? { ...c, active: !c.active } : c);
  db.set("coupons", updated);
}

export async function suspendCourse(id: string) {
  await fakeDelay();
  db.update("marketplace", id, { status: "draft" });
}

export async function approveCourse(id: string) {
  await fakeDelay();
  db.update("marketplace", id, { status: "published" });
}
