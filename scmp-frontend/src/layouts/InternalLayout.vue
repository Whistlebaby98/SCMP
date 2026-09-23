<template>
  <div class="h-screen w-full overflow-hidden flex flex-col md:flex-row bg-slate-50 text-slate-800">
    <!-- Desktop Sidebar (Hidden on mobile) -->
    <aside class="hidden md:flex w-64 bg-slate-900 text-white flex-col justify-between border-r border-slate-800 shrink-0">
      <div>
        <!-- Brand Logo Header -->
        <div class="h-16 flex items-center px-5 gap-3 border-b border-slate-800/80 bg-gradient-to-r from-slate-950 to-slate-900">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center font-extrabold text-white text-base shadow-lg shadow-indigo-500/20">
            SC
          </div>
          <div>
            <div class="font-bold text-sm tracking-wide text-white flex items-center gap-1.5">
              SCMP 服务合作
              <span class="text-[10px] px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-300 font-mono">v2.0</span>
            </div>
            <div class="text-[11px] text-slate-400">内部运营管理平台</div>
          </div>
        </div>

        <!-- Menu Navigation -->
        <nav class="p-3 space-y-1">
          <router-link
            v-for="item in navItems"
            :key="item.path"
            :to="item.path"
            class="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 group"
            :class="isActive(item.path) 
              ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-md shadow-brand-500/20 font-semibold' 
              : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'"
          >
            <div class="flex items-center gap-3">
              <el-icon class="text-base" :class="isActive(item.path) ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'">
                <component :is="item.icon" />
              </el-icon>
              <span>{{ item.label }}</span>
            </div>
            <span v-if="item.badge" class="px-2 py-0.5 rounded-full text-[10px] font-bold" :class="item.badgeClass">
              {{ item.badge }}
            </span>
          </router-link>
        </nav>
      </div>

      <!-- Bottom User Card -->
      <div class="p-3 m-3 rounded-xl bg-slate-800/50 border border-slate-700/60 backdrop-blur-sm">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-blue-500 flex items-center justify-center text-white font-bold text-xs shadow-inner">
              {{ store.currentUser.realName.slice(0, 1) }}
            </div>
            <div class="text-xs">
              <div class="font-semibold text-slate-200 truncate w-24">{{ store.currentUser.realName }}</div>
              <div class="text-[10px] text-brand-300 font-mono">{{ store.currentUser.roleCode }}</div>
            </div>
          </div>
          <button 
            @click="switchRoleDialog = true" 
            class="text-[11px] px-2 py-1 rounded-md bg-slate-700/60 hover:bg-slate-700 text-brand-300 hover:text-white transition-colors"
          >
            切换身份
          </button>
        </div>
      </div>
    </aside>

    <!-- Mobile Top Navigation Bar (Shown only on mobile) -->
    <header class="md:hidden h-14 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between shrink-0 z-20">
      <div class="flex items-center gap-2.5">
        <button 
          @click="mobileDrawer = true" 
          class="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-200 hover:bg-slate-700"
        >
          <el-icon><Menu /></el-icon>
        </button>
        <div class="font-bold text-sm text-white flex items-center gap-1.5">
          <span class="w-6 h-6 rounded bg-brand-600 flex items-center justify-center text-xs font-bold">SC</span>
          SCMP 内部管理
        </div>
      </div>

      <div class="flex items-center gap-2">
        <button 
          @click="goToVendorPortal" 
          class="text-xs px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-medium shadow-sm flex items-center gap-1"
        >
          <span>👷 服务商端</span>
        </button>
        <button 
          @click="switchRoleDialog = true" 
          class="w-7 h-7 rounded-full bg-brand-600 text-white font-bold text-xs flex items-center justify-center shadow-sm"
        >
          {{ store.currentUser.realName.slice(0, 1) }}
        </button>
      </div>
    </header>

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <!-- Desktop Top Header Bar (Hidden on mobile) -->
      <header class="hidden md:flex h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-6 items-center justify-between shadow-xs shrink-0 z-10">
        <div class="flex items-center gap-3">
          <span class="text-xs text-slate-400 font-medium">当前工作空间：</span>
          <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 border border-brand-200/60 text-brand-700 font-semibold text-xs shadow-xs">
            <span>🏢</span> 内部运营管理门户
          </div>
          <span class="text-xs text-slate-400">| 预算硬上限管控 · 资质持证派单 · 完工扣款锁额</span>
        </div>

        <div class="flex items-center gap-3">
          <!-- Switch Portal Button -->
          <button 
            @click="goToVendorPortal" 
            class="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300 transition-all flex items-center gap-1.5 shadow-xs"
          >
            <span>👷</span> 切换至服务商协同端
          </button>

          <!-- Quick Identity Switcher -->
          <el-dropdown @command="selectRole">
            <button class="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-2 shadow-xs transition-all">
              <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
              {{ store.currentUser.realName }}
              <el-icon class="text-slate-400 text-xs"><ArrowDown /></el-icon>
            </button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="ROLE_PM">张经理 (项目经理 PM)</el-dropdown-item>
                <el-dropdown-item command="ROLE_AUDITOR">李主管 (审核管理人员)</el-dropdown-item>
                <el-dropdown-item command="ROLE_ADMIN">系统管理员</el-dropdown-item>
                <el-dropdown-item divided command="ROLE_VND_LIAISON">周建国 (服务商接口负责人)</el-dropdown-item>
                <el-dropdown-item command="ROLE_ENG">陈明 (服务商工程师)</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </header>

      <!-- Main Body Content (Smooth Scroll, Mobile Padded) -->
      <main class="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6">
        <router-view />
      </main>

      <!-- Mobile Bottom Navigation Bar (Thumb friendly) -->
      <nav class="md:hidden fixed bottom-0 left-0 right-0 h-14 bg-white/95 backdrop-blur-md border-t border-slate-200 flex items-center justify-around z-30 shadow-lg px-2">
        <router-link
          v-for="item in mobileBottomItems"
          :key="item.path"
          :to="item.path"
          class="flex flex-col items-center justify-center flex-1 py-1 text-slate-400 transition-colors"
          :class="isActive(item.path) ? 'text-brand-600 font-bold' : 'hover:text-slate-600'"
        >
          <el-icon class="text-lg"><component :is="item.icon" /></el-icon>
          <span class="text-[10px] mt-0.5">{{ item.shortLabel }}</span>
        </router-link>
      </nav>
    </div>

    <!-- Mobile Navigation Drawer -->
    <el-drawer v-model="mobileDrawer" title="导航菜单" direction="ltr" size="260px" :with-header="false">
      <div class="h-full flex flex-col justify-between bg-slate-900 text-white p-4 -m-5">
        <div class="space-y-4">
          <div class="flex items-center gap-2.5 pb-4 border-b border-slate-800">
            <div class="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center font-bold text-white text-xs">
              SC
            </div>
            <div>
              <div class="font-bold text-sm text-white">SCMP 服务合作</div>
              <div class="text-[10px] text-slate-400">内部管理门户</div>
            </div>
          </div>

          <div class="space-y-1">
            <router-link
              v-for="item in navItems"
              :key="item.path"
              :to="item.path"
              @click="mobileDrawer = false"
              class="flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium"
              :class="isActive(item.path) ? 'bg-brand-600 text-white font-semibold' : 'text-slate-400 hover:bg-slate-800'"
            >
              <div class="flex items-center gap-3">
                <el-icon><component :is="item.icon" /></el-icon>
                <span>{{ item.label }}</span>
              </div>
              <span v-if="item.badge" class="px-1.5 py-0.5 rounded-full text-[10px]" :class="item.badgeClass">
                {{ item.badge }}
              </span>
            </router-link>
          </div>
        </div>

        <div class="pt-4 border-t border-slate-800 space-y-2">
          <button 
            @click="goToVendorPortal" 
            class="w-full py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold flex items-center justify-center gap-1.5"
          >
            <span>👷 切换到服务商端</span>
          </button>
          <div class="text-[11px] text-slate-400 text-center">
            当前身份: {{ store.currentUser.realName }}
          </div>
        </div>
      </div>
    </el-drawer>

    <!-- Role Switch Dialog -->
    <el-dialog v-model="switchRoleDialog" title="切换模拟登录账号" width="440px">
      <div class="space-y-2.5">
        <p class="text-xs text-slate-500 mb-3">一键切换角色，立即体验多端权限与业务交互差异：</p>
        <div
          v-for="role in roles"
          :key="role.code"
          @click="selectRole(role.code)"
          class="p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-all"
          :class="store.currentUser.roleCode === role.code ? 'border-brand-500 bg-brand-50/70 font-semibold shadow-xs' : 'border-slate-200 hover:border-brand-400 hover:bg-slate-50'"
        >
          <div>
            <div class="text-xs font-bold text-slate-800">{{ role.name }}</div>
            <div class="text-[11px] text-slate-400 mt-0.5">{{ role.desc }}</div>
          </div>
          <el-tag size="small" :type="role.tagType">{{ role.portal }}</el-tag>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useScmpStore } from '@/store/scmpStore'
