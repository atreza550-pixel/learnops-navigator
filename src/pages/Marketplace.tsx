import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Star, Filter, ShoppingBag, Users, BookOpen, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import AnimatedPage from "@/components/AnimatedPage";
import * as marketplaceApi from "@/api/marketplaceApi";

const Marketplace = () => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Tous");
  const [level, setLevel] = useState("Tous");
  const [sort, setSort] = useState("popular");
  const [priceRange, setPriceRange] = useState([0, 100]);

  const { data: courses, isLoading } = useQuery({
    queryKey: ["marketplace", search, category, level, sort, priceRange],
    queryFn: () => marketplaceApi.getCourses({ search, category, level, sort, priceMin: priceRange[0], priceMax: priceRange[1] }),
  });

  const { data: purchases } = useQuery({
    queryKey: ["my-purchases"],
    queryFn: () => marketplaceApi.getMyPurchases(),
  });

  const purchasedIds = new Set(purchases?.map(p => p.courseId) || []);

  const totalStudents = courses?.reduce((s, c) => s + c.studentsCount, 0) || 0;
  const avgRating = courses?.length ? (courses.reduce((s, c) => s + c.rating, 0) / courses.length).toFixed(1) : "0";

  const FiltersContent = () => (
    <div className="space-y-6">
      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">Catégorie</label>
        {["Tous", "DevOps", "MLOps"].map(c => (
          <button key={c} onClick={() => setCategory(c)}
            className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${category === c ? "bg-primary text-primary-foreground" : "hover:bg-secondary text-muted-foreground"}`}>
            {c}
          </button>
        ))}
      </div>
      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">Niveau</label>
        {["Tous", "Débutant", "Intermédiaire", "Avancé"].map(l => (
          <button key={l} onClick={() => setLevel(l)}
            className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${level === l ? "bg-primary text-primary-foreground" : "hover:bg-secondary text-muted-foreground"}`}>
            {l}
          </button>
        ))}
      </div>
      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">Prix (0 – 100 TND)</label>
        <Slider min={0} max={100} step={5} value={priceRange} onValueChange={setPriceRange} className="mt-4" />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>{priceRange[0]} TND</span><span>{priceRange[1]} TND</span>
        </div>
      </div>
    </div>
  );

  return (
    <AnimatedPage>
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground flex items-center justify-center gap-2">
            <ShoppingBag className="h-8 w-8 text-primary" /> Marketplace
          </h1>
          <p className="text-muted-foreground mt-1">Développez vos compétences DevOps & MLOps</p>
          <div className="flex items-center justify-center gap-6 mt-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><BookOpen className="h-4 w-4" /> {courses?.length || 0} cours</span>
            <span className="flex items-center gap-1"><Users className="h-4 w-4" /> {totalStudents} étudiants</span>
            <span className="flex items-center gap-1"><Star className="h-4 w-4 text-yellow-500 fill-yellow-500" /> {avgRating}★</span>
          </div>
        </div>

        {/* Search + Sort */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Rechercher un cours..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="popular">Populaire</SelectItem>
              <SelectItem value="rating">Mieux noté</SelectItem>
              <SelectItem value="price_asc">Prix croissant</SelectItem>
              <SelectItem value="price_desc">Prix décroissant</SelectItem>
              <SelectItem value="newest">Plus récent</SelectItem>
            </SelectContent>
          </Select>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="sm:hidden"><Filter className="h-4 w-4 mr-2" /> Filtres</Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[70vh]"><FiltersContent /></SheetContent>
          </Sheet>
        </div>

        <div className="flex gap-6">
          {/* Sidebar filters (desktop) */}
          <div className="hidden sm:block w-56 shrink-0">
            <div className="sticky top-4 bg-card rounded-xl border border-border p-4">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2"><Filter className="h-4 w-4" /> Filtres</h3>
              <FiltersContent />
            </div>
          </div>

          {/* Course grid */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {isLoading ? Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-80 rounded-xl" />
            )) : courses?.length === 0 ? (
              <div className="col-span-full text-center py-16">
                <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Aucun cours trouvé</p>
              </div>
            ) : courses?.map((course, i) => (
              <motion.div key={course.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Link to={`/marketplace/${course.id}`} className="block bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all group">
                  {/* Banner */}
                  <div className="h-28 flex items-center justify-center text-3xl" style={{ backgroundColor: course.color + "20" }}>
                    <span className="text-5xl opacity-80">{course.icon === "Server" ? "🖥️" : course.icon === "Cloud" ? "☁️" : course.icon === "BarChart" ? "📊" : course.icon === "GitMerge" ? "🔀" : "📈"}</span>
                  </div>
                  <div className="p-4 space-y-3">
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">{course.title}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">{course.description}</p>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-0.5">
                        {[1,2,3,4,5].map(s => <Star key={s} className={`h-3 w-3 ${s <= Math.round(course.rating) ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground/30"}`} />)}
                      </div>
                      <span className="text-xs text-muted-foreground">({course.reviewsCount})</span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="text-[10px]">{course.level}</Badge>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" />{course.duration}</span>
                      <span className="text-[10px] text-muted-foreground">{course.lessonsCount} leçons</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {course.tags.slice(0, 3).map(t => <Badge key={t} variant="secondary" className="text-[9px]">{t}</Badge>)}
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      {purchasedIds.has(course.id) ? (
                        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">✓ Acheté</Badge>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-primary">{course.price} TND</span>
                          <span className="text-xs text-muted-foreground line-through">{course.originalPrice} TND</span>
                          <Badge variant="destructive" className="text-[10px]">-{Math.round((1 - course.price / course.originalPrice) * 100)}%</Badge>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
};

export default Marketplace;
