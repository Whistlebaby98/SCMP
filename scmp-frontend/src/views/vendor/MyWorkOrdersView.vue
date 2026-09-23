<template>
  <div class="space-y-5 pb-10 max-w-4xl mx-auto">
    <!-- Header Banner -->
    <div class="card-modern p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-900 text-white">
      <div>
        <div class="flex items-center gap-2">
          <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
            现场工程师端
          </span>
          <h1 class="text-lg md:text-xl font-bold text-white">在途作业与分批完工提报</h1>
        </div>
        <p class="text-xs text-emerald-200/80 mt-1">
          支持长周期工单按施工进度<strong>分批申请完工与对应核准金额</strong>；前一笔审批通过后方可提报下一批。
        </p>
      </div>

      <div class="flex items-center gap-2">
        <span class="text-xs text-emerald-200">当前工程师:</span>
        <span class="px-2.5 py-1 rounded-lg bg-emerald-800 text-emerald-100 font-bold text-xs">
          {{ store.currentUser.realName }}
        </span>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="myExecutingOrders.length === 0" class="card-modern p-12 text-center text-slate-400 space-y-2">
      <div class="text-3xl">🛠️</div>
      <div class="text-sm font-semibold text-slate-700">当前暂无施工执行中的工单</div>
      <div class="text-xs">请前往【待承接任务大厅】查收并承接新任务。</div>
    </div>

    <!-- Active Orders Stream -->
    <div v-else class="space-y-5">
      <div 
        v-for="order in myExecutingOrders" 
        :key="order.id" 
        class="card-modern p-5 border space-y-4 transition-all"
        :class="order.status === 'ALL_COMPLETED' ? 'border-emerald-300 bg-emerald-50/10' : 'border-slate-200 hover:border-slate-300'"
      >
        <!-- Top Bar -->
        <div class="flex flex-col sm:flex-row justify-between sm:items-center pb-3 border-b border-slate-100 gap-3">
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <span 
                class="px-2.5 py-0.5 rounded-full text-xs font-bold"
                :class="order.status === 'ALL_COMPLETED' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'"
              >
                {{ order.status === 'ALL_COMPLETED' ? '✓ 全部完工' : '施工履约执行中' }}
              </span>
              <span class="font-mono text-xs font-bold text-brand-600">{{ order.orderNo }}</span>
              <span class="text-xs text-slate-400">|</span>
              <span class="text-xs text-slate-500 font-medium">项目: {{ order.projectName }}</span>
            </div>
            <h2 class="text-base font-bold text-slate-900">{{ order.title }}</h2>
          </div>

          <div class="text-left sm:text-right bg-slate-50 sm:bg-transparent p-3 sm:p-0 rounded-xl">
            <div class="text-[11px] text-slate-400">工单总金额 / 累计已核准</div>
            <div class="text-lg md:text-xl font-bold font-mono text-slate-900">
              ¥ {{ order.amount.toLocaleString() }} / 
              <span class="text-emerald-600 font-black">¥ {{ order.completedAmount.toLocaleString() }}</span>
            </div>
          </div>
        </div>

        <!-- Progress Bar Summary -->
        <div class="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
          <div class="flex justify-between items-center">
            <span class="text-slate-600 font-medium">当前施工与验收累计进度：</span>
            <strong class="font-mono text-emerald-700 text-sm">
              {{ Number(((order.completedAmount / order.amount) * 100).toFixed(0)) }}%
            </strong>
          </div>
          <el-progress 
            :percentage="Number(((order.completedAmount / order.amount) * 100).toFixed(0))" 
            :status="order.completedAmount >= order.amount ? 'success' : 'primary'"
            :stroke-width="7"
          />
          <div class="flex justify-between text-[11px] text-slate-400 pt-1">
            <span>要求截止时间: {{ order.deadline }}</span>
            <span>剩余待提报额度: <strong class="font-mono text-slate-800">¥{{ (order.amount - order.completedAmount).toLocaleString() }}</strong></span>
          </div>
        </div>

        <!-- History Batches for this Order -->
        <div class="space-y-2 text-xs">
          <div class="font-bold text-slate-800 flex justify-between items-center">
            <span>已提报的分批完工验收记录：</span>
            <span class="text-[11px] text-slate-400">共 {{ getOrderDeliverables(order.id).length }} 批次</span>
          </div>

          <div class="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white overflow-hidden">
            <div 
              v-for="b in getOrderDeliverables(order.id)" 
              :key="b.id" 
              class="p-3.5 flex flex-col sm:flex-row justify-between sm:items-center gap-2"
            >
              <div class="space-y-1">
                <div class="font-semibold text-slate-900 flex items-center gap-2">
                  <span>第 {{ b.batchNo }} 批完工 (累计进度: {{ b.progressPercent }}%)</span>
                  <span class="font-mono font-bold text-slate-700">申报额: ¥{{ b.applyAmount.toLocaleString() }}</span>
                </div>
                <div class="text-[11px] text-slate-400">
                  提报时间: {{ b.createTime }} | 
                  <span v-if="b.auditStatus === 'APPROVED'" class="text-emerald-600 font-bold">
                    ✓ 验收通过: 实批核准 ¥{{ b.approvedAmount }}
                    <span v-if="b.deductionAmount > 0" class="text-red-500 font-semibold ml-1">(扣减违约金 ¥{{ b.deductionAmount }} - {{ b.deductionReason }})</span>
                  </span>
                  <span v-else-if="b.auditStatus === 'PENDING'" class="text-amber-600 font-semibold">
                    ⏳ 内部管理人员验收审核中...
                  </span>
                  <span v-else class="text-red-500 font-semibold">
                    ✕ 验收不合格驳回: {{ b.auditOpinion || '需补充规范施工照片或补签单据' }}
                  </span>
                </div>
              </div>

              <div class="shrink-0 flex items-center gap-2">
                <span 
                  class="px-2.5 py-0.5 rounded-full text-xs font-bold"
                  :class="b.auditStatus === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : b.auditStatus === 'PENDING' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'"
                >
                  {{ b.auditStatus === 'APPROVED' ? '验收通过' : b.auditStatus === 'PENDING' ? '待审核' : '整改中' }}
                </span>
              </div>
            </div>

            <div v-if="getOrderDeliverables(order.id).length === 0" class="p-4 text-center text-slate-400 text-xs">
              现场施工中，尚未提报任何完工批次
            </div>
          </div>
        </div>

        <!-- Action Button with Serial Rule Guard -->
        <div class="flex justify-end gap-3 pt-2 border-t border-slate-100">
          <button 
            @click="openSubmitDeliverableModal(order)"
            :disabled="order.completedAmount >= order.amount || hasPendingDeliverable(order.id)"
            class="px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
            :class="order.completedAmount >= order.amount 
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : hasPendingDeliverable(order.id)
                ? 'bg-amber-50 text-amber-700 border border-amber-200 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20'"
          >
            <span v-if="order.completedAmount >= order.amount">✓ 本工单已全部完工结项</span>
            <span v-else-if="hasPendingDeliverable(order.id)">⏳ 前一笔审核中 (串行拦截规则生效)</span>
            <span v-else>📤 提报分批完工成果与签字单</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Submit Phased Deliverable Modal -->
    <el-dialog v-model="submitModalVisible" title="提报分批完工成果与现场签字单" width="540px">
      <div v-if="currentOrder" class="space-y-4 text-xs">
        <div class="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 leading-relaxed">
          <strong>分批完工规则：</strong> 只有前一笔完工审批通过后，才能提报下一批。现场业主签字单为内部验收通过的核心依据！
        </div>

        <div class="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-xl">
          <div>工单总额: <strong class="font-mono text-slate-900">¥{{ currentOrder.amount }}</strong></div>
          <div>累计已核准: <strong class="font-mono text-emerald-600">¥{{ currentOrder.completedAmount }}</strong></div>
          <div class="col-span-2 text-purple-700 font-bold">
            本期最大可申报完工金额: ¥{{ (currentOrder.amount - currentOrder.completedAmount).toLocaleString() }}
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block font-bold text-slate-800 mb-1.5">本期施工累计进度 (%) <span class="text-red-500">*</span></label>
            <el-input-number v-model="deliverableForm.progressPercent" :min="1" :max="100" class="w-full" size="large" />
          </div>
          <div>
            <label class="block font-bold text-slate-800 mb-1.5">本期申请完工额 (元) <span class="text-red-500">*</span></label>
            <el-input-number 
              v-model="deliverableForm.applyAmount" 
              :min="100" 
              :max="currentOrder.amount - currentOrder.completedAmount" 
              :step="500" 
              class="w-full" 
              size="large"
            />
          </div>
        </div>

        <div>
          <label class="block font-bold text-slate-800 mb-1.5">现场施工作业总结说明 <span class="text-red-500">*</span></label>
          <el-input 
            v-model="deliverableForm.summary" 
            type="textarea" 
            rows="3" 
            placeholder="详细描述本期完成的施工范围、仪器测试情况、现场设备运转状态等..." 
          />
        </div>

        <!-- Customer Sign Sheet Picker -->
        <div class="p-3.5 bg-amber-50/60 border border-amber-200 rounded-xl space-y-2">
          <label class="block font-bold text-amber-900">
            📷 现场业主/客户签字确认单原件 <span class="text-red-500">* (内部验收终审核心)</span>
          </label>
          <div class="flex items-center gap-3">
            <el-image 
              :src="deliverableForm.signSheetUrl" 
              class="w-20 h-20 rounded-xl border-2 border-emerald-500 object-cover shadow-xs" 
            />
            <div class="text-[11px] text-slate-500 space-y-1">
              <div class="font-bold text-emerald-800">customer_sign_sheet_verified.jpg</div>
              <div>已选取现场施工完成拍照单据，内含客户盖章与签字原件</div>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <el-button @click="submitModalVisible = false">取消</el-button>
        <el-button type="primary" :loading="submittingDeliverable" @click="confirmSubmitDeliverable">
          确认提交内部验收
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useScmpStore, type WorkOrder } from '@/store/scmpStore'
import { ElMessage } from 'element-plus'

