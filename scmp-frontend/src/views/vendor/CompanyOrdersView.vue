<template>
  <div class="space-y-5 pb-10 max-w-5xl mx-auto">
    <!-- Header Banner -->
    <div class="card-modern p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-900 text-white">
      <div>
        <div class="flex items-center gap-2">
          <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
            工单总览
          </span>
          <h1 class="text-lg md:text-xl font-bold text-white">全公司承接工单监控中心</h1>
        </div>
        <p class="text-xs text-emerald-200/80 mt-1">
          集中掌握本公司旗下所有工程师承接项目的活计履约、分批完工与结算到账状态。
        </p>
      </div>

      <div class="flex items-center gap-2">
        <span class="text-xs text-emerald-200">承接工单总计:</span>
        <span class="px-2.5 py-1 rounded-lg bg-emerald-800 text-emerald-100 font-bold text-xs">
          {{ companyOrders.length }} 单
        </span>
      </div>
    </div>

    <!-- Desktop Table (Hidden on mobile) -->
    <div class="hidden md:block card-modern overflow-hidden">
      <el-table :data="companyOrders" stripe style="width: 100%">
        <el-table-column prop="orderNo" label="工单编号" width="160">
          <template #default="{ row }">
            <span class="font-mono font-bold text-brand-600">{{ row.orderNo }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="title" label="工单活计与项目" min-width="240">
          <template #default="{ row }">
            <div class="font-semibold text-slate-800">{{ row.title }}</div>
            <div class="text-xs text-slate-400 mt-0.5">所属项目: {{ row.projectName }}</div>
          </template>
        </el-table-column>

        <el-table-column label="实施工程师" width="140">
          <template #default="{ row }">
            <div class="text-xs">
              <strong class="text-slate-800">{{ row.engineerName }}</strong>
              <div class="text-slate-400 text-[11px]">本公司在册</div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="合同总额 / 已核准完工" width="180">
          <template #default="{ row }">
            <div class="text-xs space-y-1">
              <div>合同额: <strong class="font-mono text-slate-900 font-bold">¥{{ row.amount.toLocaleString() }}</strong></div>
              <div class="text-emerald-700 font-semibold">已核准: ¥{{ row.completedAmount.toLocaleString() }}</div>
              <el-progress 
                :percentage="Number(((row.completedAmount / row.amount) * 100).toFixed(0))" 
                :show-text="false" 
                :stroke-width="4"
              />
            </div>
          </template>
        </el-table-column>

        <el-table-column label="工单状态" width="130">
          <template #default="{ row }">
            <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold" :class="getStatusBadgeClass(row.status)">
              {{ getStatusName(row.status) }}
            </span>
          </template>
        </el-table-column>

        <el-table-column prop="deadline" label="完工时限" width="140">
          <template #default="{ row }">
            <span class="font-mono text-xs text-slate-500">{{ row.deadline }}</span>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- Mobile Responsive Cards (Shown only on mobile) -->
    <div class="block md:hidden space-y-3">
      <div 
        v-for="row in companyOrders" 
        :key="row.id" 
        class="card-modern p-4 space-y-3 text-xs"
      >
        <div class="flex justify-between items-start">
          <div>
            <span class="font-mono text-brand-600 font-bold">{{ row.orderNo }}</span>
            <h3 class="font-bold text-sm text-slate-900 mt-0.5">{{ row.title }}</h3>
          </div>
          <span class="px-2 py-0.5 rounded-full text-[10px] font-bold" :class="getStatusBadgeClass(row.status)">
            {{ getStatusName(row.status) }}
          </span>
        </div>

        <div class="p-2.5 rounded-lg bg-slate-50 border border-slate-100 space-y-1 text-slate-600">
          <div class="flex justify-between">
            <span>所属项目:</span>
            <span class="text-slate-800 font-medium truncate max-w-[180px]">{{ row.projectName }}</span>
          </div>
          <div class="flex justify-between">
            <span>实施工程师:</span>
            <strong class="text-emerald-700">{{ row.engineerName }}</strong>
          </div>
          <div class="flex justify-between">
            <span>要求工期:</span>
            <span class="font-mono text-slate-600">{{ row.deadline }}</span>
          </div>
        </div>

        <div class="flex justify-between items-center pt-1 border-t border-slate-100">
          <div>
            <span class="text-slate-400">合同额: </span>
            <strong class="font-mono text-slate-900 font-bold text-sm">¥{{ row.amount.toLocaleString() }}</strong>
          </div>
          <div>
            <span class="text-slate-400">已核准完工: </span>
            <strong class="font-mono text-emerald-600 font-bold text-sm">¥{{ row.completedAmount.toLocaleString() }}</strong>
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

const companyOrders = computed(() => 
  store.workOrders.filter(w => w.vendorId === currentVendorId.value)
)

function getStatusBadgeClass(status: string) {
  switch (status) {
    case 'PENDING_ACCEPTANCE': return 'bg-blue-100 text-blue-800'
    case 'IN_PROGRESS': return 'bg-indigo-100 text-indigo-800'
    case 'ALL_COMPLETED': return 'bg-emerald-100 text-emerald-800'
    case 'REJECTED_BY_VENDOR': return 'bg-red-100 text-red-800'
    default: return 'bg-slate-100 text-slate-700'
  }
}

function getStatusName(status: string) {
  switch (status) {
    case 'PENDING_DISPATCH_AUDIT': return '待派单审核'
    case 'PENDING_ACCEPTANCE': return '待承接'
    case 'IN_PROGRESS': return '施工履约中'
    case 'ALL_COMPLETED': return '全部完工'
    case 'REJECTED_BY_VENDOR': return '已拒接'
    default: return status
  }
}
</script>
