import axiosInstance from './axios';

export const bookingApi = {
  // Get slot availability and pricing for a given ground on a specific date
  getSlotAvailability: async (groundId, date) => {
    const response = await axiosInstance.get(`/v1/booking/slots?groundId=${groundId}&date=${date}`);
    return response.data;
  },

  // Create a new booking
  createBooking: async (bookingData) => {
    // API Contract: groundId, slotId, bookingDate, notes
    const response = await axiosInstance.post('/v1/booking', bookingData);
    return response.data;
  },

  // Get bookings of the logged-in user
  getMyBookings: async () => {
    const response = await axiosInstance.get('/v1/booking/my-bookings');
    return response.data;
  },

  // Cancel an existing booking
  cancelBooking: async (bookingId) => {
    const response = await axiosInstance.post(`/v1/booking/${bookingId}/cancel`);
    return response.data;
  },

  // Explicitly configure/reinitialize slots template for a ground (requires MANAGER or ADMIN)
  initializeSlots: async (groundId) => {
    const response = await axiosInstance.post('/v1/booking/slots/initialize', { groundId });
    return response.data;
  },

  // Process mock payment for a booking
  processPayment: async (bookingId, paymentData) => {
    const response = await axiosInstance.post(`/v1/booking/${bookingId}/payments`, paymentData);
    return response.data;
  }
};
