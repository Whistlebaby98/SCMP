<template>
  <div class="space-y-6 pb-10">
    <!-- Header Banner -->
    <div class="card-modern p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-900 text-white">
      <div>
        <div class="flex items-center gap-2">
          <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
            接口负责人专属
          </span>
          <h1 class="text-lg md:text-xl font-bold text-white">服务商完工合并报销结算中心</h1>
        </div>
        <p class="text-xs text-emerald-200/80 mt-1">
          勾选旗下所有<strong>已完工验收通过的批次</strong>，合并开具 <strong>1 张总金额相符的增值税发票 (A1)</strong> 对公报销，直接对接外部财务系统打款。
        </p>
      </div>

      <div class="flex items-center gap-2">
        <span class="text-xs text-emerald-200">申报责任人:</span>
        <span class="px-2.5 py-1 rounded-lg bg-emerald-800 text-emerald-100 font-bold text-xs">
          {{ store.currentUser.realName }} (负责人)
        </span>
      </div>
    </div>

    <!-- Candidate Deliverables Section -->
    <div class="card-modern p-5 space-y-4">
      <div class="flex flex-col sm:flex-row justify-between sm:items-center pb-3 border-b border-slate-100 gap-2">
        <div>
          <h2 class="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span>📦</span> 待开票报销完工批次清单 (已通过内部验收终审)
          </h2>
          <p class="text-[11px] text-slate-400">支持单选或跨项目批量勾选合并报销，系统执行行级锁定防止重复申报</p>
        </div>
        <span class="text-xs text-slate-500">待报销存量: {{ candidateDeliverables.length }} 笔</span>
      </div>

      <!-- Empty State -->
      <div v-if="candidateDeliverables.length === 0" class="p-8 text-center text-slate-400 text-xs bg-slate-50 rounded-xl">
        暂无待报销的完工批次（已提交报销或工程师尚未提报完工）
      </div>

      <!-- Desktop Selection Table -->
      <div v-else class="hidden md:block overflow-hidden">
        <el-table 
          :data="candidateDeliverables" 
          stripe 
          style="width: 100%"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column prop="orderNo" label="工单编号" width="160">
            <template #default="{ row }">
              <span class="font-mono font-bold text-brand-600">{{ row.orderNo }}</span>
            </template>
          </el-table-column>

          <el-table-column prop="projectTitle" label="完工批次概述" min-width="220" />

          <el-table-column label="核定实批金额 (元)" width="180">
            <template #default="{ row }">
              <div class="text-xs">
                <strong class="font-mono text-emerald-700 text-sm font-bold">
                  ¥{{ (row.approvedAmount || row.applyAmount).toLocaleString() }}
                </strong>
                <div v-if="row.deductionAmount > 0" class="text-red-500 text-[11px] font-semibold">
                  (原报: ¥{{ row.applyAmount }} - 违约扣减 ¥{{ row.deductionAmount }})
                </div>
              </div>
            </template>
          </el-table-column>

          <el-table-column prop="auditTime" label="验收通过时间" width="160" />

          <el-table-column label="签字凭据" width="110">
            <template #default="{ row }">
              <el-image 
                :src="row.signSheetUrl" 
                :preview-src-list="[row.signSheetUrl]" 
                class="w-10 h-10 rounded-lg border object-cover cursor-pointer hover:opacity-80" 
              />
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- Mobile Deliverable Cards with Checkbox -->
      <div v-if="candidateDeliverables.length > 0" class="block md:hidden space-y-3">
        <div 
          v-for="row in candidateDeliverables" 
          :key="row.id" 
          @click="toggleDeliverableSelection(row)"
          class="p-4 rounded-xl border cursor-pointer transition-all space-y-2 text-xs"
          :class="isDeliverableSelected(row.id) ? 'border-emerald-500 bg-emerald-50/50 ring-1 ring-emerald-500' : 'border-slate-200 bg-slate-50/40'"
        >
          <div class="flex justify-between items-start">
            <div class="flex items-center gap-2">
              <input 
                type="checkbox" 
                :checked="isDeliverableSelected(row.id)" 
                class="w-4 h-4 rounded text-emerald-600 pointer-events-none" 
              />
              <span class="font-mono text-xs font-bold text-brand-600">{{ row.orderNo }}</span>
            </div>
            <strong class="font-mono text-emerald-700 text-sm font-bold">
              ¥{{ (row.approvedAmount || row.applyAmount).toLocaleString() }}
            </strong>
          </div>

          <div class="font-semibold text-slate-800">{{ row.projectTitle }}</div>

          <div class="flex justify-between items-center text-[11px] text-slate-400 pt-1 border-t border-slate-200/60">
            <span>验收通过: {{ row.auditTime }}</span>
            <span v-if="row.deductionAmount > 0" class="text-red-500 font-bold">
              已扣减: ¥{{ row.deductionAmount }}
            </span>
          </div>
        </div>
      </div>

      <!-- Live Selection Aggregate Banner -->
      <div class="p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div class="text-xs text-slate-700 space-y-0.5">
          <div class="flex items-center gap-1.5 font-bold text-emerald-950">
            <span>✓</span> 已勾选 <strong class="text-emerald-700 text-base font-black">{{ selectedDeliverables.length }}</strong> 笔已完工批次合并开票
          </div>
          <div class="text-[11px] text-slate-400">系统将自动执行行级状态锁定，防止重复申报</div>
        </div>

        <div class="text-left sm:text-right">
          <span class="text-xs text-slate-500">报销申报总金额：</span>
          <strong class="text-2xl md:text-3xl font-black text-emerald-700 font-mono ml-2">
            ¥ {{ totalSelectedAmount.toLocaleString() }}
          </strong>
        </div>
      </div>

      <!-- Invoicing & Bank Details -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
        <!-- Invoice (Rule A1) -->
        <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
          <label class="block font-bold text-slate-800">
            上传汇总增值税专用发票 (A1：发票总额须与 ¥{{ totalSelectedAmount.toLocaleString() }} 一致) <span class="text-red-500">*</span>
          </label>
          <div class="flex items-center gap-3 p-2 bg-white rounded-lg border border-slate-200">
            <el-image :src="invoiceUrl" class="w-14 h-14 rounded-lg border object-cover shrink-0" />
            <div class="space-y-0.5">
              <div class="font-bold text-brand-600">invoice_vat_consolidated.pdf</div>
              <div class="text-[11px] text-slate-400">已选取符合合并总额的进项专票扫描件</div>
            </div>
          </div>
        </div>

        <!-- Bank Account Confirmation -->
        <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-slate-600">
          <div class="font-bold text-slate-800 flex items-center gap-1">
            <span>🏦</span> 对公结算收款账户信息确认：
          </div>
          <div>开户银行: 招商银行高新园支行</div>
          <div>收款账号: <strong class="font-mono text-slate-900 text-xs">6214 8301 2948 1234</strong></div>
          <div>开户户名: 深圳华创智能工程有限公司</div>
          <div class="text-[10px] text-slate-400 pt-1">如需变更账户，请向内部管理人员提交线下盖公章申请函。</div>
        </div>
      </div>

      <!-- Submit Button -->
      <div class="flex justify-end pt-2">
        <button
          @click="submitSettlement"
          :disabled="selectedDeliverables.length === 0"
          class="w-full sm:w-auto px-8 py-3 rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
          :class="selectedDeliverables.length === 0 
            ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' 
            : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'"
        >
          <span>💳</span> 提交合并报销申请 (接口负责人确认)
        </button>
      </div>
    </div>

    <!-- History Settlements Table -->
    <div class="card-modern p-5 space-y-4">
      <div class="flex justify-between items-center pb-3 border-b border-slate-100">
        <div>
          <h2 class="text-sm font-bold text-slate-900">本服务商已申报的报销单据记录及外部打款流转</h2>
          <p class="text-[11px] text-slate-400">实时跟踪内部审核与外部财务系统打款状态</p>
        </div>
        <span class="text-xs text-slate-500">共 {{ mySettlements.length }} 单</span>
      </div>

      <!-- Desktop History Table -->
      <div class="hidden md:block overflow-hidden">
        <el-table :data="mySettlements" stripe style="width: 100%">
          <el-table-column prop="settleNo" label="报销申请单号" width="170">
            <template #default="{ row }">
              <span class="font-mono font-bold text-brand-600">{{ row.settleNo }}</span>
            </template>
          </el-table-column>

          <el-table-column label="包含批次数" width="120">
            <template #default="{ row }">
              <span class="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-xs font-medium">
                {{ row.deliverableCount }} 笔完工批次
              </span>
            </template>
          </el-table-column>

          <el-table-column label="报销申报总额 (元)" width="160">
            <template #default="{ row }">
              <span class="font-mono font-black text-emerald-700 text-sm">¥{{ row.finalSettleAmount.toLocaleString() }}</span>
            </template>
          </el-table-column>

          <el-table-column label="外部财务报销流转状态" width="180">
            <template #default="{ row }">
              <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold" :class="getSettleBadgeClass(row.status)">
                {{ getSettleStatusName(row.status) }}
              </span>
            </template>
          </el-table-column>

          <el-table-column label="外部单号 / 银行水单" min-width="220">
            <template #default="{ row }">
              <div class="text-xs font-mono space-y-0.5">
                <div v-if="row.externalBillNo" class="text-brand-600">外部单号: {{ row.externalBillNo }}</div>
                <div v-if="row.paySerialNo" class="text-emerald-700 font-bold">银行水单: {{ row.paySerialNo }}</div>
                <div v-if="row.failReason" class="text-red-500 font-bold">{{ row.failReason }}</div>
              </div>
            </template>
          </el-table-column>

          <el-table-column prop="createTime" label="申报时间" width="160" />
        </el-table>
      </div>

      <!-- Mobile History Cards -->
      <div class="block md:hidden space-y-3">
        <div 
          v-for="row in mySettlements" 
          :key="row.id" 
          class="p-4 rounded-xl border border-slate-200 bg-slate-50/40 space-y-2 text-xs"
        >
          <div class="flex justify-between items-start">
            <div>
              <span class="font-mono font-bold text-brand-600">{{ row.settleNo }}</span>
              <div class="text-[11px] text-slate-400 mt-0.5">包含 {{ row.deliverableCount }} 笔完工批次</div>
            </div>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold" :class="getSettleBadgeClass(row.status)">
              {{ getSettleStatusName(row.status) }}
            </span>
          </div>

          <div class="flex justify-between items-center pt-1 border-t border-slate-200/60">
            <span class="text-slate-500">申报总额:</span>
            <strong class="font-mono text-emerald-700 font-bold text-base">¥{{ row.finalSettleAmount.toLocaleString() }}</strong>
          </div>

          <div v-if="row.externalBillNo || row.paySerialNo" class="p-2 rounded bg-white border border-slate-200 text-[11px] font-mono space-y-0.5">
            <div v-if="row.externalBillNo" class="text-brand-600">外部单号: {{ row.externalBillNo }}</div>
            <div v-if="row.paySerialNo" class="text-emerald-700 font-bold">银行流水: {{ row.paySerialNo }}</div>
            <div v-if="row.failReason" class="text-red-500 font-bold">{{ row.failReason }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useScmpStore, type Deliverable } from '@/store/scmpStore'
