/**
 * OpenAPI 3.0 Specification for the AVFY Public API
 *
 * Documents all public (unauthenticated or partially-public) API endpoints
 * for A Vision For You Inc., a 501(c)(3) nonprofit.
 */

export interface OpenAPISpec {
  openapi: string;
  info: {
    title: string;
    version: string;
    description: string;
    contact: {
      name: string;
      email: string;
      url: string;
    };
  };
  servers: Array<{ url: string; description: string }>;
  paths: Record<string, Record<string, PathOperation>>;
  components: {
    schemas: Record<string, SchemaObject>;
  };
}

interface PathOperation {
  summary: string;
  description: string;
  tags: string[];
  operationId: string;
  parameters?: Array<ParameterObject>;
  requestBody?: {
    required: boolean;
    content: {
      "application/json": {
        schema: SchemaRef;
      };
    };
  };
  responses: Record<string, ResponseObject>;
}

interface ParameterObject {
  name: string;
  in: "query" | "path" | "header";
  required: boolean;
  description: string;
  schema: SchemaRef;
}

interface ResponseObject {
  description: string;
  content?: {
    "application/json"?: {
      schema: SchemaRef;
    };
    "text/html"?: {
      schema: SchemaRef;
    };
  };
  headers?: Record<string, { description: string; schema: SchemaRef }>;
}

interface SchemaRef {
  $ref?: string;
  type?: string;
  properties?: Record<string, SchemaRef>;
  items?: SchemaRef;
  required?: string[];
  enum?: string[];
  description?: string;
  example?: string | number | boolean | null;
  format?: string;
  minimum?: number;
  maximum?: number;
  nullable?: boolean;
  additionalProperties?: SchemaRef | boolean;
}

interface SchemaObject extends SchemaRef {
  type: string;
}

