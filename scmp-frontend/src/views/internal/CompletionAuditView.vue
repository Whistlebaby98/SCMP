<template>
  <div class="space-y-5 pb-10">
    <!-- Header Banner -->
    <div class="card-modern p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-gradient-to-r from-white via-purple-50/20 to-indigo-50/30">
      <div>
        <div class="flex items-center gap-2">
          <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
            验收工作台
          </span>
          <h1 class="text-lg md:text-xl font-bold text-slate-900">分批完工交付验收审核</h1>
        </div>
        <p class="text-xs text-slate-500 mt-1">
          严审现场图文凭证与客户签字单；<strong>支持审核核减扣款（B1），终审判定额直接锁定进入服务商待报销池</strong>。
        </p>
      </div>

      <div class="flex items-center gap-2">
        <span class="text-xs text-slate-500">待办审核批次：</span>
        <span class="px-3 py-1 rounded-full text-xs font-bold bg-red-500 text-white shadow-xs">
          {{ pendingDeliverables.length }} 笔待验
        </span>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="pendingDeliverables.length === 0" class="card-modern p-12 text-center space-y-3">
      <div class="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl mx-auto">
        ✓
      </div>
      <h3 class="text-base font-bold text-slate-800">全部完工提报已审核闭环</h3>
      <p class="text-xs text-slate-400 max-w-md mx-auto">
        当前暂无等待验收审核的完工提报批次。工程师在现场施工完工后提报将自动展示在此处。
      </p>
    </div>

    <!-- Pending Deliverables Cards -->
    <div v-else class="space-y-5">
      <div 
        v-for="deliv in pendingDeliverables" 
        :key="deliv.id" 
        class="card-modern p-5 border-2 border-purple-200/80 bg-gradient-to-b from-purple-50/10 to-transparent space-y-5"
      >
        <!-- Top Bar -->
        <div class="flex flex-col sm:flex-row justify-between sm:items-center pb-4 border-b border-purple-100 gap-3">
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-white">待验收</span>
              <span class="font-mono text-xs text-brand-600 font-bold">{{ deliv.orderNo }}</span>
              <span class="text-xs text-slate-400">|</span>
              <span class="text-xs font-semibold text-slate-600">第 {{ deliv.batchNo }} 批交付</span>
            </div>
            <h2 class="text-base font-bold text-slate-900">{{ deliv.projectTitle }}</h2>
          </div>

          <div class="flex items-center sm:text-right gap-3 bg-white sm:bg-transparent p-3 sm:p-0 rounded-xl border sm:border-0 border-purple-100">
            <div>
              <div class="text-[11px] text-slate-400">本批次申报完工额度</div>
              <div class="text-2xl font-black text-purple-700 font-mono">
                ¥ {{ deliv.applyAmount.toLocaleString() }}
              </div>
            </div>
            <div class="pl-3 border-l border-slate-200 sm:border-purple-200">
              <div class="text-[11px] text-slate-400">本期施工进度</div>
              <div class="text-base font-extrabold text-slate-800 font-mono">{{ deliv.progressPercent }}%</div>
            </div>
          </div>
        </div>

        <!-- Split View: Requirements vs. Field Deliverables -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <!-- Left: Original Contract Requirements -->
          <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div class="font-bold text-slate-800 flex items-center gap-1.5 pb-2 border-b border-slate-200">
              <span class="text-brand-600">📋</span> 原始派单合同要求与责任人
            </div>
            
            <div class="space-y-1.5 text-slate-600">
              <div>所属项目: <strong class="text-slate-800">{{ getWorkOrder(deliv.workOrderId)?.projectName }}</strong></div>
              <div>实施工程师: <strong class="text-emerald-700">{{ getWorkOrder(deliv.workOrderId)?.engineerName }}</strong></div>
              <div>完工截止要求: <span class="font-mono">{{ getWorkOrder(deliv.workOrderId)?.deadline }}</span></div>
            </div>

            <div class="pt-2">
              <div class="text-slate-500 mb-1 font-medium">验收标准与技术规范：</div>
              <div class="p-3 rounded-lg bg-white border border-slate-200 text-slate-700 leading-relaxed text-[11px]">
                {{ getWorkOrder(deliv.workOrderId)?.workContent }}
              </div>
            </div>
          </div>

          <!-- Right: Field Evidence & Customer Sign Sheet -->
          <div class="p-4 rounded-xl bg-purple-50/40 border border-purple-200 space-y-3">
            <div class="font-bold text-purple-950 flex items-center gap-1.5 pb-2 border-b border-purple-200">
              <span class="text-purple-600">📷</span> 现场施工成果与客户签字确认单
            </div>

            <div class="space-y-1 text-slate-700">
              <div class="font-medium text-slate-500">现场施工总结：</div>
              <div class="p-2.5 rounded-lg bg-white border border-purple-100 text-slate-800 leading-relaxed text-[11px]">
                {{ deliv.summary }}
              </div>
            </div>

            <!-- Photos -->
            <div>
              <div class="text-slate-500 mb-1.5 font-medium">实拍施工成果照片 (点击查看大图)：</div>
              <div class="flex gap-2">
                <el-image 
                  v-for="(url, idx) in deliv.attachmentUrls" 
                  :key="idx" 
                  :src="url" 
                  :preview-src-list="deliv.attachmentUrls" 
                  class="w-16 h-16 rounded-xl object-cover border border-purple-200 cursor-pointer shadow-xs hover:opacity-90" 
                />
              </div>
            </div>

            <!-- Customer Signed Sheet (Core Acceptance Document) -->
            <div class="pt-2">
              <div class="text-emerald-800 font-bold mb-1.5 flex items-center gap-1">
                <span>✓</span> 现场业主 / 客户签字确认单原件 (终审核心证据)：
              </div>
              <div class="p-2.5 rounded-xl bg-white border-2 border-emerald-500 flex items-center gap-3">
                <el-image 
                  :src="deliv.signSheetUrl" 
                  :preview-src-list="[deliv.signSheetUrl]" 
                  class="w-16 h-16 rounded-lg object-cover cursor-pointer shrink-0 border" 
                />
                <div class="text-[11px] space-y-0.5">
                  <div class="text-emerald-700 font-bold">客户现场已签字盖章单据</div>
                  <div class="text-slate-400">点击左侧缩略图放大核对签字笔迹与工程量</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Reviewer Control Bar with Direct Deduction (Rule B1) -->
        <div class="p-4 rounded-xl bg-white border border-purple-200/90 shadow-xs space-y-3">
          <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <!-- Amount Adjustment -->
            <div class="flex flex-wrap items-center gap-3 text-xs w-full lg:w-auto">
              <span class="font-bold text-slate-800 whitespace-nowrap">审核核准金额操作：</span>
              
              <div class="flex items-center gap-2">
                <span class="text-slate-500">实批核定金额:</span>
                <el-input-number 
                  v-model="auditForms[deliv.id].approvedAmount" 
                  :min="0" 
                  :max="deliv.applyAmount" 
                  :step="100" 
                  size="default" 
                  @change="onAmountChange(deliv.id, deliv.applyAmount)" 
                />
                <span class="text-slate-400 text-xs">元</span>
              </div>

              <!-- Deduction Badge & Reason Input -->
              <div v-if="auditForms[deliv.id].deductionAmount > 0" class="flex flex-wrap items-center gap-2 bg-red-50 p-2 rounded-lg border border-red-200">
                <span class="text-red-600 font-bold">核减违约金:</span>
                <strong class="font-mono text-red-600 text-sm">¥{{ auditForms[deliv.id].deductionAmount }}</strong>
                <el-input 
                  v-model="auditForms[deliv.id].deductionReason" 
                  placeholder="必填扣款原因(如施工超时2天)" 
                  size="small" 
                  class="w-56" 
                />
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex items-center gap-2 w-full lg:w-auto justify-end">
              <el-button size="default" type="danger" plain @click="handleAudit(deliv.id, 'REJECTED')">
                验收不合格(驳回整改)
              </el-button>
              <el-button size="default" type="success" @click="handleAudit(deliv.id, 'APPROVED')" class="shadow-sm shadow-emerald-500/20">
                <el-icon class="mr-1"><Check /></el-icon> 验收合格(通过并锁入报销池)
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- History Audit List Card -->
    <div class="card-modern p-5 space-y-4">
      <div class="flex justify-between items-center pb-3 border-b border-slate-100">
        <div>
          <h3 class="text-sm font-bold text-slate-900">近期完工批次审核历史档案</h3>
          <p class="text-[11px] text-slate-400">已核准的完工批次净额直接锁入服务商报销池</p>
        </div>
        <span class="text-xs text-slate-500">累计已核准: {{ approvedDeliverables.length }} 笔</span>
      </div>

      <!-- Desktop Table -->
      <div class="hidden md:block overflow-hidden">
        <el-table :data="approvedDeliverables" stripe style="width: 100%">
          <el-table-column prop="orderNo" label="工单单号" width="160">
            <template #default="{ row }">
              <span class="font-mono font-medium text-brand-600">{{ row.orderNo }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="projectTitle" label="批次概述" min-width="220" />
          <el-table-column label="申报 / 实批核定额" width="200">
            <template #default="{ row }">
              <div class="text-xs space-y-0.5">
                <div class="text-slate-500">申报额: ¥{{ row.applyAmount }}</div>
                <div class="text-emerald-700 font-bold font-mono">实批核准: ¥{{ row.approvedAmount }}</div>
                <div v-if="row.deductionAmount > 0" class="text-red-500 text-[11px] font-semibold">
                  (核减: ¥{{ row.deductionAmount }} - {{ row.deductionReason }})
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="报销状态" width="140">
            <template #default="{ row }">
              <span 
                class="px-2.5 py-0.5 rounded-full text-xs font-semibold"
                :class="row.settleStatus === 'SETTLED' ? 'bg-emerald-100 text-emerald-800' : row.settleStatus === 'SETTLING' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-700'"
              >
                {{ row.settleStatus === 'SETTLED' ? '✓ 已打款结清' : row.settleStatus === 'SETTLING' ? '⏳ 外部报销中' : '待服务商报销' }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="auditTime" label="审核通过时间" width="160" />
        </el-table>
      </div>

      <!-- Mobile Cards for History -->
      <div class="block md:hidden space-y-3">
        <div 
          v-for="row in approvedDeliverables" 
          :key="row.id" 
          class="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 text-xs"
        >
          <div class="flex justify-between items-start">
            <div>
              <span class="font-mono text-brand-600 font-bold">{{ row.orderNo }}</span>
              <div class="font-semibold text-slate-800 mt-0.5">{{ row.projectTitle }}</div>
            </div>
            <span 
              class="px-2 py-0.5 rounded text-[10px] font-bold"
              :class="row.settleStatus === 'SETTLED' ? 'bg-emerald-100 text-emerald-800' : row.settleStatus === 'SETTLING' ? 'bg-blue-100 text-blue-800' : 'bg-slate-200 text-slate-700'"
            >
              {{ row.settleStatus === 'SETTLED' ? '已结清' : row.settleStatus === 'SETTLING' ? '报销中' : '待报销' }}
            </span>
          </div>

          <div class="flex justify-between items-center pt-1 border-t border-slate-200/80">
            <div>
              <span class="text-slate-400">申报: ¥{{ row.applyAmount }}</span>
              <span class="ml-2 font-bold text-emerald-700 font-mono">实批: ¥{{ row.approvedAmount }}</span>
            </div>
            <span class="text-[11px] text-slate-400">{{ row.auditTime }}</span>
          </div>

          <div v-if="row.deductionAmount > 0" class="text-[11px] text-red-600 bg-red-50 p-1 rounded">
            扣减: ¥{{ row.deductionAmount }} ({{ row.deductionReason }})
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue'
import { useScmpStore } from '@/store/scmpStore'
import { ElMessage, ElMessageBox } from 'element-plus'

const store = useScmpStore()

const pendingDeliverables = computed(() => 
  store.deliverables.filter(d => d.auditStatus === 'PENDING')
)

const approvedDeliverables = computed(() => 
  store.deliverables.filter(d => d.auditStatus === 'APPROVED')
)

// Audit forms map per deliverable
const auditForms = reactive<Record<number, { approvedAmount: number; deductionAmount: number; deductionReason: string }>>({})

pendingDeliverables.value.forEach(d => {
  if (!auditForms[d.id]) {
    auditForms[d.id] = {
      approvedAmount: d.applyAmount,
      deductionAmount: 0,
      deductionReason: ''
    }
  }
})

function getWorkOrder(orderId: number) {
  return store.workOrders.find(o => o.id === orderId)
}

function onAmountChange(delivId: number, applyAmount: number) {
  const form = auditForms[delivId]
  form.deductionAmount = Math.max(0, applyAmount - form.approvedAmount)
  if (form.deductionAmount === 0) {
    form.deductionReason = ''
  } else if (!form.deductionReason) {
    form.deductionReason = '工期超时或质量瑕疵核减'
  }
}

function handleAudit(delivId: number, action: 'APPROVED' | 'REJECTED') {
  const form = auditForms[delivId] || { approvedAmount: 0, deductionAmount: 0, deductionReason: '' }

  if (action === 'APPROVED') {
    if (form.deductionAmount > 0 && !form.deductionReason.trim()) {
      ElMessage.warning('存在扣款金额时，必须填写扣款原因说明！')
      return
    }

    ElMessageBox.confirm(
      `确认审核通过该批次完工？实批核定金额为 ¥${form.approvedAmount} 元${form.deductionAmount > 0 ? ` (已核减扣款 ¥${form.deductionAmount})` : ''}。根据终审锁定规则(B1)，此金额将直接锁定进入服务商待报销池。`,
      '完工审核终审确认',
      { type: 'warning' }
    ).then(() => {
      store.auditDeliverable(
        delivId, 
        'APPROVED', 
        form.approvedAmount, 
        form.deductionAmount, 
        form.deductionReason
      )
      ElMessage.success(`完工验收审核通过！实批 ¥${form.approvedAmount} 元已流转至服务商待报销池，已向服务商发送扣款明细通知。`)
    })
  } else {
    store.auditDeliverable(delivId, 'REJECTED')
    ElMessage.error('完工验收已驳回！工单退回工程师整改，前一批未通过前禁止提报下一批。')
  }
}
</script>
