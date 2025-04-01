import { User } from '../types/user';

export const fetchUsers = async (): Promise<User[]> => {
  const response = await fetch('http://127.0.0.1:5000/get-all-user/', {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch users');
  }

  const data = await response.json();
  return data.users || [];
};

export const createUser = async (userData: {
  email: string;
  password: string;
  nombre: string;
  rol: string;
  cedula: string;
  empresa: string;
}): Promise<User> => {
  console.log('Creating user with data:', userData);

  try {
    const response = await fetch('http://127.0.0.1:5000/create-user/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      },
      body: JSON.stringify(userData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response from server:', errorText);
      throw new Error(`Failed to create user: ${errorText}`);
    }

    const responseData = await response.json();
    console.log('User created successfully:', responseData);
    return responseData;
  } catch (error) {
    console.error('Error in createUser:', error);
    throw error;
  }
};

export const updateUser = async (user: User): Promise<User> => {
  console.log('Updating user:', user);
  
  // Preparar los datos para enviar
  const updateData = {
    email: user.email,
    password: user.password || '', // Si no hay contraseña, enviar string vacío
    nombre: user.nombre,
    rol: user.rol,
    cedula: user.cedula,
    empresa: user.empresa,
    id: user.id
  };

  console.log('Sending update data:', updateData);

  try {
    const response = await fetch(`http://127.0.0.1:5000/update-user/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      },
      body: JSON.stringify(updateData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`Failed to update user: ${errorText}`);
    }

    const responseData = await response.json();
    console.log('Update response:', responseData);
    return responseData;
  } catch (error) {
    console.error('Error in updateUser:', error);
    throw error;
  }
};

export const deleteUser = async (userId: number): Promise<void> => {
  const response = await fetch(`http://127.0.0.1:5000/delete-user/${userId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Error response:', errorText);
    throw new Error('Failed to delete user');
  }
}; 