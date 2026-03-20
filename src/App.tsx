import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  LayoutDashboard,
  Receipt,
  FolderOpen,
  FileBarChart2,
  Banknote,
  TrendingDown,
  PiggyBank,
  CreditCard,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Star,
  Repeat,
  Users2,
  Target,
  Send,
  CalendarClock,
  Flame,
  Award,
  Bell,
  Camera,
  Copy,
  MessageSquare,
  TrendingDown as TrendDown,
  UserCheck,
  Link,
  Eye as EyeIcon,
  BarChart2,
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  ChevronRight,
  ChevronLeft,
  Sun,
  Moon,
  Zap,
  Download,
  Search,
  ArrowUpDown,
  ListFilter,
  Utensils,
  Car,
  Monitor,
  Package,
  Building2,
  Megaphone,
  Smartphone,
  Paperclip,
  TrendingUp,
  Clock,
  Folder,
  Tag,
  BarChart3,
  PieChart,
  AlertTriangle,
  Star,
  StickyNote,
  BookOpen,
  HelpCircle,
  CheckCircle2,
  Sparkles,
  Shield,
  Database,
  RefreshCw,
  ArrowRight,
  Info,
  Wallet,
  FileText,
  Share2,
  Lock,
  Unlock,
  Trophy,
  LogOut,
  Mail,
  Eye,
  EyeOff,
  UserPlus,
  LogIn,
  User,
} from "lucide-react";

// ── SUPABASE ──────────────────────────────────────────────────────────────────
const SUPABASE_URL = "https://kftkfpzwxsxqotadaxru.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmdGtmcHp3eHN4cW90YWRheHJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1NTYxNDcsImV4cCI6MjA4OTEzMjE0N30.LF_51Ic1IkazL4dL5HRKKak1WPyfg4EG1VvzYa9V-Jw";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/*
 * ── SUPABASE SQL (run once in SQL Editor) ────────────────────────────────────
 *
 * -- Add user_id to projects and expenses so data is private per account
 *
 * alter table projects add column if not exists user_id uuid references auth.users(id) on delete cascade;
 * alter table expenses add column if not exists user_id uuid references auth.users(id) on delete cascade;
 *
 * -- Drop old "allow all" policies and replace with per-user RLS
 * drop policy if exists "allow all" on projects;
 * drop policy if exists "allow all" on expenses;
 * drop policy if exists "allow all" on expense_splits;
 *
 * create policy "own projects"       on projects       for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
 * create policy "own expenses"       on expenses       for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
 * create policy "own splits"         on expense_splits for all using (
 *   expense_id in (select id from expenses where user_id = auth.uid())
 * );
 *
 * -- Make sure RLS is enabled
 * alter table projects       enable row level security;
 * alter table expenses       enable row level security;
 * alter table expense_splits enable row level security;
 */

// ── CONSTANTS ─────────────────────────────────────────────────────────────────
const CATEGORIES = [
  "Meals",
  "Transport",
  "Software",
  "Equipment",
  "Office",
  "Marketing",
  "Communication",
  "Other",
];
const CAT_META = {
  Meals: { Icon: Utensils, color: "#f97316" },
  Transport: { Icon: Car, color: "#3b82f6" },
  Software: { Icon: Monitor, color: "#8b5cf6" },
  Equipment: { Icon: Package, color: "#06b6d4" },
  Office: { Icon: Building2, color: "#64748b" },
  Marketing: { Icon: Megaphone, color: "#ec4899" },
  Communication: { Icon: Smartphone, color: "#10b981" },
  Other: { Icon: Paperclip, color: "#94a3b8" },
};
const AI_TIPS = {
  Meals:
    "Client meals are usually split equally — try 50/50 between active projects.",
  Transport: "Travel to a specific client? Assign 100% to that project.",
  Software: "Multi-project subscriptions? Split by estimated hours per client.",
  Equipment: "Bought for one deliverable? Assign 100% to that project.",
  Marketing: "Split marketing proportionally to each project's budget share.",
  Office: "Overhead costs? Split equally across all active projects.",
  Communication: "Phone/internet bills? Split by client communication hours.",
};
const PALETTE = [
  "#f97316",
  "#3b82f6",
  "#10b981",
  "#a855f7",
  "#ef4444",
  "#eab308",
  "#06b6d4",
  "#6366f1",
  "#ec4899",
  "#14b8a6",
];
const FREE_EXP = 50;
const FREE_PROJ = 3;

// ── HELPERS ───────────────────────────────────────────────────────────────────
const fmt = (n) =>
  "₱" + Number(n).toLocaleString("en-PH", { minimumFractionDigits: 0 });
const pClr = (projects, pid) =>
  projects.find((p) => p.id === pid)?.color || "#888";
const pNm = (projects, pid) =>
  projects.find((p) => p.id === pid)?.name || "Unknown";

function useBreakpoint() {
  const [w, setW] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1024
  );
  useEffect(() => {
    const h = () => setW(window.innerWidth);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return { isMobile: w < 640, isTablet: w >= 640 && w < 1024 };
}

function useLS(key, def) {
  const [val, setVal] = useState(() => {
    try {
      const s = localStorage.getItem(key);
      return s ? JSON.parse(s) : def;
    } catch {
      return def;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch {}
  }, [key, val]);
  return [val, setVal];
}

// ── SUPABASE AUTH HOOK ────────────────────────────────────────────────────────
function useAuth() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    return data;
  };
  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  };
  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return { user, authLoading, signUp, signIn, signOut };
}

// ── SUPABASE DATA HOOK (user-scoped) ─────────────────────────────────────────
function useData(userId) {
  const [expenses, setExpenses] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState(null);

  const fetchAll = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setDbError(null);
    try {
      const { data: proj, error: pe } = await supabase
        .from("projects")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: true });
      if (pe) throw pe;
      const { data: exp, error: ee } = await supabase
        .from("expenses")
        .select("*, expense_splits(project_id, pct)")
        .eq("user_id", userId)
        .order("date", { ascending: false });
      if (ee) throw ee;
      setProjects(proj || []);
      setExpenses(
        (exp || []).map((e) => ({
          ...e,
          splits: (e.expense_splits || []).map((s) => ({
            pid: s.project_id,
            pct: s.pct,
          })),
        }))
      );
    } catch (err) {
      setDbError(err.message || "Database error");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) fetchAll();
  }, [fetchAll, userId]);

  const addProject = async (f) => {
    const { data, error } = await supabase
      .from("projects")
      .insert([
        {
          name: f.name,
          client: f.client,
          color: f.color,
          budget: Number(f.budget) || 0,
          user_id: userId,
        },
      ])
      .select()
      .single();
    if (error) throw error;
    setProjects((p) => [...p, data]);
    return data;
  };
  const removeProject = async (pid) => {
    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", pid)
      .eq("user_id", userId);
    if (error) throw error;
    setProjects((p) => p.filter((x) => x.id !== pid));
  };
  const addExpense = async (f) => {
    const { data: exp, error: ee } = await supabase
      .from("expenses")
      .insert([
        {
          description: f.description,
          amount: Number(f.amount),
          category: f.category,
          date: f.date,
          notes: f.notes || "",
          user_id: userId,
        },
      ])
      .select()
      .single();
    if (ee) throw ee;
    await supabase
      .from("expense_splits")
      .insert(
        f.splits.map((s) => ({
          expense_id: exp.id,
          project_id: s.pid,
          pct: s.pct,
        }))
      );
    setExpenses((p) => [{ ...exp, splits: f.splits }, ...p]);
  };
  const updateExpense = async (id, f) => {
    const { error: ee } = await supabase
      .from("expenses")
      .update({
        description: f.description,
        amount: Number(f.amount),
        category: f.category,
        date: f.date,
        notes: f.notes || "",
      })
      .eq("id", id)
      .eq("user_id", userId);
    if (ee) throw ee;
    await supabase.from("expense_splits").delete().eq("expense_id", id);
    await supabase
      .from("expense_splits")
      .insert(
        f.splits.map((s) => ({ expense_id: id, project_id: s.pid, pct: s.pct }))
      );
    setExpenses((p) =>
      p.map((e) =>
        e.id === id
          ? { ...e, ...f, amount: Number(f.amount), splits: f.splits }
          : e
      )
    );
  };
  const removeExpense = async (id) => {
    const { error } = await supabase
      .from("expenses")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);
    if (error) throw error;
    setExpenses((p) => p.filter((e) => e.id !== id));
  };

  return {
    expenses,
    projects,
    loading,
    dbError,
    addProject,
    removeProject,
    addExpense,
    updateExpense,
    removeExpense,
  };
}

