import { useState, useEffect } from 'react';
import { 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  Box
} from '@mui/material';

interface UserInfo {
  id: string;
  nombre: string;
  correo: string;
  rol: string;
  cedula: string;
  empresa: string;
  imagen_aliado: string;
}

interface ProfileDetailsProps {
  userInfo: UserInfo;
  open: boolean;
  onClose: () => void;
  onSave: (updatedInfo: Partial<UserInfo>) => void;
}

const ProfileDetails = ({ userInfo, open, onClose, onSave }: ProfileDetailsProps) => {
  const [formData, setFormData] = useState<UserInfo>(userInfo);

  useEffect(() => {
    setFormData(userInfo);
  }, [userInfo]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = () => {
    onSave(formData);
    onClose();
  };
 

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Editar Perfil</DialogTitle>
      <DialogContent>
        <Box py={2}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Correo"
                name="correo"
                value={formData.correo}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Cédula"
                name="cedula"
                value={formData.cedula}
                onChange={handleChange}
                disabled
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Empresa"
                name="empresa"
                value={formData.empresa}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="URL de Imagen"
                name="imagen_aliado"
                value={formData.imagen_aliado}
                onChange={handleChange}
                placeholder="URL de la imagen de perfil"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Rol"
                name="rol"
                value={formData.rol}
                onChange={handleChange}
                disabled
              />
            </Grid>

          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancelar
        </Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Guardar Cambios
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProfileDetails;