import {
  Box,
  Button,
  Card,
  Divider,
  Grid,
  InputAdornment,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";

import BadgeIcon from "@mui/icons-material/Badge";
import EmailIcon from "@mui/icons-material/Email";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import HeightIcon from "@mui/icons-material/Height";
import LockIcon from "@mui/icons-material/Lock";
import NotesIcon from "@mui/icons-material/Notes";
import PersonIcon from "@mui/icons-material/Person";
import PhoneIcon from "@mui/icons-material/Phone";

import { yupResolver } from "@hookform/resolvers/yup";
import axios from "axios";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import * as yup from "yup";

/* ================= VALIDATION ================= */
const schema = yup.object({
  name: yup.string().required("O nome é obrigatório"),
  email: yup
    .string()
    .email("E-mail inválido")
    .required("O e-mail é obrigatório"),
  password: yup
    .string()
    .min(6, "A senha deve ter no mínimo 6 caracteres")
    .required("A senha é obrigatória"),
  cpf: yup.string().required("O CPF é obrigatório"),
});

/* ================= SECTION TITLE ================= */
const SectionTitle = ({ icon, title }) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
    {icon}
    <Typography
      variant="subtitle2"
      fontWeight={700}
      color="text.secondary"
      sx={{ textTransform: "uppercase", letterSpacing: "0.6px" }}
    >
      {title}
    </Typography>
  </Box>
);

export default function Alunos() {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      sexo: "Masculino",
      data_nascimento: "2000-01-01",
    },
  });

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      await axios.post("http://localhost:8000/api/perfil-aluno", data);
      toast.success("Aluno criado com sucesso!");
      reset();
    } catch {
      toast.error("Erro ao criar aluno");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", px: 2, py: 4 }}>
      {/* HEADER */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={800}>
          Cadastro de Alunos
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Preencha os dados abaixo para criar um novo aluno
        </Typography>
      </Box>

      <Card
        elevation={0}
        sx={{
          p: { xs: 3, md: 4 },
          borderRadius: 4,
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          {/* ================= DADOS PESSOAIS ================= */}
          <Box sx={{ mb: 5 }}>
            <SectionTitle
              icon={<PersonIcon fontSize="small" />}
              title="Dados Pessoais"
            />
            <Divider sx={{ my: 2 }} />

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Nome completo"
                  {...register("name")}
                  error={!!errors.name}
                  helperText={errors.name?.message}
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="CPF"
                  {...register("cpf")}
                  error={!!errors.cpf}
                  helperText={errors.cpf?.message}
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <BadgeIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Data de nascimento"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  {...register("data_nascimento")}
                  fullWidth
                />
              </Grid>

              {/* FORÇA QUEBRA REAL DE LINHA */}
              <Grid item xs={12} />

              <Grid item xs={12} md={6}>
                <TextField select label="Sexo" fullWidth {...register("sexo")}>
                  <MenuItem value="Masculino">Masculino</MenuItem>
                  <MenuItem value="Feminino">Feminino</MenuItem>
                  <MenuItem value="Outro">Outro</MenuItem>
                </TextField>
              </Grid>
            </Grid>
          </Box>

          {/* ================= CONTATO ================= */}
          <Box sx={{ mb: 5 }}>
            <SectionTitle
              icon={<EmailIcon fontSize="small" />}
              title="Contato & Segurança"
            />
            <Divider sx={{ my: 2 }} />

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="E-mail"
                  {...register("email")}
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Telefone"
                  {...register("telefone")}
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Senha"
                  type="password"
                  {...register("password")}
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>
          </Box>

          {/* ================= BIOMETRIA ================= */}
          <Box sx={{ mb: 5 }}>
            <SectionTitle
              icon={<FitnessCenterIcon fontSize="small" />}
              title="Medidas Físicas"
            />
            <Divider sx={{ my: 2 }} />

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Altura"
                  {...register("altura")}
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <HeightIcon fontSize="small" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">m</InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Peso atual"
                  {...register("peso_atual")}
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <FitnessCenterIcon fontSize="small" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">kg</InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Observações"
                  multiline
                  rows={3}
                  {...register("observacoes")}
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <NotesIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>
          </Box>

          {/* ================= BOTÃO ================= */}
          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              size="large"
              sx={{
                px: 4,
                py: 1.6,
                borderRadius: 2.5,
                fontWeight: 700,
                textTransform: "none",
                width: { xs: "100%", md: "auto" },
                minWidth: 200,
              }}
            >
              {loading ? "Criando..." : "Criar Aluno"}
            </Button>
          </Box>
        </Box>
      </Card>
    </Box>
  );
}
