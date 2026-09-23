import { createRouter, createWebHistory } from 'vue-router'
import InternalLayout from '@/layouts/InternalLayout.vue'
import VendorLayout from '@/layouts/VendorLayout.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/internal/dashboard'
    },
    // Internal Operations Portal
    {
      path: '/internal',
      component: InternalLayout,
      children: [
        {
          path: '',
          redirect: '/internal/dashboard'
        },
        {
          path: 'dashboard',
          name: 'InternalDashboard',
          component: () => import('@/views/internal/DashboardView.vue')
        },
        {
          path: 'projects',
          name: 'ProjectList',
          component: () => import('@/views/internal/ProjectListView.vue')
        },
        {
          path: 'dispatch/create',
          name: 'DispatchCreate',
          component: () => import('@/views/internal/DispatchCreateView.vue')
        },
        {
          path: 'work-orders',
          name: 'WorkOrderList',
          component: () => import('@/views/internal/WorkOrderListView.vue')
        },
        {
          path: 'completion-audit',
          name: 'CompletionAudit',
          component: () => import('@/views/internal/CompletionAuditView.vue')
        },
        {
          path: 'settlement-audit',
          name: 'SettlementAudit',
          component: () => import('@/views/internal/SettlementAuditView.vue')
        },
        {
          path: 'vendors',
          name: 'VendorMgmt',
          component: () => import('@/views/internal/VendorMgmtView.vue')
        }
      ]
    },
    // Vendor Collaboration Portal
    {
      path: '/vendor',
      component: VendorLayout,
      children: [
        {
          path: '',
          redirect: '/vendor/dashboard'
        },
        {
          path: 'dashboard',
          name: 'VendorDashboard',
          component: () => import('@/views/vendor/VendorDashboardView.vue')
        },
        {
          path: 'tasks',
          name: 'VendorTasks',
          component: () => import('@/views/vendor/TaskAcceptView.vue')
        },
        {
          path: 'my-work',
          name: 'VendorMyWork',
          component: () => import('@/views/vendor/MyWorkOrdersView.vue')
        },
        {
          path: 'reimbursement',
          name: 'VendorReimbursement',
          component: () => import('@/views/vendor/LiaisonSettlementView.vue')
        },
        {
          path: 'engineers',
          name: 'VendorEngineers',
          component: () => import('@/views/vendor/EngineerTeamView.vue')
        },
        {
          path: 'orders',
          name: 'VendorOrders',
          component: () => import('@/views/vendor/CompanyOrdersView.vue')
        }
      ]
    }
  ]
})

export default router
