import { useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import authService from "../services/authService";
import useAuthStore from "../store/authStore";

import AuthLayout from "../layouts/AuthLayout";
import StudentLayout from "../layouts/StudentLayout";
import TrainerLayout from "../layouts/TrainerLayout";

import Login from "../pages/auth/Login";

import DashboardStudent from "../pages/student/Dashboard";
import History from "../pages/student/History";
import HistoryDetail from "../pages/student/HistoryDetail";
import MyWorkouts from "../pages/student/MyWorkouts";
import Workout from "../pages/student/Workout";

import LogoutPage from "../pages/auth/LogoutPage";
import DashboardTrainer from "../pages/trainer/Dashboard";
import ExercisesIndex from "../pages/trainer/Exercises/ExercisesIndex";
import ExercisesNewEdit from "../pages/trainer/Exercises/ExercisesNewEdit";
import ExercisesShow from "../pages/trainer/Exercises/ExercisesShow";
import StudentsIndex from "../pages/trainer/Students/StudentsIndex";
import StudentsNewEdit from "../pages/trainer/Students/StudentsNewEdit";
import StudentsShow from "../pages/trainer/Students/StudentsShow";
import WorkoutsIndex from "../pages/trainer/Workouts/WorkoutsIndex";
import WorkoutsNewEdit from "../pages/trainer/Workouts/WorkoutsNewEdit";
import WorkoutsShow from "../pages/trainer/Workouts/WorkoutsShow";

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
        <p>Carregando sessão...</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route
            path="/"
            element={
              user ? (
                <Navigate
                  to={user.role === "trainer" ? "/trainer" : "/student"}
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
        </Route>

        <Route path="/logout" element={<LogoutPage />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
