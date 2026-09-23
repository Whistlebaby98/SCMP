<template>
  <div class="h-screen w-full overflow-hidden flex flex-col md:flex-row bg-slate-50 text-slate-800">
    <!-- Desktop Sidebar (Hidden on mobile) -->
    <aside class="hidden md:flex w-64 bg-emerald-950 text-white flex-col justify-between border-r border-emerald-900 shrink-0">
      <div>
        <!-- Brand Logo Header -->
        <div class="h-16 flex items-center px-5 gap-3 border-b border-emerald-900 bg-gradient-to-r from-emerald-950 to-emerald-900">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center font-extrabold text-white text-base shadow-lg shadow-emerald-500/20">
            SC
          </div>
          <div>
            <div class="font-bold text-sm tracking-wide text-white truncate w-36">
              {{ store.currentUser.vendorName || '服务商协同端' }}
            </div>
            <div class="text-[11px] text-emerald-300 font-mono">外部服务商协同中枢</div>
          </div>
        </div>

        <!-- Role Badge inside Sidebar -->
        <div class="m-3 p-3 rounded-xl bg-emerald-900/60 border border-emerald-800/80 backdrop-blur-sm text-xs space-y-1.5">
          <div class="flex items-center justify-between">
            <span class="text-emerald-300 font-semibold">服务商身份：</span>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold text-white shadow-xs" :class="isLiaison ? 'bg-amber-600' : 'bg-emerald-600'">
              {{ isLiaison ? '接口负责人' : '履约工程师' }}
            </span>
          </div>
          <p class="text-[11px] text-emerald-200/80 leading-snug">
            {{ isLiaison ? '负责对公合并开票报销与团队证书维护' : '负责现场接单干活与分批完工交付提报' }}
          </p>
        </div>

        <!-- Menu Navigation for Liaison -->
        <nav v-if="isLiaison" class="p-3 space-y-1">
          <router-link
            v-for="item in liaisonNavItems"
            :key="item.path"
            :to="item.path"
            class="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 group"
            :class="isActive(item.path) 
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/20 font-semibold' 
              : 'text-emerald-200/70 hover:text-white hover:bg-emerald-900/60'"
          >
            <div class="flex items-center gap-3">
              <el-icon class="text-base" :class="isActive(item.path) ? 'text-white' : 'text-emerald-300 group-hover:text-white'">
                <component :is="item.icon" />
              </el-icon>
              <span>{{ item.label }}</span>
            </div>
            <span v-if="item.badge" class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white">
              {{ item.badge }}
            </span>
          </router-link>
        </nav>

        <!-- Menu Navigation for Field Engineer -->
        <nav v-else class="p-3 space-y-1">
          <router-link
            v-for="item in engineerNavItems"
            :key="item.path"
            :to="item.path"
            class="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 group"
            :class="isActive(item.path) 
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/20 font-semibold' 
              : 'text-emerald-200/70 hover:text-white hover:bg-emerald-900/60'"
          >
            <div class="flex items-center gap-3">
              <el-icon class="text-base" :class="isActive(item.path) ? 'text-white' : 'text-emerald-300 group-hover:text-white'">
                <component :is="item.icon" />
              </el-icon>
              <span>{{ item.label }}</span>
            </div>
            <span v-if="item.badge" class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500 text-white">
              {{ item.badge }}
            </span>
          </router-link>
        </nav>
      </div>

      <!-- Quick Switch Between Liaison & Engineer in Vendor side -->
      <div class="p-3 m-3 rounded-xl bg-emerald-900/50 border border-emerald-800/60 text-xs">
        <div class="text-[11px] text-emerald-300 mb-2 font-medium">快速切换服务商人员：</div>
        <div class="grid grid-cols-2 gap-1.5">
          <button
            @click="switchVendorSubRole('ROLE_VND_LIAISON')"
            class="py-1.5 px-2 rounded-lg text-center font-semibold text-[11px] transition-all"
            :class="isLiaison ? 'bg-emerald-500 text-white shadow-sm' : 'bg-emerald-900/80 text-emerald-200 hover:bg-emerald-800'"
          >
            接口负责人
          </button>
          <button
            @click="switchVendorSubRole('ROLE_ENG')"
            class="py-1.5 px-2 rounded-lg text-center font-semibold text-[11px] transition-all"
            :class="!isLiaison ? 'bg-emerald-500 text-white shadow-sm' : 'bg-emerald-900/80 text-emerald-200 hover:bg-emerald-800'"
          >
            陈明 (工程师)
          </button>
        </div>
      </div>
    </aside>

    <!-- Mobile Top Navigation Bar -->
    <header class="md:hidden h-14 bg-emerald-950 border-b border-emerald-900 px-4 flex items-center justify-between shrink-0 z-20">
      <div class="flex items-center gap-2.5">
        <button 
          @click="mobileDrawer = true" 
          class="w-8 h-8 rounded-lg bg-emerald-900 flex items-center justify-center text-emerald-200 hover:bg-emerald-800"
        >
          <el-icon><Menu /></el-icon>
        </button>
        <div class="font-bold text-sm text-white flex items-center gap-1.5">
          <span class="w-6 h-6 rounded bg-emerald-600 flex items-center justify-center text-xs font-bold">SC</span>
          服务商协同端
        </div>
      </div>

      <div class="flex items-center gap-2">
        <button 
          @click="goToInternalPortal" 
          class="text-xs px-2.5 py-1 rounded-lg bg-brand-600 text-white font-medium shadow-sm flex items-center gap-1"
        >
          <span>🏢 内部管理端</span>
        </button>
        <button 
          @click="switchVendorSubRole(isLiaison ? 'ROLE_ENG' : 'ROLE_VND_LIAISON')" 
          class="text-[11px] px-2 py-1 rounded-lg bg-emerald-800 text-emerald-200 font-medium"
        >
          {{ isLiaison ? '切换工程师' : '切换负责人' }}
        </button>
      </div>
    </header>

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <!-- Desktop Top Header Bar (Hidden on mobile) -->
      <header class="hidden md:flex h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-6 items-center justify-between shadow-xs shrink-0 z-10">
        <div class="flex items-center gap-3">
          <span class="text-xs text-slate-400 font-medium">当前工作空间：</span>
          <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-800 font-semibold text-xs shadow-xs">
            <span>👷</span> 服务商外部协同门户 (华创智能)
          </div>
          <span class="text-xs text-slate-400">| 接口人开大票报销 · 工程师分批完工提报</span>
        </div>

        <div class="flex items-center gap-3">
          <button 
            @click="goToInternalPortal" 
            class="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200 hover:bg-brand-100 hover:border-brand-300 transition-all flex items-center gap-1.5 shadow-xs"
          >
            <span>🏢</span> 切换回内部管理门户
          </button>
          
          <div class="text-xs font-medium text-slate-600 px-3 py-1 bg-slate-100 rounded-lg">
            登录人员: <strong class="text-emerald-700">{{ store.currentUser.realName }}</strong>
          </div>
        </div>
      </header>

      <!-- Main Body Content -->
      <main class="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6">
        <router-view />
      </main>

      <!-- Mobile Bottom Navigation Bar -->
      <nav class="md:hidden fixed bottom-0 left-0 right-0 h-14 bg-white/95 backdrop-blur-md border-t border-slate-200 flex items-center justify-around z-30 shadow-lg px-2">
        <template v-if="isLiaison">
          <router-link
            v-for="item in mobileLiaisonBottomItems"
            :key="item.path"
            :to="item.path"
            class="flex flex-col items-center justify-center flex-1 py-1 text-slate-400 transition-colors"
            :class="isActive(item.path) ? 'text-emerald-600 font-bold' : 'hover:text-slate-600'"
          >
            <el-icon class="text-lg"><component :is="item.icon" /></el-icon>
            <span class="text-[10px] mt-0.5">{{ item.shortLabel }}</span>
          </router-link>
        </template>
        <template v-else>
          <router-link
            v-for="item in mobileEngineerBottomItems"
            :key="item.path"
            :to="item.path"
            class="flex flex-col items-center justify-center flex-1 py-1 text-slate-400 transition-colors"
            :class="isActive(item.path) ? 'text-emerald-600 font-bold' : 'hover:text-slate-600'"
          >
            <el-icon class="text-lg"><component :is="item.icon" /></el-icon>
            <span class="text-[10px] mt-0.5">{{ item.shortLabel }}</span>
          </router-link>
        </template>
      </nav>
    </div>

    <!-- Mobile Drawer -->
    <el-drawer v-model="mobileDrawer" title="导航" direction="ltr" size="260px" :with-header="false">
      <div class="h-full flex flex-col justify-between bg-emerald-950 text-white p-4 -m-5">
        <div class="space-y-4">
          <div class="flex items-center gap-2.5 pb-4 border-b border-emerald-900">
            <div class="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center font-bold text-white text-xs">
              SC
            </div>
            <div>
              <div class="font-bold text-sm text-white">服务商协同端</div>
              <div class="text-[10px] text-emerald-300">{{ isLiaison ? '接口负责人工作台' : '工程师作业工作台' }}</div>
            </div>
          </div>

          <div class="space-y-1">
            <router-link
              v-for="item in (isLiaison ? liaisonNavItems : engineerNavItems)"
              :key="item.path"
              :to="item.path"
              @click="mobileDrawer = false"
              class="flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium"
              :class="isActive(item.path) ? 'bg-emerald-600 text-white font-semibold' : 'text-emerald-200/70 hover:bg-emerald-900'"
            >
              <div class="flex items-center gap-3">
                <el-icon><component :is="item.icon" /></el-icon>
                <span>{{ item.label }}</span>
              </div>
              <span v-if="item.badge" class="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-500 text-white">
                {{ item.badge }}
              </span>
            </router-link>
          </div>
        </div>

        <div class="pt-4 border-t border-emerald-900 space-y-2">
          <button 
            @click="goToInternalPortal" 
            class="w-full py-2 rounded-lg bg-brand-600 text-white text-xs font-semibold flex items-center justify-center gap-1.5"
          >
            <span>🏢 切换回内部管理端</span>
          </button>
        </div>
      </div>
    </el-drawer>
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