import { ElMessage, ElMessageBox } from 'element-plus'

const store = useScmpStore()

const selectedDeliverables = ref<Deliverable[]>([])
const invoiceUrl = ref('https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400')

const candidateDeliverables = computed(() => 
  store.reimbursableDeliverables(store.currentUser.vendorId || 1)
)

const totalSelectedAmount = computed(() => 
  selectedDeliverables.value.reduce((sum, d) => sum + (d.approvedAmount || d.applyAmount), 0)
)

const mySettlements = computed(() => 
  store.settlements.filter(s => s.vendorId === (store.currentUser.vendorId || 1))
)

function handleSelectionChange(val: Deliverable[]) {
  selectedDeliverables.value = val
}

function isDeliverableSelected(id: number) {
  return selectedDeliverables.value.some(d => d.id === id)
}

function toggleDeliverableSelection(row: Deliverable) {
  const index = selectedDeliverables.value.findIndex(d => d.id === row.id)
  if (index >= 0) {
    selectedDeliverables.value.splice(index, 1)
  } else {
    selectedDeliverables.value.push(row)
  }
}

function getSettleBadgeClass(status: string) {
  switch (status) {
    case 'PENDING_APPROVAL': return 'bg-amber-100 text-amber-800'
    case 'EXTERNAL_PROCESSING': return 'bg-blue-100 text-blue-800'
    case 'PAID': return 'bg-emerald-100 text-emerald-800'
    case 'EXTERNAL_FAILED': return 'bg-red-100 text-red-800'
    default: return 'bg-slate-100 text-slate-700'
  }
}

