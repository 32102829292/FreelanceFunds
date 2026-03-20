"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
exports.__esModule = true;
var jsx_runtime_1 = require("react/jsx-runtime");
var react_1 = require("react");
var supabase_js_1 = require("@supabase/supabase-js");
var lucide_react_1 = require("lucide-react");
// ── SUPABASE ──────────────────────────────────────────────────────────────────
var SUPABASE_URL = "https://kftkfpzwxsxqotadaxru.supabase.co";
var SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmdGtmcHp3eHN4cW90YWRheHJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1NTYxNDcsImV4cCI6MjA4OTEzMjE0N30.LF_51Ic1IkazL4dL5HRKKak1WPyfg4EG1VvzYa9V-Jw";
var supabase = (0, supabase_js_1.createClient)(SUPABASE_URL, SUPABASE_KEY);
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
var CATEGORIES = [
    "Meals",
    "Transport",
    "Software",
    "Equipment",
    "Office",
    "Marketing",
    "Communication",
    "Other",
];
var CAT_META = {
    Meals: { Icon: lucide_react_1.Utensils, color: "#f97316" },
    Transport: { Icon: lucide_react_1.Car, color: "#3b82f6" },
    Software: { Icon: lucide_react_1.Monitor, color: "#8b5cf6" },
    Equipment: { Icon: lucide_react_1.Package, color: "#06b6d4" },
    Office: { Icon: lucide_react_1.Building2, color: "#64748b" },
    Marketing: { Icon: lucide_react_1.Megaphone, color: "#ec4899" },
    Communication: { Icon: lucide_react_1.Smartphone, color: "#10b981" },
    Other: { Icon: lucide_react_1.Paperclip, color: "#94a3b8" }
};
var AI_TIPS = {
    Meals: "Client meals are usually split equally — try 50/50 between active projects.",
    Transport: "Travel to a specific client? Assign 100% to that project.",
    Software: "Multi-project subscriptions? Split by estimated hours per client.",
    Equipment: "Bought for one deliverable? Assign 100% to that project.",
    Marketing: "Split marketing proportionally to each project's budget share.",
    Office: "Overhead costs? Split equally across all active projects.",
    Communication: "Phone/internet bills? Split by client communication hours."
};
var PALETTE = [
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
var FREE_EXP = 50;
var FREE_PROJ = 3;
// ── HELPERS ───────────────────────────────────────────────────────────────────
var fmt = function (n) {
    return "₱" + Number(n).toLocaleString("en-PH", { minimumFractionDigits: 0 });
};
var pClr = function (projects, pid) { var _a; return ((_a = projects.find(function (p) { return p.id === pid; })) === null || _a === void 0 ? void 0 : _a.color) || "#888"; };
var pNm = function (projects, pid) { var _a; return ((_a = projects.find(function (p) { return p.id === pid; })) === null || _a === void 0 ? void 0 : _a.name) || "Unknown"; };
function useBreakpoint() {
    var _a = (0, react_1.useState)(typeof window !== "undefined" ? window.innerWidth : 1024), w = _a[0], setW = _a[1];
    (0, react_1.useEffect)(function () {
        var h = function () { return setW(window.innerWidth); };
        window.addEventListener("resize", h);
        return function () { return window.removeEventListener("resize", h); };
    }, []);
    return { isMobile: w < 640, isTablet: w >= 640 && w < 1024 };
}
function useLS(key, def) {
    var _a = (0, react_1.useState)(function () {
        try {
            var s = localStorage.getItem(key);
            return s ? JSON.parse(s) : def;
        }
        catch (_a) {
            return def;
        }
    }), val = _a[0], setVal = _a[1];
    (0, react_1.useEffect)(function () {
        try {
            localStorage.setItem(key, JSON.stringify(val));
        }
        catch (_a) { }
    }, [key, val]);
    return [val, setVal];
}
// ── SUPABASE AUTH HOOK ────────────────────────────────────────────────────────
function useAuth() {
    var _this = this;
    var _a = (0, react_1.useState)(null), user = _a[0], setUser = _a[1];
    var _b = (0, react_1.useState)(true), authLoading = _b[0], setAuthLoading = _b[1];
    (0, react_1.useEffect)(function () {
        supabase.auth.getSession().then(function (_a) {
            var _b;
            var session = _a.data.session;
            setUser((_b = session === null || session === void 0 ? void 0 : session.user) !== null && _b !== void 0 ? _b : null);
            setAuthLoading(false);
        });
        var subscription = supabase.auth.onAuthStateChange(function (_event, session) {
            var _a;
            setUser((_a = session === null || session === void 0 ? void 0 : session.user) !== null && _a !== void 0 ? _a : null);
        }).data.subscription;
        return function () { return subscription.unsubscribe(); };
    }, []);
    var signUp = function (email, password) { return __awaiter(_this, void 0, void 0, function () {
        var _a, data, error;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, supabase.auth.signUp({ email: email, password: password })];
                case 1:
                    _a = _b.sent(), data = _a.data, error = _a.error;
                    if (error)
                        throw error;
                    return [2 /*return*/, data];
            }
        });
    }); };
    var signIn = function (email, password) { return __awaiter(_this, void 0, void 0, function () {
        var _a, data, error;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, supabase.auth.signInWithPassword({
                        email: email,
                        password: password
                    })];
                case 1:
                    _a = _b.sent(), data = _a.data, error = _a.error;
                    if (error)
                        throw error;
                    return [2 /*return*/, data];
            }
        });
    }); };
    var signOut = function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, supabase.auth.signOut()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); };
    return { user: user, authLoading: authLoading, signUp: signUp, signIn: signIn, signOut: signOut };
}
// ── SUPABASE DATA HOOK (user-scoped) ─────────────────────────────────────────
function useData(userId) {
    var _this = this;
    var _a = (0, react_1.useState)([]), expenses = _a[0], setExpenses = _a[1];
    var _b = (0, react_1.useState)([]), projects = _b[0], setProjects = _b[1];
    var _c = (0, react_1.useState)(true), loading = _c[0], setLoading = _c[1];
    var _d = (0, react_1.useState)(null), dbError = _d[0], setDbError = _d[1];
    var fetchAll = (0, react_1.useCallback)(function () { return __awaiter(_this, void 0, void 0, function () {
        var _a, proj, pe, _b, exp, ee, err_1;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (!userId)
                        return [2 /*return*/];
                    setLoading(true);
                    setDbError(null);
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 4, 5, 6]);
                    return [4 /*yield*/, supabase
                            .from("projects")
                            .select("*")
                            .eq("user_id", userId)
                            .order("created_at", { ascending: true })];
                case 2:
                    _a = _c.sent(), proj = _a.data, pe = _a.error;
                    if (pe)
                        throw pe;
                    return [4 /*yield*/, supabase
                            .from("expenses")
                            .select("*, expense_splits(project_id, pct)")
                            .eq("user_id", userId)
                            .order("date", { ascending: false })];
                case 3:
                    _b = _c.sent(), exp = _b.data, ee = _b.error;
                    if (ee)
                        throw ee;
                    setProjects(proj || []);
                    setExpenses((exp || []).map(function (e) { return (__assign(__assign({}, e), { splits: (e.expense_splits || []).map(function (s) { return ({
                            pid: s.project_id,
                            pct: s.pct
                        }); }) })); }));
                    return [3 /*break*/, 6];
                case 4:
                    err_1 = _c.sent();
                    setDbError(err_1.message || "Database error");
                    return [3 /*break*/, 6];
                case 5:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); }, [userId]);
    (0, react_1.useEffect)(function () {
        if (userId)
            fetchAll();
    }, [fetchAll, userId]);
    var addProject = function (f) { return __awaiter(_this, void 0, void 0, function () {
        var _a, data, error;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, supabase
                        .from("projects")
                        .insert([
                        {
                            name: f.name,
                            client: f.client,
                            color: f.color,
                            budget: Number(f.budget) || 0,
                            user_id: userId
                        },
                    ])
                        .select()
                        .single()];
                case 1:
                    _a = _b.sent(), data = _a.data, error = _a.error;
                    if (error)
                        throw error;
                    setProjects(function (p) { return __spreadArray(__spreadArray([], p, true), [data], false); });
                    return [2 /*return*/, data];
            }
        });
    }); };
    var removeProject = function (pid) { return __awaiter(_this, void 0, void 0, function () {
        var error;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, supabase
                        .from("projects")["delete"]()
                        .eq("id", pid)
                        .eq("user_id", userId)];
                case 1:
                    error = (_a.sent()).error;
                    if (error)
                        throw error;
                    setProjects(function (p) { return p.filter(function (x) { return x.id !== pid; }); });
                    return [2 /*return*/];
            }
        });
    }); };
    var addExpense = function (f) { return __awaiter(_this, void 0, void 0, function () {
        var _a, exp, ee;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, supabase
                        .from("expenses")
                        .insert([
                        {
                            description: f.description,
                            amount: Number(f.amount),
                            category: f.category,
                            date: f.date,
                            notes: f.notes || "",
                            user_id: userId
                        },
                    ])
                        .select()
                        .single()];
                case 1:
                    _a = _b.sent(), exp = _a.data, ee = _a.error;
                    if (ee)
                        throw ee;
                    return [4 /*yield*/, supabase
                            .from("expense_splits")
                            .insert(f.splits.map(function (s) { return ({
                            expense_id: exp.id,
                            project_id: s.pid,
                            pct: s.pct
                        }); }))];
                case 2:
                    _b.sent();
                    setExpenses(function (p) { return __spreadArray([__assign(__assign({}, exp), { splits: f.splits })], p, true); });
                    return [2 /*return*/];
            }
        });
    }); };
    var updateExpense = function (id, f) { return __awaiter(_this, void 0, void 0, function () {
        var ee;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, supabase
                        .from("expenses")
                        .update({
                        description: f.description,
                        amount: Number(f.amount),
                        category: f.category,
                        date: f.date,
                        notes: f.notes || ""
                    })
                        .eq("id", id)
                        .eq("user_id", userId)];
                case 1:
                    ee = (_a.sent()).error;
                    if (ee)
                        throw ee;
                    return [4 /*yield*/, supabase.from("expense_splits")["delete"]().eq("expense_id", id)];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, supabase
                            .from("expense_splits")
                            .insert(f.splits.map(function (s) { return ({ expense_id: id, project_id: s.pid, pct: s.pct }); }))];
                case 3:
                    _a.sent();
                    setExpenses(function (p) {
                        return p.map(function (e) {
                            return e.id === id
                                ? __assign(__assign(__assign({}, e), f), { amount: Number(f.amount), splits: f.splits }) : e;
                        });
                    });
                    return [2 /*return*/];
            }
        });
    }); };
    var removeExpense = function (id) { return __awaiter(_this, void 0, void 0, function () {
        var error;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, supabase
                        .from("expenses")["delete"]()
                        .eq("id", id)
                        .eq("user_id", userId)];
                case 1:
                    error = (_a.sent()).error;
                    if (error)
                        throw error;
                    setExpenses(function (p) { return p.filter(function (e) { return e.id !== id; }); });
                    return [2 /*return*/];
            }
        });
    }); };
    return {
        expenses: expenses,
        projects: projects,
        loading: loading,
        dbError: dbError,
        addProject: addProject,
        removeProject: removeProject,
        addExpense: addExpense,
        updateExpense: updateExpense,
        removeExpense: removeExpense
    };
}
// ── CHARTS ────────────────────────────────────────────────────────────────────
function DonutChart(_a) {
    var segments = _a.segments, _b = _a.size, size = _b === void 0 ? 88 : _b;
    var r = 28, cx = 40, cy = 40, circ = 2 * Math.PI * r;
    var off = 0;
    return ((0, jsx_runtime_1.jsxs)("svg", __assign({ width: size, height: size, viewBox: "0 0 80 80" }, { children: [(0, jsx_runtime_1.jsx)("circle", { cx: cx, cy: cy, r: r, fill: "none", stroke: "rgba(255,255,255,0.04)", strokeWidth: "12" }, void 0), segments.map(function (s, i) {
                var dash = (s.pct / 100) * circ;
                var arc = { dash: dash, offset: off, color: s.color };
                off += dash;
                return ((0, jsx_runtime_1.jsx)("circle", { cx: cx, cy: cy, r: r, fill: "none", stroke: arc.color, strokeWidth: "12", strokeDasharray: arc.dash + " " + (circ - arc.dash), strokeDashoffset: circ / 4 - arc.offset, style: { transition: "stroke-dasharray .6s ease" } }, i));
            })] }), void 0));
}
function MiniBar(_a) {
    var data = _a.data;
    var max = Math.max.apply(Math, __spreadArray(__spreadArray([], data.map(function (d) { return d.val; }), false), [1], false));
    return ((0, jsx_runtime_1.jsx)("div", __assign({ style: { display: "flex", alignItems: "flex-end", gap: 3, height: 64 } }, { children: data.map(function (d, i) { return ((0, jsx_runtime_1.jsxs)("div", __assign({ style: {
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2
            } }, { children: [(0, jsx_runtime_1.jsx)("div", __assign({ style: {
                        width: "100%",
                        height: 52,
                        display: "flex",
                        alignItems: "flex-end",
                        borderRadius: "3px 3px 0 0",
                        overflow: "hidden",
                        background: "rgba(255,255,255,0.04)"
                    } }, { children: (0, jsx_runtime_1.jsx)("div", { style: {
                            width: "100%",
                            background: d.highlight ? "#f97316" : "#3b82f6",
                            height: (d.val / max) * 100 + "%",
                            transition: "height .6s ease"
                        } }, void 0) }), void 0), (0, jsx_runtime_1.jsx)("span", __assign({ style: { fontSize: 8, color: "#555", fontWeight: 700 } }, { children: d.label }), void 0)] }), i)); }) }), void 0));
}
function SplitBar(_a) {
    var splits = _a.splits, projects = _a.projects;
    return ((0, jsx_runtime_1.jsx)("div", __assign({ style: {
            display: "flex",
            height: 4,
            borderRadius: 3,
            overflow: "hidden",
            gap: 1
        } }, { children: splits.map(function (s, i) { return ((0, jsx_runtime_1.jsx)("div", { style: {
                width: s.pct + "%",
                background: pClr(projects, s.pid),
                borderRadius: i === 0
                    ? "3px 0 0 3px"
                    : i === splits.length - 1
                        ? "0 3px 3px 0"
                        : 0,
                transition: "width .4s ease"
            } }, i)); }) }), void 0));
}
function Toast(_a) {
    var msg = _a.msg, type = _a.type;
    var bg = { error: "#dc2626", warning: "#d97706", success: "#111" }[type] || "#111";
    var Ic = { error: lucide_react_1.X, warning: lucide_react_1.AlertTriangle, success: lucide_react_1.CheckCircle2 }[type] ||
        lucide_react_1.CheckCircle2;
    return ((0, jsx_runtime_1.jsxs)("div", __assign({ style: {
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
            gap: 8
        } }, { children: [(0, jsx_runtime_1.jsx)(Ic, { size: 14 }, void 0), " ", msg] }), void 0));
}
// ── LANDING PAGE ──────────────────────────────────────────────────────────────
function LandingPage(_a) {
    var onLogin = _a.onLogin, onRegister = _a.onRegister;
    var _b = useBreakpoint(), isMobile = _b.isMobile, isTablet = _b.isTablet;
    var _c = (0, react_1.useState)(false), scrolled = _c[0], setScrolled = _c[1];
    var _d = (0, react_1.useState)(false), navOpen = _d[0], setNavOpen = _d[1];
    (0, react_1.useEffect)(function () {
        var f = function () { return setScrolled(window.scrollY > 50); };
        window.addEventListener("scroll", f, { passive: true });
        return function () { return window.removeEventListener("scroll", f); };
    }, []);
    var css = "\n    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');\n    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}\n    html,body{overflow-x:hidden;scroll-behavior:smooth;-webkit-font-smoothing:antialiased}\n    @keyframes bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}\n    @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}\n    @keyframes marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}\n    .bob{animation:bob 6s ease-in-out infinite}\n    .mq{display:flex;white-space:nowrap;animation:marquee 28s linear infinite}\n    .fade-u{animation:fadeUp .6s ease both}\n    .fade-u-1{animation:fadeUp .6s .1s ease both}\n    .fade-u-2{animation:fadeUp .6s .2s ease both}\n    .fade-u-3{animation:fadeUp .6s .3s ease both}\n    .feature-card{background:#111;border:1px solid rgba(255,255,255,.07);border-radius:18px;padding:26px;transition:border-color .2s,background .2s}\n    .feature-card:hover{background:#161616;border-color:rgba(249,115,22,.25)}\n    a{text-decoration:none}\n  ";
    var features = [
        {
            Icon: lucide_react_1.Zap,
            color: "#f97316",
            title: "Smart Split",
            body: "Divide any expense across multiple clients by percentage. Adobe CC at 60/40? Done in seconds."
        },
        {
            Icon: lucide_react_1.FileText,
            color: "#10b981",
            title: "BIR-Ready Reports",
            body: "Generate a full breakdown by project and category. Export CSV or PDF and hand it to your accountant."
        },
        {
            Icon: lucide_react_1.Shield,
            color: "#3b82f6",
            title: "Private Per Account",
            body: "Your data is yours only. Each account sees its own projects, expenses, and reports — nothing shared."
        },
        {
            Icon: lucide_react_1.BarChart3,
            color: "#8b5cf6",
            title: "Live Dashboard",
            body: "Total tracked, estimated tax savings, monthly spend chart — all updating in real time."
        },
        {
            Icon: lucide_react_1.StickyNote,
            color: "#ec4899",
            title: "Notes on Splits",
            body: "Add context to every expense. Document why a split was set a certain way for audit confidence."
        },
        {
            Icon: lucide_react_1.Share2,
            color: "#06b6d4",
            title: "Share Your Stats",
            body: "Copy a shareable summary of your quarterly savings and send it to your network."
        },
    ];
    return ((0, jsx_runtime_1.jsxs)("div", __assign({ style: {
            background: "#0a0a0a",
            color: "#fff",
            minHeight: "100vh",
            fontFamily: "'Plus Jakarta Sans',sans-serif",
            overflowX: "hidden"
        } }, { children: [(0, jsx_runtime_1.jsx)("style", { children: css }, void 0), (0, jsx_runtime_1.jsxs)("nav", __assign({ style: {
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
                    gap: 12
                } }, { children: [(0, jsx_runtime_1.jsxs)("div", __assign({ style: {
                            display: "flex",
                            alignItems: "center",
                            gap: 9,
                            flexShrink: 0
                        } }, { children: [(0, jsx_runtime_1.jsx)("div", __assign({ style: {
                                    width: 34,
                                    height: 34,
                                    background: "#f97316",
                                    borderRadius: 9,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontWeight: 900,
                                    color: "#fff",
                                    fontSize: 16
                                } }, { children: "\u20A3" }), void 0), (0, jsx_runtime_1.jsx)("span", __assign({ style: {
                                    fontFamily: "'Playfair Display',serif",
                                    fontSize: 18,
                                    color: "#fff"
                                } }, { children: "FreelanceFunds" }), void 0)] }), void 0), !isMobile && ((0, jsx_runtime_1.jsx)("div", __assign({ style: { display: "flex", gap: 28, alignItems: "center" } }, { children: [
                            ["#features", "Features"],
                            ["#how", "How It Works"],
                            ["#pricing", "Pricing"],
                        ].map(function (_a) {
                            var h = _a[0], l = _a[1];
                            return ((0, jsx_runtime_1.jsx)("a", __assign({ href: h, style: {
                                    fontSize: 13,
                                    fontWeight: 600,
                                    color: "#666",
                                    transition: "color .2s"
                                }, onMouseEnter: function (e) { return (e.currentTarget.style.color = "#fff"); }, onMouseLeave: function (e) { return (e.currentTarget.style.color = "#666"); } }, { children: l }), h));
                        }) }), void 0)), (0, jsx_runtime_1.jsxs)("div", __assign({ style: {
                            display: "flex",
                            gap: 8,
                            alignItems: "center",
                            flexShrink: 0
                        } }, { children: [!isMobile && ((0, jsx_runtime_1.jsx)("button", __assign({ onClick: onLogin, style: {
                                    background: "none",
                                    border: "1.5px solid rgba(255,255,255,.15)",
                                    color: "#ccc",
                                    borderRadius: 9,
                                    padding: "8px 18px",
                                    fontSize: 13,
                                    fontWeight: 700,
                                    cursor: "pointer",
                                    fontFamily: "inherit",
                                    transition: "all .2s"
                                }, onMouseEnter: function (e) {
                                    e.currentTarget.style.borderColor = "rgba(255,255,255,.4)";
                                    e.currentTarget.style.color = "#fff";
                                }, onMouseLeave: function (e) {
                                    e.currentTarget.style.borderColor = "rgba(255,255,255,.15)";
                                    e.currentTarget.style.color = "#ccc";
                                } }, { children: "Log In" }), void 0)), (0, jsx_runtime_1.jsx)("button", __assign({ onClick: onRegister, style: {
                                    background: "#f97316",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: 9,
                                    padding: "9px 20px",
                                    fontSize: 13,
                                    fontWeight: 700,
                                    cursor: "pointer",
                                    fontFamily: "inherit",
                                    transition: "background .2s"
                                }, onMouseEnter: function (e) { return (e.currentTarget.style.background = "#ea6c0a"); }, onMouseLeave: function (e) { return (e.currentTarget.style.background = "#f97316"); } }, { children: isMobile ? "Sign Up" : "Get Started Free" }), void 0), isMobile && ((0, jsx_runtime_1.jsx)("button", __assign({ onClick: function () { return setNavOpen(function (o) { return !o; }); }, style: {
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
                                    fontSize: 16
                                } }, { children: navOpen ? (0, jsx_runtime_1.jsx)(lucide_react_1.X, { size: 16 }, void 0) : "☰" }), void 0))] }), void 0)] }), void 0), isMobile && navOpen && ((0, jsx_runtime_1.jsx)("div", __assign({ style: {
                    position: "fixed",
                    inset: 0,
                    zIndex: 290,
                    background: "rgba(0,0,0,.85)",
                    backdropFilter: "blur(8px)"
                }, onClick: function () { return setNavOpen(false); } }, { children: (0, jsx_runtime_1.jsxs)("div", __assign({ style: {
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
                        gap: 4
                    }, onClick: function (e) { return e.stopPropagation(); } }, { children: [[
                            ["#features", "Features"],
                            ["#how", "How It Works"],
                            ["#pricing", "Pricing"],
                        ].map(function (_a) {
                            var h = _a[0], l = _a[1];
                            return ((0, jsx_runtime_1.jsx)("a", __assign({ href: h, onClick: function () { return setNavOpen(false); }, style: {
                                    fontSize: 16,
                                    fontWeight: 700,
                                    color: "#ccc",
                                    padding: "12px 16px",
                                    borderRadius: 10,
                                    display: "block"
                                } }, { children: l }), h));
                        }), (0, jsx_runtime_1.jsx)("div", { style: {
                                height: 1,
                                background: "rgba(255,255,255,.06)",
                                margin: "8px 0"
                            } }, void 0), (0, jsx_runtime_1.jsx)("button", __assign({ onClick: function () {
                                setNavOpen(false);
                                onLogin();
                            }, style: {
                                background: "none",
                                border: "1.5px solid rgba(255,255,255,.15)",
                                color: "#ccc",
                                borderRadius: 12,
                                padding: 13,
                                fontSize: 15,
                                fontWeight: 700,
                                cursor: "pointer",
                                fontFamily: "inherit"
                            } }, { children: "Log In" }), void 0), (0, jsx_runtime_1.jsx)("button", __assign({ onClick: function () {
                                setNavOpen(false);
                                onRegister();
                            }, style: {
                                background: "#f97316",
                                color: "#fff",
                                border: "none",
                                borderRadius: 12,
                                padding: 13,
                                fontSize: 15,
                                fontWeight: 700,
                                cursor: "pointer",
                                fontFamily: "inherit"
                            } }, { children: "Get Started Free" }), void 0)] }), void 0) }), void 0)), (0, jsx_runtime_1.jsxs)("section", __assign({ style: {
                    minHeight: "100vh",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: isMobile ? "100px 20px 60px" : "120px 24px 80px",
                    textAlign: "center",
                    position: "relative",
                    overflow: "hidden"
                } }, { children: [(0, jsx_runtime_1.jsx)("div", { style: {
                            position: "absolute",
                            top: "20%",
                            left: "50%",
                            transform: "translateX(-50%)",
                            width: 600,
                            height: 600,
                            borderRadius: "50%",
                            background: "radial-gradient(circle,rgba(249,115,22,.12) 0%,transparent 65%)",
                            pointerEvents: "none"
                        } }, void 0), (0, jsx_runtime_1.jsx)("div", __assign({ className: "fade-u", style: {
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
                            letterSpacing: ".07em"
                        } }, { children: "BUILT FOR FILIPINO FREELANCERS" }), void 0), (0, jsx_runtime_1.jsxs)("h1", __assign({ className: "fade-u-1", style: {
                            fontFamily: "'Playfair Display',serif",
                            fontSize: isMobile
                                ? "clamp(34px,10vw,52px)"
                                : "clamp(44px,6vw,80px)",
                            lineHeight: 1.04,
                            letterSpacing: "-0.03em",
                            marginBottom: 22,
                            maxWidth: 860
                        } }, { children: ["Stop losing money", (0, jsx_runtime_1.jsx)("br", {}, void 0), "every", " ", (0, jsx_runtime_1.jsx)("span", __assign({ style: { color: "#f97316", fontStyle: "italic" } }, { children: "tax season." }), void 0)] }), void 0), (0, jsx_runtime_1.jsx)("p", __assign({ className: "fade-u-2", style: {
                            fontSize: isMobile ? 15 : 17,
                            color: "#666",
                            maxWidth: 520,
                            lineHeight: 1.85,
                            marginBottom: 36
                        } }, { children: "Track expenses across multiple clients, split costs automatically, and generate BIR-ready tax reports \u2014 in one place." }), void 0), (0, jsx_runtime_1.jsxs)("div", __assign({ className: "fade-u-3", style: {
                            display: "flex",
                            gap: 12,
                            flexWrap: "wrap",
                            justifyContent: "center",
                            marginBottom: 56
                        } }, { children: [(0, jsx_runtime_1.jsxs)("button", __assign({ onClick: onRegister, style: {
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
                                    gap: 8
                                }, onMouseEnter: function (e) {
                                    e.currentTarget.style.background = "#ea6c0a";
                                    e.currentTarget.style.transform = "translateY(-2px)";
                                }, onMouseLeave: function (e) {
                                    e.currentTarget.style.background = "#f97316";
                                    e.currentTarget.style.transform = "translateY(0)";
                                } }, { children: [(0, jsx_runtime_1.jsx)(lucide_react_1.UserPlus, { size: 16 }, void 0), " Create Free Account"] }), void 0), (0, jsx_runtime_1.jsxs)("button", __assign({ onClick: onLogin, style: {
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
                                    gap: 8
                                } }, { children: [(0, jsx_runtime_1.jsx)(lucide_react_1.LogIn, { size: 16 }, void 0), " Log In"] }), void 0)] }), void 0), (0, jsx_runtime_1.jsxs)("div", __assign({ className: "bob", style: {
                            width: "min(500px,90vw)",
                            background: "#111",
                            border: "1px solid rgba(255,255,255,.08)",
                            borderRadius: 20,
                            overflow: "hidden",
                            boxShadow: "0 40px 100px rgba(0,0,0,.8)",
                            position: "relative",
                            zIndex: 2
                        } }, { children: [(0, jsx_runtime_1.jsxs)("div", __assign({ style: {
                                    background: "#161616",
                                    padding: "10px 16px",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 6,
                                    borderBottom: "1px solid rgba(255,255,255,.05)"
                                } }, { children: [["#ef4444", "#eab308", "#22c55e"].map(function (c) { return ((0, jsx_runtime_1.jsx)("div", { style: {
                                            width: 10,
                                            height: 10,
                                            borderRadius: "50%",
                                            background: c
                                        } }, c)); }), (0, jsx_runtime_1.jsx)("div", __assign({ style: {
                                            flex: 1,
                                            marginLeft: 8,
                                            background: "rgba(255,255,255,.05)",
                                            borderRadius: 5,
                                            padding: "3px 12px",
                                            fontSize: 10,
                                            color: "#444"
                                        } }, { children: "freelancefunds \u2014 Dashboard" }), void 0)] }), void 0), (0, jsx_runtime_1.jsxs)("div", __assign({ style: { padding: 20 } }, { children: [(0, jsx_runtime_1.jsx)("div", __assign({ style: {
                                            display: "grid",
                                            gridTemplateColumns: "repeat(3,1fr)",
                                            gap: 8,
                                            marginBottom: 16
                                        } }, { children: [
                                            ["Total Tracked", "₱24,390", "#fff"],
                                            ["Tax Savings", "₱4,878", "#86efac"],
                                            ["Projects", "4", "#fff"],
                                        ].map(function (_a) {
                                            var l = _a[0], v = _a[1], c = _a[2];
                                            return ((0, jsx_runtime_1.jsxs)("div", __assign({ style: {
                                                    background: "#1a1a1a",
                                                    borderRadius: 10,
                                                    padding: "10px 12px"
                                                } }, { children: [(0, jsx_runtime_1.jsx)("div", __assign({ style: {
                                                            fontSize: 8,
                                                            color: "#444",
                                                            fontWeight: 700,
                                                            textTransform: "uppercase",
                                                            letterSpacing: ".08em",
                                                            marginBottom: 4
                                                        } }, { children: l }), void 0), (0, jsx_runtime_1.jsx)("div", __assign({ style: {
                                                            fontFamily: "'Playfair Display',serif",
                                                            fontSize: 16,
                                                            color: c
                                                        } }, { children: v }), void 0)] }), l));
                                        }) }), void 0), [
                                        {
                                            ic: lucide_react_1.Monitor,
                                            nm: "Adobe Creative Cloud",
                                            clr: "#8b5cf6",
                                            sp: [60, 40],
                                            cs: ["#f97316", "#3b82f6"],
                                            a: "₱1,200"
                                        },
                                        {
                                            ic: lucide_react_1.Utensils,
                                            nm: "Client Lunch – BGC",
                                            clr: "#f97316",
                                            sp: [100],
                                            cs: ["#10b981"],
                                            a: "₱850"
                                        },
                                        {
                                            ic: lucide_react_1.Car,
                                            nm: "Grab to Client Office",
                                            clr: "#3b82f6",
                                            sp: [50, 50],
                                            cs: ["#f97316", "#a855f7"],
                                            a: "₱320"
                                        },
                                    ].map(function (r, i) {
                                        var RIc = r.ic;
                                        return ((0, jsx_runtime_1.jsxs)("div", __assign({ style: {
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                padding: "10px 0",
                                                borderBottom: i < 2 ? "1px solid rgba(255,255,255,.04)" : "none"
                                            } }, { children: [(0, jsx_runtime_1.jsxs)("div", __assign({ style: { display: "flex", alignItems: "center", gap: 10 } }, { children: [(0, jsx_runtime_1.jsx)("div", __assign({ style: {
                                                                width: 32,
                                                                height: 32,
                                                                borderRadius: 8,
                                                                background: r.clr + "18",
                                                                display: "flex",
                                                                alignItems: "center",
                                                                justifyContent: "center",
                                                                color: r.clr
                                                            } }, { children: (0, jsx_runtime_1.jsx)(RIc, { size: 14 }, void 0) }), void 0), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("div", __assign({ style: { fontSize: 12, fontWeight: 600, color: "#ccc" } }, { children: r.nm }), void 0), (0, jsx_runtime_1.jsx)("div", __assign({ style: {
                                                                        display: "flex",
                                                                        gap: 2,
                                                                        height: 3,
                                                                        borderRadius: 2,
                                                                        overflow: "hidden",
                                                                        marginTop: 4
                                                                    } }, { children: r.sp.map(function (w, j) { return ((0, jsx_runtime_1.jsx)("div", { style: { width: w + "%", background: r.cs[j] } }, j)); }) }), void 0)] }, void 0)] }), void 0), (0, jsx_runtime_1.jsx)("div", __assign({ style: { fontSize: 13, fontWeight: 800, color: "#fff" } }, { children: r.a }), void 0)] }), i));
                                    })] }), void 0)] }), void 0)] }), void 0), (0, jsx_runtime_1.jsx)("div", __assign({ style: {
                    background: "#111",
                    overflow: "hidden",
                    padding: "13px 0",
                    borderTop: "1px solid rgba(255,255,255,.05)",
                    borderBottom: "1px solid rgba(255,255,255,.05)"
                } }, { children: (0, jsx_runtime_1.jsx)("div", __assign({ className: "mq" }, { children: __spreadArray([], Array(2), true).flatMap(function () {
                        return [
                            ["Monitor", "Adobe CC", "split 60/40"],
                            ["Utensils", "Client meals", "auto-allocated"],
                            ["FileText", "BIR reports", "one click"],
                            ["Smartphone", "Phone bills", "split by hours"],
                            ["Car", "Grab rides", "per project"],
                            ["Megaphone", "Facebook Ads", "by budget share"],
                            ["Clock", "10 hrs saved", "every month"],
                            ["Shield", "₱18,000", "avg annual savings"],
                        ].map(function (_a, i) {
                            var l = _a[1], a = _a[2];
                            return ((0, jsx_runtime_1.jsxs)("div", __assign({ style: {
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 10,
                                    padding: "0 28px",
                                    fontSize: 12,
                                    fontWeight: 600,
                                    color: "#444",
                                    borderRight: "1px solid #1a1a1a",
                                    whiteSpace: "nowrap"
                                } }, { children: [(0, jsx_runtime_1.jsx)("span", __assign({ style: { color: "#666" } }, { children: l }), void 0), " ", (0, jsx_runtime_1.jsx)("span", __assign({ style: { color: "#f97316" } }, { children: a }), void 0)] }), i));
                        });
                    }) }), void 0) }), void 0), (0, jsx_runtime_1.jsx)("section", __assign({ id: "features", style: {
                    padding: isMobile ? "72px 20px" : "100px 24px",
                    background: "#0a0a0a"
                } }, { children: (0, jsx_runtime_1.jsxs)("div", __assign({ style: { maxWidth: 1040, margin: "0 auto" } }, { children: [(0, jsx_runtime_1.jsx)("p", __assign({ style: {
                                fontSize: 11,
                                fontWeight: 700,
                                color: "#f97316",
                                letterSpacing: ".09em",
                                textTransform: "uppercase",
                                marginBottom: 12,
                                textAlign: "center"
                            } }, { children: "Why FreelanceFunds" }), void 0), (0, jsx_runtime_1.jsxs)("h2", __assign({ style: {
                                fontFamily: "'Playfair Display',serif",
                                fontSize: isMobile
                                    ? "clamp(24px,6vw,40px)"
                                    : "clamp(28px,4vw,48px)",
                                letterSpacing: "-0.02em",
                                lineHeight: 1.1,
                                marginBottom: 48,
                                color: "#fff",
                                textAlign: "center"
                            } }, { children: ["Built for how Filipino", (0, jsx_runtime_1.jsx)("br", {}, void 0), (0, jsx_runtime_1.jsx)("span", __assign({ style: { fontStyle: "italic", color: "#f97316" } }, { children: "freelancers actually work." }), void 0)] }), void 0), (0, jsx_runtime_1.jsx)("div", __assign({ style: {
                                display: "grid",
                                gridTemplateColumns: isMobile
                                    ? "1fr"
                                    : isTablet
                                        ? "repeat(2,1fr)"
                                        : "repeat(3,1fr)",
                                gap: 14
                            } }, { children: features.map(function (f, i) { return ((0, jsx_runtime_1.jsxs)("div", __assign({ className: "feature-card" }, { children: [(0, jsx_runtime_1.jsx)("div", __assign({ style: {
                                            width: 44,
                                            height: 44,
                                            borderRadius: 12,
                                            background: f.color + "18",
                                            border: "1px solid " + f.color + "30",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            marginBottom: 14
                                        } }, { children: (0, jsx_runtime_1.jsx)(f.Icon, { size: 20, color: f.color }, void 0) }), void 0), (0, jsx_runtime_1.jsx)("p", __assign({ style: {
                                            fontSize: 15,
                                            fontWeight: 800,
                                            color: "#e5e5e5",
                                            marginBottom: 8
                                        } }, { children: f.title }), void 0), (0, jsx_runtime_1.jsx)("p", __assign({ style: { fontSize: 13, color: "#555", lineHeight: 1.8 } }, { children: f.body }), void 0)] }), i)); }) }), void 0)] }), void 0) }), void 0), (0, jsx_runtime_1.jsx)("section", __assign({ id: "how", style: {
                    padding: isMobile ? "72px 20px" : "100px 24px",
                    background: "#060606",
                    borderTop: "1px solid rgba(255,255,255,.05)"
                } }, { children: (0, jsx_runtime_1.jsxs)("div", __assign({ style: { maxWidth: 800, margin: "0 auto" } }, { children: [(0, jsx_runtime_1.jsx)("p", __assign({ style: {
                                fontSize: 11,
                                fontWeight: 700,
                                color: "#f97316",
                                letterSpacing: ".09em",
                                textTransform: "uppercase",
                                marginBottom: 12,
                                textAlign: "center"
                            } }, { children: "How it works" }), void 0), (0, jsx_runtime_1.jsxs)("h2", __assign({ style: {
                                fontFamily: "'Playfair Display',serif",
                                fontSize: isMobile
                                    ? "clamp(24px,6vw,40px)"
                                    : "clamp(28px,4vw,48px)",
                                letterSpacing: "-0.02em",
                                lineHeight: 1.1,
                                marginBottom: 52,
                                color: "#fff",
                                textAlign: "center"
                            } }, { children: ["Value in", " ", (0, jsx_runtime_1.jsx)("span", __assign({ style: { fontStyle: "italic", color: "#f97316" } }, { children: "under 2 minutes." }), void 0)] }), void 0), [
                            {
                                n: "01",
                                Icon: lucide_react_1.UserPlus,
                                t: "Create a free account",
                                b: "Sign up with email and password. Your data is private — no one else sees your projects or expenses."
                            },
                            {
                                n: "02",
                                Icon: lucide_react_1.FolderOpen,
                                t: "Add a project per client",
                                b: "Create one project per client. Set a budget, pick a color. Takes 30 seconds."
                            },
                            {
                                n: "03",
                                Icon: lucide_react_1.Zap,
                                t: "Log expenses with Smart Split",
                                b: "Enter any expense and split the cost across clients by percentage. Adobe CC at 60/40? Done instantly."
                            },
                            {
                                n: "04",
                                Icon: lucide_react_1.FileBarChart2,
                                t: "Export your BIR-ready report",
                                b: "At quarter-end, open Reports and export. Hand the CSV or PDF directly to your accountant. No panic."
                            },
                        ].map(function (s, i, arr) { return ((0, jsx_runtime_1.jsxs)("div", __assign({ style: {
                                display: "grid",
                                gridTemplateColumns: "56px 1fr",
                                gap: 20,
                                padding: "32px 0",
                                borderBottom: i < arr.length - 1
                                    ? "1px solid rgba(255,255,255,.05)"
                                    : "none"
                            } }, { children: [(0, jsx_runtime_1.jsx)("div", __assign({ style: {
                                        fontFamily: "'Playfair Display',serif",
                                        fontSize: 42,
                                        color: "rgba(255,255,255,.06)",
                                        lineHeight: 1,
                                        letterSpacing: "-0.04em"
                                    } }, { children: s.n }), void 0), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("div", __assign({ style: {
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 10,
                                                marginBottom: 8
                                            } }, { children: [(0, jsx_runtime_1.jsx)(s.Icon, { size: 16, color: "#f97316" }, void 0), (0, jsx_runtime_1.jsx)("span", __assign({ style: {
                                                        fontSize: 18,
                                                        fontWeight: 800,
                                                        color: "#e5e5e5",
                                                        letterSpacing: "-0.01em"
                                                    } }, { children: s.t }), void 0)] }), void 0), (0, jsx_runtime_1.jsx)("p", __assign({ style: { fontSize: 14, color: "#555", lineHeight: 1.85 } }, { children: s.b }), void 0)] }, void 0)] }), i)); })] }), void 0) }), void 0), (0, jsx_runtime_1.jsx)("section", __assign({ id: "pricing", style: {
                    padding: isMobile ? "72px 20px" : "100px 24px",
                    background: "#0a0a0a"
                } }, { children: (0, jsx_runtime_1.jsxs)("div", __assign({ style: { maxWidth: 700, margin: "0 auto" } }, { children: [(0, jsx_runtime_1.jsx)("p", __assign({ style: {
                                fontSize: 11,
                                fontWeight: 700,
                                color: "#f97316",
                                letterSpacing: ".09em",
                                textTransform: "uppercase",
                                marginBottom: 12,
                                textAlign: "center"
                            } }, { children: "Simple pricing" }), void 0), (0, jsx_runtime_1.jsxs)("h2", __assign({ style: {
                                fontFamily: "'Playfair Display',serif",
                                fontSize: isMobile
                                    ? "clamp(24px,6vw,40px)"
                                    : "clamp(28px,4vw,48px)",
                                letterSpacing: "-0.02em",
                                lineHeight: 1.1,
                                marginBottom: 48,
                                color: "#fff",
                                textAlign: "center"
                            } }, { children: ["Start free.", (0, jsx_runtime_1.jsx)("br", {}, void 0), (0, jsx_runtime_1.jsx)("span", __assign({ style: { fontStyle: "italic", color: "#f97316" } }, { children: "Upgrade when ready." }), void 0)] }), void 0), (0, jsx_runtime_1.jsx)("div", __assign({ style: {
                                display: "grid",
                                gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                                gap: 16
                            } }, { children: [
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
                                    accent: "#555"
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
                                    popular: true
                                },
                            ].map(function (p) { return ((0, jsx_runtime_1.jsxs)("div", __assign({ style: {
                                    background: "#111",
                                    border: "2px solid " + p.accent,
                                    borderRadius: 22,
                                    padding: isMobile ? 24 : 32,
                                    position: "relative"
                                } }, { children: [p.popular && ((0, jsx_runtime_1.jsx)("div", __assign({ style: {
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
                                            whiteSpace: "nowrap"
                                        } }, { children: "MOST POPULAR" }), void 0)), (0, jsx_runtime_1.jsx)("p", __assign({ style: {
                                            fontSize: 11,
                                            fontWeight: 800,
                                            color: p.popular ? "#f97316" : "#555",
                                            letterSpacing: ".08em",
                                            textTransform: "uppercase",
                                            marginBottom: 10
                                        } }, { children: p.label }), void 0), (0, jsx_runtime_1.jsx)("p", __assign({ style: {
                                            fontFamily: "'Playfair Display',serif",
                                            fontSize: 40,
                                            color: p.popular ? "#f97316" : "#fff",
                                            lineHeight: 1,
                                            marginBottom: 4
                                        } }, { children: p.price }), void 0), (0, jsx_runtime_1.jsx)("p", __assign({ style: { fontSize: 12, color: "#444", marginBottom: 20 } }, { children: p.sub }), void 0), p.feats.map(function (f) { return ((0, jsx_runtime_1.jsxs)("div", __assign({ style: {
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 9,
                                            marginBottom: 9
                                        } }, { children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Check, { size: 13, color: p.popular ? "#f97316" : "#10b981" }, void 0), (0, jsx_runtime_1.jsx)("span", __assign({ style: { fontSize: 13, color: "#aaa" } }, { children: f }), void 0)] }), f)); }), p.no.map(function (f) { return ((0, jsx_runtime_1.jsxs)("div", __assign({ style: {
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 9,
                                            marginBottom: 9
                                        } }, { children: [(0, jsx_runtime_1.jsx)(lucide_react_1.X, { size: 13, color: "#333" }, void 0), (0, jsx_runtime_1.jsx)("span", __assign({ style: {
                                                    fontSize: 13,
                                                    color: "#333",
                                                    textDecoration: "line-through"
                                                } }, { children: f }), void 0)] }), f)); }), (0, jsx_runtime_1.jsxs)("button", __assign({ onClick: onRegister, style: {
                                            width: "100%",
                                            padding: 13,
                                            borderRadius: 12,
                                            border: "2px solid " + (p.popular ? "#f97316" : "rgba(255,255,255,.12)"),
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
                                            gap: 8
                                        } }, { children: [(0, jsx_runtime_1.jsx)(lucide_react_1.UserPlus, { size: 15 }, void 0), " ", p.popular ? "Start Pro Free Trial" : "Create Free Account"] }), void 0)] }), p.label)); }) }), void 0)] }), void 0) }), void 0), (0, jsx_runtime_1.jsxs)("section", __assign({ style: {
                    background: "#f97316",
                    padding: isMobile ? "64px 20px" : "88px 24px",
                    textAlign: "center"
                } }, { children: [(0, jsx_runtime_1.jsxs)("h2", __assign({ style: {
                            fontFamily: "'Playfair Display',serif",
                            fontSize: isMobile
                                ? "clamp(26px,7vw,44px)"
                                : "clamp(28px,4vw,52px)",
                            lineHeight: 1.06,
                            color: "#fff",
                            marginBottom: 14,
                            letterSpacing: "-0.03em"
                        } }, { children: ["Ready to stop guessing", (0, jsx_runtime_1.jsx)("br", {}, void 0), "at quarter-end?"] }), void 0), (0, jsx_runtime_1.jsx)("p", __assign({ style: {
                            fontSize: 15,
                            color: "rgba(255,255,255,.75)",
                            marginBottom: 32
                        } }, { children: "Create your free account. Add your first project in 30 seconds." }), void 0), (0, jsx_runtime_1.jsxs)("button", __assign({ onClick: onRegister, style: {
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
                            gap: 8
                        } }, { children: [(0, jsx_runtime_1.jsx)(lucide_react_1.UserPlus, { size: 16 }, void 0), " Get Started Free"] }), void 0)] }), void 0), (0, jsx_runtime_1.jsxs)("footer", __assign({ style: {
                    background: "#060606",
                    padding: "24px 24px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: 12,
                    borderTop: "1px solid rgba(255,255,255,.05)"
                } }, { children: [(0, jsx_runtime_1.jsxs)("div", __assign({ style: { display: "flex", alignItems: "center", gap: 8 } }, { children: [(0, jsx_runtime_1.jsx)("div", __assign({ style: {
                                    width: 28,
                                    height: 28,
                                    background: "#f97316",
                                    borderRadius: 7,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontWeight: 900,
                                    color: "#fff",
                                    fontSize: 13
                                } }, { children: "\u20A3" }), void 0), (0, jsx_runtime_1.jsx)("span", __assign({ style: {
                                    fontFamily: "'Playfair Display',serif",
                                    fontSize: 14,
                                    color: "#444"
                                } }, { children: "FreelanceFunds" }), void 0)] }), void 0), (0, jsx_runtime_1.jsx)("p", __assign({ style: {
                            fontSize: 11,
                            color: "#2a2a2a",
                            letterSpacing: ".04em",
                            textTransform: "uppercase"
                        } }, { children: "Built for Filipino Freelancers \u00B7 2025" }), void 0)] }), void 0)] }), void 0));
}
// ── AUTH PAGE (Login / Register) ──────────────────────────────────────────────
function AuthPage(_a) {
    var _this = this;
    var mode = _a.mode, onSuccess = _a.onSuccess, onSwitch = _a.onSwitch, onBack = _a.onBack;
    var _b = (0, react_1.useState)(""), email = _b[0], setEmail = _b[1];
    var _c = (0, react_1.useState)(""), password = _c[0], setPassword = _c[1];
    var _d = (0, react_1.useState)(false), showPw = _d[0], setShowPw = _d[1];
    var _e = (0, react_1.useState)(false), loading = _e[0], setLoading = _e[1];
    var _f = (0, react_1.useState)(""), error = _f[0], setError = _f[1];
    var _g = (0, react_1.useState)(false), done = _g[0], setDone = _g[1]; // email confirm state
    var _h = useAuth(), signUp = _h.signUp, signIn = _h.signIn;
    var isRegister = mode === "register";
    var handleSubmit = function () { return __awaiter(_this, void 0, void 0, function () {
        var err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setError("");
                    if (!email.trim() || !password.trim()) {
                        setError("Please fill in both fields.");
                        return [2 /*return*/];
                    }
                    if (password.length < 6) {
                        setError("Password must be at least 6 characters.");
                        return [2 /*return*/];
                    }
                    setLoading(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, 7, 8]);
                    if (!isRegister) return [3 /*break*/, 3];
                    return [4 /*yield*/, signUp(email.trim(), password)];
                case 2:
                    _a.sent();
                    setDone(true); // Supabase sends a confirmation email
                    return [3 /*break*/, 5];
                case 3: return [4 /*yield*/, signIn(email.trim(), password)];
                case 4:
                    _a.sent();
                    onSuccess();
                    _a.label = 5;
                case 5: return [3 /*break*/, 8];
                case 6:
                    err_2 = _a.sent();
                    setError(err_2.message || "Something went wrong.");
                    return [3 /*break*/, 8];
                case 7:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 8: return [2 /*return*/];
            }
        });
    }); };
    var css = "\n    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');\n    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}\n    @keyframes scaleIn{from{opacity:0;transform:scale(.96)}to{opacity:1;transform:scale(1)}}\n    @keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}\n    .auth-card{animation:scaleIn .3s ease both}\n  ";
    return ((0, jsx_runtime_1.jsxs)("div", __assign({ style: {
            background: "#0a0a0a",
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
            fontFamily: "'Plus Jakarta Sans',sans-serif"
        } }, { children: [(0, jsx_runtime_1.jsx)("style", { children: css }, void 0), (0, jsx_runtime_1.jsxs)("button", __assign({ onClick: onBack, style: {
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
                    gap: 6
                } }, { children: [(0, jsx_runtime_1.jsx)(lucide_react_1.ChevronLeft, { size: 13 }, void 0), " Back"] }), void 0), (0, jsx_runtime_1.jsxs)("div", __assign({ className: "auth-card", style: {
                    background: "#111",
                    border: "1px solid rgba(255,255,255,.08)",
                    borderRadius: 24,
                    width: "100%",
                    maxWidth: 420,
                    overflow: "hidden"
                } }, { children: [(0, jsx_runtime_1.jsxs)("div", __assign({ style: { padding: "28px 28px 0", textAlign: "center" } }, { children: [(0, jsx_runtime_1.jsx)("div", __assign({ style: {
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
                                    fontSize: 22
                                } }, { children: "\u20A3" }), void 0), (0, jsx_runtime_1.jsx)("h2", __assign({ style: {
                                    fontFamily: "'Playfair Display',serif",
                                    fontSize: 26,
                                    color: "#fff",
                                    marginBottom: 6
                                } }, { children: done
                                    ? "Check your email"
                                    : isRegister
                                        ? "Create your account"
                                        : "Welcome back" }), void 0), (0, jsx_runtime_1.jsx)("p", __assign({ style: { fontSize: 13, color: "#555", marginBottom: 28 } }, { children: done
                                    ? "We sent a confirmation link to " + email + ". Click it to activate your account."
                                    : isRegister
                                        ? "Free forever. No credit card needed."
                                        : "Log in to access your expenses and reports." }), void 0)] }), void 0), done ? ((0, jsx_runtime_1.jsxs)("div", __assign({ style: { padding: "0 28px 28px", textAlign: "center" } }, { children: [(0, jsx_runtime_1.jsx)("div", __assign({ style: {
                                    width: 56,
                                    height: 56,
                                    borderRadius: "50%",
                                    background: "rgba(16,185,129,.15)",
                                    border: "2px solid rgba(16,185,129,.3)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    margin: "0 auto 16px"
                                } }, { children: (0, jsx_runtime_1.jsx)(lucide_react_1.Mail, { size: 24, color: "#10b981" }, void 0) }), void 0), (0, jsx_runtime_1.jsx)("p", __assign({ style: {
                                    fontSize: 13,
                                    color: "#555",
                                    lineHeight: 1.75,
                                    marginBottom: 20
                                } }, { children: "After confirming your email, come back and log in." }), void 0), (0, jsx_runtime_1.jsxs)("button", __assign({ onClick: function () {
                                    setDone(false);
                                    onSwitch();
                                }, style: {
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
                                    gap: 8
                                } }, { children: [(0, jsx_runtime_1.jsx)(lucide_react_1.LogIn, { size: 15 }, void 0), " Go to Log In"] }), void 0)] }), void 0)) : ((0, jsx_runtime_1.jsxs)("div", __assign({ style: {
                            padding: "0 28px 28px",
                            display: "flex",
                            flexDirection: "column",
                            gap: 14
                        } }, { children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", __assign({ style: {
                                            display: "block",
                                            fontSize: 11,
                                            fontWeight: 800,
                                            color: "#555",
                                            textTransform: "uppercase",
                                            letterSpacing: ".07em",
                                            marginBottom: 7
                                        } }, { children: "Email" }), void 0), (0, jsx_runtime_1.jsxs)("div", __assign({ style: { position: "relative" } }, { children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Mail, { size: 14, color: "#444", style: {
                                                    position: "absolute",
                                                    left: 13,
                                                    top: "50%",
                                                    transform: "translateY(-50%)",
                                                    pointerEvents: "none"
                                                } }, void 0), (0, jsx_runtime_1.jsx)("input", { type: "email", placeholder: "you@email.com", value: email, onChange: function (e) {
                                                    setEmail(e.target.value);
                                                    setError("");
                                                }, onKeyDown: function (e) { return e.key === "Enter" && handleSubmit(); }, style: {
                                                    width: "100%",
                                                    background: "#1a1a1a",
                                                    border: "1.5px solid #222",
                                                    borderRadius: 11,
                                                    padding: "11px 14px 11px 36px",
                                                    fontSize: 14,
                                                    color: "#fff",
                                                    outline: "none",
                                                    fontFamily: "inherit",
                                                    transition: "border .15s"
                                                }, onFocus: function (e) { return (e.target.style.borderColor = "#f97316"); }, onBlur: function (e) { return (e.target.style.borderColor = "#222"); } }, void 0)] }), void 0)] }, void 0), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("label", __assign({ style: {
                                            display: "block",
                                            fontSize: 11,
                                            fontWeight: 800,
                                            color: "#555",
                                            textTransform: "uppercase",
                                            letterSpacing: ".07em",
                                            marginBottom: 7
                                        } }, { children: ["Password", " ", isRegister && ((0, jsx_runtime_1.jsx)("span", __assign({ style: {
                                                    color: "#333",
                                                    fontWeight: 400,
                                                    textTransform: "none"
                                                } }, { children: "(min 6 characters)" }), void 0))] }), void 0), (0, jsx_runtime_1.jsxs)("div", __assign({ style: { position: "relative" } }, { children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Lock, { size: 14, color: "#444", style: {
                                                    position: "absolute",
                                                    left: 13,
                                                    top: "50%",
                                                    transform: "translateY(-50%)",
                                                    pointerEvents: "none"
                                                } }, void 0), (0, jsx_runtime_1.jsx)("input", { type: showPw ? "text" : "password", placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", value: password, onChange: function (e) {
                                                    setPassword(e.target.value);
                                                    setError("");
                                                }, onKeyDown: function (e) { return e.key === "Enter" && handleSubmit(); }, style: {
                                                    width: "100%",
                                                    background: "#1a1a1a",
                                                    border: "1.5px solid #222",
                                                    borderRadius: 11,
                                                    padding: "11px 40px 11px 36px",
                                                    fontSize: 14,
                                                    color: "#fff",
                                                    outline: "none",
                                                    fontFamily: "inherit",
                                                    transition: "border .15s"
                                                }, onFocus: function (e) { return (e.target.style.borderColor = "#f97316"); }, onBlur: function (e) { return (e.target.style.borderColor = "#222"); } }, void 0), (0, jsx_runtime_1.jsx)("button", __assign({ onClick: function () { return setShowPw(function (s) { return !s; }); }, style: {
                                                    position: "absolute",
                                                    right: 12,
                                                    top: "50%",
                                                    transform: "translateY(-50%)",
                                                    background: "none",
                                                    border: "none",
                                                    cursor: "pointer",
                                                    color: "#444",
                                                    padding: 2,
                                                    display: "flex"
                                                } }, { children: showPw ? (0, jsx_runtime_1.jsx)(lucide_react_1.EyeOff, { size: 15 }, void 0) : (0, jsx_runtime_1.jsx)(lucide_react_1.Eye, { size: 15 }, void 0) }), void 0)] }), void 0)] }, void 0), error && ((0, jsx_runtime_1.jsxs)("div", __assign({ style: {
                                    background: "rgba(220,38,38,.1)",
                                    border: "1px solid rgba(220,38,38,.3)",
                                    borderRadius: 10,
                                    padding: "10px 14px",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 8
                                } }, { children: [(0, jsx_runtime_1.jsx)(lucide_react_1.AlertTriangle, { size: 13, color: "#dc2626" }, void 0), (0, jsx_runtime_1.jsx)("span", __assign({ style: { fontSize: 12, color: "#dc2626", fontWeight: 600 } }, { children: error }), void 0)] }), void 0)), (0, jsx_runtime_1.jsx)("button", __assign({ onClick: handleSubmit, disabled: loading, style: {
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
                                    transition: "opacity .15s"
                                } }, { children: loading ? ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(lucide_react_1.RefreshCw, { size: 15, style: { animation: "spin .8s linear infinite" } }, void 0), " ", isRegister ? "Creating account..." : "Logging in..."] }, void 0)) : isRegister ? ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(lucide_react_1.UserPlus, { size: 15 }, void 0), " Create Account"] }, void 0)) : ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(lucide_react_1.LogIn, { size: 15 }, void 0), " Log In"] }, void 0)) }), void 0), (0, jsx_runtime_1.jsxs)("p", __assign({ style: { textAlign: "center", fontSize: 13, color: "#444" } }, { children: [isRegister ? "Already have an account? " : "No account yet? ", (0, jsx_runtime_1.jsx)("button", __assign({ onClick: onSwitch, style: {
                                            background: "none",
                                            border: "none",
                                            color: "#f97316",
                                            fontWeight: 700,
                                            cursor: "pointer",
                                            fontFamily: "inherit",
                                            fontSize: 13
                                        } }, { children: isRegister ? "Log In" : "Create one free" }), void 0)] }), void 0)] }), void 0))] }), void 0)] }), void 0));
}
// ── UPGRADE NUDGE ─────────────────────────────────────────────────────────────
function UpgradeNudge(_a) {
    var feature = _a.feature, onUpgrade = _a.onUpgrade, D = _a.D, brd = _a.brd;
    return ((0, jsx_runtime_1.jsxs)("div", __assign({ style: {
            background: D ? "#1a0e00" : "#fff7ed",
            border: "1.5px dashed #f97316",
            borderRadius: 12,
            padding: "14px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap"
        } }, { children: [(0, jsx_runtime_1.jsxs)("div", __assign({ style: { display: "flex", alignItems: "center", gap: 10 } }, { children: [(0, jsx_runtime_1.jsx)("div", __assign({ style: {
                            width: 32,
                            height: 32,
                            borderRadius: 8,
                            background: "rgba(249,115,22,.15)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0
                        } }, { children: (0, jsx_runtime_1.jsx)(lucide_react_1.Lock, { size: 14, color: "#f97316" }, void 0) }), void 0), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("p", __assign({ style: {
                                    fontSize: 13,
                                    fontWeight: 700,
                                    color: "#f97316",
                                    marginBottom: 2
                                } }, { children: ["Unlock ", feature] }), void 0), (0, jsx_runtime_1.jsx)("p", __assign({ style: { fontSize: 11, color: D ? "#d97706" : "#92400e" } }, { children: "Pro users get this + unlimited everything for \u20B1500/month" }), void 0)] }, void 0)] }), void 0), (0, jsx_runtime_1.jsxs)("button", __assign({ onClick: onUpgrade, style: {
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
                    flexShrink: 0
                } }, { children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Zap, { size: 12 }, void 0), " Upgrade"] }), void 0)] }), void 0));
}
// ── USER MANUAL ───────────────────────────────────────────────────────────────
var MANUAL_STEPS = [
    {
        Icon: lucide_react_1.FolderOpen,
        color: "#f97316",
        title: "Create a Project",
        body: "Start by creating one project per client. Go to the Projects tab and click '+ New Project'. Add a name, client, color, and optional budget.",
        tip: "Create one project per client — e.g. 'Website Redesign · Acme Corp'"
    },
    {
        Icon: lucide_react_1.Receipt,
        color: "#3b82f6",
        title: "Log an Expense",
        body: "Go to Expenses and click '+ Add'. Fill in description, amount, date, and category. Then use Smart Split to assign which project(s) share the cost.",
        tip: "You can split one expense across multiple projects by percentage"
    },
    {
        Icon: lucide_react_1.Zap,
        color: "#8b5cf6",
        title: "Use Smart Split",
        body: "Smart Split divides any expense across projects by percentage. Click Auto to split equally, or type custom percentages. Must always total 100%.",
        tip: "Use the Notes field to document why a split was set a certain way"
    },
    {
        Icon: lucide_react_1.LayoutDashboard,
        color: "#10b981",
        title: "Read the Dashboard",
        body: "The Dashboard shows total tracked expenses, estimated tax savings, monthly spend chart, and per-project breakdown — all in real time.",
        tip: "Estimated savings assumes 20% deduction rate — adjust with your accountant"
    },
    {
        Icon: lucide_react_1.FileBarChart2,
        color: "#ec4899",
        title: "Export Tax Reports",
        body: "Go to Reports for a BIR-ready breakdown by project and category. Export to CSV for free. Upgrade to Pro to unlock PDF export.",
        tip: "Export CSV at the end of every quarter and save it with your receipts"
    },
];
function UserManual(_a) {
    var onClose = _a.onClose, tk = _a.tk;
    var _b = (0, react_1.useState)(0), step = _b[0], setStep = _b[1];
    var cur = MANUAL_STEPS[step];
    var Ic = cur.Icon;
    return ((0, jsx_runtime_1.jsx)("div", __assign({ style: {
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 900,
            padding: 16,
            backdropFilter: "blur(12px)"
        }, onClick: function (e) { return e.target === e.currentTarget && onClose(); } }, { children: (0, jsx_runtime_1.jsxs)("div", __assign({ style: {
                background: tk.card,
                border: "1px solid " + tk.brd,
                borderRadius: 24,
                width: "100%",
                maxWidth: 540,
                boxShadow: "0 40px 80px rgba(0,0,0,.6)",
                overflow: "hidden"
            } }, { children: [(0, jsx_runtime_1.jsxs)("div", __assign({ style: {
                        background: tk.D ? "#111" : "#f9fafb",
                        padding: "16px 24px 0",
                        borderBottom: "1px solid " + tk.brd
                    } }, { children: [(0, jsx_runtime_1.jsxs)("div", __assign({ style: {
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: 12
                            } }, { children: [(0, jsx_runtime_1.jsxs)("div", __assign({ style: { display: "flex", alignItems: "center", gap: 8 } }, { children: [(0, jsx_runtime_1.jsx)(lucide_react_1.BookOpen, { size: 16, color: "#f97316" }, void 0), (0, jsx_runtime_1.jsx)("span", __assign({ style: { fontWeight: 800, fontSize: 14, color: tk.txt } }, { children: "User Manual" }), void 0), (0, jsx_runtime_1.jsxs)("span", __assign({ style: {
                                                background: "#f97316",
                                                color: "#fff",
                                                borderRadius: 20,
                                                padding: "2px 9px",
                                                fontSize: 10,
                                                fontWeight: 800
                                            } }, { children: [step + 1, "/", MANUAL_STEPS.length] }), void 0)] }), void 0), (0, jsx_runtime_1.jsx)("button", __assign({ onClick: onClose, style: {
                                        background: "none",
                                        border: "none",
                                        cursor: "pointer",
                                        color: tk.muted,
                                        display: "flex"
                                    } }, { children: (0, jsx_runtime_1.jsx)(lucide_react_1.X, { size: 16 }, void 0) }), void 0)] }), void 0), (0, jsx_runtime_1.jsx)("div", __assign({ style: {
                                height: 3,
                                background: tk.D ? "#222" : "#e5e7eb",
                                borderRadius: 2
                            } }, { children: (0, jsx_runtime_1.jsx)("div", { style: {
                                    height: "100%",
                                    background: cur.color,
                                    width: ((step + 1) / MANUAL_STEPS.length) * 100 + "%",
                                    transition: "width .4s"
                                } }, void 0) }), void 0)] }), void 0), (0, jsx_runtime_1.jsx)("div", __assign({ style: {
                        display: "flex",
                        gap: 6,
                        justifyContent: "center",
                        padding: "14px 24px 0"
                    } }, { children: MANUAL_STEPS.map(function (s, i) {
                        var DotIc = s.Icon;
                        return ((0, jsx_runtime_1.jsx)("button", __assign({ onClick: function () { return setStep(i); }, style: {
                                width: 30,
                                height: 30,
                                borderRadius: "50%",
                                cursor: "pointer",
                                border: "2px solid " + (i === step ? s.color : i < step ? "#10b981" : tk.brd),
                                background: i === step ? s.color + "18" : "transparent",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center"
                            } }, { children: i < step ? ((0, jsx_runtime_1.jsx)(lucide_react_1.Check, { size: 11, color: "#10b981" }, void 0)) : ((0, jsx_runtime_1.jsx)(DotIc, { size: 11, color: i === step ? s.color : tk.muted }, void 0)) }), i));
                    }) }), void 0), (0, jsx_runtime_1.jsxs)("div", __assign({ style: { padding: "18px 24px" } }, { children: [(0, jsx_runtime_1.jsxs)("div", __assign({ style: { display: "flex", gap: 14, marginBottom: 14 } }, { children: [(0, jsx_runtime_1.jsx)("div", __assign({ style: {
                                        width: 48,
                                        height: 48,
                                        borderRadius: 13,
                                        background: cur.color + "15",
                                        border: "2px solid " + cur.color + "30",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        flexShrink: 0
                                    } }, { children: (0, jsx_runtime_1.jsx)(Ic, { size: 20, color: cur.color }, void 0) }), void 0), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h3", __assign({ style: {
                                                fontSize: 18,
                                                fontWeight: 800,
                                                color: tk.txt,
                                                marginBottom: 7,
                                                letterSpacing: "-0.02em"
                                            } }, { children: cur.title }), void 0), (0, jsx_runtime_1.jsx)("p", __assign({ style: { fontSize: 13, color: tk.muted, lineHeight: 1.85 } }, { children: cur.body }), void 0)] }, void 0)] }), void 0), (0, jsx_runtime_1.jsxs)("div", __assign({ style: {
                                background: tk.D ? "#1a1200" : "#fffbeb",
                                border: "1px solid " + (tk.D ? "#3a2800" : "#fed7aa"),
                                borderRadius: 10,
                                padding: "10px 13px",
                                display: "flex",
                                gap: 8,
                                alignItems: "flex-start",
                                marginBottom: 18
                            } }, { children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Sparkles, { size: 12, color: "#f97316", style: { flexShrink: 0, marginTop: 2 } }, void 0), (0, jsx_runtime_1.jsx)("p", __assign({ style: {
                                        fontSize: 12,
                                        color: tk.D ? "#d97706" : "#92400e",
                                        lineHeight: 1.75
                                    } }, { children: cur.tip }), void 0)] }), void 0), (0, jsx_runtime_1.jsxs)("div", __assign({ style: {
                                display: "flex",
                                gap: 10,
                                justifyContent: "space-between"
                            } }, { children: [(0, jsx_runtime_1.jsxs)("button", __assign({ onClick: function () { return setStep(function (s) { return Math.max(0, s - 1); }); }, disabled: step === 0, style: {
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 5,
                                        background: "none",
                                        border: "1.5px solid " + tk.brd,
                                        color: step === 0 ? tk.muted : tk.txt,
                                        borderRadius: 10,
                                        padding: "8px 14px",
                                        fontSize: 13,
                                        fontWeight: 700,
                                        cursor: step === 0 ? "not-allowed" : "pointer",
                                        fontFamily: "inherit",
                                        opacity: step === 0 ? 0.4 : 1
                                    } }, { children: [(0, jsx_runtime_1.jsx)(lucide_react_1.ChevronLeft, { size: 13 }, void 0), " Prev"] }), void 0), step < MANUAL_STEPS.length - 1 ? ((0, jsx_runtime_1.jsxs)("button", __assign({ onClick: function () { return setStep(function (s) { return s + 1; }); }, style: {
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
                                        fontFamily: "inherit"
                                    } }, { children: ["Next ", (0, jsx_runtime_1.jsx)(lucide_react_1.ChevronRight, { size: 13 }, void 0)] }), void 0)) : ((0, jsx_runtime_1.jsxs)("button", __assign({ onClick: onClose, style: {
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
                                        fontFamily: "inherit"
                                    } }, { children: [(0, jsx_runtime_1.jsx)(lucide_react_1.CheckCircle2, { size: 13 }, void 0), " Got it!"] }), void 0))] }), void 0)] }), void 0)] }), void 0) }), void 0));
}
// ── SHARE CARD ────────────────────────────────────────────────────────────────
function ShareCard(_a) {
    var grandTotal = _a.grandTotal, estSavings = _a.estSavings, projects = _a.projects, onClose = _a.onClose, tk = _a.tk;
    var _b = (0, react_1.useState)(false), copied = _b[0], setCopied = _b[1];
    var text = "I tracked " + fmt(grandTotal) + " in expenses this quarter and estimated " + fmt(estSavings) + " in tax savings using FreelanceFunds \u2014 the expense tracker built for Filipino freelancers. Try it free: freelancefunds.app";
    return ((0, jsx_runtime_1.jsx)("div", __assign({ style: {
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 800,
            padding: 16,
            backdropFilter: "blur(10px)"
        }, onClick: function (e) { return e.target === e.currentTarget && onClose(); } }, { children: (0, jsx_runtime_1.jsxs)("div", __assign({ style: {
                background: tk.card,
                border: "1px solid " + tk.brd,
                borderRadius: 22,
                width: "100%",
                maxWidth: 400,
                overflow: "hidden"
            } }, { children: [(0, jsx_runtime_1.jsxs)("div", __assign({ style: { background: "#111", padding: "20px 24px", color: "#fff" } }, { children: [(0, jsx_runtime_1.jsx)("p", __assign({ style: {
                                fontSize: 10,
                                fontWeight: 700,
                                color: "rgba(255,255,255,.4)",
                                textTransform: "uppercase",
                                letterSpacing: ".1em",
                                marginBottom: 6
                            } }, { children: "My FreelanceFunds Report" }), void 0), (0, jsx_runtime_1.jsx)("p", __assign({ style: {
                                fontFamily: "'Playfair Display',serif",
                                fontSize: 32,
                                letterSpacing: "-0.03em",
                                marginBottom: 4
                            } }, { children: fmt(grandTotal) }), void 0), (0, jsx_runtime_1.jsxs)("p", __assign({ style: { fontSize: 13, color: "#86efac", fontWeight: 700 } }, { children: ["Est. ", fmt(estSavings), " in tax savings"] }), void 0)] }), void 0), (0, jsx_runtime_1.jsxs)("div", __assign({ style: { padding: "18px 24px" } }, { children: [(0, jsx_runtime_1.jsx)("div", __assign({ style: {
                                background: tk.D ? "#1a1a1a" : "#f9fafb",
                                border: "1px solid " + tk.brd,
                                borderRadius: 10,
                                padding: "12px 14px",
                                marginBottom: 14
                            } }, { children: (0, jsx_runtime_1.jsx)("p", __assign({ style: { fontSize: 12, color: tk.muted, lineHeight: 1.7 } }, { children: text }), void 0) }), void 0), (0, jsx_runtime_1.jsxs)("div", __assign({ style: { display: "flex", gap: 8 } }, { children: [(0, jsx_runtime_1.jsx)("button", __assign({ onClick: function () {
                                        navigator.clipboard.writeText(text)["catch"](function () { });
                                        setCopied(true);
                                        setTimeout(function () { return setCopied(false); }, 2000);
                                    }, style: {
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
                                        gap: 7
                                    } }, { children: copied ? ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(lucide_react_1.CheckCircle2, { size: 13 }, void 0), " Copied!"] }, void 0)) : ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Share2, { size: 13 }, void 0), " Copy to share"] }, void 0)) }), void 0), (0, jsx_runtime_1.jsx)("button", __assign({ onClick: onClose, style: {
                                        background: tk.D ? "#1e1e1e" : "#f3f4f6",
                                        color: tk.muted,
                                        border: "none",
                                        borderRadius: 10,
                                        padding: "10px 14px",
                                        fontSize: 13,
                                        fontWeight: 700,
                                        cursor: "pointer",
                                        fontFamily: "inherit"
                                    } }, { children: "Close" }), void 0)] }), void 0)] }), void 0)] }), void 0) }), void 0));
}
// ── MAIN APP ──────────────────────────────────────────────────────────────────
function FreelanceFundsApp(_a) {
    var _this = this;
    var _b;
    var user = _a.user, signOut = _a.signOut;
    var _c = useData(user.id), expenses = _c.expenses, projects = _c.projects, loading = _c.loading, dbError = _c.dbError, addProject = _c.addProject, removeProject = _c.removeProject, addExpense = _c.addExpense, updateExpense = _c.updateExpense, removeExpense = _c.removeExpense;
    var _d = useLS("ff_dark", true), dark = _d[0], setDark = _d[1];
    var _e = useLS("ff_ob_" + user.id, false), seenOb = _e[0], setSeenOb = _e[1];
    var _f = useLS("ff_plan_" + user.id, "free"), plan = _f[0], setPlan = _f[1];
    var _g = (0, react_1.useState)("dashboard"), tab = _g[0], setTab = _g[1];
    var _h = (0, react_1.useState)(null), modal = _h[0], setModal = _h[1];
    var _j = (0, react_1.useState)(null), toast = _j[0], setToast = _j[1];
    var _k = (0, react_1.useState)(""), search = _k[0], setSearch = _k[1];
    var _l = (0, react_1.useState)("all"), fPid = _l[0], setFPid = _l[1];
    var _m = (0, react_1.useState)("all"), fCat = _m[0], setFCat = _m[1];
    var _o = (0, react_1.useState)("date-desc"), sortBy = _o[0], setSortBy = _o[1];
    var _p = (0, react_1.useState)(null), editId = _p[0], setEditId = _p[1];
    var _q = (0, react_1.useState)(null), delId = _q[0], setDelId = _q[1];
    var _r = (0, react_1.useState)(false), showPlan = _r[0], setShowPlan = _r[1];
    var _s = (0, react_1.useState)(false), showManual = _s[0], setShowManual = _s[1];
    var _t = (0, react_1.useState)(false), showShare = _t[0], setShowShare = _t[1];
    var _u = (0, react_1.useState)(false), saving = _u[0], setSaving = _u[1];
    var _v = useBreakpoint(), isMobile = _v.isMobile, isTablet = _v.isTablet;
    var isSmall = isMobile || isTablet;
    var isPro = plan === "pro";
    var maxExp = isPro ? Infinity : FREE_EXP;
    var maxProj = isPro ? Infinity : FREE_PROJ;
    var maxSpl = isPro ? 4 : 2;
    var D = dark;
    var bg = D ? "#0b0b0b" : "#f4f3ef";
    var card = D ? "#141414" : "#ffffff";
    var brd = D ? "#222" : "#e5e7eb";
    var txt = D ? "#e5e5e5" : "#111111";
    var muted = D ? "#555" : "#9ca3af";
    var inp = D ? "#1a1a1a" : "#ffffff";
    var tk = { D: D, bg: bg, card: card, brd: brd, txt: txt, muted: muted };
    var _w = (0, react_1.useState)({
        description: "",
        amount: "",
        category: "Software",
        date: new Date().toISOString().split("T")[0],
        splits: [{ pid: "", pct: 100 }],
        notes: ""
    }), form = _w[0], setForm = _w[1];
    var _x = (0, react_1.useState)({
        name: "",
        client: "",
        color: "#f97316",
        budget: ""
    }), pForm = _x[0], setPForm = _x[1];
    var _y = (0, react_1.useState)(""), splErr = _y[0], setSplErr = _y[1];
    var totalPct = form.splits.reduce(function (s, x) { return s + Number(x.pct); }, 0);
    var grandTotal = expenses.reduce(function (s, e) { return s + e.amount; }, 0);
    var estSavings = Math.round(grandTotal * 0.2);
    var projTotals = Object.fromEntries(projects.map(function (p) { return [p.id, 0]; }));
    expenses.forEach(function (e) {
        return e.splits.forEach(function (s) {
            projTotals[s.pid] = (projTotals[s.pid] || 0) + (e.amount * s.pct) / 100;
        });
    });
    var catTotals = {};
    expenses.forEach(function (e) {
        catTotals[e.category] = (catTotals[e.category] || 0) + e.amount;
    });
    var monthly = (function () {
        var labs = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
        var vals = Array(12).fill(0);
        expenses.forEach(function (e) {
            vals[new Date(e.date).getMonth()] += e.amount;
        });
        return labs.map(function (label, i) { return ({
            label: label,
            val: vals[i],
            highlight: vals[i] === Math.max.apply(Math, vals) && vals[i] > 0
        }); });
    })();
    var sorted = __spreadArray([], expenses, true).filter(function (e) {
        if (fPid !== "all" && !e.splits.some(function (s) { return s.pid === fPid; }))
            return false;
        if (fCat !== "all" && e.category !== fCat)
            return false;
        if (search && !e.description.toLowerCase().includes(search.toLowerCase()))
            return false;
        return true;
    })
        .sort(function (a, b) {
        if (sortBy === "date-desc")
            return new Date(b.date) - new Date(a.date);
        if (sortBy === "date-asc")
            return new Date(a.date) - new Date(b.date);
        if (sortBy === "amount-desc")
            return b.amount - a.amount;
        if (sortBy === "amount-asc")
            return a.amount - b.amount;
        return 0;
    });
    var showToast = (0, react_1.useCallback)(function (msg, type) {
        if (type === void 0) { type = "success"; }
        setToast({ msg: msg, type: type });
        setTimeout(function () { return setToast(null); }, 2800);
    }, []);
    var openAdd = function () {
        var _a;
        if (expenses.length >= maxExp) {
            showToast("Free plan: max " + maxExp + " expenses", "warning");
            setShowPlan(true);
            return;
        }
        setEditId(null);
        setForm({
            description: "",
            amount: "",
            category: "Software",
            date: new Date().toISOString().split("T")[0],
            splits: [{ pid: ((_a = projects[0]) === null || _a === void 0 ? void 0 : _a.id) || "", pct: 100 }],
            notes: ""
        });
        setSplErr("");
        setModal("expense");
    };
    var openEdit = function (e) {
        setEditId(e.id);
        setForm({
            description: e.description,
            amount: String(e.amount),
            category: e.category,
            date: e.date,
            splits: __spreadArray([], e.splits, true),
            notes: e.notes || ""
        });
        setSplErr("");
        setModal("expense");
    };
    var saveExpense = function () { return __awaiter(_this, void 0, void 0, function () {
        var err_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!form.description.trim() || !form.amount) {
                        showToast("Fill in description and amount", "error");
                        return [2 /*return*/];
                    }
                    if (totalPct !== 100) {
                        setSplErr("Splits must total exactly 100%");
                        return [2 /*return*/];
                    }
                    setSplErr("");
                    setSaving(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, 7, 8]);
                    if (!editId) return [3 /*break*/, 3];
                    return [4 /*yield*/, updateExpense(editId, form)];
                case 2:
                    _a.sent();
                    showToast("Expense updated");
                    return [3 /*break*/, 5];
                case 3: return [4 /*yield*/, addExpense(form)];
                case 4:
                    _a.sent();
                    showToast("Expense saved — split applied!");
                    _a.label = 5;
                case 5:
                    setModal(null);
                    return [3 /*break*/, 8];
                case 6:
                    err_3 = _a.sent();
                    showToast(err_3.message, "error");
                    return [3 /*break*/, 8];
                case 7:
                    setSaving(false);
                    return [7 /*endfinally*/];
                case 8: return [2 /*return*/];
            }
        });
    }); };
    var confirmDelete = function () { return __awaiter(_this, void 0, void 0, function () {
        var err_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, removeExpense(delId)];
                case 1:
                    _a.sent();
                    setDelId(null);
                    showToast("Expense deleted");
                    return [3 /*break*/, 3];
                case 2:
                    err_4 = _a.sent();
                    showToast(err_4.message, "error");
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var autoSplit = function () {
        var n = form.splits.length, base = Math.floor(100 / n), rem = 100 - base * n;
        setForm(function (f) { return (__assign(__assign({}, f), { splits: f.splits.map(function (s, i) { return (__assign(__assign({}, s), { pct: i === 0 ? base + rem : base })); }) })); });
    };
    var saveProject = function () { return __awaiter(_this, void 0, void 0, function () {
        var err_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!pForm.name.trim()) {
                        showToast("Project name required", "error");
                        return [2 /*return*/];
                    }
                    if (projects.length >= maxProj) {
                        showToast("You've hit the free limit. Upgrade to add more.", "warning");
                        setShowPlan(true);
                        setModal(null);
                        return [2 /*return*/];
                    }
                    setSaving(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, addProject(pForm)];
                case 2:
                    _a.sent();
                    setPForm({ name: "", client: "", color: "#f97316", budget: "" });
                    setModal(null);
                    showToast("Project created!");
                    return [3 /*break*/, 5];
                case 3:
                    err_5 = _a.sent();
                    showToast(err_5.message, "error");
                    return [3 /*break*/, 5];
                case 4:
                    setSaving(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var handleRemoveProject = function (pid) { return __awaiter(_this, void 0, void 0, function () {
        var err_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (expenses.some(function (e) { return e.splits.some(function (s) { return s.pid === pid; }); })) {
                        showToast("Remove linked expenses first", "warning");
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, removeProject(pid)];
                case 2:
                    _a.sent();
                    showToast("Project removed");
                    return [3 /*break*/, 4];
                case 3:
                    err_6 = _a.sent();
                    showToast(err_6.message, "error");
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var exportCSV = function () {
        var rows = [
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
        expenses.forEach(function (e) {
            return e.splits.forEach(function (s) {
                rows.push([
                    e.date,
                    "\"" + e.description + "\"",
                    e.category,
                    e.amount,
                    "\"" + (e.notes || "") + "\"",
                    "\"" + pNm(projects, s.pid) + "\"",
                    s.pct,
                    Math.round((e.amount * s.pct) / 100),
                ]);
            });
        });
        var a = document.createElement("a");
        a.href =
            "data:text/csv;charset=utf-8," +
                encodeURIComponent(rows.map(function (r) { return r.join(","); }).join("\n"));
        a.download = "freelancefunds-export.csv";
        a.click();
        showToast("CSV exported — BIR-ready!");
    };
    var nearLimit = !isPro &&
        (expenses.length / FREE_EXP >= 0.7 || projects.length / FREE_PROJ >= 0.7);
    var css = "\n    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');\n    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}\n    html,body{overflow-x:hidden;max-width:100vw;-webkit-font-smoothing:antialiased}\n    @keyframes toastIn{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}\n    @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}\n    @keyframes scaleIn{from{opacity:0;transform:scale(.96)}to{opacity:1;transform:scale(1)}}\n    @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}\n    @keyframes pulse{0%,100%{opacity:1}50%{opacity:.6}}\n    @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}\n    @keyframes floatUp{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}\n    .fade-up{animation:fadeUp .4s cubic-bezier(.16,1,.3,1) both}\n    .fade-up-1{animation:fadeUp .4s .05s cubic-bezier(.16,1,.3,1) both}\n    .fade-up-2{animation:fadeUp .4s .1s cubic-bezier(.16,1,.3,1) both}\n    .fade-up-3{animation:fadeUp .4s .15s cubic-bezier(.16,1,.3,1) both}\n    .scale-in{animation:scaleIn .25s ease both}\n    .btn{display:inline-flex;align-items:center;gap:6px;border:none;border-radius:10px;padding:9px 15px;font-family:inherit;font-size:13px;font-weight:700;cursor:pointer;transition:all .15s;white-space:nowrap}\n    .btn-ghost{background:" + (D ? "#1e1e1e" : "#f3f4f6") + ";color:" + (D ? "#888" : "#374151") + "}\n    .btn-ghost:hover{background:" + (D ? "#282828" : "#e5e7eb") + "}\n    .btn-primary{background:#f97316;color:#fff;box-shadow:0 2px 12px rgba(249,115,22,.35)}\n    .btn-primary:hover{background:#ea6c0a;transform:translateY(-1px);box-shadow:0 4px 18px rgba(249,115,22,.45)}\n    .btn-danger{background:" + (D ? "#2a1010" : "#fee2e2") + ";color:#dc2626}\n    .btn-pro{background:linear-gradient(135deg,#f97316,#ea580c);color:#fff;box-shadow:0 4px 14px rgba(249,115,22,.4)}\n    .btn-share{background:" + (D ? "#0d2015" : "#f0fdf4") + ";color:#16a34a;border:1.5px solid " + (D ? "#1a4a2a" : "#bbf7d0") + "}\n    .input{width:100%;border:1.5px solid " + brd + ";border-radius:10px;padding:10px 14px;font-family:inherit;font-size:14px;outline:none;background:" + inp + ";color:" + txt + ";transition:border .15s}\n    .input:focus{border-color:#f97316;box-shadow:0 0 0 3px rgba(249,115,22,.12)}\n    select.input{appearance:none}\n    textarea.input{resize:vertical;min-height:68px;line-height:1.6}\n    .lbl{display:block;font-size:10px;font-weight:800;color:" + muted + ";text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px}\n    .card{background:" + card + ";border-radius:18px;border:1px solid " + brd + ";transition:all .2s}\n    .card:hover{border-color:" + (D ? "rgba(249,115,22,.2)" : "rgba(249,115,22,.15)") + ";box-shadow:0 4px 24px rgba(0,0,0," + (D ? 0.2 : 0.06) + ")}\n    .stat-card{background:" + card + ";border-radius:16px;border:1px solid " + brd + ";padding:" + (isMobile ? "14px" : "20px") + ";position:relative;overflow:hidden;transition:all .2s}\n    .stat-card:hover{transform:translateY(-2px);box-shadow:0 8px 32px rgba(0,0,0," + (D ? 0.25 : 0.08) + ")}\n    .stat-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,#f97316,#ea580c);opacity:0;transition:opacity .2s}\n    .stat-card:hover::before{opacity:1}\n    .row{border-radius:14px;padding:14px 16px;border:1px solid " + (D ? "#1e1e1e" : "#f0f0f0") + ";background:" + card + ";transition:all .18s;cursor:pointer}\n    .row:hover{border-color:" + (D ? "rgba(249,115,22,.25)" : "rgba(249,115,22,.2)") + ";box-shadow:0 6px 20px rgba(0,0,0," + (D ? 0.2 : 0.06) + ");transform:translateY(-1px)}\n    .overlay{position:fixed;inset:0;background:rgba(0,0,0,.65);display:flex;align-items:center;justify-content:center;z-index:600;padding:16px;backdrop-filter:blur(12px)}\n    .modal{background:" + card + ";border-radius:24px;padding:24px;width:100%;max-width:520px;max-height:92vh;overflow-y:auto;border:1px solid " + brd + ";box-shadow:0 24px 60px rgba(0,0,0,.4)}\n    .tab-btn{background:none;border:none;cursor:pointer;padding:8px 14px;border-radius:9px;font-family:inherit;font-size:13px;font-weight:700;color:" + muted + ";transition:all .15s;display:flex;align-items:center;gap:7px;white-space:nowrap}\n    .tab-btn:hover{color:" + txt + ";background:" + (D ? "rgba(255,255,255,.06)" : "rgba(0,0,0,.05)") + "}\n    .tab-btn.active{background:#f97316;color:#fff;box-shadow:0 2px 10px rgba(249,115,22,.35)}\n    .mob-tab{display:flex;flex-direction:column;align-items:center;gap:4px;background:none;border:none;cursor:pointer;padding:8px 0 10px;font-family:inherit;font-size:9px;font-weight:800;color:" + muted + ";transition:all .2s;flex:1;letter-spacing:.03em;text-transform:uppercase;position:relative}\n    .mob-tab.active{color:#f97316}\n    .mob-tab.active::before{content:'';position:absolute;top:0;left:50%;transform:translateX(-50%);width:32px;height:2px;background:#f97316;border-radius:0 0 3px 3px}\n    .mob-tab-icon{width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;transition:all .2s;background:transparent}\n    .mob-tab.active .mob-tab-icon{background:rgba(249,115,22,.12)}\n    .prog{height:5px;background:" + (D ? "#1f1f1f" : "#f3f4f6") + ";border-radius:3px;overflow:hidden}\n    .prog-bar{height:100%;border-radius:3px;transition:width .8s cubic-bezier(.4,0,.2,1)}\n    .split-row{display:flex;gap:8px;align-items:center;padding:8px;background:" + (D ? "#1a1a1a" : "#f9fafb") + ";border-radius:10px;border:1px solid " + brd + ";flex-wrap:wrap}\n    .color-swatch{width:26px;height:26px;border-radius:50%;cursor:pointer;transition:transform .15s;flex-shrink:0}\n    .color-swatch:hover{transform:scale(1.18)}\n    .color-swatch.sel{box-shadow:0 0 0 3px " + (D ? "#fff" : "#111") + ",0 0 0 5px transparent;transform:scale(1.1)}\n    .badge-pro{background:linear-gradient(135deg,#f97316,#ea580c);color:#fff;border-radius:7px;padding:3px 9px;font-size:10px;font-weight:800;box-shadow:0 2px 8px rgba(249,115,22,.3)}\n    .badge-free{background:" + (D ? "#1e1e1e" : "#f3f4f6") + ";color:" + muted + ";border-radius:7px;padding:3px 9px;font-size:10px;font-weight:800;border:1px solid " + brd + "}\n    .badge-db{background:linear-gradient(135deg,#059669,#10b981);color:#fff;border-radius:7px;padding:3px 9px;font-size:10px;font-weight:800;display:inline-flex;align-items:center;gap:4px;box-shadow:0 2px 8px rgba(16,185,129,.25)}\n    .limit-bar{height:4px;border-radius:2px;overflow:hidden;background:" + (D ? "#222" : "#f3f4f6") + ";margin-top:4px}\n    .pulse{animation:pulse 2s ease-in-out infinite}\n    .glow-orange{box-shadow:0 0 0 1px rgba(249,115,22,.2),0 4px 20px rgba(249,115,22,.15)}\n    @media(max-width:480px){.modal{padding:16px;border-radius:20px}}\n  ";
    var navItems = [
        { id: "dashboard", Icon: lucide_react_1.LayoutDashboard, label: "Dashboard" },
        { id: "expenses", Icon: lucide_react_1.Receipt, label: "Expenses" },
        { id: "projects", Icon: lucide_react_1.FolderOpen, label: "Projects" },
        { id: "reports", Icon: lucide_react_1.FileBarChart2, label: "Reports" },
    ];
    if (dbError)
        return ((0, jsx_runtime_1.jsx)("div", __assign({ style: {
                fontFamily: "sans-serif",
                background: "#0d0d0d",
                minHeight: "100vh",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 24,
                textAlign: "center"
            } }, { children: (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Database, { size: 44, color: "#f97316", style: { marginBottom: 16 } }, void 0), (0, jsx_runtime_1.jsx)("h2", __assign({ style: { fontSize: 22, marginBottom: 10 } }, { children: "Database Error" }), void 0), (0, jsx_runtime_1.jsx)("p", __assign({ style: { color: "#555", fontSize: 13 } }, { children: dbError }), void 0)] }, void 0) }), void 0));
    if (loading)
        return ((0, jsx_runtime_1.jsxs)("div", __assign({ style: {
                background: D ? "#0d0d0d" : "#f4f3ef",
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
            } }, { children: [(0, jsx_runtime_1.jsx)("style", { children: "@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}" }, void 0), (0, jsx_runtime_1.jsx)("div", { style: {
                        width: 40,
                        height: 40,
                        border: "3px solid #222",
                        borderTopColor: "#f97316",
                        borderRadius: "50%",
                        animation: "spin .8s linear infinite"
                    } }, void 0)] }), void 0));
    return ((0, jsx_runtime_1.jsxs)("div", __assign({ style: {
            fontFamily: "'Plus Jakarta Sans',sans-serif",
            background: bg,
            minHeight: "100vh",
            color: txt,
            paddingBottom: isMobile ? 72 : 0,
            overflowX: "hidden"
        } }, { children: [(0, jsx_runtime_1.jsx)("style", { children: css }, void 0), toast && (0, jsx_runtime_1.jsx)(Toast, { msg: toast.msg, type: toast.type }, void 0), showManual && ((0, jsx_runtime_1.jsx)(UserManual, { onClose: function () { return setShowManual(false); }, tk: tk }, void 0)), showShare && ((0, jsx_runtime_1.jsx)(ShareCard, { grandTotal: grandTotal, estSavings: estSavings, projects: projects, onClose: function () { return setShowShare(false); }, tk: tk }, void 0)), delId && ((0, jsx_runtime_1.jsx)("div", __assign({ className: "overlay" }, { children: (0, jsx_runtime_1.jsxs)("div", __assign({ className: "modal scale-in", style: { maxWidth: 320, textAlign: "center" } }, { children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Trash2, { size: 36, color: "#dc2626", style: { marginBottom: 12 } }, void 0), (0, jsx_runtime_1.jsx)("h3", __assign({ style: {
                                fontSize: 17,
                                fontWeight: 800,
                                marginBottom: 8,
                                color: txt
                            } }, { children: "Delete this expense?" }), void 0), (0, jsx_runtime_1.jsx)("p", __assign({ style: { color: muted, fontSize: 13, marginBottom: 22 } }, { children: "This cannot be undone." }), void 0), (0, jsx_runtime_1.jsxs)("div", __assign({ style: { display: "flex", gap: 10, justifyContent: "center" } }, { children: [(0, jsx_runtime_1.jsxs)("button", __assign({ className: "btn btn-danger", onClick: confirmDelete }, { children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Trash2, { size: 13 }, void 0), " Delete"] }), void 0), (0, jsx_runtime_1.jsx)("button", __assign({ className: "btn btn-ghost", onClick: function () { return setDelId(null); } }, { children: "Cancel" }), void 0)] }), void 0)] }), void 0) }), void 0)), showPlan && ((0, jsx_runtime_1.jsx)("div", __assign({ className: "overlay", onClick: function (e) { return e.target === e.currentTarget && setShowPlan(false); } }, { children: (0, jsx_runtime_1.jsxs)("div", __assign({ className: "modal scale-in", style: { maxWidth: isMobile ? "100%" : 600 } }, { children: [(0, jsx_runtime_1.jsxs)("div", __assign({ style: {
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: 8
                            } }, { children: [(0, jsx_runtime_1.jsx)("h2", __assign({ style: {
                                        fontFamily: "'Playfair Display',serif",
                                        fontSize: 24,
                                        color: txt
                                    } }, { children: "Upgrade to Pro" }), void 0), (0, jsx_runtime_1.jsx)("button", __assign({ className: "btn btn-ghost", style: { padding: "6px 10px" }, onClick: function () { return setShowPlan(false); } }, { children: (0, jsx_runtime_1.jsx)(lucide_react_1.X, { size: 15 }, void 0) }), void 0)] }), void 0), !isPro && ((0, jsx_runtime_1.jsxs)("div", __assign({ style: {
                                background: D ? "#111" : "#f9fafb",
                                border: "1px solid " + brd,
                                borderRadius: 12,
                                padding: "14px 16px",
                                marginBottom: 18
                            } }, { children: [(0, jsx_runtime_1.jsx)("p", __assign({ style: {
                                        fontSize: 12,
                                        fontWeight: 700,
                                        color: txt,
                                        marginBottom: 10
                                    } }, { children: "Your current usage" }), void 0), [
                                    {
                                        label: "Expenses",
                                        used: expenses.length,
                                        max: FREE_EXP,
                                        color: "#f97316"
                                    },
                                    {
                                        label: "Projects",
                                        used: projects.length,
                                        max: FREE_PROJ,
                                        color: "#3b82f6"
                                    },
                                ].map(function (u) { return ((0, jsx_runtime_1.jsxs)("div", __assign({ style: { marginBottom: 8 } }, { children: [(0, jsx_runtime_1.jsxs)("div", __assign({ style: {
                                                display: "flex",
                                                justifyContent: "space-between",
                                                marginBottom: 4
                                            } }, { children: [(0, jsx_runtime_1.jsx)("span", __assign({ style: { fontSize: 11, color: muted } }, { children: u.label }), void 0), (0, jsx_runtime_1.jsxs)("span", __assign({ style: {
                                                        fontSize: 11,
                                                        fontWeight: 700,
                                                        color: Math.round((u.used / u.max) * 100) >= 70
                                                            ? "#f97316"
                                                            : txt
                                                    } }, { children: [u.used, "/", u.max] }), void 0)] }), void 0), (0, jsx_runtime_1.jsx)("div", __assign({ className: "limit-bar" }, { children: (0, jsx_runtime_1.jsx)("div", { style: {
                                                    height: "100%",
                                                    background: u.color,
                                                    width: Math.min(100, Math.round((u.used / u.max) * 100)) + "%",
                                                    borderRadius: 2,
                                                    transition: "width .5s"
                                                } }, void 0) }), void 0)] }), u.label)); })] }), void 0)), (0, jsx_runtime_1.jsx)("div", __assign({ style: {
                                display: "grid",
                                gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                                gap: 14
                            } }, { children: [
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
                                    accent: plan === "free" ? "#10b981" : brd,
                                    cur: plan === "free"
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
                                    accent: "#f97316",
                                    cur: plan === "pro",
                                    popular: true
                                },
                            ].map(function (p) { return ((0, jsx_runtime_1.jsxs)("div", __assign({ style: {
                                    border: "2px solid " + p.accent,
                                    borderRadius: 18,
                                    padding: 22,
                                    position: "relative",
                                    background: p.cur
                                        ? D
                                            ? "#1a0e00"
                                            : "#fff7ed"
                                        : D
                                            ? "#1a1a1a"
                                            : "#fafafa"
                                } }, { children: [p.popular && ((0, jsx_runtime_1.jsx)("div", __assign({ style: {
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
                                            whiteSpace: "nowrap"
                                        } }, { children: p.cur ? "CURRENT" : "MOST POPULAR" }), void 0)), (0, jsx_runtime_1.jsx)("p", __assign({ style: {
                                            fontSize: 11,
                                            fontWeight: 800,
                                            color: "#f97316",
                                            letterSpacing: ".08em",
                                            textTransform: "uppercase",
                                            marginBottom: 8
                                        } }, { children: p.label }), void 0), (0, jsx_runtime_1.jsx)("p", __assign({ style: {
                                            fontFamily: "'Playfair Display',serif",
                                            fontSize: 32,
                                            color: txt,
                                            lineHeight: 1,
                                            marginBottom: 4
                                        } }, { children: p.price }), void 0), (0, jsx_runtime_1.jsx)("p", __assign({ style: { fontSize: 12, color: muted, marginBottom: 14 } }, { children: p.sub }), void 0), p.feats.map(function (f) { return ((0, jsx_runtime_1.jsxs)("div", __assign({ style: {
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 8,
                                            marginBottom: 7
                                        } }, { children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Check, { size: 12, color: p.label === "Pro" ? "#f97316" : "#10b981" }, void 0), (0, jsx_runtime_1.jsx)("span", __assign({ style: { fontSize: 12, color: txt } }, { children: f }), void 0)] }), f)); }), p.no.map(function (f) { return ((0, jsx_runtime_1.jsxs)("div", __assign({ style: {
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 8,
                                            marginBottom: 7
                                        } }, { children: [(0, jsx_runtime_1.jsx)(lucide_react_1.X, { size: 12, color: muted }, void 0), (0, jsx_runtime_1.jsx)("span", __assign({ style: {
                                                    fontSize: 12,
                                                    color: muted,
                                                    textDecoration: "line-through"
                                                } }, { children: f }), void 0)] }), f)); }), (0, jsx_runtime_1.jsx)("button", __assign({ onClick: function () {
                                            setPlan(p.label.toLowerCase());
                                            showToast(p.label === "Pro" ? "Pro unlocked!" : "Switched to Free");
                                            setShowPlan(false);
                                        }, style: {
                                            width: "100%",
                                            padding: 11,
                                            borderRadius: 10,
                                            border: "2px solid " + (p.label === "Pro" ? "#f97316" : brd),
                                            background: p.label === "Pro"
                                                ? p.cur
                                                    ? "#10b981"
                                                    : "#f97316"
                                                : "transparent",
                                            color: p.label === "Pro" ? "#fff" : txt,
                                            fontSize: 13,
                                            fontWeight: 700,
                                            cursor: "pointer",
                                            fontFamily: "inherit",
                                            marginTop: 14,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            gap: 7
                                        } }, { children: p.cur ? ("Current Plan") : p.label === "Pro" ? ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Unlock, { size: 13 }, void 0), "Upgrade \u2014 \u20B1500/month"] }, void 0)) : ("Use Free Plan") }), void 0)] }), p.label)); }) }), void 0)] }), void 0) }), void 0)), (0, jsx_runtime_1.jsxs)("header", __assign({ style: {
                    background: D ? "rgba(14,14,14,.92)" : card,
                    borderBottom: "1px solid " + brd,
                    padding: isMobile ? "0 12px" : "0 20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    height: 58,
                    position: "sticky",
                    top: 0,
                    zIndex: 200,
                    gap: 8,
                    backdropFilter: "blur(16px)"
                } }, { children: [(0, jsx_runtime_1.jsxs)("div", __assign({ style: {
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            flexShrink: 0
                        } }, { children: [(0, jsx_runtime_1.jsx)("div", __assign({ style: {
                                    width: 32,
                                    height: 32,
                                    background: "#f97316",
                                    borderRadius: 9,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontWeight: 900,
                                    color: "#fff",
                                    fontSize: 15
                                } }, { children: "\u20A3" }), void 0), !isMobile && ((0, jsx_runtime_1.jsx)("span", __assign({ style: {
                                    fontFamily: "'Playfair Display',serif",
                                    fontSize: 17,
                                    color: txt
                                } }, { children: "FreelanceFunds" }), void 0)), isPro ? ((0, jsx_runtime_1.jsx)("span", __assign({ className: "badge-pro" }, { children: "PRO" }), void 0)) : ((0, jsx_runtime_1.jsx)("span", __assign({ className: "badge-free" }, { children: "FREE" }), void 0)), (0, jsx_runtime_1.jsxs)("span", __assign({ className: "badge-db" }, { children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Database, { size: 9 }, void 0), " Live"] }), void 0)] }), void 0), !isSmall && ((0, jsx_runtime_1.jsx)("nav", __assign({ style: {
                            display: "flex",
                            gap: 2,
                            flex: 1,
                            justifyContent: "center"
                        } }, { children: navItems.map(function (_a) {
                            var id = _a.id, Icon = _a.Icon, label = _a.label;
                            return ((0, jsx_runtime_1.jsxs)("button", __assign({ className: "tab-btn " + (tab === id ? "active" : ""), onClick: function () { return setTab(id); } }, { children: [(0, jsx_runtime_1.jsx)(Icon, { size: 14 }, void 0), " ", label] }), id));
                        }) }), void 0)), (0, jsx_runtime_1.jsxs)("div", __assign({ style: {
                            display: "flex",
                            gap: 6,
                            alignItems: "center",
                            flexShrink: 0
                        } }, { children: [expenses.length > 0 && ((0, jsx_runtime_1.jsxs)("button", __assign({ className: "btn btn-share", style: { padding: "7px 10px", fontSize: 12 }, onClick: function () { return setShowShare(true); } }, { children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Share2, { size: 14 }, void 0), !isMobile && " Share"] }), void 0)), (0, jsx_runtime_1.jsx)("button", __assign({ className: "btn btn-ghost", style: { padding: "7px 9px" }, onClick: function () { return setShowManual(true); } }, { children: (0, jsx_runtime_1.jsx)(lucide_react_1.HelpCircle, { size: 16 }, void 0) }), void 0), (0, jsx_runtime_1.jsx)("button", __assign({ className: "btn btn-ghost", style: { padding: "7px 9px" }, onClick: function () { return setDark(function (d) { return !d; }); } }, { children: D ? (0, jsx_runtime_1.jsx)(lucide_react_1.Sun, { size: 15 }, void 0) : (0, jsx_runtime_1.jsx)(lucide_react_1.Moon, { size: 15 }, void 0) }), void 0), !isPro && !isMobile && ((0, jsx_runtime_1.jsxs)("button", __assign({ className: "btn btn-pro " + (nearLimit ? "pulse" : ""), style: { fontSize: 12, padding: "7px 12px" }, onClick: function () { return setShowPlan(true); } }, { children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Zap, { size: 13 }, void 0), " ", nearLimit ? "Upgrade Now" : "Pro"] }), void 0)), !isMobile && ((0, jsx_runtime_1.jsxs)("div", __assign({ style: {
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 8,
                                    background: D ? "#1e1e1e" : "#f3f4f6",
                                    borderRadius: 10,
                                    padding: "6px 12px"
                                } }, { children: [(0, jsx_runtime_1.jsx)(lucide_react_1.User, { size: 13, color: muted }, void 0), (0, jsx_runtime_1.jsx)("span", __assign({ style: {
                                            fontSize: 11,
                                            fontWeight: 600,
                                            color: muted,
                                            maxWidth: 120,
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap"
                                        } }, { children: user.email }), void 0), (0, jsx_runtime_1.jsx)("button", __assign({ onClick: signOut, title: "Sign out", style: {
                                            background: "none",
                                            border: "none",
                                            cursor: "pointer",
                                            color: muted,
                                            display: "flex",
                                            padding: 2
                                        } }, { children: (0, jsx_runtime_1.jsx)(lucide_react_1.LogOut, { size: 13 }, void 0) }), void 0)] }), void 0)), !isSmall && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)("button", __assign({ className: "btn btn-ghost", style: { fontSize: 12 }, onClick: function () {
                                            setModal("project");
                                            setPForm({
                                                name: "",
                                                client: "",
                                                color: "#f97316",
                                                budget: ""
                                            });
                                        } }, { children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Plus, { size: 14 }, void 0), " Project"] }), void 0), (0, jsx_runtime_1.jsxs)("button", __assign({ className: "btn btn-primary", onClick: openAdd }, { children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Plus, { size: 14 }, void 0), " Add"] }), void 0)] }, void 0)), isMobile && ((0, jsx_runtime_1.jsx)("button", __assign({ className: "btn btn-primary", style: { padding: "7px 13px" }, onClick: openAdd }, { children: (0, jsx_runtime_1.jsx)(lucide_react_1.Plus, { size: 16 }, void 0) }), void 0))] }), void 0)] }), void 0), !isPro && ((0, jsx_runtime_1.jsxs)("div", __assign({ style: {
                    background: D ? "#111" : "#fafafa",
                    borderBottom: "1px solid " + brd,
                    padding: "6px 16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                    flexWrap: "wrap"
                } }, { children: [(0, jsx_runtime_1.jsxs)("div", __assign({ style: {
                            display: "flex",
                            gap: 16,
                            alignItems: "center",
                            flexWrap: "wrap"
                        } }, { children: [[
                                {
                                    label: "Expenses",
                                    used: expenses.length,
                                    max: FREE_EXP,
                                    color: "#f97316"
                                },
                                {
                                    label: "Projects",
                                    used: projects.length,
                                    max: FREE_PROJ,
                                    color: "#3b82f6"
                                },
                            ].map(function (u) { return ((0, jsx_runtime_1.jsxs)("div", __assign({ style: { display: "flex", alignItems: "center", gap: 6 } }, { children: [(0, jsx_runtime_1.jsxs)("span", __assign({ style: { fontSize: 11, color: muted } }, { children: [u.label, ":"] }), void 0), (0, jsx_runtime_1.jsxs)("span", __assign({ style: {
                                            fontSize: 11,
                                            fontWeight: 800,
                                            color: Math.round((u.used / u.max) * 100) >= 80
                                                ? "#f97316"
                                                : txt
                                        } }, { children: [u.used, "/", u.max] }), void 0), (0, jsx_runtime_1.jsx)("div", __assign({ style: { width: 40 } }, { children: (0, jsx_runtime_1.jsx)("div", __assign({ className: "limit-bar" }, { children: (0, jsx_runtime_1.jsx)("div", { style: {
                                                    height: "100%",
                                                    background: u.color,
                                                    borderRadius: 2,
                                                    width: Math.min(100, Math.round((u.used / u.max) * 100)) + "%"
                                                } }, void 0) }), void 0) }), void 0)] }), u.label)); }), (0, jsx_runtime_1.jsx)("span", __assign({ style: { fontSize: 11, color: muted } }, { children: "2-way split only" }), void 0)] }), void 0), (0, jsx_runtime_1.jsxs)("button", __assign({ className: "btn btn-pro", style: { fontSize: 11, padding: "4px 12px" }, onClick: function () { return setShowPlan(true); } }, { children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Zap, { size: 11 }, void 0), " Upgrade"] }), void 0)] }), void 0)), isTablet && ((0, jsx_runtime_1.jsx)("div", __assign({ style: {
                    background: card,
                    borderBottom: "1px solid " + brd,
                    padding: "8px 16px",
                    display: "flex",
                    gap: 6,
                    overflowX: "auto"
                } }, { children: navItems.map(function (_a) {
                    var id = _a.id, Icon = _a.Icon, label = _a.label;
                    return ((0, jsx_runtime_1.jsxs)("button", __assign({ className: "tab-btn " + (tab === id ? "active" : ""), onClick: function () { return setTab(id); }, style: { flexShrink: 0 } }, { children: [(0, jsx_runtime_1.jsx)(Icon, { size: 14 }, void 0), label] }), id));
                }) }), void 0)), (0, jsx_runtime_1.jsxs)("main", __assign({ style: {
                    maxWidth: 1040,
                    margin: "0 auto",
                    padding: isMobile
                        ? "16px 12px"
                        : isTablet
                            ? "20px 16px"
                            : "28px 20px"
                } }, { children: [tab === "dashboard" && ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("div", __assign({ className: "fade-up", style: {
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: isMobile ? "flex-start" : "center",
                                    flexDirection: isMobile ? "column" : "row",
                                    gap: 12,
                                    marginBottom: 24
                                } }, { children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("h1", __assign({ style: {
                                                    fontFamily: "'Playfair Display',serif",
                                                    fontSize: isMobile ? 26 : 32,
                                                    letterSpacing: "-0.03em",
                                                    marginBottom: 4,
                                                    color: txt
                                                } }, { children: ["Good day ", (0, jsx_runtime_1.jsx)("span", __assign({ style: { color: "#f97316" } }, { children: "\u2726" }), void 0)] }), void 0), (0, jsx_runtime_1.jsxs)("p", __assign({ style: {
                                                    color: muted,
                                                    fontSize: 12,
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 6
                                                } }, { children: [(0, jsx_runtime_1.jsx)("span", { style: {
                                                            width: 6,
                                                            height: 6,
                                                            borderRadius: "50%",
                                                            background: "#10b981",
                                                            display: "inline-block"
                                                        } }, void 0), expenses.length, " expenses \u00B7 ", projects.length, " projects \u00B7", " ", isPro ? "Pro Plan" : "Free Plan"] }), void 0)] }, void 0), (0, jsx_runtime_1.jsxs)("div", __assign({ style: { display: "flex", gap: 8 } }, { children: [(0, jsx_runtime_1.jsxs)("button", __assign({ className: "btn btn-ghost", style: { fontSize: 12 }, onClick: function () { return setShowManual(true); } }, { children: [(0, jsx_runtime_1.jsx)(lucide_react_1.BookOpen, { size: 13 }, void 0), " Manual"] }), void 0), !isMobile && ((0, jsx_runtime_1.jsxs)("button", __assign({ className: "btn btn-ghost", style: { fontSize: 12 }, onClick: exportCSV }, { children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Download, { size: 13 }, void 0), " Export"] }), void 0)), expenses.length > 0 && ((0, jsx_runtime_1.jsxs)("button", __assign({ className: "btn btn-share", style: { fontSize: 12 }, onClick: function () { return setShowShare(true); } }, { children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Share2, { size: 13 }, void 0), " Share"] }), void 0))] }), void 0)] }), void 0), expenses.length === 0 && projects.length === 0 && ((0, jsx_runtime_1.jsxs)("div", __assign({ className: "fade-up-1", style: {
                                    background: D
                                        ? "linear-gradient(135deg,#141414,#1a1200)"
                                        : "linear-gradient(135deg,#fff,#fff7ed)",
                                    border: "1.5px dashed " + (D ? "rgba(249,115,22,.3)" : "rgba(249,115,22,.25)"),
                                    borderRadius: 24,
                                    padding: "52px 32px",
                                    textAlign: "center",
                                    marginBottom: 20
                                } }, { children: [(0, jsx_runtime_1.jsx)("div", __assign({ style: {
                                            width: 72,
                                            height: 72,
                                            borderRadius: 20,
                                            background: "rgba(249,115,22,.12)",
                                            border: "2px solid rgba(249,115,22,.25)",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            margin: "0 auto 20px",
                                            boxShadow: "0 8px 32px rgba(249,115,22,.15)"
                                        } }, { children: (0, jsx_runtime_1.jsx)(lucide_react_1.FolderOpen, { size: 30, color: "#f97316" }, void 0) }), void 0), (0, jsx_runtime_1.jsx)("h2", __assign({ style: {
                                            fontFamily: "'Playfair Display',serif",
                                            fontSize: 22,
                                            color: txt,
                                            marginBottom: 8
                                        } }, { children: "Value in 2 minutes" }), void 0), (0, jsx_runtime_1.jsx)("p", __assign({ style: {
                                            color: muted,
                                            fontSize: 14,
                                            lineHeight: 1.75,
                                            maxWidth: 340,
                                            margin: "0 auto 8px"
                                        } }, { children: "Create your first project, log one expense, and see your estimated tax savings instantly." }), void 0), (0, jsx_runtime_1.jsx)("p", __assign({ style: {
                                            color: "#f97316",
                                            fontSize: 13,
                                            fontWeight: 700,
                                            marginBottom: 28
                                        } }, { children: "Start here \u2014 takes 30 seconds." }), void 0), (0, jsx_runtime_1.jsxs)("div", __assign({ style: {
                                            display: "flex",
                                            gap: 10,
                                            justifyContent: "center",
                                            flexWrap: "wrap"
                                        } }, { children: [(0, jsx_runtime_1.jsxs)("button", __assign({ className: "btn btn-primary", style: { fontSize: 14, padding: "12px 22px" }, onClick: function () {
                                                    setModal("project");
                                                    setPForm({
                                                        name: "",
                                                        client: "",
                                                        color: "#f97316",
                                                        budget: ""
                                                    });
                                                } }, { children: [(0, jsx_runtime_1.jsx)(lucide_react_1.FolderOpen, { size: 15 }, void 0), " Create First Project"] }), void 0), (0, jsx_runtime_1.jsxs)("button", __assign({ className: "btn btn-ghost", onClick: function () { return setShowManual(true); } }, { children: [(0, jsx_runtime_1.jsx)(lucide_react_1.BookOpen, { size: 14 }, void 0), " Read Manual"] }), void 0)] }), void 0)] }), void 0)), projects.length > 0 && expenses.length === 0 && ((0, jsx_runtime_1.jsxs)("div", __assign({ className: "fade-up-1", style: {
                                    background: D
                                        ? "linear-gradient(135deg,#0d1a2a,#0a1520)"
                                        : "linear-gradient(135deg,#eff6ff,#e0f2fe)",
                                    border: "1px solid " + (D ? "rgba(59,130,246,.2)" : "rgba(59,130,246,.25)"),
                                    borderRadius: 18,
                                    padding: "20px 24px",
                                    marginBottom: 16,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 16,
                                    flexWrap: "wrap"
                                } }, { children: [(0, jsx_runtime_1.jsx)("div", __assign({ style: {
                                            width: 48,
                                            height: 48,
                                            borderRadius: 13,
                                            background: "rgba(59,130,246,.15)",
                                            border: "1px solid rgba(59,130,246,.2)",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            flexShrink: 0
                                        } }, { children: (0, jsx_runtime_1.jsx)(lucide_react_1.Receipt, { size: 21, color: "#3b82f6" }, void 0) }), void 0), (0, jsx_runtime_1.jsxs)("div", __assign({ style: { flex: 1, minWidth: 0 } }, { children: [(0, jsx_runtime_1.jsx)("p", __assign({ style: {
                                                    fontWeight: 800,
                                                    fontSize: 14,
                                                    color: txt,
                                                    marginBottom: 3
                                                } }, { children: "Project ready \u2014 log your first expense" }), void 0), (0, jsx_runtime_1.jsx)("p", __assign({ style: { fontSize: 12, color: muted } }, { children: "Your dashboard will show live tax savings as soon as you add one." }), void 0)] }), void 0), (0, jsx_runtime_1.jsxs)("button", __assign({ className: "btn btn-primary", onClick: openAdd, style: { flexShrink: 0 } }, { children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Plus, { size: 14 }, void 0), " Add Expense"] }), void 0)] }), void 0)), expenses.length > 0 && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)("div", __assign({ className: "fade-up-1", style: {
                                            display: "grid",
                                            gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                                            gap: 12,
                                            marginBottom: 14
                                        } }, { children: [(0, jsx_runtime_1.jsxs)("div", __assign({ style: {
                                                    background: D
                                                        ? "linear-gradient(135deg,#111,#1a0e00)"
                                                        : "linear-gradient(135deg,#fff,#fff7ed)",
                                                    borderRadius: 22,
                                                    padding: isMobile ? "20px 20px" : "24px 28px",
                                                    position: "relative",
                                                    overflow: "hidden",
                                                    border: "1px solid " + (D ? "rgba(249,115,22,.18)" : "rgba(249,115,22,.2)"),
                                                    boxShadow: D
                                                        ? "0 8px 32px rgba(0,0,0,.4)"
                                                        : "0 4px 20px rgba(249,115,22,.1)"
                                                } }, { children: [(0, jsx_runtime_1.jsx)("div", { style: {
                                                            position: "absolute",
                                                            right: -30,
                                                            top: -30,
                                                            width: 140,
                                                            height: 140,
                                                            borderRadius: "50%",
                                                            background: "rgba(249,115,22,.08)",
                                                            pointerEvents: "none"
                                                        } }, void 0), (0, jsx_runtime_1.jsx)("div", __assign({ style: { position: "absolute", right: 10, top: 10 } }, { children: (0, jsx_runtime_1.jsx)("div", __assign({ style: {
                                                                width: 36,
                                                                height: 36,
                                                                borderRadius: 10,
                                                                background: "rgba(249,115,22,.12)",
                                                                display: "flex",
                                                                alignItems: "center",
                                                                justifyContent: "center"
                                                            } }, { children: (0, jsx_runtime_1.jsx)(lucide_react_1.Wallet, { size: 16, color: "#f97316" }, void 0) }), void 0) }), void 0), (0, jsx_runtime_1.jsx)("p", __assign({ style: {
                                                            fontSize: 10,
                                                            fontWeight: 800,
                                                            color: "#f97316",
                                                            textTransform: "uppercase",
                                                            letterSpacing: ".1em",
                                                            marginBottom: 10
                                                        } }, { children: "Total Tracked" }), void 0), (0, jsx_runtime_1.jsx)("p", __assign({ style: {
                                                            fontFamily: "'Playfair Display',serif",
                                                            fontSize: isMobile ? 34 : 42,
                                                            lineHeight: 1,
                                                            letterSpacing: "-0.03em",
                                                            color: txt,
                                                            marginBottom: 6
                                                        } }, { children: fmt(grandTotal) }), void 0), (0, jsx_runtime_1.jsxs)("p", __assign({ style: { color: muted, fontSize: 12 } }, { children: [expenses.length, " expenses across ", projects.length, " ", "project", projects.length !== 1 ? "s" : ""] }), void 0)] }), void 0), (0, jsx_runtime_1.jsxs)("div", __assign({ style: {
                                                    background: D
                                                        ? "linear-gradient(135deg,#0a1a0f,#0d2015)"
                                                        : "linear-gradient(135deg,#f0fdf4,#dcfce7)",
                                                    borderRadius: 22,
                                                    padding: isMobile ? "20px 20px" : "24px 28px",
                                                    position: "relative",
                                                    overflow: "hidden",
                                                    border: "1px solid " + (D ? "rgba(16,185,129,.18)" : "rgba(16,185,129,.25)"),
                                                    boxShadow: D
                                                        ? "0 8px 32px rgba(0,0,0,.4)"
                                                        : "0 4px 20px rgba(16,185,129,.1)"
                                                } }, { children: [(0, jsx_runtime_1.jsx)("div", { style: {
                                                            position: "absolute",
                                                            right: -30,
                                                            top: -30,
                                                            width: 140,
                                                            height: 140,
                                                            borderRadius: "50%",
                                                            background: "rgba(16,185,129,.08)",
                                                            pointerEvents: "none"
                                                        } }, void 0), (0, jsx_runtime_1.jsx)("div", __assign({ style: { position: "absolute", right: 10, top: 10 } }, { children: (0, jsx_runtime_1.jsx)("div", __assign({ style: {
                                                                width: 36,
                                                                height: 36,
                                                                borderRadius: 10,
                                                                background: "rgba(16,185,129,.12)",
                                                                display: "flex",
                                                                alignItems: "center",
                                                                justifyContent: "center"
                                                            } }, { children: (0, jsx_runtime_1.jsx)(lucide_react_1.Shield, { size: 16, color: "#10b981" }, void 0) }), void 0) }), void 0), (0, jsx_runtime_1.jsx)("p", __assign({ style: {
                                                            fontSize: 10,
                                                            fontWeight: 800,
                                                            color: "#10b981",
                                                            textTransform: "uppercase",
                                                            letterSpacing: ".1em",
                                                            marginBottom: 10
                                                        } }, { children: "Est. Tax Savings" }), void 0), (0, jsx_runtime_1.jsx)("p", __assign({ style: {
                                                            fontFamily: "'Playfair Display',serif",
                                                            fontSize: isMobile ? 34 : 42,
                                                            lineHeight: 1,
                                                            letterSpacing: "-0.03em",
                                                            color: txt,
                                                            marginBottom: 6
                                                        } }, { children: fmt(estSavings) }), void 0), (0, jsx_runtime_1.jsx)("p", __assign({ style: { color: muted, fontSize: 12 } }, { children: "at 20% deduction rate" }), void 0)] }), void 0)] }), void 0), (0, jsx_runtime_1.jsx)("div", __assign({ className: "fade-up-2", style: {
                                            display: "grid",
                                            gridTemplateColumns: "repeat(3,1fr)",
                                            gap: 10,
                                            marginBottom: 14
                                        } }, { children: [
                                            {
                                                label: "Avg Expense",
                                                val: fmt(Math.round(grandTotal / expenses.length)),
                                                Icon: lucide_react_1.BarChart3,
                                                accent: "#8b5cf6"
                                            },
                                            {
                                                label: "Top Category",
                                                val: ((_b = Object.entries(catTotals).sort(function (a, b) { return b[1] - a[1]; })[0]) === null || _b === void 0 ? void 0 : _b[0]) || "–",
                                                Icon: lucide_react_1.Tag,
                                                accent: "#f97316"
                                            },
                                            {
                                                label: "Hours Saved",
                                                val: "~10 hrs",
                                                Icon: lucide_react_1.Clock,
                                                accent: "#3b82f6"
                                            },
                                        ].map(function (s, i) { return ((0, jsx_runtime_1.jsxs)("div", __assign({ className: "stat-card" }, { children: [(0, jsx_runtime_1.jsx)("div", __assign({ style: {
                                                        width: 32,
                                                        height: 32,
                                                        borderRadius: 9,
                                                        background: s.accent + "15",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        marginBottom: 10
                                                    } }, { children: (0, jsx_runtime_1.jsx)(s.Icon, { size: 15, color: s.accent }, void 0) }), void 0), (0, jsx_runtime_1.jsx)("p", __assign({ className: "lbl", style: { marginBottom: 4 } }, { children: s.label }), void 0), (0, jsx_runtime_1.jsx)("p", __assign({ style: {
                                                        fontFamily: "'Playfair Display',serif",
                                                        fontSize: isMobile ? 15 : 18,
                                                        color: txt,
                                                        lineHeight: 1,
                                                        letterSpacing: "-0.01em"
                                                    } }, { children: s.val }), void 0)] }), i)); }) }), void 0), (0, jsx_runtime_1.jsxs)("div", __assign({ className: "fade-up-2", style: {
                                            display: "grid",
                                            gridTemplateColumns: isMobile ? "1fr" : "5fr 3fr",
                                            gap: 12,
                                            marginBottom: 14
                                        } }, { children: [(0, jsx_runtime_1.jsxs)("div", __assign({ className: "card", style: { padding: isMobile ? 16 : 22 } }, { children: [(0, jsx_runtime_1.jsxs)("div", __assign({ style: {
                                                            display: "flex",
                                                            justifyContent: "space-between",
                                                            alignItems: "center",
                                                            marginBottom: 16
                                                        } }, { children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("p", __assign({ style: {
                                                                            fontWeight: 800,
                                                                            fontSize: 14,
                                                                            color: txt,
                                                                            display: "flex",
                                                                            alignItems: "center",
                                                                            gap: 7
                                                                        } }, { children: [(0, jsx_runtime_1.jsx)(lucide_react_1.BarChart3, { size: 14, color: "#f97316" }, void 0), " Monthly Spend"] }), void 0), (0, jsx_runtime_1.jsx)("p", __assign({ style: { fontSize: 11, color: muted, marginTop: 2 } }, { children: "2025 overview" }), void 0)] }, void 0), (0, jsx_runtime_1.jsx)("div", __assign({ style: {
                                                                    fontSize: 12,
                                                                    fontWeight: 700,
                                                                    color: "#f97316"
                                                                } }, { children: fmt(grandTotal) }), void 0)] }), void 0), (0, jsx_runtime_1.jsx)("div", __assign({ style: {
                                                            display: "flex",
                                                            alignItems: "flex-end",
                                                            gap: 4,
                                                            height: 72
                                                        } }, { children: monthly.map(function (d, i) { return ((0, jsx_runtime_1.jsxs)("div", __assign({ style: {
                                                                flex: 1,
                                                                display: "flex",
                                                                flexDirection: "column",
                                                                alignItems: "center",
                                                                gap: 3
                                                            } }, { children: [(0, jsx_runtime_1.jsx)("div", __assign({ style: {
                                                                        width: "100%",
                                                                        height: 56,
                                                                        display: "flex",
                                                                        alignItems: "flex-end",
                                                                        borderRadius: "4px 4px 0 0",
                                                                        overflow: "hidden",
                                                                        background: D
                                                                            ? "rgba(255,255,255,.04)"
                                                                            : "rgba(0,0,0,.04)"
                                                                    }, title: d.label + ": " + fmt(d.val) }, { children: (0, jsx_runtime_1.jsx)("div", { style: {
                                                                            width: "100%",
                                                                            background: d.highlight
                                                                                ? "#f97316"
                                                                                : D
                                                                                    ? "#3b82f6"
                                                                                    : "#60a5fa",
                                                                            height: (d.val / Math.max.apply(Math, __spreadArray(__spreadArray([], monthly.map(function (x) { return x.val; }), false), [1], false))) *
                                                                                100 + "%",
                                                                            borderRadius: "4px 4px 0 0",
                                                                            transition: "height .6s ease",
                                                                            opacity: d.val === 0 ? 0.2 : 1
                                                                        } }, void 0) }), void 0), (0, jsx_runtime_1.jsx)("span", __assign({ style: {
                                                                        fontSize: 8,
                                                                        color: muted,
                                                                        fontWeight: 700
                                                                    } }, { children: d.label }), void 0)] }), i)); }) }), void 0)] }), void 0), (0, jsx_runtime_1.jsxs)("div", __assign({ className: "card", style: {
                                                    padding: isMobile ? 16 : 22,
                                                    display: "flex",
                                                    flexDirection: "column"
                                                } }, { children: [(0, jsx_runtime_1.jsxs)("p", __assign({ style: {
                                                            fontWeight: 800,
                                                            fontSize: 14,
                                                            color: txt,
                                                            display: "flex",
                                                            alignItems: "center",
                                                            gap: 7,
                                                            marginBottom: 16
                                                        } }, { children: [(0, jsx_runtime_1.jsx)(lucide_react_1.PieChart, { size: 14, color: "#f97316" }, void 0), " Projects"] }), void 0), (0, jsx_runtime_1.jsxs)("div", __assign({ style: {
                                                            flex: 1,
                                                            display: "flex",
                                                            flexDirection: "column",
                                                            alignItems: "center",
                                                            gap: 14
                                                        } }, { children: [(0, jsx_runtime_1.jsx)(DonutChart, { size: 84, segments: projects.map(function (p) { return ({
                                                                    pct: grandTotal
                                                                        ? Math.round(((projTotals[p.id] || 0) / grandTotal) * 100)
                                                                        : 0,
                                                                    color: p.color
                                                                }); }) }, void 0), (0, jsx_runtime_1.jsx)("div", __assign({ style: {
                                                                    width: "100%",
                                                                    display: "flex",
                                                                    flexDirection: "column",
                                                                    gap: 6
                                                                } }, { children: projects.map(function (p) { return ((0, jsx_runtime_1.jsxs)("div", __assign({ style: {
                                                                        display: "flex",
                                                                        justifyContent: "space-between",
                                                                        alignItems: "center"
                                                                    } }, { children: [(0, jsx_runtime_1.jsxs)("div", __assign({ style: {
                                                                                display: "flex",
                                                                                alignItems: "center",
                                                                                gap: 7
                                                                            } }, { children: [(0, jsx_runtime_1.jsx)("div", { style: {
                                                                                        width: 8,
                                                                                        height: 8,
                                                                                        borderRadius: 2,
                                                                                        background: p.color
                                                                                    } }, void 0), (0, jsx_runtime_1.jsx)("span", __assign({ style: {
                                                                                        fontSize: 11,
                                                                                        color: txt,
                                                                                        fontWeight: 600,
                                                                                        overflow: "hidden",
                                                                                        textOverflow: "ellipsis",
                                                                                        whiteSpace: "nowrap",
                                                                                        maxWidth: 80
                                                                                    } }, { children: p.name }), void 0)] }), void 0), (0, jsx_runtime_1.jsx)("span", __assign({ style: {
                                                                                fontSize: 11,
                                                                                color: muted,
                                                                                fontWeight: 700
                                                                            } }, { children: fmt(Math.round(projTotals[p.id] || 0)) }), void 0)] }), p.id)); }) }), void 0)] }), void 0)] }), void 0)] }), void 0)] }, void 0)), projects.length > 0 && ((0, jsx_runtime_1.jsx)("div", __assign({ className: "fade-up-3", style: {
                                    display: "grid",
                                    gridTemplateColumns: isMobile
                                        ? "1fr"
                                        : isTablet
                                            ? "repeat(2,1fr)"
                                            : "repeat(auto-fit,minmax(210px,1fr))",
                                    gap: 10,
                                    marginBottom: 14
                                } }, { children: projects.map(function (p, idx) {
                                    var spent = projTotals[p.id] || 0;
                                    var pct = p.budget
                                        ? Math.min(100, Math.round((spent / p.budget) * 100))
                                        : null;
                                    return ((0, jsx_runtime_1.jsxs)("div", __assign({ style: {
                                            background: card,
                                            borderRadius: 18,
                                            padding: 18,
                                            border: "1px solid " + brd,
                                            position: "relative",
                                            overflow: "hidden",
                                            transition: "all .2s",
                                            cursor: "default"
                                        }, onMouseEnter: function (e) {
                                            e.currentTarget.style.transform = "translateY(-2px)";
                                            e.currentTarget.style.boxShadow = D
                                                ? "0 10px 36px rgba(0,0,0,.35)"
                                                : "0 8px 28px rgba(0,0,0,.1)";
                                        }, onMouseLeave: function (e) {
                                            e.currentTarget.style.transform = "translateY(0)";
                                            e.currentTarget.style.boxShadow = "none";
                                        } }, { children: [(0, jsx_runtime_1.jsx)("div", { style: {
                                                    position: "absolute",
                                                    top: 0,
                                                    left: 0,
                                                    right: 0,
                                                    height: 3,
                                                    background: "linear-gradient(90deg," + p.color + "," + p.color + "88)"
                                                } }, void 0), (0, jsx_runtime_1.jsxs)("div", __assign({ style: {
                                                    display: "flex",
                                                    justifyContent: "space-between",
                                                    alignItems: "flex-start",
                                                    marginBottom: 12,
                                                    paddingTop: 4
                                                } }, { children: [(0, jsx_runtime_1.jsxs)("div", __assign({ style: { minWidth: 0 } }, { children: [(0, jsx_runtime_1.jsx)("p", __assign({ style: {
                                                                    fontWeight: 800,
                                                                    fontSize: 13,
                                                                    color: txt,
                                                                    overflow: "hidden",
                                                                    textOverflow: "ellipsis",
                                                                    whiteSpace: "nowrap"
                                                                } }, { children: p.name }), void 0), (0, jsx_runtime_1.jsx)("p", __assign({ style: {
                                                                    fontSize: 11,
                                                                    color: muted,
                                                                    marginTop: 2,
                                                                    overflow: "hidden",
                                                                    textOverflow: "ellipsis",
                                                                    whiteSpace: "nowrap"
                                                                } }, { children: p.client || "No client" }), void 0)] }), void 0), (0, jsx_runtime_1.jsxs)("span", __assign({ style: {
                                                            background: p.color + "18",
                                                            color: p.color,
                                                            border: "1px solid " + p.color + "30",
                                                            borderRadius: 8,
                                                            padding: "3px 8px",
                                                            fontSize: 11,
                                                            fontWeight: 800,
                                                            flexShrink: 0
                                                        } }, { children: [grandTotal
                                                                ? Math.round((spent / grandTotal) * 100)
                                                                : 0, "%"] }), void 0)] }), void 0), (0, jsx_runtime_1.jsx)("p", __assign({ style: {
                                                    fontFamily: "'Playfair Display',serif",
                                                    fontSize: 22,
                                                    color: txt,
                                                    marginBottom: 8,
                                                    letterSpacing: "-0.02em"
                                                } }, { children: fmt(Math.round(spent)) }), void 0), p.budget > 0 && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("div", __assign({ style: {
                                                            height: 4,
                                                            background: D ? "#1f1f1f" : "#f3f4f6",
                                                            borderRadius: 2,
                                                            overflow: "hidden",
                                                            marginBottom: 4
                                                        } }, { children: (0, jsx_runtime_1.jsx)("div", { style: {
                                                                height: "100%",
                                                                width: pct + "%",
                                                                background: pct > 80 ? "#ef4444" : p.color,
                                                                borderRadius: 2,
                                                                transition: "width .8s ease"
                                                            } }, void 0) }), void 0), (0, jsx_runtime_1.jsxs)("p", __assign({ style: {
                                                            fontSize: 10,
                                                            color: pct > 80 ? "#ef4444" : muted
                                                        } }, { children: [pct > 80 ? "⚠ " : "", fmt(Math.round(p.budget - spent)), " remaining"] }), void 0)] }, void 0))] }), p.id));
                                }) }), void 0)), !isPro && expenses.length >= 5 && ((0, jsx_runtime_1.jsx)("div", __assign({ style: { marginBottom: 14 } }, { children: (0, jsx_runtime_1.jsx)(UpgradeNudge, { feature: "4-way splitting + AI suggestions + PDF reports", onUpgrade: function () { return setShowPlan(true); }, D: D, brd: brd }, void 0) }), void 0)), expenses.length > 0 && ((0, jsx_runtime_1.jsxs)("div", __assign({ className: "card fade-up-3", style: { padding: isMobile ? 14 : 22 } }, { children: [(0, jsx_runtime_1.jsxs)("div", __assign({ style: {
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            marginBottom: 16
                                        } }, { children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("p", __assign({ style: {
                                                            fontWeight: 800,
                                                            fontSize: 15,
                                                            color: txt,
                                                            display: "flex",
                                                            alignItems: "center",
                                                            gap: 8
                                                        } }, { children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Clock, { size: 15, color: "#f97316" }, void 0), " Recent Activity"] }), void 0), (0, jsx_runtime_1.jsxs)("p", __assign({ style: { fontSize: 11, color: muted, marginTop: 2 } }, { children: ["Last ", Math.min(5, expenses.length), " transactions"] }), void 0)] }, void 0), (0, jsx_runtime_1.jsxs)("button", __assign({ className: "btn btn-ghost", style: { fontSize: 12, padding: "6px 12px" }, onClick: function () { return setTab("expenses"); } }, { children: ["View all ", (0, jsx_runtime_1.jsx)(lucide_react_1.ArrowRight, { size: 12 }, void 0)] }), void 0)] }), void 0), (0, jsx_runtime_1.jsx)("div", __assign({ style: { display: "flex", flexDirection: "column", gap: 2 } }, { children: expenses.slice(0, 5).map(function (e, idx) {
                                            var _a = CAT_META[e.category] || CAT_META.Other, CIc = _a.Icon, cClr = _a.color;
                                            return ((0, jsx_runtime_1.jsxs)("div", __assign({ className: "row", onClick: function () { return openEdit(e); }, style: {
                                                    marginBottom: idx < Math.min(4, expenses.length - 1) ? 2 : 0
                                                } }, { children: [(0, jsx_runtime_1.jsxs)("div", __assign({ style: {
                                                            display: "flex",
                                                            justifyContent: "space-between",
                                                            alignItems: "center",
                                                            marginBottom: 8
                                                        } }, { children: [(0, jsx_runtime_1.jsxs)("div", __assign({ style: {
                                                                    display: "flex",
                                                                    alignItems: "center",
                                                                    gap: 10,
                                                                    flex: 1,
                                                                    minWidth: 0
                                                                } }, { children: [(0, jsx_runtime_1.jsx)("div", __assign({ style: {
                                                                            width: 38,
                                                                            height: 38,
                                                                            background: cClr + "15",
                                                                            borderRadius: 11,
                                                                            display: "flex",
                                                                            alignItems: "center",
                                                                            justifyContent: "center",
                                                                            flexShrink: 0,
                                                                            color: cClr,
                                                                            border: "1px solid " + cClr + "20"
                                                                        } }, { children: (0, jsx_runtime_1.jsx)(CIc, { size: 16 }, void 0) }), void 0), (0, jsx_runtime_1.jsxs)("div", __assign({ style: { minWidth: 0 } }, { children: [(0, jsx_runtime_1.jsx)("p", __assign({ style: {
                                                                                    fontWeight: 700,
                                                                                    fontSize: 13,
                                                                                    color: txt,
                                                                                    overflow: "hidden",
                                                                                    textOverflow: "ellipsis",
                                                                                    whiteSpace: "nowrap"
                                                                                } }, { children: e.description }), void 0), (0, jsx_runtime_1.jsxs)("p", __assign({ style: {
                                                                                    fontSize: 10,
                                                                                    color: muted,
                                                                                    marginTop: 1
                                                                                } }, { children: [e.date, " \u00B7 ", e.category] }), void 0)] }), void 0)] }), void 0), (0, jsx_runtime_1.jsx)("p", __assign({ style: {
                                                                    fontWeight: 800,
                                                                    fontSize: 14,
                                                                    color: txt,
                                                                    flexShrink: 0,
                                                                    marginLeft: 8
                                                                } }, { children: fmt(e.amount) }), void 0)] }), void 0), (0, jsx_runtime_1.jsx)(SplitBar, { splits: e.splits, projects: projects }, void 0), (0, jsx_runtime_1.jsx)("div", __assign({ style: {
                                                            display: "flex",
                                                            flexWrap: "wrap",
                                                            gap: 4,
                                                            marginTop: 7
                                                        } }, { children: e.splits.map(function (s, i) { return ((0, jsx_runtime_1.jsxs)("span", __assign({ style: {
                                                                background: pClr(projects, s.pid) + "12",
                                                                color: pClr(projects, s.pid),
                                                                border: "1px solid " + pClr(projects, s.pid) + "25",
                                                                borderRadius: 20,
                                                                padding: "2px 9px",
                                                                fontSize: 10,
                                                                fontWeight: 700,
                                                                whiteSpace: "nowrap"
                                                            } }, { children: [pNm(projects, s.pid), " ", s.pct, "%"] }), i)); }) }), void 0)] }), e.id));
                                        }) }), void 0)] }), void 0))] }, void 0)), tab === "expenses" && ((0, jsx_runtime_1.jsxs)("div", __assign({ className: "fade-up" }, { children: [(0, jsx_runtime_1.jsxs)("div", __assign({ style: {
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: isMobile ? "flex-start" : "flex-end",
                                    flexDirection: isMobile ? "column" : "row",
                                    gap: 12,
                                    marginBottom: 18
                                } }, { children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h1", __assign({ style: {
                                                    fontFamily: "'Playfair Display',serif",
                                                    fontSize: isMobile ? 26 : 32,
                                                    letterSpacing: "-0.03em",
                                                    color: txt
                                                } }, { children: "Expenses" }), void 0), (0, jsx_runtime_1.jsxs)("p", __assign({ style: { color: muted, fontSize: 12, marginTop: 3 } }, { children: [sorted.length, " of ", expenses.length, " \u00B7", " ", fmt(sorted.reduce(function (s, e) { return s + e.amount; }, 0))] }), void 0)] }, void 0), (0, jsx_runtime_1.jsxs)("div", __assign({ style: { display: "flex", gap: 8 } }, { children: [!isMobile && ((0, jsx_runtime_1.jsxs)("button", __assign({ className: "btn btn-ghost", style: { fontSize: 12 }, onClick: exportCSV }, { children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Download, { size: 13 }, void 0), " CSV"] }), void 0)), (0, jsx_runtime_1.jsxs)("button", __assign({ className: "btn btn-primary", onClick: openAdd }, { children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Plus, { size: 14 }, void 0), " Add"] }), void 0)] }), void 0)] }), void 0), (0, jsx_runtime_1.jsxs)("div", __assign({ style: {
                                    marginBottom: 12,
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 8
                                } }, { children: [(0, jsx_runtime_1.jsxs)("div", __assign({ style: {
                                            display: "flex",
                                            gap: 8,
                                            flexDirection: isMobile ? "column" : "row"
                                        } }, { children: [(0, jsx_runtime_1.jsxs)("div", __assign({ style: { position: "relative", flex: 1 } }, { children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Search, { size: 13, style: {
                                                            position: "absolute",
                                                            left: 12,
                                                            top: "50%",
                                                            transform: "translateY(-50%)",
                                                            color: muted,
                                                            pointerEvents: "none"
                                                        } }, void 0), (0, jsx_runtime_1.jsx)("input", { className: "input", placeholder: "Search expenses...", value: search, onChange: function (e) { return setSearch(e.target.value); }, style: { paddingLeft: 34 } }, void 0)] }), void 0), (0, jsx_runtime_1.jsxs)("div", __assign({ style: {
                                                    position: "relative",
                                                    width: isMobile ? "100%" : 165
                                                } }, { children: [(0, jsx_runtime_1.jsx)(lucide_react_1.ArrowUpDown, { size: 12, style: {
                                                            position: "absolute",
                                                            left: 11,
                                                            top: "50%",
                                                            transform: "translateY(-50%)",
                                                            color: muted,
                                                            pointerEvents: "none"
                                                        } }, void 0), (0, jsx_runtime_1.jsxs)("select", __assign({ className: "input", value: sortBy, onChange: function (e) { return setSortBy(e.target.value); }, style: { paddingLeft: 30 } }, { children: [(0, jsx_runtime_1.jsx)("option", __assign({ value: "date-desc" }, { children: "Newest first" }), void 0), (0, jsx_runtime_1.jsx)("option", __assign({ value: "date-asc" }, { children: "Oldest first" }), void 0), (0, jsx_runtime_1.jsx)("option", __assign({ value: "amount-desc" }, { children: "Highest amount" }), void 0), (0, jsx_runtime_1.jsx)("option", __assign({ value: "amount-asc" }, { children: "Lowest amount" }), void 0)] }), void 0)] }), void 0)] }), void 0), (0, jsx_runtime_1.jsx)("div", __assign({ style: { display: "flex", gap: 6, flexWrap: "wrap" } }, { children: __spreadArray([
                                            { id: "all", label: "All Projects", color: null }
                                        ], projects.map(function (p) { return ({
                                            id: p.id,
                                            label: p.name,
                                            color: p.color
                                        }); }), true).map(function (p) { return ((0, jsx_runtime_1.jsxs)("button", __assign({ onClick: function () { return setFPid(p.id); }, style: {
                                                background: fPid === p.id
                                                    ? p.color || txt
                                                    : D
                                                        ? "#1a1a1a"
                                                        : "#f3f4f6",
                                                color: fPid === p.id ? "#fff" : muted,
                                                border: "1.5px solid " + (fPid === p.id ? p.color || txt : brd),
                                                borderRadius: 20,
                                                padding: "4px 12px",
                                                fontSize: 12,
                                                fontWeight: 700,
                                                cursor: "pointer",
                                                fontFamily: "inherit",
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 5,
                                                whiteSpace: "nowrap"
                                            } }, { children: [p.color && ((0, jsx_runtime_1.jsx)("span", { style: {
                                                        width: 7,
                                                        height: 7,
                                                        borderRadius: "50%",
                                                        background: fPid === p.id ? "#fff" : p.color,
                                                        display: "inline-block"
                                                    } }, void 0)), p.label] }), p.id)); }) }), void 0), (0, jsx_runtime_1.jsxs)("div", __assign({ style: { display: "flex", gap: 6, flexWrap: "wrap" } }, { children: [(0, jsx_runtime_1.jsxs)("button", __assign({ onClick: function () { return setFCat("all"); }, style: {
                                                    background: fCat === "all" ? txt : D ? "#1a1a1a" : "#f3f4f6",
                                                    color: fCat === "all" ? (D ? "#000" : "#fff") : muted,
                                                    border: "1.5px solid " + (fCat === "all" ? txt : brd),
                                                    borderRadius: 20,
                                                    padding: "4px 12px",
                                                    fontSize: 12,
                                                    fontWeight: 700,
                                                    cursor: "pointer",
                                                    fontFamily: "inherit",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 5
                                                } }, { children: [(0, jsx_runtime_1.jsx)(lucide_react_1.ListFilter, { size: 11 }, void 0), " All"] }), void 0), CATEGORIES.filter(function (c) { return catTotals[c] > 0; }).map(function (c) {
                                                var _a = CAT_META[c], CIc = _a.Icon, cClr = _a.color;
                                                return ((0, jsx_runtime_1.jsxs)("button", __assign({ onClick: function () { return setFCat(c); }, style: {
                                                        background: fCat === c ? cClr : D ? "#1a1a1a" : "#f3f4f6",
                                                        color: fCat === c ? "#fff" : muted,
                                                        border: "1.5px solid " + (fCat === c ? cClr : brd),
                                                        borderRadius: 20,
                                                        padding: "4px 12px",
                                                        fontSize: 12,
                                                        fontWeight: 700,
                                                        cursor: "pointer",
                                                        fontFamily: "inherit",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: 5,
                                                        whiteSpace: "nowrap"
                                                    } }, { children: [(0, jsx_runtime_1.jsx)(CIc, { size: 11 }, void 0), " ", c] }), c));
                                            })] }), void 0)] }), void 0), (0, jsx_runtime_1.jsxs)("div", __assign({ style: { display: "flex", flexDirection: "column", gap: 8 } }, { children: [sorted.length === 0 && ((0, jsx_runtime_1.jsxs)("div", __assign({ style: {
                                            textAlign: "center",
                                            padding: "52px 20px",
                                            color: muted
                                        } }, { children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Receipt, { size: 38, style: { marginBottom: 10, opacity: 0.3 } }, void 0), (0, jsx_runtime_1.jsx)("p", __assign({ style: {
                                                    fontWeight: 800,
                                                    fontSize: 15,
                                                    color: txt,
                                                    marginBottom: 8
                                                } }, { children: expenses.length === 0
                                                    ? "No expenses yet"
                                                    : "No results found" }), void 0), expenses.length === 0 && ((0, jsx_runtime_1.jsxs)("button", __assign({ className: "btn btn-primary", style: { margin: "0 auto" }, onClick: openAdd }, { children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Plus, { size: 14 }, void 0), " Add First Expense"] }), void 0))] }), void 0)), sorted.map(function (e) {
                                        var _a = CAT_META[e.category] || CAT_META.Other, CIc = _a.Icon, cClr = _a.color;
                                        return ((0, jsx_runtime_1.jsxs)("div", __assign({ className: "row", onClick: function () { return openEdit(e); } }, { children: [(0, jsx_runtime_1.jsxs)("div", __assign({ style: {
                                                        display: "flex",
                                                        justifyContent: "space-between",
                                                        alignItems: "flex-start",
                                                        marginBottom: 8
                                                    } }, { children: [(0, jsx_runtime_1.jsxs)("div", __assign({ style: {
                                                                display: "flex",
                                                                alignItems: "flex-start",
                                                                gap: 9,
                                                                flex: 1,
                                                                minWidth: 0
                                                            } }, { children: [(0, jsx_runtime_1.jsx)("div", __assign({ style: {
                                                                        width: 38,
                                                                        height: 38,
                                                                        background: cClr + "18",
                                                                        borderRadius: 9,
                                                                        display: "flex",
                                                                        alignItems: "center",
                                                                        justifyContent: "center",
                                                                        flexShrink: 0,
                                                                        color: cClr
                                                                    } }, { children: (0, jsx_runtime_1.jsx)(CIc, { size: 17 }, void 0) }), void 0), (0, jsx_runtime_1.jsxs)("div", __assign({ style: { flex: 1, minWidth: 0 } }, { children: [(0, jsx_runtime_1.jsxs)("div", __assign({ style: {
                                                                                display: "flex",
                                                                                alignItems: "center",
                                                                                gap: 6,
                                                                                flexWrap: "wrap",
                                                                                marginBottom: 2
                                                                            } }, { children: [(0, jsx_runtime_1.jsx)("p", __assign({ style: {
                                                                                        fontWeight: 800,
                                                                                        fontSize: 13,
                                                                                        color: txt
                                                                                    } }, { children: e.description }), void 0), (0, jsx_runtime_1.jsxs)("span", __assign({ style: {
                                                                                        background: cClr + "15",
                                                                                        color: cClr,
                                                                                        border: "1px solid " + cClr + "30",
                                                                                        borderRadius: 6,
                                                                                        padding: "1px 7px",
                                                                                        fontSize: 10,
                                                                                        fontWeight: 700,
                                                                                        display: "flex",
                                                                                        alignItems: "center",
                                                                                        gap: 3
                                                                                    } }, { children: [(0, jsx_runtime_1.jsx)(CIc, { size: 9 }, void 0), " ", e.category] }), void 0)] }), void 0), (0, jsx_runtime_1.jsxs)("p", __assign({ style: { fontSize: 10, color: muted } }, { children: [e.date, e.notes && ((0, jsx_runtime_1.jsxs)("span", __assign({ style: { marginLeft: 8, fontStyle: "italic" } }, { children: [" ", "\u00B7 ", e.notes.slice(0, 44), e.notes.length > 44 ? "..." : ""] }), void 0))] }), void 0)] }), void 0)] }), void 0), (0, jsx_runtime_1.jsxs)("div", __assign({ style: {
                                                                display: "flex",
                                                                alignItems: "center",
                                                                gap: 6,
                                                                flexShrink: 0,
                                                                marginLeft: 6
                                                            } }, { children: [(0, jsx_runtime_1.jsx)("p", __assign({ style: { fontWeight: 900, fontSize: 14, color: txt } }, { children: fmt(e.amount) }), void 0), (0, jsx_runtime_1.jsx)("button", __assign({ className: "btn btn-danger", style: { padding: "4px 8px" }, onClick: function (ev) {
                                                                        ev.stopPropagation();
                                                                        setDelId(e.id);
                                                                    } }, { children: (0, jsx_runtime_1.jsx)(lucide_react_1.Trash2, { size: 12 }, void 0) }), void 0)] }), void 0)] }), void 0), (0, jsx_runtime_1.jsx)(SplitBar, { splits: e.splits, projects: projects }, void 0), (0, jsx_runtime_1.jsx)("div", __assign({ style: {
                                                        display: "flex",
                                                        flexWrap: "wrap",
                                                        gap: 4,
                                                        marginTop: 6
                                                    } }, { children: e.splits.map(function (s, i) { return ((0, jsx_runtime_1.jsxs)("span", __assign({ style: {
                                                            background: pClr(projects, s.pid) + "18",
                                                            color: pClr(projects, s.pid),
                                                            border: "1px solid " + pClr(projects, s.pid) + "33",
                                                            borderRadius: 20,
                                                            padding: "1px 8px",
                                                            fontSize: 10,
                                                            fontWeight: 700,
                                                            whiteSpace: "nowrap"
                                                        } }, { children: [pNm(projects, s.pid), " ", s.pct, "%"] }), i)); }) }), void 0)] }), e.id));
                                    })] }), void 0)] }), void 0)), tab === "projects" && ((0, jsx_runtime_1.jsxs)("div", __assign({ className: "fade-up" }, { children: [(0, jsx_runtime_1.jsxs)("div", __assign({ style: {
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: isMobile ? "flex-start" : "flex-end",
                                    flexDirection: isMobile ? "column" : "row",
                                    gap: 12,
                                    marginBottom: 20
                                } }, { children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h1", __assign({ style: {
                                                    fontFamily: "'Playfair Display',serif",
                                                    fontSize: isMobile ? 26 : 32,
                                                    letterSpacing: "-0.03em",
                                                    color: txt
                                                } }, { children: "Projects" }), void 0), (0, jsx_runtime_1.jsxs)("p", __assign({ style: { color: muted, fontSize: 12, marginTop: 3 } }, { children: [projects.length, "/", isPro ? "∞" : 3, " used"] }), void 0)] }, void 0), (0, jsx_runtime_1.jsxs)("button", __assign({ className: "btn btn-primary", onClick: function () {
                                            setModal("project");
                                            setPForm({
                                                name: "",
                                                client: "",
                                                color: "#f97316",
                                                budget: ""
                                            });
                                        } }, { children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Plus, { size: 14 }, void 0), " New Project"] }), void 0)] }), void 0), !isPro && projects.length >= FREE_PROJ && ((0, jsx_runtime_1.jsx)("div", __assign({ style: { marginBottom: 16 } }, { children: (0, jsx_runtime_1.jsx)(UpgradeNudge, { feature: "unlimited projects", onUpgrade: function () { return setShowPlan(true); }, D: D, brd: brd }, void 0) }), void 0)), projects.length === 0 && ((0, jsx_runtime_1.jsxs)("div", __assign({ style: {
                                    textAlign: "center",
                                    padding: "60px 20px",
                                    color: muted
                                } }, { children: [(0, jsx_runtime_1.jsx)(lucide_react_1.FolderOpen, { size: 44, style: { marginBottom: 14, opacity: 0.3 } }, void 0), (0, jsx_runtime_1.jsx)("p", __assign({ style: {
                                            fontWeight: 800,
                                            fontSize: 16,
                                            color: txt,
                                            marginBottom: 8
                                        } }, { children: "No projects yet" }), void 0), (0, jsx_runtime_1.jsx)("p", __assign({ style: { fontSize: 13, marginBottom: 20 } }, { children: "Create one project per client to get started" }), void 0), (0, jsx_runtime_1.jsxs)("button", __assign({ className: "btn btn-primary", onClick: function () {
                                            setModal("project");
                                            setPForm({
                                                name: "",
                                                client: "",
                                                color: "#f97316",
                                                budget: ""
                                            });
                                        } }, { children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Plus, { size: 14 }, void 0), " Create First Project"] }), void 0)] }), void 0)), (0, jsx_runtime_1.jsx)("div", __assign({ style: {
                                    display: "grid",
                                    gridTemplateColumns: isMobile
                                        ? "1fr"
                                        : isTablet
                                            ? "repeat(2,1fr)"
                                            : "repeat(auto-fit,minmax(280px,1fr))",
                                    gap: 14
                                } }, { children: projects.map(function (p) {
                                    var spent = Math.round(projTotals[p.id] || 0);
                                    var pExp = expenses.filter(function (e) {
                                        return e.splits.some(function (s) { return s.pid === p.id; });
                                    });
                                    var pct = p.budget
                                        ? Math.min(100, Math.round((spent / p.budget) * 100))
                                        : null;
                                    return ((0, jsx_runtime_1.jsxs)("div", __assign({ className: "card", style: { padding: 18 } }, { children: [(0, jsx_runtime_1.jsxs)("div", __assign({ style: {
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 10,
                                                    marginBottom: 14
                                                } }, { children: [(0, jsx_runtime_1.jsx)("div", __assign({ style: {
                                                            width: 42,
                                                            height: 42,
                                                            borderRadius: 11,
                                                            background: p.color + "18",
                                                            border: "2px solid " + p.color,
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                            fontSize: 17,
                                                            fontWeight: 900,
                                                            color: p.color,
                                                            flexShrink: 0
                                                        } }, { children: p.name[0] }), void 0), (0, jsx_runtime_1.jsxs)("div", __assign({ style: { flex: 1, minWidth: 0 } }, { children: [(0, jsx_runtime_1.jsx)("p", __assign({ style: {
                                                                    fontWeight: 800,
                                                                    fontSize: 14,
                                                                    color: txt,
                                                                    overflow: "hidden",
                                                                    textOverflow: "ellipsis",
                                                                    whiteSpace: "nowrap"
                                                                } }, { children: p.name }), void 0), (0, jsx_runtime_1.jsx)("p", __assign({ style: {
                                                                    fontSize: 11,
                                                                    color: muted,
                                                                    overflow: "hidden",
                                                                    textOverflow: "ellipsis",
                                                                    whiteSpace: "nowrap"
                                                                } }, { children: p.client }), void 0)] }), void 0), (0, jsx_runtime_1.jsx)("button", __assign({ className: "btn btn-danger", style: { padding: "5px 8px", flexShrink: 0 }, onClick: function () { return handleRemoveProject(p.id); } }, { children: (0, jsx_runtime_1.jsx)(lucide_react_1.X, { size: 13 }, void 0) }), void 0)] }), void 0), (0, jsx_runtime_1.jsx)("div", __assign({ style: {
                                                    display: "grid",
                                                    gridTemplateColumns: "1fr 1fr 1fr",
                                                    gap: 7,
                                                    marginBottom: 12
                                                } }, { children: [
                                                    ["Spent", fmt(spent)],
                                                    ["Expenses", pExp.length],
                                                    ["Savings", fmt(Math.round(spent * 0.2))],
                                                ].map(function (_a) {
                                                    var l = _a[0], v = _a[1];
                                                    return ((0, jsx_runtime_1.jsxs)("div", __assign({ style: {
                                                            background: D ? "#1a1a1a" : "#f9fafb",
                                                            borderRadius: 9,
                                                            padding: "9px 8px"
                                                        } }, { children: [(0, jsx_runtime_1.jsx)("p", __assign({ className: "lbl", style: { marginBottom: 3, fontSize: 9 } }, { children: l }), void 0), (0, jsx_runtime_1.jsx)("p", __assign({ style: {
                                                                    fontFamily: "'Playfair Display',serif",
                                                                    fontSize: 13,
                                                                    color: l === "Savings" ? "#16a34a" : txt
                                                                } }, { children: v }), void 0)] }), l));
                                                }) }), void 0), p.budget > 0 && ((0, jsx_runtime_1.jsxs)("div", __assign({ style: { marginBottom: 10 } }, { children: [(0, jsx_runtime_1.jsxs)("div", __assign({ style: {
                                                            display: "flex",
                                                            justifyContent: "space-between",
                                                            marginBottom: 4
                                                        } }, { children: [(0, jsx_runtime_1.jsx)("span", __assign({ style: { fontSize: 11, color: muted } }, { children: "Budget usage" }), void 0), (0, jsx_runtime_1.jsxs)("span", __assign({ style: {
                                                                    fontSize: 11,
                                                                    fontWeight: 800,
                                                                    color: pct > 80 ? "#ef4444" : p.color
                                                                } }, { children: [pct, "%"] }), void 0)] }), void 0), (0, jsx_runtime_1.jsx)("div", __assign({ className: "prog" }, { children: (0, jsx_runtime_1.jsx)("div", { className: "prog-bar", style: {
                                                                width: pct + "%",
                                                                background: pct > 80 ? "#ef4444" : p.color
                                                            } }, void 0) }), void 0), (0, jsx_runtime_1.jsxs)("p", __assign({ style: { fontSize: 10, color: muted, marginTop: 3 } }, { children: [fmt(p.budget - spent), " remaining of ", fmt(p.budget)] }), void 0)] }), void 0)), (0, jsx_runtime_1.jsx)("div", { style: { height: 1, background: brd, margin: "12px 0" } }, void 0), (0, jsx_runtime_1.jsx)("p", __assign({ className: "lbl", style: { marginBottom: 7 } }, { children: "Top Categories" }), void 0), (0, jsx_runtime_1.jsx)("div", __assign({ style: { display: "flex", gap: 5, flexWrap: "wrap" } }, { children: __spreadArray([], new Set(pExp.map(function (e) { return e.category; })), true).slice(0, 3)
                                                    .length > 0 ? (__spreadArray([], new Set(pExp.map(function (e) { return e.category; })), true).slice(0, 3)
                                                    .map(function (c) {
                                                    var CIc = (CAT_META[c] || CAT_META.Other).Icon;
                                                    return ((0, jsx_runtime_1.jsxs)("span", __assign({ style: {
                                                            background: D ? "#1f1f1f" : "#f3f4f6",
                                                            borderRadius: 6,
                                                            padding: "3px 9px",
                                                            fontSize: 11,
                                                            color: muted,
                                                            display: "flex",
                                                            alignItems: "center",
                                                            gap: 4
                                                        } }, { children: [(0, jsx_runtime_1.jsx)(CIc, { size: 11 }, void 0), " ", c] }), c));
                                                })) : ((0, jsx_runtime_1.jsx)("span", __assign({ style: { fontSize: 12, color: muted } }, { children: "No expenses yet" }), void 0)) }), void 0)] }), p.id));
                                }) }), void 0)] }), void 0)), tab === "reports" && ((0, jsx_runtime_1.jsxs)("div", __assign({ className: "fade-up" }, { children: [(0, jsx_runtime_1.jsxs)("div", __assign({ style: {
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: isMobile ? "flex-start" : "flex-end",
                                    flexDirection: isMobile ? "column" : "row",
                                    gap: 12,
                                    marginBottom: 20
                                } }, { children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h1", __assign({ style: {
                                                    fontFamily: "'Playfair Display',serif",
                                                    fontSize: isMobile ? 26 : 32,
                                                    letterSpacing: "-0.03em",
                                                    color: txt
                                                } }, { children: "Tax Report" }), void 0), (0, jsx_runtime_1.jsxs)("p", __assign({ style: {
                                                    color: muted,
                                                    fontSize: 12,
                                                    marginTop: 3,
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 6
                                                } }, { children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Database, { size: 11 }, void 0), " BIR-ready \u00B7 private to your account"] }), void 0)] }, void 0), (0, jsx_runtime_1.jsxs)("div", __assign({ style: { display: "flex", gap: 8 } }, { children: [(0, jsx_runtime_1.jsxs)("button", __assign({ className: "btn btn-ghost", style: { fontSize: 12 }, onClick: exportCSV }, { children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Download, { size: 13 }, void 0), " CSV"] }), void 0), !isPro ? ((0, jsx_runtime_1.jsxs)("button", __assign({ className: "btn btn-pro", style: { fontSize: 12 }, onClick: function () { return setShowPlan(true); } }, { children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Lock, { size: 12 }, void 0), " PDF \u00B7 Pro"] }), void 0)) : ((0, jsx_runtime_1.jsxs)("button", __assign({ className: "btn btn-primary", style: { fontSize: 12 }, onClick: function () { return showToast("Generating PDF...", "warning"); } }, { children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Download, { size: 13 }, void 0), " PDF"] }), void 0))] }), void 0)] }), void 0), (0, jsx_runtime_1.jsx)("div", __assign({ style: {
                                    display: "grid",
                                    gridTemplateColumns: isMobile ? "1fr" : "repeat(3,1fr)",
                                    gap: 12,
                                    marginBottom: 14
                                } }, { children: [
                                    {
                                        label: "Total Deductible",
                                        val: fmt(grandTotal),
                                        sub: "all time",
                                        Icon: lucide_react_1.TrendingUp
                                    },
                                    {
                                        label: "Est. Tax Savings",
                                        val: fmt(estSavings),
                                        sub: "at 20% rate",
                                        Icon: lucide_react_1.Shield,
                                        accent: "#16a34a"
                                    },
                                    {
                                        label: "Expenses Filed",
                                        val: expenses.length,
                                        sub: Object.keys(catTotals).length + " categories",
                                        Icon: lucide_react_1.FileText
                                    },
                                ].map(function (s, i) { return ((0, jsx_runtime_1.jsxs)("div", __assign({ className: "card", style: {
                                        padding: 18,
                                        position: "relative",
                                        overflow: "hidden"
                                    } }, { children: [(0, jsx_runtime_1.jsx)("div", __assign({ style: {
                                                position: "absolute",
                                                top: 10,
                                                right: 10,
                                                opacity: 0.05
                                            } }, { children: (0, jsx_runtime_1.jsx)(s.Icon, { size: 34 }, void 0) }), void 0), (0, jsx_runtime_1.jsx)("p", __assign({ className: "lbl", style: { marginBottom: 6 } }, { children: s.label }), void 0), (0, jsx_runtime_1.jsx)("p", __assign({ style: {
                                                fontFamily: "'Playfair Display',serif",
                                                fontSize: isMobile ? 22 : 28,
                                                color: s.accent || txt,
                                                lineHeight: 1,
                                                letterSpacing: "-0.02em"
                                            } }, { children: s.val }), void 0), (0, jsx_runtime_1.jsx)("p", __assign({ style: { fontSize: 11, color: muted, marginTop: 5 } }, { children: s.sub }), void 0)] }), i)); }) }), void 0), !isPro && expenses.length > 0 && ((0, jsx_runtime_1.jsx)("div", __assign({ style: { marginBottom: 14 } }, { children: (0, jsx_runtime_1.jsx)(UpgradeNudge, { feature: "PDF export (BIR-ready, accountant-ready)", onUpgrade: function () { return setShowPlan(true); }, D: D, brd: brd }, void 0) }), void 0)), expenses.length === 0 ? ((0, jsx_runtime_1.jsxs)("div", __assign({ style: { textAlign: "center", padding: "48px 0", color: muted } }, { children: [(0, jsx_runtime_1.jsx)(lucide_react_1.FileBarChart2, { size: 38, style: { marginBottom: 10, opacity: 0.3 } }, void 0), (0, jsx_runtime_1.jsx)("p", __assign({ style: { fontSize: 14, color: txt, fontWeight: 700 } }, { children: "No data to report yet" }), void 0)] }), void 0)) : ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)("div", __assign({ className: "card", style: { padding: isMobile ? 14 : 20, marginBottom: 12 } }, { children: [(0, jsx_runtime_1.jsxs)("p", __assign({ style: {
                                                    fontWeight: 800,
                                                    fontSize: 14,
                                                    marginBottom: 14,
                                                    color: txt,
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 8
                                                } }, { children: [(0, jsx_runtime_1.jsx)(lucide_react_1.FolderOpen, { size: 14, color: "#f97316" }, void 0), " By Project"] }), void 0), (0, jsx_runtime_1.jsx)("div", __assign({ style: { overflowX: "auto" } }, { children: (0, jsx_runtime_1.jsxs)("table", __assign({ style: {
                                                        width: "100%",
                                                        borderCollapse: "collapse",
                                                        fontSize: 12,
                                                        minWidth: 400
                                                    } }, { children: [(0, jsx_runtime_1.jsx)("thead", { children: (0, jsx_runtime_1.jsx)("tr", __assign({ style: { borderBottom: "2px solid " + brd } }, { children: [
                                                                    "Project",
                                                                    "Client",
                                                                    "Exp.",
                                                                    "Total",
                                                                    "Share",
                                                                    "Savings",
                                                                ].map(function (h) { return ((0, jsx_runtime_1.jsx)("th", __assign({ style: {
                                                                        textAlign: "left",
                                                                        padding: "7px 8px",
                                                                        fontSize: 10,
                                                                        fontWeight: 800,
                                                                        color: muted,
                                                                        textTransform: "uppercase",
                                                                        letterSpacing: ".06em"
                                                                    } }, { children: h }), h)); }) }), void 0) }, void 0), (0, jsx_runtime_1.jsxs)("tbody", { children: [projects.map(function (p) {
                                                                    var spent = Math.round(projTotals[p.id] || 0);
                                                                    var cnt = expenses.filter(function (e) {
                                                                        return e.splits.some(function (s) { return s.pid === p.id; });
                                                                    }).length;
                                                                    return ((0, jsx_runtime_1.jsxs)("tr", __assign({ style: {
                                                                            borderBottom: "1px solid " + (D ? "#1a1a1a" : "#f5f5f5")
                                                                        } }, { children: [(0, jsx_runtime_1.jsx)("td", __assign({ style: { padding: "9px 8px" } }, { children: (0, jsx_runtime_1.jsxs)("div", __assign({ style: {
                                                                                        display: "flex",
                                                                                        alignItems: "center",
                                                                                        gap: 6
                                                                                    } }, { children: [(0, jsx_runtime_1.jsx)("div", { style: {
                                                                                                width: 8,
                                                                                                height: 8,
                                                                                                borderRadius: "50%",
                                                                                                background: p.color
                                                                                            } }, void 0), (0, jsx_runtime_1.jsx)("strong", __assign({ style: { color: txt } }, { children: p.name }), void 0)] }), void 0) }), void 0), (0, jsx_runtime_1.jsx)("td", __assign({ style: { padding: "9px 8px", color: muted } }, { children: p.client }), void 0), (0, jsx_runtime_1.jsx)("td", __assign({ style: { padding: "9px 8px", color: muted } }, { children: cnt }), void 0), (0, jsx_runtime_1.jsx)("td", __assign({ style: {
                                                                                    padding: "9px 8px",
                                                                                    fontWeight: 800,
                                                                                    color: txt
                                                                                } }, { children: fmt(spent) }), void 0), (0, jsx_runtime_1.jsx)("td", __assign({ style: { padding: "9px 8px" } }, { children: (0, jsx_runtime_1.jsxs)("span", __assign({ style: {
                                                                                        background: p.color + "18",
                                                                                        color: p.color,
                                                                                        border: "1px solid " + p.color + "33",
                                                                                        borderRadius: 20,
                                                                                        padding: "2px 8px",
                                                                                        fontSize: 11,
                                                                                        fontWeight: 700
                                                                                    } }, { children: [grandTotal
                                                                                            ? Math.round((spent / grandTotal) * 100)
                                                                                            : 0, "%"] }), void 0) }), void 0), (0, jsx_runtime_1.jsx)("td", __assign({ style: {
                                                                                    padding: "9px 8px",
                                                                                    fontWeight: 800,
                                                                                    color: "#16a34a"
                                                                                } }, { children: fmt(Math.round(spent * 0.2)) }), void 0)] }), p.id));
                                                                }), (0, jsx_runtime_1.jsxs)("tr", __assign({ style: { borderTop: "2px solid " + txt } }, { children: [(0, jsx_runtime_1.jsx)("td", __assign({ colSpan: 3, style: {
                                                                                padding: "9px 8px",
                                                                                fontWeight: 900,
                                                                                color: txt
                                                                            } }, { children: "TOTAL" }), void 0), (0, jsx_runtime_1.jsx)("td", __assign({ style: {
                                                                                padding: "9px 8px",
                                                                                fontWeight: 900,
                                                                                color: txt
                                                                            } }, { children: fmt(grandTotal) }), void 0), (0, jsx_runtime_1.jsx)("td", __assign({ style: {
                                                                                padding: "9px 8px",
                                                                                fontWeight: 900,
                                                                                color: txt
                                                                            } }, { children: "100%" }), void 0), (0, jsx_runtime_1.jsx)("td", __assign({ style: {
                                                                                padding: "9px 8px",
                                                                                fontWeight: 900,
                                                                                color: "#16a34a"
                                                                            } }, { children: fmt(estSavings) }), void 0)] }), void 0)] }, void 0)] }), void 0) }), void 0)] }), void 0), (0, jsx_runtime_1.jsxs)("div", __assign({ className: "card", style: { padding: isMobile ? 14 : 20 } }, { children: [(0, jsx_runtime_1.jsxs)("p", __assign({ style: {
                                                    fontWeight: 800,
                                                    fontSize: 14,
                                                    marginBottom: 14,
                                                    color: txt,
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 8
                                                } }, { children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Tag, { size: 14, color: "#f97316" }, void 0), " By Category"] }), void 0), Object.entries(catTotals)
                                                .sort(function (a, b) { return b[1] - a[1]; })
                                                .map(function (_a) {
                                                var cat = _a[0], total = _a[1];
                                                var _b = CAT_META[cat] || CAT_META.Other, CIc = _b.Icon, cClr = _b.color;
                                                return ((0, jsx_runtime_1.jsxs)("div", __assign({ style: { marginBottom: 12 } }, { children: [(0, jsx_runtime_1.jsxs)("div", __assign({ style: {
                                                                display: "flex",
                                                                justifyContent: "space-between",
                                                                alignItems: "center",
                                                                marginBottom: 4
                                                            } }, { children: [(0, jsx_runtime_1.jsxs)("div", __assign({ style: {
                                                                        display: "flex",
                                                                        alignItems: "center",
                                                                        gap: 7
                                                                    } }, { children: [(0, jsx_runtime_1.jsx)(CIc, { size: 13, color: cClr }, void 0), (0, jsx_runtime_1.jsx)("span", __assign({ style: {
                                                                                fontSize: 13,
                                                                                fontWeight: 700,
                                                                                color: txt
                                                                            } }, { children: cat }), void 0)] }), void 0), (0, jsx_runtime_1.jsxs)("div", __assign({ style: {
                                                                        display: "flex",
                                                                        gap: 10,
                                                                        alignItems: "center"
                                                                    } }, { children: [(0, jsx_runtime_1.jsxs)("span", __assign({ style: { fontSize: 11, color: muted } }, { children: [Math.round((total / grandTotal) * 100), "%"] }), void 0), (0, jsx_runtime_1.jsx)("span", __assign({ style: {
                                                                                fontSize: 13,
                                                                                fontWeight: 800,
                                                                                color: txt
                                                                            } }, { children: fmt(total) }), void 0)] }), void 0)] }), void 0), (0, jsx_runtime_1.jsx)("div", __assign({ className: "prog" }, { children: (0, jsx_runtime_1.jsx)("div", { className: "prog-bar", style: {
                                                                    width: (total / grandTotal) * 100 + "%",
                                                                    background: cClr
                                                                } }, void 0) }), void 0)] }), cat));
                                            })] }), void 0)] }, void 0))] }), void 0))] }), void 0), isMobile && ((0, jsx_runtime_1.jsxs)("nav", __assign({ style: {
                    position: "fixed",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: D ? "rgba(14,14,14,.95)" : card,
                    borderTop: "1px solid " + brd,
                    display: "flex",
                    zIndex: 100,
                    backdropFilter: "blur(16px)",
                    paddingBottom: "env(safe-area-inset-bottom,0px)"
                } }, { children: [navItems.map(function (_a) {
                        var id = _a.id, Icon = _a.Icon, label = _a.label;
                        return ((0, jsx_runtime_1.jsxs)("button", __assign({ className: "mob-tab " + (tab === id ? "active" : ""), onClick: function () { return setTab(id); } }, { children: [(0, jsx_runtime_1.jsx)("div", __assign({ className: "mob-tab-icon" }, { children: (0, jsx_runtime_1.jsx)(Icon, { size: tab === id ? 20 : 18 }, void 0) }), void 0), (0, jsx_runtime_1.jsx)("span", { children: label }, void 0)] }), id));
                    }), (0, jsx_runtime_1.jsxs)("button", __assign({ className: "mob-tab", onClick: openAdd, style: { color: "#f97316" } }, { children: [(0, jsx_runtime_1.jsx)("div", __assign({ style: {
                                    width: 36,
                                    height: 36,
                                    borderRadius: 10,
                                    background: "#f97316",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    boxShadow: "0 4px 14px rgba(249,115,22,.45)"
                                } }, { children: (0, jsx_runtime_1.jsx)(lucide_react_1.Plus, { size: 20, color: "#fff" }, void 0) }), void 0), (0, jsx_runtime_1.jsx)("span", { children: "Add" }, void 0)] }), void 0)] }), void 0)), modal === "expense" && ((0, jsx_runtime_1.jsx)("div", __assign({ className: "overlay", onClick: function (e) { return e.target === e.currentTarget && setModal(null); } }, { children: (0, jsx_runtime_1.jsxs)("div", __assign({ className: "modal scale-in" }, { children: [(0, jsx_runtime_1.jsxs)("div", __assign({ style: {
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: 18
                            } }, { children: [(0, jsx_runtime_1.jsx)("h2", __assign({ style: {
                                        fontFamily: "'Playfair Display',serif",
                                        fontSize: isMobile ? 21 : 25,
                                        color: txt,
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 10
                                    } }, { children: editId ? ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Pencil, { size: 17, color: "#f97316" }, void 0), " Edit Expense"] }, void 0)) : ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Plus, { size: 17, color: "#f97316" }, void 0), " New Expense"] }, void 0)) }), void 0), (0, jsx_runtime_1.jsx)("button", __assign({ className: "btn btn-ghost", style: { padding: "6px 9px" }, onClick: function () { return setModal(null); } }, { children: (0, jsx_runtime_1.jsx)(lucide_react_1.X, { size: 15 }, void 0) }), void 0)] }), void 0), (0, jsx_runtime_1.jsxs)("div", __assign({ style: { display: "flex", flexDirection: "column", gap: 13 } }, { children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", __assign({ className: "lbl" }, { children: "Description *" }), void 0), (0, jsx_runtime_1.jsx)("input", { className: "input", placeholder: "e.g. Adobe Creative Cloud", value: form.description, onChange: function (e) {
                                                return setForm(function (f) { return (__assign(__assign({}, f), { description: e.target.value })); });
                                            } }, void 0)] }, void 0), (0, jsx_runtime_1.jsxs)("div", __assign({ style: {
                                        display: "grid",
                                        gridTemplateColumns: "1fr 1fr",
                                        gap: 10
                                    } }, { children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", __assign({ className: "lbl" }, { children: "Amount (\u20B1) *" }), void 0), (0, jsx_runtime_1.jsx)("input", { className: "input", type: "number", min: "0", placeholder: "0", value: form.amount, onChange: function (e) {
                                                        return setForm(function (f) { return (__assign(__assign({}, f), { amount: e.target.value })); });
                                                    } }, void 0)] }, void 0), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", __assign({ className: "lbl" }, { children: "Date *" }), void 0), (0, jsx_runtime_1.jsx)("input", { className: "input", type: "date", value: form.date, onChange: function (e) {
                                                        return setForm(function (f) { return (__assign(__assign({}, f), { date: e.target.value })); });
                                                    } }, void 0)] }, void 0)] }), void 0), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", __assign({ className: "lbl" }, { children: "Category" }), void 0), (0, jsx_runtime_1.jsxs)("div", __assign({ style: { position: "relative" } }, { children: [(function () {
                                                    var _a = CAT_META[form.category] || CAT_META.Other, CIc = _a.Icon, cClr = _a.color;
                                                    return ((0, jsx_runtime_1.jsx)(CIc, { size: 13, color: cClr, style: {
                                                            position: "absolute",
                                                            left: 13,
                                                            top: "50%",
                                                            transform: "translateY(-50%)",
                                                            pointerEvents: "none"
                                                        } }, void 0));
                                                })(), (0, jsx_runtime_1.jsx)("select", __assign({ className: "input", value: form.category, onChange: function (e) {
                                                        return setForm(function (f) { return (__assign(__assign({}, f), { category: e.target.value })); });
                                                    }, style: { paddingLeft: 33 } }, { children: CATEGORIES.map(function (c) { return ((0, jsx_runtime_1.jsx)("option", { children: c }, c)); }) }), void 0)] }), void 0)] }, void 0), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("label", __assign({ className: "lbl", style: { display: "flex", alignItems: "center", gap: 5 } }, { children: [(0, jsx_runtime_1.jsx)(lucide_react_1.StickyNote, { size: 10 }, void 0), " Notes", " ", (0, jsx_runtime_1.jsx)("span", __assign({ style: {
                                                        fontWeight: 400,
                                                        textTransform: "none",
                                                        letterSpacing: 0
                                                    } }, { children: "(optional \u2014 explain your split)" }), void 0)] }), void 0), (0, jsx_runtime_1.jsx)("textarea", { className: "input", placeholder: "e.g. Split 60/40 \u2014 Alpha used Adobe CC more this month", value: form.notes || "", onChange: function (e) {
                                                return setForm(function (f) { return (__assign(__assign({}, f), { notes: e.target.value })); });
                                            } }, void 0)] }, void 0), AI_TIPS[form.category] && ((0, jsx_runtime_1.jsxs)("div", __assign({ style: {
                                        background: D ? "#1a1200" : "#fffbeb",
                                        border: "1px solid " + (D ? "#3a2800" : "#fed7aa"),
                                        borderRadius: 10,
                                        padding: "11px 13px",
                                        display: "flex",
                                        gap: 9,
                                        alignItems: "flex-start"
                                    } }, { children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Sparkles, { size: 13, color: "#f97316", style: { flexShrink: 0, marginTop: 1 } }, void 0), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("p", __assign({ style: {
                                                        fontSize: 10,
                                                        fontWeight: 800,
                                                        color: D ? "#fbbf24" : "#92400e",
                                                        marginBottom: 2
                                                    } }, { children: ["AI Split Suggestion", !isPro && ((0, jsx_runtime_1.jsxs)("span", __assign({ style: { color: muted, fontWeight: 400 } }, { children: [" ", "\u00B7 Pro only"] }), void 0))] }), void 0), (0, jsx_runtime_1.jsx)("p", __assign({ style: { fontSize: 12, color: D ? "#d97706" : "#78350f" } }, { children: isPro
                                                        ? AI_TIPS[form.category]
                                                        : "Upgrade to Pro to unlock AI split suggestions." }), void 0)] }, void 0)] }), void 0)), projects.length === 0 && ((0, jsx_runtime_1.jsxs)("div", __assign({ style: {
                                        background: D ? "#1a0e00" : "#fff7ed",
                                        border: "1px solid " + (D ? "#3a2000" : "#fed7aa"),
                                        borderRadius: 10,
                                        padding: "11px 13px",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 8,
                                        fontSize: 13,
                                        color: "#d97706",
                                        fontWeight: 600
                                    } }, { children: [(0, jsx_runtime_1.jsx)(lucide_react_1.AlertTriangle, { size: 14 }, void 0), " Create a project first before adding expenses."] }), void 0)), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("div", __assign({ style: {
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                marginBottom: 8
                                            } }, { children: [(0, jsx_runtime_1.jsxs)("label", __assign({ className: "lbl", style: {
                                                        margin: 0,
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: 5
                                                    } }, { children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Zap, { size: 10, color: "#f97316" }, void 0), " Smart Split *", " ", (0, jsx_runtime_1.jsxs)("span", __assign({ style: {
                                                                fontWeight: 400,
                                                                textTransform: "none",
                                                                letterSpacing: 0,
                                                                fontSize: 10
                                                            } }, { children: ["\u2014 max ", maxSpl] }), void 0)] }), void 0), (0, jsx_runtime_1.jsxs)("div", __assign({ style: { display: "flex", gap: 7, alignItems: "center" } }, { children: [(0, jsx_runtime_1.jsxs)("span", __assign({ style: {
                                                                fontSize: 12,
                                                                fontWeight: 800,
                                                                color: totalPct === 100 ? "#16a34a" : "#ef4444",
                                                                display: "flex",
                                                                alignItems: "center",
                                                                gap: 4
                                                            } }, { children: [totalPct === 100 ? ((0, jsx_runtime_1.jsx)(lucide_react_1.CheckCircle2, { size: 12 }, void 0)) : ((0, jsx_runtime_1.jsx)(lucide_react_1.AlertTriangle, { size: 12 }, void 0)), " ", totalPct, "%"] }), void 0), (0, jsx_runtime_1.jsxs)("button", __assign({ className: "btn btn-ghost", style: { padding: "3px 9px", fontSize: 11 }, onClick: autoSplit }, { children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Zap, { size: 11 }, void 0), " Auto"] }), void 0)] }), void 0)] }), void 0), (0, jsx_runtime_1.jsx)("div", __assign({ style: { display: "flex", flexDirection: "column", gap: 7 } }, { children: form.splits.map(function (s, i) { return ((0, jsx_runtime_1.jsxs)("div", __assign({ className: "split-row" }, { children: [(0, jsx_runtime_1.jsx)("div", { style: {
                                                            width: 10,
                                                            height: 10,
                                                            borderRadius: "50%",
                                                            background: pClr(projects, s.pid),
                                                            flexShrink: 0
                                                        } }, void 0), (0, jsx_runtime_1.jsx)("select", __assign({ className: "input", style: { flex: 2, minWidth: 0 }, value: s.pid, onChange: function (e) {
                                                            return setForm(function (f) { return (__assign(__assign({}, f), { splits: f.splits.map(function (x, j) {
                                                                    return j === i ? __assign(__assign({}, x), { pid: e.target.value }) : x;
                                                                }) })); });
                                                        } }, { children: projects.map(function (p) { return ((0, jsx_runtime_1.jsx)("option", __assign({ value: p.id }, { children: p.name }), p.id)); }) }), void 0), (0, jsx_runtime_1.jsxs)("div", __assign({ style: {
                                                            position: "relative",
                                                            width: 72,
                                                            flexShrink: 0
                                                        } }, { children: [(0, jsx_runtime_1.jsx)("input", { className: "input", type: "number", min: "0", max: "100", value: s.pct, style: { paddingRight: 20 }, onChange: function (e) {
                                                                    return setForm(function (f) { return (__assign(__assign({}, f), { splits: f.splits.map(function (x, j) {
                                                                            return j === i
                                                                                ? __assign(__assign({}, x), { pct: Number(e.target.value) }) : x;
                                                                        }) })); });
                                                                } }, void 0), (0, jsx_runtime_1.jsx)("span", __assign({ style: {
                                                                    position: "absolute",
                                                                    right: 9,
                                                                    top: "50%",
                                                                    transform: "translateY(-50%)",
                                                                    color: muted,
                                                                    fontSize: 11,
                                                                    pointerEvents: "none"
                                                                } }, { children: "%" }), void 0)] }), void 0), form.amount && ((0, jsx_runtime_1.jsx)("span", __assign({ style: {
                                                            fontSize: 11,
                                                            color: muted,
                                                            fontWeight: 700,
                                                            whiteSpace: "nowrap"
                                                        } }, { children: fmt(Math.round((Number(form.amount) * s.pct) / 100)) }), void 0)), form.splits.length > 1 && ((0, jsx_runtime_1.jsx)("button", __assign({ className: "btn btn-danger", style: { padding: "5px 7px", flexShrink: 0 }, onClick: function () {
                                                            return setForm(function (f) { return (__assign(__assign({}, f), { splits: f.splits.filter(function (_, j) { return j !== i; }) })); });
                                                        } }, { children: (0, jsx_runtime_1.jsx)(lucide_react_1.X, { size: 12 }, void 0) }), void 0))] }), i)); }) }), void 0), splErr && ((0, jsx_runtime_1.jsxs)("p", __assign({ style: {
                                                fontSize: 12,
                                                color: "#ef4444",
                                                marginTop: 5,
                                                fontWeight: 700,
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 5
                                            } }, { children: [(0, jsx_runtime_1.jsx)(lucide_react_1.AlertTriangle, { size: 12 }, void 0), " ", splErr] }), void 0)), !splErr && totalPct === 100 && form.splits.length > 0 && ((0, jsx_runtime_1.jsxs)("p", __assign({ style: {
                                                fontSize: 12,
                                                color: "#16a34a",
                                                marginTop: 5,
                                                fontWeight: 700,
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 5
                                            } }, { children: [(0, jsx_runtime_1.jsx)(lucide_react_1.CheckCircle2, { size: 12 }, void 0), " Splits look good!"] }), void 0)), form.splits.length < Math.min(maxSpl, projects.length) ? ((0, jsx_runtime_1.jsxs)("button", __assign({ onClick: function () {
                                                return setForm(function (f) {
                                                    var _a;
                                                    return (__assign(__assign({}, f), { splits: __spreadArray(__spreadArray([], f.splits, true), [
                                                            { pid: ((_a = projects[0]) === null || _a === void 0 ? void 0 : _a.id) || "", pct: 0 },
                                                        ], false) }));
                                                });
                                            }, style: {
                                                marginTop: 8,
                                                background: D ? "#1a1a1a" : "#f9fafb",
                                                border: "1.5px dashed " + brd,
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
                                                gap: 6
                                            } }, { children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Plus, { size: 13 }, void 0), " Split to another project"] }), void 0)) : (!isPro &&
                                            form.splits.length >= maxSpl && ((0, jsx_runtime_1.jsxs)("button", __assign({ onClick: function () { return setShowPlan(true); }, style: {
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
                                                gap: 6
                                            } }, { children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Lock, { size: 13 }, void 0), " Upgrade to Pro for 4-way splitting"] }), void 0)))] }, void 0)] }), void 0), (0, jsx_runtime_1.jsxs)("div", __assign({ style: { display: "flex", gap: 10, marginTop: 18 } }, { children: [(0, jsx_runtime_1.jsx)("button", __assign({ className: "btn btn-primary", style: {
                                        flex: 1,
                                        justifyContent: "center",
                                        padding: 12,
                                        opacity: saving ? 0.7 : 1
                                    }, onClick: saveExpense, disabled: saving || projects.length === 0 }, { children: saving ? ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(lucide_react_1.RefreshCw, { size: 14, style: { animation: "spin .8s linear infinite" } }, void 0), " ", "Saving..."] }, void 0)) : ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Check, { size: 14 }, void 0), " ", editId ? "Save Changes" : "Add Expense"] }, void 0)) }), void 0), (0, jsx_runtime_1.jsx)("button", __assign({ className: "btn btn-ghost", onClick: function () { return setModal(null); } }, { children: "Cancel" }), void 0)] }), void 0)] }), void 0) }), void 0)), modal === "project" && ((0, jsx_runtime_1.jsx)("div", __assign({ className: "overlay", onClick: function (e) { return e.target === e.currentTarget && setModal(null); } }, { children: (0, jsx_runtime_1.jsxs)("div", __assign({ className: "modal scale-in", style: { maxWidth: 400 } }, { children: [(0, jsx_runtime_1.jsxs)("div", __assign({ style: {
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: 20
                            } }, { children: [(0, jsx_runtime_1.jsxs)("h2", __assign({ style: {
                                        fontFamily: "'Playfair Display',serif",
                                        fontSize: 23,
                                        color: txt,
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 10
                                    } }, { children: [(0, jsx_runtime_1.jsx)(lucide_react_1.FolderOpen, { size: 18, color: "#f97316" }, void 0), " New Project"] }), void 0), (0, jsx_runtime_1.jsx)("button", __assign({ className: "btn btn-ghost", style: { padding: "6px 9px" }, onClick: function () { return setModal(null); } }, { children: (0, jsx_runtime_1.jsx)(lucide_react_1.X, { size: 15 }, void 0) }), void 0)] }), void 0), (0, jsx_runtime_1.jsxs)("div", __assign({ style: { display: "flex", flexDirection: "column", gap: 13 } }, { children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", __assign({ className: "lbl" }, { children: "Project Name *" }), void 0), (0, jsx_runtime_1.jsx)("input", { className: "input", placeholder: "e.g. Website Redesign", value: pForm.name, onChange: function (e) {
                                                return setPForm(function (f) { return (__assign(__assign({}, f), { name: e.target.value })); });
                                            } }, void 0)] }, void 0), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", __assign({ className: "lbl" }, { children: "Client Name" }), void 0), (0, jsx_runtime_1.jsx)("input", { className: "input", placeholder: "e.g. Acme Corp", value: pForm.client, onChange: function (e) {
                                                return setPForm(function (f) { return (__assign(__assign({}, f), { client: e.target.value })); });
                                            } }, void 0)] }, void 0), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", __assign({ className: "lbl" }, { children: "Budget (\u20B1) \u2014 optional" }), void 0), (0, jsx_runtime_1.jsx)("input", { className: "input", type: "number", min: "0", placeholder: "0", value: pForm.budget, onChange: function (e) {
                                                return setPForm(function (f) { return (__assign(__assign({}, f), { budget: e.target.value })); });
                                            } }, void 0)] }, void 0), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", __assign({ className: "lbl" }, { children: "Color" }), void 0), (0, jsx_runtime_1.jsx)("div", __assign({ style: {
                                                display: "flex",
                                                gap: 8,
                                                flexWrap: "wrap",
                                                marginBottom: 10
                                            } }, { children: PALETTE.map(function (c) { return ((0, jsx_runtime_1.jsx)("div", { className: "color-swatch " + (pForm.color === c ? "sel" : ""), style: { background: c }, onClick: function () { return setPForm(function (f) { return (__assign(__assign({}, f), { color: c })); }); } }, c)); }) }), void 0), (0, jsx_runtime_1.jsxs)("div", __assign({ style: {
                                                padding: "9px 12px",
                                                background: pForm.color + "12",
                                                border: "1px solid " + pForm.color + "30",
                                                borderRadius: 10,
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 8
                                            } }, { children: [(0, jsx_runtime_1.jsx)("div", { style: {
                                                        width: 20,
                                                        height: 20,
                                                        borderRadius: 6,
                                                        background: pForm.color,
                                                        flexShrink: 0
                                                    } }, void 0), (0, jsx_runtime_1.jsx)("span", __assign({ style: {
                                                        fontSize: 13,
                                                        color: pForm.color,
                                                        fontWeight: 700
                                                    } }, { children: pForm.name || "Preview" }), void 0)] }), void 0)] }, void 0)] }), void 0), (0, jsx_runtime_1.jsxs)("div", __assign({ style: { display: "flex", gap: 10, marginTop: 20 } }, { children: [(0, jsx_runtime_1.jsx)("button", __assign({ className: "btn btn-primary", style: {
                                        flex: 1,
                                        justifyContent: "center",
                                        padding: 12,
                                        opacity: saving ? 0.7 : 1
                                    }, onClick: saveProject, disabled: saving }, { children: saving ? ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(lucide_react_1.RefreshCw, { size: 14, style: { animation: "spin .8s linear infinite" } }, void 0), " ", "Saving..."] }, void 0)) : ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Check, { size: 14 }, void 0), " Create Project"] }, void 0)) }), void 0), (0, jsx_runtime_1.jsx)("button", __assign({ className: "btn btn-ghost", onClick: function () { return setModal(null); } }, { children: "Cancel" }), void 0)] }), void 0)] }), void 0) }), void 0))] }), void 0));
}
// ── ROOT ──────────────────────────────────────────────────────────────────────
function Root() {
    var _a = useAuth(), user = _a.user, authLoading = _a.authLoading, signUp = _a.signUp, signIn = _a.signIn, signOut = _a.signOut;
    var _b = (0, react_1.useState)("landing"), page = _b[0], setPage = _b[1]; // "landing" | "login" | "register"
    // Auto-go to app if already logged in
    (0, react_1.useEffect)(function () {
        if (!authLoading && user)
            setPage("app");
    }, [user, authLoading]);
    if (authLoading)
        return ((0, jsx_runtime_1.jsxs)("div", __assign({ style: {
                background: "#0a0a0a",
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
            } }, { children: [(0, jsx_runtime_1.jsx)("style", { children: "@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}" }, void 0), (0, jsx_runtime_1.jsx)("div", { style: {
                        width: 40,
                        height: 40,
                        border: "3px solid #222",
                        borderTopColor: "#f97316",
                        borderRadius: "50%",
                        animation: "spin .8s linear infinite"
                    } }, void 0)] }), void 0));
    if (user)
        return (0, jsx_runtime_1.jsx)(FreelanceFundsApp, { user: user, signOut: signOut }, void 0);
    if (page === "landing")
        return ((0, jsx_runtime_1.jsx)(LandingPage, { onLogin: function () { return setPage("login"); }, onRegister: function () { return setPage("register"); } }, void 0));
    if (page === "login")
        return ((0, jsx_runtime_1.jsx)(AuthPage, { mode: "login", onSuccess: function () { return setPage("app"); }, onSwitch: function () { return setPage("register"); }, onBack: function () { return setPage("landing"); } }, void 0));
    if (page === "register")
        return ((0, jsx_runtime_1.jsx)(AuthPage, { mode: "register", onSuccess: function () { return setPage("app"); }, onSwitch: function () { return setPage("login"); }, onBack: function () { return setPage("landing"); } }, void 0));
    return null;
}
exports["default"] = Root;
