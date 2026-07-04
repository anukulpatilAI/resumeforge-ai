# Credentials & Access Reference

## Admin User (Seeded)
| Field | Value |
|-------|-------|
| Email | `anukul.patil.seo@gmail.com` |
| Password | `admin123` |
| Role | `ADMIN` |

## Auth Implementation (Sprint 2)
| Technology | Details |
|------------|---------|
| **Framework** | NestJS 11 + Passport.js |
| **Token Type** | JWT (access) + UUID (refresh) |
| **Hashing** | bcrypt, 12 salt rounds |
| **Access Token** | 15m expiry, sent via `Authorization: Bearer <token>` |
| **Refresh Token** | 7d expiry, stored in `refresh_tokens` table, rotated on use |
| **Frontend Storage** | `localStorage` key: `auth_tokens` |

## API Auth Endpoints
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/v1/auth/register` | No | Register new user |
| POST | `/api/v1/auth/login` | No | Login, returns tokens |
| POST | `/api/v1/auth/refresh` | No | Refresh access token |
| POST | `/api/v1/auth/logout` | No | Invalidate refresh token |
| GET | `/api/v1/auth/me` | Yes | Get current user profile |

## Database
| Service | Value |
|---------|-------|
| Engine | PostgreSQL 16 (Docker) |
| Host | `localhost:5432` |
| Database | `resumeforge` |
| User | `resumeforge` |
| Password | `resumeforge` |
| Connection String | `postgresql://resumeforge:resumeforge@localhost:5432/resumeforge?schema=public` |

## Environment Variables (`.env`)
| Variable | Value (dev) | Notes |
|----------|-------------|-------|
| `DATABASE_URL` | `postgresql://resumeforge:resumeforge@localhost:5432/resumeforge?schema=public` | Prisma connection |
| `JWT_SECRET` | `change-this-in-production-min-32-chars-long` | Change in production |
| `JWT_EXPIRATION` | `15m` | Access token lifetime |
| `JWT_REFRESH_EXPIRATION` | `7d` | Refresh token lifetime |
| `FRONTEND_URL` | `http://localhost:3000` | CORS origin |
| `NEXT_PUBLIC_API_URL` | `http://localhost:4000/api/v1` | Frontend API client URL |
| `PORT` | `4000` | API server port |

## Tech Stack (Monorepo)
| Layer | Technology |
|-------|-----------|
| Monorepo | TurboRepo 2 + pnpm 9 |
| Frontend | Next.js 15 (App Router), React 19, Tailwind CSS 4 |
| Backend | NestJS 11, TypeScript |
| Database | PostgreSQL 16, Prisma 6 ORM |
| Auth | JWT + Passport + bcrypt |
| State | Zustand 5 |
| API Client | Fetch (custom wrapper with auto-refresh) |
| Deployment | Vercel (frontend), Railway/Fly.io (backend), Neon (DB) |
