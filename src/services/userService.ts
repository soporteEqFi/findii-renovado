import { User } from '../types/user';

export const fetchUsers = async (): Promise<User[]> => {
  try {
    const response = await fetch('http://127.0.0.1:5000/get-all-user');
    const data = await response.json();
    console.log(data);
    return data.users || [];
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

export const updateUser = async (user: User): Promise<User> => {
  try {
    const response = await fetch(`http://127.0.0.1:5000/users/${user.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(user),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

export const deleteUser = async (userId: number): Promise<void> => {
  try {
    await fetch(`http://127.0.0.1:5000/users/${userId}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}; 