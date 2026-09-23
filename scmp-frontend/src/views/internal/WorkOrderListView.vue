<template>
  <div class="space-y-5 pb-10">
    <!-- Header Banner -->
    <div class="card-modern p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-gradient-to-r from-white via-slate-50 to-indigo-50/20">
      <div>
        <div class="flex items-center gap-2">
          <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-100 text-brand-700">
            工单中枢
          </span>
          <h1 class="text-lg md:text-xl font-bold text-slate-900">工单综合全景看板</h1>
        </div>
        <p class="text-xs text-slate-500 mt-1">
          全链路跟踪派单审核、工程师接单、现场施工、在途调价与分批完工验收进度。
        </p>
      </div>

      <div class="flex items-center gap-3">
        <el-button type="primary" size="default" @click="$router.push('/internal/dispatch/create')" class="shadow-sm shadow-brand-500/20">
          <el-icon class="mr-1"><Plus /></el-icon> 新增派单
        </el-button>
      </div>
    </div>

    <!-- Quick Stat Chips -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div 
        @click="filterStatus = 'ALL'"
        class="card-modern p-3.5 cursor-pointer border"
        :class="filterStatus === 'ALL' ? 'border-brand-500 bg-brand-50/40 ring-1 ring-brand-500' : 'hover:border-slate-300'"
      >
        <div class="text-[11px] text-slate-500 font-medium">全部工单池</div>
        <div class="text-xl font-extrabold text-slate-900 mt-0.5">{{ store.workOrders.length }} <span class="text-xs font-normal text-slate-400">单</span></div>
      </div>

      <div 
        @click="filterStatus = 'PENDING_DISPATCH_AUDIT'"
        class="card-modern p-3.5 cursor-pointer border"
        :class="filterStatus === 'PENDING_DISPATCH_AUDIT' ? 'border-amber-500 bg-amber-50/40 ring-1 ring-amber-500' : 'hover:border-slate-300'"
      >
        <div class="text-[11px] text-amber-700 font-medium flex items-center justify-between">
          <span>待派单审核</span>
          <span v-if="countPendingDispatch > 0" class="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
        </div>
        <div class="text-xl font-extrabold text-amber-600 mt-0.5">{{ countPendingDispatch }} <span class="text-xs font-normal text-slate-400">单</span></div>
      </div>

      <div 
        @click="filterStatus = 'IN_PROGRESS'"
        class="card-modern p-3.5 cursor-pointer border"
        :class="filterStatus === 'IN_PROGRESS' ? 'border-blue-500 bg-blue-50/40 ring-1 ring-blue-500' : 'hover:border-slate-300'"
      >
        <div class="text-[11px] text-blue-700 font-medium">施工履约执行中</div>
        <div class="text-xl font-extrabold text-blue-600 mt-0.5">{{ countInProgress }} <span class="text-xs font-normal text-slate-400">单</span></div>
      </div>

      <div 
        @click="filterStatus = 'ALL_COMPLETED'"
        class="card-modern p-3.5 cursor-pointer border"
        :class="filterStatus === 'ALL_COMPLETED' ? 'border-emerald-500 bg-emerald-50/40 ring-1 ring-emerald-500' : 'hover:border-slate-300'"
      >
        <div class="text-[11px] text-emerald-700 font-medium">已全部完工</div>
        <div class="text-xl font-extrabold text-emerald-600 mt-0.5">{{ countCompleted }} <span class="text-xs font-normal text-slate-400">单</span></div>
      </div>
    </div>

    <!-- Filter Bar -->
    <div class="card-modern p-4">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <!-- Status Tabs -->
        <div class="flex flex-wrap gap-1.5">
          <button
            v-for="tab in filterTabs"
            :key="tab.value"
            @click="filterStatus = tab.value"
            class="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            :class="filterStatus === tab.value 
              ? 'bg-slate-900 text-white font-semibold shadow-xs' 
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
          >
            {{ tab.label }}
          </button>
        </div>

        <!-- Search Input -->
        <div class="w-full sm:w-64">
          <el-input 
            v-model="searchQuery" 
            placeholder="搜索单号 / 标题 / 工程师..." 
            size="small" 
            clearable
            prefix-icon="Search"
          />
        </div>
      </div>
    </div>

    <!-- 1. Desktop Table View (Hidden on mobile) -->
    <div class="hidden md:block card-modern overflow-hidden">
      <el-table :data="filteredOrders" stripe style="width: 100%">
        <el-table-column prop="orderNo" label="工单编号" width="160">
          <template #default="{ row }">
            <span class="font-mono font-semibold text-brand-600 hover:text-brand-800 cursor-pointer" @click="viewDetail(row)">
              {{ row.orderNo }}
            </span>
          </template>
        </el-table-column>

        <el-table-column label="工单活计与项目" min-width="240">
          <template #default="{ row }">
            <div class="font-medium text-slate-800 hover:text-brand-600 cursor-pointer" @click="viewDetail(row)">
              {{ row.title }}
            </div>
            <div class="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
              <span class="px-1.5 py-0.2 bg-slate-100 rounded text-[10px]">项目</span>
              <span>{{ row.projectName }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="服务商 / 工程师" width="180">
          <template #default="{ row }">
            <div class="text-xs">
              <div class="font-medium text-slate-700 truncate">{{ row.vendorName }}</div>
              <div class="text-slate-400 mt-0.5 flex items-center gap-1">
                <span>工程师:</span>
                <span class="font-bold text-emerald-700">{{ row.engineerName }}</span>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="合同额 / 已核准完工" width="170">
          <template #default="{ row }">
            <div class="text-xs space-y-1">
              <div>合同额: <strong class="font-mono text-slate-900 font-bold">¥{{ row.amount.toLocaleString() }}</strong></div>
              <div class="text-emerald-600 font-medium">已核准: ¥{{ row.completedAmount.toLocaleString() }}</div>
              <el-progress 
                :percentage="Number(((row.completedAmount / row.amount) * 100).toFixed(0))" 
                :show-text="false" 
                :stroke-width="4"
              />
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="status" label="工单状态" width="130">
          <template #default="{ row }">
            <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold" :class="getStatusBadgeClass(row.status)">
              {{ getStatusName(row.status) }}
            </span>
          </template>
        </el-table-column>

        <el-table-column label="工期截止" width="140">
          <template #default="{ row }">
            <span class="text-xs text-slate-500 font-mono">{{ row.deadline }}</span>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <!-- If PENDING_DISPATCH_AUDIT -->
            <template v-if="row.status === 'PENDING_DISPATCH_AUDIT'">
              <el-button size="small" type="success" link @click="auditDispatch(row.id, 'APPROVE')">审核通过</el-button>
              <el-button size="small" type="danger" link @click="auditDispatch(row.id, 'REJECT')">驳回</el-button>
              <el-button size="small" type="info" link @click="withdraw(row.id)">撤回</el-button>
            </template>

            <!-- If PENDING_ACCEPTANCE -->
            <template v-else-if="row.status === 'PENDING_ACCEPTANCE'">
              <el-button size="small" type="warning" link @click="withdraw(row.id)">主动撤回改派</el-button>
            </template>

            <!-- If IN_PROGRESS -->
            <template v-else-if="row.status === 'IN_PROGRESS'">
              <el-button size="small" type="primary" link @click="openModifyAmountModal(row)">在途调价</el-button>
              <el-button size="small" type="warning" link @click="$router.push('/internal/completion-audit')">去验收</el-button>
            </template>

            <!-- If REJECTED_BY_VENDOR -->
            <template v-else-if="row.status === 'REJECTED_BY_VENDOR'">
              <el-button size="small" type="primary" link @click="reDispatch(row)">重新改派</el-button>
            </template>

            <el-button size="small" link @click="viewDetail(row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 2. Mobile Responsive Card List (Shown only on mobile) -->
    <div class="block md:hidden space-y-3">
      <div 
        v-for="row in filteredOrders" 
        :key="row.id" 
        class="card-modern p-4 space-y-3"
      >
        <!-- Card Top -->
        <div class="flex justify-between items-start">
          <div class="space-y-0.5">
            <span class="font-mono text-xs font-bold text-brand-600">{{ row.orderNo }}</span>
            <h3 class="font-bold text-sm text-slate-900 leading-snug">{{ row.title }}</h3>
          </div>
          <span class="shrink-0 px-2 py-0.5 rounded-full text-[11px] font-semibold" :class="getStatusBadgeClass(row.status)">
            {{ getStatusName(row.status) }}
          </span>
        </div>

        <!-- Project & Engineer Meta -->
        <div class="text-xs text-slate-500 space-y-1 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
          <div class="flex justify-between">
            <span>所属项目:</span>
            <span class="text-slate-700 font-medium truncate max-w-[180px]">{{ row.projectName }}</span>
          </div>
          <div class="flex justify-between">
            <span>服务商:</span>
            <span class="text-slate-700 truncate max-w-[180px]">{{ row.vendorName }}</span>
          </div>
          <div class="flex justify-between">
            <span>工程师:</span>
            <strong class="text-emerald-700">{{ row.engineerName }}</strong>
          </div>
          <div class="flex justify-between">
            <span>工期时限:</span>
            <span class="font-mono text-slate-600">{{ row.deadline }}</span>
          </div>
        </div>

        <!-- Price & Progress Bar -->
        <div class="flex justify-between items-center text-xs pt-1">
          <div>
            <span class="text-slate-400">合同额: </span>
            <strong class="font-mono text-base text-slate-900 font-bold">¥{{ row.amount.toLocaleString() }}</strong>
          </div>
          <div class="text-right">
            <span class="text-slate-400">已核准完工: </span>
            <strong class="font-mono text-emerald-600 font-bold">¥{{ row.completedAmount.toLocaleString() }}</strong>
          </div>
        </div>
        <el-progress 
          :percentage="Number(((row.completedAmount / row.amount) * 100).toFixed(0))" 
          :show-text="false" 
          :stroke-width="5"
        />

        <!-- Mobile Action Buttons -->
        <div class="flex flex-wrap gap-2 pt-2 border-t border-slate-100 justify-end">
          <template v-if="row.status === 'PENDING_DISPATCH_AUDIT'">
            <button 
              @click="auditDispatch(row.id, 'APPROVE')" 
              class="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold shadow-xs"
            >
              审核通过
            </button>
            <button 
              @click="auditDispatch(row.id, 'REJECT')" 
              class="px-3 py-1.5 rounded-lg bg-red-100 text-red-700 text-xs font-semibold"
            >
              驳回
            </button>
          </template>

          <template v-else-if="row.status === 'IN_PROGRESS'">
            <button 
              @click="openModifyAmountModal(row)" 
              class="px-3 py-1.5 rounded-lg bg-brand-50 text-brand-700 border border-brand-200 text-xs font-semibold"
            >
              在途调价
            </button>
            <button 
              @click="$router.push('/internal/completion-audit')" 
              class="px-3 py-1.5 rounded-lg bg-amber-500 text-white text-xs font-semibold"
            >
              完工验收
            </button>
          </template>

          <template v-else-if="row.status === 'REJECTED_BY_VENDOR'">
            <button 
              @click="reDispatch(row)" 
              class="px-3 py-1.5 rounded-lg bg-brand-600 text-white text-xs font-semibold"
            >
              重新改派
            </button>
          </template>

          <button 
            @click="viewDetail(row)" 
            class="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium"
          >
            详情档案
          </button>
        </div>
      </div>

      <div v-if="filteredOrders.length === 0" class="card-modern p-12 text-center text-slate-400 text-xs">
        未找到符合筛选条件的工单
      </div>
    </div>

    <!-- Detail Drawer -->
    <el-drawer v-model="drawerVisible" title="工单全景生命周期档案" size="520px">
      <div v-if="selectedOrder" class="space-y-5 text-xs pb-10">
        <!-- Drawer Header Card -->
        <div class="p-4 rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 text-white space-y-2">
          <div class="flex justify-between items-center">
            <span class="font-mono text-sm font-bold text-brand-300">{{ selectedOrder.orderNo }}</span>
            <span class="px-2 py-0.5 rounded text-[10px] font-bold" :class="getStatusBadgeClass(selectedOrder.status)">
              {{ getStatusName(selectedOrder.status) }}
            </span>
          </div>
          <h2 class="text-base font-bold text-white">{{ selectedOrder.title }}</h2>
          <div class="text-[11px] text-slate-300">所属项目: {{ selectedOrder.projectName }}</div>
        </div>

        <!-- Meta Grid -->
        <div class="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-700">
          <div>派单包干金额: <strong class="font-mono text-emerald-600 text-sm">¥{{ selectedOrder.amount.toLocaleString() }}</strong></div>
          <div>累计已核准: <strong class="font-mono text-brand-600 text-sm">¥{{ selectedOrder.completedAmount.toLocaleString() }}</strong></div>
          <div>承接服务商: <strong>{{ selectedOrder.vendorName }}</strong></div>
          <div>实施工程师: <strong class="text-emerald-700">{{ selectedOrder.engineerName }}</strong></div>
          <div>派单发起人: <span>{{ selectedOrder.createByName }}</span></div>
          <div>完工截止时限: <span class="font-mono">{{ selectedOrder.deadline }}</span></div>
        </div>

        <!-- Requirements -->
        <div class="space-y-1.5">
          <div class="font-bold text-slate-800">活计内容与技术要求：</div>
          <div class="p-3.5 bg-white rounded-xl border border-slate-200 text-slate-600 leading-relaxed">
            {{ selectedOrder.workContent }}
          </div>
        </div>

        <!-- Rejection Reason if any -->
        <div v-if="selectedOrder.rejectReason" class="p-3.5 bg-red-50 text-red-800 rounded-xl border border-red-200 space-y-1">
          <div class="font-bold">工程师拒绝承接原因：</div>
          <div>{{ selectedOrder.rejectReason }}</div>
        </div>

        <!-- Credentials Snapshot -->
        <div class="space-y-1.5">
          <div class="font-bold text-slate-800 flex items-center gap-1">
            <span>🛡️</span> 派单时点资质证书快照 (永久留痕核验)：
          </div>
          <div class="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200 text-emerald-900 space-y-1">
            <div v-if="Array.isArray(selectedOrder.certSnapshot)">
              <div v-for="(c, i) in selectedOrder.certSnapshot" :key="i" class="flex justify-between items-center text-xs">
                <span>✓ {{ c.certName }} ({{ c.certNo }})</span>
                <span class="font-mono text-[11px] text-emerald-700">有效至: {{ c.expireDate }}</span>
              </div>
            </div>
            <div v-else class="text-xs">
              ✓ {{ selectedOrder.certSnapshot?.certName }} (有效期至: {{ selectedOrder.certSnapshot?.expireDate }})
            </div>
          </div>
        </div>

        <!-- Linked Phased Deliverables -->
        <div class="space-y-2">
          <div class="font-bold text-slate-800 flex justify-between items-center">
            <span>关联的分批完工验收记录：</span>
            <span class="text-slate-400 font-normal">共 {{ linkedDeliverables.length }} 批次</span>
          </div>

          <div v-if="linkedDeliverables.length === 0" class="p-6 text-center text-slate-400 bg-slate-50 rounded-xl border">
            尚未提报完工验收
          </div>

          <div v-else class="space-y-2">
            <div 
              v-for="d in linkedDeliverables" 
              :key="d.id" 
              class="p-3 bg-white rounded-xl border border-slate-200 space-y-2"
            >
              <div class="flex justify-between items-center">
                <span class="font-bold text-slate-800">第 {{ d.batchNo }} 批 (进度: {{ d.progressPercent }}%)</span>
                <span 
                  class="px-2 py-0.5 rounded text-[10px] font-bold"
                  :class="d.auditStatus === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : d.auditStatus === 'PENDING' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'"
                >
                  {{ d.auditStatus === 'APPROVED' ? '验收通过' : d.auditStatus === 'PENDING' ? '待审核' : '整改驳回' }}
                </span>
              </div>
              <div class="text-[11px] text-slate-500 flex justify-between">
                <span>提报申请额: ¥{{ d.applyAmount }}</span>
                <span class="text-emerald-700 font-bold">实批核准: ¥{{ d.approvedAmount || '-' }}</span>
              </div>
              <div v-if="d.deductionAmount > 0" class="text-[11px] text-red-600 bg-red-50 p-1.5 rounded">
                扣减违约金: ¥{{ d.deductionAmount }} (理由: {{ d.deductionReason }})
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-drawer>

    <!-- In-flight Amount Modification Dialog -->
    <el-dialog v-model="modifyAmountVisible" title="在途工单金额调整 (变动通知联动)" width="460px">
      <div v-if="selectedOrder" class="space-y-4 text-xs">
        <div class="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 leading-relaxed">
          <strong>业务硬约束：</strong> 调增受所属项目可用预算严格限制。金额变动后，系统将自动向服务商接口人及实施工程师推送变动通知。
        </div>

        <div class="p-3 bg-slate-50 rounded-xl space-y-1.5">
          <div class="text-slate-500">工单名称: <strong class="text-slate-800">{{ selectedOrder.title }}</strong></div>
          <div class="text-slate-500">原派单金额: <strong class="font-mono text-slate-900 text-sm">¥{{ selectedOrder.amount.toLocaleString() }}</strong></div>
        </div>

        <div>
          <label class="block font-bold text-slate-800 mb-1.5">调整后工单新总金额 (元) <span class="text-red-500">*</span></label>
          <el-input-number v-model="newAmount" :min="100" :step="500" class="w-full" size="large" />
        </div>

        <div>
          <label class="block font-bold text-slate-800 mb-1.5">调价原因与核定说明 <span class="text-red-500">*</span></label>
          <el-input v-model="modifyReason" placeholder="如：现场临时追加机柜跳线工程量..." type="textarea" rows="2" />
        </div>
      </div>
      <template #footer>
        <el-button @click="modifyAmountVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmModifyAmount">确认调整并通知服务商</el-button>
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

const filterStatus = ref('ALL')
const searchQuery = ref('')
const drawerVisible = ref(false)
const selectedOrder = ref<WorkOrder | null>(null)

const modifyAmountVisible = ref(false)
const newAmount = ref(0)
const modifyReason = ref('')

const filterTabs = [
  { label: '全部', value: 'ALL' },
  { label: '待派单审核', value: 'PENDING_DISPATCH_AUDIT' },
  { label: '待承接', value: 'PENDING_ACCEPTANCE' },
  { label: '施工履约中', value: 'IN_PROGRESS' },
  { label: '全部完工', value: 'ALL_COMPLETED' },
  { label: '已拒接', value: 'REJECTED_BY_VENDOR' }
]

const countPendingDispatch = computed(() => store.workOrders.filter(w => w.status === 'PENDING_DISPATCH_AUDIT').length)
const countInProgress = computed(() => store.workOrders.filter(w => w.status === 'IN_PROGRESS').length)
const countCompleted = computed(() => store.workOrders.filter(w => w.status === 'ALL_COMPLETED').length)

const filteredOrders = computed(() => {
  let list = store.workOrders
  if (filterStatus.value !== 'ALL') {
    list = list.filter(w => w.status === filterStatus.value)
  }
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase()
    list = list.filter(w => 
      w.orderNo.toLowerCase().includes(q) ||
      w.title.toLowerCase().includes(q) ||
      w.engineerName.toLowerCase().includes(q) ||
      w.projectName.toLowerCase().includes(q)
    )
  }
  return list
})

