import { Navigate } from 'react-router-dom'
import type { RouteObject } from 'react-router-dom'
import { MainLayout } from '../layouts/MainLayout'
import { PatientsPage } from '../pages/PatientsPage'
import { PatientFormPage } from '../pages/PatientFormPage'
import { PatientDetailPage } from '../pages/PatientDetailPage'
import { FinancialPage } from '../pages/FinancialPage'
import { NotFoundPage } from '../pages/NotFoundPage'

export const routes: RouteObject[] = [
  {
    element: <MainLayout />,
    children: [
      { index: true, element: <Navigate to="/patients" replace /> },
      { path: 'patients', element: <PatientsPage /> },
      { path: 'patients/new', element: <PatientFormPage /> },
      { path: 'patients/:id', element: <PatientDetailPage /> },
      { path: 'patients/:id/edit', element: <PatientFormPage /> },
      { path: 'financial', element: <FinancialPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]
