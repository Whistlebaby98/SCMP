<template>
  <div class="space-y-5 pb-10">
    <!-- Header Banner -->
    <div class="card-modern p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-gradient-to-r from-white via-amber-50/20 to-blue-50/30">
      <div>
        <div class="flex items-center gap-2">
          <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
            结算中枢
          </span>
          <h1 class="text-lg md:text-xl font-bold text-slate-900">报销审核与外部财务系统推单中心</h1>
        </div>
        <p class="text-xs text-slate-500 mt-1">
          审核服务商接口人合并申报的完工批次与汇总发票；初审无误后<strong>一键推送至公司外部报销系统 (ERP)</strong>，接收异步打款回调闭环。
        </p>
      </div>

      <div class="flex items-center gap-2">
        <span class="text-xs text-slate-500">待办初审报销单：</span>
        <span class="px-3 py-1 rounded-full text-xs font-bold bg-amber-500 text-white shadow-xs">
          {{ pendingSettlements.length }} 单待审
        </span>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="store.settlements.length === 0" class="card-modern p-12 text-center text-slate-400 space-y-2">
      <div class="text-3xl">💳</div>
      <div class="text-sm font-semibold text-slate-700">当前暂无服务商报销单据</div>
      <div class="text-xs">服务商接口人在协同端发起合并报销后将在此展示。</div>
    </div>

    <!-- Settlements Cards List -->
    <div v-else class="space-y-5">
      <div 
        v-for="settle in store.settlements" 
        :key="settle.id" 
        class="card-modern p-5 border-2 space-y-5 transition-all"
        :class="getCardBorderClass(settle.status)"
      >
        <!-- Card Top Bar -->
        <div class="flex flex-col sm:flex-row justify-between sm:items-center pb-4 border-b border-slate-100 gap-3">
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <span class="px-2.5 py-0.5 rounded-full text-xs font-bold" :class="getSettleBadgeClass(settle.status)">
                {{ getSettleStatusName(settle.status) }}
              </span>
              <span class="font-mono text-xs font-bold text-brand-600">{{ settle.settleNo }}</span>
            </div>
            <div class="text-xs text-slate-500">
              申报服务商: <strong class="text-slate-800">{{ settle.vendorName }}</strong> (接口人: {{ settle.applicantName }}) | 申报时间: {{ settle.createTime }}
            </div>
          </div>

          <div class="text-left sm:text-right bg-slate-50 sm:bg-transparent p-3 sm:p-0 rounded-xl">
            <div class="text-[11px] text-slate-400">报销申报核定总额</div>
            <div class="text-2xl font-black text-emerald-600 font-mono">
              ¥ {{ settle.finalSettleAmount.toLocaleString() }}
            </div>
          </div>
        </div>

        <!-- Middle: Bundled Batches vs. Bank & Invoice -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <!-- Left: Bundled Deliverables List (2 cols) -->
          <div class="md:col-span-2 p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div class="font-bold text-slate-800 flex justify-between items-center pb-2 border-b border-slate-200">
              <span class="flex items-center gap-1.5">
                <span>📦</span> 本报销单包含的完工核准批次 (共 {{ settle.deliverableCount }} 笔)
              </span>
              <span class="text-emerald-700 font-mono font-bold">批次实批合计: ¥{{ settle.totalApprovedAmount.toLocaleString() }}</span>
            </div>

            <div class="divide-y divide-slate-200/70">
              <div 
                v-for="delivId in settle.deliverableIds" 
                :key="delivId" 
                class="py-2.5 flex justify-between items-center"
              >
                <div>
                  <span class="font-mono text-brand-600 font-semibold mr-2">{{ getDeliverable(delivId)?.orderNo }}</span>
                  <span class="text-slate-700 font-medium">{{ getDeliverable(delivId)?.projectTitle }}</span>
                </div>
                <div class="font-mono font-bold text-slate-900">
                  ¥{{ (getDeliverable(delivId)?.approvedAmount || getDeliverable(delivId)?.applyAmount)?.toLocaleString() }}
                </div>
              </div>
            </div>
          </div>

          <!-- Right: Bank Snapshot & Invoice (1 col) -->
          <div class="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div class="font-bold text-slate-800 flex items-center gap-1 pb-2 border-b border-slate-200">
              <span>🏦</span> 对公收款账户快照 (强校验)
            </div>
            
            <div class="space-y-1 text-slate-600">
              <div>开户行: <span class="text-slate-800 font-medium">{{ settle.bankSnapshot.bankName }}</span></div>
              <div>账号: <strong class="font-mono text-slate-900 text-xs">{{ settle.bankSnapshot.bankAccount }}</strong></div>
              <div>户名: <span class="text-slate-800">{{ settle.bankSnapshot.bankAccountName }}</span></div>
            </div>

            <!-- Consolidated Invoice Preview (Rule A1) -->
            <div class="pt-2 border-t border-slate-200">
              <div class="font-bold text-slate-800 mb-1.5">汇总增值税发票 (A1)：</div>
              <div class="flex items-center gap-2.5 p-2 bg-white rounded-lg border border-slate-200">
                <el-image 
                  :src="settle.invoiceUrl" 
                  :preview-src-list="[settle.invoiceUrl]" 
                  class="w-12 h-12 rounded object-cover cursor-pointer shrink-0 border" 
                />
                <div class="text-[11px] space-y-0.5">
                  <div class="font-medium text-brand-600 cursor-pointer underline">查看专票原件</div>
                  <div class="text-slate-400">金额核对一致</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Bottom: External System Status & Action Bar -->
        <div 
          class="p-4 rounded-xl border flex flex-col md:flex-row justify-between items-start md:items-center gap-3"
          :class="getActionBarBgClass(settle.status)"
        >
          <!-- Status Info -->
          <div class="text-xs space-y-1">
            <div v-if="settle.externalBillNo" class="flex items-center gap-2 font-mono">
              <span class="text-slate-600">外部财务报销审批单号:</span>
              <strong class="text-brand-700 bg-white px-2 py-0.5 rounded border border-brand-200">{{ settle.externalBillNo }}</strong>
            </div>

            <div v-if="settle.paySerialNo" class="text-emerald-800 font-semibold font-mono flex items-center gap-1">
              <span>✓</span> 银行实际打款流水号: {{ settle.paySerialNo }} (打款完成时间: {{ settle.payTime }})
            </div>

            <div v-if="settle.failReason" class="text-red-600 font-bold bg-white px-2 py-1 rounded border border-red-200">
              外部系统退回原因: {{ settle.failReason }} (已自动解冻完工批次)
            </div>

            <div v-if="settle.status === 'PENDING_APPROVAL'" class="text-amber-800 font-medium">
              待审核管理人员核对发票及打款账户无误后，推送到外部财务报销系统 (ERP)。
            </div>
          </div>

          <!-- Buttons & Simulator Trigger -->
          <div class="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
            <!-- If PENDING_APPROVAL -->
            <template v-if="settle.status === 'PENDING_APPROVAL'">
              <el-button size="default" type="danger" plain @click="rejectSettlement(settle)">
                发票不合规(驳回)
              </el-button>
              <el-button size="default" type="primary" @click="pushToExternal(settle)" class="shadow-sm shadow-brand-500/20">
                <el-icon class="mr-1"><Position /></el-icon> 初审无误并推送到外部财务系统 ➔
              </el-button>
            </template>

            <!-- If EXTERNAL_PROCESSING (Simulator Actions) -->
            <template v-else-if="settle.status === 'EXTERNAL_PROCESSING'">
              <span class="text-xs text-blue-700 font-semibold flex items-center gap-1 mr-1">
                <span class="w-2 h-2 rounded-full bg-blue-600 animate-ping"></span> 外部财务审批中
              </span>
              <el-button size="small" type="success" @click="simulateCallback(settle, true)">
                【模拟外部打款成功 Webhook】
              </el-button>
              <el-button size="small" type="danger" plain @click="simulateCallback(settle, false)">
                【模拟外部退票失败 Webhook】
              </el-button>
            </template>

            <!-- If PAID -->
            <template v-else-if="settle.status === 'PAID'">
              <span class="px-3 py-1 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center gap-1 shadow-xs">
                <span>✓</span> 财务资金打款已闭环归档
              </span>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useScmpStore, type Settlement } from '@/store/scmpStore'
