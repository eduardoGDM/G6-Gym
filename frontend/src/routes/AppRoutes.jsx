import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import StudentLayout from "../layouts/StudentLayout";
import TrainerLayout from "../layouts/TrainerLayout";
import Login from "../pages/auth/Login";
import DashboardStudent from "../pages/student/Dashboard";
import MyWorkouts from "../pages/student/MyWorkouts";
import Workout from "../pages/student/Workout";
import DashboardTrainer from "../pages/trainer/Dashboard";
import ExercisesIndex from "../pages/trainer/Exercises/ExercisesIndex";
import ExercisesNewEdit from "../pages/trainer/Exercises/ExercisesNewEdit";
import ExercisesShow from "../pages/trainer/Exercises/ExercisesShow";
import StudentsIndex from "../pages/trainer/Students/StudentsIndex";
import StudentsNewEdit from "../pages/trainer/Students/StudentsNewEdit";
import StudentsShow from "../pages/trainer/Students/StudentsShow";
import Workouts from "../pages/trainer/Workouts";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/" element={<Login />} />
        </Route>

        <Route path="/trainer" element={<TrainerLayout />}>
          <Route index element={<DashboardTrainer />} />

          <Route path="students" element={<StudentsIndex />} />
          <Route path="students/new" element={<StudentsNewEdit />} />
          <Route path="students/:id" element={<StudentsShow />} />
          <Route path="students/:id/editar" element={<StudentsNewEdit />} />

          <Route path="workouts" element={<Workouts />} />
          <Route path="exercises" element={<ExercisesIndex />} />
          <Route path="exercises/new" element={<ExercisesNewEdit />} />
          <Route path="exercises/:id" element={<ExercisesShow />} />
          <Route path="exercises/:id/edit" element={<ExercisesNewEdit />} />
        </Route>

        <Route path="/student" element={<StudentLayout />}>
          <Route index element={<DashboardStudent />} />

          <Route path="my-workouts" element={<MyWorkouts />} />

          <Route path="workout/:id" element={<Workout />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