const store = useScmpStore()

const submitModalVisible = ref(false)
const submittingDeliverable = ref(false)
const currentOrder = ref<WorkOrder | null>(null)

const deliverableForm = reactive({
  progressPercent: 60,
  applyAmount: 3000,
  summary: '本期已完成现场水平桥架配管与光纤熔接打标，现场全部通电测试正常，客户已在验收单上签字。',
  signSheetUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400',
  attachmentUrls: ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400']
})

const myExecutingOrders = computed(() => {
  const currentEngId = store.currentUser.id === 5 ? 1 : store.engineers.find(e => e.phone === store.currentUser.phone)?.id || 1
  return store.workOrders.filter(w => (w.status === 'IN_PROGRESS' || w.status === 'ALL_COMPLETED') && w.engineerId === currentEngId)
})

function getOrderDeliverables(orderId: number) {
  return store.deliverables.filter(d => d.workOrderId === orderId)
}

function hasPendingDeliverable(orderId: number) {
  return store.deliverables.some(d => d.workOrderId === orderId && d.auditStatus === 'PENDING')
}

function openSubmitDeliverableModal(order: WorkOrder) {
  if (hasPendingDeliverable(order.id)) {
    ElMessage.warning('前一笔完工申请正在内部审核中，需等待审核通过方可提报下一批！')
    return
  }

  currentOrder.value = order
  const remaining = order.amount - order.completedAmount
  deliverableForm.applyAmount = Math.min(3000, remaining)
  deliverableForm.progressPercent = Math.min(100, Number(((order.completedAmount + deliverableForm.applyAmount) / order.amount * 100).toFixed(0)))
  submitModalVisible.value = true
}

function confirmSubmitDeliverable() {
  if (!currentOrder.value) return
  if (!deliverableForm.summary || !deliverableForm.applyAmount) {
    ElMessage.warning('请填写完整的总结说明与申请金额！')
    return
  }

  try {
    submittingDeliverable.value = true
    store.submitPhasedDeliverable({
      workOrderId: currentOrder.value.id,
      progressPercent: deliverableForm.progressPercent,
      applyAmount: deliverableForm.applyAmount,
      summary: deliverableForm.summary,
      signSheetUrl: deliverableForm.signSheetUrl,
      attachmentUrls: deliverableForm.attachmentUrls
    })
    ElMessage.success('完工申请提交成功！状态置为【待内部验收审核】，请等待审核管理人员核验通过！')
    submitModalVisible.value = false
  } catch (err: any) {
    ElMessage.error(err.message || '提交失败')
  } finally {
    submittingDeliverable.value = false
  }
}
</script>
