<template>
  <div class="space-y-6">
    <!-- Welcome Header Banner with Modern Gradient -->
    <div class="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-white shadow-lg border border-slate-800">
      <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="px-2 py-0.5 rounded-full bg-brand-500/30 text-brand-300 font-mono text-[11px] font-semibold border border-brand-400/30">
              OPERATIONS COCKPIT
            </span>
            <span class="text-xs text-slate-400">系统数据驾驶舱</span>
          </div>
          <h1 class="text-xl md:text-2xl font-black tracking-tight text-white">
            欢迎回来，{{ store.currentUser.realName }}
          </h1>
          <p class="text-xs text-slate-400 mt-1 max-w-xl">
            当前处于内部运营管理视角。项目总预算硬上限受控，服务商施工履约正常，请重点关注 <strong class="text-amber-400 font-mono">{{ totalPendingAudit }}</strong> 项待办审核。
          </p>
        </div>

        <div class="flex items-center gap-2">
          <button 
            @click="$router.push('/internal/dispatch/create')"
            class="px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-md shadow-brand-500/30 transition-all flex items-center gap-1.5"
          >
            <el-icon><Plus /></el-icon> 发起资质核验派单
          </button>
        </div>
      </div>
      <!-- Background subtle glow decoration -->
      <div class="absolute -right-12 -top-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
    </div>

    <!-- 4 Modern Stat Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- Card 1: Total Budget -->
      <div class="card-modern p-5 bg-gradient-to-br from-white to-blue-50/40 relative overflow-hidden">
        <div class="flex justify-between items-start">
          <div>
            <div class="text-xs font-semibold text-slate-500 uppercase tracking-wider">委外派单总预算</div>
            <div class="text-2xl font-black text-slate-900 font-mono mt-1">¥ {{ totalBudget.toLocaleString() }}</div>
          </div>
          <div class="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-lg shadow-xs">
            <el-icon><Money /></el-icon>
          </div>
        </div>
        <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <span class="text-slate-500">已派占用: <strong class="text-slate-800 font-mono">¥{{ usedBudget.toLocaleString() }}</strong></span>
          <span class="text-emerald-600 font-bold font-mono">余 ¥{{ (totalBudget - usedBudget).toLocaleString() }}</span>
        </div>
      </div>

      <!-- Card 2: Active Orders -->
      <div class="card-modern p-5 bg-gradient-to-br from-white to-indigo-50/40 relative overflow-hidden">
        <div class="flex justify-between items-start">
          <div>
            <div class="text-xs font-semibold text-slate-500 uppercase tracking-wider">运行中工单总数</div>
            <div class="text-2xl font-black text-indigo-700 font-mono mt-1">{{ store.workOrders.length }} <span class="text-sm font-normal text-slate-500">笔</span></div>
          </div>
          <div class="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-lg shadow-xs">
            <el-icon><Document /></el-icon>
          </div>
        </div>
        <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>施工中: <strong class="text-indigo-600 font-bold">{{ inProgressCount }}</strong> 笔</span>
          <span>待承接: <strong class="text-amber-600 font-bold">{{ pendingAcceptCount }}</strong> 笔</span>
        </div>
      </div>

      <!-- Card 3: Pending Audits -->
      <div class="card-modern p-5 bg-gradient-to-br from-white to-amber-50/40 relative overflow-hidden">
        <div class="flex justify-between items-start">
          <div>
            <div class="text-xs font-semibold text-slate-500 uppercase tracking-wider">待处理审核待办</div>
            <div class="text-2xl font-black text-amber-600 font-mono mt-1">{{ totalPendingAudit }} <span class="text-sm font-normal text-slate-500">件</span></div>
          </div>
          <div class="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-lg shadow-xs">
            <el-icon><Clock /></el-icon>
          </div>
        </div>
        <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>派单: {{ pendingDispatchCount }}</span>
          <span>完工验收: {{ pendingDeliverablesCount }}</span>
          <span>报销: {{ pendingSettlementCount }}</span>
        </div>
      </div>

      <!-- Card 4: Paid Out Amount -->
      <div class="card-modern p-5 bg-gradient-to-br from-white to-emerald-50/40 relative overflow-hidden">
        <div class="flex justify-between items-start">
          <div>
            <div class="text-xs font-semibold text-slate-500 uppercase tracking-wider">外部已打款结清</div>
            <div class="text-2xl font-black text-emerald-700 font-mono mt-1">¥ {{ totalPaidAmount.toLocaleString() }}</div>
          </div>
          <div class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg shadow-xs">
            <el-icon><CircleCheckFilled /></el-icon>
          </div>
        </div>
        <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>状态: <strong class="text-emerald-600">外部财务网银闭环</strong></span>
          <span class="text-slate-400">已到账</span>
        </div>
      </div>
    </div>

    <!-- Main Section: Budget Health and Action Matrix -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left: Projects Budget Health -->
      <div class="lg:col-span-2 card-modern p-5">
        <div class="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
          <div>
            <h2 class="font-bold text-sm text-slate-800 flex items-center gap-2">
              <span class="w-2 h-4 rounded-full bg-brand-600"></span>
              项目委外派单预算占用健康度 (硬上限红线控制)
            </h2>
            <p class="text-xs text-slate-400 mt-0.5">不可超预算派单；若需增加派单额度，必须走项目预算扩容流程</p>
          </div>
          <button 
            @click="$router.push('/internal/projects')" 
            class="text-xs text-brand-600 hover:text-brand-800 font-semibold flex items-center gap-1"
          >
            全部项目 →
          </button>
        </div>

        <div class="space-y-4">
          <div 
            v-for="proj in store.projects" 
            :key="proj.id" 
            class="p-4 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 hover:border-slate-200 transition-all space-y-2.5"
          >
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <div>
                <span class="text-xs font-bold text-slate-800">{{ proj.projectName }}</span>
                <span class="text-[11px] font-mono text-slate-400 ml-2">({{ proj.projectCode }})</span>
              </div>
              <div class="text-xs text-slate-600 font-mono">
                已派: <strong class="text-slate-900">¥{{ proj.usedBudget.toLocaleString() }}</strong> / 总额: ¥{{ proj.totalBudget.toLocaleString() }}
              </div>
            </div>

            <!-- Progress Bar -->
            <el-progress 
              :percentage="Number(((proj.usedBudget / proj.totalBudget) * 100).toFixed(1))" 
              :status="proj.usedBudget / proj.totalBudget > 0.85 ? 'exception' : 'primary'"
              :stroke-width="8"
            />

            <div class="flex items-center justify-between text-xs text-slate-500 pt-1">
              <div class="flex items-center gap-1.5">
                <span>准入证书要求:</span>
                <span v-for="cid in proj.requiredCertIds" :key="cid" class="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-medium">
                  📜 {{ getCertName(cid) }}
                </span>
                <span class="text-[10px] text-slate-400 font-mono">({{ proj.certMatchRule }})</span>
              </div>
              <div>
                剩余可用额: <strong class="text-emerald-700 font-mono font-bold">¥{{ (proj.totalBudget - proj.usedBudget).toLocaleString() }}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right: Pending Task Routing Matrix -->
      <div class="card-modern p-5 flex flex-col justify-between">
        <div>
          <div class="pb-3 mb-4 border-b border-slate-100">
            <h2 class="font-bold text-sm text-slate-800 flex items-center gap-2">
              <span class="w-2 h-4 rounded-full bg-amber-500"></span>
              审批待办与快捷入口
            </h2>
            <p class="text-xs text-slate-400 mt-0.5">集中处理各节点审核工作流</p>
          </div>

          <div class="space-y-3">
            <button 
              @click="$router.push('/internal/completion-audit')"
              class="w-full p-3.5 rounded-xl border border-purple-200/80 bg-purple-50/40 hover:bg-purple-50 text-left transition-all flex items-center justify-between group"
            >
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-lg bg-purple-600 text-white flex items-center justify-center text-base shadow-sm">
                  <el-icon><CircleCheck /></el-icon>
                </div>
                <div>
                  <div class="text-xs font-bold text-purple-900 group-hover:text-purple-950">分批完工验收审核</div>
                  <div class="text-[11px] text-purple-700/80">审核交付物与扣款核减</div>
                </div>
              </div>
              <span v-if="pendingDeliverablesCount > 0" class="px-2 py-0.5 rounded-full text-xs font-bold bg-purple-600 text-white shadow-xs">
                {{ pendingDeliverablesCount }} 待办
              </span>
            </button>

            <button 
              @click="$router.push('/internal/settlement-audit')"
              class="w-full p-3.5 rounded-xl border border-amber-200/80 bg-amber-50/40 hover:bg-amber-50 text-left transition-all flex items-center justify-between group"
            >
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-lg bg-amber-600 text-white flex items-center justify-center text-base shadow-sm">
                  <el-icon><Money /></el-icon>
                </div>
                <div>
                  <div class="text-xs font-bold text-amber-900 group-hover:text-amber-950">报销审核与外部推单</div>
                  <div class="text-[11px] text-amber-700/80">核验发票并推送外部系统</div>
                </div>
              </div>
              <span v-if="pendingSettlementCount > 0" class="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-600 text-white shadow-xs">
                {{ pendingSettlementCount }} 待办
              </span>
            </button>

            <button 
              @click="$router.push('/internal/vendors')"
              class="w-full p-3.5 rounded-xl border border-blue-200/80 bg-blue-50/40 hover:bg-blue-50 text-left transition-all flex items-center justify-between group"
            >
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center text-base shadow-sm">
                  <el-icon><OfficeBuilding /></el-icon>
                </div>
                <div>
                  <div class="text-xs font-bold text-blue-900 group-hover:text-blue-950">服务商与工程师证书核验</div>
                  <div class="text-[11px] text-blue-700/80">审核特种资质确保安全合规</div>
                </div>
              </div>
              <el-icon class="text-slate-400 group-hover:text-blue-600"><ArrowRight /></el-icon>
            </button>
          </div>
        </div>

        <!-- Compliance Card -->
        <div class="mt-5 p-3.5 rounded-xl bg-slate-900 text-white text-xs space-y-1.5 border border-slate-800">
          <div class="font-bold text-brand-300 flex items-center gap-1.5">
            <span>🛡️</span> 业务内控规则保障：
          </div>
          <p class="text-slate-400 text-[11px] leading-relaxed">
            1. 工程师必须持有对应有效证书，PM 方可指派；<br>
            2. 完工审核扣款直接锁定纯净实付金额；<br>
            3. 外部报销系统打款后自动回调结清闭环。
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useScmpStore } from '@/store/scmpStore'

