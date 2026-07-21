import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import authService from "../services/authService";
import useAuthStore from "../store/authStore";

import AdminLayout from "../layouts/AdminLayout";
import AuthLayout from "../layouts/AuthLayout";
import StudentLayout from "../layouts/StudentLayout";
import TrainerLayout from "../layouts/TrainerLayout";

import PageLoader from "../components/common/PageLoader";

// Login e Logout permanecem no bundle inicial (fluxo de entrada/saída).
// As demais páginas são carregadas sob demanda (code splitting) para reduzir
// o tamanho do bundle inicial e o tempo até a primeira renderização.
import Login from "../pages/auth/Login";
import LogoutPage from "../pages/auth/LogoutPage";

const DashboardAdmin = lazy(() => import("../pages/admin/Dashboard"));

const DashboardStudent = lazy(() => import("../pages/student/Dashboard"));
const DailyCheckinsIndex = lazy(
  () => import("../pages/student/DailyCheckins/DailyCheckinsIndex"),
);
const History = lazy(() => import("../pages/student/History"));
const HistoryDetail = lazy(() => import("../pages/student/HistoryDetail"));
const MyWorkouts = lazy(() => import("../pages/student/MyWorkouts"));
const Workout = lazy(() => import("../pages/student/Workout"));

const CheckinsIndex = lazy(() => import("../pages/trainer/Checkins/CheckinsIndex"));
const CheckinsShow = lazy(() => import("../pages/trainer/Checkins/CheckinsShow"));
const DashboardTrainer = lazy(() => import("../pages/trainer/Dashboard"));
const TrainerDailyCheckinsIndex = lazy(
  () => import("../pages/trainer/DailyCheckins/DailyCheckinsIndex"),
);
const TrainerDailyCheckinsShow = lazy(
  () => import("../pages/trainer/DailyCheckins/DailyCheckinsShow"),
);
const ExercisesIndex = lazy(() => import("../pages/trainer/Exercises/ExercisesIndex"));
const ExercisesNewEdit = lazy(
  () => import("../pages/trainer/Exercises/ExercisesNewEdit"),
);
const ExercisesShow = lazy(() => import("../pages/trainer/Exercises/ExercisesShow"));
const StudentsIndex = lazy(() => import("../pages/trainer/Students/StudentsIndex"));
const StudentsNewEdit = lazy(
  () => import("../pages/trainer/Students/StudentsNewEdit"),
);
const StudentsShow = lazy(() => import("../pages/trainer/Students/StudentsShow"));
const WorkoutsIndex = lazy(() => import("../pages/trainer/Workouts/WorkoutsIndex"));
const WorkoutsNewEdit = lazy(
  () => import("../pages/trainer/Workouts/WorkoutsNewEdit"),
);
const WorkoutsShow = lazy(() => import("../pages/trainer/Workouts/WorkoutsShow"));

export default function AppRoutes() {
  const { user, setUser, isLoading, setLoading } = useAuthStore();

  useEffect(() => {
    const initAuth = async () => {
      const user = await authService.initAuth();

      setUser(user);
      setLoading(false);
    };

    initAuth();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <PageLoader label="Carregando sessão..." />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Suspense
        fallback={
          <div className="flex h-screen items-center justify-center">
            <PageLoader label="Carregando..." />
          </div>
        }
      >
        <Routes>
        <Route element={<AuthLayout />}>
          <Route
            path="/"
            element={
              user ? (
                <Navigate
                  to={
                    user.role === "trainer"
                      ? "/trainer"
                      : user.role === "admin"
                        ? "/admin"
                        : "/student"
                  }
                  replace
                />
              ) : (
                <Login />
              )
            }
          />
        </Route>

        {/* TRAINER */}
        <Route
          path="/trainer/*"
          element={
            user?.role === "trainer" ? (
              <TrainerLayout />
            ) : (
              <Navigate to="/" replace />
            )
          }
        >
          <Route index element={<DashboardTrainer />} />

          <Route path="students" element={<StudentsIndex />} />
          <Route path="students/new" element={<StudentsNewEdit />} />
          <Route path="students/:id" element={<StudentsShow />} />
          <Route path="students/:id/editar" element={<StudentsNewEdit />} />

          <Route path="workouts" element={<WorkoutsIndex />} />
          <Route path="workouts/new" element={<WorkoutsNewEdit />} />
          <Route path="workouts/:id" element={<WorkoutsShow />} />
          <Route path="workouts/:id/edit" element={<WorkoutsNewEdit />} />

          <Route path="exercises" element={<ExercisesIndex />} />
          <Route path="exercises/new" element={<ExercisesNewEdit />} />
          <Route path="exercises/:id" element={<ExercisesShow />} />
          <Route path="exercises/:id/edit" element={<ExercisesNewEdit />} />

          <Route path="checkins/workouts" element={<CheckinsIndex />} />
          <Route path="checkins/workouts/:id" element={<CheckinsShow />} />

          <Route path="checkins/daily" element={<TrainerDailyCheckinsIndex />} />
          <Route path="checkins/daily/:id" element={<TrainerDailyCheckinsShow />} />
        </Route>

        <Route
          path="/student/*"
          element={
            user?.role === "student" ? (
              <StudentLayout />
            ) : (
              <Navigate to="/" replace />
            )
          }
        >
          <Route index element={<DashboardStudent />} />

          <Route path="my-workouts" element={<MyWorkouts />} />
          <Route path="workout/:id" element={<Workout />} />
          <Route path="history" element={<History />} />
          <Route path="history/:id" element={<HistoryDetail />} />
          <Route path="daily-checkins" element={<DailyCheckinsIndex />} />
        </Route>

        <Route
          path="/admin/*"
          element={
            user?.role === "admin" ? <AdminLayout /> : <Navigate to="/" replace />
          }
        >
          <Route index element={<DashboardAdmin />} />
        </Route>

        <Route path="/logout" element={<LogoutPage />} />

        <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
