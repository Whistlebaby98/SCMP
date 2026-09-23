<template>
  <div class="space-y-6 pb-10">
    <!-- Welcome Header Banner -->
    <div class="card-modern p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-900 text-white shadow-md shadow-emerald-900/10">
      <div>
        <div class="flex items-center gap-2">
          <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
            服务商协同中枢
          </span>
          <h1 class="text-lg md:text-xl font-bold text-white">华创智能工程 - 业务协同大屏</h1>
        </div>
        <p class="text-xs text-emerald-200/80 mt-1">
          当前登录身份: <strong class="text-white">{{ store.currentUser.realName }}</strong> ({{ store.currentUser.roleCode === 'ROLE_VND_LIAISON' ? '接口负责人' : '履约工程师' }}) · 开大票对公报销 · 实时回款监控
        </p>
      </div>

      <div class="flex items-center gap-2">
        <button
          @click="$router.push('/vendor/reimbursement')"
          class="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-white text-xs font-bold shadow-md shadow-emerald-500/20 hover:brightness-105 transition-all flex items-center gap-1.5"
        >
          <span>💳</span> 快速合并开票报销
        </button>
      </div>
    </div>

    <!-- Stat Cards Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="card-modern p-5 bg-gradient-to-br from-white to-emerald-50/30 border-l-4 border-l-emerald-500 space-y-2">
        <div class="flex justify-between items-center text-xs text-slate-500 font-medium">
          <span>旗下持证工程师</span>
          <span class="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">👥</span>
        </div>
        <div class="text-2xl font-black text-slate-900">{{ companyEngineers.length }} <span class="text-xs font-normal text-slate-400">位</span></div>
        <div class="text-[11px] text-slate-400 flex items-center gap-1">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <span>在册活跃持证人员</span>
        </div>
      </div>

      <div class="card-modern p-5 bg-gradient-to-br from-white to-blue-50/30 border-l-4 border-l-blue-500 space-y-2">
        <div class="flex justify-between items-center text-xs text-slate-500 font-medium">
          <span>承接工单任务数</span>
          <span class="p-1.5 rounded-lg bg-blue-100 text-blue-700">📋</span>
        </div>
        <div class="text-2xl font-black text-blue-600 font-mono">{{ companyOrders.length }} <span class="text-xs font-normal text-slate-400">单</span></div>
        <div class="text-[11px] text-slate-400">
          履约中: {{ inProgressOrdersCount }} 单 | 全部完工: {{ completedOrdersCount }} 单
        </div>
      </div>

      <div class="card-modern p-5 bg-gradient-to-br from-white to-amber-50/30 border-l-4 border-l-amber-500 space-y-2">
        <div class="flex justify-between items-center text-xs text-slate-500 font-medium">
          <span>待开大票报销池 (已核准)</span>
          <span class="p-1.5 rounded-lg bg-amber-100 text-amber-700">💰</span>
        </div>
        <div class="text-2xl font-black text-amber-600 font-mono">¥ {{ reimbursableAmount.toLocaleString() }}</div>
        <div class="text-[11px] text-amber-700 font-medium">
          {{ reimbursableBatches.length }} 笔批次可立即勾选合并开票
        </div>
      </div>

      <div class="card-modern p-5 bg-gradient-to-br from-white to-teal-50/30 border-l-4 border-l-teal-600 space-y-2">
        <div class="flex justify-between items-center text-xs text-slate-500 font-medium">
          <span>已打款到账资金</span>
          <span class="p-1.5 rounded-lg bg-teal-100 text-teal-700">🏦</span>
        </div>
        <div class="text-2xl font-black text-teal-700 font-mono">¥ {{ totalPaidAmount.toLocaleString() }}</div>
        <div class="text-[11px] text-slate-400">外部财务报销系统已打款结清</div>
      </div>
    </div>

    <!-- Quick Actions & Business Compliance Rules -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
      <!-- Actions Card -->
      <div class="card-modern p-5 space-y-4">
        <div class="flex items-center gap-2 pb-3 border-b border-slate-100">
          <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
          <h3 class="text-sm font-bold text-slate-900">接口负责人日常快捷操作</h3>
        </div>

        <div class="space-y-2.5">
          <button
            @click="$router.push('/vendor/reimbursement')"
            class="w-full p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center justify-between transition-all"
          >
            <div class="flex items-center gap-2.5">
              <span class="text-base">💳</span>
              <span>合并完工批次开大票报销 ({{ reimbursableBatches.length }} 笔待报销)</span>
            </div>
            <span class="text-emerald-700">去申报 ➔</span>
          </button>

          <button
            @click="$router.push('/vendor/engineers')"
            class="w-full p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-semibold flex items-center justify-between transition-all"
          >
            <div class="flex items-center gap-2.5">
              <span class="text-base">📜</span>
              <span>维护名下工程师花名册与特种作业证书续期</span>
            </div>
            <span class="text-slate-500">查看 ➔</span>
          </button>

          <button
            @click="$router.push('/vendor/orders')"
            class="w-full p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-semibold flex items-center justify-between transition-all"
          >
            <div class="flex items-center gap-2.5">
              <span class="text-base">📑</span>
              <span>查看本公司所有项目实施与施工履约进度</span>
            </div>
            <span class="text-slate-500">查看 ➔</span>
          </button>
        </div>
      </div>

      <!-- Compliance Guide Card -->
      <div class="card-modern p-5 bg-gradient-to-br from-emerald-50/40 to-teal-50/20 border border-emerald-200/80 space-y-3">
        <div class="flex items-center gap-2 pb-3 border-b border-emerald-200/60">
          <span class="text-base">📜</span>
          <h3 class="text-sm font-bold text-emerald-950">服务商协同业务合规守则</h3>
        </div>

        <div class="text-xs text-emerald-900 space-y-2.5 leading-relaxed">
          <div class="flex items-start gap-2">
            <span class="w-5 h-5 rounded-full bg-emerald-200 text-emerald-800 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">1</span>
            <p><strong>证书时效性核验</strong>：特种作业证书快到期时，请提前上传续期件并等待内部核验。过期证书将导致工程师无法被派单系统匹配。</p>
          </div>
          <div class="flex items-start gap-2">
            <span class="w-5 h-5 rounded-full bg-emerald-200 text-emerald-800 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">2</span>
            <p><strong>分批完工串行控制</strong>：长工期项目支持分批完工提报（如30%、60%），前一批审批通过后方可申请下一批；<strong>客户现场签字单为终审必备依据</strong>。</p>
          </div>
          <div class="flex items-start gap-2">
            <span class="w-5 h-5 rounded-full bg-emerald-200 text-emerald-800 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">3</span>
            <p><strong>开大票报销（A1）</strong>：完工审核通过即锁定纯净核定金额。接口负责人可跨项目勾选多笔完工单，合并开具1张总金额相符的增值税发票，快速回款。</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useScmpStore } from '@/store/scmpStore'

const store = useScmpStore()
const currentVendorId = computed(() => store.currentUser.vendorId || 1)

const companyEngineers = computed(() => store.engineers.filter(e => e.vendorId === currentVendorId.value))
const companyOrders = computed(() => store.workOrders.filter(w => w.vendorId === currentVendorId.value))

const inProgressOrdersCount = computed(() => companyOrders.value.filter(w => w.status === 'IN_PROGRESS').length)
const completedOrdersCount = computed(() => companyOrders.value.filter(w => w.status === 'ALL_COMPLETED').length)

const reimbursableBatches = computed(() => store.reimbursableDeliverables(currentVendorId.value))
const reimbursableAmount = computed(() => 
  reimbursableBatches.value.reduce((sum, d) => sum + (d.approvedAmount || d.applyAmount), 0)
)

const totalPaidAmount = computed(() => 
  store.settlements
    .filter(s => s.vendorId === currentVendorId.value && s.status === 'PAID')
    .reduce((sum, s) => sum + s.finalSettleAmount, 0)
)
</script>