import { ElMessage, ElMessageBox } from 'element-plus'

const store = useScmpStore()

const pendingSettlements = computed(() => 
  store.settlements.filter(s => s.status === 'PENDING_APPROVAL')
)

function getDeliverable(id: number) {
  return store.deliverables.find(d => d.id === id)
}

function getCardBorderClass(status: string) {
  switch (status) {
    case 'PENDING_APPROVAL': return 'border-amber-300 bg-amber-50/15'
    case 'EXTERNAL_PROCESSING': return 'border-blue-300 bg-blue-50/15'
    case 'PAID': return 'border-emerald-300 bg-emerald-50/15'
    case 'EXTERNAL_FAILED': return 'border-red-300 bg-red-50/15'
    default: return 'border-slate-200'
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

function getActionBarBgClass(status: string) {
  switch (status) {
    case 'PAID': return 'bg-emerald-50 border-emerald-200'
    case 'EXTERNAL_PROCESSING': return 'bg-blue-50 border-blue-200'
    case 'EXTERNAL_FAILED': return 'bg-red-50 border-red-200'
    default: return 'bg-amber-50/60 border-amber-200'
  }
}

function getSettleStatusName(status: string) {
  switch (status) {
    case 'PENDING_APPROVAL': return '待内部初审'
    case 'SETTLE_REJECTED': return '初审驳回'
    case 'EXTERNAL_PROCESSING': return '外部财务审批中'
    case 'PAID': return '已打款结清'
    case 'EXTERNAL_FAILED': return '外部打款退回'
    default: return status
  }
}

function pushToExternal(settle: Settlement) {
  ElMessageBox.confirm(
    `确认向公司外部财务报销系统推单？报销申报总额为 ¥${settle.finalSettleAmount.toLocaleString()} 元。`,
    '外部报销系统推单确认',
    { type: 'primary' }
  ).then(() => {
    store.pushToExternalReimbursement(settle.id)
    ElMessage.success(`报销单已成功推送到外部报销系统！外部单据流水号: ${settle.externalBillNo}，等待外部财务打款回调。`)
  })
}

function rejectSettlement(settle: Settlement) {
  settle.status = 'SETTLE_REJECTED'
  settle.deliverableIds.forEach(id => {
    const d = store.deliverables.find(item => item.id === id)
    if (d) d.settleStatus = 'UNSETTLED'
  })
  ElMessage.warning('报销初审已驳回！已解冻挂接的完工批次，通知服务商修改重提。')
}

function simulateCallback(settle: Settlement, success: boolean) {
  if (success) {
    const serial = `CMB${Date.now()}`
    store.simulateExternalCallback(settle.id, true, serial)
    ElMessage.success(`收到外部打款完成 Webhook 回调！银行流水号: ${serial}，工单批次已全部结清归档！`)
  } else {
    store.simulateExternalCallback(settle.id, false, undefined, '外部财务审核退票：发票开票日期超出申报限期')
    ElMessage.error('收到外部打款失败回调！工单批次已自动解冻，已通知服务商接口人修改发票重提。')
  }
}
</script>