const linkedDeliverables = computed(() => {
  if (!selectedOrder.value) return []
  return store.deliverables.filter(d => d.workOrderId === selectedOrder.value!.id)
})

function getStatusBadgeClass(status: string) {
  switch (status) {
    case 'PENDING_DISPATCH_AUDIT': return 'bg-amber-100 text-amber-800'
    case 'PENDING_ACCEPTANCE': return 'bg-blue-100 text-blue-800'
    case 'IN_PROGRESS': return 'bg-indigo-100 text-indigo-800'
    case 'ALL_COMPLETED': return 'bg-emerald-100 text-emerald-800'
    case 'REJECTED_BY_VENDOR': return 'bg-red-100 text-red-800'
    default: return 'bg-slate-100 text-slate-700'
  }
}

function getStatusName(status: string) {
  switch (status) {
    case 'DRAFT': return '草稿'
    case 'PENDING_DISPATCH_AUDIT': return '待派单审核'
    case 'DISPATCH_REJECTED': return '派单驳回'
    case 'PENDING_ACCEPTANCE': return '待工程师承接'
    case 'IN_PROGRESS': return '施工履约中'
    case 'ALL_COMPLETED': return '已全部完工'
    case 'REJECTED_BY_VENDOR': return '已拒接'
    default: return status
  }
}