// ── CHARTS ────────────────────────────────────────────────────────────────────
function DonutChart({ segments, size = 88 }) {
  const r = 28,
    cx = 40,
    cy = 40,
    circ = 2 * Math.PI * r;
  let off = 0;
  return (
    <svg width={size} height={size} viewBox="0 0 80 80">
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="rgba(255,255,255,0.04)"
        strokeWidth="12"
      />
      {segments.map((s, i) => {
        const dash = (s.pct / 100) * circ;
        const arc = { dash, offset: off, color: s.color };
        off += dash;
        return (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={arc.color}
            strokeWidth="12"
            strokeDasharray={`${arc.dash} ${circ - arc.dash}`}
            strokeDashoffset={circ / 4 - arc.offset}
            style={{ transition: "stroke-dasharray .6s ease" }}
          />
        );
      })}
    </svg>
  );
}
function MiniBar({ data }) {
  const max = Math.max(...data.map((d) => d.val), 1);
  return (
    <div
      style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 64 }}
    >
      {data.map((d, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
          }}
        >
          <div
            style={{
              width: "100%",
              height: 52,
              display: "flex",
              alignItems: "flex-end",
              borderRadius: "3px 3px 0 0",
              overflow: "hidden",
              background: "rgba(255,255,255,0.04)",
            }}
          >
            <div
              style={{
                width: "100%",
                background: d.highlight ? "#f97316" : "#3b82f6",
                height: `${(d.val / max) * 100}%`,
                transition: "height .6s ease",
              }}
            />
          </div>
          <span style={{ fontSize: 8, color: "#555", fontWeight: 700 }}>
            {d.label}
          </span>
        </div>
      ))}
    </div>
  );
}
function SplitBar({ splits, projects }) {
  return (
    <div
      style={{
        display: "flex",
        height: 4,
        borderRadius: 3,
        overflow: "hidden",
        gap: 1,
      }}
    >
      {splits.map((s, i) => (
        <div
          key={i}
          style={{
            width: `${s.pct}%`,
            background: pClr(projects, s.pid),
            borderRadius:
              i === 0
                ? "3px 0 0 3px"
                : i === splits.length - 1
                ? "0 3px 3px 0"
                : 0,
            transition: "width .4s ease",
          }}
        />
      ))}
    </div>
  );
}
function Toast({ msg, type }) {
  const bg =
    { error: "#dc2626", warning: "#d97706", success: "#111" }[type] || "#111";
  const Ic =
    { error: X, warning: AlertTriangle, success: CheckCircle2 }[type] ||
    CheckCircle2;
  return (
    <div
      style={{
        position: "fixed",
        bottom: 28,
        left: "50%",
        transform: "translateX(-50%)",
        background: bg,
        color: "#fff",
        padding: "11px 20px",
        borderRadius: 30,
        fontSize: 13,
        fontWeight: 700,
        zIndex: 9999,
        pointerEvents: "none",
        whiteSpace: "nowrap",
        boxShadow: "0 8px 32px rgba(0,0,0,.5)",
        animation: "toastIn .25s ease",
        border: "1px solid rgba(255,255,255,.1)",
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}
    >
      <Ic size={14} /> {msg}
    </div>
  );
}

// ── LANDING PAGE ──────────────────────────────────────────────────────────────
function LandingPage({ onLogin, onRegister }) {
  const { isMobile, isTablet } = useBreakpoint();
  const [scrolled, setScrolled] = useState(false);
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    const f = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", f, { passive: true });
    return () => window.removeEventListener("scroll", f);
  }, []);

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    html,body{overflow-x:hidden;scroll-behavior:smooth;-webkit-font-smoothing:antialiased}
    @keyframes bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
    @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
    @keyframes marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}
    .bob{animation:bob 6s ease-in-out infinite}
    .mq{display:flex;white-space:nowrap;animation:marquee 28s linear infinite}
    .fade-u{animation:fadeUp .6s ease both}
    .fade-u-1{animation:fadeUp .6s .1s ease both}
    .fade-u-2{animation:fadeUp .6s .2s ease both}
    .fade-u-3{animation:fadeUp .6s .3s ease both}
    .feature-card{background:#111;border:1px solid rgba(255,255,255,.07);border-radius:18px;padding:26px;transition:border-color .2s,background .2s}
    .feature-card:hover{background:#161616;border-color:rgba(249,115,22,.25)}
    a{text-decoration:none}
  `;

  const features = [
    {
      Icon: Zap,
      color: "#f97316",
      title: "Smart Split",
      body: "One expense, multiple clients — split by percentage instantly. Adobe CC 60/40 between two projects? Done in seconds. No more guessing which client paid for what.",
    },
    {
      Icon: FolderOpen,
      color: "#3b82f6",
      title: "One Project Per Client",
      body: "Create a dedicated project for each client. Every expense goes to the right place — no more end-of-month confusion about who spent what.",
    },
    {
      Icon: Shield,
      color: "#10b981",
      title: "Work vs Personal — Separated",
      body: "Log only business expenses per project. Personal costs stay out. Clean, clear, and audit-ready whenever you need it.",
    },
    {
      Icon: Receipt,
      color: "#8b5cf6",
      title: "Log Instantly, Forget Nothing",
      body: "Add an expense in under 10 seconds from your phone. No more 'I'll record it later' — later never comes. Log it now, split it now.",
    },
    {
      Icon: FileText,
      color: "#ec4899",
      title: "BIR-Ready Reports",
      body: "At quarter-end, export a full breakdown by project and category. Hand it straight to your accountant — no spreadsheet panic.",
    },
    {
      Icon: BarChart3,
      color: "#06b6d4",
      title: "Live Tax Savings Estimate",
      body: "See your estimated deductions update in real time as you log. Know exactly how much you're saving before filing season hits.",
    },
  ];

  return (
    <div
      style={{
        background: "#0a0a0a",
        color: "#fff",
        minHeight: "100vh",
        fontFamily: "'Plus Jakarta Sans',sans-serif",
        overflowX: "hidden",
      }}
    >
      <style>{css}</style>

      {/* NAV */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 300,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: scrolled ? "12px 24px" : "20px 24px",
          background: scrolled ? "rgba(10,10,10,.97)" : "transparent",
          backdropFilter: scrolled ? "blur(14px)" : "none",
          borderBottom: scrolled ? "1px solid rgba(255,255,255,.06)" : "none",
          transition: "all .3s",
          gap: 12,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 9,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 34,
              height: 34,
              background: "#f97316",
              borderRadius: 9,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 900,
              color: "#fff",
              fontSize: 16,
            }}
          >
            ₣
          </div>
          <span
            style={{
              fontFamily: "'Playfair Display',serif",
              fontSize: 18,
              color: "#fff",
            }}
          >
            FreelanceFunds
          </span>
        </div>
        {!isMobile && (
          <div style={{ display: "flex", gap: 28, alignItems: "center" }}>
            {[
              ["#features", "Features"],
              ["#how", "How It Works"],
              ["#pricing", "Pricing"],
            ].map(([h, l]) => (
              <a
                key={h}
                href={h}
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#666",
                  transition: "color .2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#666")}
              >
                {l}
              </a>
            ))}
          </div>
        )}
        <div
          style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
            flexShrink: 0,
          }}
        >
          {!isMobile && (
            <button
              onClick={onLogin}
              style={{
                background: "#f97316",
                border: "none",
                color: "#fff",
                borderRadius: 9,
                padding: "8px 18px",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "all .2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#ea6c0a")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "#f97316")
              }
            >
              Log In
            </button>
          )}
          <button
            onClick={onRegister}
            style={{
              background: "#f97316",
              color: "#fff",
              border: "none",
              borderRadius: 9,
              padding: "9px 20px",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "background .2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#ea6c0a")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#f97316")}
          >
            {isMobile ? "Sign Up" : "Get Started Free"}
          </button>
          {isMobile && (
            <button
              onClick={() => setNavOpen((o) => !o)}
              style={{
                background: "rgba(255,255,255,.06)",
                border: "1px solid rgba(255,255,255,.1)",
                color: "#fff",
                width: 36,
                height: 36,
                borderRadius: 8,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
              }}
            >
              {navOpen ? <X size={16} /> : "☰"}
            </button>
          )}
        </div>
      </nav>

      {/* Mobile nav drawer */}
      {isMobile && navOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 290,
            background: "rgba(0,0,0,.85)",
            backdropFilter: "blur(8px)",
          }}
          onClick={() => setNavOpen(false)}
        >
          <div
            style={{
              position: "absolute",
              top: 68,
              left: 16,
              right: 16,
              background: "#111",
              borderRadius: 18,
              border: "1px solid rgba(255,255,255,.08)",
              padding: 20,
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {[
              ["#features", "Features"],
              ["#how", "How It Works"],
              ["#pricing", "Pricing"],
            ].map(([h, l]) => (
              <a
                key={h}
                href={h}
                onClick={() => setNavOpen(false)}
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: "#ccc",
                  padding: "12px 16px",
                  borderRadius: 10,
                  display: "block",
                }}
              >
                {l}
              </a>
            ))}
            <div
              style={{
                height: 1,
                background: "rgba(255,255,255,.06)",
                margin: "8px 0",
              }}
            />
            <button
              onClick={() => {
                setNavOpen(false);
                onLogin();
              }}
              style={{
                background: "none",
                border: "1.5px solid rgba(255,255,255,.15)",
                color: "#ccc",
                borderRadius: 12,
                padding: 13,
                fontSize: 15,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Log In
            </button>
            <button
              onClick={() => {
                setNavOpen(false);
                onRegister();
              }}
              style={{
                background: "#f97316",
                color: "#fff",
                border: "none",
                borderRadius: 12,
                padding: 13,
                fontSize: 15,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Get Started Free
            </button>
          </div>
        </div>
      )}

      {/* HERO */}
      <section
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: isMobile ? "100px 20px 60px" : "120px 24px 80px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "20%",
            left: "50%",
            transform: "translateX(-50%)",
            width: 600,
            height: 600,
            borderRadius: "50%",
            background:
              "radial-gradient(circle,rgba(249,115,22,.12) 0%,transparent 65%)",
            pointerEvents: "none",
          }}
        />
        <div
          className="fade-u"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            background: "rgba(249,115,22,.1)",
            border: "1px solid rgba(249,115,22,.25)",
            color: "#f97316",
            borderRadius: 100,
            padding: "6px 16px",
            fontSize: 11,
            fontWeight: 700,
            marginBottom: 28,
            letterSpacing: ".07em",
          }}
        >
          BUILT FOR FILIPINO FREELANCERS
        </div>
        <h1
          className="fade-u-1"
          style={{
            fontFamily: "'Playfair Display',serif",
            fontSize: isMobile
              ? "clamp(34px,10vw,52px)"
              : "clamp(44px,6vw,80px)",
            lineHeight: 1.04,
            letterSpacing: "-0.03em",
            marginBottom: 22,
            maxWidth: 860,
          }}
        >
          The financial command center
          <br />
          for{" "}
          <span style={{ color: "#f97316", fontStyle: "italic" }}>
            Filipino freelancers.
          </span>
        </h1>
        <p
          className="fade-u-2"
          style={{
            fontSize: isMobile ? 15 : 17,
            color: "#666",
            maxWidth: 560,
            lineHeight: 1.85,
            marginBottom: 36,
          }}
        >
          Irregular income. Multiple clients. Forgotten expenses. Blurred
          personal and work costs. FreelanceFunds gives you one place to track
          income, log expenses, monitor payments, and know exactly what to set
          aside for taxes — so freelancing finally feels manageable.
        </p>
        <div
          className="fade-u-3"
          style={{
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            justifyContent: "center",
            marginBottom: 56,
          }}
        >
          <button
            onClick={onRegister}
            style={{
              background: "#f97316",
              color: "#fff",
              border: "none",
              borderRadius: 13,
              padding: isMobile ? "13px 26px" : "15px 32px",
              fontSize: isMobile ? 15 : 16,
              fontWeight: 800,
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "all .2s",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#ea6c0a";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#f97316";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <UserPlus size={16} /> Create Free Account
          </button>
          <button
            onClick={onLogin}
            style={{
              background: "#f97316",
              color: "#fff",
              border: "none",
              borderRadius: 13,
              padding: isMobile ? "12px 22px" : "14px 28px",
              fontSize: isMobile ? 15 : 16,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "inherit",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <LogIn size={16} /> Log In
          </button>
          <button
            onClick={onRegister}
            style={{
              background: "rgba(255,255,255,.05)",
              color: "#aaa",
              border: "1px solid rgba(255,255,255,.12)",
              borderRadius: 13,
              padding: isMobile ? "12px 22px" : "14px 28px",
              fontSize: isMobile ? 15 : 16,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "inherit",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <UserPlus size={16} /> Create Account
          </button>
        </div>

        {/* Mock dashboard preview */}
        <div
          className="bob"
          style={{
            width: "min(500px,90vw)",
            background: "#111",
            border: "1px solid rgba(255,255,255,.08)",
            borderRadius: 20,
            overflow: "hidden",
            boxShadow: "0 40px 100px rgba(0,0,0,.8)",
            position: "relative",
            zIndex: 2,
          }}
        >
          <div
            style={{
              background: "#161616",
              padding: "10px 16px",
              display: "flex",
              alignItems: "center",
              gap: 6,
              borderBottom: "1px solid rgba(255,255,255,.05)",
            }}
          >
            {["#ef4444", "#eab308", "#22c55e"].map((c) => (
              <div
                key={c}
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: c,
                }}
              />
            ))}
            <div
              style={{
                flex: 1,
                marginLeft: 8,
                background: "rgba(255,255,255,.05)",
                borderRadius: 5,
                padding: "3px 12px",
                fontSize: 10,
                color: "#444",
              }}
            >
              freelancefunds — Dashboard
            </div>
          </div>
          <div style={{ padding: 20 }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3,1fr)",
                gap: 8,
                marginBottom: 16,
              }}
            >
              {[
                ["Total Tracked", "₱24,390", "#fff"],
                ["Tax Savings", "₱4,878", "#86efac"],
                ["Projects", "4", "#fff"],
              ].map(([l, v, c]) => (
                <div
                  key={l}
                  style={{
                    background: "#1a1a1a",
                    borderRadius: 10,
                    padding: "10px 12px",
                  }}
                >
                  <div
                    style={{
                      fontSize: 8,
                      color: "#444",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: ".08em",
                      marginBottom: 4,
                    }}
                  >
                    {l}
                  </div>
                  <div
                    style={{
                      fontFamily: "'Playfair Display',serif",
                      fontSize: 16,
                      color: c,
                    }}
                  >
                    {v}
                  </div>
                </div>
              ))}
            </div>
            {[
              {
                ic: Monitor,
                nm: "Adobe Creative Cloud",
                clr: "#8b5cf6",
                sp: [60, 40],
                cs: ["#f97316", "#3b82f6"],
                a: "₱1,200",
              },
              {
                ic: Utensils,
                nm: "Client Lunch – BGC",
                clr: "#f97316",
                sp: [100],
                cs: ["#10b981"],
                a: "₱850",
              },
              {
                ic: Car,
                nm: "Grab to Client Office",
                clr: "#3b82f6",
                sp: [50, 50],
                cs: ["#f97316", "#a855f7"],
                a: "₱320",
              },
            ].map((r, i) => {
              const RIc = r.ic;
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px 0",
                    borderBottom:
                      i < 2 ? "1px solid rgba(255,255,255,.04)" : "none",
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        background: `${r.clr}18`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: r.clr,
                      }}
                    >
                      <RIc size={14} />
                    </div>
                    <div>
                      <div
                        style={{ fontSize: 12, fontWeight: 600, color: "#ccc" }}
                      >
                        {r.nm}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          gap: 2,
                          height: 3,
                          borderRadius: 2,
                          overflow: "hidden",
                          marginTop: 4,
                        }}
                      >
                        {r.sp.map((w, j) => (
                          <div
                            key={j}
                            style={{ width: `${w}%`, background: r.cs[j] }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>
                    {r.a}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* PAIN POINTS — "Sound familiar?" */}
      <section
        style={{
          background: "#0d0d0d",
          padding: isMobile ? "56px 20px" : "72px 24px",
          borderTop: "1px solid rgba(255,255,255,.06)",
        }}
      >
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <p
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "#f97316",
              letterSpacing: ".09em",
              textTransform: "uppercase",
              marginBottom: 12,
              textAlign: "center",
            }}
          >
            Sound familiar?
          </p>
          <h2
            style={{
              fontFamily: "'Playfair Display',serif",
              fontSize: isMobile
                ? "clamp(22px,5vw,34px)"
                : "clamp(24px,3vw,38px)",
              color: "#fff",
              textAlign: "center",
              marginBottom: 40,
              letterSpacing: "-0.02em",
              lineHeight: 1.2,
            }}
          >
            Built for the way freelancing actually works.
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "repeat(3,1fr)",
              gap: 16,
            }}
          >
            {[
              {
                emoji: "😩",
                title: "Forgetting to record expenses",
                body: "You pay for something, tell yourself you'll log it later, and three weeks later you have no idea what you spent. Sound familiar?",
              },
              {
                emoji: "🤯",
                title: "Multiple clients, one big mess",
                body: "Adobe CC, Grab rides, client lunches — which project paid for what? Without a system, everything blurs together by quarter-end.",
              },
              {
                emoji: "💸",
                title: "Mixing personal and work costs",
                body: "Your phone bill, your laptop, your internet — all legitimate deductions, but impossible to claim when they're tangled with personal expenses.",
              },
            ].map((p, i) => (
              <div
                key={i}
                style={{
                  background: "#111",
                  border: "1px solid rgba(255,255,255,.06)",
                  borderRadius: 18,
                  padding: "24px 22px",
                }}
              >
                <div style={{ fontSize: 28, marginBottom: 14 }}>{p.emoji}</div>
                <p
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: "#e5e5e5",
                    marginBottom: 10,
                    lineHeight: 1.3,
                  }}
                >
                  {p.title}
                </p>
                <p style={{ fontSize: 13, color: "#555", lineHeight: 1.8 }}>
                  {p.body}
                </p>
              </div>
            ))}
          </div>
          <div
            style={{
              textAlign: "center",
              marginTop: 36,
              padding: "20px 24px",
              background: "rgba(249,115,22,.06)",
              border: "1px solid rgba(249,115,22,.15)",
              borderRadius: 16,
            }}
          >
            <p
              style={{
                fontSize: isMobile ? 15 : 17,
                color: "#fff",
                fontWeight: 600,
                lineHeight: 1.75,
              }}
            >
              FreelanceFunds fixes all six —{" "}
              <span style={{ color: "#f97316" }}>
                income tracking, smart expense splitting, tax calculators,
                payment status, and BIR-ready reports
              </span>{" "}
              in one place.
            </p>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div
        style={{
          background: "#111",
          overflow: "hidden",
          padding: "13px 0",
          borderTop: "1px solid rgba(255,255,255,.05)",
          borderBottom: "1px solid rgba(255,255,255,.05)",
        }}
      >
        <div className="mq">
          {[...Array(2)].flatMap(() =>
            [
              ["Monitor", "Adobe CC", "split 60/40"],
              ["Utensils", "Client meals", "auto-allocated"],
              ["FileText", "BIR reports", "one click"],
              ["Smartphone", "Phone bills", "split by hours"],
              ["Car", "Grab rides", "per project"],
              ["Megaphone", "Facebook Ads", "by budget share"],
              ["Clock", "10 hrs saved", "every month"],
              ["Shield", "₱18,000", "avg annual savings"],
              ["Banknote", "Income tracked", "per client"],
              ["PiggyBank", "Buffer goal", "3-month safety net"],
              ["CreditCard", "Payment status", "paid · pending · overdue"],
              ["TrendingUp", "Net profit", "live dashboard"],
            ].map(([, l, a], i) => (
              <div
                key={i}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "0 28px",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#444",
                  borderRight: "1px solid #1a1a1a",
                  whiteSpace: "nowrap",
                }}
              >
                <span style={{ color: "#666" }}>{l}</span>{" "}
                <span style={{ color: "#f97316" }}>{a}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* FEATURES */}
      <section
        id="features"
        style={{
          padding: isMobile ? "72px 20px" : "100px 24px",
          background: "#0a0a0a",
        }}
      >
        <div style={{ maxWidth: 1040, margin: "0 auto" }}>
          <p
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "#f97316",
              letterSpacing: ".09em",
              textTransform: "uppercase",
              marginBottom: 12,
              textAlign: "center",
            }}
          >
            Why FreelanceFunds
          </p>
          <h2
            style={{
              fontFamily: "'Playfair Display',serif",
              fontSize: isMobile
                ? "clamp(24px,6vw,40px)"
                : "clamp(28px,4vw,48px)",
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
              marginBottom: 48,
              color: "#fff",
              textAlign: "center",
            }}
          >
            The fix for every
            <br />
            <span style={{ fontStyle: "italic", color: "#f97316" }}>
              freelancer expense headache.
            </span>
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile
                ? "1fr"
                : isTablet
                ? "repeat(2,1fr)"
                : "repeat(3,1fr)",
              gap: 14,
            }}
          >
            {features.map((f, i) => (
              <div key={i} className="feature-card">
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: `${f.color}18`,
                    border: `1px solid ${f.color}30`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 14,
                  }}
                >
                  <f.Icon size={20} color={f.color} />
                </div>
                <p
                  style={{
                    fontSize: 15,
                    fontWeight: 800,
                    color: "#e5e5e5",
                    marginBottom: 8,
                  }}
                >
                  {f.title}
                </p>
                <p style={{ fontSize: 13, color: "#555", lineHeight: 1.8 }}>
                  {f.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section
        id="how"
        style={{
          padding: isMobile ? "72px 20px" : "100px 24px",
          background: "#060606",
          borderTop: "1px solid rgba(255,255,255,.05)",
        }}
      >
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <p
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "#f97316",
              letterSpacing: ".09em",
              textTransform: "uppercase",
              marginBottom: 12,
              textAlign: "center",
            }}
          >
            How it works
          </p>
          <h2
            style={{
              fontFamily: "'Playfair Display',serif",
              fontSize: isMobile
                ? "clamp(24px,6vw,40px)"
                : "clamp(28px,4vw,48px)",
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
              marginBottom: 52,
              color: "#fff",
              textAlign: "center",
            }}
          >
            From chaos to organized
            <br />
            <span style={{ fontStyle: "italic", color: "#f97316" }}>
              in under 2 minutes.
            </span>
          </h2>
          {[
            {
              n: "01",
              Icon: UserPlus,
              t: "Create a free account",
              b: "Sign up with email and password. Your data is private — no one else sees your projects or expenses.",
            },
            {
              n: "02",
              Icon: FolderOpen,
              t: "Add a project per client",
              b: "Create one project per client. Set a budget, pick a color. Takes 30 seconds.",
            },
            {
              n: "03",
              Icon: Zap,
              t: "Log expenses with Smart Split",
              b: "Enter any expense and split the cost across clients by percentage. Adobe CC at 60/40? Done instantly.",
            },
            {
              n: "04",
              Icon: FileBarChart2,
              t: "Export your BIR-ready report",
              b: "At quarter-end, open Reports and export. Hand the CSV or PDF directly to your accountant. No panic.",
            },
          ].map((s, i, arr) => (
            <div
              key={i}
              style={{
                display: "grid",
                gridTemplateColumns: "56px 1fr",
                gap: 20,
                padding: "32px 0",
                borderBottom:
                  i < arr.length - 1
                    ? "1px solid rgba(255,255,255,.05)"
                    : "none",
              }}
            >
              <div
                style={{
                  fontFamily: "'Playfair Display',serif",
                  fontSize: 42,
                  color: "rgba(255,255,255,.06)",
                  lineHeight: 1,
                  letterSpacing: "-0.04em",
                }}
              >
                {s.n}
              </div>
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 8,
                  }}
                >
                  <s.Icon size={16} color="#f97316" />
                  <span
                    style={{
                      fontSize: 18,
                      fontWeight: 800,
                      color: "#e5e5e5",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {s.t}
                  </span>
                </div>
                <p style={{ fontSize: 14, color: "#555", lineHeight: 1.85 }}>
                  {s.b}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section
        id="pricing"
        style={{
          padding: isMobile ? "72px 20px" : "100px 24px",
          background: "#0a0a0a",
        }}
      >
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <p
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "#f97316",
              letterSpacing: ".09em",
              textTransform: "uppercase",
              marginBottom: 12,
              textAlign: "center",
            }}
          >
            Simple pricing
          </p>
          <h2
            style={{
              fontFamily: "'Playfair Display',serif",
              fontSize: isMobile
                ? "clamp(24px,6vw,40px)"
                : "clamp(28px,4vw,48px)",
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
              marginBottom: 48,
              color: "#fff",
              textAlign: "center",
            }}
          >
            Start free.
            <br />
            <span style={{ fontStyle: "italic", color: "#f97316" }}>
              Upgrade when ready.
            </span>
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
              gap: 16,
            }}
          >
            {[
              {
                label: "Free",
                price: "₱0",
                sub: "forever · no card needed",
                feats: [
                  "50 expenses/month",
                  "3 projects",
                  "2-way split",
                  "CSV export",
                  "Private per account",
                ],
                no: ["AI suggestions", "PDF reports", "4-way split"],
                accent: "#555",
              },
              {
                label: "Pro",
                price: "₱500",
                sub: "per month · cancel anytime",
                feats: [
                  "Unlimited expenses",
                  "Unlimited projects",
                  "4-way smart split",
                  "AI suggestions",
                  "PDF tax reports",
                  "Receipt uploads",
                ],
                no: [],
                accent: "#f97316",
                popular: true,
              },
            ].map((p) => (
              <div
                key={p.label}
                style={{
                  background: "#111",
                  border: `2px solid ${p.accent}`,
                  borderRadius: 22,
                  padding: isMobile ? 24 : 32,
                  position: "relative",
                }}
              >
                {p.popular && (
                  <div
                    style={{
                      position: "absolute",
                      top: -12,
                      left: "50%",
                      transform: "translateX(-50%)",
                      background: "#f97316",
                      color: "#fff",
                      fontSize: 10,
                      fontWeight: 800,
                      padding: "3px 14px",
                      borderRadius: 20,
                      whiteSpace: "nowrap",
                    }}
                  >
                    MOST POPULAR
                  </div>
                )}
                <p
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    color: p.popular ? "#f97316" : "#555",
                    letterSpacing: ".08em",
                    textTransform: "uppercase",
                    marginBottom: 10,
                  }}
                >
                  {p.label}
                </p>
                <p
                  style={{
                    fontFamily: "'Playfair Display',serif",
                    fontSize: 40,
                    color: p.popular ? "#f97316" : "#fff",
                    lineHeight: 1,
                    marginBottom: 4,
                  }}
                >
                  {p.price}
                </p>
                <p style={{ fontSize: 12, color: "#444", marginBottom: 20 }}>
                  {p.sub}
                </p>
                {p.feats.map((f) => (
                  <div
                    key={f}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 9,
                      marginBottom: 9,
                    }}
                  >
                    <Check
                      size={13}
                      color={p.popular ? "#f97316" : "#10b981"}
                    />
                    <span style={{ fontSize: 13, color: "#aaa" }}>{f}</span>
                  </div>
                ))}
                {p.no.map((f) => (
                  <div
                    key={f}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 9,
                      marginBottom: 9,
                    }}
                  >
                    <X size={13} color="#333" />
                    <span
                      style={{
                        fontSize: 13,
                        color: "#333",
                        textDecoration: "line-through",
                      }}
                    >
                      {f}
                    </span>
                  </div>
                ))}
                <button
                  onClick={onRegister}
                  style={{
                    width: "100%",
                    padding: 13,
                    borderRadius: 12,
                    border: `2px solid ${
                      p.popular ? "#f97316" : "rgba(255,255,255,.12)"
                    }`,
                    background: p.popular ? "#f97316" : "transparent",
                    color: p.popular ? "#fff" : "#888",
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    marginTop: 16,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                  }}
                >
                  <UserPlus size={15} />{" "}
                  {p.popular ? "Start Pro Free Trial" : "Create Free Account"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        style={{
          background: "#f97316",
          padding: isMobile ? "64px 20px" : "88px 24px",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            fontFamily: "'Playfair Display',serif",
            fontSize: isMobile
              ? "clamp(26px,7vw,44px)"
              : "clamp(28px,4vw,52px)",
            lineHeight: 1.06,
            color: "#fff",
            marginBottom: 14,
            letterSpacing: "-0.03em",
          }}
        >
          Your finances, finally
          <br />
          <span style={{ color: "#fff" }}>under control.</span>
        </h2>
        <p
          style={{
            fontSize: 15,
            color: "rgba(255,255,255,.75)",
            marginBottom: 32,
          }}
        >
          Track income. Log expenses. Know your tax set-aside. Plan for slow
          months. All in one place — free to start.
        </p>
        <button
          onClick={onRegister}
          style={{
            background: "#0a0a0a",
            color: "#fff",
            border: "none",
            borderRadius: 13,
            padding: "15px 36px",
            fontSize: 16,
            fontWeight: 800,
            cursor: "pointer",
            fontFamily: "inherit",
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <UserPlus size={16} /> Get Started Free
        </button>
      </section>

      {/* FOOTER */}
      <footer
        style={{
          background: "#060606",
          padding: "24px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
          borderTop: "1px solid rgba(255,255,255,.05)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 28,
              height: 28,
              background: "#f97316",
              borderRadius: 7,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 900,
              color: "#fff",
              fontSize: 13,
            }}
          >
            ₣
          </div>
          <span
            style={{
              fontFamily: "'Playfair Display',serif",
              fontSize: 14,
              color: "#444",
            }}
          >
            FreelanceFunds
          </span>
        </div>
        <p
          style={{
            fontSize: 11,
            color: "#2a2a2a",
            letterSpacing: ".04em",
            textTransform: "uppercase",
          }}
        >
          Built for Filipino Freelancers · 2025
        </p>
      </footer>
    </div>
  );
}

// ── AUTH PAGE (Login / Register) ──────────────────────────────────────────────
function AuthPage({ mode, onSuccess, onSwitch, onBack }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false); // email confirm state
  const { signUp, signIn } = useAuth();
  const isRegister = mode === "register";

  const handleSubmit = async () => {
    setError("");
    if (!email.trim() || !password.trim()) {
      setError("Please fill in both fields.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      if (isRegister) {
        await signUp(email.trim(), password);
        setDone(true); // Supabase sends a confirmation email
      } else {
        await signIn(email.trim(), password);
        onSuccess();
      }
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    @keyframes scaleIn{from{opacity:0;transform:scale(.96)}to{opacity:1;transform:scale(1)}}
    @keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
    .auth-card{animation:scaleIn .3s ease both}
  `;

  return (
    <div
      style={{
        background: "#0a0a0a",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        fontFamily: "'Plus Jakarta Sans',sans-serif",
      }}
    >
      <style>{css}</style>

      {/* Back to landing */}
      <button
        onClick={onBack}
        style={{
          position: "fixed",
          top: 20,
          left: 20,
          background: "rgba(255,255,255,.06)",
          border: "1px solid rgba(255,255,255,.1)",
          color: "#888",
          borderRadius: 8,
          padding: "7px 12px",
          fontSize: 12,
          fontWeight: 600,
          cursor: "pointer",
          fontFamily: "inherit",
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <ChevronLeft size={13} /> Back
      </button>

      <div
        className="auth-card"
        style={{
          background: "#111",
          border: "1px solid rgba(255,255,255,.08)",
          borderRadius: 24,
          width: "100%",
          maxWidth: 420,
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div style={{ padding: "28px 28px 0", textAlign: "center" }}>
          <div
            style={{
              width: 48,
              height: 48,
              background: "#f97316",
              borderRadius: 13,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              fontWeight: 900,
              color: "#fff",
              fontSize: 22,
            }}
          >
            ₣
          </div>
          <h2
            style={{
              fontFamily: "'Playfair Display',serif",
              fontSize: 26,
              color: "#fff",
              marginBottom: 6,
            }}
          >
            {done
              ? "Check your email"
              : isRegister
              ? "Create your account"
              : "Welcome back"}
          </h2>
          <p style={{ fontSize: 13, color: "#555", marginBottom: 28 }}>
            {done
              ? `We sent a confirmation link to ${email}. Click it to activate your account.`
              : isRegister
              ? "Free forever. No credit card needed."
              : "Log in to access your expenses and reports."}
          </p>
        </div>

        {done ? (
          <div style={{ padding: "0 28px 28px", textAlign: "center" }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                background: "rgba(16,185,129,.15)",
                border: "2px solid rgba(16,185,129,.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
              }}
            >
              <Mail size={24} color="#10b981" />
            </div>
            <p
              style={{
                fontSize: 13,
                color: "#555",
                lineHeight: 1.75,
                marginBottom: 20,
              }}
            >
              After confirming your email, come back and log in.
            </p>
            <button
              onClick={() => {
                setDone(false);
                onSwitch();
              }}
              style={{
                background: "#f97316",
                color: "#fff",
                border: "none",
                borderRadius: 12,
                padding: "12px 28px",
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "inherit",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <LogIn size={15} /> Go to Log In
            </button>
          </div>
        ) : (
          <div
            style={{
              padding: "0 28px 28px",
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            {/* Email */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 11,
                  fontWeight: 800,
                  color: "#555",
                  textTransform: "uppercase",
                  letterSpacing: ".07em",
                  marginBottom: 7,
                }}
              >
                Email
              </label>
              <div style={{ position: "relative" }}>
                <Mail
                  size={14}
                  color="#444"
                  style={{
                    position: "absolute",
                    left: 13,
                    top: "50%",
                    transform: "translateY(-50%)",
                    pointerEvents: "none",
                  }}
                />
                <input
                  type="email"
                  placeholder="you@email.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  style={{
                    width: "100%",
                    background: "#1a1a1a",
                    border: "1.5px solid #222",
                    borderRadius: 11,
                    padding: "11px 14px 11px 36px",
                    fontSize: 14,
                    color: "#fff",
                    outline: "none",
                    fontFamily: "inherit",
                    transition: "border .15s",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#f97316")}
                  onBlur={(e) => (e.target.style.borderColor = "#222")}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 11,
                  fontWeight: 800,
                  color: "#555",
                  textTransform: "uppercase",
                  letterSpacing: ".07em",
                  marginBottom: 7,
                }}
              >
                Password{" "}
                {isRegister && (
                  <span
                    style={{
                      color: "#333",
                      fontWeight: 400,
                      textTransform: "none",
                    }}
                  >
                    (min 6 characters)
                  </span>
                )}
              </label>
              <div style={{ position: "relative" }}>
                <Lock
                  size={14}
                  color="#444"
                  style={{
                    position: "absolute",
                    left: 13,
                    top: "50%",
                    transform: "translateY(-50%)",
                    pointerEvents: "none",
                  }}
                />
                <input
                  type={showPw ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  style={{
                    width: "100%",
                    background: "#1a1a1a",
                    border: "1.5px solid #222",
                    borderRadius: 11,
                    padding: "11px 40px 11px 36px",
                    fontSize: 14,
                    color: "#fff",
                    outline: "none",
                    fontFamily: "inherit",
                    transition: "border .15s",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#f97316")}
                  onBlur={(e) => (e.target.style.borderColor = "#222")}
                />
                <button
                  onClick={() => setShowPw((s) => !s)}
                  style={{
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#444",
                    padding: 2,
                    display: "flex",
                  }}
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div
                style={{
                  background: "rgba(220,38,38,.1)",
                  border: "1px solid rgba(220,38,38,.3)",
                  borderRadius: 10,
                  padding: "10px 14px",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <AlertTriangle size={13} color="#dc2626" />
                <span
                  style={{ fontSize: 12, color: "#dc2626", fontWeight: 600 }}
                >
                  {error}
                </span>
              </div>
            )}

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                background: "#f97316",
                color: "#fff",
                border: "none",
                borderRadius: 12,
                padding: "13px",
                fontSize: 15,
                fontWeight: 800,
                cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "inherit",
                opacity: loading ? 0.7 : 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                transition: "opacity .15s",
              }}
            >
              {loading ? (
                <>
                  <RefreshCw
                    size={15}
                    style={{ animation: "spin .8s linear infinite" }}
                  />{" "}
                  {isRegister ? "Creating account..." : "Logging in..."}
                </>
              ) : isRegister ? (
                <>
                  <UserPlus size={15} /> Create Account
                </>
              ) : (
                <>
                  <LogIn size={15} /> Log In
                </>
              )}
            </button>

            {/* Switch */}
            <p style={{ textAlign: "center", fontSize: 13, color: "#444" }}>
              {isRegister ? "Already have an account? " : "No account yet? "}
              <button
                onClick={onSwitch}
                style={{
                  background: "none",
                  border: "none",
                  color: "#f97316",
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  fontSize: 13,
                }}
              >
                {isRegister ? "Log In" : "Create one free"}
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── PLG ONBOARDING STEPS ─────────────────────────────────────────────────────
const ONBOARD_STEPS = [
  {
    Icon: FolderOpen,
    color: "#f97316",
    title: "Create your first project",
    subtitle:
      "One project per client. This is how FreelanceFunds keeps everything separated.",
    cta: "Create it now →",
    value:
      "Your project appears on the dashboard instantly. Every expense you log will be tied to it.",
  },
  {
    Icon: Receipt,
    color: "#3b82f6",
    title: "Log your first expense",
    subtitle:
      "Any expense — even a small one. Use Smart Split if it covers multiple clients.",
    cta: "Log it now →",
    value: "You'll see a live tax savings estimate the moment you save it.",
  },
  {
    Icon: Banknote,
    color: "#10b981",
    title: "Log a client payment",
    subtitle:
      "Go to Income and log a payment. Set a due date to activate the payment reminder system.",
    cta: "Go to Income →",
    value: "Your Net Profit and Tax Set-Aside will calculate automatically.",
  },
  {
    Icon: Repeat,
    color: "#8b5cf6",
    title: "Set up a recurring expense",
    subtitle:
      "Adobe CC? Hosting? Internet? Set it once — it auto-logs every month so you never miss a deduction.",
    cta: "Set it up →",
    value: "Never forget a subscription deduction again.",
  },
  {
    Icon: Camera,
    color: "#8b5cf6",
    title: "Scan receipts to log instantly",
    subtitle:
      "In Expenses, tap 'Scan Receipt'. Upload a photo and Claude reads the amount and merchant automatically.",
    cta: "Try it →",
    value:
      "Never type a receipt manually again. Works on printed and digital receipts.",
  },
  {
    Icon: Trophy,
    color: "#f97316",
    title: "You're now a freelancer who manages money.",
    subtitle:
      "Income tracking, expense splitting, payment reminders, tax calculator, and BIR reports — all live.",
    cta: "Go to Dashboard →",
    value:
      "Check your Monthly Health Score to see where you stand financially right now.",
  },
];

// ── PLG: GUIDED ONBOARDING ────────────────────────────────────────────────────
function Onboarding({
  onDone,
  onCreateProject,
  onAddExpense,
  tk,
  projectsCount,
  expensesCount,
}) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (step === 0 && projectsCount > 0) setStep(1);
  }, [projectsCount]);
  useEffect(() => {
    if (step === 1 && expensesCount > 0) setStep(2);
  }, [expensesCount]);

  const cur = ONBOARD_STEPS[step];
  const Ic = cur.Icon;
  const isLast = step === ONBOARD_STEPS.length - 1;
  const total = ONBOARD_STEPS.length;

  const handleCta = () => {
    if (step === 0) {
      onDone();
      onCreateProject();
    } else if (step === 1) {
      onDone();
      onAddExpense();
    } else if (step === 2) {
      onDone();
      onLogIncome();
    } else if (step === 3) {
      onDone();
      onSetRecurring();
    } else if (step === 4) {
      onDone();
      onScanReceipt();
    } else onDone();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.9)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: 16,
        backdropFilter: "blur(16px)",
      }}
    >
      <div
        style={{
          background: tk.card,
          border: `1px solid ${tk.brd}`,
          borderRadius: 24,
          width: "100%",
          maxWidth: 440,
          overflow: "hidden",
          animation: "scaleIn .3s ease",
        }}
      >
        <div style={{ height: 4, background: tk.D ? "#1a1a1a" : "#f3f4f6" }}>
          <div
            style={{
              height: "100%",
              background: cur.color,
              width: `${((step + 1) / total) * 100}%`,
              transition: "width .5s ease",
            }}
          />
        </div>
        <div style={{ padding: "28px 28px 24px", textAlign: "center" }}>
          <div
            style={{
              display: "flex",
              gap: 6,
              justifyContent: "center",
              marginBottom: 20,
            }}
          >
            {ONBOARD_STEPS.map((_, i) => (
              <div
                key={i}
                style={{
                  width: i === step ? 24 : 7,
                  height: 7,
                  borderRadius: 4,
                  background:
                    i === step ? cur.color : i < step ? "#10b981" : tk.brd,
                  transition: "all .3s",
                }}
              />
            ))}
          </div>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 20,
              background: `${cur.color}15`,
              border: `2px solid ${cur.color}30`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 18px",
            }}
          >
            <Ic size={32} color={cur.color} />
          </div>
          <h2
            style={{
              fontFamily: "'Playfair Display',serif",
              fontSize: 22,
              color: tk.txt,
              marginBottom: 8,
              letterSpacing: "-0.02em",
            }}
          >
            {cur.title}
          </h2>
          <p
            style={{
              color: tk.muted,
              fontSize: 14,
              lineHeight: 1.75,
              marginBottom: 16,
            }}
          >
            {cur.subtitle}
          </p>
          <div
            style={{
              background: tk.D ? "#111" : "#f9fafb",
              border: `1px solid ${tk.brd}`,
              borderRadius: 12,
              padding: "12px 16px",
              marginBottom: 24,
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <CheckCircle2 size={15} color="#10b981" style={{ flexShrink: 0 }} />
            <p
              style={{
                fontSize: 12,
                color: tk.D ? "#86efac" : "#16a34a",
                fontWeight: 600,
                textAlign: "left",
              }}
            >
              {cur.value}
            </p>
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
            <button
              onClick={handleCta}
              style={{
                background: "#f97316",
                color: "#fff",
                border: "none",
                borderRadius: 12,
                padding: "13px 28px",
                fontSize: 14,
                fontWeight: 800,
                cursor: "pointer",
                fontFamily: "inherit",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              {cur.cta} <ChevronRight size={15} />
            </button>
            <button
              onClick={onDone}
              style={{
                background: "none",
                border: `1.5px solid ${tk.brd}`,
                color: tk.muted,
                borderRadius: 12,
                padding: "13px 16px",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Skip
            </button>
          </div>
        </div>
        <div
          style={{
            borderTop: `1px solid ${tk.brd}`,
            padding: "12px 24px",
            background: tk.D ? "#0d0d0d" : "#f9fafb",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <HelpCircle size={12} color={tk.muted} />
          <p style={{ fontSize: 11, color: tk.muted }}>
            Hover the sidebar and tap{" "}
            <strong style={{ color: tk.txt }}>Help</strong> to reopen this guide
            anytime
          </p>
        </div>
      </div>
    </div>
  );
}

// ── UPGRADE NUDGE ─────────────────────────────────────────────────────────────
function UpgradeNudge({ feature, onUpgrade, D, brd }) {
  return (
    <div
      style={{
        background: D ? "#1a0e00" : "#fff7ed",
        border: "1.5px dashed #f97316",
        borderRadius: 12,
        padding: "14px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        flexWrap: "wrap",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: "rgba(249,115,22,.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Lock size={14} color="#f97316" />
        </div>
        <div>
          <p
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "#f97316",
              marginBottom: 2,
            }}
          >
            Unlock {feature}
          </p>
          <p style={{ fontSize: 11, color: D ? "#d97706" : "#92400e" }}>
            Pro users get this + unlimited everything for ₱500/month
          </p>
        </div>
      </div>
      <button
        onClick={onUpgrade}
        style={{
          background: "#f97316",
          color: "#fff",
          border: "none",
          borderRadius: 9,
          padding: "8px 16px",
          fontSize: 12,
          fontWeight: 800,
          cursor: "pointer",
          fontFamily: "inherit",
          display: "flex",
          alignItems: "center",
          gap: 6,
          flexShrink: 0,
        }}
      >
        <Zap size={12} /> Upgrade
      </button>
    </div>
  );
}

// ── USER MANUAL ───────────────────────────────────────────────────────────────
const MANUAL_STEPS = [
  {
    Icon: FolderOpen,
    color: "#f97316",
    title: "Create a project",
    body: "Go to Projects and click '+ New Project'. One project per client. Add name, client, color, and an optional budget. All expenses and income tie back to this.",
    tip: "Name it after the deliverable — e.g. 'Logo Design · Acme Corp'",
  },
  {
    Icon: Receipt,
    color: "#3b82f6",
    title: "Log an expense",
    body: "Go to Expenses and click '+ Add'. Fill in description, amount, date, category. Use Smart Split to divide the cost across projects by percentage.",
    tip: "Hit Auto to split equally across all assigned projects instantly",
  },
  {
    Icon: Camera,
    color: "#f97316",
    title: "Scan a receipt",
    body: "In Expenses, click 'Scan Receipt'. Upload a photo — Claude AI reads the merchant, amount, date, and category automatically. Review then save.",
    tip: "Works best with clear, well-lit photos. You can edit any field before saving.",
  },
  {
    Icon: Repeat,
    color: "#8b5cf6",
    title: "Set recurring expenses",
    body: "Go to Expenses and click 'Recurring'. Add subscriptions like Adobe CC or hosting. Set the day of month they recur — they auto-log every month.",
    tip: "Set up your top 3 subscriptions first — these are the easiest to forget",
  },
  {
    Icon: Banknote,
    color: "#10b981",
    title: "Track income",
    body: "Go to Income and click 'Log Payment'. Enter amount, client, description, due date, and status (Pending / Paid / Overdue). Update status when a client pays.",
    tip: "Always set a due date — this activates the payment reminder system",
  },
  {
    Icon: Bell,
    color: "#ef4444",
    title: "Use payment reminders",
    body: "When a payment is overdue or due within 7 days, a Bell badge appears in the Income tab. Click it to see all alerts and copy a ready-made follow-up message.",
    tip: "Copy the follow-up message and send it on WhatsApp, email, or Messenger",
  },
  {
    Icon: TrendingUp,
    color: "#3b82f6",
    title: "Read the income forecast",
    body: "The Income tab shows 6 months of history plus 3 projected months based on your average and trend. Use it to plan ahead for slow months before they hit.",
    tip: "If the trend is down, build up your buffer goal this month",
  },
  {
    Icon: Shield,
    color: "#ec4899",
    title: "Use the tax calculator",
    body: "In the Income tab, set your tax rate (default 20%). It shows how much to set aside, what's available to spend, and your net profit after expenses.",
    tip: "Ask your accountant for your actual effective rate and update it here once",
  },
  {
    Icon: PiggyBank,
    color: "#3b82f6",
    title: "Set your buffer goal",
    body: "In the Income tab, pick a 1–6 month slow-month buffer target. The progress bar shows how close you are. Aim for at least 2 months of average expenses.",
    tip: "Even a 1-month buffer changes how you feel about slow months",
  },
  {
    Icon: Target,
    color: "#f97316",
    title: "Set financial goals",
    body: "Go to Income and find Financial Goals. Add targets like 'New Laptop' or 'Emergency Fund'. Update your saved amount monthly to track progress.",
    tip: "Set one small achievable goal first to build the habit",
  },
  {
    Icon: Users2,
    color: "#a855f7",
    title: "Add clients",
    body: "Go to the Clients tab. Add email, payment terms, and notes per client. See total billed, paid, outstanding balance, and net profit per client.",
    tip: "Add clients before creating projects so you can link them easily",
  },
  {
    Icon: UserCheck,
    color: "#3b82f6",
    title: "Invite team members",
    body: "Go to the Team tab. Invite your accountant or VA with Viewer, Editor, or Accountant access. Copy their invite link — they see only what their role allows.",
    tip: "Accountant role gives full tax report access without changing your settings",
  },
  {
    Icon: LayoutDashboard,
    color: "#10b981",
    title: "Read your health score",
    body: "The Dashboard shows a Monthly Health Score (0-100) based on income ratio, tax set-aside, and buffer progress. Below 60 means something needs attention.",
    tip: "Check your score every Monday — it takes 10 seconds and tells you everything",
  },
  {
    Icon: FileBarChart2,
    color: "#ec4899",
    title: "Export tax reports",
    body: "Go to Reports for a full BIR-ready breakdown by project and category. Export CSV free, or upgrade to Pro for PDF. Export at end of every quarter.",
    tip: "Save each quarter's export in a folder labelled by year — your accountant will love you",
  },
];
function UserManual({ onClose, tk }) {
  const [step, setStep] = useState(0);
  const cur = MANUAL_STEPS[step];
  const Ic = cur.Icon;
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.8)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 900,
        padding: 16,
        backdropFilter: "blur(12px)",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: tk.card,
          border: `1px solid ${tk.brd}`,
          borderRadius: 24,
          width: "100%",
          maxWidth: 540,
          boxShadow: "0 40px 80px rgba(0,0,0,.6)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            background: tk.D ? "#111" : "#f9fafb",
            padding: "16px 24px 0",
            borderBottom: `1px solid ${tk.brd}`,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <BookOpen size={16} color="#f97316" />
              <span style={{ fontWeight: 800, fontSize: 14, color: tk.txt }}>
                User Manual
              </span>
              <span
                style={{
                  background: "#f97316",
                  color: "#fff",
                  borderRadius: 20,
                  padding: "2px 9px",
                  fontSize: 10,
                  fontWeight: 800,
                }}
              >
                {step + 1}/{MANUAL_STEPS.length}
              </span>
            </div>
            <button
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: tk.muted,
                display: "flex",
              }}
            >
              <X size={16} />
            </button>
          </div>
          <div
            style={{
              height: 3,
              background: tk.D ? "#222" : "#e5e7eb",
              borderRadius: 2,
            }}
          >
            <div
              style={{
                height: "100%",
                background: cur.color,
                width: `${((step + 1) / MANUAL_STEPS.length) * 100}%`,
                transition: "width .4s",
              }}
            />
          </div>
        </div>
        <div
          style={{
            display: "flex",
            gap: 6,
            justifyContent: "center",
            padding: "14px 24px 0",
          }}
        >
          {MANUAL_STEPS.map((s, i) => {
            const DotIc = s.Icon;
            return (
              <button
                key={i}
                onClick={() => setStep(i)}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: "50%",
                  cursor: "pointer",
                  border: `2px solid ${
                    i === step ? s.color : i < step ? "#10b981" : tk.brd
                  }`,
                  background: i === step ? `${s.color}18` : "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {i < step ? (
                  <Check size={11} color="#10b981" />
                ) : (
                  <DotIc size={11} color={i === step ? s.color : tk.muted} />
                )}
              </button>
            );
          })}
        </div>
        <div style={{ padding: "18px 24px" }}>
          <div style={{ display: "flex", gap: 14, marginBottom: 14 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 13,
                background: `${cur.color}15`,
                border: `2px solid ${cur.color}30`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Ic size={20} color={cur.color} />
            </div>
            <div>
              <h3
                style={{
                  fontSize: 18,
                  fontWeight: 800,
                  color: tk.txt,
                  marginBottom: 7,
                  letterSpacing: "-0.02em",
                }}
              >
                {cur.title}
              </h3>
              <p style={{ fontSize: 13, color: tk.muted, lineHeight: 1.85 }}>
                {cur.body}
              </p>
            </div>
          </div>
          <div
            style={{
              background: tk.D ? "#1a1200" : "#fffbeb",
              border: `1px solid ${tk.D ? "#3a2800" : "#fed7aa"}`,
              borderRadius: 10,
              padding: "10px 13px",
              display: "flex",
              gap: 8,
              alignItems: "flex-start",
              marginBottom: 18,
            }}
          >
            <Sparkles
              size={12}
              color="#f97316"
              style={{ flexShrink: 0, marginTop: 2 }}
            />
            <p
              style={{
                fontSize: 12,
                color: tk.D ? "#d97706" : "#92400e",
                lineHeight: 1.75,
              }}
            >
              {cur.tip}
            </p>
          </div>
          <div
            style={{
              display: "flex",
              gap: 10,
              justifyContent: "space-between",
            }}
          >
            <button
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                background: "none",
                border: `1.5px solid ${tk.brd}`,
                color: step === 0 ? tk.muted : tk.txt,
                borderRadius: 10,
                padding: "8px 14px",
                fontSize: 13,
                fontWeight: 700,
                cursor: step === 0 ? "not-allowed" : "pointer",
                fontFamily: "inherit",
                opacity: step === 0 ? 0.4 : 1,
              }}
            >
              <ChevronLeft size={13} /> Prev
            </button>
            {step < MANUAL_STEPS.length - 1 ? (
              <button
                onClick={() => setStep((s) => s + 1)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  background: "#f97316",
                  border: "none",
                  color: "#fff",
                  borderRadius: 10,
                  padding: "8px 14px",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Next <ChevronRight size={13} />
              </button>
            ) : (
              <button
                onClick={onClose}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  background: "#f97316",
                  border: "none",
                  color: "#fff",
                  borderRadius: 10,
                  padding: "8px 14px",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                <CheckCircle2 size={13} /> Got it!
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── SHARE CARD ────────────────────────────────────────────────────────────────
function ShareCard({ grandTotal, estSavings, projects, onClose, tk }) {
  const [copied, setCopied] = useState(false);
  const text = `I tracked ${fmt(
    grandTotal
  )} in expenses this quarter and estimated ${fmt(
    estSavings
  )} in tax savings using FreelanceFunds — the expense tracker built for Filipino freelancers. Try it free: freelancefunds.app`;
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 800,
        padding: 16,
        backdropFilter: "blur(10px)",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: tk.card,
          border: `1px solid ${tk.brd}`,
          borderRadius: 22,
          width: "100%",
          maxWidth: 400,
          overflow: "hidden",
        }}
      >
        <div
          style={{ background: "#111", padding: "20px 24px", color: "#fff" }}
        >
          <p
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: "rgba(255,255,255,.4)",
              textTransform: "uppercase",
              letterSpacing: ".1em",
              marginBottom: 6,
            }}
          >
            My FreelanceFunds Report
          </p>
          <p
            style={{
              fontFamily: "'Playfair Display',serif",
              fontSize: 32,
              letterSpacing: "-0.03em",
              marginBottom: 4,
            }}
          >
            {fmt(grandTotal)}
          </p>
          <p style={{ fontSize: 13, color: "#86efac", fontWeight: 700 }}>
            Est. {fmt(estSavings)} in tax savings
          </p>
        </div>
        <div style={{ padding: "18px 24px" }}>
          <div
            style={{
              background: tk.D ? "#1a1a1a" : "#f9fafb",
              border: `1px solid ${tk.brd}`,
              borderRadius: 10,
              padding: "12px 14px",
              marginBottom: 14,
            }}
          >
            <p style={{ fontSize: 12, color: tk.muted, lineHeight: 1.7 }}>
              {text}
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => {
                navigator.clipboard.writeText(text).catch(() => {});
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              style={{
                flex: 1,
                background: copied ? "#10b981" : "#f97316",
                color: "#fff",
                border: "none",
                borderRadius: 10,
                padding: 10,
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "inherit",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 7,
              }}
            >
              {copied ? (
                <>
                  <CheckCircle2 size={13} /> Copied!
                </>
              ) : (
                <>
                  <Share2 size={13} /> Copy to share
                </>
              )}
            </button>
            <button
              onClick={onClose}
              style={{
                background: tk.D ? "#1e1e1e" : "#f3f4f6",
                color: tk.muted,
                border: "none",
                borderRadius: 10,
                padding: "10px 14px",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── MAIN APP ──────────────────────────────────────────────────────────────────
function FreelanceFundsApp({ user, signOut }) {
  const {
    expenses,
    projects,
    loading,
    dbError,
    addProject,
    removeProject,
    addExpense,
    updateExpense,
    removeExpense,
  } = useData(user.id);
  const [dark, setDark] = useLS("ff_dark", true);
  const [seenOb, setSeenOb] = useLS(`ff_ob_${user.id}`, false);
  const [plan, setPlan] = useLS(`ff_plan_${user.id}`, "free");
  const [income, setIncome] = useLS(`ff_income_${user.id}`, []); // [{id,amount,client,desc,date,status}]
  const [taxRate, setTaxRate] = useLS(`ff_taxrate_${user.id}`, 20);
  const [savingsGoal, setSavingsGoal] = useLS(`ff_savings_${user.id}`, 0);
  const [incModal, setIncModal] = useState(false);
  const [incForm, setIncForm] = useState({
    amount: "",
    client: "",
    desc: "",
    date: new Date().toISOString().split("T")[0],
    status: "pending",
    dueDate: "",
  });
  const [recurring, setRecurring] = useLS(`ff_recurring_${user.id}`, []); // [{id,desc,amount,category,splits,dayOfMonth}]
  const [recModal, setRecModal] = useState(false);
  const [recForm, setRecForm] = useState({
    desc: "",
    amount: "",
    category: "Software",
    dayOfMonth: "1",
    splits: [{ pid: "", pct: 100 }],
  });
  const [clients, setClients] = useLS(`ff_clients_${user.id}`, []); // [{id,name,email,terms,notes}]
  const [clModal, setClModal] = useState(false);
  const [clForm, setClForm] = useState({
    name: "",
    email: "",
    terms: "30",
    notes: "",
  });
  const [goals, setGoals] = useLS(`ff_goals_${user.id}`, []); // [{id,label,target,saved}]
  const [goalModal, setGoalModal] = useState(false);
  const [goalForm, setGoalForm] = useState({ label: "", target: "" });
  const [activeTab2, setActiveTab2] = useState("log");
  const [showReminders, setShowReminders] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [scanModal, setScanModal] = useState(false);
  const [scanLoading, setScanLoading] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [teamMembers, setTeamMembers] = useLS(`ff_team_${user.id}`, []);
  const [teamModal, setTeamModal] = useState(false);
  const [teamForm, setTeamForm] = useState({
    name: "",
    email: "",
    role: "viewer",
  });
  const [forecastTab, setForecastTab] = useState(false);
  const [tab, setTab] = useState("dashboard");
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState("");
  const [fPid, setFPid] = useState("all");
  const [fCat, setFCat] = useState("all");
  const [sortBy, setSortBy] = useState("date-desc");
  const [editId, setEditId] = useState(null);
  const [delId, setDelId] = useState(null);
  const [showPlan, setShowPlan] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [saving, setSaving] = useState(false);

  const { isMobile, isTablet } = useBreakpoint();
  const isSmall = isMobile || isTablet;
  const isPro = plan === "pro";
  const maxExp = isPro ? Infinity : FREE_EXP;
  const maxProj = isPro ? Infinity : FREE_PROJ;
  const maxSpl = isPro ? 4 : 2;

  const D = dark;
  const bg = D ? "#0b0b0b" : "#f4f3ef";
  const card = D ? "#141414" : "#ffffff";
  const brd = D ? "#222" : "#e5e7eb";
  const txt = D ? "#e5e5e5" : "#111111";
  const muted = D ? "#555" : "#9ca3af";
  const inp = D ? "#1a1a1a" : "#ffffff";
  const tk = { D, bg, card, brd, txt, muted };

  const [form, setForm] = useState({
    description: "",
    amount: "",
    category: "Software",
    date: new Date().toISOString().split("T")[0],
    splits: [{ pid: "", pct: 100 }],
    notes: "",
  });
  const [pForm, setPForm] = useState({
    name: "",
    client: "",
    color: "#f97316",
    budget: "",
  });
  const [splErr, setSplErr] = useState("");

  const totalPct = form.splits.reduce((s, x) => s + Number(x.pct), 0);
  const grandTotal = expenses.reduce((s, e) => s + e.amount, 0);
  const totalIncome = income.reduce((s, i) => s + Number(i.amount), 0);
  const paidIncome = income
    .filter((i) => i.status === "paid")
    .reduce((s, i) => s + Number(i.amount), 0);
  const pendingIncome = income
    .filter((i) => i.status === "pending")
    .reduce((s, i) => s + Number(i.amount), 0);
  const overdueIncome = income
    .filter((i) => i.status === "overdue")
    .reduce((s, i) => s + Number(i.amount), 0);
  const netProfit = paidIncome - grandTotal;
  const taxSetAside = Math.round(paidIncome * (taxRate / 100));
  // Health score: income ratio 40pts + tax set-aside 30pts + buffer 30pts
  const monthlyAvgExp =
    grandTotal /
    Math.max(1, new Set(expenses.map((e) => e.date.slice(0, 7))).size);
  const incomeRatio =
    paidIncome > 0
      ? Math.min(40, Math.round((paidIncome / (grandTotal || 1)) * 20))
      : 0;
  const taxScore = paidIncome > 0 ? (taxSetAside > 0 ? 30 : 0) : 0;
  const bufScore =
    savingsGoal > 0
      ? Math.min(30, Math.round((paidIncome / savingsGoal) * 30))
      : 0;
  const healthScore = Math.min(100, incomeRatio + taxScore + bufScore);
  const healthLabel =
    healthScore >= 80
      ? "Excellent"
      : healthScore >= 60
      ? "Good"
      : healthScore >= 40
      ? "Fair"
      : "Needs work";
  const healthColor =
    healthScore >= 80
      ? "#10b981"
      : healthScore >= 60
      ? "#3b82f6"
      : healthScore >= 40
      ? "#f97316"
      : "#ef4444";
  const addRecurring = (f) =>
    setRecurring((p) => [
      ...p,
      { ...f, id: Date.now().toString(), amount: Number(f.amount) },
    ]);
  const addClient = (f) =>
    setClients((p) => [...p, { ...f, id: Date.now().toString() }]);
  const addGoal = (f) =>
    setGoals((p) => [
      ...p,
      { ...f, id: Date.now().toString(), target: Number(f.target), saved: 0 },
    ]);
  const updateGoal = (id, saved) =>
    setGoals((p) =>
      p.map((g) => (g.id === id ? { ...g, saved: Number(saved) } : g))
    );
  const removeGoal = (id) => setGoals((p) => p.filter((g) => g.id !== id));
  const overduePayments = income.filter((i) => i.status === "overdue");
  const today = new Date().toISOString().split("T")[0];

  // Payment reminder logic — payments with due dates
  const dueSoonPayments = income.filter((i) => {
    if (i.status !== "pending" || !i.dueDate) return false;
    const days = Math.ceil((new Date(i.dueDate) - new Date()) / 864e5);
    return days >= 0 && days <= 7;
  });
  const pastDueUnpaid = income.filter((i) => {
    if (i.status !== "pending" || !i.dueDate) return false;
    return new Date(i.dueDate) < new Date();
  });
  const allAlerts = [
    ...new Map(
      [...overduePayments, ...pastDueUnpaid, ...dueSoonPayments].map((i) => [
        i.id,
        i,
      ])
    ).values(),
  ];

  // Income forecast — simple 3-month linear projection from past data
  const monthlyIncome = (() => {
    const map = {};
    income
      .filter((i) => i.status === "paid")
      .forEach((i) => {
        const m = i.date?.slice(0, 7);
        if (m) map[m] = (map[m] || 0) + Number(i.amount);
      });
    return map;
  })();
  const monthlyExpMap = (() => {
    const map = {};
    expenses.forEach((e) => {
      const m = e.date?.slice(0, 7);
      if (m) map[m] = (map[m] || 0) + e.amount;
    });
    return map;
  })();
  const last6months = (() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      months.push(d.toISOString().slice(0, 7));
    }
    return months;
  })();
  const incVals = last6months.map((m) => monthlyIncome[m] || 0);
  const avgIncome =
    incVals.reduce((s, v) => s + v, 0) /
    Math.max(1, incVals.filter((v) => v > 0).length);
  const trend =
    incVals.length >= 2
      ? (incVals[incVals.length - 1] - incVals[0]) /
        Math.max(1, incVals.length - 1)
      : 0;
  const next3 = [1, 2, 3].map((i) => ({
    month: (() => {
      const d = new Date();
      d.setMonth(d.getMonth() + i);
      return d.toISOString().slice(0, 7);
    })(),
    projected: Math.max(0, Math.round(avgIncome + trend * i)),
  }));

  // Follow-up message generator
  const genFollowUp = (inc) => {
    const daysLate = inc.dueDate
      ? Math.ceil((new Date() - new Date(inc.dueDate)) / 864e5)
      : null;
    return `Hi ${inc.client},

I hope you're doing well! I wanted to follow up on the payment for "${
      inc.desc || "our recent project"
    }".

Amount due: ₱${Number(inc.amount).toLocaleString("en-PH")}
Invoice date: ${inc.date}${
      inc.dueDate
        ? `
Due date: ${inc.dueDate}`
        : ""
    }
${
  daysLate && daysLate > 0
    ? `
This payment is now ${daysLate} day${daysLate !== 1 ? "s" : ""} overdue.
`
    : ""
}
Please let me know if you have any questions. I'd appreciate your prompt attention to this.

Thank you!
${user.email}`;
  };
  const addIncome = (f) => {
    const rec = { ...f, id: Date.now().toString(), amount: Number(f.amount) };
    setIncome((p) => [rec, ...p]);
  };
  const removeIncome = (id) => setIncome((p) => p.filter((i) => i.id !== id));
  const updateIncomeStatus = (id, status) =>
    setIncome((p) => p.map((i) => (i.id === id ? { ...i, status } : i)));
  const estSavings = Math.round(grandTotal * 0.2);
  const projTotals = Object.fromEntries(projects.map((p) => [p.id, 0]));
  expenses.forEach((e) =>
    e.splits.forEach((s) => {
      projTotals[s.pid] = (projTotals[s.pid] || 0) + (e.amount * s.pct) / 100;
    })
  );
  const catTotals = {};
  expenses.forEach((e) => {
    catTotals[e.category] = (catTotals[e.category] || 0) + e.amount;
  });
  const monthly = (() => {
    const labs = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
    const vals = Array(12).fill(0);
    expenses.forEach((e) => {
      vals[new Date(e.date).getMonth()] += e.amount;
    });
    return labs.map((label, i) => ({
      label,
      val: vals[i],
      highlight: vals[i] === Math.max(...vals) && vals[i] > 0,
    }));
  })();
  const sorted = [...expenses]
    .filter((e) => {
      if (fPid !== "all" && !e.splits.some((s) => s.pid === fPid)) return false;
      if (fCat !== "all" && e.category !== fCat) return false;
      if (search && !e.description.toLowerCase().includes(search.toLowerCase()))
        return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "date-desc") return new Date(b.date) - new Date(a.date);
      if (sortBy === "date-asc") return new Date(a.date) - new Date(b.date);
      if (sortBy === "amount-desc") return b.amount - a.amount;
      if (sortBy === "amount-asc") return a.amount - b.amount;
      return 0;
    });

  const showToast = useCallback((msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2800);
  }, []);

  const openAdd = () => {
    if (expenses.length >= maxExp) {
      showToast(`Free plan: max ${maxExp} expenses`, "warning");
      setShowPlan(true);
      return;
    }
    setEditId(null);
    setForm({
      description: "",
      amount: "",
      category: "Software",
      date: new Date().toISOString().split("T")[0],
      splits: [{ pid: projects[0]?.id || "", pct: 100 }],
      notes: "",
    });
    setSplErr("");
    setModal("expense");
  };
  const openEdit = (e) => {
    setEditId(e.id);
    setForm({
      description: e.description,
      amount: String(e.amount),
      category: e.category,
      date: e.date,
      splits: [...e.splits],
      notes: e.notes || "",
    });
    setSplErr("");
    setModal("expense");
  };
  const saveExpense = async () => {
    if (!form.description.trim() || !form.amount) {
      showToast("Fill in description and amount", "error");
      return;
    }
    if (totalPct !== 100) {
      setSplErr("Splits must total exactly 100%");
      return;
    }
    setSplErr("");
    setSaving(true);
    try {
      if (editId) {
        await updateExpense(editId, form);
        showToast("Expense updated");
      } else {
        await addExpense(form);
        showToast("Expense saved — split applied!");
      }
      setModal(null);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSaving(false);
    }
  };
  const confirmDelete = async () => {
    try {
      await removeExpense(delId);
      setDelId(null);
      showToast("Expense deleted");
    } catch (err) {
      showToast(err.message, "error");
    }
  };
  const autoSplit = () => {
    const n = form.splits.length,
      base = Math.floor(100 / n),
      rem = 100 - base * n;
    setForm((f) => ({
      ...f,
      splits: f.splits.map((s, i) => ({
        ...s,
        pct: i === 0 ? base + rem : base,
      })),
    }));
  };
  const saveProject = async () => {
    if (!pForm.name.trim()) {
      showToast("Project name required", "error");
      return;
    }
    if (projects.length >= maxProj) {
      showToast(`You've hit the free limit. Upgrade to add more.`, "warning");
      setShowPlan(true);
      setModal(null);
      return;
    }
    setSaving(true);
    try {
      await addProject(pForm);
      setPForm({ name: "", client: "", color: "#f97316", budget: "" });
      setModal(null);
      showToast("Project created!");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSaving(false);
    }
  };
  const handleRemoveProject = async (pid) => {
    if (expenses.some((e) => e.splits.some((s) => s.pid === pid))) {
      showToast("Remove linked expenses first", "warning");
      return;
    }
    try {
      await removeProject(pid);
      showToast("Project removed");
    } catch (err) {
      showToast(err.message, "error");
    }
  };
  const exportCSV = () => {
    const rows = [
      [
        "Date",
        "Description",
        "Category",
        "Amount",
        "Notes",
        "Project",
        "Split%",
        "Project Amount",
      ],
    ];
    expenses.forEach((e) =>
      e.splits.forEach((s) => {
        rows.push([
          e.date,
          `"${e.description}"`,
          e.category,
          e.amount,
          `"${e.notes || ""}"`,
          `"${pNm(projects, s.pid)}"`,
          s.pct,
          Math.round((e.amount * s.pct) / 100),
        ]);
      })
    );
    const a = document.createElement("a");
    a.href =
      "data:text/csv;charset=utf-8," +
      encodeURIComponent(rows.map((r) => r.join(",")).join("\n"));
    a.download = "freelancefunds-export.csv";
    a.click();
    showToast("CSV exported — BIR-ready!");
  };

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const SB = isMobile ? 0 : sidebarOpen ? 220 : 60;
  const nearLimit =
    !isPro &&
    (expenses.length / FREE_EXP >= 0.7 || projects.length / FREE_PROJ >= 0.7);

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    html,body{overflow-x:hidden;max-width:100vw;-webkit-font-smoothing:antialiased}
    @keyframes toastIn{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
    @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
    @keyframes scaleIn{from{opacity:0;transform:scale(.96)}to{opacity:1;transform:scale(1)}}
    @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:.6}}
    @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
    @keyframes floatUp{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
    .fade-up{animation:fadeUp .4s cubic-bezier(.16,1,.3,1) both}
    .fade-up-1{animation:fadeUp .4s .05s cubic-bezier(.16,1,.3,1) both}
    .fade-up-2{animation:fadeUp .4s .1s cubic-bezier(.16,1,.3,1) both}
    .fade-up-3{animation:fadeUp .4s .15s cubic-bezier(.16,1,.3,1) both}
    .scale-in{animation:scaleIn .25s ease both}
    .btn{display:inline-flex;align-items:center;gap:6px;border:none;border-radius:10px;padding:9px 15px;font-family:inherit;font-size:13px;font-weight:700;cursor:pointer;transition:all .15s;white-space:nowrap}
    .btn-ghost{background:${D ? "#1e1e1e" : "#f3f4f6"};color:${
    D ? "#888" : "#374151"
  }}
    .btn-ghost:hover{background:${D ? "#282828" : "#e5e7eb"}}
    .btn-primary{background:#f97316;color:#fff;box-shadow:0 2px 12px rgba(249,115,22,.35)}
    .btn-primary:hover{background:#ea6c0a;transform:translateY(-1px);box-shadow:0 4px 18px rgba(249,115,22,.45)}
    .btn-danger{background:${D ? "#2a1010" : "#fee2e2"};color:#dc2626}
    .btn-pro{background:linear-gradient(135deg,#f97316,#ea580c);color:#fff;box-shadow:0 4px 14px rgba(249,115,22,.4)}
    .btn-share{background:${
      D ? "#0d2015" : "#f0fdf4"
    };color:#16a34a;border:1.5px solid ${D ? "#1a4a2a" : "#bbf7d0"}}
    .input{width:100%;border:1.5px solid ${brd};border-radius:10px;padding:10px 14px;font-family:inherit;font-size:14px;outline:none;background:${inp};color:${txt};transition:border .15s}
    .input:focus{border-color:#f97316;box-shadow:0 0 0 3px rgba(249,115,22,.12)}
    select.input{appearance:none}
    textarea.input{resize:vertical;min-height:68px;line-height:1.6}
    .lbl{display:block;font-size:10px;font-weight:800;color:${muted};text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px}
    .card{background:${card};border-radius:18px;border:1px solid ${brd};transition:all .2s}
    .card:hover{border-color:${
      D ? "rgba(249,115,22,.2)" : "rgba(249,115,22,.15)"
    };box-shadow:0 4px 24px rgba(0,0,0,${D ? 0.2 : 0.06})}
    .stat-card{background:${card};border-radius:16px;border:1px solid ${brd};padding:${
    isMobile ? "14px" : "20px"
  };position:relative;overflow:hidden;transition:all .2s}
    .stat-card:hover{transform:translateY(-2px);box-shadow:0 8px 32px rgba(0,0,0,${
      D ? 0.25 : 0.08
    })}
    .stat-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,#f97316,#ea580c);opacity:0;transition:opacity .2s}
    .stat-card:hover::before{opacity:1}
    .row{border-radius:14px;padding:14px 16px;border:1px solid ${
      D ? "#1e1e1e" : "#f0f0f0"
    };background:${card};transition:all .18s;cursor:pointer}
    .row:hover{border-color:${
      D ? "rgba(249,115,22,.25)" : "rgba(249,115,22,.2)"
    };box-shadow:0 6px 20px rgba(0,0,0,${
    D ? 0.2 : 0.06
  });transform:translateY(-1px)}
    .overlay{position:fixed;inset:0;background:rgba(0,0,0,.65);display:flex;align-items:center;justify-content:center;z-index:600;padding:16px;backdrop-filter:blur(12px)}
    .modal{background:${card};border-radius:24px;padding:24px;width:100%;max-width:520px;max-height:92vh;overflow-y:auto;border:1px solid ${brd};box-shadow:0 24px 60px rgba(0,0,0,.4)}
    .tab-btn{background:none;border:none;cursor:pointer;padding:8px 14px;border-radius:9px;font-family:inherit;font-size:13px;font-weight:700;color:${muted};transition:all .15s;display:flex;align-items:center;gap:7px;white-space:nowrap}
    .tab-btn:hover{color:${txt};background:${
    D ? "rgba(255,255,255,.06)" : "rgba(0,0,0,.05)"
  }}
    .tab-btn.active{background:#f97316;color:#fff;box-shadow:0 2px 10px rgba(249,115,22,.35)}
    .mob-tab{display:flex;flex-direction:column;align-items:center;gap:4px;background:none;border:none;cursor:pointer;padding:8px 0 10px;font-family:inherit;font-size:9px;font-weight:800;color:${muted};transition:all .2s;flex:1;letter-spacing:.03em;text-transform:uppercase;position:relative}
    .mob-tab.active{color:#f97316}
    .mob-tab.active::before{content:'';position:absolute;top:0;left:50%;transform:translateX(-50%);width:32px;height:2px;background:#f97316;border-radius:0 0 3px 3px}
    .mob-tab-icon{width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;transition:all .2s;background:transparent}
    .mob-tab.active .mob-tab-icon{background:rgba(249,115,22,.12)}
    .prog{height:5px;background:${
      D ? "#1f1f1f" : "#f3f4f6"
    };border-radius:3px;overflow:hidden}
    .prog-bar{height:100%;border-radius:3px;transition:width .8s cubic-bezier(.4,0,.2,1)}
    .split-row{display:flex;gap:8px;align-items:center;padding:8px;background:${
      D ? "#1a1a1a" : "#f9fafb"
    };border-radius:10px;border:1px solid ${brd};flex-wrap:wrap}
    .color-swatch{width:26px;height:26px;border-radius:50%;cursor:pointer;transition:transform .15s;flex-shrink:0}
    .color-swatch:hover{transform:scale(1.18)}
    .color-swatch.sel{box-shadow:0 0 0 3px ${
      D ? "#fff" : "#111"
    },0 0 0 5px transparent;transform:scale(1.1)}
    .badge-pro{background:linear-gradient(135deg,#f97316,#ea580c);color:#fff;border-radius:7px;padding:3px 9px;font-size:10px;font-weight:800;box-shadow:0 2px 8px rgba(249,115,22,.3)}
    .badge-free{background:${
      D ? "#1e1e1e" : "#f3f4f6"
    };color:${muted};border-radius:7px;padding:3px 9px;font-size:10px;font-weight:800;border:1px solid ${brd}}
    .badge-db{background:linear-gradient(135deg,#059669,#10b981);color:#fff;border-radius:7px;padding:3px 9px;font-size:10px;font-weight:800;display:inline-flex;align-items:center;gap:4px;box-shadow:0 2px 8px rgba(16,185,129,.25)}
    .limit-bar{height:4px;border-radius:2px;overflow:hidden;background:${
      D ? "#222" : "#f3f4f6"
    };margin-top:4px}
    .pulse{animation:pulse 2s ease-in-out infinite}
    .glow-orange{box-shadow:0 0 0 1px rgba(249,115,22,.2),0 4px 20px rgba(249,115,22,.15)}
    @media(max-width:480px){.modal{padding:16px;border-radius:20px}}
  `;

  const navItems = [
    { id: "dashboard", Icon: LayoutDashboard, label: "Dashboard" },
    { id: "income", Icon: Banknote, label: "Income" },
    { id: "expenses", Icon: Receipt, label: "Expenses" },
    { id: "projects", Icon: FolderOpen, label: "Projects" },
    { id: "clients", Icon: Users2, label: "Clients" },
    { id: "team", Icon: UserCheck, label: "Team" },
    { id: "reports", Icon: FileBarChart2, label: "Reports" },
  ];

  if (dbError)
    return (
      <div
        style={{
          fontFamily: "sans-serif",
          background: "#0d0d0d",
          minHeight: "100vh",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          textAlign: "center",
        }}
      >
        <div>
          <Database size={44} color="#f97316" style={{ marginBottom: 16 }} />
          <h2 style={{ fontSize: 22, marginBottom: 10 }}>Database Error</h2>
          <p style={{ color: "#555", fontSize: 13 }}>{dbError}</p>
        </div>
      </div>
    );

  if (loading)
    return (
      <div
        style={{
          background: D ? "#0d0d0d" : "#f4f3ef",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
        <div
          style={{
            width: 40,
            height: 40,
            border: "3px solid #222",
            borderTopColor: "#f97316",
            borderRadius: "50%",
            animation: "spin .8s linear infinite",
          }}
        />
      </div>
    );

  return (
    <div
      style={{
        fontFamily: "'Plus Jakarta Sans',sans-serif",
        background: bg,
        minHeight: "100vh",
        color: txt,
        overflowX: "hidden",
        display: "flex",
      }}
    >
      <style>{css}</style>
      {toast && <Toast msg={toast.msg} type={toast.type} />}
      {/* PLG: Onboarding modal — first login only */}
      {!seenOb && (
        <Onboarding
          onDone={() => setSeenOb(true)}
          onCreateProject={() => {
            setModal("project");
            setPForm({ name: "", client: "", color: "#f97316", budget: "" });
          }}
          onAddExpense={openAdd}
          onLogIncome={() => {
            setTab("income");
            setIncForm({
              amount: "",
              client: "",
              desc: "",
              date: new Date().toISOString().split("T")[0],
              status: "pending",
              dueDate: "",
            });
            setIncModal(true);
          }}
          onSetRecurring={() => {
            setTab("expenses");
            setRecModal(true);
          }}
          onScanReceipt={() => {
            setTab("expenses");
            setScanModal(true);
          }}
          tk={tk}
          projectsCount={projects.length}
          expensesCount={expenses.length}
        />
      )}
      {showManual && (
        <UserManual onClose={() => setShowManual(false)} tk={tk} />
      )}
      {showShare && (
        <ShareCard
          grandTotal={grandTotal}
          estSavings={estSavings}
          projects={projects}
          onClose={() => setShowShare(false)}
          tk={tk}
        />
      )}

      {delId && (
        <div className="overlay">
          <div
            className="modal scale-in"
            style={{ maxWidth: 320, textAlign: "center" }}
          >
            <Trash2 size={36} color="#dc2626" style={{ marginBottom: 12 }} />
            <h3
              style={{
                fontSize: 17,
                fontWeight: 800,
                marginBottom: 8,
                color: txt,
              }}
            >
              Delete this expense?
            </h3>
            <p style={{ color: muted, fontSize: 13, marginBottom: 22 }}>
              This cannot be undone.
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button className="btn btn-danger" onClick={confirmDelete}>
                <Trash2 size={13} /> Delete
              </button>
              <button className="btn btn-ghost" onClick={() => setDelId(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showPlan && (
        <div
          className="overlay"
          onClick={(e) => e.target === e.currentTarget && setShowPlan(false)}
        >
          <div
            className="modal scale-in"
            style={{ maxWidth: isMobile ? "100%" : 600 }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 8,
              }}
            >
              <div>
                <h2
                  style={{
                    fontFamily: "'Playfair Display',serif",
                    fontSize: 24,
                    color: txt,
                  }}
                >
                  {isPro ? "Manage your plan" : "Upgrade to Pro"}
                </h2>
                <p style={{ fontSize: 12, color: muted, marginTop: 3 }}>
                  Currently on{" "}
                  <strong
                    style={{
                      color: isPro ? "#f97316" : "#10b981",
                      fontWeight: 700,
                    }}
                  >
                    {isPro ? "Pro" : "Free"}
                  </strong>{" "}
                  plan
                </p>
              </div>
              <button
                className="btn btn-ghost"
                style={{ padding: "6px 10px", flexShrink: 0 }}
                onClick={() => setShowPlan(false)}
              >
                <X size={15} />
              </button>
            </div>
            <div
              style={{
                background: D ? "#111" : "#f9fafb",
                border: `1px solid ${brd}`,
                borderRadius: 12,
                padding: "14px 16px",
                marginBottom: 18,
              }}
            >
              <p
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: txt,
                  marginBottom: 10,
                }}
              >
                Your current usage
              </p>
              {[
                {
                  label: "Expenses",
                  used: expenses.length,
                  max: FREE_EXP,
                  color: "#f97316",
                },
                {
                  label: "Projects",
                  used: projects.length,
                  max: FREE_PROJ,
                  color: "#3b82f6",
                },
              ].map((u) => (
                <div key={u.label} style={{ marginBottom: 8 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 4,
                    }}
                  >
                    <span style={{ fontSize: 11, color: muted }}>
                      {u.label}
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: txt }}>
                      {u.used}
                      {isPro ? " (unlimited)" : `/${u.max}`}
                    </span>
                  </div>
                  {!isPro && (
                    <div className="limit-bar">
                      <div
                        style={{
                          height: "100%",
                          background: u.color,
                          width: `${Math.min(
                            100,
                            Math.round((u.used / u.max) * 100)
                          )}%`,
                          borderRadius: 2,
                          transition: "width .5s",
                        }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                gap: 14,
              }}
            >
              {[
                {
                  label: "Free",
                  price: "₱0",
                  sub: "forever",
                  feats: [
                    "50 expenses/month",
                    "3 projects",
                    "2-way split",
                    "CSV export",
                  ],
                  no: ["AI suggestions", "PDF reports", "4-way split"],
                  cur: plan === "free",
                },
                {
                  label: "Pro",
                  price: "₱500",
                  sub: "per month",
                  feats: [
                    "Unlimited expenses",
                    "Unlimited projects",
                    "4-way split",
                    "AI suggestions",
                    "PDF tax reports",
                    "Receipt uploads",
                  ],
                  no: [],
                  cur: plan === "pro",
                  popular: true,
                },
              ].map((p) => (
                <div
                  key={p.label}
                  style={{
                    border: `2px solid ${
                      p.cur ? (p.label === "Pro" ? "#f97316" : "#10b981") : brd
                    }`,
                    borderRadius: 18,
                    padding: 22,
                    position: "relative",
                    background: p.cur
                      ? D
                        ? p.label === "Pro"
                          ? "#1a0e00"
                          : "#0a150a"
                        : p.label === "Pro"
                        ? "#fff7ed"
                        : "#f0fdf4"
                      : D
                      ? "#1a1a1a"
                      : "#fafafa",
                  }}
                >
                  {p.cur && (
                    <div
                      style={{
                        position: "absolute",
                        top: -11,
                        left: "50%",
                        transform: "translateX(-50%)",
                        background: p.label === "Pro" ? "#f97316" : "#10b981",
                        color: "#fff",
                        fontSize: 10,
                        fontWeight: 800,
                        padding: "3px 12px",
                        borderRadius: 20,
                        whiteSpace: "nowrap",
                      }}
                    >
                      ✓ CURRENT PLAN
                    </div>
                  )}
                  {!p.cur && p.popular && (
                    <div
                      style={{
                        position: "absolute",
                        top: -11,
                        left: "50%",
                        transform: "translateX(-50%)",
                        background: "#f97316",
                        color: "#fff",
                        fontSize: 10,
                        fontWeight: 800,
                        padding: "3px 12px",
                        borderRadius: 20,
                        whiteSpace: "nowrap",
                      }}
                    >
                      MOST POPULAR
                    </div>
                  )}
                  <p
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      color: p.label === "Pro" ? "#f97316" : "#10b981",
                      letterSpacing: ".08em",
                      textTransform: "uppercase",
                      marginBottom: 8,
                    }}
                  >
                    {p.label}
                  </p>
                  <p
                    style={{
                      fontFamily: "'Playfair Display',serif",
                      fontSize: 32,
                      color: txt,
                      lineHeight: 1,
                      marginBottom: 4,
                    }}
                  >
                    {p.price}
                  </p>
                  <p style={{ fontSize: 12, color: muted, marginBottom: 14 }}>
                    {p.sub}
                  </p>
                  {p.feats.map((f) => (
                    <div
                      key={f}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 7,
                      }}
                    >
                      <Check
                        size={12}
                        color={p.label === "Pro" ? "#f97316" : "#10b981"}
                      />
                      <span style={{ fontSize: 12, color: txt }}>{f}</span>
                    </div>
                  ))}
                  {p.no.map((f) => (
                    <div
                      key={f}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 7,
                      }}
                    >
                      <X size={12} color={muted} />
                      <span
                        style={{
                          fontSize: 12,
                          color: muted,
                          textDecoration: "line-through",
                        }}
                      >
                        {f}
                      </span>
                    </div>
                  ))}
                  {p.cur ? (
                    <div
                      style={{
                        width: "100%",
                        padding: "10px 11px",
                        borderRadius: 10,
                        border: `2px solid ${
                          p.label === "Pro" ? "#f97316" : "#10b981"
                        }`,
                        background: "transparent",
                        color: p.label === "Pro" ? "#f97316" : "#10b981",
                        fontSize: 13,
                        fontWeight: 700,
                        marginTop: 14,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 7,
                      }}
                    >
                      <Check size={13} /> Active Plan
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setPlan(p.label.toLowerCase());
                        showToast(
                          p.label === "Pro"
                            ? "Pro unlocked! Enjoy unlimited everything."
                            : "Switched back to Free plan."
                        );
                        setShowPlan(false);
                      }}
                      style={{
                        width: "100%",
                        padding: 11,
                        borderRadius: 10,
                        border: "none",
                        background:
                          p.label === "Pro"
                            ? "#f97316"
                            : D
                            ? "#2a2a2a"
                            : "#e5e7eb",
                        color: p.label === "Pro" ? "#fff" : txt,
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: "pointer",
                        fontFamily: "inherit",
                        marginTop: 14,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 7,
                        boxShadow:
                          p.label === "Pro"
                            ? "0 4px 14px rgba(249,115,22,.35)"
                            : "none",
                      }}
                    >
                      {p.label === "Pro" ? (
                        <>
                          <Unlock size={13} /> Upgrade — ₱500/month
                        </>
                      ) : (
                        <>↓ Switch to Free</>
                      )}
                    </button>
                  )}
                </div>
              ))}
            </div>
            {isPro && (
              <div
                style={{
                  marginTop: 14,
                  padding: "10px 14px",
                  background: D ? "#1a1000" : "#fffbeb",
                  border: `1px solid ${D ? "#3a2800" : "#fde68a"}`,
                  borderRadius: 10,
                  display: "flex",
                  gap: 8,
                  alignItems: "flex-start",
                }}
              >
                <AlertTriangle
                  size={13}
                  color="#d97706"
                  style={{ flexShrink: 0, marginTop: 1 }}
                />
                <p
                  style={{
                    fontSize: 12,
                    color: D ? "#fbbf24" : "#92400e",
                    lineHeight: 1.7,
                  }}
                >
                  Switching to Free limits you to 50 expenses and 3 projects.
                  Your existing data won't be deleted.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* HEADER */}
      {/* ── COLLAPSIBLE SIDEBAR ── */}
      {!isMobile && (
        <aside
          onMouseEnter={() => setSidebarOpen(true)}
          onMouseLeave={() => setSidebarOpen(false)}
          style={{
            width: sidebarOpen ? 220 : 60,
            minHeight: "100vh",
            flexShrink: 0,
            background: D ? "#111" : "#fff",
            borderRight: `1px solid ${
              D ? "rgba(255,255,255,.07)" : "rgba(0,0,0,.07)"
            }`,
            display: "flex",
            flexDirection: "column",
            position: "fixed",
            top: 0,
            left: 0,
            bottom: 0,
            zIndex: 200,
            transition: "width .22s cubic-bezier(.4,0,.2,1)",
            overflow: "hidden",
          }}
        >
          {/* Logo */}
          <div
            style={{
              height: 56,
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "0 14px",
              flexShrink: 0,
              overflow: "hidden",
              borderBottom: `1px solid ${
                D ? "rgba(255,255,255,.06)" : "rgba(0,0,0,.06)"
              }`,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                background: "#f97316",
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 900,
                color: "#fff",
                fontSize: 15,
                flexShrink: 0,
              }}
            >
              ₣
            </div>
            <span
              style={{
                fontFamily: "'Playfair Display',serif",
                fontSize: 15,
                fontWeight: 700,
                color: txt,
                whiteSpace: "nowrap",
                opacity: sidebarOpen ? 1 : 0,
                transition: "opacity .15s",
              }}
            >
              FreelanceFunds
            </span>
          </div>

          {/* Nav items */}
          <nav
            style={{
              flex: 1,
              padding: "10px 8px",
              display: "flex",
              flexDirection: "column",
              gap: 2,
              overflowY: "auto",
              overflowX: "hidden",
            }}
          >
            {navItems.map(({ id, Icon, label }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 10px",
                  borderRadius: 10,
                  background:
                    tab === id
                      ? D
                        ? "rgba(249,115,22,.12)"
                        : "rgba(249,115,22,.1)"
                      : "none",
                  border:
                    tab === id
                      ? `1px solid ${
                          D ? "rgba(249,115,22,.2)" : "rgba(249,115,22,.18)"
                        }`
                      : "1px solid transparent",
                  color: tab === id ? "#f97316" : muted,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  fontSize: 13,
                  fontWeight: tab === id ? 700 : 500,
                  transition: "all .15s",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  width: "100%",
                  textAlign: "left",
                }}
                onMouseEnter={(e) => {
                  if (tab !== id) {
                    e.currentTarget.style.background = D
                      ? "rgba(255,255,255,.05)"
                      : "rgba(0,0,0,.04)";
                    e.currentTarget.style.color = txt;
                  }
                }}
                onMouseLeave={(e) => {
                  if (tab !== id) {
                    e.currentTarget.style.background = "none";
                    e.currentTarget.style.color = muted;
                  }
                }}
              >
                <Icon
                  size={18}
                  strokeWidth={tab === id ? 2.2 : 1.8}
                  style={{ flexShrink: 0 }}
                />
                <span
                  style={{
                    opacity: sidebarOpen ? 1 : 0,
                    transition: "opacity .12s",
                    whiteSpace: "nowrap",
                  }}
                >
                  {label}
                </span>
              </button>
            ))}

            {/* Add expense button */}
            <button
              onClick={openAdd}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 10px",
                borderRadius: 10,
                marginTop: 6,
                background: "#f97316",
                border: "none",
                color: "#fff",
                cursor: "pointer",
                fontFamily: "inherit",
                fontSize: 13,
                fontWeight: 700,
                transition: "all .15s",
                whiteSpace: "nowrap",
                overflow: "hidden",
                width: "100%",
                textAlign: "left",
                boxShadow: "0 2px 10px rgba(249,115,22,.3)",
              }}
            >
              <Plus size={18} style={{ flexShrink: 0 }} />
              <span
                style={{
                  opacity: sidebarOpen ? 1 : 0,
                  transition: "opacity .12s",
                }}
              >
                Add Expense
              </span>
            </button>
          </nav>

          {/* Bottom section */}
          <div
            style={{
              padding: "8px",
              borderTop: `1px solid ${
                D ? "rgba(255,255,255,.06)" : "rgba(0,0,0,.06)"
              }`,
              display: "flex",
              flexDirection: "column",
              gap: 2,
              overflow: "hidden",
            }}
          >
            {/* Usage bars (when expanded) */}
            {!isPro && sidebarOpen && (
              <div
                style={{
                  padding: "10px 10px 6px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 7,
                }}
              >
                {[
                  {
                    label: "Expenses",
                    used: expenses.length,
                    max: FREE_EXP,
                    color: "#f97316",
                  },
                  {
                    label: "Projects",
                    used: projects.length,
                    max: FREE_PROJ,
                    color: "#3b82f6",
                  },
                ].map((u) => (
                  <div key={u.label}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 3,
                      }}
                    >
                      <span
                        style={{ fontSize: 10, color: muted, fontWeight: 700 }}
                      >
                        {u.label}
                      </span>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 800,
                          color:
                            Math.round((u.used / u.max) * 100) >= 80
                              ? "#f97316"
                              : muted,
                        }}
                      >
                        {u.used}/{u.max}
                      </span>
                    </div>
                    <div
                      style={{
                        height: 3,
                        background: D ? "#222" : "#f0f0f0",
                        borderRadius: 2,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${Math.min(
                            100,
                            Math.round((u.used / u.max) * 100)
                          )}%`,
                          background: u.color,
                          borderRadius: 2,
                          transition: "width .5s",
                        }}
                      />
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => setShowPlan(true)}
                  style={{
                    width: "100%",
                    background: "#f97316",
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    padding: "7px",
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 5,
                    marginTop: 2,
                  }}
                >
                  <Zap size={11} /> Upgrade to Pro
                </button>
              </div>
            )}

            {/* Upgrade icon (collapsed) */}
            {!isPro && !sidebarOpen && (
              <button
                onClick={() => setShowPlan(true)}
                title="Upgrade to Pro"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "10px",
                  borderRadius: 10,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#f97316",
                  width: "100%",
                  transition: "all .15s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = D
                    ? "rgba(249,115,22,.1)"
                    : "rgba(249,115,22,.08)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "none")
                }
              >
                <Zap size={18} />
              </button>
            )}

            {/* Dark mode */}
            <button
              onClick={() => setDark((d) => !d)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 10px",
                borderRadius: 10,
                background: "none",
                border: "none",
                cursor: "pointer",
                color: muted,
                fontFamily: "inherit",
                fontSize: 13,
                fontWeight: 500,
                width: "100%",
                overflow: "hidden",
                whiteSpace: "nowrap",
                transition: "all .15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = D
                  ? "rgba(255,255,255,.05)"
                  : "rgba(0,0,0,.04)";
                e.currentTarget.style.color = txt;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "none";
                e.currentTarget.style.color = muted;
              }}
            >
              {D ? (
                <Sun size={18} strokeWidth={1.8} style={{ flexShrink: 0 }} />
              ) : (
                <Moon size={18} strokeWidth={1.8} style={{ flexShrink: 0 }} />
              )}
              <span
                style={{
                  opacity: sidebarOpen ? 1 : 0,
                  transition: "opacity .12s",
                }}
              >
                {D ? "Light mode" : "Dark mode"}
              </span>
            </button>

            {/* Help */}
            <button
              onClick={() => setShowManual(true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 10px",
                borderRadius: 10,
                background: "none",
                border: "none",
                cursor: "pointer",
                color: muted,
                fontFamily: "inherit",
                fontSize: 13,
                fontWeight: 500,
                width: "100%",
                overflow: "hidden",
                whiteSpace: "nowrap",
                transition: "all .15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = D
                  ? "rgba(255,255,255,.05)"
                  : "rgba(0,0,0,.04)";
                e.currentTarget.style.color = txt;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "none";
                e.currentTarget.style.color = muted;
              }}
            >
              <HelpCircle
                size={18}
                strokeWidth={1.8}
                style={{ flexShrink: 0 }}
              />
              <span
                style={{
                  opacity: sidebarOpen ? 1 : 0,
                  transition: "opacity .12s",
                }}
              >
                Help
              </span>
            </button>

            {/* Plan badge — always visible, clickable */}
            <button
              onClick={() => setShowPlan(true)}
              title="Manage plan"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "9px 10px",
                borderRadius: 10,
                background: "none",
                border: "none",
                cursor: "pointer",
                width: "100%",
                overflow: "hidden",
                transition: "all .15s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = D
                  ? "rgba(255,255,255,.05)"
                  : "rgba(0,0,0,.04)")
              }
              onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
            >
              {/* Icon — crown for pro, spark for free */}
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: isPro
                    ? "rgba(249,115,22,.15)"
                    : "rgba(100,100,100,.1)",
                  border: `1px solid ${isPro ? "rgba(249,115,22,.3)" : brd}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {isPro ? (
                  <Zap size={15} color="#f97316" />
                ) : (
                  <Lock size={14} color={muted} />
                )}
              </div>
              {sidebarOpen && (
                <div style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
                  <p
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      color: isPro ? "#f97316" : txt,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {isPro ? "Pro Plan" : "Free Plan"}
                  </p>
                  <p
                    style={{ fontSize: 10, color: muted, whiteSpace: "nowrap" }}
                  >
                    {isPro
                      ? "Unlimited everything"
                      : `${expenses.length}/${FREE_EXP} expenses`}
                  </p>
                </div>
              )}
              {sidebarOpen && (
                <ChevronRight
                  size={13}
                  color={muted}
                  style={{ flexShrink: 0 }}
                />
              )}
            </button>

            {/* Divider */}
            <div
              style={{
                height: 1,
                background: D ? "rgba(255,255,255,.06)" : "rgba(0,0,0,.06)",
                margin: "2px 8px",
              }}
            />

            {/* User + signout */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 10px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: isPro
                    ? "rgba(249,115,22,.12)"
                    : D
                    ? "#2a2a2a"
                    : "#f3f4f6",
                  border: `1px solid ${isPro ? "rgba(249,115,22,.25)" : brd}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  fontWeight: 700,
                  color: isPro ? "#f97316" : muted,
                  flexShrink: 0,
                }}
              >
                {user.email?.[0]?.toUpperCase() || <User size={14} />}
              </div>
              {sidebarOpen && (
                <div
                  style={{
                    flex: 1,
                    minWidth: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 4,
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <p
                      style={{
                        fontSize: 11,
                        color: txt,
                        fontWeight: 600,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {user.email}
                    </p>
                    <p style={{ fontSize: 10, color: muted }}>
                      {isPro ? "Pro member" : "Free member"}
                    </p>
                  </div>
                  <button
                    onClick={signOut}
                    title="Sign out"
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: muted,
                      padding: 4,
                      display: "flex",
                      flexShrink: 0,
                      borderRadius: 6,
                      transition: "all .15s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "#ef4444";
                      e.currentTarget.style.background = D
                        ? "rgba(239,68,68,.1)"
                        : "rgba(239,68,68,.08)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = muted;
                      e.currentTarget.style.background = "none";
                    }}
                  >
                    <LogOut size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </aside>
      )}

      {/* Mobile top bar */}
      {isMobile && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            height: 52,
            background: D ? "rgba(15,15,15,.95)" : "rgba(255,255,255,.95)",
            borderBottom: `1px solid ${
              D ? "rgba(255,255,255,.07)" : "rgba(0,0,0,.07)"
            }`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 16px",
            zIndex: 200,
            backdropFilter: "blur(20px)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                width: 28,
                height: 28,
                background: "#f97316",
                borderRadius: 7,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 900,
                color: "#fff",
                fontSize: 14,
              }}
            >
              ₣
            </div>
            <span
              style={{
                fontFamily: "'Playfair Display',serif",
                fontSize: 15,
                color: txt,
              }}
            >
              FreelanceFunds
            </span>
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            <button
              onClick={() => setDark((d) => !d)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: muted,
                padding: 6,
                borderRadius: 7,
                display: "flex",
              }}
            >
              {D ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button
              className="btn btn-primary"
              style={{ padding: "6px 12px", fontSize: 12 }}
              onClick={openAdd}
            >
              <Plus size={14} /> Add
            </button>
          </div>
        </div>
      )}

      {/* ── MAIN CONTENT AREA ── */}
      <div
        style={{
          flex: 1,
          marginLeft: isMobile ? 0 : SB,
          transition: "margin-left .22s cubic-bezier(.4,0,.2,1)",
          minHeight: "100vh",
          paddingTop: isMobile ? 52 : 0,
          paddingBottom: isMobile ? 72 : 0,
        }}
      >
        <main
          style={{
            maxWidth: 1040,
            margin: "0 auto",
            padding: isMobile
              ? "16px 12px"
              : isTablet
              ? "20px 16px"
              : "28px 20px",
          }}
        >
          {/* ── DASHBOARD ── */}
          {tab === "dashboard" && (
            <div>
              {/* Page header */}
              <div
                className="fade-up"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: isMobile ? "flex-start" : "center",
                  flexDirection: isMobile ? "column" : "row",
                  gap: 12,
                  marginBottom: 24,
                }}
              >
                <div>
                  <h1
                    style={{
                      fontFamily: "'Playfair Display',serif",
                      fontSize: isMobile ? 26 : 32,
                      letterSpacing: "-0.03em",
                      marginBottom: 4,
                      color: txt,
                    }}
                  >
                    Good day <span style={{ color: "#f97316" }}>✦</span>
                  </h1>
                  <p
                    style={{
                      color: muted,
                      fontSize: 12,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: "#10b981",
                        display: "inline-block",
                      }}
                    />
                    {expenses.length} expenses · {projects.length} projects ·{" "}
                    {isPro ? "Pro Plan" : "Free Plan"}
                  </p>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    className="btn btn-ghost"
                    style={{ fontSize: 12 }}
                    onClick={() => setShowManual(true)}
                  >
                    <BookOpen size={13} /> Manual
                  </button>
                  {!isMobile && (
                    <button
                      className="btn btn-ghost"
                      style={{ fontSize: 12 }}
                      onClick={exportCSV}
                    >
                      <Download size={13} /> Export
                    </button>
                  )}
                  {expenses.length > 0 && (
                    <button
                      className="btn btn-share"
                      style={{ fontSize: 12 }}
                      onClick={() => setShowShare(true)}
                    >
                      <Share2 size={13} /> Share
                    </button>
                  )}
                </div>
              </div>

              {/* Empty state */}
              {expenses.length === 0 && projects.length === 0 && (
                <div
                  className="fade-up-1"
                  style={{
                    background: D
                      ? "linear-gradient(135deg,#141414,#1a1200)"
                      : "linear-gradient(135deg,#fff,#fff7ed)",
                    border: `1.5px dashed ${
                      D ? "rgba(249,115,22,.3)" : "rgba(249,115,22,.25)"
                    }`,
                    borderRadius: 24,
                    padding: "52px 32px",
                    textAlign: "center",
                    marginBottom: 20,
                  }}
                >
                  <div
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: 20,
                      background: "rgba(249,115,22,.12)",
                      border: "2px solid rgba(249,115,22,.25)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 20px",
                      boxShadow: "0 8px 32px rgba(249,115,22,.15)",
                    }}
                  >
                    <FolderOpen size={30} color="#f97316" />
                  </div>
                  <h2
                    style={{
                      fontFamily: "'Playfair Display',serif",
                      fontSize: 22,
                      color: txt,
                      marginBottom: 8,
                    }}
                  >
                    Value in 2 minutes
                  </h2>
                  <p
                    style={{
                      color: muted,
                      fontSize: 14,
                      lineHeight: 1.75,
                      maxWidth: 340,
                      margin: "0 auto 8px",
                    }}
                  >
                    Create your first project, log one expense, and see your
                    estimated tax savings instantly.
                  </p>
                  <p
                    style={{
                      color: "#f97316",
                      fontSize: 13,
                      fontWeight: 700,
                      marginBottom: 28,
                    }}
                  >
                    Start here — takes 30 seconds.
                  </p>
                  <div
                    style={{
                      display: "flex",
                      gap: 10,
                      justifyContent: "center",
                      flexWrap: "wrap",
                    }}
                  >
                    <button
                      className="btn btn-primary"
                      style={{ fontSize: 14, padding: "12px 22px" }}
                      onClick={() => {
                        setModal("project");
                        setPForm({
                          name: "",
                          client: "",
                          color: "#f97316",
                          budget: "",
                        });
                      }}
                    >
                      <FolderOpen size={15} /> Create First Project
                    </button>
                    <button
                      className="btn btn-ghost"
                      onClick={() => setShowManual(true)}
                    >
                      <BookOpen size={14} /> Read Manual
                    </button>
                  </div>
                </div>
              )}

              {/* Project created but no expenses nudge */}
              {projects.length > 0 && expenses.length === 0 && (
                <div
                  className="fade-up-1"
                  style={{
                    background: D
                      ? "linear-gradient(135deg,#0d1a2a,#0a1520)"
                      : "linear-gradient(135deg,#eff6ff,#e0f2fe)",
                    border: `1px solid ${
                      D ? "rgba(59,130,246,.2)" : "rgba(59,130,246,.25)"
                    }`,
                    borderRadius: 18,
                    padding: "20px 24px",
                    marginBottom: 16,
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    flexWrap: "wrap",
                  }}
                >
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 13,
                      background: "rgba(59,130,246,.15)",
                      border: "1px solid rgba(59,130,246,.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Receipt size={21} color="#3b82f6" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        fontWeight: 800,
                        fontSize: 14,
                        color: txt,
                        marginBottom: 3,
                      }}
                    >
                      Project ready — log your first expense
                    </p>
                    <p style={{ fontSize: 12, color: muted }}>
                      Your dashboard will show live tax savings as soon as you
                      add one.
                    </p>
                  </div>
                  <button
                    className="btn btn-primary"
                    onClick={openAdd}
                    style={{ flexShrink: 0 }}
                  >
                    <Plus size={14} /> Add Expense
                  </button>
                </div>
              )}

              {expenses.length > 0 && (
                <>
                  {/* ── HERO STATS ── */}
                  <div
                    className="fade-up-1"
                    style={{
                      display: "grid",
                      gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                      gap: 12,
                      marginBottom: 14,
                    }}
                  >
                    {/* Total tracked */}
                    <div
                      style={{
                        background: D
                          ? "linear-gradient(135deg,#111,#1a0e00)"
                          : "linear-gradient(135deg,#fff,#fff7ed)",
                        borderRadius: 22,
                        padding: isMobile ? "20px 20px" : "24px 28px",
                        position: "relative",
                        overflow: "hidden",
                        border: `1px solid ${
                          D ? "rgba(249,115,22,.18)" : "rgba(249,115,22,.2)"
                        }`,
                        boxShadow: D
                          ? "0 8px 32px rgba(0,0,0,.4)"
                          : "0 4px 20px rgba(249,115,22,.1)",
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          right: -30,
                          top: -30,
                          width: 140,
                          height: 140,
                          borderRadius: "50%",
                          background: "rgba(249,115,22,.08)",
                          pointerEvents: "none",
                        }}
                      />
                      <div style={{ position: "absolute", right: 10, top: 10 }}>
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 10,
                            background: "rgba(249,115,22,.12)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Wallet size={16} color="#f97316" />
                        </div>
                      </div>
                      <p
                        style={{
                          fontSize: 10,
                          fontWeight: 800,
                          color: "#f97316",
                          textTransform: "uppercase",
                          letterSpacing: ".1em",
                          marginBottom: 10,
                        }}
                      >
                        Total Tracked
                      </p>
                      <p
                        style={{
                          fontFamily: "'Playfair Display',serif",
                          fontSize: isMobile ? 34 : 42,
                          lineHeight: 1,
                          letterSpacing: "-0.03em",
                          color: txt,
                          marginBottom: 6,
                        }}
                      >
                        {fmt(grandTotal)}
                      </p>
                      <p style={{ color: muted, fontSize: 12 }}>
                        {expenses.length} expenses across {projects.length}{" "}
                        project{projects.length !== 1 ? "s" : ""}
                      </p>
                    </div>

                    {/* Tax savings */}
                    <div
                      style={{
                        background: D
                          ? "linear-gradient(135deg,#0a1a0f,#0d2015)"
                          : "linear-gradient(135deg,#f0fdf4,#dcfce7)",
                        borderRadius: 22,
                        padding: isMobile ? "20px 20px" : "24px 28px",
                        position: "relative",
                        overflow: "hidden",
                        border: `1px solid ${
                          D ? "rgba(16,185,129,.18)" : "rgba(16,185,129,.25)"
                        }`,
                        boxShadow: D
                          ? "0 8px 32px rgba(0,0,0,.4)"
                          : "0 4px 20px rgba(16,185,129,.1)",
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          right: -30,
                          top: -30,
                          width: 140,
                          height: 140,
                          borderRadius: "50%",
                          background: "rgba(16,185,129,.08)",
                          pointerEvents: "none",
                        }}
                      />
                      <div style={{ position: "absolute", right: 10, top: 10 }}>
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 10,
                            background: "rgba(16,185,129,.12)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Shield size={16} color="#10b981" />
                        </div>
                      </div>
                      <p
                        style={{
                          fontSize: 10,
                          fontWeight: 800,
                          color: "#10b981",
                          textTransform: "uppercase",
                          letterSpacing: ".1em",
                          marginBottom: 10,
                        }}
                      >
                        Est. Tax Savings
                      </p>
                      <p
                        style={{
                          fontFamily: "'Playfair Display',serif",
                          fontSize: isMobile ? 34 : 42,
                          lineHeight: 1,
                          letterSpacing: "-0.03em",
                          color: txt,
                          marginBottom: 6,
                        }}
                      >
                        {fmt(estSavings)}
                      </p>
                      <p style={{ color: muted, fontSize: 12 }}>
                        at 20% deduction rate
                      </p>
                    </div>
                  </div>

                  {/* Income vs Expense summary row */}
                  {income.length > 0 && (
                    <div
                      className="fade-up-1"
                      style={{
                        display: "grid",
                        gridTemplateColumns: isMobile ? "1fr" : "repeat(3,1fr)",
                        gap: 10,
                        marginBottom: 14,
                      }}
                    >
                      {[
                        {
                          label: "Income (paid)",
                          val: fmt(paidIncome),
                          color: "#10b981",
                          Icon: Banknote,
                          tab: "income",
                        },
                        {
                          label: "Expenses",
                          val: fmt(grandTotal),
                          color: "#ef4444",
                          Icon: Receipt,
                          tab: "expenses",
                        },
                        {
                          label: "Net Profit",
                          val: fmt(netProfit),
                          color: netProfit >= 0 ? "#10b981" : "#ef4444",
                          Icon: TrendingUp,
                          tab: "income",
                        },
                      ].map((s, i) => (
                        <div
                          key={i}
                          style={{
                            padding: isMobile ? "12px" : "14px 18px",
                            borderRadius: 14,
                            background: card,
                            border: `1px solid ${brd}`,
                            cursor: "pointer",
                          }}
                          onClick={() => setTab(s.tab)}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                              marginBottom: 6,
                            }}
                          >
                            <s.Icon size={13} color={s.color} />
                            <p className="lbl" style={{ marginBottom: 0 }}>
                              {s.label}
                            </p>
                          </div>
                          <p
                            style={{
                              fontFamily: "'Playfair Display',serif",
                              fontSize: isMobile ? 16 : 20,
                              color: s.color,
                              lineHeight: 1,
                            }}
                          >
                            {s.val}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* ── HEALTH SCORE ── */}
                  <div
                    className="fade-up-1"
                    style={{
                      marginBottom: 14,
                      background: card,
                      borderRadius: 18,
                      padding: isMobile ? "16px 18px" : "18px 24px",
                      border: `1px solid ${brd}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: 12,
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 14 }}
                    >
                      <div
                        style={{
                          width: 52,
                          height: 52,
                          borderRadius: "50%",
                          border: `3px solid ${healthColor}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          position: "relative",
                        }}
                      >
                        <span
                          style={{
                            fontFamily: "'Playfair Display',serif",
                            fontSize: 18,
                            fontWeight: 700,
                            color: healthColor,
                          }}
                        >
                          {healthScore}
                        </span>
                      </div>
                      <div>
                        <p
                          style={{
                            fontSize: 13,
                            fontWeight: 800,
                            color: txt,
                            marginBottom: 2,
                          }}
                        >
                          Monthly Health Score —{" "}
                          <span style={{ color: healthColor }}>
                            {healthLabel}
                          </span>
                        </p>
                        <p style={{ fontSize: 11, color: muted }}>
                          Income ratio · Tax set-aside · Buffer progress
                        </p>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      {healthScore < 60 && (
                        <span
                          style={{
                            fontSize: 11,
                            color: "#f97316",
                            fontWeight: 700,
                            background: "rgba(249,115,22,.1)",
                            padding: "4px 10px",
                            borderRadius: 20,
                          }}
                        >
                          ⚡ Needs attention
                        </span>
                      )}
                      {healthScore >= 80 && (
                        <span
                          style={{
                            fontSize: 11,
                            color: "#10b981",
                            fontWeight: 700,
                            background: "rgba(16,185,129,.1)",
                            padding: "4px 10px",
                            borderRadius: 20,
                          }}
                        >
                          ✓ On track
                        </span>
                      )}
                    </div>
                  </div>

                  {/* ── MINI STATS ROW ── */}
                  <div
                    className="fade-up-2"
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(3,1fr)",
                      gap: 10,
                      marginBottom: 14,
                    }}
                  >
                    {[
                      {
                        label: "Avg Expense",
                        val: fmt(Math.round(grandTotal / expenses.length)),
                        Icon: BarChart3,
                        accent: "#8b5cf6",
                      },
                      {
                        label: "Top Category",
                        val:
                          Object.entries(catTotals).sort(
                            (a, b) => b[1] - a[1]
                          )[0]?.[0] || "–",
                        Icon: Tag,
                        accent: "#f97316",
                      },
                      {
                        label: "Hours Saved",
                        val: "~10 hrs",
                        Icon: Clock,
                        accent: "#3b82f6",
                      },
                    ].map((s, i) => (
                      <div key={i} className="stat-card">
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 9,
                            background: `${s.accent}15`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            marginBottom: 10,
                          }}
                        >
                          <s.Icon size={15} color={s.accent} />
                        </div>
                        <p className="lbl" style={{ marginBottom: 4 }}>
                          {s.label}
                        </p>
                        <p
                          style={{
                            fontFamily: "'Playfair Display',serif",
                            fontSize: isMobile ? 15 : 18,
                            color: txt,
                            lineHeight: 1,
                            letterSpacing: "-0.01em",
                          }}
                        >
                          {s.val}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* ── CHARTS ROW ── */}
                  <div
                    className="fade-up-2"
                    style={{
                      display: "grid",
                      gridTemplateColumns: isMobile ? "1fr" : "5fr 3fr",
                      gap: 12,
                      marginBottom: 14,
                    }}
                  >
                    {/* Bar chart */}
                    <div
                      className="card"
                      style={{ padding: isMobile ? 16 : 22 }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: 16,
                        }}
                      >
                        <div>
                          <p
                            style={{
                              fontWeight: 800,
                              fontSize: 14,
                              color: txt,
                              display: "flex",
                              alignItems: "center",
                              gap: 7,
                            }}
                          >
                            <BarChart3 size={14} color="#f97316" /> Monthly
                            Spend
                          </p>
                          <p
                            style={{ fontSize: 11, color: muted, marginTop: 2 }}
                          >
                            2025 overview
                          </p>
                        </div>
                        <div
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            color: "#f97316",
                          }}
                        >
                          {fmt(grandTotal)}
                        </div>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-end",
                          gap: 4,
                          height: 72,
                        }}
                      >
                        {monthly.map((d, i) => (
                          <div
                            key={i}
                            style={{
                              flex: 1,
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              gap: 3,
                            }}
                          >
                            <div
                              style={{
                                width: "100%",
                                height: 56,
                                display: "flex",
                                alignItems: "flex-end",
                                borderRadius: "4px 4px 0 0",
                                overflow: "hidden",
                                background: D
                                  ? "rgba(255,255,255,.04)"
                                  : "rgba(0,0,0,.04)",
                              }}
                              title={`${d.label}: ${fmt(d.val)}`}
                            >
                              <div
                                style={{
                                  width: "100%",
                                  background: d.highlight
                                    ? "#f97316"
                                    : D
                                    ? "#3b82f6"
                                    : "#60a5fa",
                                  height: `${
                                    (d.val /
                                      Math.max(
                                        ...monthly.map((x) => x.val),
                                        1
                                      )) *
                                    100
                                  }%`,
                                  borderRadius: "4px 4px 0 0",
                                  transition: "height .6s ease",
                                  opacity: d.val === 0 ? 0.2 : 1,
                                }}
                              />
                            </div>
                            <span
                              style={{
                                fontSize: 8,
                                color: muted,
                                fontWeight: 700,
                              }}
                            >
                              {d.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Donut */}
                    <div
                      className="card"
                      style={{
                        padding: isMobile ? 16 : 22,
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <p
                        style={{
                          fontWeight: 800,
                          fontSize: 14,
                          color: txt,
                          display: "flex",
                          alignItems: "center",
                          gap: 7,
                          marginBottom: 16,
                        }}
                      >
                        <PieChart size={14} color="#f97316" /> Projects
                      </p>
                      <div
                        style={{
                          flex: 1,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: 14,
                        }}
                      >
                        <DonutChart
                          size={84}
                          segments={projects.map((p) => ({
                            pct: grandTotal
                              ? Math.round(
                                  ((projTotals[p.id] || 0) / grandTotal) * 100
                                )
                              : 0,
                            color: p.color,
                          }))}
                        />
                        <div
                          style={{
                            width: "100%",
                            display: "flex",
                            flexDirection: "column",
                            gap: 6,
                          }}
                        >
                          {projects.map((p) => (
                            <div
                              key={p.id}
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 7,
                                }}
                              >
                                <div
                                  style={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: 2,
                                    background: p.color,
                                  }}
                                />
                                <span
                                  style={{
                                    fontSize: 11,
                                    color: txt,
                                    fontWeight: 600,
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                    maxWidth: 80,
                                  }}
                                >
                                  {p.name}
                                </span>
                              </div>
                              <span
                                style={{
                                  fontSize: 11,
                                  color: muted,
                                  fontWeight: 700,
                                }}
                              >
                                {fmt(Math.round(projTotals[p.id] || 0))}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* ── PROJECT CARDS ── */}
              {projects.length > 0 && (
                <div
                  className="fade-up-3"
                  style={{
                    display: "grid",
                    gridTemplateColumns: isMobile
                      ? "1fr"
                      : isTablet
                      ? "repeat(2,1fr)"
                      : "repeat(auto-fit,minmax(210px,1fr))",
                    gap: 10,
                    marginBottom: 14,
                  }}
                >
                  {projects.map((p, idx) => {
                    const spent = projTotals[p.id] || 0;
                    const pct = p.budget
                      ? Math.min(100, Math.round((spent / p.budget) * 100))
                      : null;
                    return (
                      <div
                        key={p.id}
                        style={{
                          background: card,
                          borderRadius: 18,
                          padding: 18,
                          border: `1px solid ${brd}`,
                          position: "relative",
                          overflow: "hidden",
                          transition: "all .2s",
                          cursor: "default",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "translateY(-2px)";
                          e.currentTarget.style.boxShadow = D
                            ? "0 10px 36px rgba(0,0,0,.35)"
                            : "0 8px 28px rgba(0,0,0,.1)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "translateY(0)";
                          e.currentTarget.style.boxShadow = "none";
                        }}
                      >
                        {/* Color accent bar */}
                        <div
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            height: 3,
                            background: `linear-gradient(90deg,${p.color},${p.color}88)`,
                          }}
                        />
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            marginBottom: 12,
                            paddingTop: 4,
                          }}
                        >
                          <div style={{ minWidth: 0 }}>
                            <p
                              style={{
                                fontWeight: 800,
                                fontSize: 13,
                                color: txt,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {p.name}
                            </p>
                            <p
                              style={{
                                fontSize: 11,
                                color: muted,
                                marginTop: 2,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {p.client || "No client"}
                            </p>
                          </div>
                          <span
                            style={{
                              background: `${p.color}18`,
                              color: p.color,
                              border: `1px solid ${p.color}30`,
                              borderRadius: 8,
                              padding: "3px 8px",
                              fontSize: 11,
                              fontWeight: 800,
                              flexShrink: 0,
                            }}
                          >
                            {grandTotal
                              ? Math.round((spent / grandTotal) * 100)
                              : 0}
                            %
                          </span>
                        </div>
                        <p
                          style={{
                            fontFamily: "'Playfair Display',serif",
                            fontSize: 22,
                            color: txt,
                            marginBottom: 8,
                            letterSpacing: "-0.02em",
                          }}
                        >
                          {fmt(Math.round(spent))}
                        </p>
                        {p.budget > 0 && (
                          <>
                            <div
                              style={{
                                height: 4,
                                background: D ? "#1f1f1f" : "#f3f4f6",
                                borderRadius: 2,
                                overflow: "hidden",
                                marginBottom: 4,
                              }}
                            >
                              <div
                                style={{
                                  height: "100%",
                                  width: `${pct}%`,
                                  background: pct > 80 ? "#ef4444" : p.color,
                                  borderRadius: 2,
                                  transition: "width .8s ease",
                                }}
                              />
                            </div>
                            <p
                              style={{
                                fontSize: 10,
                                color: pct > 80 ? "#ef4444" : muted,
                              }}
                            >
                              {pct > 80 ? "⚠ " : ""}
                              {fmt(Math.round(p.budget - spent))} remaining
                            </p>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* PLG upgrade nudge */}
              {!isPro && expenses.length >= 5 && (
                <div style={{ marginBottom: 14 }}>
                  <UpgradeNudge
                    feature="4-way splitting + AI suggestions + PDF reports"
                    onUpgrade={() => setShowPlan(true)}
                    D={D}
                    brd={brd}
                  />
                </div>
              )}

              {/* ── RECENT ACTIVITY ── */}
              {expenses.length > 0 && (
                <div
                  className="card fade-up-3"
                  style={{ padding: isMobile ? 14 : 22 }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 16,
                    }}
                  >
                    <div>
                      <p
                        style={{
                          fontWeight: 800,
                          fontSize: 15,
                          color: txt,
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <Clock size={15} color="#f97316" /> Recent Activity
                      </p>
                      <p style={{ fontSize: 11, color: muted, marginTop: 2 }}>
                        Last {Math.min(5, expenses.length)} transactions
                      </p>
                    </div>
                    <button
                      className="btn btn-ghost"
                      style={{ fontSize: 12, padding: "6px 12px" }}
                      onClick={() => setTab("expenses")}
                    >
                      View all <ArrowRight size={12} />
                    </button>
                  </div>
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 2 }}
                  >
                    {expenses.slice(0, 5).map((e, idx) => {
                      const { Icon: CIc, color: cClr } =
                        CAT_META[e.category] || CAT_META.Other;
                      return (
                        <div
                          key={e.id}
                          className="row"
                          onClick={() => openEdit(e)}
                          style={{
                            marginBottom:
                              idx < Math.min(4, expenses.length - 1) ? 2 : 0,
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              marginBottom: 8,
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 10,
                                flex: 1,
                                minWidth: 0,
                              }}
                            >
                              <div
                                style={{
                                  width: 38,
                                  height: 38,
                                  background: `${cClr}15`,
                                  borderRadius: 11,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  flexShrink: 0,
                                  color: cClr,
                                  border: `1px solid ${cClr}20`,
                                }}
                              >
                                <CIc size={16} />
                              </div>
                              <div style={{ minWidth: 0 }}>
                                <p
                                  style={{
                                    fontWeight: 700,
                                    fontSize: 13,
                                    color: txt,
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {e.description}
                                </p>
                                <p
                                  style={{
                                    fontSize: 10,
                                    color: muted,
                                    marginTop: 1,
                                  }}
                                >
                                  {e.date} · {e.category}
                                </p>
                              </div>
                            </div>
                            <p
                              style={{
                                fontWeight: 800,
                                fontSize: 14,
                                color: txt,
                                flexShrink: 0,
                                marginLeft: 8,
                              }}
                            >
                              {fmt(e.amount)}
                            </p>
                          </div>
                          <SplitBar splits={e.splits} projects={projects} />
                          <div
                            style={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: 4,
                              marginTop: 7,
                            }}
                          >
                            {e.splits.map((s, i) => (
                              <span
                                key={i}
                                style={{
                                  background: `${pClr(projects, s.pid)}12`,
                                  color: pClr(projects, s.pid),
                                  border: `1px solid ${pClr(
                                    projects,
                                    s.pid
                                  )}25`,
                                  borderRadius: 20,
                                  padding: "2px 9px",
                                  fontSize: 10,
                                  fontWeight: 700,
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {pNm(projects, s.pid)} {s.pct}%
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
          {/* ── INCOME ── */}
          {tab === "income" && (
            <div className="fade-up">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: isMobile ? "flex-start" : "flex-end",
                  flexDirection: isMobile ? "column" : "row",
                  gap: 12,
                  marginBottom: 20,
                }}
              >
                <div>
                  <h1
                    style={{
                      fontFamily: "'Playfair Display',serif",
                      fontSize: isMobile ? 26 : 32,
                      letterSpacing: "-0.03em",
                      color: txt,
                    }}
                  >
                    Income
                  </h1>
                  <p style={{ color: muted, fontSize: 12, marginTop: 3 }}>
                    Track payments, set aside taxes, plan for slow months
                  </p>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  {allAlerts.length > 0 && (
                    <button
                      className="btn btn-ghost"
                      style={{ fontSize: 12, position: "relative" }}
                      onClick={() => setShowReminders((r) => !r)}
                    >
                      <Bell size={14} color="#f97316" />
                      <span
                        style={{
                          position: "absolute",
                          top: -4,
                          right: -4,
                          width: 16,
                          height: 16,
                          borderRadius: "50%",
                          background: "#ef4444",
                          color: "#fff",
                          fontSize: 9,
                          fontWeight: 800,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {allAlerts.length}
                      </span>
                      {!isMobile && " Reminders"}
                    </button>
                  )}
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      setIncForm({
                        amount: "",
                        client: "",
                        desc: "",
                        date: new Date().toISOString().split("T")[0],
                        status: "pending",
                        dueDate: "",
                      });
                      setIncModal(true);
                    }}
                  >
                    <Plus size={14} /> Log Payment
                  </button>
                </div>
              </div>

              {/* ── PAYMENT REMINDERS PANEL ── */}
              {showReminders && allAlerts.length > 0 && (
                <div
                  style={{
                    background: D ? "#1a0a00" : "#fff7ed",
                    border: "1.5px solid rgba(249,115,22,.3)",
                    borderRadius: 16,
                    padding: "16px 18px",
                    marginBottom: 14,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 12,
                    }}
                  >
                    <p
                      style={{
                        fontWeight: 800,
                        fontSize: 14,
                        color: "#f97316",
                        display: "flex",
                        alignItems: "center",
                        gap: 7,
                      }}
                    >
                      <Bell size={14} /> {allAlerts.length} payment
                      {allAlerts.length !== 1 ? "s" : ""} need attention
                    </p>
                    <button
                      onClick={() => setShowReminders(false)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: muted,
                        display: "flex",
                      }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 8 }}
                  >
                    {allAlerts.map((inc) => {
                      const daysLate = inc.dueDate
                        ? Math.ceil(
                            (new Date() - new Date(inc.dueDate)) / 864e5
                          )
                        : null;
                      const dueSoon = inc.dueDate
                        ? Math.ceil(
                            (new Date(inc.dueDate) - new Date()) / 864e5
                          )
                        : null;
                      const isCopied = copiedId === inc.id;
                      return (
                        <div
                          key={inc.id}
                          style={{
                            background: D ? "#111" : "#fff",
                            borderRadius: 12,
                            padding: "12px 14px",
                            border: `1px solid ${D ? "#2a1500" : "#fed7aa"}`,
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "flex-start",
                              marginBottom: 8,
                              flexWrap: "wrap",
                              gap: 6,
                            }}
                          >
                            <div>
                              <p
                                style={{
                                  fontWeight: 700,
                                  fontSize: 13,
                                  color: txt,
                                }}
                              >
                                {inc.desc || "Payment"} — {inc.client}
                              </p>
                              <p
                                style={{
                                  fontSize: 11,
                                  color: muted,
                                  marginTop: 2,
                                }}
                              >
                                {fmt(inc.amount)}
                                {daysLate > 0 && (
                                  <span
                                    style={{
                                      color: "#ef4444",
                                      fontWeight: 700,
                                    }}
                                  >
                                    {" "}
                                    · {daysLate} day{daysLate !== 1 ? "s" : ""}{" "}
                                    overdue
                                  </span>
                                )}
                                {dueSoon !== null && dueSoon >= 0 && (
                                  <span
                                    style={{
                                      color: "#f97316",
                                      fontWeight: 700,
                                    }}
                                  >
                                    {" "}
                                    · due in {dueSoon} day
                                    {dueSoon !== 1 ? "s" : ""}
                                  </span>
                                )}
                              </p>
                            </div>
                            <div style={{ display: "flex", gap: 6 }}>
                              <button
                                onClick={() => {
                                  updateIncomeStatus(inc.id, "paid");
                                  showToast("Marked as paid! ✓", "success");
                                }}
                                style={{
                                  padding: "5px 10px",
                                  borderRadius: 8,
                                  border: "1.5px solid #10b981",
                                  background: "rgba(16,185,129,.1)",
                                  color: "#10b981",
                                  fontSize: 11,
                                  fontWeight: 700,
                                  cursor: "pointer",
                                  fontFamily: "inherit",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 4,
                                }}
                              >
                                <CheckCircle2 size={11} /> Mark Paid
                              </button>
                            </div>
                          </div>
                          {/* Follow-up message */}
                          <div
                            style={{
                              background: D ? "#1a1a1a" : "#f9fafb",
                              borderRadius: 9,
                              padding: "10px 12px",
                              marginTop: 4,
                            }}
                          >
                            <p
                              style={{
                                fontSize: 10,
                                fontWeight: 800,
                                color: muted,
                                textTransform: "uppercase",
                                letterSpacing: ".06em",
                                marginBottom: 6,
                                display: "flex",
                                alignItems: "center",
                                gap: 5,
                              }}
                            >
                              <MessageSquare size={10} /> Follow-up message
                            </p>
                            <p
                              style={{
                                fontSize: 11,
                                color: muted,
                                lineHeight: 1.7,
                                whiteSpace: "pre-line",
                              }}
                            >
                              {genFollowUp(inc)}
                            </p>
                            <button
                              onClick={() => {
                                navigator.clipboard
                                  .writeText(genFollowUp(inc))
                                  .catch(() => {});
                                setCopiedId(inc.id);
                                setTimeout(() => setCopiedId(null), 2000);
                              }}
                              style={{
                                marginTop: 8,
                                padding: "5px 12px",
                                borderRadius: 7,
                                border: `1px solid ${
                                  isCopied ? "#10b981" : "#f97316"
                                }`,
                                background: isCopied
                                  ? "rgba(16,185,129,.1)"
                                  : "rgba(249,115,22,.1)",
                                color: isCopied ? "#10b981" : "#f97316",
                                fontSize: 11,
                                fontWeight: 700,
                                cursor: "pointer",
                                fontFamily: "inherit",
                                display: "flex",
                                alignItems: "center",
                                gap: 5,
                                transition: "all .2s",
                              }}
                            >
                              {isCopied ? (
                                <>
                                  <CheckCircle2 size={11} /> Copied!
                                </>
                              ) : (
                                <>
                                  <Copy size={11} /> Copy message
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── INCOME FORECAST ── */}
              {income.filter((i) => i.status === "paid").length >= 2 && (
                <div
                  className="card"
                  style={{ padding: isMobile ? 16 : 22, marginBottom: 14 }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 16,
                    }}
                  >
                    <div>
                      <p
                        style={{
                          fontWeight: 800,
                          fontSize: 15,
                          color: txt,
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <TrendingUp size={15} color="#3b82f6" /> Income Forecast
                      </p>
                      <p style={{ fontSize: 12, color: muted, marginTop: 3 }}>
                        Based on your last 6 months of income data
                      </p>
                    </div>
                    {trend > 0 ? (
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: "#10b981",
                          background: "rgba(16,185,129,.1)",
                          padding: "4px 10px",
                          borderRadius: 20,
                        }}
                      >
                        ↑ Trending up
                      </span>
                    ) : trend < 0 ? (
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: "#ef4444",
                          background: "rgba(239,68,68,.1)",
                          padding: "4px 10px",
                          borderRadius: 20,
                        }}
                      >
                        ↓ Trending down
                      </span>
                    ) : (
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: muted,
                          background: D ? "#1a1a1a" : "#f3f4f6",
                          padding: "4px 10px",
                          borderRadius: 20,
                        }}
                      >
                        → Stable
                      </span>
                    )}
                  </div>

                  {/* History + Forecast bar chart */}
                  <div style={{ marginBottom: 16 }}>
                    <p
                      style={{
                        fontSize: 11,
                        color: muted,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: ".06em",
                        marginBottom: 8,
                      }}
                    >
                      Past 6 months vs next 3 projected
                    </p>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-end",
                        gap: 4,
                        height: 80,
                      }}
                    >
                      {last6months.map((m, i) => {
                        const val = monthlyIncome[m] || 0;
                        const maxVal = Math.max(
                          ...last6months.map((x) => monthlyIncome[x] || 0),
                          ...next3.map((x) => x.projected),
                          1
                        );
                        const label = new Date(m + "-01").toLocaleDateString(
                          "en-PH",
                          { month: "short" }
                        );
                        return (
                          <div
                            key={m}
                            style={{
                              flex: 1,
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              gap: 2,
                            }}
                            title={`${label}: ${fmt(val)}`}
                          >
                            <div
                              style={{
                                width: "100%",
                                height: 60,
                                display: "flex",
                                alignItems: "flex-end",
                                borderRadius: "3px 3px 0 0",
                                overflow: "hidden",
                                background: D
                                  ? "rgba(255,255,255,.04)"
                                  : "rgba(0,0,0,.04)",
                              }}
                            >
                              <div
                                style={{
                                  width: "100%",
                                  height: `${(val / maxVal) * 100}%`,
                                  background: "#3b82f6",
                                  borderRadius: "3px 3px 0 0",
                                  opacity: val === 0 ? 0.3 : 1,
                                }}
                              />
                            </div>
                            <span
                              style={{
                                fontSize: 8,
                                color: muted,
                                fontWeight: 700,
                              }}
                            >
                              {label}
                            </span>
                          </div>
                        );
                      })}
                      {/* Divider */}
                      <div
                        style={{
                          width: 1,
                          height: 72,
                          background: D ? "#333" : "#e5e7eb",
                          flexShrink: 0,
                          marginBottom: 14,
                        }}
                      />
                      {next3.map((n, i) => {
                        const maxVal = Math.max(
                          ...last6months.map((x) => monthlyIncome[x] || 0),
                          ...next3.map((x) => x.projected),
                          1
                        );
                        const label = new Date(
                          n.month + "-01"
                        ).toLocaleDateString("en-PH", { month: "short" });
                        return (
                          <div
                            key={n.month}
                            style={{
                              flex: 1,
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              gap: 2,
                            }}
                            title={`${label} (projected): ${fmt(n.projected)}`}
                          >
                            <div
                              style={{
                                width: "100%",
                                height: 60,
                                display: "flex",
                                alignItems: "flex-end",
                                borderRadius: "3px 3px 0 0",
                                overflow: "hidden",
                                background: D
                                  ? "rgba(255,255,255,.04)"
                                  : "rgba(0,0,0,.04)",
                                border: `1px dashed ${D ? "#333" : "#d1d5db"}`,
                                borderBottom: "none",
                              }}
                            >
                              <div
                                style={{
                                  width: "100%",
                                  height: `${(n.projected / maxVal) * 100}%`,
                                  background: "rgba(59,130,246,.35)",
                                  borderRadius: "3px 3px 0 0",
                                }}
                              />
                            </div>
                            <span
                              style={{
                                fontSize: 8,
                                color: "#3b82f6",
                                fontWeight: 700,
                              }}
                            >
                              {label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    <div style={{ display: "flex", gap: 14, marginTop: 6 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                        }}
                      >
                        <div
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: 2,
                            background: "#3b82f6",
                          }}
                        />
                        <span style={{ fontSize: 11, color: muted }}>
                          Actual
                        </span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                        }}
                      >
                        <div
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: 2,
                            background: "rgba(59,130,246,.35)",
                            border: "1px dashed #3b82f6",
                          }}
                        />
                        <span style={{ fontSize: 11, color: muted }}>
                          Projected
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 3-month projection cards */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(3,1fr)",
                      gap: 10,
                    }}
                  >
                    {next3.map((n, i) => {
                      const label = new Date(
                        n.month + "-01"
                      ).toLocaleDateString("en-PH", {
                        month: "long",
                        year: "numeric",
                      });
                      const expAvg = Math.round(
                        Object.values(monthlyExpMap).reduce(
                          (s, v) => s + v,
                          0
                        ) / Math.max(1, Object.keys(monthlyExpMap).length)
                      );
                      const projNet = n.projected - expAvg;
                      return (
                        <div
                          key={n.month}
                          style={{
                            padding: "12px 14px",
                            background: D ? "#1a1a1a" : "#f0f7ff",
                            border: `1px solid ${D ? "#1e2a3a" : "#bfdbfe"}`,
                            borderRadius: 12,
                          }}
                        >
                          <p
                            style={{
                              fontSize: 10,
                              fontWeight: 800,
                              color: "#3b82f6",
                              textTransform: "uppercase",
                              letterSpacing: ".06em",
                              marginBottom: 6,
                            }}
                          >
                            {label}
                          </p>
                          <p
                            style={{
                              fontFamily: "'Playfair Display',serif",
                              fontSize: isMobile ? 15 : 18,
                              color: txt,
                              lineHeight: 1,
                              marginBottom: 4,
                            }}
                          >
                            {fmt(n.projected)}
                          </p>
                          <p
                            style={{
                              fontSize: 10,
                              color: projNet >= 0 ? "#10b981" : "#ef4444",
                              fontWeight: 700,
                            }}
                          >
                            est. net: {fmt(projNet)}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                  <p
                    style={{
                      fontSize: 11,
                      color: muted,
                      marginTop: 10,
                      fontStyle: "italic",
                    }}
                  >
                    Projection based on {incVals.filter((v) => v > 0).length}
                    -month average of {fmt(Math.round(avgIncome))}/mo. Actual
                    results will vary.
                  </p>
                </div>
              )}

              {/* ── INCOME STAT CARDS ── */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4,1fr)",
                  gap: 10,
                  marginBottom: 14,
                }}
              >
                {[
                  {
                    label: "Total Earned",
                    val: fmt(paidIncome),
                    sub: "confirmed payments",
                    color: "#10b981",
                    Icon: Banknote,
                  },
                  {
                    label: "Pending",
                    val: fmt(pendingIncome),
                    sub: "awaiting payment",
                    color: "#f97316",
                    Icon: Clock,
                  },
                  {
                    label: "Overdue",
                    val: fmt(overdueIncome),
                    sub: "follow up needed",
                    color: "#ef4444",
                    Icon: AlertCircle,
                  },
                  {
                    label: "Net Profit",
                    val: fmt(netProfit),
                    sub: "income minus expenses",
                    color: netProfit >= 0 ? "#10b981" : "#ef4444",
                    Icon: TrendingUp,
                  },
                ].map((s, i) => (
                  <div key={i} className="stat-card">
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 9,
                        background: `${s.color}15`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: 10,
                      }}
                    >
                      <s.Icon size={15} color={s.color} />
                    </div>
                    <p className="lbl" style={{ marginBottom: 4 }}>
                      {s.label}
                    </p>
                    <p
                      style={{
                        fontFamily: "'Playfair Display',serif",
                        fontSize: isMobile ? 16 : 20,
                        color: s.color,
                        lineHeight: 1,
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {s.val}
                    </p>
                    <p style={{ fontSize: 10, color: muted, marginTop: 4 }}>
                      {s.sub}
                    </p>
                  </div>
                ))}
              </div>

              {/* ── TAX SET-ASIDE CALCULATOR ── */}
              <div
                className="card"
                style={{ padding: isMobile ? 16 : 22, marginBottom: 14 }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 16,
                    flexWrap: "wrap",
                    gap: 8,
                  }}
                >
                  <div>
                    <p
                      style={{
                        fontWeight: 800,
                        fontSize: 15,
                        color: txt,
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <Shield size={15} color="#f97316" /> Tax Set-Aside
                      Calculator
                    </p>
                    <p style={{ fontSize: 12, color: muted, marginTop: 3 }}>
                      How much should you set aside from your income for taxes?
                    </p>
                  </div>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
                    <label style={{ fontSize: 12, color: muted }}>
                      Tax rate:
                    </label>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 4 }}
                    >
                      <input
                        type="number"
                        min="0"
                        max="50"
                        value={taxRate}
                        onChange={(e) => setTaxRate(Number(e.target.value))}
                        style={{
                          width: 52,
                          padding: "6px 8px",
                          border: `1.5px solid ${brd}`,
                          borderRadius: 8,
                          background: D ? "#1a1a1a" : "#fff",
                          color: txt,
                          fontSize: 13,
                          fontWeight: 700,
                          textAlign: "center",
                          outline: "none",
                          fontFamily: "inherit",
                        }}
                      />
                      <span style={{ fontSize: 13, color: muted }}>%</span>
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: isMobile ? "1fr" : "repeat(3,1fr)",
                    gap: 12,
                  }}
                >
                  {[
                    {
                      label: "Set aside for taxes",
                      val: fmt(taxSetAside),
                      sub: `${taxRate}% of ₱${paidIncome.toLocaleString()} earned`,
                      color: "#f97316",
                      bold: true,
                    },
                    {
                      label: "Available to spend",
                      val: fmt(
                        Math.max(0, paidIncome - taxSetAside - grandTotal)
                      ),
                      sub: "after tax reserve + expenses",
                      color: "#10b981",
                      bold: false,
                    },
                    {
                      label: "Expenses this period",
                      val: fmt(grandTotal),
                      sub: "total logged expenses",
                      color: muted,
                      bold: false,
                    },
                  ].map((s, i) => (
                    <div
                      key={i}
                      style={{
                        padding: "14px 16px",
                        borderRadius: 12,
                        background: s.bold
                          ? D
                            ? "#1a0e00"
                            : "#fff7ed"
                          : D
                          ? "#1a1a1a"
                          : "#f9fafb",
                        border: `1px solid ${
                          s.bold ? "rgba(249,115,22,.2)" : brd
                        }`,
                      }}
                    >
                      <p
                        style={{
                          fontSize: 11,
                          color: s.bold ? "#f97316" : muted,
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: ".07em",
                          marginBottom: 6,
                        }}
                      >
                        {s.label}
                      </p>
                      <p
                        style={{
                          fontFamily: "'Playfair Display',serif",
                          fontSize: 22,
                          color: s.bold ? "#f97316" : s.color,
                          lineHeight: 1,
                          marginBottom: 4,
                        }}
                      >
                        {s.val}
                      </p>
                      <p style={{ fontSize: 11, color: muted }}>{s.sub}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── SLOW MONTH BUFFER / SAVINGS GOAL ── */}
              <div
                className="card"
                style={{ padding: isMobile ? 16 : 22, marginBottom: 14 }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 16,
                    flexWrap: "wrap",
                    gap: 8,
                  }}
                >
                  <div>
                    <p
                      style={{
                        fontWeight: 800,
                        fontSize: 15,
                        color: txt,
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <PiggyBank size={15} color="#3b82f6" /> Slow Month Buffer
                    </p>
                    <p style={{ fontSize: 12, color: muted, marginTop: 3 }}>
                      How many months of expenses should you have saved as a
                      safety net?
                    </p>
                  </div>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <span style={{ fontSize: 12, color: muted }}>Target:</span>
                    {[1, 2, 3, 6].map((m) => (
                      <button
                        key={m}
                        onClick={() =>
                          setSavingsGoal(
                            m *
                              Math.round(
                                grandTotal /
                                  Math.max(
                                    1,
                                    new Set(
                                      expenses.map((e) => e.date.slice(0, 7))
                                    ).size
                                  ) || 1
                              )
                          )
                        }
                        style={{
                          padding: "5px 10px",
                          borderRadius: 7,
                          border: `1.5px solid ${brd}`,
                          background: D ? "#1e1e1e" : "#f3f4f6",
                          color: muted,
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: "pointer",
                          fontFamily: "inherit",
                        }}
                      >
                        {m}mo
                      </button>
                    ))}
                  </div>
                </div>
                {(() => {
                  const monthlyAvg =
                    grandTotal /
                    Math.max(
                      1,
                      new Set(expenses.map((e) => e.date.slice(0, 7))).size
                    );
                  const target = savingsGoal || Math.round(monthlyAvg * 3);
                  const pct =
                    target > 0
                      ? Math.min(100, Math.round((paidIncome / target) * 100))
                      : 0;
                  return (
                    <div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: 6,
                        }}
                      >
                        <span style={{ fontSize: 12, color: muted }}>
                          Progress toward {fmt(target)} buffer
                        </span>
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 800,
                            color: pct >= 100 ? "#10b981" : "#f97316",
                          }}
                        >
                          {pct}%
                        </span>
                      </div>
                      <div
                        style={{
                          height: 8,
                          background: D ? "#1f1f1f" : "#f0f0f0",
                          borderRadius: 4,
                          overflow: "hidden",
                          marginBottom: 8,
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            width: `${pct}%`,
                            background: pct >= 100 ? "#10b981" : "#3b82f6",
                            borderRadius: 4,
                            transition: "width .8s ease",
                          }}
                        />
                      </div>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(3,1fr)",
                          gap: 8,
                        }}
                      >
                        {[
                          {
                            label: "Monthly avg spend",
                            val: fmt(Math.round(monthlyAvg)),
                          },
                          { label: "Buffer target", val: fmt(target) },
                          { label: "Current income", val: fmt(paidIncome) },
                        ].map((s, i) => (
                          <div
                            key={i}
                            style={{
                              padding: "10px 12px",
                              background: D ? "#1a1a1a" : "#f9fafb",
                              borderRadius: 10,
                              border: `1px solid ${brd}`,
                            }}
                          >
                            <p
                              style={{
                                fontSize: 10,
                                color: muted,
                                fontWeight: 700,
                                textTransform: "uppercase",
                                letterSpacing: ".06em",
                                marginBottom: 4,
                              }}
                            >
                              {s.label}
                            </p>
                            <p
                              style={{
                                fontSize: 14,
                                fontWeight: 800,
                                color: txt,
                              }}
                            >
                              {s.val}
                            </p>
                          </div>
                        ))}
                      </div>
                      {pct < 100 && (
                        <p
                          style={{
                            fontSize: 12,
                            color: "#f97316",
                            marginTop: 10,
                            fontWeight: 600,
                          }}
                        >
                          ⚡ You need {fmt(Math.max(0, target - paidIncome))}{" "}
                          more to hit your{" "}
                          {Math.round(target / Math.max(1, monthlyAvg))}-month
                          safety buffer.
                        </p>
                      )}
                      {pct >= 100 && (
                        <p
                          style={{
                            fontSize: 12,
                            color: "#10b981",
                            marginTop: 10,
                            fontWeight: 600,
                          }}
                        >
                          ✓ You've hit your slow-month buffer. Great financial
                          discipline!
                        </p>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* ── FINANCIAL GOALS ── */}
              <div
                className="card"
                style={{ padding: isMobile ? 16 : 22, marginBottom: 14 }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 16,
                  }}
                >
                  <div>
                    <p
                      style={{
                        fontWeight: 800,
                        fontSize: 15,
                        color: txt,
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <Target size={15} color="#f97316" /> Financial Goals
                    </p>
                    <p style={{ fontSize: 12, color: muted, marginTop: 3 }}>
                      Laptop fund, emergency buffer, vacation — track what
                      you're saving toward
                    </p>
                  </div>
                  <button
                    className="btn btn-ghost"
                    style={{ fontSize: 12 }}
                    onClick={() => {
                      setGoalForm({ label: "", target: "" });
                      setGoalModal(true);
                    }}
                  >
                    <Plus size={13} /> Add Goal
                  </button>
                </div>
                {goals.length === 0 ? (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "24px 0",
                      color: muted,
                    }}
                  >
                    <Target
                      size={32}
                      style={{ marginBottom: 8, opacity: 0.3 }}
                    />
                    <p
                      style={{
                        fontSize: 13,
                        color: txt,
                        fontWeight: 700,
                        marginBottom: 6,
                      }}
                    >
                      No goals yet
                    </p>
                    <p style={{ fontSize: 12, marginBottom: 16 }}>
                      Set a savings target — new laptop, emergency fund,
                      anything.
                    </p>
                    <button
                      className="btn btn-primary"
                      style={{ fontSize: 12 }}
                      onClick={() => {
                        setGoalForm({ label: "", target: "" });
                        setGoalModal(true);
                      }}
                    >
                      <Plus size={13} /> Set First Goal
                    </button>
                  </div>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 10,
                    }}
                  >
                    {goals.map((g) => {
                      const pct = Math.min(
                        100,
                        Math.round((g.saved / g.target) * 100)
                      );
                      return (
                        <div
                          key={g.id}
                          style={{
                            padding: "12px 14px",
                            background: D ? "#1a1a1a" : "#f9fafb",
                            borderRadius: 12,
                            border: `1px solid ${brd}`,
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              marginBottom: 8,
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                              }}
                            >
                              {pct >= 100 ? (
                                <Award size={15} color="#10b981" />
                              ) : (
                                <Target size={15} color="#f97316" />
                              )}
                              <span
                                style={{
                                  fontSize: 13,
                                  fontWeight: 700,
                                  color: txt,
                                }}
                              >
                                {g.label}
                              </span>
                              {pct >= 100 && (
                                <span
                                  style={{
                                    fontSize: 10,
                                    background: "rgba(16,185,129,.15)",
                                    color: "#10b981",
                                    padding: "2px 8px",
                                    borderRadius: 20,
                                    fontWeight: 700,
                                  }}
                                >
                                  ✓ Reached!
                                </span>
                              )}
                            </div>
                            <button
                              onClick={() => removeGoal(g.id)}
                              style={{
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                color: muted,
                                display: "flex",
                              }}
                            >
                              <X size={13} />
                            </button>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                              marginBottom: 6,
                            }}
                          >
                            <div
                              style={{
                                flex: 1,
                                height: 6,
                                background: D ? "#222" : "#e5e7eb",
                                borderRadius: 3,
                                overflow: "hidden",
                              }}
                            >
                              <div
                                style={{
                                  height: "100%",
                                  width: `${pct}%`,
                                  background:
                                    pct >= 100 ? "#10b981" : "#f97316",
                                  borderRadius: 3,
                                  transition: "width .6s ease",
                                }}
                              />
                            </div>
                            <span
                              style={{
                                fontSize: 11,
                                fontWeight: 700,
                                color: pct >= 100 ? "#10b981" : txt,
                                minWidth: 32,
                              }}
                            >
                              {pct}%
                            </span>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <span style={{ fontSize: 11, color: muted }}>
                              {fmt(g.saved)} of {fmt(g.target)}
                            </span>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                              }}
                            >
                              <span style={{ fontSize: 11, color: muted }}>
                                Saved:
                              </span>
                              <input
                                type="number"
                                value={g.saved}
                                min="0"
                                max={g.target}
                                onChange={(e) =>
                                  updateGoal(g.id, e.target.value)
                                }
                                style={{
                                  width: 80,
                                  padding: "3px 7px",
                                  border: `1.5px solid ${brd}`,
                                  borderRadius: 7,
                                  background: D ? "#222" : "#fff",
                                  color: txt,
                                  fontSize: 12,
                                  fontWeight: 700,
                                  outline: "none",
                                  fontFamily: "inherit",
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* ── PAYMENT LOG ── */}
              <div className="card" style={{ padding: isMobile ? 14 : 22 }}>
                <p
                  style={{
                    fontWeight: 800,
                    fontSize: 15,
                    color: txt,
                    marginBottom: 16,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <CreditCard size={15} color="#f97316" /> Payment Log
                </p>
                {income.length === 0 ? (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "40px 20px",
                      color: muted,
                    }}
                  >
                    <Banknote
                      size={38}
                      style={{ marginBottom: 10, opacity: 0.3 }}
                    />
                    <p
                      style={{
                        fontWeight: 800,
                        fontSize: 14,
                        color: txt,
                        marginBottom: 8,
                      }}
                    >
                      No payments logged yet
                    </p>
                    <p style={{ fontSize: 13, marginBottom: 20 }}>
                      Log your first client payment to start tracking income
                    </p>
                    <button
                      className="btn btn-primary"
                      onClick={() => {
                        setIncForm({
                          amount: "",
                          client: "",
                          desc: "",
                          date: new Date().toISOString().split("T")[0],
                          status: "pending",
                        });
                        setIncModal(true);
                      }}
                    >
                      <Plus size={14} /> Log First Payment
                    </button>
                  </div>
                ) : (
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 8 }}
                  >
                    {income.map((inc) => {
                      const statusColors = {
                        paid: "#10b981",
                        pending: "#f97316",
                        overdue: "#ef4444",
                      };
                      const StatusIc =
                        inc.status === "paid"
                          ? CheckCircle2
                          : inc.status === "overdue"
                          ? AlertTriangle
                          : Clock;
                      return (
                        <div key={inc.id} className="row">
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 10,
                                flex: 1,
                                minWidth: 0,
                              }}
                            >
                              <div
                                style={{
                                  width: 38,
                                  height: 38,
                                  borderRadius: 10,
                                  background: `${statusColors[inc.status]}15`,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  flexShrink: 0,
                                }}
                              >
                                <StatusIc
                                  size={16}
                                  color={statusColors[inc.status]}
                                />
                              </div>
                              <div style={{ minWidth: 0 }}>
                                <p
                                  style={{
                                    fontWeight: 700,
                                    fontSize: 13,
                                    color: txt,
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {inc.desc || inc.client}
                                </p>
                                <p style={{ fontSize: 10, color: muted }}>
                                  {inc.date} · {inc.client}
                                </p>
                              </div>
                            </div>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                flexShrink: 0,
                              }}
                            >
                              <p
                                style={{
                                  fontWeight: 900,
                                  fontSize: 14,
                                  color: statusColors[inc.status],
                                }}
                              >
                                {fmt(inc.amount)}
                              </p>
                              {/* Status toggle */}
                              <select
                                value={inc.status}
                                onChange={(e) =>
                                  updateIncomeStatus(inc.id, e.target.value)
                                }
                                style={{
                                  padding: "3px 7px",
                                  borderRadius: 7,
                                  border: `1.5px solid ${
                                    statusColors[inc.status]
                                  }44`,
                                  background: `${statusColors[inc.status]}12`,
                                  color: statusColors[inc.status],
                                  fontSize: 11,
                                  fontWeight: 700,
                                  cursor: "pointer",
                                  fontFamily: "inherit",
                                  outline: "none",
                                }}
                              >
                                <option value="pending">Pending</option>
                                <option value="paid">Paid</option>
                                <option value="overdue">Overdue</option>
                              </select>
                              <button
                                className="btn btn-danger"
                                style={{ padding: "4px 8px" }}
                                onClick={() => removeIncome(inc.id)}
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── EXPENSES ── */}
          {tab === "expenses" && (
            <div className="fade-up">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: isMobile ? "flex-start" : "flex-end",
                  flexDirection: isMobile ? "column" : "row",
                  gap: 12,
                  marginBottom: 12,
                }}
              >
                <div>
                  <h1
                    style={{
                      fontFamily: "'Playfair Display',serif",
                      fontSize: isMobile ? 26 : 32,
                      letterSpacing: "-0.03em",
                      color: txt,
                    }}
                  >
                    Expenses
                  </h1>
                  <p style={{ color: muted, fontSize: 12, marginTop: 3 }}>
                    {sorted.length} of {expenses.length} ·{" "}
                    {fmt(sorted.reduce((s, e) => s + e.amount, 0))}
                  </p>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    className="btn btn-ghost"
                    style={{ fontSize: 12 }}
                    onClick={() => setScanModal(true)}
                  >
                    <Camera size={13} /> Scan Receipt
                  </button>
                  <button
                    className="btn btn-ghost"
                    style={{ fontSize: 12 }}
                    onClick={() => setRecModal(true)}
                  >
                    <Repeat size={13} /> Recurring ({recurring.length})
                  </button>
                  {!isMobile && (
                    <button
                      className="btn btn-ghost"
                      style={{ fontSize: 12 }}
                      onClick={exportCSV}
                    >
                      <Download size={13} /> Export
                    </button>
                  )}
                  <button className="btn btn-primary" onClick={openAdd}>
                    <Plus size={14} /> Add
                  </button>
                </div>
              </div>

              {/* Recurring preview strip */}
              {recurring.length > 0 && (
                <div
                  style={{
                    background: D ? "#120d1a" : "#f5f3ff",
                    border: `1px solid ${D ? "#3a1a5a" : "#ddd6fe"}`,
                    borderRadius: 14,
                    padding: "12px 16px",
                    marginBottom: 14,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 8,
                    }}
                  >
                    <p
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: D ? "#c4b5fd" : "#5b21b6",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <Repeat size={13} /> {recurring.length} recurring
                    </p>
                    <button
                      onClick={() => setRecModal(true)}
                      className="btn btn-ghost"
                      style={{ fontSize: 11, padding: "4px 10px" }}
                    >
                      <Plus size={11} /> Add
                    </button>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {recurring.map((r) => (
                      <div
                        key={r.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          background: D ? "#1a0d2e" : "#ede9fe",
                          borderRadius: 20,
                          padding: "4px 10px 4px 8px",
                        }}
                      >
                        <span
                          style={{
                            fontSize: 12,
                            color: D ? "#c4b5fd" : "#5b21b6",
                            fontWeight: 600,
                          }}
                        >
                          {r.desc}
                        </span>
                        <span
                          style={{
                            fontSize: 11,
                            color: D ? "#a78bfa" : "#7c3aed",
                          }}
                        >
                          {fmt(r.amount)}/mo
                        </span>
                        <button
                          onClick={() =>
                            setRecurring((p) => p.filter((x) => x.id !== r.id))
                          }
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: D ? "#a78bfa" : "#7c3aed",
                            display: "flex",
                            padding: 0,
                          }}
                        >
                          <X size={11} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div
                style={{
                  marginBottom: 12,
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    flexDirection: isMobile ? "column" : "row",
                  }}
                >
                  <div style={{ position: "relative", flex: 1 }}>
                    <Search
                      size={13}
                      style={{
                        position: "absolute",
                        left: 12,
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: muted,
                        pointerEvents: "none",
                      }}
                    />
                    <input
                      className="input"
                      placeholder="Search expenses..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      style={{ paddingLeft: 34 }}
                    />
                  </div>
                  <div
                    style={{
                      position: "relative",
                      width: isMobile ? "100%" : 165,
                    }}
                  >
                    <ArrowUpDown
                      size={12}
                      style={{
                        position: "absolute",
                        left: 11,
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: muted,
                        pointerEvents: "none",
                      }}
                    />
                    <select
                      className="input"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      style={{ paddingLeft: 30 }}
                    >
                      <option value="date-desc">Newest first</option>
                      <option value="date-asc">Oldest first</option>
                      <option value="amount-desc">Highest amount</option>
                      <option value="amount-asc">Lowest amount</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {[
                    { id: "all", label: "All Projects", color: null },
                    ...projects.map((p) => ({
                      id: p.id,
                      label: p.name,
                      color: p.color,
                    })),
                  ].map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setFPid(p.id)}
                      style={{
                        background:
                          fPid === p.id
                            ? p.color || txt
                            : D
                            ? "#1a1a1a"
                            : "#f3f4f6",
                        color: fPid === p.id ? "#fff" : muted,
                        border: `1.5px solid ${
                          fPid === p.id ? p.color || txt : brd
                        }`,
                        borderRadius: 20,
                        padding: "4px 12px",
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: "pointer",
                        fontFamily: "inherit",
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {p.color && (
                        <span
                          style={{
                            width: 7,
                            height: 7,
                            borderRadius: "50%",
                            background: fPid === p.id ? "#fff" : p.color,
                            display: "inline-block",
                          }}
                        />
                      )}
                      {p.label}
                    </button>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  <button
                    onClick={() => setFCat("all")}
                    style={{
                      background:
                        fCat === "all" ? txt : D ? "#1a1a1a" : "#f3f4f6",
                      color: fCat === "all" ? (D ? "#000" : "#fff") : muted,
                      border: `1.5px solid ${fCat === "all" ? txt : brd}`,
                      borderRadius: 20,
                      padding: "4px 12px",
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "pointer",
                      fontFamily: "inherit",
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                    }}
                  >
                    <ListFilter size={11} /> All
                  </button>
                  {CATEGORIES.filter((c) => catTotals[c] > 0).map((c) => {
                    const { Icon: CIc, color: cClr } = CAT_META[c];
                    return (
                      <button
                        key={c}
                        onClick={() => setFCat(c)}
                        style={{
                          background:
                            fCat === c ? cClr : D ? "#1a1a1a" : "#f3f4f6",
                          color: fCat === c ? "#fff" : muted,
                          border: `1.5px solid ${fCat === c ? cClr : brd}`,
                          borderRadius: 20,
                          padding: "4px 12px",
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: "pointer",
                          fontFamily: "inherit",
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                          whiteSpace: "nowrap",
                        }}
                      >
                        <CIc size={11} /> {c}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {sorted.length === 0 && (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "52px 20px",
                      color: muted,
                    }}
                  >
                    <Receipt
                      size={38}
                      style={{ marginBottom: 10, opacity: 0.3 }}
                    />
                    <p
                      style={{
                        fontWeight: 800,
                        fontSize: 15,
                        color: txt,
                        marginBottom: 8,
                      }}
                    >
                      {expenses.length === 0
                        ? "No expenses yet"
                        : "No results found"}
                    </p>
                    {expenses.length === 0 && (
                      <button
                        className="btn btn-primary"
                        style={{ margin: "0 auto" }}
                        onClick={openAdd}
                      >
                        <Plus size={14} /> Add First Expense
                      </button>
                    )}
                  </div>
                )}
                {sorted.map((e) => {
                  const { Icon: CIc, color: cClr } =
                    CAT_META[e.category] || CAT_META.Other;
                  return (
                    <div key={e.id} className="row" onClick={() => openEdit(e)}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          marginBottom: 8,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 9,
                            flex: 1,
                            minWidth: 0,
                          }}
                        >
                          <div
                            style={{
                              width: 38,
                              height: 38,
                              background: `${cClr}18`,
                              borderRadius: 9,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                              color: cClr,
                            }}
                          >
                            <CIc size={17} />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                                flexWrap: "wrap",
                                marginBottom: 2,
                              }}
                            >
                              <p
                                style={{
                                  fontWeight: 800,
                                  fontSize: 13,
                                  color: txt,
                                }}
                              >
                                {e.description}
                              </p>
                              <span
                                style={{
                                  background: `${cClr}15`,
                                  color: cClr,
                                  border: `1px solid ${cClr}30`,
                                  borderRadius: 6,
                                  padding: "1px 7px",
                                  fontSize: 10,
                                  fontWeight: 700,
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 3,
                                }}
                              >
                                <CIc size={9} /> {e.category}
                              </span>
                            </div>
                            <p style={{ fontSize: 10, color: muted }}>
                              {e.date}
                              {e.notes && (
                                <span
                                  style={{ marginLeft: 8, fontStyle: "italic" }}
                                >
                                  {" "}
                                  · {e.notes.slice(0, 44)}
                                  {e.notes.length > 44 ? "..." : ""}
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            flexShrink: 0,
                            marginLeft: 6,
                          }}
                        >
                          <p
                            style={{
                              fontWeight: 900,
                              fontSize: 14,
                              color: txt,
                            }}
                          >
                            {fmt(e.amount)}
                          </p>
                          <button
                            className="btn btn-danger"
                            style={{ padding: "4px 8px" }}
                            onClick={(ev) => {
                              ev.stopPropagation();
                              setDelId(e.id);
                            }}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                      <SplitBar splits={e.splits} projects={projects} />
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 4,
                          marginTop: 6,
                        }}
                      >
                        {e.splits.map((s, i) => (
                          <span
                            key={i}
                            style={{
                              background: `${pClr(projects, s.pid)}18`,
                              color: pClr(projects, s.pid),
                              border: `1px solid ${pClr(projects, s.pid)}33`,
                              borderRadius: 20,
                              padding: "1px 8px",
                              fontSize: 10,
                              fontWeight: 700,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {pNm(projects, s.pid)} {s.pct}%
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── RECURRING MODAL ── */}
          {recModal && (
            <div
              className="overlay"
              onClick={(e) =>
                e.target === e.currentTarget && setRecModal(false)
              }
            >
              <div className="modal scale-in" style={{ maxWidth: 420 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 18,
                  }}
                >
                  <h2
                    style={{
                      fontFamily: "'Playfair Display',serif",
                      fontSize: 22,
                      color: txt,
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <Repeat size={18} color="#8b5cf6" /> Add Recurring
                  </h2>
                  <button
                    className="btn btn-ghost"
                    style={{ padding: "6px 9px" }}
                    onClick={() => setRecModal(false)}
                  >
                    <X size={15} />
                  </button>
                </div>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 13 }}
                >
                  <div>
                    <label className="lbl">Description *</label>
                    <input
                      className="input"
                      placeholder="e.g. Adobe Creative Cloud"
                      value={recForm.desc}
                      onChange={(e) =>
                        setRecForm((f) => ({ ...f, desc: e.target.value }))
                      }
                    />
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 10,
                    }}
                  >
                    <div>
                      <label className="lbl">Amount (₱) *</label>
                      <input
                        className="input"
                        type="number"
                        min="0"
                        value={recForm.amount}
                        onChange={(e) =>
                          setRecForm((f) => ({ ...f, amount: e.target.value }))
                        }
                      />
                    </div>
                    <div>
                      <label className="lbl">Day of month</label>
                      <input
                        className="input"
                        type="number"
                        min="1"
                        max="28"
                        value={recForm.dayOfMonth}
                        onChange={(e) =>
                          setRecForm((f) => ({
                            ...f,
                            dayOfMonth: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <label className="lbl">Category</label>
                    <select
                      className="input"
                      value={recForm.category}
                      onChange={(e) =>
                        setRecForm((f) => ({ ...f, category: e.target.value }))
                      }
                    >
                      {[
                        "Meals",
                        "Transport",
                        "Software",
                        "Equipment",
                        "Office",
                        "Marketing",
                        "Communication",
                        "Other",
                      ].map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div
                    style={{
                      padding: "12px 14px",
                      background: D ? "#1a0d2e" : "#f5f3ff",
                      border: `1px solid ${D ? "#3a1a5a" : "#ddd6fe"}`,
                      borderRadius: 10,
                    }}
                  >
                    <p
                      style={{
                        fontSize: 12,
                        color: D ? "#c4b5fd" : "#5b21b6",
                        fontWeight: 600,
                      }}
                    >
                      ⚡ This expense will auto-log on day {recForm.dayOfMonth}{" "}
                      of every month. You can delete it anytime.
                    </p>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
                  <button
                    className="btn btn-primary"
                    style={{ flex: 1, justifyContent: "center", padding: 12 }}
                    onClick={() => {
                      if (!recForm.desc || !recForm.amount) {
                        showToast("Fill in description and amount", "error");
                        return;
                      }
                      const splits =
                        projects.length > 0
                          ? [{ pid: projects[0].id, pct: 100 }]
                          : [];
                      addRecurring({ ...recForm, splits });
                      setRecModal(false);
                      showToast("Recurring expense set up!");
                    }}
                  >
                    <Check size={14} /> Save
                  </button>
                  <button
                    className="btn btn-ghost"
                    onClick={() => setRecModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── PROJECTS ── */}
          {tab === "projects" && (
            <div className="fade-up">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: isMobile ? "flex-start" : "flex-end",
                  flexDirection: isMobile ? "column" : "row",
                  gap: 12,
                  marginBottom: 20,
                }}
              >
                <div>
                  <h1
                    style={{
                      fontFamily: "'Playfair Display',serif",
                      fontSize: isMobile ? 26 : 32,
                      letterSpacing: "-0.03em",
                      color: txt,
                    }}
                  >
                    Projects
                  </h1>
                  <p style={{ color: muted, fontSize: 12, marginTop: 3 }}>
                    {projects.length}/{isPro ? "∞" : 3} used
                  </p>
                </div>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setModal("project");
                    setPForm({
                      name: "",
                      client: "",
                      color: "#f97316",
                      budget: "",
                    });
                  }}
                >
                  <Plus size={14} /> New Project
                </button>
              </div>
              {!isPro && projects.length >= FREE_PROJ && (
                <div style={{ marginBottom: 16 }}>
                  <UpgradeNudge
                    feature="unlimited projects"
                    onUpgrade={() => setShowPlan(true)}
                    D={D}
                    brd={brd}
                  />
                </div>
              )}
              {projects.length === 0 && (
                <div
                  style={{
                    textAlign: "center",
                    padding: "60px 20px",
                    color: muted,
                  }}
                >
                  <FolderOpen
                    size={44}
                    style={{ marginBottom: 14, opacity: 0.3 }}
                  />
                  <p
                    style={{
                      fontWeight: 800,
                      fontSize: 16,
                      color: txt,
                      marginBottom: 8,
                    }}
                  >
                    No projects yet
                  </p>
                  <p style={{ fontSize: 13, marginBottom: 20 }}>
                    Create one project per client to get started
                  </p>
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      setModal("project");
                      setPForm({
                        name: "",
                        client: "",
                        color: "#f97316",
                        budget: "",
                      });
                    }}
                  >
                    <Plus size={14} /> Create First Project
                  </button>
                </div>
              )}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile
                    ? "1fr"
                    : isTablet
                    ? "repeat(2,1fr)"
                    : "repeat(auto-fit,minmax(280px,1fr))",
                  gap: 14,
                }}
              >
                {projects.map((p) => {
                  const spent = Math.round(projTotals[p.id] || 0);
                  const pExp = expenses.filter((e) =>
                    e.splits.some((s) => s.pid === p.id)
                  );
                  const pct = p.budget
                    ? Math.min(100, Math.round((spent / p.budget) * 100))
                    : null;
                  return (
                    <div key={p.id} className="card" style={{ padding: 18 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          marginBottom: 14,
                        }}
                      >
                        <div
                          style={{
                            width: 42,
                            height: 42,
                            borderRadius: 11,
                            background: `${p.color}18`,
                            border: `2px solid ${p.color}`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 17,
                            fontWeight: 900,
                            color: p.color,
                            flexShrink: 0,
                          }}
                        >
                          {p.name[0]}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p
                            style={{
                              fontWeight: 800,
                              fontSize: 14,
                              color: txt,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {p.name}
                          </p>
                          <p
                            style={{
                              fontSize: 11,
                              color: muted,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {p.client}
                          </p>
                        </div>
                        <button
                          className="btn btn-danger"
                          style={{ padding: "5px 8px", flexShrink: 0 }}
                          onClick={() => handleRemoveProject(p.id)}
                        >
                          <X size={13} />
                        </button>
                      </div>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr 1fr",
                          gap: 7,
                          marginBottom: 12,
                        }}
                      >
                        {[
                          ["Spent", fmt(spent)],
                          ["Expenses", pExp.length],
                          ["Savings", fmt(Math.round(spent * 0.2))],
                        ].map(([l, v]) => (
                          <div
                            key={l}
                            style={{
                              background: D ? "#1a1a1a" : "#f9fafb",
                              borderRadius: 9,
                              padding: "9px 8px",
                            }}
                          >
                            <p
                              className="lbl"
                              style={{ marginBottom: 3, fontSize: 9 }}
                            >
                              {l}
                            </p>
                            <p
                              style={{
                                fontFamily: "'Playfair Display',serif",
                                fontSize: 13,
                                color: l === "Savings" ? "#16a34a" : txt,
                              }}
                            >
                              {v}
                            </p>
                          </div>
                        ))}
                      </div>
                      {p.budget > 0 && (
                        <div style={{ marginBottom: 10 }}>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              marginBottom: 4,
                            }}
                          >
                            <span style={{ fontSize: 11, color: muted }}>
                              Budget usage
                            </span>
                            <span
                              style={{
                                fontSize: 11,
                                fontWeight: 800,
                                color: pct > 80 ? "#ef4444" : p.color,
                              }}
                            >
                              {pct}%
                            </span>
                          </div>
                          <div className="prog">
                            <div
                              className="prog-bar"
                              style={{
                                width: `${pct}%`,
                                background: pct > 80 ? "#ef4444" : p.color,
                              }}
                            />
                          </div>
                          <p
                            style={{ fontSize: 10, color: muted, marginTop: 3 }}
                          >
                            {fmt(p.budget - spent)} remaining of {fmt(p.budget)}
                          </p>
                        </div>
                      )}
                      <div
                        style={{ height: 1, background: brd, margin: "12px 0" }}
                      />
                      <p className="lbl" style={{ marginBottom: 7 }}>
                        Top Categories
                      </p>
                      <div
                        style={{ display: "flex", gap: 5, flexWrap: "wrap" }}
                      >
                        {[...new Set(pExp.map((e) => e.category))].slice(0, 3)
                          .length > 0 ? (
                          [...new Set(pExp.map((e) => e.category))]
                            .slice(0, 3)
                            .map((c) => {
                              const { Icon: CIc } =
                                CAT_META[c] || CAT_META.Other;
                              return (
                                <span
                                  key={c}
                                  style={{
                                    background: D ? "#1f1f1f" : "#f3f4f6",
                                    borderRadius: 6,
                                    padding: "3px 9px",
                                    fontSize: 11,
                                    color: muted,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 4,
                                  }}
                                >
                                  <CIc size={11} /> {c}
                                </span>
                              );
                            })
                        ) : (
                          <span style={{ fontSize: 12, color: muted }}>
                            No expenses yet
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── CLIENTS ── */}
          {tab === "clients" && (
            <div className="fade-up">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: isMobile ? "flex-start" : "flex-end",
                  flexDirection: isMobile ? "column" : "row",
                  gap: 12,
                  marginBottom: 20,
                }}
              >
                <div>
                  <h1
                    style={{
                      fontFamily: "'Playfair Display',serif",
                      fontSize: isMobile ? 26 : 32,
                      letterSpacing: "-0.03em",
                      color: txt,
                    }}
                  >
                    Client Directory
                  </h1>
                  <p style={{ color: muted, fontSize: 12, marginTop: 3 }}>
                    Contact info, payment history, outstanding balances
                  </p>
                </div>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setClForm({ name: "", email: "", terms: "30", notes: "" });
                    setClModal(true);
                  }}
                >
                  <Plus size={14} /> Add Client
                </button>
              </div>

              {clients.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "60px 20px",
                    color: muted,
                  }}
                >
                  <Users2
                    size={44}
                    style={{ marginBottom: 14, opacity: 0.3 }}
                  />
                  <p
                    style={{
                      fontWeight: 800,
                      fontSize: 16,
                      color: txt,
                      marginBottom: 8,
                    }}
                  >
                    No clients yet
                  </p>
                  <p style={{ fontSize: 13, marginBottom: 20 }}>
                    Add your clients to track who owes what and see full payment
                    history
                  </p>
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      setClForm({
                        name: "",
                        email: "",
                        terms: "30",
                        notes: "",
                      });
                      setClModal(true);
                    }}
                  >
                    <Plus size={14} /> Add First Client
                  </button>
                </div>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: isMobile
                      ? "1fr"
                      : isTablet
                      ? "repeat(2,1fr)"
                      : "repeat(auto-fit,minmax(300px,1fr))",
                    gap: 14,
                  }}
                >
                  {clients.map((cl) => {
                    const clIncome = income.filter((i) => i.client === cl.name);
                    const clPaid = clIncome
                      .filter((i) => i.status === "paid")
                      .reduce((s, i) => s + Number(i.amount), 0);
                    const clPending = clIncome
                      .filter((i) => i.status === "pending")
                      .reduce((s, i) => s + Number(i.amount), 0);
                    const clOverdue = clIncome
                      .filter((i) => i.status === "overdue")
                      .reduce((s, i) => s + Number(i.amount), 0);
                    const clExp = projects
                      .filter((p) => p.client === cl.name)
                      .reduce((s, p) => s + (projTotals[p.id] || 0), 0);
                    return (
                      <div key={cl.id} className="card" style={{ padding: 20 }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            marginBottom: 14,
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                            }}
                          >
                            <div
                              style={{
                                width: 40,
                                height: 40,
                                borderRadius: "50%",
                                background: "rgba(249,115,22,.15)",
                                border: "2px solid rgba(249,115,22,.25)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 16,
                                fontWeight: 800,
                                color: "#f97316",
                                flexShrink: 0,
                              }}
                            >
                              {cl.name[0]?.toUpperCase()}
                            </div>
                            <div>
                              <p
                                style={{
                                  fontWeight: 800,
                                  fontSize: 14,
                                  color: txt,
                                }}
                              >
                                {cl.name}
                              </p>
                              {cl.email && (
                                <p style={{ fontSize: 11, color: muted }}>
                                  {cl.email}
                                </p>
                              )}
                            </div>
                          </div>
                          <button
                            className="btn btn-danger"
                            style={{ padding: "4px 8px" }}
                            onClick={() =>
                              setClients((p) => p.filter((c) => c.id !== cl.id))
                            }
                          >
                            <X size={12} />
                          </button>
                        </div>
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(3,1fr)",
                            gap: 8,
                            marginBottom: 12,
                          }}
                        >
                          {[
                            ["Paid", fmt(clPaid), "#10b981"],
                            ["Pending", fmt(clPending), "#f97316"],
                            ["Overdue", fmt(clOverdue), "#ef4444"],
                          ].map(([l, v, c]) => (
                            <div
                              key={l}
                              style={{
                                background: D ? "#1a1a1a" : "#f9fafb",
                                borderRadius: 9,
                                padding: "8px 10px",
                              }}
                            >
                              <p
                                className="lbl"
                                style={{ marginBottom: 3, fontSize: 9 }}
                              >
                                {l}
                              </p>
                              <p
                                style={{
                                  fontSize: 13,
                                  fontWeight: 800,
                                  color: c,
                                }}
                              >
                                {v}
                              </p>
                            </div>
                          ))}
                        </div>
                        {cl.notes && (
                          <p
                            style={{
                              fontSize: 12,
                              color: muted,
                              fontStyle: "italic",
                              marginBottom: 8,
                            }}
                          >
                            "{cl.notes}"
                          </p>
                        )}
                        <div
                          style={{
                            borderTop: `1px solid ${brd}`,
                            paddingTop: 10,
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <span style={{ fontSize: 11, color: muted }}>
                            Net (income − expenses)
                          </span>
                          <span
                            style={{
                              fontSize: 12,
                              fontWeight: 800,
                              color:
                                clPaid - clExp >= 0 ? "#10b981" : "#ef4444",
                            }}
                          >
                            {fmt(Math.round(clPaid - clExp))}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── TEAM WORKSPACE ── */}
          {tab === "team" && (
            <div className="fade-up">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: isMobile ? "flex-start" : "flex-end",
                  flexDirection: isMobile ? "column" : "row",
                  gap: 12,
                  marginBottom: 20,
                }}
              >
                <div>
                  <h1
                    style={{
                      fontFamily: "'Playfair Display',serif",
                      fontSize: isMobile ? 26 : 32,
                      letterSpacing: "-0.03em",
                      color: txt,
                    }}
                  >
                    Team Workspace
                  </h1>
                  <p style={{ color: muted, fontSize: 12, marginTop: 3 }}>
                    Invite your accountant or VA to view your finances
                  </p>
                </div>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setTeamForm({ name: "", email: "", role: "viewer" });
                    setTeamModal(true);
                  }}
                >
                  <Plus size={14} /> Invite Member
                </button>
              </div>

              {/* Access level explainer */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "1fr" : "repeat(3,1fr)",
                  gap: 12,
                  marginBottom: 18,
                }}
              >
                {[
                  {
                    role: "viewer",
                    color: "#3b82f6",
                    Icon: EyeIcon,
                    label: "Viewer",
                    desc: "Can see expenses, projects and reports. Cannot add or edit anything.",
                  },
                  {
                    role: "editor",
                    color: "#f97316",
                    Icon: Receipt,
                    label: "Editor",
                    desc: "Can add and edit expenses and projects. Cannot see income or team settings.",
                  },
                  {
                    role: "accountant",
                    color: "#10b981",
                    Icon: FileBarChart2,
                    label: "Accountant",
                    desc: "Full access to reports, tax data, and exports. Cannot change settings.",
                  },
                ].map((r) => (
                  <div
                    key={r.role}
                    style={{
                      padding: "14px 16px",
                      background: D ? "#1a1a1a" : "#f9fafb",
                      borderRadius: 14,
                      border: `1px solid ${brd}`,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 8,
                      }}
                    >
                      <div
                        style={{
                          width: 30,
                          height: 30,
                          borderRadius: 8,
                          background: `${r.color}15`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <r.Icon size={14} color={r.color} />
                      </div>
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: r.color,
                        }}
                      >
                        {r.label}
                      </span>
                    </div>
                    <p style={{ fontSize: 12, color: muted, lineHeight: 1.65 }}>
                      {r.desc}
                    </p>
                  </div>
                ))}
              </div>

              {teamMembers.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "52px 20px",
                    color: muted,
                  }}
                >
                  <UserCheck
                    size={44}
                    style={{ marginBottom: 14, opacity: 0.3 }}
                  />
                  <p
                    style={{
                      fontWeight: 800,
                      fontSize: 16,
                      color: txt,
                      marginBottom: 8,
                    }}
                  >
                    No team members yet
                  </p>
                  <p style={{ fontSize: 13, marginBottom: 20 }}>
                    Invite your accountant or virtual assistant to collaborate
                  </p>
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      setTeamForm({ name: "", email: "", role: "viewer" });
                      setTeamModal(true);
                    }}
                  >
                    <Plus size={14} /> Invite First Member
                  </button>
                </div>
              ) : (
                <div className="card" style={{ padding: isMobile ? 14 : 20 }}>
                  <p
                    style={{
                      fontWeight: 800,
                      fontSize: 14,
                      color: txt,
                      marginBottom: 14,
                      display: "flex",
                      alignItems: "center",
                      gap: 7,
                    }}
                  >
                    <Users2 size={14} color="#f97316" /> Team Members (
                    {teamMembers.length})
                  </p>
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 8 }}
                  >
                    {teamMembers.map((m) => {
                      const roleColors = {
                        viewer: "#3b82f6",
                        editor: "#f97316",
                        accountant: "#10b981",
                      };
                      const inviteLink = `${
                        window.location.origin
                      }?invite=${btoa(m.email + ":" + m.role + ":" + user.id)}`;
                      return (
                        <div
                          key={m.id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                            padding: "12px 14px",
                            background: D ? "#1a1a1a" : "#f9fafb",
                            borderRadius: 12,
                            border: `1px solid ${brd}`,
                            flexWrap: "wrap",
                          }}
                        >
                          <div
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: "50%",
                              background: `${roleColors[m.role]}18`,
                              border: `1.5px solid ${roleColors[m.role]}33`,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 14,
                              fontWeight: 700,
                              color: roleColors[m.role],
                              flexShrink: 0,
                            }}
                          >
                            {m.name[0]?.toUpperCase()}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p
                              style={{
                                fontWeight: 700,
                                fontSize: 13,
                                color: txt,
                              }}
                            >
                              {m.name}
                            </p>
                            <p style={{ fontSize: 11, color: muted }}>
                              {m.email}
                            </p>
                          </div>
                          <span
                            style={{
                              background: `${roleColors[m.role]}12`,
                              color: roleColors[m.role],
                              border: `1px solid ${roleColors[m.role]}25`,
                              borderRadius: 20,
                              padding: "3px 10px",
                              fontSize: 11,
                              fontWeight: 700,
                              textTransform: "capitalize",
                              flexShrink: 0,
                            }}
                          >
                            {m.role}
                          </span>
                          <div style={{ display: "flex", gap: 6 }}>
                            <button
                              onClick={() => {
                                navigator.clipboard
                                  .writeText(inviteLink)
                                  .catch(() => {});
                                showToast("Invite link copied!");
                              }}
                              style={{
                                padding: "5px 10px",
                                borderRadius: 8,
                                border: `1px solid ${brd}`,
                                background: "transparent",
                                color: muted,
                                fontSize: 11,
                                fontWeight: 600,
                                cursor: "pointer",
                                fontFamily: "inherit",
                                display: "flex",
                                alignItems: "center",
                                gap: 4,
                              }}
                            >
                              <Link size={11} /> Copy link
                            </button>
                            <button
                              onClick={() =>
                                setTeamMembers((p) =>
                                  p.filter((t) => t.id !== m.id)
                                )
                              }
                              className="btn btn-danger"
                              style={{ padding: "5px 8px" }}
                            >
                              <X size={12} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── REPORTS ── */}
          {tab === "reports" && (
            <div className="fade-up">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: isMobile ? "flex-start" : "flex-end",
                  flexDirection: isMobile ? "column" : "row",
                  gap: 12,
                  marginBottom: 20,
                }}
              >
                <div>
                  <h1
                    style={{
                      fontFamily: "'Playfair Display',serif",
                      fontSize: isMobile ? 26 : 32,
                      letterSpacing: "-0.03em",
                      color: txt,
                    }}
                  >
                    Tax Report
                  </h1>
                  <p
                    style={{
                      color: muted,
                      fontSize: 12,
                      marginTop: 3,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <Database size={11} /> BIR-ready · private to your account
                  </p>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    className="btn btn-ghost"
                    style={{ fontSize: 12 }}
                    onClick={exportCSV}
                  >
                    <Download size={13} /> CSV
                  </button>
                  {!isPro ? (
                    <button
                      className="btn btn-pro"
                      style={{ fontSize: 12 }}
                      onClick={() => setShowPlan(true)}
                    >
                      <Lock size={12} /> PDF · Pro
                    </button>
                  ) : (
                    <button
                      className="btn btn-primary"
                      style={{ fontSize: 12 }}
                      onClick={() => showToast("Generating PDF...", "warning")}
                    >
                      <Download size={13} /> PDF
                    </button>
                  )}
                </div>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "1fr" : "repeat(3,1fr)",
                  gap: 12,
                  marginBottom: 14,
                }}
              >
                {[
                  {
                    label: "Total Deductible",
                    val: fmt(grandTotal),
                    sub: "all time",
                    Icon: TrendingUp,
                  },
                  {
                    label: "Est. Tax Savings",
                    val: fmt(estSavings),
                    sub: "at 20% rate",
                    Icon: Shield,
                    accent: "#16a34a",
                  },
                  {
                    label: "Expenses Filed",
                    val: expenses.length,
                    sub: `${Object.keys(catTotals).length} categories`,
                    Icon: FileText,
                  },
                ].map((s, i) => (
                  <div
                    key={i}
                    className="card"
                    style={{
                      padding: 18,
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        top: 10,
                        right: 10,
                        opacity: 0.05,
                      }}
                    >
                      <s.Icon size={34} />
                    </div>
                    <p className="lbl" style={{ marginBottom: 6 }}>
                      {s.label}
                    </p>
                    <p
                      style={{
                        fontFamily: "'Playfair Display',serif",
                        fontSize: isMobile ? 22 : 28,
                        color: s.accent || txt,
                        lineHeight: 1,
                        letterSpacing: "-0.02em",
                      }}
                    >
                      {s.val}
                    </p>
                    <p style={{ fontSize: 11, color: muted, marginTop: 5 }}>
                      {s.sub}
                    </p>
                  </div>
                ))}
              </div>
              {!isPro && expenses.length > 0 && (
                <div style={{ marginBottom: 14 }}>
                  <UpgradeNudge
                    feature="PDF export (BIR-ready, accountant-ready)"
                    onUpgrade={() => setShowPlan(true)}
                    D={D}
                    brd={brd}
                  />
                </div>
              )}
              {expenses.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "48px 0",
                    color: muted,
                  }}
                >
                  <FileBarChart2
                    size={38}
                    style={{ marginBottom: 10, opacity: 0.3 }}
                  />
                  <p style={{ fontSize: 14, color: txt, fontWeight: 700 }}>
                    No data to report yet
                  </p>
                </div>
              ) : (
                <>
                  <div
                    className="card"
                    style={{ padding: isMobile ? 14 : 20, marginBottom: 12 }}
                  >
                    <p
                      style={{
                        fontWeight: 800,
                        fontSize: 14,
                        marginBottom: 14,
                        color: txt,
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <FolderOpen size={14} color="#f97316" /> By Project
                    </p>
                    <div style={{ overflowX: "auto" }}>
                      <table
                        style={{
                          width: "100%",
                          borderCollapse: "collapse",
                          fontSize: 12,
                          minWidth: 400,
                        }}
                      >
                        <thead>
                          <tr style={{ borderBottom: `2px solid ${brd}` }}>
                            {[
                              "Project",
                              "Client",
                              "Exp.",
                              "Total",
                              "Share",
                              "Savings",
                            ].map((h) => (
                              <th
                                key={h}
                                style={{
                                  textAlign: "left",
                                  padding: "7px 8px",
                                  fontSize: 10,
                                  fontWeight: 800,
                                  color: muted,
                                  textTransform: "uppercase",
                                  letterSpacing: ".06em",
                                }}
                              >
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {projects.map((p) => {
                            const spent = Math.round(projTotals[p.id] || 0);
                            const cnt = expenses.filter((e) =>
                              e.splits.some((s) => s.pid === p.id)
                            ).length;
                            return (
                              <tr
                                key={p.id}
                                style={{
                                  borderBottom: `1px solid ${
                                    D ? "#1a1a1a" : "#f5f5f5"
                                  }`,
                                }}
                              >
                                <td style={{ padding: "9px 8px" }}>
                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 6,
                                    }}
                                  >
                                    <div
                                      style={{
                                        width: 8,
                                        height: 8,
                                        borderRadius: "50%",
                                        background: p.color,
                                      }}
                                    />
                                    <strong style={{ color: txt }}>
                                      {p.name}
                                    </strong>
                                  </div>
                                </td>
                                <td
                                  style={{ padding: "9px 8px", color: muted }}
                                >
                                  {p.client}
                                </td>
                                <td
                                  style={{ padding: "9px 8px", color: muted }}
                                >
                                  {cnt}
                                </td>
                                <td
                                  style={{
                                    padding: "9px 8px",
                                    fontWeight: 800,
                                    color: txt,
                                  }}
                                >
                                  {fmt(spent)}
                                </td>
                                <td style={{ padding: "9px 8px" }}>
                                  <span
                                    style={{
                                      background: `${p.color}18`,
                                      color: p.color,
                                      border: `1px solid ${p.color}33`,
                                      borderRadius: 20,
                                      padding: "2px 8px",
                                      fontSize: 11,
                                      fontWeight: 700,
                                    }}
                                  >
                                    {grandTotal
                                      ? Math.round((spent / grandTotal) * 100)
                                      : 0}
                                    %
                                  </span>
                                </td>
                                <td
                                  style={{
                                    padding: "9px 8px",
                                    fontWeight: 800,
                                    color: "#16a34a",
                                  }}
                                >
                                  {fmt(Math.round(spent * 0.2))}
                                </td>
                              </tr>
                            );
                          })}
                          <tr style={{ borderTop: `2px solid ${txt}` }}>
                            <td
                              colSpan={3}
                              style={{
                                padding: "9px 8px",
                                fontWeight: 900,
                                color: txt,
                              }}
                            >
                              TOTAL
                            </td>
                            <td
                              style={{
                                padding: "9px 8px",
                                fontWeight: 900,
                                color: txt,
                              }}
                            >
                              {fmt(grandTotal)}
                            </td>
                            <td
                              style={{
                                padding: "9px 8px",
                                fontWeight: 900,
                                color: txt,
                              }}
                            >
                              100%
                            </td>
                            <td
                              style={{
                                padding: "9px 8px",
                                fontWeight: 900,
                                color: "#16a34a",
                              }}
                            >
                              {fmt(estSavings)}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div className="card" style={{ padding: isMobile ? 14 : 20 }}>
                    <p
                      style={{
                        fontWeight: 800,
                        fontSize: 14,
                        marginBottom: 14,
                        color: txt,
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <Tag size={14} color="#f97316" /> By Category
                    </p>
                    {Object.entries(catTotals)
                      .sort((a, b) => b[1] - a[1])
                      .map(([cat, total]) => {
                        const { Icon: CIc, color: cClr } =
                          CAT_META[cat] || CAT_META.Other;
                        return (
                          <div key={cat} style={{ marginBottom: 12 }}>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: 4,
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 7,
                                }}
                              >
                                <CIc size={13} color={cClr} />
                                <span
                                  style={{
                                    fontSize: 13,
                                    fontWeight: 700,
                                    color: txt,
                                  }}
                                >
                                  {cat}
                                </span>
                              </div>
                              <div
                                style={{
                                  display: "flex",
                                  gap: 10,
                                  alignItems: "center",
                                }}
                              >
                                <span style={{ fontSize: 11, color: muted }}>
                                  {Math.round((total / grandTotal) * 100)}%
                                </span>
                                <span
                                  style={{
                                    fontSize: 13,
                                    fontWeight: 800,
                                    color: txt,
                                  }}
                                >
                                  {fmt(total)}
                                </span>
                              </div>
                            </div>
                            <div className="prog">
                              <div
                                className="prog-bar"
                                style={{
                                  width: `${(total / grandTotal) * 100}%`,
                                  background: cClr,
                                }}
                              />
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </>
              )}
            </div>
          )}
        </main>
      </div>
      {/* end main content area */}

      {isMobile && (
        <nav
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            background: D ? "rgba(14,14,14,.97)" : "rgba(255,255,255,.97)",
            borderTop: `1px solid ${
              D ? "rgba(255,255,255,.07)" : "rgba(0,0,0,.07)"
            }`,
            display: "flex",
            zIndex: 200,
            backdropFilter: "blur(20px)",
            paddingBottom: "env(safe-area-inset-bottom,0px)",
          }}
        >
          {navItems.map(({ id, Icon, label }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 3,
                flex: 1,
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "8px 0 10px",
                fontFamily: "inherit",
                fontSize: 9,
                fontWeight: 800,
                color: tab === id ? "#f97316" : muted,
                transition: "all .15s",
                letterSpacing: ".04em",
                textTransform: "uppercase",
                position: "relative",
              }}
            >
              {tab === id && (
                <span
                  style={{
                    position: "absolute",
                    top: 0,
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: 28,
                    height: 2,
                    background: "#f97316",
                    borderRadius: "0 0 3px 3px",
                  }}
                />
              )}
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 9,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background:
                    tab === id ? "rgba(249,115,22,.1)" : "transparent",
                  transition: "all .15s",
                }}
              >
                <Icon
                  size={tab === id ? 20 : 18}
                  strokeWidth={tab === id ? 2.2 : 1.8}
                />
              </div>
              <span>{label}</span>
            </button>
          ))}
        </nav>
      )}

      {/* RECEIPT SCANNER MODAL */}
      {scanModal && (
        <div
          className="overlay"
          onClick={(e) => e.target === e.currentTarget && setScanModal(false)}
        >
          <div className="modal scale-in" style={{ maxWidth: 480 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 18,
              }}
            >
              <h2
                style={{
                  fontFamily: "'Playfair Display',serif",
                  fontSize: 22,
                  color: txt,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <Camera size={18} color="#f97316" /> Scan Receipt
              </h2>
              <button
                className="btn btn-ghost"
                style={{ padding: "6px 9px" }}
                onClick={() => {
                  setScanModal(false);
                  setScanResult(null);
                }}
              >
                <X size={15} />
              </button>
            </div>

            {!scanResult ? (
              <div>
                <div
                  style={{
                    border: `2px dashed ${brd}`,
                    borderRadius: 14,
                    padding: "32px 20px",
                    textAlign: "center",
                    marginBottom: 16,
                    background: D ? "#1a1a1a" : "#f9fafb",
                  }}
                >
                  <Camera
                    size={36}
                    color={muted}
                    style={{ marginBottom: 12, opacity: 0.5 }}
                  />
                  <p
                    style={{
                      fontWeight: 700,
                      fontSize: 14,
                      color: txt,
                      marginBottom: 6,
                    }}
                  >
                    Upload a receipt photo
                  </p>
                  <p style={{ fontSize: 12, color: muted, marginBottom: 16 }}>
                    Claude AI will read the amount, merchant, and date
                    automatically
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    id="receipt-upload"
                    style={{ display: "none" }}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setScanLoading(true);
                      try {
                        const b64 = await new Promise((res, rej) => {
                          const r = new FileReader();
                          r.onload = () => res(r.result.split(",")[1]);
                          r.onerror = rej;
                          r.readAsDataURL(file);
                        });
                        const resp = await fetch(
                          "https://api.anthropic.com/v1/messages",
                          {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              model: "claude-sonnet-4-20250514",
                              max_tokens: 500,
                              messages: [
                                {
                                  role: "user",
                                  content: [
                                    {
                                      type: "image",
                                      source: {
                                        type: "base64",
                                        media_type: file.type,
                                        data: b64,
                                      },
                                    },
                                    {
                                      type: "text",
                                      text: `Extract receipt data. Respond ONLY with valid JSON, no markdown:
{"description":"merchant or item name","amount":number,"date":"YYYY-MM-DD","category":"one of: Meals|Transport|Software|Equipment|Office|Marketing|Communication|Other","confidence":"high|medium|low"}
If you cannot read a field clearly, use null. Date format must be YYYY-MM-DD.`,
                                    },
                                  ],
                                },
                              ],
                            }),
                          }
                        );
                        const data = await resp.json();
                        const text = data.content?.[0]?.text || "{}";
                        const clean = text
                          .replace(/\`\`\`json|\`\`\`/g, "")
                          .trim();
                        const parsed = JSON.parse(clean);
                        setScanResult({ ...parsed, raw: text });
                      } catch (err) {
                        showToast(
                          "Could not read receipt — try a clearer photo",
                          "error"
                        );
                      } finally {
                        setScanLoading(false);
                      }
                    }}
                  />
                  <label
                    htmlFor="receipt-upload"
                    style={{
                      background: "#f97316",
                      color: "#fff",
                      border: "none",
                      borderRadius: 10,
                      padding: "10px 22px",
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 7,
                    }}
                  >
                    {scanLoading ? (
                      <>
                        <span
                          style={{
                            width: 14,
                            height: 14,
                            border: "2px solid rgba(255,255,255,.3)",
                            borderTopColor: "#fff",
                            borderRadius: "50%",
                            display: "inline-block",
                            animation: "spin .7s linear infinite",
                          }}
                        />{" "}
                        Reading...
                      </>
                    ) : (
                      <>
                        <Camera size={14} /> Choose Photo
                      </>
                    )}
                  </label>
                </div>
                <div
                  style={{
                    padding: "12px 14px",
                    background: D ? "#1a1200" : "#fffbeb",
                    border: `1px solid ${D ? "#3a2800" : "#fed7aa"}`,
                    borderRadius: 10,
                    display: "flex",
                    gap: 8,
                  }}
                >
                  <Sparkles
                    size={13}
                    color="#f97316"
                    style={{ flexShrink: 0, marginTop: 1 }}
                  />
                  <p
                    style={{
                      fontSize: 12,
                      color: D ? "#d97706" : "#92400e",
                      lineHeight: 1.7,
                    }}
                  >
                    Works best with clear, well-lit photos. Supports printed and
                    digital receipts. Claude reads the merchant name, total
                    amount, and date.
                  </p>
                </div>
              </div>
            ) : (
              <div>
                <div
                  style={{
                    background: D ? "#0a1a0a" : "#f0fdf4",
                    border: `1px solid ${D ? "#1a3a1a" : "#bbf7d0"}`,
                    borderRadius: 12,
                    padding: "14px 16px",
                    marginBottom: 14,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <CheckCircle2
                    size={15}
                    color="#10b981"
                    style={{ flexShrink: 0 }}
                  />
                  <div>
                    <p
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: "#10b981",
                        marginBottom: 2,
                      }}
                    >
                      Receipt scanned successfully!
                    </p>
                    <p
                      style={{ fontSize: 11, color: D ? "#86efac" : "#16a34a" }}
                    >
                      Confidence: {scanResult.confidence || "medium"} — review
                      and edit before saving
                    </p>
                  </div>
                </div>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 12 }}
                >
                  <div>
                    <label className="lbl">Description</label>
                    <input
                      className="input"
                      value={scanResult.description || ""}
                      onChange={(e) =>
                        setScanResult((r) => ({
                          ...r,
                          description: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 10,
                    }}
                  >
                    <div>
                      <label className="lbl">Amount (₱)</label>
                      <input
                        className="input"
                        type="number"
                        value={scanResult.amount || ""}
                        onChange={(e) =>
                          setScanResult((r) => ({
                            ...r,
                            amount: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div>
                      <label className="lbl">Date</label>
                      <input
                        className="input"
                        type="date"
                        value={
                          scanResult.date ||
                          new Date().toISOString().split("T")[0]
                        }
                        onChange={(e) =>
                          setScanResult((r) => ({ ...r, date: e.target.value }))
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <label className="lbl">Category</label>
                    <select
                      className="input"
                      value={scanResult.category || "Other"}
                      onChange={(e) =>
                        setScanResult((r) => ({
                          ...r,
                          category: e.target.value,
                        }))
                      }
                    >
                      {[
                        "Meals",
                        "Transport",
                        "Software",
                        "Equipment",
                        "Office",
                        "Marketing",
                        "Communication",
                        "Other",
                      ].map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
                  <button
                    className="btn btn-primary"
                    style={{ flex: 1, justifyContent: "center", padding: 12 }}
                    onClick={() => {
                      if (!scanResult.amount || !scanResult.description) {
                        showToast("Check amount and description", "error");
                        return;
                      }
                      const splits =
                        projects.length > 0
                          ? [{ pid: projects[0].id, pct: 100 }]
                          : [];
                      setForm({
                        description: scanResult.description || "",
                        amount: String(scanResult.amount || ""),
                        category: scanResult.category || "Other",
                        date:
                          scanResult.date ||
                          new Date().toISOString().split("T")[0],
                        splits,
                        notes: "Scanned from receipt",
                      });
                      setScanModal(false);
                      setScanResult(null);
                      setEditId(null);
                      setModal("expense");
                      showToast("Receipt loaded — review and save!");
                    }}
                  >
                    <Check size={14} /> Use this data
                  </button>
                  <button
                    className="btn btn-ghost"
                    onClick={() => setScanResult(null)}
                  >
                    Rescan
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TEAM MODAL */}
      {teamModal && (
        <div
          className="overlay"
          onClick={(e) => e.target === e.currentTarget && setTeamModal(false)}
        >
          <div className="modal scale-in" style={{ maxWidth: 380 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 18,
              }}
            >
              <h2
                style={{
                  fontFamily: "'Playfair Display',serif",
                  fontSize: 22,
                  color: txt,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <UserCheck size={18} color="#3b82f6" /> Invite Member
              </h2>
              <button
                className="btn btn-ghost"
                style={{ padding: "6px 9px" }}
                onClick={() => setTeamModal(false)}
              >
                <X size={15} />
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
              <div>
                <label className="lbl">Name *</label>
                <input
                  className="input"
                  placeholder="e.g. Maria Santos"
                  value={teamForm.name}
                  onChange={(e) =>
                    setTeamForm((f) => ({ ...f, name: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="lbl">Email *</label>
                <input
                  className="input"
                  type="email"
                  placeholder="accountant@email.com"
                  value={teamForm.email}
                  onChange={(e) =>
                    setTeamForm((f) => ({ ...f, email: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="lbl">Access Level</label>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 8 }}
                >
                  {[
                    {
                      role: "viewer",
                      label: "Viewer",
                      desc: "See expenses and reports only",
                      color: "#3b82f6",
                    },
                    {
                      role: "editor",
                      label: "Editor",
                      desc: "Add and edit expenses and projects",
                      color: "#f97316",
                    },
                    {
                      role: "accountant",
                      label: "Accountant",
                      desc: "Full report and tax data access",
                      color: "#10b981",
                    },
                  ].map((r) => (
                    <button
                      key={r.role}
                      onClick={() =>
                        setTeamForm((f) => ({ ...f, role: r.role }))
                      }
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "10px 12px",
                        borderRadius: 10,
                        border: `1.5px solid ${
                          teamForm.role === r.role ? r.color : brd
                        }`,
                        background:
                          teamForm.role === r.role
                            ? `${r.color}10`
                            : "transparent",
                        cursor: "pointer",
                        fontFamily: "inherit",
                        textAlign: "left",
                        transition: "all .15s",
                      }}
                    >
                      <div
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background:
                            teamForm.role === r.role ? r.color : muted,
                          flexShrink: 0,
                        }}
                      />
                      <div>
                        <p
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: teamForm.role === r.role ? r.color : txt,
                          }}
                        >
                          {r.label}
                        </p>
                        <p style={{ fontSize: 11, color: muted }}>{r.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
              <button
                className="btn btn-primary"
                style={{ flex: 1, justifyContent: "center", padding: 12 }}
                onClick={() => {
                  if (!teamForm.name.trim() || !teamForm.email.trim()) {
                    showToast("Fill in name and email", "error");
                    return;
                  }
                  const member = { ...teamForm, id: Date.now().toString() };
                  setTeamMembers((p) => [...p, member]);
                  const link = `${window.location.origin}?invite=${btoa(
                    teamForm.email + ":" + teamForm.role + ":" + user.id
                  )}`;
                  navigator.clipboard.writeText(link).catch(() => {});
                  setTeamModal(false);
                  showToast("Member added — invite link copied!");
                }}
              >
                <Check size={14} /> Send Invite
              </button>
              <button
                className="btn btn-ghost"
                onClick={() => setTeamModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GOAL MODAL */}
      {goalModal && (
        <div
          className="overlay"
          onClick={(e) => e.target === e.currentTarget && setGoalModal(false)}
        >
          <div className="modal scale-in" style={{ maxWidth: 360 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 18,
              }}
            >
              <h2
                style={{
                  fontFamily: "'Playfair Display',serif",
                  fontSize: 22,
                  color: txt,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <Target size={18} color="#f97316" /> New Goal
              </h2>
              <button
                className="btn btn-ghost"
                style={{ padding: "6px 9px" }}
                onClick={() => setGoalModal(false)}
              >
                <X size={15} />
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
              <div>
                <label className="lbl">Goal Label *</label>
                <input
                  className="input"
                  placeholder="e.g. New Laptop, Emergency Fund"
                  value={goalForm.label}
                  onChange={(e) =>
                    setGoalForm((f) => ({ ...f, label: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="lbl">Target Amount (₱) *</label>
                <input
                  className="input"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={goalForm.target}
                  onChange={(e) =>
                    setGoalForm((f) => ({ ...f, target: e.target.value }))
                  }
                />
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
              <button
                className="btn btn-primary"
                style={{ flex: 1, justifyContent: "center", padding: 12 }}
                onClick={() => {
                  if (!goalForm.label.trim() || !goalForm.target) {
                    showToast("Fill in goal and target", "error");
                    return;
                  }
                  addGoal(goalForm);
                  setGoalModal(false);
                  showToast("Goal set!");
                }}
              >
                <Check size={14} /> Save Goal
              </button>
              <button
                className="btn btn-ghost"
                onClick={() => setGoalModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CLIENT MODAL */}
      {clModal && (
        <div
          className="overlay"
          onClick={(e) => e.target === e.currentTarget && setClModal(false)}
        >
          <div className="modal scale-in" style={{ maxWidth: 380 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 18,
              }}
            >
              <h2
                style={{
                  fontFamily: "'Playfair Display',serif",
                  fontSize: 22,
                  color: txt,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <Users2 size={18} color="#a855f7" /> Add Client
              </h2>
              <button
                className="btn btn-ghost"
                style={{ padding: "6px 9px" }}
                onClick={() => setClModal(false)}
              >
                <X size={15} />
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
              <div>
                <label className="lbl">Client Name *</label>
                <input
                  className="input"
                  placeholder="e.g. Acme Corp"
                  value={clForm.name}
                  onChange={(e) =>
                    setClForm((f) => ({ ...f, name: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="lbl">Email</label>
                <input
                  className="input"
                  type="email"
                  placeholder="contact@client.com"
                  value={clForm.email}
                  onChange={(e) =>
                    setClForm((f) => ({ ...f, email: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="lbl">Payment Terms (days)</label>
                <input
                  className="input"
                  type="number"
                  min="1"
                  placeholder="30"
                  value={clForm.terms}
                  onChange={(e) =>
                    setClForm((f) => ({ ...f, terms: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="lbl">Notes</label>
                <textarea
                  className="input"
                  placeholder="e.g. Usually pays via GCash, slow to respond"
                  value={clForm.notes}
                  onChange={(e) =>
                    setClForm((f) => ({ ...f, notes: e.target.value }))
                  }
                />
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
              <button
                className="btn btn-primary"
                style={{ flex: 1, justifyContent: "center", padding: 12 }}
                onClick={() => {
                  if (!clForm.name.trim()) {
                    showToast("Client name required", "error");
                    return;
                  }
                  addClient(clForm);
                  setClModal(false);
                  showToast("Client added!");
                }}
              >
                <Check size={14} /> Save Client
              </button>
              <button
                className="btn btn-ghost"
                onClick={() => setClModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INCOME MODAL */}
      {incModal && (
        <div
          className="overlay"
          onClick={(e) => e.target === e.currentTarget && setIncModal(false)}
        >
          <div className="modal scale-in" style={{ maxWidth: 400 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 18,
              }}
            >
              <h2
                style={{
                  fontFamily: "'Playfair Display',serif",
                  fontSize: 22,
                  color: txt,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <Banknote size={18} color="#10b981" /> Log Payment
              </h2>
              <button
                className="btn btn-ghost"
                style={{ padding: "6px 9px" }}
                onClick={() => setIncModal(false)}
              >
                <X size={15} />
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
              <div>
                <label className="lbl">Amount (₱) *</label>
                <input
                  className="input"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={incForm.amount}
                  onChange={(e) =>
                    setIncForm((f) => ({ ...f, amount: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="lbl">Client / Source *</label>
                <input
                  className="input"
                  placeholder="e.g. Acme Corp"
                  value={incForm.client}
                  onChange={(e) =>
                    setIncForm((f) => ({ ...f, client: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="lbl">Description</label>
                <input
                  className="input"
                  placeholder="e.g. Website redesign — milestone 2"
                  value={incForm.desc}
                  onChange={(e) =>
                    setIncForm((f) => ({ ...f, desc: e.target.value }))
                  }
                />
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                }}
              >
                <div>
                  <label className="lbl">Invoice Date</label>
                  <input
                    className="input"
                    type="date"
                    value={incForm.date}
                    onChange={(e) =>
                      setIncForm((f) => ({ ...f, date: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className="lbl">Due Date (optional)</label>
                  <input
                    className="input"
                    type="date"
                    value={incForm.dueDate || ""}
                    onChange={(e) =>
                      setIncForm((f) => ({ ...f, dueDate: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div>
                <label className="lbl">Status</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {["pending", "paid", "overdue"].map((s) => (
                    <button
                      key={s}
                      onClick={() => setIncForm((f) => ({ ...f, status: s }))}
                      style={{
                        flex: 1,
                        padding: "8px",
                        borderRadius: 9,
                        border: `1.5px solid ${
                          incForm.status === s
                            ? s === "paid"
                              ? "#10b981"
                              : s === "overdue"
                              ? "#ef4444"
                              : "#f97316"
                            : "#333"
                        }`,
                        background:
                          incForm.status === s
                            ? s === "paid"
                              ? "rgba(16,185,129,.12)"
                              : s === "overdue"
                              ? "rgba(239,68,68,.12)"
                              : "rgba(249,115,22,.12)"
                            : "transparent",
                        color:
                          incForm.status === s
                            ? s === "paid"
                              ? "#10b981"
                              : s === "overdue"
                              ? "#ef4444"
                              : "#f97316"
                            : "#666",
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: "pointer",
                        fontFamily: "inherit",
                        textTransform: "capitalize",
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
              <button
                className="btn btn-primary"
                style={{ flex: 1, justifyContent: "center", padding: 12 }}
                onClick={() => {
                  if (!incForm.amount || !incForm.client) {
                    showToast("Fill in amount and client", "error");
                    return;
                  }
                  addIncome(incForm);
                  setIncModal(false);
                  showToast("Payment logged!");
                }}
              >
                <Check size={14} /> Save Payment
              </button>
              <button
                className="btn btn-ghost"
                onClick={() => setIncModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EXPENSE MODAL */}
      {modal === "expense" && (
        <div
          className="overlay"
          onClick={(e) => e.target === e.currentTarget && setModal(null)}
        >
          <div className="modal scale-in">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 18,
              }}
            >
              <h2
                style={{
                  fontFamily: "'Playfair Display',serif",
                  fontSize: isMobile ? 21 : 25,
                  color: txt,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                {editId ? (
                  <>
                    <Pencil size={17} color="#f97316" /> Edit Expense
                  </>
                ) : (
                  <>
                    <Plus size={17} color="#f97316" /> New Expense
                  </>
                )}
              </h2>
              <button
                className="btn btn-ghost"
                style={{ padding: "6px 9px" }}
                onClick={() => setModal(null)}
              >
                <X size={15} />
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
              <div>
                <label className="lbl">Description *</label>
                <input
                  className="input"
                  placeholder="e.g. Adobe Creative Cloud"
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                />
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                }}
              >
                <div>
                  <label className="lbl">Amount (₱) *</label>
                  <input
                    className="input"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={form.amount}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, amount: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className="lbl">Date *</label>
                  <input
                    className="input"
                    type="date"
                    value={form.date}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, date: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div>
                <label className="lbl">Category</label>
                <div style={{ position: "relative" }}>
                  {(() => {
                    const { Icon: CIc, color: cClr } =
                      CAT_META[form.category] || CAT_META.Other;
                    return (
                      <CIc
                        size={13}
                        color={cClr}
                        style={{
                          position: "absolute",
                          left: 13,
                          top: "50%",
                          transform: "translateY(-50%)",
                          pointerEvents: "none",
                        }}
                      />
                    );
                  })()}
                  <select
                    className="input"
                    value={form.category}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, category: e.target.value }))
                    }
                    style={{ paddingLeft: 33 }}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label
                  className="lbl"
                  style={{ display: "flex", alignItems: "center", gap: 5 }}
                >
                  <StickyNote size={10} /> Notes{" "}
                  <span
                    style={{
                      fontWeight: 400,
                      textTransform: "none",
                      letterSpacing: 0,
                    }}
                  >
                    (optional — explain your split)
                  </span>
                </label>
                <textarea
                  className="input"
                  placeholder="e.g. Split 60/40 — Alpha used Adobe CC more this month"
                  value={form.notes || ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, notes: e.target.value }))
                  }
                />
              </div>
              {AI_TIPS[form.category] && (
                <div
                  style={{
                    background: D ? "#1a1200" : "#fffbeb",
                    border: `1px solid ${D ? "#3a2800" : "#fed7aa"}`,
                    borderRadius: 10,
                    padding: "11px 13px",
                    display: "flex",
                    gap: 9,
                    alignItems: "flex-start",
                  }}
                >
                  <Sparkles
                    size={13}
                    color="#f97316"
                    style={{ flexShrink: 0, marginTop: 1 }}
                  />
                  <div>
                    <p
                      style={{
                        fontSize: 10,
                        fontWeight: 800,
                        color: D ? "#fbbf24" : "#92400e",
                        marginBottom: 2,
                      }}
                    >
                      AI Split Suggestion
                      {!isPro && (
                        <span style={{ color: muted, fontWeight: 400 }}>
                          {" "}
                          · Pro only
                        </span>
                      )}
                    </p>
                    <p
                      style={{ fontSize: 12, color: D ? "#d97706" : "#78350f" }}
                    >
                      {isPro
                        ? AI_TIPS[form.category]
                        : "Upgrade to Pro to unlock AI split suggestions."}
                    </p>
                  </div>
                </div>
              )}
              {projects.length === 0 && (
                <div
                  style={{
                    background: D ? "#1a0e00" : "#fff7ed",
                    border: `1px solid ${D ? "#3a2000" : "#fed7aa"}`,
                    borderRadius: 10,
                    padding: "11px 13px",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: 13,
                    color: "#d97706",
                    fontWeight: 600,
                  }}
                >
                  <AlertTriangle size={14} /> Create a project first before
                  adding expenses.
                </div>
              )}
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 8,
                  }}
                >
                  <label
                    className="lbl"
                    style={{
                      margin: 0,
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                    }}
                  >
                    <Zap size={10} color="#f97316" /> Smart Split *{" "}
                    <span
                      style={{
                        fontWeight: 400,
                        textTransform: "none",
                        letterSpacing: 0,
                        fontSize: 10,
                      }}
                    >
                      — max {maxSpl}
                    </span>
                  </label>
                  <div
                    style={{ display: "flex", gap: 7, alignItems: "center" }}
                  >
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 800,
                        color: totalPct === 100 ? "#16a34a" : "#ef4444",
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      {totalPct === 100 ? (
                        <CheckCircle2 size={12} />
                      ) : (
                        <AlertTriangle size={12} />
                      )}{" "}
                      {totalPct}%
                    </span>
                    <button
                      className="btn btn-ghost"
                      style={{ padding: "3px 9px", fontSize: 11 }}
                      onClick={autoSplit}
                    >
                      <Zap size={11} /> Auto
                    </button>
                  </div>
                </div>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 7 }}
                >
                  {form.splits.map((s, i) => (
                    <div key={i} className="split-row">
                      <div
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          background: pClr(projects, s.pid),
                          flexShrink: 0,
                        }}
                      />
                      <select
                        className="input"
                        style={{ flex: 2, minWidth: 0 }}
                        value={s.pid}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            splits: f.splits.map((x, j) =>
                              j === i ? { ...x, pid: e.target.value } : x
                            ),
                          }))
                        }
                      >
                        {projects.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                      <div
                        style={{
                          position: "relative",
                          width: 72,
                          flexShrink: 0,
                        }}
                      >
                        <input
                          className="input"
                          type="number"
                          min="0"
                          max="100"
                          value={s.pct}
                          style={{ paddingRight: 20 }}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              splits: f.splits.map((x, j) =>
                                j === i
                                  ? { ...x, pct: Number(e.target.value) }
                                  : x
                              ),
                            }))
                          }
                        />
                        <span
                          style={{
                            position: "absolute",
                            right: 9,
                            top: "50%",
                            transform: "translateY(-50%)",
                            color: muted,
                            fontSize: 11,
                            pointerEvents: "none",
                          }}
                        >
                          %
                        </span>
                      </div>
                      {form.amount && (
                        <span
                          style={{
                            fontSize: 11,
                            color: muted,
                            fontWeight: 700,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {fmt(Math.round((Number(form.amount) * s.pct) / 100))}
                        </span>
                      )}
                      {form.splits.length > 1 && (
                        <button
                          className="btn btn-danger"
                          style={{ padding: "5px 7px", flexShrink: 0 }}
                          onClick={() =>
                            setForm((f) => ({
                              ...f,
                              splits: f.splits.filter((_, j) => j !== i),
                            }))
                          }
                        >
                          <X size={12} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {splErr && (
                  <p
                    style={{
                      fontSize: 12,
                      color: "#ef4444",
                      marginTop: 5,
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                    }}
                  >
                    <AlertTriangle size={12} /> {splErr}
                  </p>
                )}
                {!splErr && totalPct === 100 && form.splits.length > 0 && (
                  <p
                    style={{
                      fontSize: 12,
                      color: "#16a34a",
                      marginTop: 5,
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                    }}
                  >
                    <CheckCircle2 size={12} /> Splits look good!
                  </p>
                )}
                {form.splits.length < Math.min(maxSpl, projects.length) ? (
                  <button
                    onClick={() =>
                      setForm((f) => ({
                        ...f,
                        splits: [
                          ...f.splits,
                          { pid: projects[0]?.id || "", pct: 0 },
                        ],
                      }))
                    }
                    style={{
                      marginTop: 8,
                      background: D ? "#1a1a1a" : "#f9fafb",
                      border: `1.5px dashed ${brd}`,
                      borderRadius: 10,
                      padding: 9,
                      width: "100%",
                      cursor: "pointer",
                      fontSize: 13,
                      color: muted,
                      fontFamily: "inherit",
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                    }}
                  >
                    <Plus size={13} /> Split to another project
                  </button>
                ) : (
                  !isPro &&
                  form.splits.length >= maxSpl && (
                    <button
                      onClick={() => setShowPlan(true)}
                      style={{
                        marginTop: 8,
                        background: D ? "#1a0e00" : "#fff7ed",
                        border: "1.5px dashed #f97316",
                        borderRadius: 10,
                        padding: 9,
                        width: "100%",
                        cursor: "pointer",
                        fontSize: 13,
                        color: "#f97316",
                        fontFamily: "inherit",
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6,
                      }}
                    >
                      <Lock size={13} /> Upgrade to Pro for 4-way splitting
                    </button>
                  )
                )}
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
              <button
                className="btn btn-primary"
                style={{
                  flex: 1,
                  justifyContent: "center",
                  padding: 12,
                  opacity: saving ? 0.7 : 1,
                }}
                onClick={saveExpense}
                disabled={saving || projects.length === 0}
              >
                {saving ? (
                  <>
                    <RefreshCw
                      size={14}
                      style={{ animation: "spin .8s linear infinite" }}
                    />{" "}
                    Saving...
                  </>
                ) : (
                  <>
                    <Check size={14} />{" "}
                    {editId ? "Save Changes" : "Add Expense"}
                  </>
                )}
              </button>
              <button className="btn btn-ghost" onClick={() => setModal(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PROJECT MODAL */}
      {modal === "project" && (
        <div
          className="overlay"
          onClick={(e) => e.target === e.currentTarget && setModal(null)}
        >
          <div className="modal scale-in" style={{ maxWidth: 400 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <h2
                style={{
                  fontFamily: "'Playfair Display',serif",
                  fontSize: 23,
                  color: txt,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <FolderOpen size={18} color="#f97316" /> New Project
              </h2>
              <button
                className="btn btn-ghost"
                style={{ padding: "6px 9px" }}
                onClick={() => setModal(null)}
              >
                <X size={15} />
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
              <div>
                <label className="lbl">Project Name *</label>
                <input
                  className="input"
                  placeholder="e.g. Website Redesign"
                  value={pForm.name}
                  onChange={(e) =>
                    setPForm((f) => ({ ...f, name: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="lbl">Client Name</label>
                <input
                  className="input"
                  placeholder="e.g. Acme Corp"
                  value={pForm.client}
                  onChange={(e) =>
                    setPForm((f) => ({ ...f, client: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="lbl">Budget (₱) — optional</label>
                <input
                  className="input"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={pForm.budget}
                  onChange={(e) =>
                    setPForm((f) => ({ ...f, budget: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="lbl">Color</label>
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    flexWrap: "wrap",
                    marginBottom: 10,
                  }}
                >
                  {PALETTE.map((c) => (
                    <div
                      key={c}
                      className={`color-swatch ${
                        pForm.color === c ? "sel" : ""
                      }`}
                      style={{ background: c }}
                      onClick={() => setPForm((f) => ({ ...f, color: c }))}
                    />
                  ))}
                </div>
                <div
                  style={{
                    padding: "9px 12px",
                    background: `${pForm.color}12`,
                    border: `1px solid ${pForm.color}30`,
                    borderRadius: 10,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 6,
                      background: pForm.color,
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontSize: 13,
                      color: pForm.color,
                      fontWeight: 700,
                    }}
                  >
                    {pForm.name || "Preview"}
                  </span>
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button
                className="btn btn-primary"
                style={{
                  flex: 1,
                  justifyContent: "center",
                  padding: 12,
                  opacity: saving ? 0.7 : 1,
                }}
                onClick={saveProject}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <RefreshCw
                      size={14}
                      style={{ animation: "spin .8s linear infinite" }}
                    />{" "}
                    Saving...
                  </>
                ) : (
                  <>
                    <Check size={14} /> Create Project
                  </>
                )}
              </button>
              <button className="btn btn-ghost" onClick={() => setModal(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── ROOT ──────────────────────────────────────────────────────────────────────
export default function Root() {
  const { user, authLoading, signUp, signIn, signOut } = useAuth();
  const [page, setPage] = useState("login");

  // Go to app when logged in
  useEffect(() => {
    if (!authLoading && user) setPage("app");
  }, [user, authLoading]);

  // ── KEY FIX: when user logs out, go back to landing immediately ──
  useEffect(() => {
    if (!authLoading && !user && page === "app") setPage("login");
  }, [user, authLoading, page]);

  const spinCss = `
    @keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
    html,body,#root{margin:0;padding:0;background:#0a0a0a;min-height:100vh}
  `;

  // Always wrap in a dark container so there's never a white flash
  const wrap = (children) => (
    <div style={{ background: "#0a0a0a", minHeight: "100vh" }}>
      <style>{spinCss}</style>
      {children}
    </div>
  );

  if (authLoading)
    return wrap(
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            border: "3px solid #1a1a1a",
            borderTopColor: "#f97316",
            borderRadius: "50%",
            animation: "spin .8s linear infinite",
          }}
        />
      </div>
    );

  if (user) return <FreelanceFundsApp user={user} signOut={signOut} />;

  if (page === "landing")
    return (
      <LandingPage
        onLogin={() => setPage("login")}
        onRegister={() => setPage("register")}
      />
    );
  if (page === "login")
    return (
      <AuthPage
        mode="login"
        onSuccess={() => setPage("app")}
        onSwitch={() => setPage("register")}
        onBack={() => setPage("landing")}
      />
    );
  if (page === "register")
    return (
      <AuthPage
        mode="register"
        onSuccess={() => setPage("app")}
        onSwitch={() => setPage("login")}
        onBack={() => setPage("landing")}
      />
    );

  return wrap(null);
}
