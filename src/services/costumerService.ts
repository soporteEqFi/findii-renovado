import { Customer } from '../types/customer';

const API_URL = 'http://127.0.0.1:5000';

export const customerService = {
  async fetchCustomers() {
    const response = await fetch(`${API_URL}/get-combined-data`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      }
    });
    console.log(response);
    if (!response.ok) throw new Error('Failed to fetch customers');
    return response.json();
  },

  async createCustomer(formData: FormData) {
    const response = await fetch(`${API_URL}/add-record/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      },
      body: formData
    });
    if (!response.ok) throw new Error('Failed to create customer');
    return response.json();
  },

  async updateCustomerStatus(customer: Customer, newStatus: string) {
    const response = await fetch(`${API_URL}/editar-estado/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      },
      body: JSON.stringify({
        estado: newStatus,
        solicitante_id: customer.id_solicitante,
        numero_documento: customer.numero_documento
      })
    });
    if (!response.ok) throw new Error('Failed to update status');
    return response.json();
  },

  async updateCustomer(customer: Customer) {
    const response = await fetch(`${API_URL}/update-customer/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      },
      body: JSON.stringify(customer)
    });
    if (!response.ok) throw new Error('Failed to update customer');
    return response.json();
  },

  async deleteCustomer(customerId: string) {
    const response = await fetch(`${API_URL}/delete-customer/${customerId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      }
    });
    if (!response.ok) throw new Error('Failed to delete customer');
    return response.json();
  }
};