function isActive(path: string) {
  return route.path === path || route.path.startsWith(path + '/')
}

const isLiaison = computed(() => store.currentUser.roleCode === 'ROLE_VND_LIAISON')

const reimbursableCount = computed(() => 
  store.reimbursableDeliverables(store.currentUser.vendorId || 1).length
)

const pendingAcceptCount = computed(() => {
  const engId = store.currentUser.id === 5 ? 1 : 1
  return store.workOrders.filter(w => w.status === 'PENDING_ACCEPTANCE' && w.engineerId === engId).length
})

const liaisonNavItems = computed(() => [
  { path: '/vendor/dashboard', label: '服务商协同总览', icon: 'DataBoard' },
  { 
    path: '/vendor/reimbursement', 
    label: '合并开大票报销中心', 
    icon: 'WalletFilled',
    badge: reimbursableCount.value > 0 ? reimbursableCount.value : null
  },
  { path: '/vendor/engineers', label: '工程师团队与资质证书', icon: 'User' },
  { path: '/vendor/orders', label: '全公司承接工单监控', icon: 'DocumentCopy' },
])

const engineerNavItems = computed(() => [
  { 
    path: '/vendor/tasks', 
    label: '待承接任务大厅', 
    icon: 'Notification',
    badge: pendingAcceptCount.value > 0 ? pendingAcceptCount.value : null
  },
  { path: '/vendor/my-work', label: '在途作业与分批完工', icon: 'Tools' },
])

const mobileLiaisonBottomItems = [
  { path: '/vendor/dashboard', shortLabel: '总览', icon: 'DataBoard' },
  { path: '/vendor/reimbursement', shortLabel: '报销', icon: 'WalletFilled' },
  { path: '/vendor/engineers', shortLabel: '团队', icon: 'User' },
  { path: '/vendor/orders', shortLabel: '工单', icon: 'DocumentCopy' },
]

const mobileEngineerBottomItems = [
  { path: '/vendor/tasks', shortLabel: '接单', icon: 'Notification' },
  { path: '/vendor/my-work', shortLabel: '完工', icon: 'Tools' },
]

function switchVendorSubRole(roleCode: 'ROLE_VND_LIAISON' | 'ROLE_ENG') {
  store.switchUser(roleCode)
  mobileDrawer.value = false
  ElMessage.success(`已切换为：${store.currentUser.realName}`)
  if (roleCode === 'ROLE_VND_LIAISON') {
    router.push('/vendor/dashboard')
  } else {
    router.push('/vendor/tasks')
  }
}

function goToInternalPortal() {
  store.switchUser('ROLE_PM')
  router.push('/internal/dashboard')
}
</script>
