# Quick Start Guide - Frontend-Backend Integration

## What Was Done

✅ **Complete Frontend-Backend Integration** without changing the UI
✅ **Real API Connections** - All data now comes from backend
✅ **Authentication Flow** - Real login with JWT tokens
✅ **Error Handling** - Loading states and error messages
✅ **Role-Based Access** - Super Admin, Enterprise Admin, DCA User roles

---

## How to Run

### Step 1: Start the Backend
```bash
cd backend
python -m uvicorn app.main:run --reload --port 8000
```

Backend will be available at: `http://localhost:8000`

### Step 2: Start the Frontend
```bash
cd frontend/rinexor-landing
npm run dev
```

Frontend will be available at: `http://localhost:5173`

### Step 3: Test the Integration

1. **Open Frontend**: http://localhost:5173
2. **Go to Login**: Click role selection
3. **Select Role**: Choose Super Admin, Enterprise Admin, or DCA User
4. **Login with Demo Credentials**:
   - **Super Admin**: `admin@rinexor.com` / `admin123`
   - **Enterprise Admin**: `enterprise@demo.com` / `enterprise123`
   - **DCA User**: `dca@demo.com` / `dca123`

5. **See Real Data**: Dashboard shows data from backend API

---

## API Client Usage in Components

### Import the API Client
```typescript
import { apiClient } from '../../services/apiClient';
```

### Fetch Cases
```typescript
const cases = await apiClient.getCases();
const filteredCases = await apiClient.getCases({
  enterprise_id: 'ent-001',
  status: 'pending',
  limit: 50
});
```

### Fetch KPIs
```typescript
const kpis = await apiClient.getKPIs();
console.log(kpis.total_cases, kpis.overall_recovery_rate);
```

### Fetch DCAs
```typescript
const dcas = await apiClient.getDCAs();
dcas.forEach(dca => {
  console.log(dca.name, dca.performance_score);
});
```

### Update a Case
```typescript
const updated = await apiClient.updateCase('case-123', {
  status: 'resolved',
  remarks: 'Case settled with customer'
});
```

### Login
```typescript
const { access_token } = await apiClient.login({
  email: 'user@example.com',
  password: 'password123'
});
```

---

## Files Modified

### New Files
- ✨ `src/services/apiClient.ts` - Complete API client

### Updated Files
- 🔧 `src/context/AuthContext.tsx` - Backend authentication
- 🔧 `src/pages/auth/Login.tsx` - Real login flow
- 🔧 `src/pages/dashboard/Cases.tsx` - Real case data
- 🔧 `src/pages/dashboard/Overview.tsx` - Real KPI data
- 🔧 `src/pages/dashboard/Agencies.tsx` - Real DCA data

---

## Key Features Implemented

### 1. Authentication
- ✅ Login with email/password
- ✅ JWT token management
- ✅ Auto-logout on auth failure
- ✅ Token persistence

### 2. Cases Dashboard
- ✅ Real case data from backend
- ✅ SLA deadline calculation
- ✅ Priority scoring
- ✅ Status filtering
- ✅ Role-based case visibility

### 3. Overview Dashboard
- ✅ Real KPIs from backend
- ✅ Total cases count
- ✅ Recovery rate
- ✅ SLA breach metrics
- ✅ Top performing agencies

### 4. Agencies Dashboard
- ✅ Real DCA performance data
- ✅ Recovery rates
- ✅ SLA compliance
- ✅ Active case counts
- ✅ Resolution time metrics

---

## Backend API Endpoints

All endpoints are automatically called by the frontend:

```
POST   /api/auth/login
GET    /api/cases
GET    /api/cases/{case_id}
PUT    /api/cases/{case_id}
GET    /api/dashboard/kpi
GET    /api/dcas
GET    /api/dcas/{dca_id}
GET    /api/dashboard/enterprises
GET    /api/audit
POST   /api/cases/upload
POST   /api/cases/upload-csv
```

---

## Demo Data

