import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AlunoLayout from "../layouts/AlunoLayout";
import AuthLayout from "../layouts/AuthLayout";
import PersonalLayout from "../layouts/PersonalLayout";
import DashboardAluno from "../pages/aluno/Dashboard";
import MeusTreinos from "../pages/aluno/MeusTreinos";
import Treino from "../pages/aluno/Treino";
import Login from "../pages/auth/Login";
import Alunos from "../pages/personal/Alunos";
import AlunosIndex from "../pages/personal/Alunos/AlunosIndex";
import AlunosNewEdit from "../pages/personal/Alunos/AlunosNewEdit";
import AlunosShow from "../pages/personal/Alunos/AlunosShow";
import DashboardPersonal from "../pages/personal/Dashboard";
import ExerciciosIndex from "../pages/personal/Exercicios/ExerciciosIndex";
import ExerciciosNewEdit from "../pages/personal/Exercicios/ExerciciosNewEdit";
import ExerciciosShow from "../pages/personal/Exercicios/ExerciciosShow";
import Treinos from "../pages/personal/Treinos";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/" element={<Login />} />
        </Route>

        <Route path="/personal" element={<PersonalLayout />}>
          <Route index element={<DashboardPersonal />} />

          <Route path="alunos" element={<AlunosIndex />} />
          <Route path="alunos/novo" element={<AlunosNewEdit />} />
          <Route path="alunos/:id" element={<AlunosShow />} />
          <Route path="alunos/:id/editar" element={<AlunosNewEdit />} />

          <Route path="treinos" element={<Treinos />} />

          <Route path="exercicios" element={<ExerciciosIndex />} />
          <Route path="exercicios/novo" element={<ExerciciosNewEdit />} />
          <Route path="exercicios/:id" element={<ExerciciosShow />} />
          <Route path="exercicios/:id/editar" element={<ExerciciosNewEdit />} />
        </Route>

        <Route path="/aluno" element={<AlunoLayout />}>
          <Route index element={<DashboardAluno />} />

          <Route path="meus-treinos" element={<MeusTreinos />} />

          <Route path="treino/:id" element={<Treino />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
