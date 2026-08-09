import axiosInstance from './axios';

export const venueApi = {
  // Get all venues
  getAllVenues: async (page = 0, size = 10) => {
    const response = await axiosInstance.get(`/v1/sports/venues?page=${page}&size=${size}`);
    return response.data;
  },

  // Create a new venue
  createVenue: async (venueData) => {
    const response = await axiosInstance.post('/v1/sports/venues', venueData);
    return response.data;
  },

  // Get venues managed by the logged-in manager
  getMyVenues: async () => {
    const response = await axiosInstance.get('/v1/sports/venues/my-venues');
    return response.data;
  },

  // Update venue details
  updateVenue: async (venueId, venueData) => {
    const response = await axiosInstance.put(`/v1/sports/venues/${venueId}`, venueData);
    return response.data;
  },

  // Add a turf to a venue
  addTurfToVenue: async (venueId, turfData) => {
    const response = await axiosInstance.post(`/v1/sports/venues/${venueId}/turfs`, turfData);
    return response.data;
  },

  // Update a turf
  updateTurf: async (venueId, turfId, turfData) => {
    const response = await axiosInstance.put(`/v1/sports/venues/${venueId}/turfs/${turfId}`, turfData);
    return response.data;
  },


  // Upload Venue Image (Optional/Placeholder for future)
  uploadVenueImage: async (venueId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axiosInstance.post(`/v1/sports/venues/${venueId}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // Set Primary Image
  setPrimaryVenueImage: async (venueId, imageId) => {
    const response = await axiosInstance.patch(`/v1/sports/venues/${venueId}/images/${imageId}/primary`);
    return response.data;
  },

  // Add or update a review
  addOrUpdateReview: async (venueId, reviewData) => {
    const response = await axiosInstance.post(`/v1/sports/venues/${venueId}/reviews`, reviewData);
    return response.data;
  },

  // Get paginated reviews
  getVenueReviews: async (venueId, page = 0, size = 10) => {
    const response = await axiosInstance.get(`/v1/sports/venues/${venueId}/reviews?page=${page}&size=${size}`);
    return response.data;
  },

  // Delete review
  deleteReview: async (venueId) => {
    const response = await axiosInstance.delete(`/v1/sports/venues/${venueId}/reviews`);
    return response.data;
  }
};