The backend includes demo data:

### Demo Users
- `admin@rinexor.com` - Super Admin
- `enterprise@demo.com` - Enterprise Admin  
- `dca@demo.com` - DCA User

### Demo Enterprises
- First National Bank (ent-001)
- Credit Union Plus (ent-002)
- Metro Financial (ent-003)

### Demo DCAs
- Recovery Solutions Inc (dca-001)
- Debt Masters LLC (dca-002)
- Collection Experts (dca-003)
- Professional Recovery (dca-004)
- Prime Recovery Partners (dca-005)
- Assured Collections Group (dca-006)
- Swift Debt Resolution (dca-007)

### Demo Cases
- 50 randomly generated demo cases
- Various statuses: pending, in_progress, contacted, resolved, failed
- Different priorities and SLA deadlines
- Assigned to different DCAs

---

## Troubleshooting

### API Connection Error
**Problem**: "Failed to fetch cases" or API unreachable
**Solution**: 
1. Ensure backend is running on port 8000
2. Check CORS is enabled (should be by default)
3. Check browser console for network errors

### Authentication Error
**Problem**: "Authentication failed" or "Invalid credentials"
**Solution**:
1. Use exact demo credentials from above
2. Check backend auth.py for DEMO_USERS
3. Ensure token is being saved to localStorage

### No Data Showing
**Problem**: Dashboard loads but tables are empty
**Solution**:
1. Check backend's DEMO_CASES generation
2. Verify API endpoint responses in browser Network tab
3. Check role-based filtering rules

### CORS Error
**Problem**: CORS policy errors in console
**Solution**:
1. Verify CORSMiddleware is enabled in backend main.py
2. Check allowed origins include localhost:5173
3. Restart backend after config changes

---

## Environment Variables

### Frontend (.env or .env.local)
```
VITE_API_URL=http://localhost:8000/api
```

### Backend (.env)
```
DATABASE_URL=sqlite:///./test.db
SECRET_KEY=your-secret-key-here
DEBUG=true
```

---

## Component Architecture

```
App
├── AuthContext (Authentication & user state)
│   └── AuthProvider
├── Routes
│   ├── Login (uses apiClient.login)
│   └── Dashboard
│       ├── Overview (uses apiClient.getKPIs, apiClient.getDCAs)
│       ├── Cases (uses apiClient.getCases, apiClient.getCase)
│       ├── Agencies (uses apiClient.getDCAs)
│       └── ...other pages
```

---

## Data Flow

```
User Login
    ↓
AuthContext.loginWithCredentials()
    ↓
apiClient.login(email, password)
    ↓
POST /api/auth/login
    ↓
Backend validates → Returns JWT token
    ↓
Token stored in localStorage
    ↓
Redirect to Dashboard
    ↓
Components fetch data with Bearer token
    ↓
apiClient.getCases(), apiClient.getKPIs(), etc.
    ↓
Backend filters by user role
    ↓
Data displayed in UI
```

---

## Success Indicators

✅ You've successfully integrated the frontend and backend if:

1. ✅ Login works with demo credentials
2. ✅ Dashboard shows real data (not mock data)
3. ✅ Cases table shows actual case IDs from backend
4. ✅ Overview KPI cards show real numbers
5. ✅ Agencies list shows real DCA data
6. ✅ Switching roles shows different data
7. ✅ Loading states appear during data fetch
8. ✅ Error messages show if API fails
9. ✅ Logout clears token and redirects to home

---

## Next Steps

1. **Development**: Start building additional features
2. **Testing**: Write integration tests for API calls
3. **Deployment**: Configure production API URL
4. **Performance**: Add caching with React Query
5. **Real-time**: Implement WebSocket for live updates

---

## Support

For detailed documentation, see: `INTEGRATION_SUMMARY.md`

For backend API docs, visit: `http://localhost:8000/docs`

---

**Integration Complete! 🎉**

Frontend is now fully connected to the backend without any UI changes.
