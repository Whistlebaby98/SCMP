<template>
  <div class="space-y-5 pb-10 max-w-4xl mx-auto">
    <!-- Header Banner -->
    <div class="card-modern p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-gradient-to-r from-emerald-950 to-teal-900 text-white">
      <div>
        <div class="flex items-center gap-2">
          <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
            工程师专属
          </span>
          <h1 class="text-lg md:text-xl font-bold text-white">待确认承接任务大厅</h1>
        </div>
        <p class="text-xs text-emerald-200/80 mt-1">
          经内部管理审核通过、指派给您的施工任务；<strong>确认承接即刻开工，拒接将自动解冻释放项目预算并交由 PM 改派</strong>。
        </p>
      </div>

      <div class="flex items-center gap-2">
        <span class="text-xs text-emerald-200">当前操作人员:</span>
        <span class="px-2.5 py-1 rounded-lg bg-emerald-800 text-emerald-100 font-bold text-xs">
          {{ store.currentUser.realName }} (工程师)
        </span>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="myPendingOrders.length === 0" class="card-modern p-12 text-center space-y-3">
      <div class="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl mx-auto">
        ✓
      </div>
      <h3 class="text-base font-bold text-slate-800">当前暂无待承接的指派任务</h3>
      <p class="text-xs text-slate-400 max-w-sm mx-auto">
        您名下的所有指派工单已全部确认承接或完工。您可以在【在途作业与分批完工】页面推进施工进度。
      </p>
      <el-button size="small" type="success" plain @click="$router.push('/vendor/my-work')">
        前往我的在途作业 ➔
      </el-button>
    </div>

    <!-- Task Cards Stream -->
    <div v-else class="space-y-4">
      <div 
        v-for="order in myPendingOrders" 
        :key="order.id" 
        class="card-modern p-5 border-2 border-emerald-300/80 bg-gradient-to-b from-emerald-50/20 to-white space-y-4 shadow-md shadow-emerald-500/5 hover:border-emerald-500 transition-all"
      >
        <!-- Card Top Bar -->
        <div class="flex flex-col sm:flex-row justify-between sm:items-center pb-3 border-b border-emerald-100 gap-3">
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-500 text-white animate-pulse">
                待您确认承接
              </span>
              <span class="font-mono text-xs font-bold text-brand-600">{{ order.orderNo }}</span>
              <span class="text-xs text-slate-400">|</span>
              <span class="text-xs text-slate-500 font-medium">所属项目: {{ order.projectName }}</span>
            </div>
            <h2 class="text-base md:text-lg font-bold text-slate-900">{{ order.title }}</h2>
          </div>

          <div class="text-left sm:text-right bg-emerald-50 sm:bg-transparent p-3 sm:p-0 rounded-xl">
            <div class="text-[11px] text-slate-400">工单包干报酬金额</div>
            <div class="text-2xl md:text-3xl font-black text-emerald-600 font-mono">
              ¥ {{ order.amount.toLocaleString() }}
            </div>
          </div>
        </div>

        <!-- Task Spec Card -->
        <div class="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3 text-xs">
          <div class="font-bold text-slate-800 flex items-center gap-1.5">
            <span>📋</span> 具体活计内容与技术交付要求：
          </div>
          <div class="p-3 rounded-lg bg-white border border-slate-200 text-slate-700 leading-relaxed text-[11px]">
            {{ order.workContent }}
          </div>

          <div class="flex flex-col sm:flex-row justify-between text-slate-500 gap-2 pt-1 border-t border-slate-200/60">
            <div class="flex items-center gap-1">
              <span>要求完工截止时限:</span>
              <strong class="font-mono text-slate-800">{{ order.deadline }}</strong>
            </div>
            <div class="flex items-center gap-1 text-emerald-700 font-semibold">
              <span>🛡️</span> 您的特种证书核验达标 (已由系统合规匹配通过)
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-2">
          <button 
            @click="openRejectModal(order)" 
            class="px-4 py-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold transition-all text-center"
          >
            排期冲突 / 无法履约 (拒绝承接)
          </button>
          
          <button 
            @click="handleAccept(order)" 
            class="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-1.5"
          >
            <span>✓</span> 确认承接去干活
          </button>
        </div>
      </div>
    </div>

    <!-- Reject Confirmation Dialog -->
    <el-dialog v-model="rejectModalVisible" title="拒绝承接工单确认" width="460px">
      <div v-if="selectedOrder" class="space-y-4 text-xs">
        <div class="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 leading-relaxed">
          <strong>业务联动提示：</strong> 您拒绝承接后，该工单占用的项目预算（¥{{ selectedOrder.amount.toLocaleString() }}）将立即解冻返还项目，并通知内部项目经理重新派发。
        </div>

        <div class="p-3.5 bg-slate-50 rounded-xl space-y-1">
          <div>工单名称: <strong class="text-slate-900">{{ selectedOrder.title }}</strong></div>
          <div>工单单号: <span class="font-mono text-brand-600">{{ selectedOrder.orderNo }}</span></div>
        </div>

        <div>
          <label class="block font-bold text-slate-800 mb-1.5">请说明拒绝承接原因 <span class="text-red-500">*</span></label>
          <el-input 
            v-model="rejectReason" 
            placeholder="如：现场近期工期冲突，暂无法调配时间前往..." 
            type="textarea" 
            rows="3" 
          />
        </div>
      </div>

      <template #footer>
        <el-button @click="rejectModalVisible = false">取消</el-button>
        <el-button type="danger" @click="confirmReject">确认拒绝并释放预算</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useScmpStore, type WorkOrder } from '@/store/scmpStore'
import { ElMessage, ElMessageBox } from 'element-plus'

const store = useScmpStore()
const router = useRouter()

const rejectModalVisible = ref(false)
const selectedOrder = ref<WorkOrder | null>(null)
const rejectReason = ref('现场工期冲突')

// Current engineer's pending orders
const myPendingOrders = computed(() => {
  const currentEngId = store.currentUser.id === 5 ? 1 : store.engineers.find(e => e.phone === store.currentUser.phone)?.id || 1
  return store.workOrders.filter(w => w.status === 'PENDING_ACCEPTANCE' && w.engineerId === currentEngId)
})

function handleAccept(order: WorkOrder) {
  ElMessageBox.confirm(
    `确认承接工单【${order.title}】？包干金额为 ¥${order.amount.toLocaleString()} 元。承接后工单将进入【施工履约中】。`,
    '确认接单',
    { type: 'success' }
  ).then(() => {
    store.respondWorkOrder(order.id, 'ACCEPT')
    ElMessage.success('接单成功！工单已进入【施工履约中】，请前往在途作业页面查看并施工！')
    router.push('/vendor/my-work')
  })
}

function openRejectModal(order: WorkOrder) {
  selectedOrder.value = order
  rejectReason.value = '现场工期冲突'
  rejectModalVisible.value = true
}

function confirmReject() {
  if (!selectedOrder.value) return
  store.respondWorkOrder(selectedOrder.value.id, 'REJECT', rejectReason.value)
  ElMessage.warning('已拒绝承接该工单！项目预算已自动解冻释放，已通知内部项目经理重新指派。')
  rejectModalVisible.value = false
}
</script>