function getSettleStatusName(status: string) {
  switch (status) {
    case 'PENDING_APPROVAL': return '待内部报销审核'
    case 'SETTLE_REJECTED': return '内部初审驳回'
    case 'EXTERNAL_PROCESSING': return '外部财务处理中'
    case 'PAID': return '✓ 已打款结清'
    case 'EXTERNAL_FAILED': return '外部打款退回'
    default: return status
  }
}

function submitSettlement() {
  if (selectedDeliverables.value.length === 0) {
    ElMessage.warning('请至少勾选一笔完工批次！')
    return
  }

  ElMessageBox.confirm(
    `确认对勾选的 ${selectedDeliverables.value.length} 笔完工批次合并发起报销？申报总金额为 ¥${totalSelectedAmount.value.toLocaleString()} 元。内部审核通过后将自动推送公司外部财务系统执行打款。`,
    '确认提交合并报销',
    { type: 'success' }
  ).then(() => {
    const ids = selectedDeliverables.value.map(d => d.id)
    const newSettle = store.applyConsolidatedSettlement({
      deliverableIds: ids,
      invoiceUrl: invoiceUrl.value
    })
    ElMessage.success(`报销单提交成功！单号: ${newSettle.settleNo}，已锁定所选工单批次，请等待审核管理人员核准推单！`)
    selectedDeliverables.value = []
  })
}
</script>