export const openApiSpec: OpenAPISpec = {
  openapi: "3.0.3",
  info: {
    title: "AVFY API",
    version: "1.0.0",
    description:
      "Public API for A Vision For You Inc., a 501(c)(3) nonprofit organization empowering the homeless, addicted, maladjusted, and mentally ill to lead productive lives through housing, education, self-help, treatment, and other available resources. Located at 1675 Story Ave, Louisville, KY 40206.",
    contact: {
      name: "A Vision For You Inc.",
      email: "info@avisionforyourecovery.org",
      url: "https://avisionforyourecovery.org",
    },
  },
  servers: [
    {
      url: "/api",
      description: "AVFY API Server",
    },
  ],
  paths: {
    // ─── Contact ───────────────────────────────────────────────
    "/contact": {
      post: {
        summary: "Submit a contact inquiry",
        description:
          "Public endpoint to submit a contact form inquiry. Rate limited to 5 submissions per day per IP address. Sends email notifications to the appropriate department and a confirmation to the submitter.",
        tags: ["Contact"],
        operationId: "submitContactInquiry",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ContactSubmission" },
            },
          },
        },
        responses: {
          "201": {
            description: "Inquiry submitted successfully",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ContactResponse" },
              },
            },
          },
          "400": {
            description: "Validation error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ValidationError" },
              },
            },
          },
          "429": {
            description: "Rate limit exceeded",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/RateLimitError" },
              },
            },
            headers: {
              "Retry-After": {
                description: "Seconds until rate limit resets",
                schema: { type: "string", example: "3600" },
              },
            },
          },
          "500": {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },

    // ─── Admission ─────────────────────────────────────────────
    "/admission": {
      post: {
        summary: "Submit an admission inquiry",
        description:
          "Public endpoint to submit a program admission inquiry. Rate limited to 10 per day per IP and 1 per day per email address. Duplicate email submissions are rejected.",
        tags: ["Admission"],
        operationId: "submitAdmissionInquiry",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AdmissionSubmission" },
            },
          },
        },
        responses: {
          "201": {
            description: "Inquiry submitted successfully",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AdmissionResponse" },
              },
            },
          },
          "400": {
            description: "Validation error or duplicate submission",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ValidationError" },
              },
            },
          },
          "429": {
            description: "Rate limit exceeded",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/RateLimitError" },
              },
            },
            headers: {
              "Retry-After": {
                description: "Seconds until rate limit resets",
                schema: { type: "string", example: "3600" },
              },
            },
          },
          "500": {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },

    // ─── Newsletter Subscribe ──────────────────────────────────
    "/newsletter/subscribe": {
      post: {
        summary: "Subscribe to the newsletter",
        description:
          "Public endpoint to subscribe an email address to the AVFY newsletter. Rate limited to 3 requests per minute per IP. Includes honeypot spam protection (company field). Previously unsubscribed addresses can re-subscribe.",
        tags: ["Newsletter"],
        operationId: "subscribeNewsletter",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/NewsletterSubscribeRequest",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Subscribed successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/NewsletterSubscribeResponse",
                },
              },
            },
          },
          "400": {
            description: "Invalid email or already subscribed",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "429": {
            description: "Rate limit exceeded",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "500": {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },

    // ─── Newsletter Unsubscribe ────────────────────────────────
    "/newsletter/unsubscribe": {
      get: {
        summary: "Unsubscribe from the newsletter",
        description:
          "Unsubscribes an email address from the newsletter. Returns an HTML confirmation page rather than JSON.",
        tags: ["Newsletter"],
        operationId: "unsubscribeNewsletter",
        parameters: [
          {
            name: "email",
            in: "query",
            required: true,
            description: "Email address to unsubscribe",
            schema: { type: "string", format: "email" },
          },
        ],
        responses: {
          "200": {
            description: "Unsubscribed successfully (HTML page)",
            content: {
              "text/html": {
                schema: { type: "string", description: "HTML confirmation page" },
              },
            },
          },
          "400": {
            description: "Invalid email or not found (HTML page)",
            content: {
              "text/html": {
                schema: { type: "string", description: "HTML error page" },
              },
            },
          },
        },
      },
    },

    // ─── Newsletter List ───────────────────────────────────────
    "/newsletter": {
      get: {
        summary: "List published newsletters",
        description:
          "Returns all published newsletters, ordered by publish date (newest first). Includes author information.",
        tags: ["Newsletter"],
        operationId: "listNewsletters",
        responses: {
          "200": {
            description: "List of published newsletters",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Newsletter" },
                },
              },
            },
          },
          "500": {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },

    // ─── Newsletter By Slug ────────────────────────────────────
    "/newsletter/{slug}": {
      get: {
        summary: "Get a newsletter by slug",
        description:
          "Returns a single published newsletter by its URL slug. Includes author information.",
        tags: ["Newsletter"],
        operationId: "getNewsletterBySlug",
        parameters: [
          {
            name: "slug",
            in: "path",
            required: true,
            description: "URL slug of the newsletter",
            schema: { type: "string", example: "spring-2024-update" },
          },
        ],
        responses: {
          "200": {
            description: "Newsletter details",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Newsletter" },
              },
            },
          },
          "404": {
            description: "Newsletter not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "500": {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },

    // ─── Donations ─────────────────────────────────────────────
    "/donate/square": {
      post: {
        summary: "Create a donation via Square",
        description:
          "Public endpoint to initiate a donation. Creates a pending donation record and generates a Square checkout URL for payment. Supports one-time, monthly, and yearly donations. Rate limited to 5 per hour per IP.",
        tags: ["Donations"],
        operationId: "createDonation",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/DonationRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "Donation created, checkout URL returned",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/DonationResponse" },
              },
            },
          },
          "400": {
            description: "Validation error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ValidationError" },
              },
            },
          },
          "429": {
            description: "Rate limit exceeded",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/RateLimitError" },
              },
            },
          },
          "500": {
            description: "Payment processing error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },

    // ─── Blog List ─────────────────────────────────────────────
    "/blog": {
      get: {
        summary: "List published blog posts",
        description:
          "Returns all published blog posts ordered by publish date (newest first). Includes author information. Admin users can pass drafts=true to include draft posts.",
        tags: ["Blog"],
        operationId: "listBlogPosts",
        parameters: [
          {
            name: "drafts",
            in: "query",
            required: false,
            description:
              "Include draft posts (admin only, requires authentication)",
            schema: { type: "string", enum: ["true", "false"] },
          },
        ],
        responses: {
          "200": {
            description: "List of blog posts",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/BlogPost" },
                },
              },
            },
          },
          "500": {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },

    // ─── Blog By Slug ──────────────────────────────────────────
    "/blog/{slug}": {
      get: {
        summary: "Get a blog post by slug",
        description:
          "Returns a single blog post by its URL slug. Automatically increments the view counter. Falls back to JSON file data if the database is unavailable.",
        tags: ["Blog"],
        operationId: "getBlogPost",
        parameters: [
          {
            name: "slug",
            in: "path",
            required: true,
            description: "URL slug of the blog post",
            schema: { type: "string", example: "recovery-stories-2024" },
          },
        ],
        responses: {
          "200": {
            description: "Blog post details",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/BlogPost" },
              },
            },
          },
          "404": {
            description: "Post not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "500": {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },

    // ─── Auth Signup ───────────────────────────────────────────
    "/auth/signup": {
      post: {
        summary: "Create a new user account",
        description:
          "Public endpoint to register a new user account. Rate limited to 5 attempts per 15 minutes per IP. Password must be at least 8 characters and include at least 1 number and 1 special character.",
        tags: ["Authentication"],
        operationId: "signup",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SignupRequest" },
            },
          },
        },
        responses: {
          "201": {
            description: "Account created successfully",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SignupResponse" },
              },
            },
          },
          "400": {
            description: "Missing fields or weak password",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "409": {
            description: "Email already in use",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "429": {
            description: "Too many signup attempts",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "500": {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },

    // ─── Meetings ──────────────────────────────────────────────
    "/meetings": {
      get: {
        summary: "List meetings and program sessions",
        description:
          "Returns all meetings/program sessions. Can filter to upcoming meetings only. Authenticated users will see their RSVP status for each meeting.",
        tags: ["Meetings"],
        operationId: "listMeetings",
        parameters: [
          {
            name: "upcoming",
            in: "query",
            required: false,
            description: "If true, only return meetings in the future",
            schema: { type: "string", enum: ["true", "false"] },
          },
        ],
        responses: {
          "200": {
            description: "List of meetings",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    meetings: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Meeting" },
                    },
                  },
                },
              },
            },
          },
          "500": {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },

    // ─── Team ──────────────────────────────────────────────────
    "/team": {
      get: {
        summary: "List active team members",
        description:
          "Returns all active team members, ordered by display order. Response is cached for 60 seconds with stale-while-revalidate.",
        tags: ["Team"],
        operationId: "listTeamMembers",
        responses: {
          "200": {
            description: "List of team members",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/TeamMember" },
                },
              },
            },
          },
          "500": {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },

    // ─── Public Impact ─────────────────────────────────────────
    "/public/impact": {
      get: {
        summary: "Get impact metrics",
        description:
          "Returns aggregate impact metrics including total meetings held, RSVPs, donation totals, and estimated lives impacted. Returns zeroed data on database failure.",
        tags: ["Public"],
        operationId: "getImpactMetrics",
        responses: {
          "200": {
            description: "Impact metrics",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ImpactMetrics" },
              },
            },
          },
        },
      },
    },

    // ─── Public Social Stats ───────────────────────────────────
    "/public/social-stats": {
      get: {
        summary: "Get social media statistics",
        description:
          "Returns follower counts and handles for all AVFY social media platforms. Falls back to default values if the database is unavailable.",
        tags: ["Public"],
        operationId: "getSocialStats",
        responses: {
          "200": {
            description: "Social media statistics by platform",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SocialStats" },
              },
            },
          },
        },
      },
    },

    // ─── DUI Classes ───────────────────────────────────────────
    "/dui-classes/{classId}": {
      get: {
        summary: "Get DUI class details",
        description:
          "Returns details for a single DUI class including registration count.",
        tags: ["DUI Classes"],
        operationId: "getDuiClass",
        parameters: [
          {
            name: "classId",
            in: "path",
            required: true,
            description: "Unique ID of the DUI class",
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": {
            description: "DUI class details",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/DUIClass" },
              },
            },
          },
          "404": {
            description: "Class not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "500": {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },

    // ─── DUI Class Registration ────────────────────────────────
    "/dui-classes/register": {
      post: {
        summary: "Register for a DUI class",
        description:
          "Creates a DUI class registration and returns a Square checkout URL for payment. Validates class availability, capacity, and duplicate registrations.",
        tags: ["DUI Classes"],
        operationId: "registerDuiClass",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/DUIRegistrationRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "Registration created, payment URL returned",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/DUIRegistrationResponse",
                },
              },
            },
          },
          "400": {
            description:
              "Validation error, class full, date passed, or duplicate registration",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "404": {
            description: "Class not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "500": {
            description: "Payment processing or server error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
  },

  // ─── Component Schemas ─────────────────────────────────────────
  components: {
    schemas: {
      // ── Contact ────────────────────────────────────────────────
      ContactSubmission: {
        type: "object",
        required: ["name", "email", "subject", "message"],
        properties: {
          name: {
            type: "string",
            description: "Full name of the person submitting",
            example: "Jane Doe",
          },
          email: {
            type: "string",
            format: "email",
            description: "Contact email address",
            example: "jane@example.com",
          },
          phone: {
            type: "string",
            description: "Phone number (10-20 characters)",
            nullable: true,
            example: "502-555-0100",
          },
          department: {
            type: "string",
            enum: [
              "general",
              "programs",
              "donate",
              "volunteer",
              "press",
              "careers",
            ],
            description: "Department to route the inquiry to",
            example: "programs",
          },
          subject: {
            type: "string",
            description: "Subject line (1-200 characters)",
            example: "Volunteer Inquiry",
          },
          message: {
            type: "string",
            description: "Message body (10-5000 characters)",
            example:
              "I would like to learn more about volunteer opportunities at AVFY.",
          },
        },
      },

      ContactResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          message: {
            type: "string",
            example:
              "Your message has been received. We'll respond within 24 hours.",
          },
          inquiryId: {
            type: "string",
            description: "Unique ID for the inquiry",
          },
        },
      },

      // ── Admission ──────────────────────────────────────────────
      AdmissionSubmission: {
        type: "object",
        required: ["name", "email", "program", "message"],
        properties: {
          name: {
            type: "string",
            description: "Full name of the applicant (1-200 characters)",
            example: "John Smith",
          },
          email: {
            type: "string",
            format: "email",
            description: "Applicant email address",
            example: "john@example.com",
          },
          phone: {
            type: "string",
            description: "Phone number (10-20 characters)",
            nullable: true,
            example: "502-555-0200",
          },
          program: {
            type: "string",
            description:
              "Program of interest (1-200 characters). Core programs: Surrender Program, MindBodySoul IOP, Housing & Shelter, Meetings & Groups, Food & Nutrition, Career Reentry",
            example: "Surrender Program",
          },
          message: {
            type: "string",
            description: "Applicant message (10-5000 characters)",
            example:
              "I am interested in the Surrender Program and would like to discuss admission options.",
          },
        },
      },

      AdmissionResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          message: {
            type: "string",
            example: "Inquiry submitted successfully",
          },
          inquiryId: {
            type: "string",
            description: "Unique ID for the admission inquiry",
          },
        },
      },

      // ── Newsletter ─────────────────────────────────────────────
      NewsletterSubscribeRequest: {
        type: "object",
        required: ["email"],
        properties: {
          email: {
            type: "string",
            format: "email",
            description: "Email address to subscribe",
            example: "reader@example.com",
          },
          company: {
            type: "string",
            description:
              "Honeypot field for spam protection. Must be empty or absent.",
            example: "",
          },
        },
      },

      NewsletterSubscribeResponse: {
        type: "object",
        properties: {
          message: {
            type: "string",
            example: "Successfully subscribed to newsletter",
          },
          subscribed: { type: "boolean", example: true },
        },
      },

      Newsletter: {
        type: "object",
        properties: {
          id: { type: "string" },
          title: { type: "string", example: "Spring 2024 Recovery Update" },
          slug: { type: "string", example: "spring-2024-recovery-update" },
          excerpt: {
            type: "string",
            nullable: true,
            example: "Updates on our programs and community impact...",
          },
          content: { type: "string", description: "Full HTML content" },
          imageUrl: { type: "string", nullable: true },
          status: { type: "string", enum: ["PUBLISHED"] },
          publishedAt: {
            type: "string",
            format: "date-time",
            nullable: true,
          },
          createdAt: { type: "string", format: "date-time" },
          author: { $ref: "#/components/schemas/AuthorSummary" },
        },
      },

      // ── Donation ───────────────────────────────────────────────
      DonationRequest: {
        type: "object",
        required: ["amount", "email", "name", "frequency"],
        properties: {
          amount: {
            type: "integer",
            minimum: 100,
            maximum: 100000000,
            description: "Donation amount in cents (e.g. 5000 = $50.00)",
            example: 5000,
          },
          email: {
            type: "string",
            format: "email",
            description: "Donor email for receipt",
            example: "donor@example.com",
          },
          name: {
            type: "string",
            description: "Donor name (1-200 characters)",
            example: "Generous Donor",
          },
          frequency: {
            type: "string",
            enum: ["ONE_TIME", "MONTHLY", "YEARLY"],
            description: "Donation frequency",
            example: "ONE_TIME",
          },
        },
      },

      DonationResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          url: {
            type: "string",
            format: "uri",
            description: "Square checkout URL to complete payment",
            example: "https://checkout.squareup.com/...",
          },
          donationId: {
            type: "string",
            description: "Internal donation record ID",
          },
          isRecurring: {
            type: "boolean",
            description: "Whether this is a recurring donation",
            example: false,
          },
        },
      },

      // ── Blog ───────────────────────────────────────────────────
      BlogPost: {
        type: "object",
        properties: {
          id: { type: "string" },
          title: {
            type: "string",
            example: "Recovery Stories: Finding Hope in Community",
          },
          slug: { type: "string", example: "recovery-stories-finding-hope" },
          content: { type: "string", description: "Full post content" },
          excerpt: {
            type: "string",
            nullable: true,
            example: "Inspiring stories from our community members...",
          },
          status: {
            type: "string",
            enum: ["DRAFT", "PUBLISHED"],
            example: "PUBLISHED",
          },
          category: { type: "string", nullable: true, example: "Recovery" },
          tags: {
            type: "string",
            nullable: true,
            description: "JSON-stringified array of tags",
          },
          imageUrl: { type: "string", nullable: true },
          readTimeMinutes: {
            type: "integer",
            description: "Estimated read time in minutes",
            example: 5,
          },
          views: { type: "integer", example: 42 },
          publishedAt: {
            type: "string",
            format: "date-time",
            nullable: true,
          },
          author: { $ref: "#/components/schemas/AuthorSummary" },
        },
      },

      // ── Auth ───────────────────────────────────────────────────
      SignupRequest: {
        type: "object",
        required: ["email", "name", "password"],
        properties: {
          email: {
            type: "string",
            format: "email",
            description: "Account email address",
            example: "newuser@example.com",
          },
          name: {
            type: "string",
            description: "User display name (max 100 characters)",
            example: "Alex Johnson",
          },
          password: {
            type: "string",
            format: "password",
            description:
              "Password (min 8 chars, must include 1 number and 1 special character)",
            example: "SecureP@ss1",
          },
        },
      },

      SignupResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          message: {
            type: "string",
            example: "Account created successfully",
          },
          user: {
            type: "object",
            properties: {
              id: { type: "string" },
              email: { type: "string", format: "email" },
              name: { type: "string" },
            },
          },
        },
      },

      // ── Meetings ───────────────────────────────────────────────
      Meeting: {
        type: "object",
        properties: {
          id: { type: "string" },
          title: {
            type: "string",
            example: "MindBodySoul IOP Group Session",
          },
          description: { type: "string" },
          startDate: { type: "string", format: "date-time" },
          endDate: { type: "string", format: "date-time" },
          format: {
            type: "string",
            enum: ["ONLINE", "IN_PERSON"],
            example: "IN_PERSON",
          },
          location: {
            type: "string",
            nullable: true,
            example: "1675 Story Ave, Louisville, KY 40206",
          },
          link: {
            type: "string",
            nullable: true,
            description: "Meeting URL for online meetings",
          },
          capacity: { type: "integer", nullable: true, example: 30 },
          rsvpCount: {
            type: "integer",
            description: "Number of RSVPs for this meeting",
            example: 12,
          },
          userRsvpStatus: {
            type: "string",
            nullable: true,
            description:
              "Current user RSVP status (only present if authenticated)",
          },
          program: { $ref: "#/components/schemas/ProgramSummary" },
        },
      },

      ProgramSummary: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string", example: "MindBodySoul IOP" },
          slug: { type: "string", example: "mindbodysoul-iop" },
          description: { type: "string" },
          programType: { type: "string", example: "IOP" },
        },
      },

      // ── Team ───────────────────────────────────────────────────
      TeamMember: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string", example: "Dr. Sarah Williams" },
          title: {
            type: "string",
            example: "Director of Clinical Services",
          },
          role: { type: "string", example: "leadership" },
          bio: { type: "string", nullable: true },
          credentials: { type: "string", nullable: true, example: "LCSW, CADC" },
          email: {
            type: "string",
            format: "email",
            nullable: true,
          },
          imageUrl: { type: "string", nullable: true },
        },
      },

      // ── Public / Impact ────────────────────────────────────────
      ImpactMetrics: {
        type: "object",
        properties: {
          totalMeetings: {
            type: "integer",
            description: "Total number of meetings/sessions held",
            example: 156,
          },
          totalRSVPs: {
            type: "integer",
            description: "Total RSVPs across all meetings",
            example: 1248,
          },
          totalDonations: {
            type: "integer",
            description: "Total donations received in dollars",
            example: 45000,
          },
          livesImpacted: {
            type: "integer",
            description: "Estimated lives impacted",
            example: 1300,
          },
        },
      },

      SocialStats: {
        type: "object",
        description:
          "Social media statistics keyed by platform name",
        additionalProperties: {
          $ref: "#/components/schemas/SocialPlatformStats",
        },
        properties: {
          facebook: { $ref: "#/components/schemas/SocialPlatformStats" },
          instagram: { $ref: "#/components/schemas/SocialPlatformStats" },
          linkedin: { $ref: "#/components/schemas/SocialPlatformStats" },
          tiktok: { $ref: "#/components/schemas/SocialPlatformStats" },
        },
      },

      SocialPlatformStats: {
        type: "object",
        properties: {
          followers: { type: "integer", example: 869 },
          handle: {
            type: "string",
            nullable: true,
            example: "@AVisionForYouRecovery",
          },
          url: {
            type: "string",
            nullable: true,
            example: "https://www.facebook.com/avisionforyourecovery",
          },
        },
      },

      // ── DUI Classes ────────────────────────────────────────────
      DUIClass: {
        type: "object",
        properties: {
          id: { type: "string" },
          title: { type: "string", example: "DUI Education Class - March 2024" },
          description: { type: "string", nullable: true },
          date: { type: "string", format: "date-time" },
          duration: {
            type: "integer",
            description: "Duration in minutes",
            example: 480,
          },
          price: {
            type: "integer",
            description: "Price in cents",
            example: 15000,
          },
          capacity: { type: "integer", example: 25 },
          active: { type: "boolean", example: true },
          _count: {
            type: "object",
            properties: {
              registrations: { type: "integer", example: 12 },
            },
          },
        },
      },

      DUIRegistrationRequest: {
        type: "object",
        required: ["classId", "firstName", "lastName", "email"],
        properties: {
          classId: {
            type: "string",
            description: "ID of the DUI class to register for",
          },
          firstName: {
            type: "string",
            description: "Registrant first name",
            example: "John",
          },
          lastName: {
            type: "string",
            description: "Registrant last name",
            example: "Doe",
          },
          email: {
            type: "string",
            format: "email",
            description: "Registrant email address",
            example: "john.doe@example.com",
          },
          phone: {
            type: "string",
            nullable: true,
            description: "Registrant phone number",
            example: "502-555-0300",
          },
        },
      },

      DUIRegistrationResponse: {
        type: "object",
        properties: {
          registrationId: {
            type: "string",
            description: "Internal registration ID",
          },
          paymentUrl: {
            type: "string",
            format: "uri",
            description: "Square checkout URL for payment",
            example: "https://checkout.squareup.com/...",
          },
        },
      },

      // ── Shared / Reusable ──────────────────────────────────────
      AuthorSummary: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string", nullable: true },
          email: { type: "string", format: "email" },
        },
      },

      ErrorResponse: {
        type: "object",
        properties: {
          error: { type: "string", description: "Human-readable error message" },
          code: {
            type: "string",
            description: "Machine-readable error code",
          },
          success: { type: "boolean", example: false },
        },
      },

      ValidationError: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          error: { type: "string", example: "Invalid contact data" },
          code: { type: "string", example: "VALIDATION_ERROR" },
          details: {
            type: "array",
            items: { type: "string" },
            description: "List of field-level validation error messages",
            example: "email: Invalid email" as string,
          },
        },
      },

      RateLimitError: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          error: {
            type: "string",
            example: "Too many submissions. Please try again later.",
          },
          code: { type: "string", example: "RATE_LIMIT_EXCEEDED" },
        },
      },
    },
  },
};
