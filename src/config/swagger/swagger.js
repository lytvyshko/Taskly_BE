export const swaggerSpec = {
  openapi: '3.0.3',

  info: {
    title: 'Taskly API',
    version: '1.0.0',
    description: 'API documentation for Taskly',
  },

  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Local server',
    },
  ],

  tags: [
    {
      name: 'Auth',
      description: 'Authentication endpoints',
    },
  ],

  components: {
    schemas: {
      RegisterRequest: {
        type: 'object',
        required: ['name', 'email', 'password'],
        properties: {
          name: {
            type: 'string',
            minLength: 2,
            maxLength: 50,
            example: 'John Doe',
          },
          email: {
            type: 'string',
            format: 'email',
            example: 'john@example.com',
          },
          password: {
            type: 'string',
            minLength: 8,
            description:
              'Must contain at least one number or symbol.',
            example: 'password123',
          },
        },
      },

      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: {
            type: 'string',
            format: 'email',
            example: 'john@example.com',
          },
          password: {
            type: 'string',
            minLength: 1,
            example: 'password123',
          },
        },
      },

      EmailRequest: {
        type: 'object',
        required: ['email'],
        properties: {
          email: {
            type: 'string',
            format: 'email',
            example: 'john@example.com',
          },
        },
      },

      ResetPasswordRequest: {
        type: 'object',
        required: ['token', 'newPassword'],
        properties: {
          token: {
            type: 'string',
            minLength: 1,
            example: 'selector.secret',
          },
          newPassword: {
            type: 'string',
            minLength: 8,
            description:
              'Must contain at least one number or symbol.',
            example: 'newPassword123',
          },
        },
      },

      ChangePasswordRequest: {
        type: 'object',
        required: ['currentPassword', 'newPassword'],
        properties: {
          currentPassword: {
            type: 'string',
            minLength: 1,
            example: 'oldPassword123',
          },
          newPassword: {
            type: 'string',
            minLength: 8,
            description:
              'Must contain at least one number or symbol.',
            example: 'newPassword123',
          },
        },
      },

      User: {
        type: 'object',
        required: [
          'id',
          'name',
          'email',
          'created_at',
          'email_verified',
        ],
        properties: {
          id: {
            type: 'integer',
            example: 123,
          },
          name: {
            type: 'string',
            example: 'John Doe',
          },
          email: {
            type: 'string',
            format: 'email',
            example: 'john@example.com',
          },
          created_at: {
            type: 'string',
            format: 'date-time',
            example: '2026-09-05T12:00:00.000Z',
          },
          email_verified: {
            type: 'boolean',
            example: false,
          },
        },
      },

      AuthResponse: {
        type: 'object',
        required: ['accessToken'],
        properties: {
          accessToken: {
            type: 'string',
            example: 'eyJhbGciOiJIUzI1NiIs...',
          },
        },
      },

      MessageResponse: {
        type: 'object',
        required: ['message'],
        properties: {
          message: {
            type: 'string',
            example: 'Operation completed successfully',
          },
        },
      },

      ErrorResponse: {
        type: 'object',
        required: ['message'],
        properties: {
          message: {
            type: 'string',
            example: 'Invalid email or password',
          },
        },
      },
    },

    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
      },
      refreshTokenCookie: {
        type: 'apiKey',
        in: 'cookie',
        name: 'refreshToken',
      },
    },
  },

  paths: {
    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a new user',

        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/RegisterRequest',
              },
            },
          },
        },

        responses: {
          201: {
            description: 'User successfully registered',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/User',
                },
              },
            },
          },

          409: {
            description:
              'User with this email already exists',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },

          500: {
            description: 'Internal server error',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
    },

    '/auth/verify-email': {
      get: {
        tags: ['Auth'],
        summary: 'Verify user email',

        parameters: [
          {
            name: 'token',
            in: 'query',
            required: true,
            schema: {
              type: 'string',
            },
            example: 'abc123',
          },
        ],

        responses: {
          200: {
            description: 'Email successfully verified',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/MessageResponse',
                },
              },
            },
          },

          400: {
            description:
              'Invalid or expired verification token',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },

          500: {
            description: 'Internal server error',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
    },

    '/auth/resend-verification': {
      post: {
        tags: ['Auth'],
        summary: 'Resend verification email',

        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/EmailRequest',
              },
            },
          },
        },

        responses: {
          200: {
            description: 'Verification email sent',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/MessageResponse',
                },
              },
            },
          },

          404: {
            description: 'User not found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },

          409: {
            description: 'Email is already verified',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },

          500: {
            description: 'Internal server error',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
    },

    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login user',

        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/LoginRequest',
              },
            },
          },
        },

        responses: {
          200: {
            description: 'Login successful',
            headers: {
              'Set-Cookie': {
                description:
                  'HTTP-only refresh token cookie',
                schema: {
                  type: 'string',
                },
              },
            },
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/AuthResponse',
                },
              },
            },
          },

          401: {
            description: 'Invalid email or password',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },

          403: {
            description: 'Email is not verified',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },

          500: {
            description: 'Internal server error',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
    },

    '/auth/refresh': {
      post: {
        tags: ['Auth'],
        summary: 'Refresh access token',

        security: [
          {
            refreshTokenCookie: [],
          },
        ],

        responses: {
          200: {
            description:
              'Access token successfully refreshed',
            headers: {
              'Set-Cookie': {
                description:
                  'New HTTP-only refresh token cookie',
                schema: {
                  type: 'string',
                },
              },
            },
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/AuthResponse',
                },
              },
            },
          },

          401: {
            description: 'Invalid or missing refresh token',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },

          500: {
            description: 'Internal server error',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
    },

    '/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Logout user',

        security: [
          {
            refreshTokenCookie: [],
          },
        ],

        responses: {
          204: {
            description: 'Logout successful',
          },

          500: {
            description: 'Internal server error',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
    },

    '/auth/test-cookie': {
      get: {
        tags: ['Auth'],
        summary: 'Test refresh token cookie',

        responses: {
          204: {
            description: 'Cookie successfully checked',
          },
        },
      },
    },

    '/auth/forgot-password': {
      post: {
        tags: ['Auth'],
        summary: 'Request password reset',

        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/EmailRequest',
              },
            },
          },
        },

        responses: {
          200: {
            description: 'Password reset request processed',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/MessageResponse',
                },
              },
            },
          },

          500: {
            description: 'Internal server error',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
    },

    '/auth/reset-password': {
      post: {
        tags: ['Auth'],
        summary: 'Reset password',

        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ResetPasswordRequest',
              },
            },
          },
        },

        responses: {
          200: {
            description: 'Password successfully reset',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/MessageResponse',
                },
              },
            },
          },

          400: {
            description:
              'Invalid or expired password reset token',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },

          500: {
            description: 'Internal server error',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
    },

    '/auth/password': {
      patch: {
        tags: ['Auth'],
        summary: 'Change password for the authenticated user',

        security: [
          {
            bearerAuth: [],
          },
        ],

        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ChangePasswordRequest',
              },
            },
          },
        },

        responses: {
          200: {
            description: 'Password successfully changed',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/MessageResponse',
                },
              },
            },
          },

          401: {
            description: 'Current password is incorrect',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },

          400: {
            description: 'Invalid password data',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
    },
  },
};