const store = useScmpStore()

const totalBudget = computed(() => store.projects.reduce((sum, p) => sum + p.totalBudget, 0))
const usedBudget = computed(() => store.projects.reduce((sum, p) => sum + p.usedBudget, 0))

const inProgressCount = computed(() => store.workOrders.filter(w => w.status === 'IN_PROGRESS').length)
const pendingAcceptCount = computed(() => store.workOrders.filter(w => w.status === 'PENDING_ACCEPTANCE').length)
const pendingDispatchCount = computed(() => store.workOrders.filter(w => w.status === 'PENDING_DISPATCH_AUDIT').length)

const pendingDeliverablesCount = computed(() => store.deliverables.filter(d => d.auditStatus === 'PENDING').length)
const pendingSettlementCount = computed(() => store.settlements.filter(s => s.status === 'PENDING_APPROVAL').length)
const totalPendingAudit = computed(() => pendingDispatchCount.value + pendingDeliverablesCount.value + pendingSettlementCount.value)

const totalPaidAmount = computed(() => 
  store.settlements.filter(s => s.status === 'PAID').reduce((sum, s) => sum + s.finalSettleAmount, 0)
)

function getCertName(id: number) {
  return store.certTypes.find(c => c.id === id)?.certName || `证书ID:${id}`
}
</script>