import { ElMessage } from 'element-plus'

const store = useScmpStore()
const route = useRoute()
const router = useRouter()

const mobileDrawer = ref(false)
const switchRoleDialog = ref(false)

function isActive(path: string) {
  return route.path === path || route.path.startsWith(path + '/')
}

const pendingDeliverablesCount = computed(() => 
  store.deliverables.filter(d => d.auditStatus === 'PENDING').length
)
const pendingSettlementsCount = computed(() => 
  store.settlements.filter(s => s.status === 'PENDING_APPROVAL').length
)

const navItems = computed(() => [
  { path: '/internal/dashboard', label: '数据驾驶舱', icon: 'DataAnalysis' },
  { path: '/internal/projects', label: '项目与预算监控', icon: 'Folder' },
  { path: '/internal/dispatch/create', label: '资质核验派单', icon: 'EditPen' },
  { path: '/internal/work-orders', label: '工单综合管理', icon: 'Document' },
  { 
    path: '/internal/completion-audit', 
    label: '分批完工验收审核', 
    icon: 'CircleCheck', 
    badge: pendingDeliverablesCount.value > 0 ? pendingDeliverablesCount.value : null,
    badgeClass: 'bg-red-500 text-white'
  },
  { 
    path: '/internal/settlement-audit', 
    label: '报销审核与外部推单', 
    icon: 'Money', 
    badge: pendingSettlementsCount.value > 0 ? pendingSettlementsCount.value : null,
    badgeClass: 'bg-amber-500 text-white'
  },
  { path: '/internal/vendors', label: '服务商与资质核验', icon: 'OfficeBuilding' }
])

