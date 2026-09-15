// Success response
export const successResponse = (res, statusCode, message, data = null) => {
  const response = {
    success: true,
    message,
  };

  if (data !== null) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
};

// Error response
export const errorResponse = (res, statusCode, message, errors = null) => {
  const response = {
    success: false,
    message,
  };

  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

// Paginated response
export const paginatedResponse = (res, statusCode, message, data, pagination) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      totalPages: pagination.totalPages,
      totalItems: pagination.totalItems,
      hasNextPage: pagination.hasNextPage,
      hasPrevPage: pagination.hasPrevPage,
    },
  });
};