function viewDetail(order: WorkOrder) {
  selectedOrder.value = order
  drawerVisible.value = true
}

function auditDispatch(orderId: number, action: 'APPROVE' | 'REJECT') {
  store.auditDispatch(orderId, action)
  ElMessage.success(action === 'APPROVE' ? '派单已通过，已推送待承接消息给工程师！' : '派单已驳回，预算已释放回项目！')
}

function withdraw(orderId: number) {
  ElMessageBox.confirm('确认撤回该派单吗？撤回后冻结的项目预算将自动返还项目。', '撤回派单确认', {
    type: 'warning'
  }).then(() => {
    store.withdrawDispatch(orderId)
    ElMessage.success('工单已成功撤回至草稿箱，项目预算已自动解冻释放！')
  })
}

function openModifyAmountModal(order: WorkOrder) {
  selectedOrder.value = order
  newAmount.value = order.amount
  modifyReason.value = '工程量现场变动调整'
  modifyAmountVisible.value = true
}

function confirmModifyAmount() {
  if (!selectedOrder.value) return
  try {
    store.modifyWorkOrderAmount(selectedOrder.value.id, newAmount.value, modifyReason.value)
    ElMessage.success(`工单金额已更新为 ¥${newAmount.value}！已向服务商接口人与工程师发送变动通知。`)
    modifyAmountVisible.value = false
  } catch (err: any) {
    ElMessage.error(err.message || '调价失败')
  }
}

function reDispatch(order: WorkOrder) {
  router.push({
    path: '/internal/dispatch/create',
    query: { projectId: String(order.projectId) }
  })
}
</script>