const mobileBottomItems = [
  { path: '/internal/dashboard', shortLabel: '驾驶舱', icon: 'DataAnalysis' },
  { path: '/internal/projects', shortLabel: '项目', icon: 'Folder' },
  { path: '/internal/dispatch/create', shortLabel: '派单', icon: 'EditPen' },
  { path: '/internal/work-orders', shortLabel: '工单', icon: 'Document' },
  { path: '/internal/completion-audit', shortLabel: '审核', icon: 'CircleCheck' },
]

const roles = [
  { code: 'ROLE_PM', name: '张经理 (项目经理 PM)', desc: '预算红线控制、资质拦截派单、在途调价', portal: '内部端', tagType: 'primary' },
  { code: 'ROLE_AUDITOR', name: '李主管 (审核管理)', desc: '派单审批、完工验收核减扣款、报销初审推单', portal: '内部端', tagType: 'warning' },
  { code: 'ROLE_ADMIN', name: '系统管理员', desc: '服务商准入、证书审核、对公银行账户维护', portal: '内部端', tagType: 'info' },
  { code: 'ROLE_VND_LIAISON', name: '周建国 (服务商接口负责人)', desc: '工程师证书维护、完工批次合并开大票报销', portal: '服务商端', tagType: 'success' },
  { code: 'ROLE_ENG', name: '陈明 (服务商工程师)', desc: '现场查收接单、分批完工提报与客户签字单上传', portal: '服务商端', tagType: 'success' },
]

function selectRole(roleCode: any) {
  store.switchUser(roleCode)
  switchRoleDialog.value = false
  mobileDrawer.value = false
  ElMessage.success(`已切换模拟身份为: ${store.currentUser.realName}`)
  
  if (store.currentUser.userType === 'VENDOR') {
    router.push('/vendor/dashboard')
  } else {
    router.push('/internal/dashboard')
  }
}

function goToVendorPortal() {
  if (store.currentUser.userType !== 'VENDOR') {
    store.switchUser('ROLE_VND_LIAISON')
  }
  router.push('/vendor/dashboard')
}
</script>
